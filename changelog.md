git ## Releases
* v1.0.0-beta [release]() [notes]()

### v1.1.1 6/10/2021

Updates to iiif manifest error handling
Updates to search request error handling
Updates to datastream request error handling
Implemented UniversalViewer thumbnail grid view for pdf objects
Removed remoute source of jquery and video-js css files
Continued jpg object file related updates
Updated object file download function to create jpg files for compound object zip archives

### v1.2.1

Style updates to Universal Viewer interface
Added dynamic license field to IIIF manifest
Updated Cantaloupe to v5.0.4
Replaced unsupported npm request-stream library with custom http library

### v1.2.2

Added the handle field to the object metadata
Fixed bug that caused object source to be inaccessible if the source path contained an uppercase file extension

### v1.2.3

Removed included Universalviewer library, allowing a direct pull from Universalviewer github into the project

### v1.2.4

Upgraded the cache funtionality for better usability and efficiency
Converted addCache function to synchronous operation

### v1.2.41

Updated datastream service to cache thumbnail images sourced from a remote url

### v1.3.0

Updated the transcript viewer for image objects to display transcripts for compound objects

### v1.3.1

Refactored the datastreams module for efficiency and clarity
Added a configuration object for type-specific object datastreams
Added object cache enable/disable setting to object datastream config object, removed file extension array that specified files to cache by extension
Updated addCache() function to populate the cache regardless of the enable/disable status of the objects being cached

### v1.3.2

Fixed bug in compound object Kaltura viewer that prevented unpublished object part thumbnails from displaying (remote viewer only)
Fixed bug in compound object Kaltura viewer that prevented unpublished object parts from being loaded (remote viewer only)

### v1.3.21

Fixed bug in compound object part file download

### v1.4.1

Datastream module upgrade complete

### v1.4.2

Added search result hit highlighting to add highlight to search terms appearing in current search field(s) in the search results view item data
Applied stop words filter to search terms in the search service, to prevent hits on single stop words and to display terms without stop words in the results label
Removed stop words from the search results view search terms label
Added configuration setting to disable search hit highlighting
Updated search term formatter to not remove stop words from terms enclosed in quotation marks #144
Added configuration setting to enable/disable search term highlighting #144

### v1.4.21

Fixed bug that prevented 'contains' queries from being combined with 'is' queries #144

### v1.4.22

Fixed bug in the search results terms label that displayed the query terms of advanced search in reverse order
Added the search field and search type (contains/is) to the advanced search results page label
Limited advanced search queries to 6, displaying a feedback message when the maximum number of queries has been added to the form