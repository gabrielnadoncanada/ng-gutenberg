<?php
/**
 * Plugin Name:       NgCategoriesExtended
 * Description:       NgCategoriesExtended
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

class NgCategoriesExtended
{

	public function __construct()
	{
		add_action('init', [$this, 'blocks_init']);
	}

	public static function init()
	{
		static $instance = false;
		if (!$instance) {
			$instance = new self();
		}
		return $instance;
	}

	public function blocks_init(): void
	{
		$this->register_block('categories', ['render_callback' => [$this, 'render_block_categories']]);
	}

	public function register_block($name, $args = array()): void
	{
		register_block_type(__DIR__ . '/build/' . $name, $args);
	}

	public function render_block_categories($attributes): string
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
				'taxonomy' => $attributes['currentQuery'] ? $this->getCurrentTaxonomySlug() : $attributes['taxonomyCategory'] ?? 'category',
				'show_option_all' => $attributes['showOptionAll'] ? __('Tout') : '',
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

	public function getCurrentTaxonomySlug()
	{
		$queried_object = get_queried_object();

		$page_for_posts = (int)get_option('page_for_posts');

		if (get_queried_object_id() === $page_for_posts):
			return 'category';
		endif;

		if ($queried_object->taxonomy) :
			return $queried_object->taxonomy;
		endif;

		if ($queried_object->taxonomies):
			return $queried_object->taxonomies[0];
		endif;

		return false;
	}
}

NgCategoriesExtended::init();
