/**
 * WordPress dependencies
 */
import { globe } from '@wordpress/icons';
import { ComboboxControl, Placeholder } from '@wordpress/components';
import { useEffect } from '@wordpress/element';
import { __ } from '@wordpress/i18n';
import apiFetch from '@wordpress/api-fetch';

/**
 * Internal dependencies
 */
import countries from '../assets/countries.json';
import './editor.scss';
import Preview from './preview';
import { getEmojiFlag } from './utils';

export default function Edit( { attributes, setAttributes } ) {
	const { countryCode, relatedPosts } = attributes;
	const options = Object.keys( countries ).map( ( code ) => ( {
		value: code,
		label: getEmojiFlag( code ) + '  ' + countries[ code ] + ' — ' + code,
	} ) );

	const handleChangeCountryCode = ( newCountryCode ) => {
		if ( newCountryCode && countryCode !== newCountryCode ) {
			setAttributes( {
				countryCode: newCountryCode,
				relatedPosts: [],
			} );
		}
	};

	useEffect( () => {
		const getRelatedPosts = async () => {
			const postId = wp.data.select( 'core/editor' ).getCurrentPostId();
			const posts = await apiFetch( {
				path: `/wp/v2/posts?search=${ countries[ countryCode ] }&exclude=${ postId }`,
			} );

			setAttributes( {
				relatedPosts:
					posts?.map( ( relatedPost ) => ( {
						...relatedPost,
						title:
							relatedPost.title?.rendered.replace(
								/(<([^>]+)>)/gi,
								''
							) || relatedPost.link,
						excerpt:
							relatedPost.excerpt?.rendered.replace(
								/(<([^>]+)>)/gi,
								''
							) || '',
					} ) ) || [],
			} );
		};
		getRelatedPosts();
	}, [ countryCode, setAttributes ] );

	return (
		<div className="wp-block-xwp-country-card-container">
			<Placeholder
				icon={ globe }
				label={ __( 'XWP Country Card', 'xwp-country-card' ) }
				isColumnLayout={ true }
				instructions={ __(
					'Type in a name of a country you want to display on you site.',
					'xwp-country-card'
				) }
			>
				<ComboboxControl
					label={ __( 'Country', 'xwp-country-card' ) }
					hideLabelFromVision
					options={ options }
					value={ countryCode }
					onChange={ handleChangeCountryCode }
					allowReset={ true }
				/>
			</Placeholder>
			<Preview
				countryCode={ countryCode }
				relatedPosts={ relatedPosts }
			/>
		</div>
	);
}
