---
breadcrumbs:
  - Cookbook
  - Deployment
  - Deploy to Shared DB
synopsis: >
  A guide on deploying SAP Cloud Application Programming Model (CAP) applications as microservices with a shared database to the SAP BTP Cloud Foundry environment.
status: released
---

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

## cap-samples Walkthrough
[cap-samples](https://github.com/SAP-samples/cloud-cap-samples?tab=readme-ov-file#welcome-to-capsamples) is a collection of sample applications, which are built as multiple (mostly) independent services with a shared database.
![component diagram with synchronous and event communication for orders](./assets/microservices/bookstore.excalidraw.svg)
The repository contains multiple CAP applications in a monorepo. The `package.json` of the root folder links the projects in the subfolders by utilizing [npm workspaces](https://docs.npmjs.com/cli/v7/using-npm/workspaces).

### Deployment Descriptor

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

#### add a npm start script for each CAP service

::: code-group
```json [bookstore/package.json]
 "scripts": {
    "start": "cds-serve" // [!code ++]
  }
```
```json [orders/package.json]
 "scripts": {
    "start": "cds-serve" // [!code ++]
  }
```
```json [reviews/package.json]
 "scripts": {
    "start": "cds-serve" // [!code ++]
  }
```
:::

#### resources

All instances of BTP services: HANA hdi container, xsuaa, enterprise messaging, destinations

### Database

Add initial database configuration using the command:

```shell
cds add hana --production
```

Add cds db configuration to each module:

::: code-group
```json [bookstore/package.json]
{
  "cds": {
    "requires": {
      "db": true // [!code ++]
    }
  }
}
```
```json [orders/package.json]
{
  "cds": {
    "requires": {
      "db": true // [!code ++]
    }
  }
}
```
```json [reviews/package.json]
{
  "cds": {
    "requires": {
      "db": true // [!code ++]
    }
  }
}
```
:::

Add npm dependency `@cap-js/hana`:

```shell
npm i @cap-js/hana --workspace bookstore
npm i @cap-js/hana --workspace orders
npm i @cap-js/hana --workspace reviews
```

Delete the generated db folder as we do not need it on root level:

```shell
rm -r db
```

#### Prepare *shared-db* Module

Prepare the *shared-db* folder, referencing the relevant CDS models from the modules that we plan to deploy - bookstore, reviews and orders:

```shell
mkdir -p shared-db/db && cd shared-db && npm init -y && cd ..
```

Disable HANA native associations
  
::: code-group
```json [shared-db/package.json]
{
  "cds": {
    "sql": {
      "native_hana_associations": false
    }
  }
}
```
:::

Add list of CDS models that should be considered for deployment:

::: code-group
```cds [shared-db/db/index.cds]
using from '@capire/bookstore';
using from '@capire/reviews';
using from '@capire/orders';
```
:::

Update the db-deployer path:

::: code-group
```yaml [mta.yaml]
  - name: samples-db-deployer
    path: gen/db # [!code --]
    path: shared-db/gen/db # [!code ++]
```
:::

Add build command for generation of the database artifacts:

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


::: info cds build --ws
If the CDS models of every npm workspace contained in the monorepo should be considered, then instead of creating this shared-db folder, you can also use:
```shell
cds build --for hana --production --ws
```
The `--ws` aggregates all models in the npm workspaces.

In this walkthrough, we only include a subset of the CDS models in the deployment.
:::


#### Applications

Replace the mta module for samples-srv with versions for each CAP service and adjust `name`, `path` and `provides[0].name` to match the module name. Also change the npm-ci builder to the npm builder.

::: code-group
```yaml
modules:
  - name: bookstore-srv # [!code focus]
    type: nodejs
    path: bookstore/gen/srv # [!code focus]
    parameters:
      instances: 1
      buildpack: nodejs_buildpack
    build-parameters:
      builder: npm # [!code focus]
    provides: # [!code focus]
      - name: bookstore-api # [!code focus]
        properties:
          srv-url: ${default-url}
    requires:
      - name: samples-db
      - name: samples-auth
      - name: samples-messaging
      - name: samples-destination

  - name: orders-srv # [!code focus]
    type: nodejs
    path: orders/gen/srv # [!code focus]
    parameters:
      instances: 1
      buildpack: nodejs_buildpack
    build-parameters:
      builder: npm # [!code focus]
    provides: # [!code focus]
      - name: orders-api # [!code focus]
        properties:
          srv-url: ${default-url}
    requires:
      - name: samples-db
      - name: samples-auth
      - name: samples-messaging
      - name: samples-destination

  - name: reviews-srv # [!code focus]
    type: nodejs
    path: reviews/gen/srv # [!code focus]
    parameters:
      instances: 1
      buildpack: nodejs_buildpack
    build-parameters:
      builder: npm # [!code focus]
    provides: # [!code focus]
      - name: reviews-api # [!code focus]
        properties:
          srv-url: ${default-url}
    requires:
      - name: samples-db
      - name: samples-auth
      - name: samples-messaging
      - name: samples-destination
...
```
:::

Add build commands for each module to be deployed:

::: code-group
```yaml [mta.yaml]
build-parameters:
  before-all:
    - builder: custom
      commands:
        - npm ci
        - npx cds build --production # [!code --]
        - npx cds build ./orders --for nodejs --production --ws-pack # [!code ++]
        - npx cds build ./reviews --for nodejs --production # [!code ++]
        - npx cds build ./bookstore --for nodejs --production --ws-pack # [!code ++]
```
:::


### Approuter

Add [approuter configuration](../deployment/to-cf#add-app-router) using the command:

```shell
cds add approuter
```

The approuter serves the UIs and acts as a proxy for requests toward the different apps.

#### Static Content

The approuter can serve static content. Since our UIs are located in different npm workspaces, we create symbolic links to them as an easy way to deploy them as part of the approuter.

```shell
cd app/router
ln -s ../../bookshop/app/vue bookshop
ln -s ../../orders/app/orders orders
ln -s ../../reviews/app/vue reviews
cd ../..
```

::: warning Simplified Setup
This is a simplified setup which deploys the static content as part of the approuter.
See [Deploy to Cloud Foundry](./to-cf#add-ui) for a productive UI setup.
:::

#### Configuration

Add destinations for each app url:

::: code-group
```yaml [mta.yaml]
- name: samples
  type: approuter.nodejs
  ....
  requires:
    - name: service-api # [!code --]
      group: destinations  # [!code --]
      properties:  # [!code --]
        name: service-api  # [!code --]
        url: ~{srv-url}  # [!code --]
        forwardAuthToken: true  # [!code --]
    - name: orders-api # [!code ++]
      group: destinations  # [!code ++]
      properties:  # [!code ++]
        name: orders-api  # [!code ++]
        url: ~{srv-url}  # [!code ++]
        forwardAuthToken: true  # [!code ++]
    - name: reviews-api  # [!code ++]
      group: destinations  # [!code ++]
      properties:  # [!code ++]
        name: reviews-api  # [!code ++]
        url: ~{srv-url}  # [!code ++]
        forwardAuthToken: true  # [!code ++]
    - name: bookstore-api  # [!code ++]
      group: destinations  # [!code ++]
      properties:  # [!code ++]
        name: bookstore-api  # [!code ++]
        url: ~{srv-url}  # [!code ++]
        forwardAuthToken: true  # [!code ++]
```
:::

The xs-app.json file describes how to forward incoming request to the API endpoint / OData services and is located in the app-router folder. Each exposed CAP Service endpoint needs to be directed to the corresponding application which is providing this CAP service.

::: code-group
```json [xs-app.json]
{
  "routes": [
    { // [!code --]
      "source": "^/(.*)$", // [!code --]
      "target": "$1", // [!code --]
      "destination": "srv-api", // [!code --]
      "csrfProtection": true // [!code --]
    } // [!code --]
    { // [!code ++]
      "source": "^/admin/(.*)$", // [!code ++]
      "target": "/admin/$1", // [!code ++]
      "destination": "bookstore-api", // [!code ++]
      "csrfProtection": true // [!code ++]
    }, // [!code ++]
    { // [!code ++]
      "source": "^/browse/(.*)$", // [!code ++]
      "target": "/browse/$1", // [!code ++]
      "destination": "bookstore-api", // [!code ++]
      "csrfProtection": true // [!code ++]
    }, // [!code ++]
    { // [!code ++]
      "source": "^/user/(.*)$", // [!code ++]
      "target": "/user/$1", // [!code ++]
      "destination": "bookstore-api", // [!code ++]
      "csrfProtection": true // [!code ++]
    }, // [!code ++]
    { // [!code ++]
      "source": "^/odata/v4/orders/(.*)$",  // [!code ++]
      "target": "/odata/v4/orders/$1", // [!code ++]
      "destination": "orders-api", // [!code ++]
      "csrfProtection": true // [!code ++]
    }, // [!code ++]
    { // [!code ++]
      "source": "^/reviews/(.*)$", // [!code ++]
      "target": "/reviews/$1", // [!code ++]
      "destination": "reviews-api", // [!code ++]
      "csrfProtection": true // [!code ++]
    } // [!code ++]
  ]
}
```
:::

Add routes for static content:

::: code-group
```json [xs-app.json]
{
  "routes": [
    ...
    { // [!code ++]
      "source": "^/app/(.*)$", // [!code ++]
      "target": "$1", // [!code ++]
      "localDir": ".", // [!code ++]
      "cacheControl": "no-cache, no-store, must-revalidate" // [!code ++]
    }, // [!code ++]
    { // [!code ++]
      "source": "^/appconfig/", // [!code ++]
      "localDir": ".", // [!code ++]
      "cacheControl": "no-cache, no-store, must-revalidate" // [!code ++]
    }, // [!code ++]
    { // [!code ++]
      "source": "^(.*)$", // [!code ++]
      "target": "$1", // [!code ++]
      "localDir": ".", // [!code ++]
      "cacheControl": "no-cache, no-store, must-revalidate" // [!code ++]
    } // [!code ++]
  ]
}
```
:::

The `/app/\*` route exposes our UIs, so bookstore is available as `app/bookstore`, orders as `app/orders` and reviews as `app/reviews`.

Add the `bookshop/index.html` as initial page when visiting the app:

::: code-group
```json [xs-app.json]
{
  "welcomeFile": "app/bookshop/index.html", // [!code ++]
  "routes": {
    ...
  }
}
```
:::

Additionally the welcomeFile is important for deployed Vue UIs as they obtain CSRF-Tokens via this url.


### Authentication

Add [security configuration](../deployment/to-cf#_2-using-xsuaa-based-authentication) using the command:

```shell
cds add xsuaa --for production
```

Add npm dependency `@sap/xssec`:

```shell  
npm i @sap/xssec --workspace bookstore
npm i @sap/xssec --workspace orders
npm i @sap/xssec --workspace reviews
```

Add the admin role

::: code-group
```json [xs-security.json]
{
  "scopes": [
    { // [!code ++]
      "name": "$XSAPPNAME.admin", // [!code ++]
      "description": "admin" // [!code ++]
    } // [!code ++]
  ],
  "role-templates": [
    { // [!code ++]
      "name": "admin", // [!code ++]
      "scope-references": [ // [!code ++]
        "$XSAPPNAME.admin" // [!code ++]
      ], // [!code ++]
      "description": "cap samples multi-service shared-db" // [!code ++]
    } // [!code ++]
  ]
}
```
:::

### Messaging

The messaging service is used to organize asynchronous communication between the CAP services.

```shell
cds add enterprise-messaging
```

Enable messaging for the modules that use it:

::: code-group
```json [bookstore/package.json]
{
  "cds": {
    "requires": {
      "messaging": true // [!code ++]
    }
  }
}
```
```json [orders/package.json]
{
  "cds": {
    "requires": {
      "messaging": true // [!code ++]
    }
  }
}
```
:::

Relax all filters and allow all topics

::: code-group
```json [event-mesh.json]
{
  ...
  "rules": {
    "topicRules": {
      "publishFilter": [
        "${namespace}/*" // [!code --]
        "*" // [!code ++]
      ],
      "subscribeFilter": [
        "*"
      ]
    },
    "queueRules": {
      "publishFilter": [
        "${namespace}/*" // [!code --]
        "*" // [!code ++]
      ],
      "subscribeFilter": [
        "${namespace}/*" // [!code --]
        "*" // [!code ++]
      ]
    }
  }
}
```
:::

Parameterize the properties `emname` and `namespace`:

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

Add *processed-after* property, so that the xsuaa instance is created after the messaging:

::: code-group
```yaml [mta.yaml]
resources:
  ...
  - name: samples-auth
    processed-after: #[!code ++]
      - samples-messaging #[!code ++]
```
:::


#### Event definitions

All events that should be using the event mesh need to be defined in the CDS model.

::: code-group
```cds [orders/srv/orders-service.cds]
  event OrderChanged {
    product: String;
    deltaQuantity: Integer;
  }
```
:::

### Destinations

Add [destination configuration](https://cap.cloud.sap/docs/guides/using-services#using-destinations) for connectivity between the apps:

```shell
cds add destination
```

Add `@sap-cloud-sdk/http-client` and `@sap-cloud-sdk/resilience` for each module utilizing the destinations:

```shell
npm i @sap-cloud-sdk/http-client --workspace bookstore`
npm i @sap-cloud-sdk/resilience --workspace bookstore
```

Add destinations that point to the API endpoints of the orders and reviews applications:

::: code-group
```yaml [mta.yaml]
modules:
...
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
...
```
:::

Use the destinations in the bookstore application:

::: code-group
```yaml [mta.yaml]
- name: bookstore-srv
  ...  
  properties:
    cds_requires_ReviewsService_credentials: {"destination": "reviews-dest","path": "/reviews"} # [!code ++]
    cds_requires_OrdersService_credentials: {"destination": "orders-dest","path": "/odata/v4/orders"} # [!code ++]
```
:::


#### Bypass draft

There should be a possibility to directly create entity instances (Orders) via API.

Add projection bypassing the draft functionality enabled only for the system-user:

::: code-group
```cds [orders/srv/orders-service.cds]
  @odata.draft.bypass
  @(requires: 'system-user')
  entity OrdersNoDraft as projection on my.Orders;
```
:::

Create new active entity instances directly via the new projection:

::: code-group
```javascript [bookstore/srv/mashup.js]
  CatalogService.on ('OrderedBook', async (msg) => {
    ......
    return OrdersService.create ('OrdersNoDraft').entries({
```
:::


### Misc

#### Initial data

> Potentially irrelevant for this scenario - necessary for deployment to HANA

Provide ID in the csv file for each UUID field in the model

::: code-group
```csv [reviews/db/data/sap.capire.reviews-Reviews.csv]
ID;subject;...
1689144d-3b10-4849-bcbe-2408a13e161d;201;...
```
:::



#### Deploy Commands

In order to build, deploy and undeploy easily, add these npm scripts:

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
