/**
 * External dependencies
 */
import {unescape} from 'lodash';
import classnames from 'classnames';
import {useTaxonomiesInfo, usePostTypes} from './utils'

/**
 * WordPress dependencies
 */
import {
    PanelBody,
    Placeholder,
    Spinner,
    ToggleControl,
    VisuallyHidden,
    SelectControl
} from '@wordpress/components';
import {useInstanceId} from '@wordpress/compose';
import {InspectorControls, useBlockProps} from '@wordpress/block-editor';
import {__} from '@wordpress/i18n';
import {pin} from '@wordpress/icons';
import {__experimentalUseEntityRecords} from '@wordpress/core-data';

export default function Edit({attributes, setAttributes, className}) {
    const {
        displayAsDropdown,
        showHierarchy,
        showPostCounts,
        showOnlyTopLevel,
        showEmpty,
        taxonomyCategory,
        showOptionAll,
        postType,
        currentQuery
    } = attributes;

    const {postTypesTaxonomiesMap, postTypesSelectOptions} = usePostTypes();


    let listTaxonomies = useTaxonomiesInfo(postType);

    const selectId = useInstanceId(Edit, 'blocks-category-select');

    const query = {per_page: -1, hide_empty: !showEmpty, context: 'view'};

    if (showOnlyTopLevel) {
        query.parent = 0;
    }

    const {records: categories, isResolving} = __experimentalUseEntityRecords(
        'taxonomy',
        taxonomyCategory,
        query
    );

    const getCategoriesList = (parentId) => {
        if (!categories?.length) {
            return [];
        }
        if (parentId === null) {
            return categories;
        }
        return categories.filter(({parent}) => parent === parentId);
    };

    const toggleAttribute = (attributeName) => (newValue) =>
        setAttributes({[attributeName]: newValue});

    const renderCategoryName = (name) =>
        !name ? __('(Untitled)') : unescape(name).trim();

    const renderCategoryList = () => {
        const parentId = showHierarchy ? 0 : null;
        let categoriesList = getCategoriesList(parentId);
        return categoriesList.map((category) =>
            renderCategoryListItem(category, 0)
        );
    };

    const renderCategoryListItem = (category) => {
        const childCategories = getCategoriesList(category.id);
        const {id, link, count, name} = category;
        return (
            <li key={id} className={`cat-item cat-item-${id}`}>
                <a href={link} target="_blank" rel="noreferrer noopener">
                    {renderCategoryName(name)}
                </a>
                {showPostCounts && ` (${count})`}
                {showHierarchy && !!childCategories.length && (
                    <ul className="children dssadsd">
                        {childCategories.map((childCategory) =>
                            renderCategoryListItem(childCategory)
                        )}
                    </ul>
                )}
            </li>
        );
    };

    const renderCategoryDropdown = () => {
        const parentId = showHierarchy ? 0 : null;
        const categoriesList = getCategoriesList(parentId);
        return (
            <>
                <VisuallyHidden as="label" htmlFor={selectId}>
                    {__('Categories')}
                </VisuallyHidden>
                <select id={selectId}>
                    <option>{__('Select Category')}</option>
                    {categoriesList.map((category) =>
                        renderCategoryDropdownItem(category, 0)
                    )}
                </select>
            </>
        );
    };

    const renderCategoryDropdownItem = (category, level) => {
        const {id, count, name} = category;
        const childCategories = getCategoriesList(id);
        return [
            <option key={id} className={`level-${level}`}>
                {Array.from({length: level * 3}).map(() => '\xa0')}
                {renderCategoryName(name)}
                {showPostCounts && ` (${count})`}
            </option>,
            showHierarchy &&
            !!childCategories.length &&
            childCategories.map((childCategory) =>
                renderCategoryDropdownItem(childCategory, level + 1)
            ),
        ];
    };

    const TagName =
        !!categories?.length && !displayAsDropdown && !isResolving
            ? 'ul'
            : 'div';

    const classes = classnames(className, {
        'wp-block-categories-list':
            !!categories?.length && !displayAsDropdown && !isResolving,
        'wp-block-categories-dropdown':
            !!categories?.length && displayAsDropdown && !isResolving,
    });

    const blockProps = useBlockProps({
        className: classes,
    });

    const onPostTypeChange = ( postType ) => {
        setAttributes({postType});
        const supportedTaxonomies = postTypesTaxonomiesMap[ postType ];
        setAttributes({taxonomyCategory: supportedTaxonomies[0]});
    };

    return (
        <TagName {...blockProps}>
            <InspectorControls>
                <PanelBody title={__('Settings')}>
                    <ToggleControl
                        label={__('Display as dropdown')}
                        checked={displayAsDropdown}
                        onChange={toggleAttribute('displayAsDropdown')}
                    />
                    <ToggleControl
                        label={__('Show post counts')}
                        checked={showPostCounts}
                        onChange={toggleAttribute('showPostCounts')}
                    />
                    <ToggleControl
                        label={__('Show only top level categories')}
                        checked={showOnlyTopLevel}
                        onChange={toggleAttribute('showOnlyTopLevel')}
                    />
                    <ToggleControl
                        label={__('Show empty categories')}
                        checked={showEmpty}
                        onChange={toggleAttribute('showEmpty')}
                    />
                    {!showOnlyTopLevel && (
                        <ToggleControl
                            label={__('Show hierarchy')}
                            checked={showHierarchy}
                            onChange={toggleAttribute('showHierarchy')}
                        />
                    )}
                    <ToggleControl
                        label={__('Inherit from the current Query')}
                        checked={currentQuery}
                        onChange={toggleAttribute('currentQuery')}
                    />
                    <ToggleControl
                        label={__('Show option All')}
                        checked={showOptionAll}
                        onChange={toggleAttribute('showOptionAll')}
                    />
                    <SelectControl
                        options={postTypesSelectOptions}
                        value={postType}
                        onChange={onPostTypeChange}
                        label={__('Post type')}
                        help={__(
                            'WordPress contains different types of content and they are divided into collections called “Post types”. By default there are a few different ones such as blog posts and pages, but plugins could add more.'
                        )}
                    />
                    <SelectControl
                        label={__('Taxonomy')}
                        value={taxonomyCategory}
                        options={listTaxonomies}
                        onChange={(taxonomyCategory) => {
                            setAttributes({taxonomyCategory});
                        }}
                    />
                </PanelBody>
            </InspectorControls>
            {isResolving && (
                <Placeholder icon={pin} label={__('Categories')}>
                    <Spinner/>
                </Placeholder>
            )}
            {!isResolving && categories?.length === 0 && (
                <p>
                    {__(
                        'Your site does not have any posts, so there is nothing to display here at the moment.'
                    )}
                </p>
            )}
            {!isResolving &&
                categories?.length > 0 &&
                (displayAsDropdown
                    ? renderCategoryDropdown()
                    : renderCategoryList())}
        </TagName>
    );
}
