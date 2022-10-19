import {useSelect} from '@wordpress/data';
import {store as coreStore} from '@wordpress/core-data';
import { useMemo } from '@wordpress/element';


const useTaxonomies = ( postType ) => {
    const taxonomies = useSelect(
        ( select ) => {
            const { getTaxonomies } = select( coreStore );
            const filteredTaxonomies = getTaxonomies( {
                type: postType,
                per_page: -1,
                context: 'view',
            } );
            return filteredTaxonomies;
        },
        [ postType ]
    );
    return taxonomies;
};


export const useTaxonomiesInfo = ( postType ) => {
    const taxonomies = useTaxonomies( postType );
    return taxonomies?.map(({slug, name}) => {
        return {
            label: `${name} (${slug})`,
            value: slug
        };
    });
};

export const usePostTypes = () => {
    const postTypes = useSelect( ( select ) => {
        const { getPostTypes } = select( coreStore );
        const excludedPostTypes = [ 'attachment' ];
        const filteredPostTypes = getPostTypes( { per_page: -1 } )?.filter(
            ( { viewable, slug } ) =>
                viewable && ! excludedPostTypes.includes( slug )
        );
        return filteredPostTypes;
    }, [] );
    const postTypesTaxonomiesMap = useMemo( () => {
        if ( ! postTypes?.length ) return;
        return postTypes.reduce( ( accumulator, type ) => {
            accumulator[ type.slug ] = type.taxonomies;
            return accumulator;
        }, {} );
    }, [ postTypes ] );
    const postTypesSelectOptions = useMemo(
        () =>
            ( postTypes || [] ).map( ( { labels, slug } ) => ( {
                label: labels.singular_name,
                value: slug,
            } ) ),
        [ postTypes ]
    );

    return { postTypesTaxonomiesMap, postTypesSelectOptions };
};
