---
synopsis: >
  Remote Services are CQN-based clients to remote APIs that a CAP application consumes. This section describes how to configure and use these services.
status: released
redirect_from: java/remote-services
uacp: Used as link target from Help Portal at https://help.sap.com/products/BTP/65de2977205c403bbc107264b8eccf4b/9186ed9ab00842e1a31309ff1be38792.html
---

# Remote Services
<style scoped>
  h1:before {
    content: "Java"; display: block; font-size: 60%; margin: 0 0 .2em;
  }
</style>

{{ $frontmatter.synopsis }}

The CAP Java SDK supports _Remote Services_ for OData V2 and V4 APIs out of the box.
The CQN query APIs enable [late-cut microservices](../../guides/providing-services#late-cut-microservices) with simplified mocking capabilities. Regarding multitenant applications, these APIs keep you extensible, even towards remote APIs. In addition, they free developers from having to map CQN to OData themselves.

Cross-cutting aspects like security are provided by configuration. Applications do not need to provide additional code. The CAP Java SDK leverages the [SAP Cloud SDK](https://sap.github.io/cloud-sdk) and in particular its destination capabilities to cover these aspects. 

Destinations in the Cloud SDK are the means to express and define connectivity to a remote endpoint including authentication details. Cloud SDK destinations can be created from various sources such as BTP Destination Service or BTP Service Bindings. They can also be defined and registered [programmatically](#programmatic-destination-registration) in code. The application can choose the best fitting option for their scenario. Every Remote Service internally uses a destination for connectivity.

On top of that CAP integrates nicely with Cloud SDK, for example, ensuring automatic propagation of tenant and user information from the _Request Context_ to the Cloud SDK.

<img src="../assets/remote%20services.drawio.svg" width="700px" class="mute-dark" alt="This graphic depicts the integration of SAP Cloud SDK into SAP CAP Java.">

CAP's clear recommendation is to use _Remote Services_ over directly using the SAP Cloud SDK. However, if you can't leverage CQN-based _Remote Services_, refer to [native consumption with Cloud SDK](#native-consumption) for details.

::: tip
To learn more about how to use _Remote Services_ end to end read the [Consuming Services cookbook](../../guides/using-services).
:::

## Configuring Remote Services

To enable _Remote Services_ for OData V2 or V4 APIs in an application, add the following Maven dependency to your project:

```xml
<dependency>
    <groupId>com.sap.cds</groupId>
    <artifactId>cds-feature-remote-odata</artifactId>
    <scope>runtime</scope>
</dependency>
```
_Remote Services_ need to be configured explicitly in your application configuration. The configuration needs to define two main aspects:

1. The CDS service definition of the remote API from the CDS model.
1. The (BTP or programmatic) destination or service binding of the remote API and its protocol type.

The following example, shows how you can configure _Remote Services_ in Spring Boot's _application.yaml_ based on a BTP destination:

```yaml
cds:
  remote.services:
  - name: "API_BUSINESS_PARTNER"
    type: "odata-v2"
    destination:
      name: "s4-business-partner-api"
```

Remote Services use a CDS service definition from the CDS model as a specification of the remote API. This API specification is required to properly translate CQN statements into respective OData V2 and V4 requests.

By default the CDS service definition is looked up in the CDS model using the name of the _Remote Service_.

The `type` property defines the protocol used by the remote API. The CAP Java SDK currently supports `odata-v4` (default) or `odata-v2`.

::: tip
You can use the `cds import` command to generate a CDS service definition from an EDMX API specification.
To learn more about this, have a look at the section [Importing Service Definitions](../../guides/using-services#import-api).
:::

[Learn about all `cds.remote.services` configuration possibilities in our **CDS Properties Reference**.](../developing-applications/properties#cds-remote-services){.learn-more}

### Using BTP Destinations { #destination-based-scenarios }
If your _remote API_ is running outside SAP BTP, you typically need to separately obtain the URL and additional metadata like credentials from the service provider. You can leverage BTP destinations or programmatically register a destination with Cloud SDK to persist them for usage in your CAP application.

Based on the following configuration, a destination with name `s4-business-partner-api` is looked up using the Cloud SDK:

```yaml
cds:
  remote.services:
  - name: "API_BUSINESS_PARTNER"
    type: "odata-v2"
    destination:
      name: s4-business-partner-api
```

The CAP Java SDK obtains the destination for a _Remote Service_ from the `DestinationAccessor` using the name that is configured in the _Remote Service_'s destination configuration.

If you're using the SAP BTP Destination Service, this is the name you used when you defined the destination there. To properly resolve the destination from the correct source (for example, BTP Destination Service, programmatically registered destination), [additional Cloud SDK dependencies](#cloud-sdk-dependencies) are required.

In multitenant scenarios, the BTP Destination Service tries to look up the destination from the subaccount of the current tenant, set on the `RequestContext`. This is not restricted to subscriber tenants, but also includes the provider tenant.

::: tip
As a prerequisite for destination lookup in subscriber accounts, the CAP application needs to define a dependency to the Destination service for their subscriptions, for example, in the SaaS registry. This can be enabled by setting the `cds.multiTenancy.dependencies.destination` to `true` in the configuration.
:::

[Learn more about destinations in the **SAP Cloud SDK documentation**.](https://sap.github.io/cloud-sdk/docs/java/features/connectivity/sdk-connectivity-destination-service){.learn-more}

As a variant to the described scenario, it's possible to restrict the lookup to either subscriber tenants or the provider tenant. In the following example, it's ensured that the destination is only looked up from the current subscriber tenant by additional parameter `retrievalStrategy: "AlwaysSubscriber"`. An error would occur at runtime, if the subscriber doesn't define a corresponding destination, even if the provider tenant contained a destination with the same name.

```yaml
cds:
  remote.services:
  - name: "API_BUSINESS_PARTNER"
    type: "odata-v2"
    destination:
      name: s4-business-partner-api
      retrievalStrategy: "AlwaysSubscriber"
```

Retrieval strategies are part of a set of configuration options provided by the Cloud SDK, which are exposed by CAP Java as part of the configuration for _Remote Services_. For details refer to the section about [destination strategies](#destination-strategies).

### Using BTP Service Bindings { #service-binding-based-scenarios }

If the remote API is running on SAP BTP, it's likely that you can leverage Service Binding-based _Remote Services_. 
The CAP Java SDK extracts the relevant information from the service binding to connect to the remote API. The advantage of service-binding-based _Remote Services_ is the simpler usage. 
A service binding abstracts from several aspects of remote service communication. For instance, it provides authentication information and the URL of the service. 
In contrast to BTP destinations in general, it can be created and refreshed as part of the application lifecycle, that is, application deployment.
Hence, the location and security aspects of remote services are transparent to CAP applications in the case of service bindings.

#### Binding to Local Service

In the following example, the remote API is running as another CAP application within the same SaaS application. Both, the calling CAP application and the remote API, are bound to the same (shared) XSUAA service instance and accept JWT tokens issued by the single XSUAA instance.

```yaml
cds:
  remote.services:
  - name: "OtherCapService"
    binding:
      name: shared-xsuaa
      onBehalfOf: currentUser
      options:
        url: https://url-of-the-second-cap-application
```

`shared-xsuaa` is the name of the xsuaa service instance that both CAP applications are bound to. 

While service bindings typically provide authentication details, they don't provide information about the user propagation strategy, for example, system user or named user flow. XSUAA instances also can't expose the URL of the remote API. Thus, this information needs to be explicitly defined in the configuration of the _Remote Service_.

The parameter `onBehalfOf` in the given example is set to `currentUser`, which means that the user of the current [Request Context](/java/event-handlers/request-contexts) will be used - regardless if this is a system user or named user. 
The following options are available:

- `currentUser` to stick to the user of the current Request Context (default)
- `systemUser` to explicitly switch to the underlying system user of the current subscriber tenant (technical user flow).
- `systemUserProvider` to explicitly switch to the system user of the provider tenant (technical user flow).

`systemUserProvider` is especially helpful when you need to establish an internal communication channel that is not accessible for subscriber tenants.

As the URL typically is not known at development time, it can be alternatively defined as an environment variable `CDS_REMOTE_SERVICES_<name>_OPTIONS_URL`.

#### Binding to a Reuse Service

In a variant of this scenario, the _Remote Service_ is exposed by a BTP Service itself, which is exposed as a reuse service. 
Typically, this exposure happens by the means of a service broker so that the consuming CAP application can create service instances of the BTP Service.

The CAP application requires a service binding to this BTP service to consume the remote API as a _Remote Service_. In contrast to pure XSUAA instances, service instances of BTP Services exposing remote APIs additionally expose the URL of the remote API in their service binding. 
So you can omit the URL from the configuration in the `application.yaml`, like in the following example:

```yaml
cds:
  remote.services:
  - name: "BizParterService"
    binding:
      name: biz_partner_svc
```

In specific cases, SAP Cloud SDK doesn't understand the service binding structure of the specific BTP Service and it's required to contribute a mapping by the means of Cloud SDK´s `PropertySupplier`. 
This `PropertySupplier` needs to be registered with the Cloud SDK once at application startup.

```java
static {
    OAuth2ServiceBindingDestinationLoader.registerPropertySupplier(
        options -> options.getServiceBinding().getTags().contains("<tag_biz_partner_svc>"),
            BizPartnerOAuth2PropertySupplier::new);
}
```

The parameter `<tag_biz_partner_svc>` needs to be replaced by the concrete name of the tag provided in the binding of the BTP Service. Alternatively, a check on the service name can be chosen as well. The class `BizPartnerOAuth2PropertySupplier` needs to be provided by you extending the Cloud SDK base class `DefaultOAuth2PropertySupplier`.

[Learn more about registering OAuth2PropertySupplier in the **SAP Cloud SDK documentation**.](https://sap.github.io/cloud-sdk/docs/java/features/connectivity/service-bindings#customization){.learn-more}

### Configuring CDS Service Name

As mentioned before, the CDS service definition is, by default, looked up in the CDS model using the name of the _Remote Service_.

However, the name of the _Remote Service_ needs to be unique, as it's also used to look up the service in Java.
Therefore, it's possible to explicitly configure the name of the CDS service definition from the CDS model using the `model` property.
This is especially useful when creating multiple _Remote Services_ for the same API with different destinations:

```yaml
cds:
  remote.services:
  - name: "bupa-abc"
    model: "API_BUSINESS_PARTNER"
    destination:
      name: "s4-business-partner-api-abc"
  - name: "bupa-def"
    model: "API_BUSINESS_PARTNER"
    destination:
      name: "s4-business-partner-api-def"
```

### Configuring the URL

The destination of a _Remote Service_ is basically an advanced URL that can carry additional metadata like, for example, the authentication information for the remote endpoint.
As described before, the destination can be resolved, for example, from a BTP Destination or a BTP Service bound to the CAP application.

In all cases, the configuration needs to provide the URL to the OData V2 or V4 service, that should be used by the _Remote Service_.
This service URL can be built from three parts:

1. The URL provided by the destination or the service binding configuration.
1. An optional URL suffix provided in the _Remote Service_ http configuration under the `suffix` property.
1. The name of the service, either obtained from the optional `service` configuration property or the fully qualified name of the CDS service definition.

Consider this example:

```yaml
cds:
  remote.services:
  - name: "API_BUSINESS_PARTNER"
    http:
      suffix: "/sap/opu/odata/sap"
    destination:
      name: s4-business-partner-api
```

In this case, the destination with name `s4-business-partner-api` would be obtained from the `DestinationAccessor`.
Given that this destination holds the URL `https://s4.sap.com`, the resulting service URL for OData requests would be `https://s4.sap.com/sap/opu/odata/sap/API_BUSINESS_PARTNER`.

## Consuming Remote Services

_Remote Services_ can be used in your CAP application just like any other [service that accepts CQN queries](/java/cqn-services/):

```java
@Autowired
@Qualifier(ApiBusinessPartner_.CDS_NAME)
CqnService bupa;

CqnSelect select = Select.from(ABusinessPartnerAddress_.class)
    .where(a -> a.BusinessPartner().eq("4711"));

ABusinessPartnerAddress address = bupa.run(select)
    .single(ABusinessPartnerAddress.class);
```
::: tip
To learn more about how to build and run CQN queries, see sections [Building CQN Queries](../working-with-cql/query-api) and [Executing CQN Queries](../working-with-cql/query-execution).
:::

Keep in mind that _Remote Services_ are simply clients to remote APIs.
CAP doesn't automatically forward CQN queries to these services. Developers need to explicitly call and use these _Remote Services_ in their code.
However, as _Remote Services_ are based on the common CQN query APIs it's easy to use them in event handlers of your [Application Services](application-services).
::: warning
In case data from _Remote Services_ should be combined with data from the database custom coding is required.
Refer to the [Integrate and Extend guide](../../guides/using-services#integrate-and-extend) for more details.
:::

## Cloud SDK Integration

### Maven Dependencies {#cloud-sdk-dependencies}

The CAP Java SDK only includes the minimum SAP Cloud SDK dependencies required out of the box.
In case you want to leverage features from SAP Cloud SDK, like the [programmatic destination registration](#programmatic-destination-registration) or integration with SAP BTP Destination Service, you need to add additional dependencies.

It's recommended to add the SAP Cloud SDK BOM to the dependency management section of your application's parent POM.
If you're also using the CDS Services BOM or the Spring Boot dependencies BOM, it's recommended to add the SAP Cloud SDK BOM after these:

```xml
<dependencyManagement>
    <!-- CDS Services BOM -->
    <!-- Spring Boot dependencies BOM -->
    <dependencies>
        <dependency>
            <groupId>com.sap.cloud.sdk</groupId>
            <artifactId>sdk-bom</artifactId>
            <version>use-latest-version-here</version>
            <type>pom</type>
            <scope>import</scope>
        </dependency>
    </dependencies>
</dependencyManagement>
```

[Learn more about dependency management of **SAP Cloud SDK**.](https://sap.github.io/cloud-sdk/docs/java/guides/manage-dependencies/){.learn-more}

To enable [programmatic destination registration](#programmatic-destination-registration), add this additional dependency to your project:

```xml
<dependency>
    <groupId>com.sap.cloud.sdk.cloudplatform</groupId>
    <artifactId>cloudplatform-connectivity</artifactId>
</dependency>
```

To integrate with SAP BTP Destination Service on Cloud Foundry, add this additional dependency to your project:

```xml
<dependency>
    <groupId>com.sap.cloud.sdk.cloudplatform</groupId>
    <artifactId>scp-cf</artifactId>
</dependency>
```

### Configuring Destination Strategies { #destination-strategies }

When loading destinations from SAP BTP Destination Service, you can specify a [destination retrieval strategy](https://sap.github.io/cloud-sdk/docs/java/features/connectivity/sdk-connectivity-destination-service#retrieval-strategy-options) and a [token exchange strategy](https://sap.github.io/cloud-sdk/docs/java/features/connectivity/sdk-connectivity-destination-service#token-exchange-options).

These strategies can be set in the destination configuration of the _Remote Service_:

```yml
cds:
  remote.services:
  - name: "API_BUSINESS_PARTNER"
    destination:
      name: "s4-business-partner-api"
      retrievalStrategy: "AlwaysProvider"
      tokenExchangeStrategy: "ExchangeOnly"
```

::: tip
Values for destination strategies have to be provided in pascal case.
:::

### Programmatic Destination Registration

If you don't require to use the SAP BTP Destination Service, you can also programmatically build destinations and add them to the `DestinationAccessor`.
You can easily register an event handler that is executed during startup of the application and build custom destinations:

```java
@Component
@ServiceName(ApplicationLifecycleService.DEFAULT_NAME)
public class DestinationConfiguration implements EventHandler {

    @Value("${api-hub.api-key:}")
    private String apiKey;

    @Before(event = ApplicationLifecycleService.EVENT_APPLICATION_PREPARED)
    public void initializeDestinations() {
        if(apiKey != null && !apiKey.isEmpty()) {
            DefaultHttpDestination httpDestination = DefaultHttpDestination
                .builder("https://sandbox.api.sap.com/s4hanacloud")
                .header("APIKey", apiKey)
                .name("s4-business-partner-api").build();

            DestinationAccessor.prependDestinationLoader(
                new DefaultDestinationLoader().registerDestination(httpDestination));
        }
    }

}
```

[Find out how to register destinations for different authentication types](#register-destinations){.learn-more} 
[Learn more about using destinations](../../guides/using-services#using-destinations){.learn-more}

Note that you can leverage Spring Boot's configuration possibilities to inject credentials into the destination configuration.
The same mechanism can also be used for the URL of the destination by also reading it from your application configuration (for example environment variables or _application.yaml_).
This is especially useful when integrating micro-services, which may have different URLs in productive environments and test environments.

## Native Service Consumption { #native-consumption }

If you need to call an endpoint that you cannot consume as a _Remote Service_, you can fall back to leverage Cloud SDK APIs. Based on the Cloud SDK´s `HttpClientAccessor` API, you can resolve an `HttpClient` that you can use to execute plain HTTP requests against the remote API. 

However, this involves low-level operations like payload de-/serialization. Usage of CAP´s _Remote Service_ is encouraged whenever possible to free the developer from these.

### Using BTP Destinations

If the URL and credentials of the remote API is configured as a BTP or programmatic destination, you can use Cloud SDK´s `DestinationAccessor` API to load the destination based on its name. In a second step, `HttpClientAccessor` is used to create an instance of `HttpClient`:

```java
HttpDestination destination = DestinationAccessor.getDestination("destinationName").asHttp();
HttpClient httpClient = HttpClientAccessor.getHttpClient(destination);
...
```

[Learn more about HttpClientAccessor in the **SAP Cloud SDK documentation**.](https://sap.github.io/cloud-sdk/docs/java/features/connectivity/http-client){.learn-more}

### Using BTP Service Bindings
If the URL and credentials of the remote API is available as a service binding, you can create a Cloud SDK destination for the service binding using the `ServiceBindingDestinationLoader` API. Based on this, it's again possible to create an instance of `HttpClient` using the `HttpClientAccessor`:

```java
ServiceBinding binding = ...;
HttpDestination destination = ServiceBindingDestinationLoader.defaultLoaderChain().getDestination(
        ServiceBindingDestinationOptions.forService(binding).onBehalfOf(OnBehalfOf.TECHNICAL_USER_CURRENT_TENANT).build());

HttpClient httpClient = HttpClientAccessor.getHttpClient(destination);
...
```

[Find out how to register destinations for different authentication types](#register-destinations){.learn-more}
[Learn more about HttpClientAccessor in the **SAP Cloud SDK documentation**.](https://sap.github.io/cloud-sdk/docs/java/features/connectivity/http-client){.learn-more}

To be able to resolve a service binding into a Cloud SDK destination, a `OAuth2PropertySupplier` needs to be registered with Cloud SDK.

```java
static {
    OAuth2ServiceBindingDestinationLoader.registerPropertySupplier(
        options -> options.getServiceBinding().getTags().contains("<tag_biz_partner_svc>"),
            BizPartnerOAuth2PropertySupplier::new);
}
```

[Learn more about registering OAuth2PropertySupplier in the **SAP Cloud SDK documentation**.](https://sap.github.io/cloud-sdk/docs/java/features/connectivity/service-bindings#customization){.learn-more}

### Register Destinations

The following example code snippets show how to programmatically register a destination for different authentication types.

Use the following example if the remote API supports basic authentication:
```java
DefaultHttpDestination
        .builder("https://example.org")
	.user("user")
	.password("password")
	.name("my-destination").build();
```

Use the following example if you can directly forward the token from the current security context:
```java
DefaultHttpDestination
        .builder("https://example.org")
	.authenticationType(AuthenticationType.TOKEN_FORWARDING)
	.name("my-destination").build();
```

Use the following example if you want to call the remote API using a technical user:
```java
ClientCredentials clientCredentials =
        new ClientCredentials("clientid", "clientsecret");

OAuth2DestinationBuilder
        .forTargetUrl("https://example.org")
        .withTokenEndpoint("https://xsuaa.url")
        .withClient(clientCredentials, OnBehalfOf.TECHNICAL_USER_CURRENT_TENANT)
        .withProperties(Map.of("name", "my-destination"))
        .build();
```

Use the following example if you need to exchange the token from the security context (that is, user token exchange):
```java
ClientCredentials clientCredentials =
        new ClientCredentials("clientid", "clientsecret");

OAuth2DestinationBuilder
        .forTargetUrl("https://example.org")
        .withTokenEndpoint("https://xsuaa.url")
        .withClient(clientCredentials, OnBehalfOf.NAMED_USER_CURRENT_TENANT)
        .withProperties(Map.of("name", "my-destination"))
        .build();
```
