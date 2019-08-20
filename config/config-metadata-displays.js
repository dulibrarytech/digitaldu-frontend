'use strict';

module.exports = { 
    /*
     * Fields to display in the summary data section (above Details link)
     * "Display field name": "index field key to match"
     */
    summaryDisplay: {
        "default": {
            "Title": {
                "path": "title"
            },
            "Description": {
                "path": "notes.content",
                "matchField": "type",
                "matchValue": "abstract"
            }
        }
    },

    /*
     * Fields to display in the summary data section (above Details link)
     * "Display field name": "index field key to match"
     */
    resultsDisplay: {
        "default": {
            "Creation Date": {
                "path": "dates.expression",
                "matchField": "label",
                "matchValue": "creation"
            },
            "Creator": {
                "path": "names.title"
            },
            "Description": {
                "path": "notes.content",
                "matchField": "type",
                "matchValue": "abstract"
            }
        }
    },

    /*
     * MODS fields to display in the Details section
     */
    metadataDisplay: {
        "default": {
            "Title": {
                "path": "title"
            },
            "Creator": {
                "path": "names.title"
            },
            "Creation Date": {
                "path": "dates.expression",
                "matchField": "label",
                "matchValue": "creation"
            },
            "Digitization Date": {
                "path": "dates.expression",
                "matchField": "label",
                "matchValue": "digitization"
            },
            "Language": {
                "path": "t_language.text"
            },
            "Abstract": {
                "path": "notes.content",
                "matchField": "type",
                "matchValue": "abstract"
            },
            "Subjects": {
                "path": "subjects.title"
            },
            "Topics": {
                "path": "subjects.terms.term",
                "matchField": "type",
                "matchValue": "topical"
            },
            "Geographic": {
                "path": "subjects.terms.term",
                "matchField": "type",
                "matchValue": "geographic"
            },
            "Extents": {
                "path": "extents"
            },
            "Resource URI": {
                "path": "uri"
            },
            "Call Number": {
                "path": "identifiers.identifier",
                "matchField": "type",
                "matchValue": "local"
            },
            "Notes": {
                "path": "notes.content",
                "matchField": "type",
                "matchValue": "abstract",
                "condition": "false"
            }
        },

        "digital_pioneers" : {
            "Digital Pioneers display Title": {
                "path": "title"
            }
        }
    },

    collectionDisplays: {
        "codu:root": "default",
        "codu:111359": "digital_pioneers"
    }
}