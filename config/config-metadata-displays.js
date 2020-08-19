  /**
    Copyright 2019 University of Denver

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.

    You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
    
    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 */

 /**
 * @file 
 *
 * config-metadata.js
 * Metadata display configuration file
 */

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
        },
    },

    /*
     * Fields to display for search result items
     * "Display field name": "index field key to match"
     */
    resultsDisplay: {
        "default": {
            "Date": {
                "path": "dates.expression",
                "matchField": "label",
                "matchValue": "creation"
            },
            "Creator": {
                "path": "names.title"
            },
            "Type": {
                "path": "type"
            },
            "Description": {
                "path": "notes.content",
                "matchField": "type",
                "matchValue": "abstract"
            }
        },
        "collection": {
            "Creator": {
                "path": "names.title"
            },
            "Description": {
                "path": "abstract"
            },
        }
    },

    /*
     * Metadata fields to display in the Details section
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
                "path": "subjects.title",
                "link": {
                    "facetSearch": "Subject"
                }
            },
            // "Topics": {
            //     "path": "subjects.terms.term",
            //     "matchField": "type",
            //     "matchValue": "topical"
            // },
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
                "condition": "false",
                "truncateText": "200"
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