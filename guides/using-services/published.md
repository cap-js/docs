
### Deployment

Your micro service needs bindings to the **XSUAA** and **Destination** service to access destinations on SAP BTP. If you want to access an on-premise service using **Cloud Connector**, then you need a binding to the **Connectivity** service as well.

[Learn more about deploying CAP applications.](//guides/deployment/){:.learn-more}
[Learn more about deploying an application using the end-to-end tutorial.](https://developers.sap.com/group.btp-app-cap-deploy.html){:.learn-more}

#### Add Required Services to Cloud Foundry Manifest Deployment

The deployment with Cloud Foundry manifest is described in [the deployment guide](//guides/deployment/to-cf). You can follow this guide and make some additional adjustments to the [generated _services-manifest.yml_ and the _services.yml_](//guides/deployment/to-cf#add-manifest) files.

Add **XSUAA**, **Destination**, and **Connectivity** service to your _services-manifest.yml_ file.

```yaml
  - name: cpapp-uaa
    broker: xsuaa
    plan: application
    parameters: xs-security.json
    updateService: true

  - name: cpapp-destination
    broker: destination
    plan: lite
    updateService: false

  # Required for on-premise connectivity only
  - name: cpapp-connectivity
    broker: connectivity
    plan: lite
    updateService: false
```

Add the services to your microservice's `services` list in the _manifest.yml_ file:

```yaml
- name: cpapp-srv
  services:
  - ...
  - cpapp-uaa
  - cpapp-destination
  # Required for on-premise connectivity only
  - cpapp-connectivity
```

[Push](//guides/deployment/to-cf#push-the-application) the application.

```bash
cf create-service-push  # or `cf cspush` in short from 1.3.2 onwards
```

#### Add Required Services to MTA Deployments

The MTA-based deployment is described in [the deployment guide](//guides/deployment/). You can follow this guide and make some additional adjustments to the [generated _mta.yml_](//guides/deployment/to-cf#add-mta-yaml) file.

Add **XSUAA**, **Destination**, and **Connectivity** service to your _mta.yaml_ file:

```yaml
- name: cpapp-uaa
  type: org.cloudfoundry.managed-service
  parameters:
    service: xsuaa
    service-plan: application
    path: ./xs-security.json

- name: cpapp-destination
  type: org.cloudfoundry.managed-service
  parameters:
    service: destination
    service-plan: lite

# Required for on-premise connectivity only
- name: cpapp-connectivity
  type: org.cloudfoundry.managed-service
  parameters:
    service: connectivity
    service-plan: lite
```

Add the services as requirement for your microservice in your _mta.yaml_ file:

```yaml
- name: cpapp-srv
  ...
  requires:
    ...
    - name: cpapp-uaa
    - name: cpapp-destination
      # Required for on-premise connectivity only
    - name: cpapp-connectivity
```

Build and deploy your application:

```bash
# build .mtar
mbt build -t ./

# deploy
cf deploy <.mtar file>  # for example, bookshop_1.0.0.mtar
```

#### Connectivity Service Credentials on Kyma

The secret of the connectivity service on Kyma needs to be modified for the Cloud SDK to connect to on-premise destinations.

Further information:
* [Support for Connectivity Service Secret in Java](https://github.com/SAP/cloud-sdk/issues/657)
* [Support for Connectivity Service Secret in Node.js](https://github.com/SAP/cloud-sdk-js/issues/2024)

### Destinations and Multitenancy

With the destination service, you can access destinations in your provider account, the account your application is running in, and destinations in the subscriber accounts of your multitenant-aware application.

#### Use Destinations from Subscriber Account

Customers want to see business partners from, for example, their SAP S/4 HANA system.

As provider, you need to define a name for a destination, which enables access to systems of the subscriber of your application. In addition, your multitenant application or service needs to have a dependency to the destination service.

The subscriber needs to create a destination with that name in their subscriber account, for example, pointing to their SAP S/4HANA system.



#### Destination Resolution

Destinations are looked up using the following rules:


| Runtime | Rules                                                                                                                                                                                                                             |
| ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Java    | The destination is read from the tenant of the request's JWT (authorization) token.<br>  If no JWT token is present, the destination is read from the tenant of the application's XSUAA binding.                                  |
| Node.js | The destination is read from the tenant of the request's JWT (authorization) token.<br>  If no JWT token is present *or the destination isn't found*, the destination is read from the tenant of the application's XSUAA binding. |

::: warning _❗ JWT token vs. XSUAA binding_
Using the tenant of the request's JWT token means reading from the **subscriber subaccount** for a multitenant application. The tenant of the application's XSUAA binding points to the destination of the **provider subaccount**, the account where the application is deployed to.
:::

For Node.js you can change the destination lookup behavior using the [`selectionStrategy`](https://sap.github.io/cloud-sdk/docs/js/features/connectivity/destination#multi-tenancy) property for the [destination options](#use-destinations-with-nodejs).

With the value `alwaysProvider` you can ensure that the destination is always read from your provider subaccount. With that you ensure that a subscriber cannot overwrite your destination.

```jsonc
"cds": {
    "requires": {
        "SERVICE_FOR_PROVIDER": {
            /* ... */
            "credentials": {
                /* ... */
            },
            "destinationOptions": {
              "selectionStrategy": "alwaysProvider"
            }
        }
    }
}
```

For Java use the property `retrievalStrategy` in the destination configuration, to ensure that the destination is always read from your provider subaccount:

```yaml
cds:
  remote.services:
    service-for-provider:
      destination:
        type: "odata-v4"
        retrievalStrategy: "AlwaysProvider"

```

Read more in the full reference of all [supported retrieval strategy values](https://sap.github.io/cloud-sdk/docs/java/features/connectivity/sdk-connectivity-destination-service#retrieval-strategy-options). Please note that the value must be provided in pascal case, for example: `AlwaysProvider`.

## Add Qualities

### Authentication and Authorization of Remote Services {:.impl.beta}
#### Principle (User) Propagation

#### Technical User

### Resilience

There are two ways to make your outbound communications resilient:

1. Run your application in a service mesh (for example, Istio, Linkerd, etc.). For example, [Kyma is provided as service mesh.](#resilience-in-kyma).
2. Implement resilience in your application.

Refer to the documentation for the service mesh of your choice for instructions. No code changes should be required.

To build resilience into your application, there are libraries to help you implement functions, like doing retries, circuit breakers or implementing fallbacks.

#### Resilience in Java

You can use the [resilience features](https://sap.github.io/cloud-sdk/docs/java/features/resilience) provided by the SAP Cloud SDK with CAP Java. You need to wrap your remote calls with a call of `ResilienceDecorator.executeSupplier` and a resilience configuration (`ResilienceConfiguration`). Additionally, you can provide a fallback function.

```java
ResilienceConfiguration config = ResilienceConfiguration.of(AdminServiceAddressHandler.class)
  .timeLimiterConfiguration(TimeLimiterConfiguration.of(Duration.ofSeconds(10)));

context.setResult(ResilienceDecorator.executeSupplier(() ->  {
  // ..to access the S/4 system in a resilient way..
  logger.info("Delegating GET Addresses to S/4 service");
  return bupa.run(select);
}, config, (t) -> {
  // ..falling back to the already replicated addresses in our own database
  logger.warn("Falling back to already replicated Addresses");
  return db.run(select);
}));
```

[See the full example](https://github.com/SAP-samples/cloud-cap-samples-java/blob/main/srv/src/main/java/my/bookshop/handlers/AdminServiceAddressHandler.java){:.learn-more}

#### Resilience in Node.js

There's no resilience library provided out of the box for CAP Node.js. However, you can use packages provided by the Node.js community. Usually, they provide a function to wrap your code that adds the resilience logic.

#### Resilience in Kyma

Kyma clusters run an [Istio](https://istio.io/) service mesh. Istio allows to [configure resilience](https://istio.io/latest/docs/concepts/traffic-management/#network-resilience-and-testing) for the network destinations of your service mesh.

### Tracing

CAP adds headers for request correlation to its outbound requests that allows logging and tracing across micro services.

[Learn more about request correlation in Node.js.](//node.js/cds-log/#node-observability-correlation){:.learn-more} [Learn more about request correlation in Java.](//java/observability/#correlation-ids){:.learn-more}

## Automated Testing {:.impl.beta}

### Unit Tests

### Integration Tests


## Replicating Data {:.impl.beta}

> TODO: Using the sample in branch `adding-suppliers`, the following is already done

1. Use the [mashup.cds](https://github.com/SAP-samples/cloud-cap-samples/blob/adding-suppliers/suppliers/srv/mashup.cds) to define the persistence.

### Define Persistence

You don't want to call the external API for every request, because this has performance implications. It's good practice to replicate the data.

```cds
/*
  Optionally add a local persistence to keep replicas of external
  entities to have data in fast access locally; much like a cache.
 */
annotate S4.Suppliers with @cds.persistence : {
  table,
  skip : false
};

/**
 * Having locally cached replicas also allows us to display
 * supplier data in lists of books, which otherwise would
 * generate unwanted traffic on S4 backends.
 */
extend projection CatalogService.ListOfBooks with {
  supplier
}
```

By default, services in CAP are compiled to views on database tables. In this case you want to create a table, so let's add the `@cds.persistence.table` annotation. And normally CAP would skip the compilation of an external service, so add `skip: false` to the annotation.
### Custom Handler

- Show effect in DB / or via UI

### Add `Supplier` Entity Using `extend`

> needs to be changed

The BuPa API comes with many fields, fields you not necessarily need. The next challenge is to use the fields according to your needs, which include limiting the fields to a subset of those that are available.

Go into your _srv/mashup.cds_ file and add a new entity based on the business partner API.

<!-- Do we want to keep the commented out sections? It's rather internal why it is not working.-->

```cds
using {API_BUSINESS_PARTNER as S4} from './external/API_BUSINESS_PARTNER';

extend service S4 with {
  entity Suppliers as projection on S4.A_BusinessPartner {
    key BusinessPartner as ID, BusinessPartnerFullName as name,
  // REVISIT: following is not supported so far in cds compiler...
  // to_BusinessPartnerAddress as city {
  //    CityCode as code,
  //    CityName as name
  // }
  // REVISIT: following is not supported so far in cqn2odata...
  // to_BusinessPartnerAddress.CityCode as city,
  // to_BusinessPartnerAddress.CityName as city_name,
  }
}

```
[Learn more about the `using` directive.](//cds/cdl/#using){:.learn-more} [Learn more about the `extend` directive.](//cds/cdl/#extend){:.learn-more}

This adds the supplier that is based on the business partner definition and maps fields from the API to the terminology I want to use. For example, I want to refer to suppliers by `name` instead of `BusinessPartnerFullName` in my models and rename it here.
### Sample Data

> Using the sample in branch `adding-suppliers`, the following is already done

It always helps to see sample data, when you're trying out new things. To add sample data to the service that is served out of an imported API, you need a _data_ folder next to the API. Create the folder _srv/external/data_ and add the following files:

_API_BUSINESS_PARTNER-A_BusinessPartner.csv_

```csv
BusinessPartner;BusinessPartnerFullName
ACME;A Company Making Everything
B4U;Books for You
S&C;Shakespeare & Co.
WSL;Waterstones
TLD;Thalia
PNG;Penguin Books

```

> Maybe add that later, when mashup has been made.

_API_BUSINESS_PARTNER-Suppliers.csv_

```csv
ID;name
ACME;A Company Making Everything
B4U;Books for You
S&C;Shakespeare & Co.
WSL;Waterstones
```

> Showcase the effect in a screenshot or so.

1. Add sample data, see the [_srv/external/data_ folder](https://github.com/SAP-samples/cloud-cap-samples/tree/adding-suppliers/suppliers/srv/external/data).

## Feature Details

### Legend

| Tag                                                                                                | Explanation                                       |
|----------------------------------------------------------------------------------------------------|---------------------------------------------------|
| &nbsp; &nbsp; <span style='color:#4FB81C' title='Supported'>&#10004;</span> | supported           |
| &nbsp; &nbsp; <span style='color:#aaa; font-size:90%' title='Not Supported'>&#10005;</span>                       | not supported |

### Supported Protocols

| Protocol                                                  | Java          | Node.js       |
| --------------------------------------------------------- | ------------- | ------------- |
| odata-v2                                                  | <span style='color:#4FB81C' title='Supported'>&#10004;</span>         | <span style='color:#4FB81C' title='Supported'>&#10004;</span>         |
| odata-v4                                                  | <span style='color:#4FB81C' title='Supported'>&#10004;</span>         | <span style='color:#4FB81C' title='Supported'>&#10004;</span>         |
| rest                                                      | <span style='color:#aaa; font-size:90%' title='Not Supported'>&#10005;</span>         | <span style='color:#4FB81C' title='Supported'>&#10004;</span>         |

::: tip
The Node.js runtime supports `odata` as an alias for `odata-v4` as well.
:::

### Querying API Features

| Feature                           | Java          | Node.js       |
| --------------------------------- | ------------- | ------------- |
| READ                              | <span style='color:#4FB81C' title='Supported'>&#10004;</span>     | <span style='color:#4FB81C' title='Supported'>&#10004;</span>     |
| INSERT/UPDATE/DELETE              | <span style='color:#4FB81C' title='Supported'>&#10004;</span>     | <span style='color:#4FB81C' title='Supported'>&#10004;</span>     |
| Actions                           | <span style='color:#4FB81C' title='Supported'>&#10004;</span>     | <span style='color:#4FB81C' title='Supported'>&#10004;</span>     |
| `columns`                         | <span style='color:#4FB81C' title='Supported'>&#10004;</span>     | <span style='color:#4FB81C' title='Supported'>&#10004;</span>     |
| `where`                           | <span style='color:#4FB81C' title='Supported'>&#10004;</span>     | <span style='color:#4FB81C' title='Supported'>&#10004;</span>     |
| `orderby`                         | <span style='color:#4FB81C' title='Supported'>&#10004;</span>     | <span style='color:#4FB81C' title='Supported'>&#10004;</span>     |
| `limit` (top & skip)              | <span style='color:#4FB81C' title='Supported'>&#10004;</span>     | <span style='color:#4FB81C' title='Supported'>&#10004;</span>     |
| `$apply` (groupedby, ...)         | <span style='color:#aaa; font-size:90%' title='Not Supported'>&#10005;</span> | <span style='color:#aaa; font-size:90%' title='Not Supported'>&#10005;</span> |
| `$search` (OData v4)              | <span style='color:#4FB81C' title='Supported'>&#10004;</span>     | <span style='color:#4FB81C' title='Supported'>&#10004;</span>     |
| `search` (SAP OData v2 extension) | <span style='color:#4FB81C' title='Supported'>&#10004;</span>     | <span style='color:#4FB81C' title='Supported'>&#10004;</span>     |

### Supported Projection Features

| Feature                                                   | Java          | Node.js       |
| --------------------------------------------------------- | ------------- | ------------- |
| Resolve projections to remote services                    | <span style='color:#4FB81C' title='Supported'>&#10004;</span>     | <span style='color:#4FB81C' title='Supported'>&#10004;</span>     |
| Resolve multiple levels of projections to remote services | <span style='color:#4FB81C' title='Supported'>&#10004;</span>     | <span style='color:#4FB81C' title='Supported'>&#10004;</span>     |
| Aliases for fields                                        | <span style='color:#4FB81C' title='Supported'>&#10004;</span>     | <span style='color:#4FB81C' title='Supported'>&#10004;</span>     |
| `excluding`                                               | <span style='color:#4FB81C' title='Supported'>&#10004;</span>     | <span style='color:#4FB81C' title='Supported'>&#10004;</span>     |
| Resolve associations (within the same remote service)     | <span style='color:#4FB81C' title='Supported'>&#10004;</span>     | <span style='color:#4FB81C' title='Supported'>&#10004;</span>     |
| Redirected associations                                   | <span style='color:#4FB81C' title='Supported'>&#10004;</span>     | <span style='color:#4FB81C' title='Supported'>&#10004;</span>     |
| Flatten associations                                      | <span style='color:#aaa; font-size:90%' title='Not Supported'>&#10005;</span> | <span style='color:#aaa; font-size:90%' title='Not Supported'>&#10005;</span> |
| `where` conditions                                        | <span style='color:#aaa; font-size:90%' title='Not Supported'>&#10005;</span> | <span style='color:#aaa; font-size:90%' title='Not Supported'>&#10005;</span> |
| `order by`                                                | <span style='color:#aaa; font-size:90%' title='Not Supported'>&#10005;</span> | <span style='color:#aaa; font-size:90%' title='Not Supported'>&#10005;</span> |
| Infix filter for associations                             | <span style='color:#aaa; font-size:90%' title='Not Supported'>&#10005;</span> | <span style='color:#aaa; font-size:90%' title='Not Supported'>&#10005;</span> |
| Model Associations with mixins                            | <span style='color:#4FB81C' title='Supported'>&#10004;</span>     | <span style='color:#4FB81C' title='Supported'>&#10004;</span>     |

### Supported Features for Application Defined Destinations

The following properties and authentication types are supported for *[application defined destinations](#app-defined-destinations)*:

#### Properties {: #destination-properties}

These destination properties are fully supported by both, the Java and the Node.js runtime.
::: tip
This list specifies the properties for application defined destinations.
:::

| Properties                 | Description                               |
| -------------------------- | ----------------------------------------- |
| `url`                      |                                           |
| `authentication`           | Authentication type                       |
| `username`                 | User name for BasicAuthentication         |
| `password`                 | Password for BasicAuthentication          |
| `headers`                  | Map of HTTP headers                       |
| `queries`                  | Map of URL parameters                     |
| `forwardAuthToken`         | [Forward auth token](#forward-auth-token) |

[Destination Type in SAP Cloud SDK for JavaScript](https://sap.github.io/cloud-sdk/api/v2/interfaces/sap_cloud_sdk_connectivity.Destination.html){:.learn-more}
[HttpDestination Type in SAP Cloud SDK for Java](https://help.sap.com/doc/82a32040212742019ce79dda40f789b9/1.0/en-US/index.html){:.learn-more}

#### Authentication Types

| Authentication Types    | Java                                                                 | Node.js                                |
| ----------------------- | -------------------------------------------------------------------- | -------------------------------------- |
| NoAuthentication        | <span style='color:#4FB81C' title='Supported'>&#10004;</span>                                                            | <span style='color:#4FB81C' title='Supported'>&#10004;</span>                              |
| BasicAuthentication     | <span style='color:#4FB81C' title='Supported'>&#10004;</span>                                                            | <span style='color:#4FB81C' title='Supported'>&#10004;</span>                              |
| TokenForwarding         | <span style='color:#4FB81C' title='Supported'>&#10004;</span>                                                            | <span style='color:#aaa; font-size:90%' title='Not Supported'>&#10005;</span>&nbsp;&nbsp;(use `forwardAuthToken`) |
| OAuth2ClientCredentials | [code only](../java/remote-services#oauth2-client-credentials)      | <span style='color:#aaa; font-size:90%' title='Not Supported'>&#10005;</span>                          |
| UserTokenAuthentication | [code only](../java/remote-services#user-token-authentication)      | <span style='color:#aaa; font-size:90%' title='Not Supported'>&#10005;</span>                          |
