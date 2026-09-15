/**
 * Configuration settings for the DPLA module
 */
'use strict';

module.exports = {
	/*
	 * Number of collections to fetch, -1 for all collections 
	 */
	maxCollections: -1,

	/*
	 * Index fields to display in the data for each bject
	 */
	itemMetadataFields: {
        "default": {
            "title": {
	            "path": "display_record.title",
	            "display": "text"
	        },
	        "dateCreated": {
	            "path": "display_record.dates.expression",
	            "matchField": "label",
	            "matchValue": "creation"
	        },
	        "rights": {
                "path": "display_record.notes.content",
                "matchField": "type",
                "matchValue": "userestrict",
                "display": "text",
                "default": "Copyright not evaluated: The copyright and related rights status of this Item has not been evaluated. Please refer to the organization that has made the Item available for more information. You are free to use this Item in any way that is permitted by the copyright and related rights legislation that applies to your use. See: https://rightsstatements.org/page/CNE/1.0/?language=en"
            },
	        "description": {
	            "path": "display_record.notes.content",
	            "matchField": "type",
	            "matchValue": "abstract",
	            "display": "text"
	        },
	        "place": {
                "path": "display_record.subjects.terms.term",
                "matchField": "type",
                "matchValue": "geographic"
            },
            "subject": {
                "path": "display_record.subjects.title",
                "excludeField": "terms.type",
                "excludeValue": ['geographic', 'genre_form']
            },
            "type": {
            	"path": "type",
            	"display": "text"
            },
	        "creator": {
	            "path": "display_record.names.title"
	        },
	        "identifier": {
	        	"path": "display_record.identifiers.identifier",
	        	"matchField": "type",
	        	"matchValue": "local"
	        },
	        "language": {
	        	"path": "display_record.t_language.language",
	        	"display": "text"
	        },
	        "extent": {
                "path": "display_record.extents"
            },
            "format": {
            	"path": "mime_type",
            	"display": "text"
            }
        }
    }
}
