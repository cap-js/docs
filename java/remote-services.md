---
synopsis: >
  Remote Services are CQN-based clients to remote APIs that a CAP application consumes. This section describes how to configure and use these services.
status: released
uacp: Used as link target from Help Portal at https://help.sap.com/products/BTP/65de2977205c403bbc107264b8eccf4b/9186ed9ab00842e1a31309ff1be38792.html
---
<!--- Migrated: @external/java/remote-services.md -> @external/java/remote-services.md -->

# Remote Services
<style scoped>
  h1:before {
    content: "Java"; display: block; font-size: 60%; margin: 0 0 .2em;
  }
</style>

{{ $frontmatter.synopsis }}


## Enabling Remote Services

[Remote Services](consumption-api#remote-services) accept CQN statements and transform these into API calls on remote endpoints. The CAP Java SDK supports _Remote Services_ for OData V2 and V4 APIs out of the box.
The CQN query APIs enable [late-cut microservices](../guides/providing-services#late-cut-microservices) and simplified mocking capabilities. Regarding multitenant applications, these APIs keep you extensible, even towards remote APIs. In addition, they free developers from having to map CQN to OData themselves.

Cross-cutting aspects like security are provided by configuration. Applications do not need to provide additional code. The CAP Java SDK leverages the [SAP Cloud SDK](https://sap.github.io/cloud-sdk) and in particular its destination capabilities to cover these aspects. Destinations in Cloud SDK are the means to express and define the remote endpoint including authentication details. Cloud SDK destinations provide a high flexibility of different data sources. They can be resolved from BTP Destination Service, BTP Service Bindings or [programmatic destinations](#programmatic-destination-registration), registered by a CAP application in code. The CAP application can choose the best fitting option for their scenario. CAP nicely integrates with Cloud SDK, for example automatic propagation of tenant and user information from the _Request Context_ to the Cloud SDK is ensured.

<img src="./assets/remote%20services.drawio.svg" width="500px" class="mute-dark" alt="This graphic depicts the integration of SAP Cloud SDK into SAP CAP Java.">

To enable _Remote Services_ in an application, add the following Maven dependency to your project:

```xml
<dependency>
    <groupId>com.sap.cds</groupId>
    <artifactId>cds-feature-remote-odata</artifactId>
    <scope>runtime</scope>
</dependency>
```

CAP's clear recommendation is to use _Remote Services_ over directly using the SAP Cloud SDK. However, if you cannot leverage CQN-based _Remote Services_ because the remote endpoint is for example REST-based, refer to [native service consumption](#native-service-consumption) for details.

::: tip
To learn more about how to use _Remote Services_ end to end read the [Consuming Services cookbook](../guides/using-services).
:::

## Configuring Remote Services

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

Remote Services use a CDS service definition from the CDS model as specification of the remote API. This API specification is required in order to properly translate CQN statements into respective OData V2 and V4 requests.

By default the CDS service definition is looked up in the CDS model using the name of the _Remote Service_.

The `type` property defines the protocol used by the remote API. The CAP Java SDK currently supports `odata-v4` (default) or `odata-v2`.

::: tip
You can use the `cds import` command to generate a CDS service definition from an EDMX API specification.
To learn more about this, have a look at section [Importing Service Definitions](../guides/using-services#import-api).
:::

[Learn about all `cds.remote.services` configuration possibilities in our **CDS Properties Reference**.](../java/development/properties#cds-remote-services){.learn-more}

### Destination-based Scenarios { #destination-based-scenarios }
If your _Remote Service_ is running outside the BTP, you typically need to separately obtain the URL and additional metadata from the service provide. You can leverage BTP Destinations or programmatically register a destination with Cloud SDK to persist them for usage in your CAP application.

Based on the following configuration, a destination with name `s4-business-partner-api` will be looked up via the Cloud SDK:

```yaml
cds:
  remote.services:
  - name: "API_BUSINESS_PARTNER"
    type: "odata-v2"
    destination:
      name: s4-business-partner-api
```

The CAP Java SDK obtains the destination for a _Remote Service_ from the `DestinationAccessor` using the name, that is configured in the _Remote Service_'s destination configuration.

If you're using the SAP BTP Destination Service, this is the name you used when you defined the destination there. In order to resolve the destination from the correct source, [additional Cloud SDK dependencies](#cloud-sdk-dependencies) will be required.

[Learn more about destinations in the **SAP Cloud SDK documentation**.](https://sap.github.io/cloud-sdk/docs/java/features/connectivity/sdk-connectivity-destination-service){.learn-more}

As a variant to the described scenario, it is possible enable multi-tenant CAP applications to lookup the BTP Destination from the subaccount of the subscriber tenant instead of the subaccount in which the CAP application is deployed. This allows you to provide tenant-specific callbacks as extension use cases.  
The subscriber will deploy an endpoint for example as a dedicated CAP application in their subscriber account and store the necessary URL and credentials in a BTP destination in his subaccount.

```yaml
cds:
  remote.services:
  - name: "API_BUSINESS_PARTNER"
    type: "odata-v2"
    destination:
      name: s4-business-partner-api
      retrievalStrategy: "CurrentTenant"
```

In this configuration, a destination with name `s4-business-partner-api`will be looked up via the Cloud SDK. The additional parameter `retrievalStrategy: CurrentTenant` ensures that the destination will be looked up from the subscriber account if the tenant is correctly set in the Request Context.
As a pre-requisite for destination lookup in subscriber accounts, the CAP application need to define a dependency to the Destination service for their subscriptions e.g. in the SaaS Registry. This can be enabled by setting the `cds.multiTenancy.dependences.destination` to `true` in the configuration.

Retrieval strategies are part of a set of configuration options provided by Cloud SDK which are exposed by CAP Java as part of the configuration for _Remote Services_. For details refer to section about [destination strategies](#destination-strategies).

#### Service Binding-based Scenarios
Service Binding-based _Remote Services_ are the desired solution if the _Remote Service_ is running on the BTP. The CAP Java SDK will extract the relevant information from the service binding to connect to the _Remote Service_. Service binding-based _Remote Services_ have the advantage over destination-based _Remote Services_ of simpler usage. There is no need to externalize configuration (e.g. credentials) for example into a BTP destination. Also, aspects like credential rotation is provided out-of-the box.

In this scenario, the _Remote Service_ is running as another micro service within the the same SaaS application. Both the calling CAP application and the _Remote Service_ are bound to the same (shared) xsuaa service instance and, thus, accept jwt tokens issued by this xsuaa instance.

```yaml
cds:
  remote.services:
  - name: "API_BUSINESS_PARTNER"
    binding:
      name: shared-xsuaa
      onBehalfOf: currentUser
    options:
      url: https://url-of-the-second-cap-application
```

In the given example, both CAP applications need to be bound to the same service instance `shared-xsuaa`. While service bindings typically only provide authentication details, they don´t provide the concrete authentication strategy (e.g. technical/system user or named user flow). Specifically, xsauua instances also don´t expose the URL to the _Remote Service_. Thus, these need to be explicitly defined in the configuration. 
The parameter `onBehalfOf` in the given example is set to `currentUser` which means that the user that is bound to the current Request Context will be used regardless if this is a technical/system or named user. The property is optional with default value `currentUser`. Other options are `systemUser`and `systemUserProvider` which allow an explicit switch to a technical user in the current tenant respectively the provider tenant. `systemUserProvider` can be especially used if you need to establish an internal communication channel that is not accessible for subscriber tenants.

As the URL typically is not known at development time, it can be alternatively defined as an environment variable `CDS_REMOTE_SERVICES_<name>_OPTIONS_URL`.

In a variant of this scenario, the _Remote Service_ is exposed by a BTP Service itself (ie. Re-use service). Typically, this exposure happens by the means of a service broker so that the consuming CAP application can create service instances of the BTP Service.

The CAP application requires a service binding to this BTP service in order to consume the remote API as a _Remote Service_. In contrast to pure xsuaa instances, service instances of BTP Services which expose remote APIs, their service binding will additionally expose the URL of the remote API. Thus, there is no need to explicitly define it as part of the `application.yaml` like in the following example:

```yaml
cds:
  remote.services:
  - name: "API_BUSINESS_PARTNER"
    binding:
      name: biz_partner_svc
```

In most cases, CAP Java SDK does not understand the structure of the specific service binding. As the CAP Java SDK internally leverages Cloud SDK, it is required that the CAP application contributes a mapping by the means of a Cloud SDK´s `PropertySupplier` which gets registered with the Cloud SDK once for example on application startup.

```java
static {
    OAuth2ServiceBindingDestinationLoader.registerPropertySupplier(
        options -> options.getServiceBinding().getTags().contains("<tag_biz_partner_svc>"),
            XsuaaOAuth2PropertySupplier::new);
}
```

The parameter `<tag_biz_partner_svc>` needs to be replaced by the concrete name of the tag provided in the service binding. Alternatively, a check on the service name can be chosen as well. 

### Overriding the CDS Service Definition

As mentioned before, the CDS service definition is, by default, looked up in the CDS model using the name of the _Remote Service_.

However, the name of the _Remote Service_ needs to be unique, as it's also used to look up the service in Java.
Therefore, it is also possible to explicitly configure the name of the CDS service definition from the CDS model using the `model` property.
This is especially useful, when creating multiple _Remote Services_ for the same API with different destinations:

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

The destination of a _Remote Service_ is basically an advanced URL, that can carry additional metadata like, for example, the authentication information for the remote endpoint.
As described before, the destination can be resolved for example from a BTP Destination or a BTP Service bound to the CAP application.

In all cases, the configuration needs to provide the URL to the OData V2 or V4 service, that should be used by the _Remote Service_.
This service URL can be built from three parts:

1. The URL provided by the destination or the service binding configuration.
1. An optional URL suffix provided in the _Remote Service_ destination configuration under the `suffix` property.
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

## Using Remote Services

_Remote Services_ can be used in your CAP application just like any other [service, that accepts CQN queries](consumption-api#cdsservices):

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
To learn more about how to build and run CQN queries, see sections [Building CQN Queries](query-api) and [Executing CQN Queries](query-execution).
:::

Keep in mind, that _Remote Services_ are simply clients to remote APIs.
CAP doesn't automatically forward CQN queries to these services. Developers need to explicitly call and use these _Remote Services_ in their code.
However, as _Remote Services_ are based on the common CQN query APIs it's easy to use them in event handlers of your [Application Services](consumption-api#application-services).
::: warning
In case data from _Remote Services_ should be combined with data from the database custom coding is required.
Refer to the [Integrate and Extend guide](../guides/using-services#integrate-and-extend) for more details.
:::

## Additional Cloud SDK Integration

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

[Find out how to register destinations for different authentication types](#register-destinations){.learn-more} [Learn more about using destinations](../guides/using-services#using-destinations){.learn-more}

Note that you can leverage Spring Boot's configuration possibilities to inject credentials into the destination configuration.
The same mechanism can also be used for the URL of the destination by also reading it from your application configuration (for example environment variables or _application.yaml_).
This is especially useful when integrating micro-services, which may have different URLs in productive environments and test environments.

### SAP Cloud SDK Dependencies {#cloud-sdk-dependencies}

The CAP Java SDK only includes the minimum SAP Cloud SDK dependencies required out of the box.
In case you want to leverage features from SAP Cloud SDK, like the [programmatic destination registration](#programmatic-destination-registration) or integration with SAP BTP Destination Service, you need to add additional dependencies.

It's recommended to add the SAP Cloud SDK BOM to the dependency management section of your application's parent POM.
If you are also using the CDS Services BOM or the Spring Boot dependencies BOM, it's recommended to add the SAP Cloud SDK BOM after these:

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

## Service Consumption via Cloud SDK { #service-consumption }

If you need to call an endpoint which you cannot consume as a _Remote Service_ you can fall back to leverage native Cloud SDK APIs. However, usage of CAP´s _Remote Service_ is encouraged whenever possible.  

### Destination-based consumption

Describe `DestinationAccessor` and `HttpClientAccessor`...

### Service Binding-based consumption

Describe `PropertySupplier`, `ServiceBindingDestinationLoader` and `HttpClientAccessor`

```java
destination = ServiceBindingDestinationLoader.defaultLoaderChain().getDestination(
ServiceBindingDestinationOptions.forService(binding).onBehalfOf(OnBehalfOf.TECHNICAL_USER_CURRENT_TENANT).build());
```

## Code Examples

### Register Destinations

The following example code snippets show how to programmatically register a destination for different authentication types.

#### Basic Authentication

```java
DefaultHttpDestination
	.builder("https://example.org")
	.user("user")
	.password("password")
	.name("my-destination").build();
```

#### Token Forwarding

```java
DefaultHttpDestination
	.builder("https://example.org")
	.authenticationType(AuthenticationType.TOKEN_FORWARDING)
	.name("my-destination").build();
```

#### OAuth2 Client Credentials { #oauth2-client-credentials}

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

#### User Token Authentication { #user-token-authentication}

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
