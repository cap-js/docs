---
breadcrumbs:
  - Cookbook
  - Deployment
  - Microservices with CAP
synopsis: >
  A guide on deploying SAP Cloud Application Programming Model (CAP) applications as microservices to the SAP BTP Cloud Foundry environment.
status: released
---

# Microservices with CAP

## Scenario

If you have multiple CAP applications relying on the same domain model or want to split up a monolithic CAP application **on the service level only while still sharing the underlaying database layer** the following guide on applications with shared database can be an option.
The data models from all involved CAP services are collected and deployed to a single database schema, which all services get access to.

### Evaluation

The advantages are as follows:
 - **Query Performance:** Complex queries are executed much faster, e.g. $expand to an entity on another microservice (compared to calls across services with own data persistencies)
 - **Independent Scalability** of application runtimes (compared to a monolithic application)

 Disadvantages:
 - Accessing data directly (without an API) means any changes in the data model affect all applications directly
 - every change in one of the services either requires 
   - a redeployment of all microservices involved
   - a logic to decide which microservices need redeployment to avoid inconsistencies
 - violates 12 factors concept

## Create a Solution Monorepo

Assumed we want to create a composite application consisting of two or more micro services, each living in a separate GitHub repository, for example:

- https://github.com/capire/bookstore
- https://github.com/capire/reviews
- https://github.com/capire/orders

With some additional repos, used as dependencies in the above, like:

- https://github.com/capire/common
- https://github.com/capire/bookshop
- https://github.com/capire/data-viewer

This guide describes a way to manage development and deployment via *[monorepos](https://en.wikipedia.org/wiki/Monorepo)* using *[npm workspaces](https://docs.npmjs.com/cli/using-npm/workspaces)* and *[git submodules](https://git-scm.com/book/en/v2/Git-Tools-Submodules)* techniques...

1. Create a new monorepo root directory using `npm` workspaces:

   ```sh
   mkdir capire
   cd capire
   echo "{\"workspaces\":[\"*\"]}" > package.json
   ```

2. Add the above projects as `git` submodules:

   ```sh
   git init
   git submodule add https://github.com/capire/bookstore 
   git submodule add https://github.com/capire/reviews
   git submodule add https://github.com/capire/orders
   git submodule add https://github.com/capire/common
   git submodule add https://github.com/capire/bookshop
   git submodule add https://github.com/capire/data-viewer
   git submodule update --init
   ```

   Add a .gitignore
   ```txt
   node_modules
   gen
   ```
   > The outcome of this looks and behaves exactly as the monorepo layout in *[cap/samples](cap/samples)*,  so we can exercise the subsequent steps in there...

3. Test-drive locally as usual 
   ```sh
   npm install
   ```

   ```sh
   cds w bookshop
   ```

   ```sh
   cds w bookstore
   ```


::: details Other project structures
TODO
:::

## Using a Shared DB

In the following steps we'll create an additional project to easily collect the relevant models from these projects, and act as a vehicle to deploy these to HANA in a controlled way. 

### Add a project for shared db

1. Add a another `cds` project to collect the models from these:

   ```sh
   cds init shared-db --add hana
   cd shared-db
   ```

   ```sh
   npm add @capire/bookstore
   npm add @capire/reviews
   npm add @capire/orders
   ```

   > Note how *npm workspaces* allows us to use the package names of the projects, and nicely creates according symlinks in *node_modules*.

2. Add a `db/schema.cds` file as a mashup to actually collect the models:

   ```sh
   code db/schema.cds
   ```

   ```cds
   using from '@capire/bookstore';
   using from '@capire/reviews';
   using from '@capire/orders';
   ```

   > Note: the `using` directives above refer to `index.cds` files existing in the target packages. Your projects may have different entry points. 

::: details Try it out

With that we're basically done with the setup of the collector project. At the end of the day, it's just another CAP project with some cds models in it, which we can handle as usual. We can test whether it all works as expected, for example, we can test-compile and test-deploy it to sqlite and hana, build it, and deploy it to the cloud as usual:

```sh
cds db -2 sql
```
```sh
cds db -2 hana
```

```sh
cds deploy -2 sqlite
```
```sh
cds build --for hana
```

> Note: As we can see in the output for `cds deploy` and `cds build`, it also correctly collects and adds all initial data from enclosed `.csv` files. 
:::


### Deployment as separate mta

In a setup with multiple deployment units, we can add the shared-db project as its own mta deployment:

```sh
cds add mta
```

This adds everything necessary for a full CAP application.
Since we only want the database and database deployment, remove everything else like the srv module and destination and messaging resources:

```yaml
_schema-version: 3.3.0
ID: shared-db
version: 1.0.0
description: "A simple CAP project."
parameters:
  enable-parallel-deployments: true
build-parameters:
  before-all:
    - builder: custom
      commands:
        - npm ci
        - npx cds build --production # [!code --]
        - npx cds build --production --for hana # [!code ++]
modules:
  - name: shared-db-srv # [!code --]
    type: nodejs # [!code --]
    path: gen/srv # [!code --]
    parameters: # [!code --]
      instances: 1 # [!code --]
      buildpack: nodejs_buildpack # [!code --]
    build-parameters: # [!code --]
      builder: npm-ci # [!code --]
    provides: # [!code --]
      - name: srv-api  # [!code --]
        properties: # [!code --]
          srv-url: ${default-url} # [!code --]
    requires: # [!code --]
      - name: shared-db-destination # [!code --]
      - name: shared-db-messaging # [!code --]
      - name: shared-db-db # [!code --]

  - name: shared-db-db-deployer
    type: hdb
    path: gen/db
    parameters:
      buildpack: nodejs_buildpack
    requires:
      - name: shared-db-db

resources:
  - name: shared-db-destination # [!code --]
    type: org.cloudfoundry.managed-service # [!code --]
    parameters: # [!code --]
      service: destination # [!code --]
      service-plan: lite # [!code --]
  - name: shared-db-messaging # [!code --]
    type: org.cloudfoundry.managed-service # [!code --]
    parameters: # [!code --]
      service: enterprise-messaging # [!code --]
      service-plan: default # [!code --]
      path: ./event-mesh.json # [!code --]
  - name: shared-db-db
    type: com.sap.xs.hdi-container
    parameters:
      service: hana
      service-plan: hdi-shared
```




#### Binding to shared db

The only thing left to care about is to ensure all 3+1 projects will be bound and connected to the same dbs at deployment, subscription, and runtime.

Configure the mta.yaml of the other apps to bind to the existing shared database, e.g. in the reviews module:

```yaml [reviews/mta.yaml]
...
modules:
  ...

  - name: reviews-db-deployer # [!code --]
    type: hdb # [!code --]
    path: gen/db # [!code --]
    parameters: # [!code --]
      buildpack: nodejs_buildpack # [!code --]
    requires: # [!code --]
      - name: reviews-db # [!code --]

resources:
  ...
  - name: reviews-db
    type: com.sap.xs.hdi-container # [!code --]
    type: org.cloudfoundry.existing-service # [!code ++]
    parameters:
      service: hana # [!code --]
      service-plan: hdi-shared # [!code --]
      service-name: shared-db-db # [!code ++]
```



#### Subsequent updates

- TODO... 
- Whenever one of the project has changes affecting the database that would trigger a new deployment of the shared-db project
- Git submodules gives you control which versions to pull, e.g. by git branches or tags 
- Ensure to first deploy shared-db before deploying the others



## All-in-one Deployment

Here we'd go on with our guide how to deploy all 3+1 projects at once with a common `mta.yaml`

![component diagram with synchronous and event communication for orders](./assets/microservices/bookstore.excalidraw.svg)

[cap-samples](https://github.com/SAP-samples/cloud-cap-samples?tab=readme-ov-file#welcome-to-capsamples) already has an all-in-one deployment implemented. Similar steps are necessary to convert projects with multiple CAP applications into a shared database deployment.

### Deployment Descriptor

Add initial multitarget application configuration for deployment to Cloud Foundry:

```shell
cds add mta
```

[Learn more about **how to deploy to Cloud Foundry**.](../deployment/to-cf){.learn-more}

### Database

Add initial database configuration using the command:

```shell
cds add hana
```

Delete the generated db folder as we do not need it on root level:

```shell
rm -r db
```

Update the db-deployer path to use our shared-db project [created above](#using-a-shared-db):

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


::: details Configure each app for cloud readiness
The above added configuration only to the workspace root.

Additionally add cds db configuration to each module that we want to deploy - bookstore, orders and reviews:

```shell
npm i @cap-js/hana --workspace bookstore
npm i @cap-js/hana --workspace orders
npm i @cap-js/hana --workspace reviews
```
:::


### Applications

Replace the mta module for samples-srv with versions for each CAP service and adjust `name`, `path` and `provides[0].name` to match the module name. Also change the npm-ci builder to the npm builder.

::: code-group
```yaml [mta.yaml]
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

::: info --ws-pack
Note that we use the *--ws-pack* option for some modules. It is important for node modules referencing other repository-local node modules.
:::


### Authentication

Add [security configuration](../security/authorization#xsuaa-configuration) using the command:

```shell
cds add xsuaa --for production
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

::: details Configure each app for cloud readiness
Add npm dependency `@sap/xssec`:

```shell  
npm i @sap/xssec --workspace bookstore
npm i @sap/xssec --workspace orders
npm i @sap/xssec --workspace reviews
```
:::

### Messaging

The messaging service is used to organize asynchronous communication between the CAP services.

```shell
cds add enterprise-messaging
```

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

::: details Configure each app for cloud readiness
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


### Destinations

Add [destination configuration](https://cap.cloud.sap/docs/guides/using-services#using-destinations) for connectivity between the apps:

```shell
cds add destination
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
modules:
  - name: bookstore-srv
    ...
    properties: # [!code ++]
      cds_requires_ReviewsService_credentials: {"destination": "reviews-dest","path": "/reviews"} # [!code ++]
      cds_requires_OrdersService_credentials: {"destination": "orders-dest","path": "/odata/v4/orders"} # [!code ++]
```
:::

::: details Configure each app for cloud readiness

Add `@sap-cloud-sdk/http-client` and `@sap-cloud-sdk/resilience` for each module utilizing the destinations:

```shell
npm i @sap-cloud-sdk/http-client --workspace bookstore
npm i @sap-cloud-sdk/resilience --workspace bookstore
```
:::

### Approuter

Add [approuter configuration](../deployment/to-cf#add-app-router) using the command:

```shell
cds add approuter
mv app/router .deploy/app-router
```

The approuter serves the UIs and acts as a proxy for requests toward the different apps.

Since the approuter folder is only necessary for deployment, we move it into a `.deploy` folder.

```shell
mv app/router .deploy/app-router
```

::: code-group
```yaml
modules:
  ...
  - name: samples
    type: approuter.nodejs
    path: app/router # [!code --]
    path: .deploy/app-router # [!code ++]
  ...
```
:::

#### Static Content

The approuter can serve static content. Since our UIs are located in different npm workspaces, we create symbolic links to them as an easy way to deploy them as part of the approuter.

```shell
mkdir .deploy/app-router/resources
cd .deploy/app-router/resources
ln -s ../../../bookshop/app/vue bookshop
ln -s ../../../orders/app/orders orders
ln -s ../../../reviews/app/vue reviews
cd ../../..
```

::: warning Simplified Setup
This is a simplified setup which deploys the static content as part of the approuter.
See [Deploy to Cloud Foundry](./to-cf#add-ui) for a productive UI setup.
:::

#### Configuration

Add destinations for each app url:

::: code-group
```yaml [mta.yaml]
modules:
  ...
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

The xs-app.json file describes how to forward incoming request to the API endpoint / OData services and is located in the app/router folder. Each exposed CAP Service endpoint needs to be directed to the corresponding application which is providing this CAP service.

::: code-group
```json [.deploy/app-router/xs-app.json]
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
```json [.deploy/app-router/xs-app.json]
{
  "routes": [
    ...
    { // [!code ++]
      "source": "^/app/(.*)$", // [!code ++]
      "target": "$1", // [!code ++]
      "localDir": "resources", // [!code ++]
      "cacheControl": "no-cache, no-store, must-revalidate" // [!code ++]
    } // [!code ++]
  ]
}
```
:::

The `/app/*` route exposes our UIs, so bookstore is available as `/app/bookstore`, orders as `/app/orders` and reviews as `/app/reviews`.
Due to the `/app` prefix, make sure that static resources are accessed via relative paths inside the UIs.

Add the `bookshop/index.html` as initial page when visiting the app:

::: code-group
```json [.deploy/app-router/xs-app.json]
{
  "welcomeFile": "app/bookshop/index.html", // [!code ++]
  "routes": {
    ...
  }
}
```
:::

Additionally the welcomeFile is important for deployed Vue UIs as they obtain CSRF-Tokens via this url.


### Deploy

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

Before deploying you need to login to Cloud Foundry.

To locally build the apps, run

```shell
npm run build
```

To deploy the built artifacts to Cloud Foundry, run

```shell
npm run deploy
```

Once the app is deployed, you can get the url of the approuter via

```shell
cf apps # [!code focus]

name                         requested state   processes   routes
bookstore-srv                started           web:1/1     my-capire-bookstore-srv.cfapps.us10-001.hana.ondemand.com
orders-srv                   started           web:1/1     my-capire-orders-srv.cfapps.us10-001.hana.ondemand.com
reviews-srv                  started           web:1/1     my-capire-reviews-srv.cfapps.us10-001.hana.ondemand.com
samples                      started           web:1/1     my-capire-samples.cfapps.us10-001.hana.ondemand.com # [!code focus]
samples-db-deployer          stopped           web:0/1
```

You can then navigate to this url and the corresponding apps
```text
<url>/              -> bookshop
<url>/app/bookshop  -> bookshop
<url>/app/orders    -> orders
<url>/app/reviews   -> reviews
```
