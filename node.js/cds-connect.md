---
shorty: cds.connect
# layout: node-js
status: released
---

# Connecting to Required Services

Services frequently consume other services, which could be **local** services served by the same process, or **external** services, for example consumed through OData.
The latter include **database** services. In all cases use `cds.connect` to connect to such services, for example, from your:







## Configuring Required Services {#cds-env-requires }

To configure required remote services in Node.js, simply add respective entries to the `cds.requires` sections in your _package.json_ or in _.cdsrc.json_ (omitting the `cds.` prefix). These configurations are constructed as follows:

```json
"cds": {
  "requires": {
    "ReviewsService": {
      "kind": "odata", "model": "@capire/reviews"
    },
    "OrdersService": {
      "kind": "odata", "model": "@capire/orders"
    },
  }
}
```

Entries in this section tell the service loader to not serve that service as part of your application, but expects a service binding at runtime in order to connect to the external service provider. The options are as follows:


### cds.requires.<i>\<srv\></i>`.impl`

Service implementations are ultimately configured in `cds.requires` like that:

```json
"cds": { "requires": {
  "some-service": { "impl": "some/node/module/path" },
  "another-service": { "impl": "./local/module/path" }
}}
```

Given that configuration, `cds.connect.to('some-service')` would load the specific service implementation from `some/node/module/path`.
Prefix the module path in `impl` with `./` to refer to a file relative to your project root.


### cds.requires.<i>\<srv\></i>`.kind`

As service configurations inherit from each other along `kind` chains, we can refer to default configurations shipped with `@sap/cds`, as you commonly see that in our [_cap/samples_](https://github.com/sap-samples/cloud-cap-samples), like so:

```json
"cds": { "requires": {
  "db": { "kind": "sqlite" },
  "remote-service": { "kind": "odata" }
}}
```

This is backed by these default configurations:

```json
"cds": { "requires": {
  "sqlite": { "impl": "[...]/sqlite/service" },
  "odata": { "impl": "[...]/odata/service" },
}}
```

> Run `cds env get requires` to see all default configurations.
> Run `cds env get requires.db.impl` to see the impl used for your database.

Given that configuration, `cds.connect.to('db')` would load the generic service implementation.

[Learn more about `cds.env`.](cds-env){.learn-more}


### cds.requires.<i>\<srv\></i>`.model`

Specify (imported) models for remote services in this property. This allows the service runtime to reflect on the external API and add generic features. The value can be either a single string referring to a CDS model source, resolved as absolute node module, or relative to the project root, or an array of such.

```json
"cds": { "requires": {
  "remote-service": { "kind": "odata", "model":"some/imported/model" }
}}
```

Upon [bootstrapping](./cds-serve), all these required models will be loaded and compiled into the effective [`cds.model`](cds-facade#cds-model) as well.


### cds.requires.<i>\<srv\></i>`.service`

If you specify a model, then a service definition for your required service must be included in that model. By default, the name of the service that is checked for is the name of the required service. This can be overwritten by setting `service` inside the required service configuration.

```json
"cds": { "requires": {
  "remote-service": { "kind": "odata", "model":"some/imported/model", "service": "BusinessPartnerService" }
}}
```

The example specifies `service: 'BusinessPartnerService'`, which results in a check for a service called `BusinessPartnerService` instead of `remote-service` in the model loaded from `some/imported/model`.


### cds.requires.<i>\<srv\></i>`.credentials`

Specify the credentials to connect to the service. Credentials need to be kept secure and should not be part of a configuration file.





## Connecting to Required Services { #cds-connect-to }



### cds. connect.to () {.method}

Declaration:

```ts:no-line-numbers
async function cds.connect.to (
  name : string,  // reference to an entry in `cds.requires` config
  options : {
    kind : string // reference to a preset in `cds.requires.kinds` config
    impl : string // module name of the implementation
  }
)
```

Use `cds.connect.to()` to connect to services configured in a project's `cds.requires` configuration. Usually such services are remote services, which in turn can be mocked locally. Here's an example:

::: code-group

```json [package.json]
{"cds":{
  "requires":{
    "db": { "kind": "sqlite", "credentials": { "url":"db.sqlite" }},
    "ReviewsService": { "kind": "odata-v4" }
  }
}}
```

:::

```js
const ReviewsService = cds.connect.to('ReviewsService')
const db = cds.connect.to('db')
```

Argument `options` allows to pass options programmatically, and thus create services without configurations, for example:

```js
const db2 = cds.connect.to ({
  kind: 'sqlite', credentials: { url: 'db2.sqlite' }
})
```

In essence, `cds.connect.to()` works like that:

```js
let o = { ...cds.requires[name], ...options }
let csn = o.model ? await cds.load(o.model) : cds.model
let Service = require (o.impl) //> a subclass of cds.Service
let srv = new Service (name, csn, o)
return srv.init() ?? srv
```




### cds.connect.to  <i>  (name, options?) &#8594; service </i>

Connects to a required service and returns a _Promise_ resolving to a corresponding _[Service](../cds/cdl#services)_ instance.
Subsequent invocations with the same service name all return the same instance.

```js
const srv = await cds.connect.to ('some-service')
const { Books } = srv.entities
await srv.run (SELECT.from(Books))
```


_**Arguments:**_

* `name` is used to look up connect options from [configured services](#cds-env-requires).
* `options` allows to provide _ad-hoc_ options, overriding [configured ones](#cds-env-requires).


_**Caching:**_

Service instances are cached in [`cds.services`](cds-facade#cds-services), thus subsequent connects with the same service name return the initially connected one. As services constructed by [`cds.serve`](cds-serve#cds-serve) are registered with [`cds.services`](cds-facade#cds-services) as well, a connect finds and returns them as local service connections.

If _ad-hoc_ options are provided, the instance is not cached.



### cds.connect.to  <i>  (options) &#8594; service </i>

Ad-hoc connection (&rarr; only for tests):

```js
cds.connect.to ({ kind:'sqlite', credentials:{database:'my.db'} })
```



### cds.connect.to  <i>  ('\<kind\>:\<url\>') &#8594; service </i>

This is a shortcut for ad-hoc connections.

For example:
```js
cds.connect.to ('sqlite:my.db')
```

is equivalent to:

```js
cds.connect.to ({kind: 'sqlite', credentials:{database:'my.db'}})
```



## Service Bindings {#service-bindings}

A service binding connects an application with a cloud service. For that, the cloud service's credentials need to be injected in the CDS configuration:

```jsonc
{
  "requires": {
    "db": {
      "kind": "hana",
      "credentials": { /* from service binding */ }
    }
  }
}
```

You specify the credentials to be used for a service by using one of the following:
- Environment variables
- File system
- Auto binding

What to use depends on your environment.

###  <i>  In Cloud Foundry </i> {#bindings-in-cloud-platforms}

Find general information about how to configure service bindings in Cloud Foundry:

- [Deploying Services using MTA Deployment Descriptor](https://help.sap.com/docs/SAP_HANA_PLATFORM/4505d0bdaf4948449b7f7379d24d0f0d/33548a721e6548688605049792d55295.html)
- [Binding Service Instances to Cloud Foundry Applications](https://help.sap.com/docs/SERVICEMANAGEMENT/09cc82baadc542a688176dce601398de/0e6850de6e7146c3a17b86736e80ee2e.html)
- [Binding Service Instances to Applications using the Cloud Foundry CLI](https://help.sap.com/products/BTP/65de2977205c403bbc107264b8eccf4b/296cd5945fd84d7d91061b2b2bcacb93.html)

Cloud Foundry uses auto configuration of service credentials through the `VCAP_SERVICES` environment variable.

####  <i>  Through `VCAP_SERVICES` env var </i> {#vcap_services}

When deploying to Cloud Foundry, service bindings are provided in `VCAP_SERVICES` process environment variables, which is JSON-stringified array containing credentials for multiple services. The entries are matched to the entries in `cds.requires` as follows, in order of precedence:

1. The service's `name` is matched against the `name` property of `VCAP_SERVICE` entries
2. The service's `name` is matched against the `binding_name` property
3. The service's `name` is matched against entries in the `tags` array
4. The service's `kind` is matched against entries in the `tags` array
5. The service's `kind` is matched against the `label` property, for example, 'hana'
6. The service's `kind` is matched against the `type` property (The type property is only relevant for [servicebinding.io](https://servicebinding.io) bindings)
7. The service's `vcap.name` is matched against the `name` property

All the config properties found in the first matched entry will be copied into the `cds.env.requires.<i>\<srv\></i>.credentials` property.

Here are a few examples:

<table>
<tr>
<td>CAP config</td>
<td>VCAP_SERVICES</td>
</tr>
<tr >
<td >

```json
{
  "cds": {
    "requires": {
      "db": { ... }
    }
  }
}
```
</td>
<td >

```json
{
  "VCAP_SERVICES": {
    "hana": [{
      "name": "db", ...
    }]
  }
}
```
</td>
</tr>
<tr >
<td >

```json
{
  "cds": {
    "requires": {
      "db": { "kind": "hana" }
    }
  }
}
```
</td>
<td >

```json
{
  "VCAP_SERVICES": {
    "hana": [{
      "label": "hana", ...
    }]
  }
}
```
</td>
</tr>
<tr >
<td >

```json
{
  "cds": {
    "requires": {
      "db": {
        "vcap": { "name": "myDb" }
      }
    }
  }
}
```
</td>
<td >

```json
{
  "VCAP_SERVICES": {
    "hana": [{
      "name": "myDb",
      ...
    }]
  }
}
```
</td>
</tr>
</table>


###  <i>  In Kubernetes / Kyma </i> { #in-kubernetes-kyma}

CAP supports [servicebinding.io](https://servicebinding.io/) service bindings and SAP BTP service bindings created by the [SAP BTP Service Operator](https://github.com/SAP/sap-btp-service-operator).

1. Specify a root directory for all service bindings using `SERVICE_BINDING_ROOT` environment variable:

    ```yaml
    spec:
      containers:
      - name: bookshop-srv
        env:
        ...
        - name: SERVICE_BINDING_ROOT
          value: /bindings
    ```

2. Create service bindings

    Use the `ServiceBinding` custom resource of the [SAP BTP Service Operator](https://github.com/SAP/sap-btp-service-operator) to create bindings to SAP BTP services:

    ```yaml
    apiVersion: services.cloud.sap.com/v1alpha1
    kind: ServiceBinding
    metadata:
      name: bookshop-xsuaa-binding
    spec:
        serviceInstanceName: bookshop-xsuaa-binding
        externalName: bookshop-xsuaa-binding
        secretName: bookshop-xsuaa-secret
    ```

    Bindings to other services need to follow the [servicebinding.io workload projection specification](https://servicebinding.io/spec/core/1.0.0-rc3/#workload-projection).

3. Mount the secrets of the service bindings underneath the root directory:

    ```yaml
    spec:
      containers:
      - name: bookshop-srv
        ...
        volumeMounts:
        - name: bookshop-auth
          mountPath: "/bindings/auth"
          readOnly: true
      volumes:
      - name: bookshop-auth
        secret:
          secretName: bookshop-xsuaa-secret
    ```

    The `secretName` property refers to an existing Kubernetes secret, either manually created or by the `ServiceBinding` resource. The name of the sub directory (`auth` in the example) is recognized as the binding name.

CAP services receive their credentials from these bindings [as if they were provided using VCAP_SERVICES](#vcap_services).

<!-- todo: add link once BTP Service Operator migration is finished and doc is updated:

[Binding Service Instances to Kyma runtime](https://help.sap.com/products/BTP/65de2977205c403bbc107264b8eccf4b/d1aa23c492694d669c89a8d214f29147.html){.learn-more}

-->

####  <i>  Through environment variables </i> {#env-service-bindings}

All values of a secret can be added as environment variables to a pod. A prefix can be prepended to each of the environment variables. To inject the values from the secret in the right place of your CDS configuration, you use the configuration path to the `credentials` object of the service as the prefix:

`cds_requires_<your service>_credentials_`

Please pay attention to the underscore ("`_`") character at the end of the prefix.

*Example:*

```yaml
  spec:
    containers:
    - name: app-srv
      ...
      envFrom:
        - prefix: cds_requires_db_credentials_
          secretRef:
            name: app-db
```

::: warning
For the _configuration path_, you **must** use the underscore ("`_`") character as delimiter. CAP supports dot ("`.`") as well, but Kubernetes won't recognize variables using dots. Your _service name_ **mustn't** contain underscores.
:::


####  <i>  Through the file system </i> {#file-system-service-bindings}

CAP can read configuration from a file system by specifying the root path of the configuration in the `CDS_CONFIG` environment variable.

Set `CDS_CONFIG` to the path that should serve as your configuration root, for example: `/etc/secrets/cds`.

Put the service credentials into a path that is constructed like this:

`<configuration root>/requires/<your service>/credentials`

Each file will be added to the configuration with its name as the property name and the content as the value. If you have a deep credential structure, you can add further sub directories or put the content in a file as a JSON array or object.

For Kubernetes, you can create a volume with the content of a secret and mount it on your container.

*Example:*

```yaml
  spec:
    volumes:
      - name: app-db-secret-vol
        secret:
          secretName: app-db
    containers:
    - name: app-srv
      ...
      env:
        - name: CDS_CONFIG
          value: /etc/secrets/cds
      volumeMounts:
        - name: app-db-secret-vol
          mountPath: /etc/secrets/cds/requires/db/credentials
          readOnly: true
```

####  <i>  Provide Service Bindings (`VCAP_SERVICES`) </i> {#provide-service-bindings}

If your application runs in a different environment than Cloud Foundry, the `VCAP_SERVICES` env variable is not available. But it may be needed by some libraries, for example the SAP Cloud SDK.

By enabling the CDS feature `features.emulate_vcap_services`, the `VCAP_SERVICES` env variable will be populated from your configured services.

For example, you can enable it in the _package.json_ file for your production profile:

```json
{
  "cds": {
    "features": {
      "[production]": {
        "emulate_vcap_services": true
      }
    }
  }
}
```

::: warning
This is a backward compatibility feature.<br> It might be removed in a next [major CAP version](../releases/schedule#yearly-major-releases).
:::

Each service that has credentials and a `vcap.label` property is put into the `VCAP_SERVICES` env variable. All properties from the service's `vcap` object will be taken over to the service binding.

The `vcap.label` property is pre-configured for some services used by CAP.

For example, for the XSUAA service you only need to provide credentials and the service kind:

```json
{
  "requires": {
    "auth": {
      "kind": "xsuaa",
      "credentials": {
        "clientid": "cpapp",
        "clientsecret": "dlfed4XYZ"
      }
    }
  }
}
```

The `VCAP_SERVICES` variable is generated like this:

```json
{
  "xsuaa": [
    {
      "label": "xsuaa",
      "tags": [ "auth" ],
      "credentials": {
        "clientid": "cpapp",
        "clientsecret": "dlfed4XYZ"
      }
    }
  ]
}
```

The generated value can be displayed using the command:

```sh
cds env get VCAP_SERVICES --process-env
```

A list of all services with a preconfigured `vcap.label` property can be displayed with this command:

```sh
cds env | grep vcap.label
```

You can include your own services by configuring `vcap.label` properties in your CAP configuration.

For example, in the _package.json_ file:

```json
{
  "cds": {
    "requires": {
      "myservice": {
        "vcap": {
          "label": "myservice-label"
        }
      }
    }
  }
}
```

The credentials can be provided in any supported way. For example, as env variables:

```sh
cds_requires_myservice_credentials_user=test-user
cds_requires_myservice_credentials_password=test-password
```

The resulting `VCAP_SERVICES` env variable looks like this:

```json
{
  "myservice-label": [
    {
      "label": "myservice-label",
      "credentials": {
        "user": "test-user",
        "password": "test-password"
      }
    }
  ]
}
```


## Hybrid Testing


In addition to the [static configuration of required services](#service-bindings), additional information, such as urls, secrets, or passwords are required to actually send requests to remote endpoints. These are dynamically filled into property `credentials` from process environments, as explained in the following.


### cds.requires.<i>\<srv\></i>.credentials

All service binding information goes into this property. It's filled from the process environment when starting server processes, managed by deployment environments. Service bindings provide the details about how to reach a required service at runtime, that is, providing requisite credentials, most prominently the target service's `url`.

For development purposes, you can pass them on the command line or add them to a _.env_ or _default-env.json_ file as follows:

```properties
# .env file
cds.requires.remote-service.credentials = { "url":"http://...", ... }
```
::: warning
❗ Never add secrets or passwords to _package.json_ or _.cdsrc.json_!
General rule of thumb: `.credentials` are always filled (and overridden) from process environment on process start.
:::

One prominent exception of that, which you would frequently add to your _package.json_ is the definition of a database file for persistent sqlite database during development:
```json
  "cds": { "requires": {
    "db": {
      "kind": "sql",
      "[development]": {
        "kind": "sqlite",
        "credentials": {
          "database": "db/bookshop.db"
        }
      }
    }
  }}
```




###  <i>  Basic Mechanism </i> {#bindings-via-cds-env}


The CAP Node.js runtime expects to find the service bindings in `cds.env.requires`.

1. Configured required services constitute endpoints for service bindings.

   ```json
   "cds": {
     "requires": {
       "ReviewsService": {...},
      }
   }
   ```

2. These are made available to the runtime via `cds.env.requires`.

   ```js
   const { ReviewsService } = cds.env.requires
   ```

3. Service Bindings essentially fill in `credentials` to these entries.

   ```js
   const { ReviewsService } = cds.env.requires
   ReviewsService.credentials = {
     url: "http://localhost:4005/reviews"
   }
   ```

The latter is appropriate in test suites. In productive code, you never provide credentials in a hard-coded way. Instead, use one of the options presented in the following sections.


###  <i>  Through _.cdsrc-private.json_ File for Local Testing </i>

[Learn more about hybrid testing using _.cdsrc-private.json_.](../advanced/hybrid-testing#bind-to-cloud-services)

```json
{
  "requires": {
    "ReviewsService": {
      "credentials": {
        "url": "http://localhost:4005/reviews"
      }
    },
    "db": {
      "credentials": {
        "database": "sqlite.db"
      }
    }
  }
}
```

::: warning
Make sure that the _.cdsrc-private.json_ file is not checked into your project.
:::

###  <i>  Through `process.env` Variables </i> {#bindings-via-process-env}

You could pass credentials as process environment variables, for example in ad-hoc tests from the command line:

```sh
export cds_requires_ReviewsService_credentials_url=http://localhost:4005/reviews
export cds_requires_db_credentials_database=sqlite.db
cds watch fiori
```

####  <i>  In _.env_ Files for Local Testing </i>

Add environment variables to a local _.env_ file for repeated local tests:

```properties
cds.requires.ReviewsService.credentials = { "url": "http://localhost:4005/reviews" }
cds.requires.db.credentials.database = sqlite.db
```
> Never check in or deploy such _.env_ files!

<div id="endofconnect" />



## Importing Service APIs



## Mocking Required Services
