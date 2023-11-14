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

[Remote Services](consumption-api#remote-services) accept CQN statements and transform these into API calls on remote endpoints.
The CAP Java SDK supports _Remote Services_ for OData V2 and V4 APIs out of the box.
To enable these capabilities in an application, add the following Maven dependency to your project:

```xml
<dependency>
    <groupId>com.sap.cds</groupId>
    <artifactId>cds-feature-remote-odata</artifactId>
    <scope>runtime</scope>
</dependency>
```

To execute HTTP requests, CAP leverages the [SAP Cloud SDK](https://sap.github.io/cloud-sdk).
After adding the dependency mentioned above, both libraries integrate seamlessly with each other.
CAP ensures to automatically propagate tenant and user information from the _Request Context_ to the Cloud SDK.

CAP's clear recommendation is to use _Remote Services_ over directly leveraging the SAP Cloud SDK.
The CQN query APIs enable [late-cut microservices](../guides/providing-services#late-cut-microservices) and simplified mocking capabilities. Regarding multitenant applications, these APIs keep you extensible, even towards remote APIs. In addition, they free developers from having to map CQN to OData themselves.
::: tip
To learn more about how to use _Remote Services_ end to end read the [Consuming Services cookbook](../guides/using-services).
:::

## Configuring Remote Services

_Remote Services_ need to be configured explicitly in your application configuration. The configuration needs to define two main aspects:

1. The CDS service definition of the remote API from the CDS model.
1. The destination of the remote API and its protocol type.

The following example, shows how you can configure _Remote Services_ in Spring Boot's _application.yaml_:

```yaml
cds:
  remote.services:
  - name: "API_BUSINESS_PARTNER"
    destination:
      name: "s4-business-partner-api"
      type: "odata-v2"
```

[Learn about all `cds.remote.services` configuration possibilities in our **CDS Properties Reference**.](../java/development/properties#cds-remote-services){.learn-more}

### Configuring the CDS Service Definition

Remote Services use a CDS service definition from the CDS model as specification of the remote API.
This API specification is required in order to properly translate CQN statements into respective OData V2 and V4 requests.

By default the CDS service definition is looked up in the CDS model using the name of the _Remote Service_.
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
::: tip
You can use the `cds import` command to generate a CDS service definition from an EDMX API specification.
To learn more about this, have a look at section [Importing Service Definitions](../guides/using-services#import-api).
:::

### Configuring the Destination

CAP leverages the destination capabilities of the SAP Cloud SDK. Destinations contain the information necessary to connect to a remote system.
They're basically an advanced URL, that can carry additional metadata like, for example, the authentication information for this URL.

[Learn more about destinations in the **SAP Cloud SDK documentation**.](https://sap.github.io/cloud-sdk/docs/java/features/connectivity/sdk-connectivity-destination-service){.learn-more}

The CAP Java SDK obtains the destination for a _Remote Service_ from the `DestinationAccessor` using the name, that is configured in the _Remote Service_'s destination configuration.
If you're using the SAP BTP Destination Service, this is the name you used when you defined the destination there.

The destination configuration needs to provide the URL to the OData V2 or V4 service, that should be used by the _Remote Service_.
This service URL can be built from three parts:

1. The URL provided by the destination.
1. An optional URL suffix provided in the _Remote Service_ destination configuration under the `suffix` property.
1. The name of the service, either obtained from the optional `service` configuration property or the fully qualified name of the CDS service definition.

Consider this example:

```yaml
cds:
  remote.services:
  - name: "API_BUSINESS_PARTNER"
    destination:
      name: "s4-business-partner-api"
      suffix: "/sap/opu/odata/sap"
      type: "odata-v2"
```

In this case, the destination with name `s4-business-partner-api` would be obtained from the `DestinationAccessor`.
Given that this destination holds the URL `https://s4.sap.com`, the resulting service URL for OData requests would be `https://s4.sap.com/sap/opu/odata/sap/API_BUSINESS_PARTNER`.

The `type` property defines the protocol used by the remote API. The CAP Java SDK currently supports `odata-v4` (default) or `odata-v2`.

#### Configuring Destination Strategies

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

### Adding SAP Cloud SDK Dependencies

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

## Using Remote Services

_Remote Services_ can be used just like any other [service, that accepts CQN queries](consumption-api#cdsservices):

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
        .withProperties(Collections.singletonMap("name", "my-destination"))
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
        .name("my-destination")
        .build();
```
