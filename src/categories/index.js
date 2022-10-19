/**
 * WordPress dependencies
 */
import { category as icon } from '@wordpress/icons';

/**
 * Internal dependencies
 */
import metadata from './block.json';
import edit from './edit';
import { registerBlockType } from '@wordpress/blocks';

registerBlockType( metadata.name, {
	icon,
	example: {},
	edit
} );
