# CAP applications with shared database

## Scenario

If you have multiple CAP applications relying on the same domain model or want to split up a monolithic CAP application **on the service level only while still sharing the underlaying database layer** the following guide on applications with shared database can be an option.
The data models from all involved CAP services are collected and deployed to a single database schema, which all services get access to.

## Evaluation

The advantages are as follows:
 - **Query Performance:** Complex queries are executed much faster, e.g. $expand to an entity on another microservice (compared to calls across services with own data persistencies)
 - **Independent Scalability** of application runtimes (compared to a monolithic application)

 Disadvantages:
 - Accessing data directly (without an API) means any changes in the data model affect all applications directly
 - every change in one of the services either requires 
   - a redeployment of all microserivces involved
   - a logic to decide which microservices need redeployment to avoid inconsistencies
 - violates 12 factors concept

## Best Practices

* Prefer staying loosely coupled → e.g. ReviewsService → reviewed events → UPDATE avg ratings
* Leverage db-level integration selectively → Prefer referring to (public) service entities, not (private) db entities


## cap-samples Walkthrough
[cap-samples](https://github.com/SAP-samples/cloud-cap-samples?tab=readme-ov-file#welcome-to-capsamples) is a collection of sample applications, which are built as multiple (mostly) independent services with a shared database.
![component diagram with synchronous and event communication for orders](./assets/microservices/bookstore.excalidraw.svg)
The repository contains multiple CAP applications under a root project. The `package.json` of the root folder links the projects in the subfolders by utilizing [npm workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces).

### Deployment discriptor

In order to deploy CAP services in the Cloud Foundry environment as a Multitarget application a mta.yaml file is required. It represents a deployment discriptor which defines all CAP services and resources required by the application to function properly. Additional information can be found in the [Deploy to Cloud](../deployment/to-cf#deploy) guide. An initial *mta.yaml* file can be generated using the following command:

```shell
cds add mta
```

The mta.yaml file consists of three parts:
  - preparation phase: install npm dependencies, collect and compile cds model, prepare CAP services for deployment
  - modules: list of BTP apps to deploy - each BTP app represents one on more CAP services
  - resources: BTP service instances required by the BTP apps to operate (persistency, security, destinations, messaging service)

#### preparation

In the preparation phase the CDS modules are compiled and HDI files are generated.
The HDI files are deployed automatically to the HDI schema using the HDI-deployer.

1. install dependencies, for example: `npm ci`
2. assemble CDS model containing all artifacts for all CAP services, for example: `npx cds build (directory with db artifacts) --for hana --production`. 
3. prepare CAP services, for example: `npx cds build (SAP service directory) --for nodejs --production --ws-pack` where the *--ws-pack* option is important for node modules referencing other repository-local node modules

#### modules

Each BTP Аpp provides an API endpoint that is exposed as a parameter.
In the preparation phase the CDS model for the specific service will be compiled to a csn.json file containing the complete CDS model that the CAP service is providing and utilizing.

- add a npm start script for each CAP service

::: code-group
```json [(service)/package.json]
 "scripts": {
    "start": "cds-serve" // [!code ++]
  }
```
:::

#### resources

All instances of BTP services: HANA hdi container, xsuaa, enterprise messaging, destinations

### Database

```shell
cds add hana
```

- CAP service configuration
  
  - requires db

  ::: code-group
  ```json [(service)/package.json]
  { "cds": { "requires": { "db": true } } }
  ```
  :::

  - add dependency @cap-js/hana:

  ```shell
  npm i @cap-js/hana --workspace bookstore
  npm i @cap-js/hana --workspace orders
  npm i @cap-js/hana --workspace reviews
  ```

Prepare the *shared-db* folder - a node module referencing all relevant CDS models from all relevant workspaces required to generate the HDI artifacts for all CAP services:

- delete the newly created *db* folder containing default configuration files: *db/undeploy.json* and *db/src/.hdiconfig*

  ```shell
  rm db/undeploy.json db/src/.hdiconfig
  ```

- create and initialize a *shared-db* node module

  ```shell
  mkdir -p shared-db/db && cd shared-db && npm init -y && cd ..
  ```


- disable HANA native associations
  
  ::: code-group
  ```json [shared-db/package.json]
  ```json
    "cds": {
      "sql": {
        "native_hana_associations": false
      }
    }
  ```
  :::

- maintain CDS model list
  
  ::: code-group
  ```javascript [shared-db/db/index.cds]
  using from '@capire/bookstore';
  using from '@capire/reviews';
  using from '@capire/orders';
  ```
  :::

- maintain the db deployer path in samples-db-deployer module

  ::: code-group
  ```yaml [mta.yaml]
    - name: samples-db-deployer
      path: shared-db/gen/db # [!code focus]
  ```
  :::

- add build command for the database artifacts
  
  ::: code-group
  ```yaml [mta.yaml]
  build-parameters:
    before-all:
      - builder: custom
        commands:
          - npm ci
          - npx cds build ./shared-db --for hana --production # [!code ++]
  ```
  :::

### Approuter

Add initial approuter configuration using the command:

```shell
cds add approuter
```

The Approuter forwards OData requests to the corresponding services using the APIs.
It is deployed as a separate BTP App and is the main entry point for accessing the BTP Apps.

Detailed information on how to configure the approuter can be found in the [Configuring App Router guide](../deployment/to-cf#add-app-router).

- configure destinations - list of API endpoints with name and url which correspond to the AP endpoing in xs-app.json and the service URL:

  ::: code-group
  ```yaml [mta.yaml]
   requires:
      - name: orders-api
        group: destinations
        properties:
          name: orders-api #[!code focus]
          url: ~{srv-url} #[!code focus]
          forwardAuthToken: true
  ```
  :::

- API routes

xs-app.json describes how to forward incoming request to the API endpoint / OData services and is located in the app-router folder.

::: code-group
```json [xs-app.json]
{
  "routes": [
    {
      "source": "^/odata/v4/orders/(.*)$", //[!code focus]
      "target": "/odata/v4/orders/$1", //[!code focus]
      "destination": "orders-api", //[!code focus]
      "csrfProtection": true
    }
  ]
}
```
:::

- static content

The approuter can serve also static content (html files). If you want to deploy your WebUIs located in workspaces as static content, you can use Linux sym-links to link the UI-directories in the app-router folder.

```shell
cd app-router
ln -s ../bookshop/app/vue bookshop
ln -s ../orders/app/orders orders
ln -s ../reviews/app/vue reviews
cd ..
```

- CSRF-token

Deployed Vue UIs require a CSRF-Token which is obtained via a valid URL. Make sure you have a valid welcomeFile in your configuration

::: code-group
```json [xs-app.json]
{
  "welcomeFile": "app/bookshop/index.html"
}
```
:::

- app route

The */app/\** route maps any url to the static-content file system.

::: code-group
```json [xs-app.json]
"routes": [
  {
    "source": "^/app/(.*)$", //[!code focus]
    "target": "$1", //[!code focus]
    "localDir": ".", //[!code focus]
    "cacheControl": "no-cache, no-store, must-revalidate"
  }
]
```
:::

- appconfig route

The */appconfig/* route is required in case of Fiori UIs

::: code-group
```json [xs-app.json]
"routes": [
  {
    "source": "^/appconfig/", //[!code focus]
    "localDir": ".", //[!code focus]
    "cacheControl": "no-cache, no-store, must-revalidate"
  }
]
```
:::

- static content route

::: code-group
```json [xs-app.json]
"routes": [
  {
    "source": "^(.*)$", //[!code focus]
    "target": "$1", //[!code focus]
    "localDir": ".", //[!code focus]
    "cacheControl": "no-cache, no-store, must-revalidate"
  }
]
```
:::

### Authentication

Add initial security configuration using the command:

```shell
cds add xsuaa --for production
```

Detailed information on the security configuration can be found in the [Using XSUAA-Based Authentication guide](../deployment/to-cf#_2-using-xsuaa-based-authentication).

- add a CAP service npm dependency to @sap/xssec

  ```shell  
  npm i @sap/xssec --workspace bookstore
  npm i @sap/xssec --workspace orders
  npm i @sap/xssec --workspace reviews
  ```

- add an admin role

::: code-group
```json [xs-security.json]
{
  "scopes": [
    {
      "name": "$XSAPPNAME.admin", // [!code ++]
      "description": "admin" // [!code ++]
    }
  ],
  "role-templates": [
    {
      "name": "admin", // [!code ++]
      "scope-references": [ // [!code ++]
        "$XSAPPNAME.admin" // [!code ++]
      ], // [!code ++]
      "description": "cap samples multi-service shared-db" // [!code ++]
    }
  ]
}
```
:::

### Messaging

The messaging service is used to organize asynchronous communication between the CAP services.

```shell
cds add enterprise-messaging
```

- enable messaging for the relevant CAP services
  ::: code-group
  ```json [package.json]
  { "cds": { "requires": { "messaging": true } } }
  ```
  :::

- relax all filters and allow all topics
::: code-group
```json [event-mesh.json]
  "publishFilter": [
    "*"
  ],
  "subscribeFilter": [
    "*"
  ]
```
:::

- parameterize the properties `emname` and `namespace`
  ::: code-group
  ```json [event-mesh.json]
    {
      "emname": "samples-emname", // [!code --]
      "version": "1.1.0",
      "namespace": "default/samples/1", // [!code --]
      ...
    }
  ```
  :::
  ::: code-group
  ```yaml [mta.yaml]
    resources:
      - name: samples-messaging
        type: org.cloudfoundry.managed-service
        parameters:
          service: enterprise-messaging
          service-plan: default
          path: ./event-mesh.json
          config: # [!code ++]
            emname: bookstore-${org}-${space}  # [!code ++]
            namespace: cap/samples/${space}    # [!code ++]
  ```
  :::

### Destinations

```shell
cds add destination
```

Required when a CAP service consumes other CAP services, see: https://cap.cloud.sap/docs/node.js/remote-services

- enable destinations functionality

  ::: code-group
  ```json [package.json]
  { "cds": { "requires": { "destinations": true } } }
  ```
  :::

- CAP service package.json dependencies for the consuming destinations:
  - @sap-cloud-sdk/http-client

    ```shell
    npm i @sap-cloud-sdk/http-client --workspace bookstore`
    ```

  - @sap-cloud-sdk/resilience

    ```shell
    npm i @sap-cloud-sdk/resilience --workspace bookstore
    ```

The configuration contains list of destinations where each destination references the URL of the corresponding API endpoint (OData service)

::: code-group
```yaml [mta.yaml]
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
:::

### Misc

#### authentication depends on messaging

- add *processed-after* property

::: code-group
```yaml [mta.yaml]
  - name: samples-auth
    processed-after:
      - samples-messaging
```
:::

#### CAP service module

File: mta.yaml

- Duplicate samples-srv for each CAP service

- maintain the *path* property

  ::: code-group
  ```yaml [mta.yaml]
    path: the-service-path/gen/srv`
  ```
  :::

- maintain the provided API name

  ::: code-group
  ```yaml [mta.yaml]
  provides:
    - name: the-service-name-api
      properties:
        srv-url: ${default-url}
  ```
  :::

- (fix) change from *npm-ci* to *npm* builder

  ::: code-group
  ```yaml [mta.yaml]
  modules:
  - name: orders-srv
    type: nodejs
    ...
    build-parameters:
      builder: npm-ci #[!code --]
      builder: npm #[!code ++]
  ```
  :::

#### Initial data

Provide ID in the csv file for each UUID field in the model

::: code-group
```csv [reviews/db/data/sap.capire.reviews-Reviews.csv]
ID;subject;...
1689144d-3b10-4849-bcbe-2408a13e161d;201;...
```
:::

#### RemoteService credentials

Maintain RemoteService credentials

::: code-group
```yaml [mta.yaml]
- name: bookstore-srv
  ...  
  properties:
    cds_requires_ReviewsService_credentials: {"destination": "reviews-dest","path": "/reviews"} # [!code ++]
    cds_requires_OrdersService_credentials: {"destination": "orders-dest","path": "/odata/v4/orders"} # [!code ++]
```
:::

#### Approuter authentication

The approuter uses the authentication module thus it should *require* it

::: code-group
```yaml [mta.yaml]
- name: samples
  type: approuter.nodejs
  path: app-router
  ....
  requires: # [!code ++]
    - name: samples-auth # [!code ++]
```
:::

#### Event definitions

All events that should be using the event mesh need to be defined in the CDS model

::: code-group
```cds [orders/srv/orders-service.cds]
  event OrderChanged {
    product: String;
    deltaQuantity: Integer;
  }
```
:::

#### Bypass draft

There should be a possibility to directly create entity instances (Orders) via API.

- Add projection bypassing the draft funtionality enabled only for the system-user

::: code-group
```cds [orders/srv/orders-service.cds]
  @odata.draft.bypass
  @(requires: 'system-user')
  entity OrdersNoDraft as projection on my.Orders;
```
:::

- Create new active entity instances directly via the new projection

::: code-group
```javascript [bookstore/srv/mashup.js]
  CatalogService.on ('OrderedBook', async (msg) => {
    ......
    return OrdersService.create ('OrdersNoDraft').entries({
```
:::

### Npm commands

In order to build, deploy and undeploy easier several npm scripts are added:

::: code-group
```json [package.json]
  "scripts": {
    "build": "mbt build -t gen --mtar mta.tar", // [!code ++]
    "deploy": "cf deploy gen/mta.tar", // [!code ++]
    "undeploy": "cf undeploy capire.samples --delete-services --delete-service-keys" // [!code ++]
  }
```
:::

Before deploying you need to login to Cloud Foundry, see: https://cap.cloud.sap/docs/guides/extensibility/customization#cds-login

### Final versions

- mta preparation phase

  ::: code-group
  ```yaml [mta.yaml]
  build-parameters:
    before-all:
      - builder: custom
        commands:
          - npm ci
          - npx cds build ./shared-db --for hana --production
          - npx cds build ./orders --for nodejs --production --ws-pack
          - npx cds build ./reviews --for nodejs --production
          - npx cds build ./bookstore --for nodejs --production --ws-pack
  ```
  :::
