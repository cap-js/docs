# Scenario

If you have multiple CAP applications relying on the same domain model or want to split up a monolithic CAP application **on the service level only while still sharing the underlaying database layer** the following guide on Microservices with shared database can be an option.

Please note, that this is not a true microservice architecture.

The benefits are as follows:
 - **Query Performance:** Complex queries are executed much faster (e.g. $expand to an entity on another microservice)

 Disadvantages:
 - Accessing data directly (without an API) means any changes in the data model affect all applications directly
 - every change in one of the services either requires 
   - a redeployment of all microserivces involved
   - a logic to decide which microservices need redeployment to avoid inconsistencies

# Best Practices

* Prefer staying loosely coupled → e.g. ReviewsService → reviewed events → UPDATE avg ratings
* Leverage db-level integration selectively → Prefer referring to (public) service entities, not (private) db entities

# Terminology

## Multi-service repo

A Multi-service repository is a git repository having npm workspaces, containing CAP services that can function independently from each other.
The CAP services have several possibilities to communicate and exchange data between them: 
- having shared database schema (HDI container)
- using a messaging service
- utilizing CAP's OData remote-service functionality.
- or a combination of the above

## Prerequisites

CAP Samples is a multi-service repository. It can contain also repository-local node modules referenced as dependencies in other local modules.

## shared-db scenario

All cds models from all CAP services deployed in one HANA HDI container, all microservices have access to it.

# MTA

In order to deploy CAP services in the Cloud Foundry environment as a Multitarget application a mta.yaml file is required. It represents a deployment discriptor which defines all CAP services and resources required by the application to function properly. Initial mta.yaml file can be generated via the command:

`cds add mta`

## mta.yaml

The mta.yaml file consists of three parts:
  - preparation phase: install npm dependencies, collect and compile cds model, prepare CAP services for deployment
  - modules: list of BTP apps to deploy - each BTP app represents one on more CAP services
  - resources: BTP service instances required by the BTP apps to operate (persistency, security, destinations, messaging service)

### preparation

In the preparation phase the CDS modules are compiled and HDI files are generated.
The HDI files are deployed automatically to the HDI schema using the HDI-deployer.

1. install dependencies, for example: `npm ci`
2. assemble CDS model containing all artifacts for all CAP services, for example: `npx cds build (directory with db artifacts) --for hana --production`. 
3. prepare CAP services, for example: `npx cds build (SAP service directory) --for nodejs --production --ws-pack` where the *--ws-pack* option is important for node modules referencing other repository-local node modules

### modules

Each BTP Аpp provides an API endpoint that is exposed as a parameter.
In the preparation phase the CDS model for the specific service will be compiled to a csn.json file containing the complete CDS model that the CAP service is providing and utilizing.

- start script - add a start script for each CAP service in the (service)/package.json file
```json
 "scripts": {
    "start": "cds-serve"
  }
```

### resources

All instances of BTP services: HANA hdi container, xsuaa, enterprise messaging, destinations

# Database

`cds add hana`

- CAP service configuration, file: (service)/package.json
  
  - requires db

  `cds.requires.db=true`

  - add dependency @cap-js/hana:

  ```
  npm i @cap-js/hana --workspace bookstore
  npm i @cap-js/hana --workspace orders
  npm i @cap-js/hana --workspace reviews
  ```

Prepare the *shared-db* folder - a node module referencing all relevant CDS models from all relevant workspaces required to generate the HDI artifacts for all CAP services:

- delete the newly created *db* folder containing default configuration files: *db/undeploy.json* and *db/src/.hdiconfig*

  `rm db/undeploy.json db/src/.hdiconfig`

- create and initialize a *shared-db* node module

  `mkdir -p shared-db/db && cd shared-db && npm init -y && cd ..`

- disable HANA native associations
  
  file: ./shared-db/package.json
  ```json
    "cds": {
      "sql": {
        "native_hana_associations": false
      }
    }
  ```

- maintain CDS model list
  
  file: shared-db/db/index.cds
  ```cds
  using from '@capire/bookstore';
  using from '@capire/reviews';
  using from '@capire/orders';
  ```

- maintain the db deployer path in samples-db-deployer module

  file: mta.yaml
  ```yaml
    - name: samples-db-deployer
      path: shared-db/gen/db
  ```
- add build command for the database artifacts
  
  file: mta.yaml
  ```yaml
  ............
  build-parameters:
    before-all:
      - builder: custom
        commands:
          - npm ci
          - npx cds build ./shared-db --for hana --production
  ............
  ```

# Approuter

`cds add approuter`

https://cap.cloud.sap/docs/guides/deployment/to-cf#add-app-router

## approuter features

The Approuter forwards OData requests to the corresponding services using the APIs.
It is deployed as a separate BTP App and is the main entry point for accessing the BTP Apps.

- configuration: mta.yaml - list of API endpoints with name (API EP in xs-app.json) and url:

```yaml
............
   requires:
      - name: orders-api
        group: destinations
        properties:
          name: orders-api
          url: ~{srv-url}
          forwardAuthToken: true
```

## API routes

xs-app.json describes how to forward incoming request to the API endpoint / OData services and is located in the app-router folder.
```json
{
  "routes": [
    {
      "source": "^/odata/v4/orders/(.*)$",
      "target": "/odata/v4/orders/$1",
      "destination": "orders-api",
      "csrfProtection": true
    }
  ]
}
```

## static content
The approuter can serve also static content (html files). If you want to deploy your WebUIs located in workspaces as static content, you can use Linux sym-links to link the UI-directories in the app-router folder.

```
cd app-router
ln -s ../bookshop/app/vue bookshop
ln -s ../orders/app/orders orders
ln -s ../reviews/app/vue reviews
cd ..
```

## CSRF-token

Deployed Vue UIs require a CSRF-Token which is obtained via a valid URL. Make sure you have a valid welcomeFile in your configuration

- xs-app.json
```json
{
"welcomeFile": "app/bookshop/index.html"
}
```

## /app/* route

The */app/\** route maps any url to the static-content file system.

- xs-app.json
```json
"routes": [
    {
      "source": "^/app/(.*)$",
      "target": "$1",
      "localDir": ".",
      "cacheControl": "no-cache, no-store, must-revalidate"
    },
```

## /appconfig/ route

The */appconfig/* route is required in case of Fiori UIs

- xs-app.json
```json
"routes": [
    {
      "source": "^/appconfig/",
      "localDir": ".",
      "cacheControl": "no-cache, no-store, must-revalidate"
    },
```

## static content route

- xs-app.json
```json
"routes": [
    {
      "source": "^(.*)$",
      "target": "$1",
      "localDir": ".",
      "cacheControl": "no-cache, no-store, must-revalidate"
    }
```

# Authentication

`cds add xsuaa`

Configuration: xs-security.json

- CAP service package.json dependency: @sap/xssec

  ```
  npm i @sap/xssec --workspace bookstore
  npm i @sap/xssec --workspace orders
  npm i @sap/xssec --workspace reviews
  ```

## maintain required roles

- add admin role in xs-security.json

```json
{
  "scopes": [
    {
      "name": "$XSAPPNAME.admin",
      "description": "admin"
    }
  ],
  "role-templates": [
    {
      "name": "admin",
      "scope-references": [
        "$XSAPPNAME.admin"
      ],
      "description": "cap samples multi-service shared-db"
    }
  ]
}
```

# Messaging

The messaging service is used to organize asynchronous communication between the CAP services.

`cds add enterprise-messaging`

- CAP Service package.json:
`cds.requires.messaging = true`

- maintain the configuration

  File: event-mesh.json

  - relax all filters and allow all topics
    ```json
      "publishFilter": [
        "*"
      ],
      "subscribeFilter": [
        "*"
      ]
    ```

- parametrize the properties: queue name, namespace
  - event-mesh.json: remove *emname* and *namespace*
  - mta.yaml: add *emname* and *namepsace*
    ```yaml
    resources:
    ...
      - name: samples-messaging
    ...
        parameters:
    ...
          config:
            emname: bookstore-${org}-${space}
            namespace: cap/samples/${space}
    ...
    ```

# Destinations

`cds add destination`

Required when a CAP service consumes other CAP services, see: https://cap.cloud.sap/docs/node.js/remote-services

- enable destinations functionality

  File: package.json
  
  `cds.requires.destinations = true`

- CAP service package.json dependencies for the consuming destinations:
  - @sap-cloud-sdk/http-client

    `npm i @sap-cloud-sdk/http-client --workspace bookstore`

  - @sap-cloud-sdk/resilience

    `npm i @sap-cloud-sdk/resilience --workspace bookstore`

The configuration contains list of destinations where each destination references the URL of the corresponding API endpoint (OData service)

- mta.yaml
```yaml
modules:
....
- name: destination-content
    type: com.sap.application.content
    requires:
      - name: orders-api
      - name: reviews-api
      - name: bookstore-api
      - name: samples-auth
        parameters:
          service-key:
            name: xsuaa_service-key
      - name: samples-destination
        parameters:
          content-target: true
    build-parameters:
      no-source: true
    parameters:
      content:
        instance:
          existing_destinations_policy: update
          destinations:
            - Name: orders-dest
              URL: ~{orders-api/srv-url}
              Authentication: OAuth2ClientCredentials
              TokenServiceInstanceName: samples-auth
              TokenServiceKeyName: xsuaa_service-key
            - Name: reviews-dest
              URL: ~{reviews-api/srv-url}
              Authentication: OAuth2ClientCredentials
              TokenServiceInstanceName: samples-auth
              TokenServiceKeyName: xsuaa_service-key
```
# Misc

## authentication depends on messaging

- mta.yaml: add *processed-after* property
```yaml
  - name: samples-auth
....
    processed-after:
      - samples-messaging
```

## add a module for each CAP service

File: mta.yaml

- Duplicate samples-srv for each CAP service

- maintain the *path* property

  `   path: the-service-path/gen/srv`

- maintain the provided API name

  ```yaml
  provides:
    - name: the-service-name-api
      properties:
        srv-url: ${default-url}
  ```

- (fix) change from *npm-ci* to *npm* builder

  ```
      builder: npm
  ```

## add ID column in csv files

- reviews/db/data/sap.capire.reviews-Reviews.csv

```
ID;subject;...
1689144d-3b10-4849-bcbe-2408a13e161d;201....
...
```

## maintain RemoteService credentials
- mta.yaml
```yaml
- name: bookstore-srv
  ...  
  properties:
    cds_requires_ReviewsService_credentials: {"destination": "reviews-dest","path": "/reviews"}
    cds_requires_OrdersService_credentials: {"destination": "orders-dest","path": "/odata/v4/orders"}
```

## approuter requires authentication
- mta.yaml
```yaml
- name: samples
  type: approuter.nodejs
  path: app-router
  ....
  requires:
    - name: samples-auth
```

## add CDS definitions for events

- orders/srv/orders-service.cds
```cds
  event OrderChanged {
    product: String;
    deltaQuantity: Integer;
  }
```

## allow backend to bypass draft

- orders/srv/orders-service.cds
```cds
  @odata.draft.bypass
  @(requires: 'system-user')
  entity OrdersNoDraft as projection on my.Orders;
```

- bookstore/srv/mashup.js
```javascript
  CatalogService.on ('OrderedBook', async (msg) => {
    ......
    return OrdersService.create ('OrdersNoDraft').entries({
```

# Npm commands

In order to build, deploy and undeploy easier several npm scripts are added:

- package.json
```json
  "scripts": {
    "build": "mbt build -t gen --mtar mta.tar",
    "deploy": "cf deploy gen/mta.tar",
    "undeploy": "cf undeploy capire.samples --delete-services --delete-service-keys"
  }
```

Before deploying you need to login to Cloud Foundry, see: https://cap.cloud.sap/docs/guides/extensibility/customization#cds-login

# Final versions

- mta preparation phase

  file: mta.yaml
  ```yaml
  ............
  build-parameters:
    before-all:
      - builder: custom
        commands:
          - npm ci
          - npx cds build ./shared-db --for hana --production
          - npx cds build ./orders --for nodejs --production --ws-pack
          - npx cds build ./reviews --for nodejs --production
          - npx cds build ./bookstore --for nodejs --production --ws-pack
  ............
  ```