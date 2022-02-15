# Digital Collections Frontend - digitaldu
# Release 1.1.4

## Table of Contents

* [README](#readme)
* [Project Documentation](#project-documentation)
* [Releases](#releases)
* [Contact](#contact)


## README

### Background

The frontend of the University of Denver's Digital Collections repository, https://specialcollections.du.edu.

### Contributing

Check out our [contributing guidelines](/CONTRIBUTING.md) for ways to offer feedback and contribute.

### Licenses

[Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).

All other content is released under [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/).

### Maintainers

@jrynhart

### Acknowledgments

@freyesdulib, @kimpham54, @jackflaps, @josephlabrecque


### Local Setup and Configuration

 - Steps to configure Digital Collections app locally...
    1. Clone the application files from Git repository(https://github.com/dulibrarytech/digitaldu-frontend.git") 
    
    2. Run "sudo npm install" from the root folder to install dependencies
    
    3. Create a file ".env" in the project root folder. It should contain the following properties:
    ```
        NODE_ENV={development|devlog|production} 
        NODE_TLS_REJECT_UNAUTHORIZED=1
        APP_HOST={nodejs app domain}
        APP_PORT={nodejs app port}
        WEB_SOCKET_DOMAIN=ws://localhost
        WEB_SOCKET_PORT=9007
        ENABLE_TEST={if true and NODE_ENV is set to 'development': will include express router in /test folder}
        API_KEY={frontend api key}
        CLIENT_HOST={client domain - same as APP_HOST + APP_PORT unless dns is registered for client domain}
        # Use leading slash
        CLIENT_PATH={client relative path from domain}
        CONFIGURATION_FILE={name of main app configuration file}
        ELASTICSEARCH_HOST={elastic server domain}
        ELASTICSEARCH_PORT={elastic server port}
        ELASTICSEARCH_PUBLIC_INDEX={public elastic index}
        ELASTICSEARCH_PRIVATE_INDEX={private elastic index}
        REPOSITORY_DOMAIN={duraspace domain}
        REPOSITORY_PATH={relative duraspace dip-store url}
        REPOSITORY_PROTOCOL={http|https}
        REPOSITORY_USER={repository username}
        REPOSITORY_PWD={repository password}
        PDF_JS_VIEWER_PORT={port}
        IIIF_IMAGE_SERVER_URL={cantaloupe api domain}
        IIIF_IMAGE_SERVER_PATH={relative path to cantaloupe endpoint, blank if none}
        IIIF_TIFF_IMAGE_SERVER_URL{cantaloupe api domain, option for second image server to render tiff files. Keep blank if using one server for all images}
        IIIF_TIFF_IMAGE_SERVER_PATH{relative path to cantaloupe tiff server endpoint, blank if none}
        IIIF_DOMAIN={iiif api domain}
        IIIF_PATH={relative path to iiif, should be '/iiif'}

    ```
    4. APP_HOST is the url to the server.  Do not add the port to this url, add that to APP_PORT.  Set APP_PORT to whatever port the nodejs app should run on.
    
    5. CLIENT_HOST is the url to the client.  Add the port to the end if necessary
    
    6. IIIF_URL can be localhost, as the service is included with DigitalCollections.  Make sure the port listed here is the port that DigitalCollections is running on.
    
    7. Setup a local instance of Cantaloupe image server and update the CANTALOUPE_URL field in .env

    8. Update the settings file in /public/confog/configuration.js
    
    9. Run the app by using "node discovery.js" or "nodejs discovery.js" from the app root folder.

#### Index

##### Fields

###### "thumbnail"

This field can have three types of values:

1. Relative path to Duracloud source file 
2. Uri to remote file 
3. Object Pid

A relative path will contain no protocol or domain 

A uri will contain a protocol and domain

A pid value in the thumbnail field will display a thumbnail image of the referenced object

##### Index Document Required Fields for Each Object 

"pid": {string} Unique identifier for the object
"is_member_of_collection" {string} The PID of the collection object that this object is a member of
"thumbnail" {string} Path to the object's thumbnail image resource.  This can be an absolute path or relative path, depending on the repository interface in use.  This path is accessed by the repository interface. For the out-of-the-box Duraspace repository interface, this is the relative path to the dip-store object 
"object" {string} Path to the object's data resource.  This can be an absolute path or relative path, depending on the repository interface in use.  This path is accessed by the repository interface.  For the out-of-the-box Duraspace repository interface, this is the relative path to the dip-store object 
"mime_type" {string} Mimetype of the object (ex. image/tiff)
"object_type": {string} "object" or "collection"
"is_compound": {boolean} Flag to identify a compound object (an object with constituent parts)
"display_record": {object} Object with metadata display fields.  This is accessed to build the metadata displays for the object: Search result display, objet view summary, object metadata display
"parts": {array} Array of constituent part objects of a parent compound object.  Objects that are not compound do not require this field

##### Sample Index
elastic-index-mapping.json

##### Compound Object Required Fields

"mime_type": Mime type of the part object
"order": Sequence number of the part object
"title" Title of the part object, if any
"caption" Caption of the part object, if any
"thumbnail" {string} Path to the part object's thumbnail image resource.  This can be an absolute path or relative path, depending on the repository interface in use.  This path is accessed by the repository interface. For the out-of-the-box Duraspace repository interface, this is the relative path to the dip-store object 
"object" {string} Path to the part object's data resource.  This can be an absolute path or relative path, depending on the repository interface in use.  This path is accessed by the repository interface. For the out-of-the-box Duraspace repository interface, this is the relative path to the dip-store object 

##### Update configuration for any "nested" type index fields

1. Update the search field object in "searchAllFields": set "isNestedType" property to "true"

2. If a date field is nested, update the "nestedDateField" config property to true

3. Update the sort config data in the "searchSortFields" object if the search fields contain "matchField" and "matchPhrase" data

### External Services Setup

#### Cantaloupe Image Server (v4.1.7)

Download and install the Cantaloupe image server (https://cantaloupe-project.github.io/), update the frontend .env file with the Cantaloupe port and url. 

##### "Cantaloupe.properties" updates

delegate_script.enabled = true

HttpSource.lookup_strategy = ScriptLookupStrategy

##### "delegates.rb" updates (Implement the following hooks)

To test for a local image file in specified location. Cantaloupe will use image from local folder (path) if the file is found. If it is not, HttpSource will be used to fetch the image remotely from DuraCloud via the frontend /datastream route:

def source(options = {})
  str = "HttpSource"
    if context['identifier'].include? '___'
      parts = context['identifier'].split('___')
      filePattern = parts[1]
      filename = filePattern.concat(".jpg")

      puts "source() script checking for local image file '".concat(filename).concat("'...")
      path = "{path to images}"
      puts "Current image location is: ".concat(path)

      Dir.chdir(path)
      files = Dir[filePattern]
      if files.empty?
          puts "No matching files found. Using HttpSource"
          str = "HttpSource"
      else
        if files.length() > 1
          puts files.length().to_s.concat(" filenames found that match current file pattern '").concat(filePattern).concat("'")
          puts "Filenames: ".concat(files.join(', '))
          puts "Using first file..."
        end

        filename = files[0]
        filepath = path.concat(files[0]) 
        if(File.exist?(filepath))
          puts "Found image file ".concat(filename).concat(". Using FilesystemSource option")
          str = "FilesystemSource"
        else
          puts filename.concat(" not found. Using HttpSource option")
          str = "HttpSource"
        end
      end
    end 
    return str;
end

Test if file is present. This function is required to return the source uri with the filename that matches the current Cantaloupe request id. If file is not fount, will return a generic image filename consisting of the object pid and jpg extension. If the above source() method does find a file, and FileSystemSourceis selected to run the below function, the file will be found. This 'double checking' for the file is necessary because the default prefix-pid-suffix filename structure in the cantaloupe properties file can not be used on filenames that do not fit that structure. The source() and filesystemsource_pathname() hooks allow a file to be found that does not match the default structure

def filesystemsource_pathname(options = {})
  filepath = "{path to images}"
  if context['identifier'].include? '___'
    parts = context['identifier'].split('___')
    filepath = filepath.concat(parts[1]).concat(".jpg")
    puts "filesystemsource_pathname returning pathname: ".concat(filepath)
  else 
    puts "Error: filename not found in request uri"
  end
  return filepath;
end

Implement the following hook to detect an api key in the incoming request, and append it to the DigitalCollections /datastream route request.  This will create the path to the resource in DigitalCollections for Cantaloupe, appending an api key if present in the initial iiif request to Cantaloupe:

def httpsource_resource_info(options = {})
  pid = context['identifier']
  request_uri = context['request_uri']
  puts "http_resource_info() Object ID: ".concat(pid)
  puts "http_resource_info() Request uri: ".concat(request_uri)
  key = ''
  str = '{url to frontend application}'

  # remove filename
  if pid.include? '___'
    parts = pid.split('___')
    pid = parts[0]
    puts "http_resource_info() Removed file name from ID string. Object ID: ".concat(pid)
  end
  
  if pid.include? '__'
    parts = pid.split('__')
    key = '?key='
    key.concat(parts[1])
    str.concat(parts[0])
  else
    str.concat(pid)
  end

  str.concat('/object')
  str.concat(key)
  puts "http_resource_info() derived resource url: ".concat(str)
  return str  
end

##### Additional configuration

To serve jp2 files, Cantaloupe must be configured to use a jp2 codec such as Kakadu or OpenJPEG.  See Cantaloupe documentation for installation and configuration instructions

### Installing UniversalViewer library

#### Steps 

1. Clone or download folder from github (https://github.com/dulibrarytech/universalviewer.git) into {project root}/public/libs

2. Cd into the folder (universalviewer) and run "npm install"

3. Copy uv.css (in project folder root) into the "universalviewer/src/" folder

4. Copy uv_helpers.js (in project folder root) into the "universalviewer/src/" folder, and *rename it to 'helpers.js'*

5. Run the command "grunt" to build the application

Instructions to install/configure Universalviewer: https://universalviewer.io/

#### Digital-DU - Universalviewer interface: public/views/events.universalviewer.js

(Digital-du file, external to UV) Contains events that alter the behavior and appearance of the UV. This code updates the external workings of UV, such as the Kaltura viewer embed, the loading spinner, and the transcript view section.

*If the UV version is installed or upgraded, and either the Kaltura player embed or the transcript option does not work, check the browser console logs to determine if anything in this file needs to be updated to match the current version of Universalviewer*

## Services

### Cache

#### Configuration Settings

enableCacheForFileType:

Enable cacheing by file type. Add File extension to this array to enable the file type. File extensions must be defined in the "fileExtensions" list

Example:

["jpg", "pdf"]

Will cache all .tif and .pdf derivatives 

#### API

##### /cache/addItem/{cache name}/{object ID} : Add Object(s) to Cache

Will add object derivative file from the {cache name} cache for object {object ID}. If the object is a collection, a derivative file will be added to the cache for all of the objects in the collection.

Caches available for {Cache name} are 'thumbnail' or 'object'

##### /cache/removeItem/{cache name}/{object ID} : Remove Object(s) from Cache

Removes the derivative file from the {cache name} cache for object {object ID} 

Caches available for {Cache name} are 'thumbnail' or 'object'

##### /cache/purge/{cache name} : Automated Cache Purge

This service will check all of the files in the cache and check to see if the object still exists in the public index. If the object does not exist, it is assumed to have been removed from the repository, and the cache file will be removed. 

This service is started by issuing a GET request to
[project domain]/cache/purgeInvalidItems

The name of the cache to purge the nonexistent items from is passed in as a url parameter argument to the "/purgeInvalidItems" endpoint. the current caches are "object" and "thumbnail" so only these arguments are accepted.

This route requires the application api key as defined in the configuration. This key is added to the request as a query value. The key is "key" and the value is the api key.
Ex. [project domain]/cache/purgeInvalidItems/object?key={api key}

## Project Documentation

* [v.1.0.0-beta pre release Repository Demo](https://youtu.be/1LGOQYEfz5I)
* [Documentation - Digital Repository Object Lifecycle Structure](https://docs.google.com/document/d/1lQcEt3_slGvSKYmw3hKKGtm9HiLsLEytdbC7oEI0xVo/edit?usp=sharing) - document that describes the different supported object types and their structure - Last Updated: 2019 July
* [Digital Collections BETA Architecture](https://drive.google.com/open?id=1J-06znPbHNQkKQ9gOB22Vtv7Rj8xDExX) - diagram that shows how our ecosystem, the repository frontend and backend is a component of this system - Last Updated: 2019 May
* [Digital Collections Use Cases](https://docs.google.com/spreadsheets/d/1EpKlDTfdVN2T460gfSVKJ5L_QNAFh70Nl9litHS7src/edit?usp=sharing) - use cases for the repository sofware and the ecosystem, frequently updated - Last Updated: August 2019
* [3 month release plan](https://docs.google.com/spreadsheets/d/1gAAGtfTig8HF6JJMafKCSzNeyyfqGQ8tKea8GrZqKts/edit?usp=sharing) - release plan from May to August 2019 - Last Updated: August 2019
* [Digital Collections Ecosystem Functional Requirements](https://docs.google.com/document/d/17aMJRY1mhag4lYREDVoLbjaJq0f3TmwapSGMsEOFkHg/edit?usp=sharing) - high level requirements for the ecosystem - Last Updated: September 2018
* [Digital Collections Personas](https://docs.google.com/document/d/10nZ6QcqcqOu4JY6fSlTAcem8Wvp1izpc5K3tXIAKijw/edit?usp=sharing) - personas for the ecosystem and repository software - Last Updated - December 2018
* [Digital Collections Content Interoperability Map](https://docs.google.com/spreadsheets/d/1C4NeajjkkLNidkGFQmCc5YPQvY_VTYXXvJUnvpQE5f8/edit?usp=sharing) - system inteoperability and where content resides - Last Upated: January 2019
* Survey for Requirements for Search in the DU Digital Collections Repository - anonymized responses available on request - Last Updated: April 2019
* Survey for Requirements for Streaming Media Player Requirements in the Digital Repository - anonymized responses available on request - Last Updated: May 2019
* Survey for Requirements for Digital Collections Repository Use Survey - anonymized responses available on request - Last Updated: January 2019
* [Presentation, Open Repositories - Building a connected digital collections ecosystem](https://docs.google.com/presentation/d/1UI1K6LbjuAYsbGPSMQaxaSXElUd-uud2g71Gv3TygaI/edit?usp=sharing) - Last Updated: August 2019


## Contact

Ways to get in touch:

* Kim Pham (IT Librarian at University of Denver) - kim.pham60@du.edu
* Create an issue in this repository
