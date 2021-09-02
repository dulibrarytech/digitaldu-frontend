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
                "field": [
                    {
                        "path": "title"
                    }
                ]
            },
            "Creator": {
                "field": {
                    "path": "names.title"
                }
            },
            "Creation Date": {
                "field": {
                    "path": "dates.expression",
                    "matchField": "label",
                    "matchValue": "creation"
                }
            },
            "Digitization Date": {
                "field": {
                    "path": "dates.expression",
                    "matchField": "label",
                    "matchValue": "digitization"
                }
            },
            "Language": {
                "field": {
                    "path": "t_language.text"
                }
            },
            "Abstract": {
                "field": {
                    "path": "notes.content",
                    "matchField": "type",
                    "matchValue": "abstract"
                }
            },
            "Topics": {
                "field": [
                    {
                        "path": "subjects.title",
                        "excludeField": "terms.type",
                        "excludeValue": "['geographic', 'genre_form']"
                    }
                ],
                "link": {
                    "facetSearch": "Subject"
                }
            },
            "Places": {
                "field": {
                    "path": "subjects.terms.term",
                    "matchField": "type",
                    "matchValue": "geographic"
                }
            },
            "Genre/Form": {
                "field": {
                    "path": "subjects.terms.term",
                    "matchField": "type",
                    "matchValue": "genre_form"
                }
            },
            "Extents": {
                "field": {
                    "path": "extents"
                }
            },
            "Resource URI": {
                "field": {
                    "path": "uri"
                },
                "link": {
                    "type": "external",
                    "prefix": "https://duarchives.coalliance.org"
                }
            },
            "Call Number": {
                "field": {
                    "path": "identifiers.identifier",
                    "matchField": "type",
                    "matchValue": "local"
                }
            },
            "Notes": {
                "field": {
                    "path": "notes.content",
                    "truncateText": "200",
                    "excludeField": "terms.type",
                    "excludeValue": ['userestrict', 'accessrestrict', 'abstract']
                }
            },
            "Copyright": {
                "field": [
                    {
                        "path": "notes.content",
                        "matchField": "type",
                        "matchValue": "userestrict"
                    },
                    {
                        "path": "notes.content",
                        "matchField": "type",
                        "matchValue": "accessrestrict"
                    }
                ]
            }
        },

        "universalviewer": {
            "Title": {
                "field": {
                    "path": "title"
                }
            },
            "Creator": {
                "field": {
                    "path": "creator"
                }
            },
            "Description": {
                "field": {
                    "path": "notes.content",
                    "matchField": "type",
                    "matchValue": "abstract"
                }
            },
            "Rights and Usage Statement": {
                "field": [
                    {
                        "path": "notes.content",
                        "matchField": "type",
                        "matchValue": "userestrict"
                    },
                    {
                        "path": "notes.content",
                        "matchField": "type",
                        "matchValue": "accessrestrict"
                    }
                ]
            }
        },

        "digital_pioneers" : {
            "Digital Pioneers display Title": {
                "path": "title"
            }
        }
    },

    collectionDisplays: {
        "root": "default",
        "codu:111359": "digital_pioneers"
    }
}