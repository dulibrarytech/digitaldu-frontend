# Digital Collections Frontend - digitaldu

## Background

The frontend of the University of Denver's Digital Collections repository, https://specialcollections.du.edu.

## Contributing

Check out our [contributing guidelines](/CONTRIBUTING.md) for ways to offer feedback and contribute.

## Licenses

[Apache License 2.0](https://www.apache.org/licenses/LICENSE-2.0).

All other content is released under [CC-BY-4.0](https://creativecommons.org/licenses/by/4.0/).

## Maintainers

@jrynhart

## Acknowledgments

@freyesdulib

@kimpham54

@jackflaps

@josephlabrecque


## Local Development Setup

 - Steps to configure Digital Collections app locally...
    1. Clone the application files from Git repository(https://github.com/dulibrarytech/digitaldu-frontend.git") 
    
    2. Run "sudo npm install" from the root folder to install dependencies
    
    3. Create a file ".env" in the project root folder. It should contain the following properties:
    ```
        NODE_ENV=development
        NODE_TLS_REJECT_UNAUTHORIZED=1

        APP_HOST=http://localhost
        APP_PORT=9006

        CLIENT_HOST=http://localhost:9006
        CLIENT_PATH=

        ELASTICSEARCH_HOST={HOST}
        ELASTICSEARCH_PORT={PORT}
        ELASTICSEARCH_INDEX={INDEX}

        REPOSITORY={REPOSITORY}

        CANTALOUPE_URL={CANTALOPE_URL}

        IIIF_URL={IIIF_URL}
    ```
    4. APP_HOST is the url to the server.  Do not add the port to this url, add that to APP_PORT.  Set APP_PORT to whatever port the nodejs app should run on.
    
    5. CLIENT_HOST is the url to the client.  Add the port to the end if necessary
    
    6. IIIF_URL can be localhost, as the service is included with DigitalCollections.  Make sure the port listed here is the port that DigitalCollections is running on.
    
    7. Setup a local instance of Cantaloupe image server and update the CANTALOUPE_URL field in .env
    
    8. Run the app by using "node discovery.js" or "nodejs discovery.js" from the app root folder.
