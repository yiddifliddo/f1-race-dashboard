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
    $assets_dir = F1DASH_DIR . '/assets';
    $assets_uri = F1DASH_URI . '/assets';

    // Enqueue built CSS
    $css_files = glob($assets_dir . '/css/*.css');
    if ($css_files) {
        foreach ($css_files as $i => $css_file) {
            $filename = basename($css_file);
            wp_enqueue_style(
                'f1dash-style-' . $i,
                $assets_uri . '/css/' . $filename,
                [],
                F1DASH_VERSION
            );
        }
    }

    // Enqueue built JS
    $js_files = glob($assets_dir . '/js/*.js');
    if ($js_files) {
        foreach ($js_files as $i => $js_file) {
            $filename = basename($js_file);
            $is_main = strpos($filename, 'index') !== false;
            wp_enqueue_script(
                'f1dash-script-' . $i,
                $assets_uri . '/js/' . $filename,
                [],
                F1DASH_VERSION,
                true
            );
            if ($is_main) {
                // Add type="module" for the main entry
                add_filter('script_loader_tag', function($tag, $handle) use ($i) {
                    if ($handle === 'f1dash-script-' . $i) {
                        return str_replace(' src', ' type="module" src', $tag);
                    }
                    return $tag;
                }, 10, 2);
            }
        }
    }

    // Pass configuration to JS
    wp_localize_script('f1dash-script-0', 'f1dashConfig', [
        'apiBase' => 'https://api.openf1.org/v1',
        'themeUri' => F1DASH_URI,
        'nonce' => wp_create_nonce('f1dash_nonce'),
    ]);
}
add_action('wp_enqueue_scripts', 'f1dash_enqueue_assets');

/**
 * Theme setup
 */
function f1dash_setup() {
    add_theme_support('title-tag');
    add_theme_support('html5', ['search-form', 'comment-form', 'comment-list', 'gallery', 'caption']);
}
add_action('after_setup_theme', 'f1dash_setup');

/**
 * Add CORS headers for OpenF1 API proxy (optional)
 */
function f1dash_add_cors_headers() {
    header('Access-Control-Allow-Origin: *');
    header('Access-Control-Allow-Methods: GET');
}

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
