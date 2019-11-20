# Digital Collections Frontend - digitaldu

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


### Local Development Setup

 - Steps to configure Digital Collections app locally...
    1. Clone the application files from Git repository(https://github.com/dulibrarytech/digitaldu-frontend.git") 
    
    2. Run "sudo npm install" from the root folder to install dependencies
    
    3. Create a file ".env" in the project root folder. It should contain the following properties:
    ```
        NODE_ENV=development
        NODE_TLS_REJECT_UNAUTHORIZED=1
        APP_HOST={nodejs app domain}
        APP_PORT={nodejs app port}
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
        CANTALOUPE_URL={cantaloupe api domain}
        CANTALOUPE_PORT={port}
        IIIF_URL={iiif api}
    ```
    4. APP_HOST is the url to the server.  Do not add the port to this url, add that to APP_PORT.  Set APP_PORT to whatever port the nodejs app should run on.
    
    5. CLIENT_HOST is the url to the client.  Add the port to the end if necessary
    
    6. IIIF_URL can be localhost, as the service is included with DigitalCollections.  Make sure the port listed here is the port that DigitalCollections is running on.
    
    7. Setup a local instance of Cantaloupe image server and update the CANTALOUPE_URL field in .env
    
    8. Run the app by using "node discovery.js" or "nodejs discovery.js" from the app root folder.

    #### Index required fields

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

#### Cantaloupe Image Server

Download and install the Cantaloupe image server (https://cantaloupe-project.github.io/), update the frontend .env file with the Cantaloupe port and url.  Alternatively, another IIIF image server can be used.

##### "Cantaloupe.properties" updates

HttpSource.BasicLookupStrategy.url_prefix = [frontend app domain]/datastream/

HttpSource.BasicLookupStrategy.url_suffix = /object

##### Additional configuration

To serve jp2 files, Cantaloupe must be configured to use a jp2 codec such as Kakadu or OpenJPEG.  See Cantaloupe documentation for installation and configuration instructions

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

## Releases
* v1.0.0-beta [release]() [notes]()



## Contact

Ways to get in touch:

* Kim Pham (IT Librarian at University of Denver) - kim.pham60@du.edu
* Create an issue in this repository
