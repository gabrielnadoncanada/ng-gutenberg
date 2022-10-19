<?php
/**
 * Plugin Name:       Ng Gutenberg
 * Description:       Example block scaffolded with Create Block tool.
 * Requires at least: 5.9
 * Requires PHP:      7.0
 * Version:           0.1.0
 * Author:            The WordPress Contributors
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       ng-gutenberg
 *
 * @package           create-block
 */

class Ng_Gutenberg
{

    public function __construct()
    {
        $this->define_constants();

        add_action('init', [$this, 'blocks_init']);
        add_action('enqueue_block_assets', [$this, 'slider_external_libraries']);
    }

    private function define_constants()
    {
        define('BLOCK_VERSION', '2.0.2');
        define('PLUGIN_URL', plugin_dir_url(__FILE__));
        define('PLUGIN_SRC_URL', PLUGIN_URL . 'src/');
    }

    public static function init()
    {
        static $instance = false;
        if (!$instance) {
            $instance = new self();
        }
        return $instance;
    }

    public function blocks_init()
    {
        $this->register_block('categories', ['render_callback' => [$this, 'render_block_categories']]);
        $this->register_block('slider');
    }

    public function register_block($name, $args = array())
    {
        register_block_type(__DIR__ . '/build/' . $name, $args);
    }

    public function slider_external_libraries()
    {
        if (!is_admin()) {
            wp_enqueue_style('slider-swiper-css', PLUGIN_SRC_URL . 'slider/lib/css/swiper-bundle.css', array(), '8.1.4', 'all');
            wp_enqueue_script('slider-swiper-js', PLUGIN_SRC_URL . 'slider/lib/js/swiper-bundle.js', array(), '8.1.4', true);
            wp_enqueue_script('slider-logo-slider', PLUGIN_SRC_URL . 'slider/inc/js/logo-slider.js', array(), BLOCK_VERSION, true);
        }
    }

    public function render_block_categories($attributes)
    {
        static $block_id = 0;
        $block_id++;

        $args = array(
            'echo' => false,
            'hierarchical' => !empty($attributes['showHierarchy']),
            'orderby' => 'name',
            'show_count' => !empty($attributes['showPostCounts']),
            'title_li' => '',
            'hide_empty' => empty($attributes['showEmpty']),
            'taxonomy' => $attributes['taxonomyCategory'] ?? 'category',
            'show_option_all' => $attributes['showOptionAll'] ? __('Tous') : '',
        );

        if (!empty($attributes['showOnlyTopLevel']) && $attributes['showOnlyTopLevel']) {
            $args['parent'] = 0;
        }

        if (!empty($attributes['displayAsDropdown'])) {
            $id = 'wp-block-categories-' . $block_id;
            $args['id'] = $id;
            $args['show_option_none'] = __('Select Category');
            $wrapper_markup = '<div %1$s><label class="screen-reader-text" for="' . esc_attr($id) . '">' . __('Categories') . '</label>%2$s</div>';
            $items_markup = wp_dropdown_categories($args);
            $type = 'dropdown';

            if (!is_admin()) {
                // Inject the dropdown script immediately after the select dropdown.
                $items_markup = preg_replace(
                    '#(?<=</select>)#',
                    build_dropdown_script_block_core_categories($id),
                    $items_markup,
                    1
                );
            }
        } else {
            $wrapper_markup = '<ul %1$s>%2$s</ul>';
            $items_markup = wp_list_categories($args);
            $type = 'list';
        }

        $wrapper_attributes = get_block_wrapper_attributes(array('class' => "wp-block-categories-{$type}"));

        return sprintf(
            $wrapper_markup,
            $wrapper_attributes,
            $items_markup
        );
    }

    public function build_dropdown_script_block_core_categories($dropdown_id)
    {
        ob_start();
        ?>
        <script type='text/javascript'>
            /* <![CDATA[ */
            (function () {
                var dropdown = document.getElementById('<?php echo esc_js($dropdown_id); ?>');

                function onCatChange() {
                    if (dropdown.options[dropdown.selectedIndex].value > 0) {
                        location.href = "<?php echo esc_url(home_url()); ?>/?cat=" + dropdown.options[dropdown.selectedIndex].value;
                    }
                }

                dropdown.onchange = onCatChange;
            })();
            /* ]]> */
        </script>
        <?php
        return ob_get_clean();
    }
}

Ng_Gutenberg::init();
