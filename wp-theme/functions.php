<?php
/**
 * F1 Live Dashboard - WordPress Theme Functions
 */

if (!defined('ABSPATH')) exit;

define('F1DASH_VERSION', '1.0.0');
define('F1DASH_DIR', get_template_directory());
define('F1DASH_URI', get_template_directory_uri());

/**
 * Enqueue dashboard assets built by Vite
 */
function f1dash_enqueue_assets() {
    $assets_uri = F1DASH_URI . '/assets';

    // Enqueue CSS
    wp_enqueue_style(
        'f1dash-styles',
        $assets_uri . '/css/index.css',
        [],
        F1DASH_VERSION
    );

    // Enqueue JS - register then add module type
    wp_register_script(
        'f1dash-app',
        $assets_uri . '/js/index.js',
        [],
        F1DASH_VERSION,
        ['in_footer' => true, 'strategy' => 'defer']
    );
    wp_enqueue_script('f1dash-app');
}
add_action('wp_enqueue_scripts', 'f1dash_enqueue_assets');

/**
 * Add type="module" to our script tag
 */
function f1dash_script_type_module($tag, $handle, $src) {
    if ($handle === 'f1dash-app') {
        $tag = '<script type="module" src="' . esc_url($src) . '"></script>' . "\n";
    }
    return $tag;
}
add_filter('script_loader_tag', 'f1dash_script_type_module', 10, 3);

/**
 * Theme setup
 */
function f1dash_setup() {
    add_theme_support('title-tag');
    add_theme_support('html5', ['search-form', 'comment-form', 'comment-list', 'gallery', 'caption']);
}
add_action('after_setup_theme', 'f1dash_setup');

/**
 * Register REST API proxy endpoint for OpenF1
 */
function f1dash_register_api_proxy() {
    register_rest_route('f1dash/v1', '/proxy/(?P<endpoint>.+)', [
        'methods' => 'GET',
        'callback' => 'f1dash_proxy_request',
        'permission_callback' => '__return_true',
    ]);
}
add_action('rest_api_init', 'f1dash_register_api_proxy');

function f1dash_proxy_request($request) {
    $endpoint = $request->get_param('endpoint');
    $params = $request->get_query_params();
    unset($params['endpoint']);

    $url = 'https://api.openf1.org/v1/' . sanitize_text_field($endpoint);
    if (!empty($params)) {
        $url .= '?' . http_build_query($params);
    }

    $response = wp_remote_get($url, [
        'timeout' => 15,
        'headers' => ['Accept' => 'application/json'],
    ]);

    if (is_wp_error($response)) {
        return new WP_REST_Response(['error' => $response->get_error_message()], 500);
    }

    $body = wp_remote_retrieve_body($response);
    $data = json_decode($body, true);

    return new WP_REST_Response($data, 200);
}

/**
 * Disable WordPress admin bar on frontend for cleaner dashboard
 */
add_filter('show_admin_bar', '__return_false');
