---
synopsis: >
  Describes authentication and authorization in CAP Java.
status: released
uacp: Used as link target from Help Portal at https://help.sap.com/products/BTP/65de2977205c403bbc107264b8eccf4b/9186ed9ab00842e1a31309ff1be38792.html
---

<script setup>
  import { h } from 'vue'
  const X  =  () => h('span', { class: 'x',   title: 'Available' }, ['✓'] )
  const Na =  () => h('span', { class: 'na',  title: 'Not available' }, ['✗'] )
</script>
<style scoped>
  .x   { color: var(--vp-c-green-1); }
  .na  { color: var(--vp-c-red-1); }
</style>

# Security
<style scoped>
  h1:before {
    content: "Java"; display: block; font-size: 60%; margin: 0 0 .2em;
  }
</style>

{{ $frontmatter.synopsis }}

{ #security}

## Overview

With respect to web services, authentication is the act of proving the validity of user claims passed with the request. This typically comprises verifying the user's identity, tenant, and additional claims like granted roles. Briefly, authentication controls _who_ is using the service. In contrast, authorization makes sure that the user has the required privileges to access the requested resources. Hence, authorization is about controlling _which_ resources the user is allowed to handle.

Hence both, authentication and authorization, are essential for application security:
* [Authentication](#authentication) describes how to configure authentication.
* [Authorization](#auth) describes how to configure access control.

::: warning
Without security configured, CDS services are exposed to public. Proper configuration of authentication __and__ authorization is required to secure your CAP application.
:::

## Authentication { #authentication}

User requests with invalid authentication need to be rejected as soon as possible, to limit the resource impact to a minimum. Ideally, authentication is one of the first steps when processing a request. This is one reason why it's not an integral part of the CAP runtime and needs to be configured on application framework level. In addition, CAP Java is based on a [modular architecture](./developing-applications/building#modular_architecture) and allows flexible configuration of the authentication method. For productive scenarios, [XSUAA and IAS](#xsuaa-ias) authentication is supported out of the box, but a [custom authentication](#custom-authentication) can be configured as well. For the local development and test scenario, there's a built-in [mock user](#mock-users) support.

### Configure XSUAA and IAS Authentication { #xsuaa-ias}
To enable your application for XSUAA or IAS-authentication we recommend to use the `cds-starter-cloudfoundry` or the `cds-starter-k8s` starter bundle, which covers all required dependencies.

:::details Individual Dependencies
These are the individual dependencies that can be explicitly added in the `pom.xml` file of your service:
   * `com.sap.cloud.security:resourceserver-security-spring-boot-starter` that brings [spring-security library](https://github.com/SAP/cloud-security-services-integration-library/tree/main/spring-security)
   * `org.springframework.boot:spring-boot-starter-security`
   * `cds-feature-identity`

:::

In addition, your application needs to be bound to corresponding service instances depending on your scenario.  The following list describes which service needs to be bound depending on the tokens your applications should accept:
   * only accept tokens issued by XSUAA --> bind your application to an [XSUAA service instance](../guides/security/authorization#xsuaa-configuration)
   * only accept tokens issued by IAS --> bind your application to an [IAS service instance](https://help.sap.com/docs/IDENTITY_AUTHENTICATION)
   * accept tokens issued by XSUAA and IAS --> bind your application to service instances of both types.

::: tip Specify Binding
CAP Java picks only a single binding of each type. If you have multiple XSUAA or IAS bindings, choose a specific binding with property `cds.security.xsuaa.binding` respectively `cds.security.identity.binding`.
Choose an appropriate XSUAA service plan to fit the requirements. For instance, if your service should be exposed as technical reuse service, make use of plan `broker`.
:::

#### Proof-Of-Possession for IAS { #proof-of-possession}

Proof-Of-Possession is a technique for additional security where a JWT token is **bound** to a particular OAuth client for which the token was issued. On BTP, Proof-Of-Possession is supported by IAS and can be used by a CAP Java application.

Typically, a caller of a CAP application provides a JWT token issued by IAS to authenticate a request. With Proof-Of-Possession in place, a mutual TLS (mTLS) tunnel is established between the caller and your CAP application in addition to the JWT token. Clients calling your CAP application need to send the certificate provided by their `identity` service instance in addition to the IAS token.

On Cloud Foundry, the CAP application needs to be exposed under an additional route which accepts client certificates and forwards them to the application as `X-Forwarded-Client-Cert` header (for example, the `.cert.cfapps.<landscape>` domain).

<div id="meshdomain" />

On Kyma, it is required to configure an additional component (i.e. a gateway in Istio) which accepts client certificates and forwards them to the application as `X-Forwarded-Client-Cert` header. An example can be found in the Bookshop sample application [here](https://github.com/SAP-samples/cloud-cap-samples-java/tree/ias-ams-kyma/k8s). Besides defining the actual `Gateway` resource, it is required to expose the application under the new domain (see the `values.yaml` [here](https://github.com/SAP-samples/cloud-cap-samples-java/blob/e9c779cb64c0937815910988387b0775d8842765/helm/values.yaml#L47).

The Proof-Of-Possession also affects approuter calls to a CAP Java application. The approuter needs to be configured to forward the certificate to the CAP application. First, set `forwardAuthCertificates: true` on the destination pointing to your CAP backend (for more details see [the `environment destinations` section on npmjs.org](https://www.npmjs.com/package/@sap/approuter#environment-destinations)). Second, configure the destination to use the route of the CAP backend that has been configured to accept client certificates as described previously.

When authenticating incoming requests with IAS, the Proof-Of-Possession is activated by default. This requires using at least version `3.5.1` of the [SAP BTP Spring Security Client](https://github.com/SAP/cloud-security-services-integration-library/tree/main/spring-security) library.

You can disable the Proof-Of-Possession enforcement in your CAP Java application by setting the property `sap.spring.security.identity.prooftoken` to `false` in the `application.yaml` file.

### Automatic Spring Boot Security Configuration { #spring-boot}

Only if **both, the library dependencies and an XSUAA/IAS service binding are in place**, the CAP Java SDK activates a Spring security configuration, which enforces authentication for all endpoints **automatically**:
* Protocol adapter endpoints (managed by CAP such as OData V4/V2 or custom protocol adapters)
* Remaining custom endpoints (not managed by CAP such as custom REST controllers or Spring Actuators)

The security auto configuration authenticates all endpoints by default, unless corresponding CDS model is not explicitly opened to public with [pseudo-role](../guides/security/authorization#pseudo-roles) `any` (configurable behaviour).
Here's an example of a CDS model and the corresponding authentication configuration:

```cds
service BooksService @(requires: 'any') {
  @readonly
  entity Books @(requires: 'any') {...}

  entity Reviews {...}

  entity Orders @(requires: 'Customer') {...}
}
```

| Path                      | Authenticated ?  |
|:--------------------------|:----------------:|
| `/BooksService`           |      <Na/>       |
| `/BooksService/$metadata` |      <Na/>       |
| `/BooksService/Books`     |      <Na/>       |
| `/BooksService/Reviews`   |       <X/>       |
| `/BooksService/Orders`    |       <X/>       |


::: tip
For multitenant applications, it's required to authenticate all endpoints as the tenant information is essential for processing the request.
:::

There are several application parameters in section `cds.security.authentication` that influence the behaviour of the auto-configuration:

| Configuration Property                               | Description                                             | Default
| :---------------------------------------------------- | :----------------------------------------------------- | ------------
| `mode`  | Determines the [authentication mode](#auth-mode): `never`, `model-relaxed`, `model-strict` or `always` | `model-strict`
| `authenticateUnknownEndpoints`  | Determines, if security configurations enforce authentication for endpoints not managed by protocol-adapters. | `true`
| `authenticateMetadataEndpoints`  | Determines, if OData $metadata endpoints enforce authentication. | `true`

The following properties can be used to switch off automatic security configuration at all:

| Configuration Property                               | Description                                             | Default
| :---------------------------------------------------- | :----------------------------------------------------- | ------------
| `cds.security.xsuaa.enabled`  | Whether automatic XSUAA security configuration is enabled. | `true`
| `cds.security.identity.enabled`  | Whether automatic IAS security configuration is enabled. | `true`

#### Setting the Authentication Mode { #auth-mode}

The property `cds.security.authentication.mode` controls the strategy used for authentication of protocol-adapter endpoints. There are four possible values:

- `never`: No endpoint requires authentication. All protocol-adapter endpoints are considered public.
- `model-relaxed`: Authentication is derived from the authorization annotations `@requires` and `@restrict`. If no such annotation is available, the endpoint is considered public.
- `model-strict`: Authentication is derived from the authorization annotations `@requires` and `@restrict`. If no such annotation is available, the endpoint is authenticated. An explicit `@requires: 'any'` makes the endpoint public.
- `always`: All endpoints require authentication.

By default the authentication mode is set to `model-strict` to comply with secure-by-default.
In that case you can use the annotation `@requires: 'any'` on service-level to make the service and its entities public again.
Please note that it's only possible to make an endpoint public, if the full endpoint path is considered public as well.
For example you can only make an entity public, if the service that contains it is also considered public.
::: tip
Please note that the authentication mode has no impact on the *authorization* behaviour.
:::

#### Customizing Spring Boot Security Configuration { #custom-spring-security-config}

If you want to explicitly change the automatic security configuration, you can add an _additional_ Spring security configuration on top that overrides the default configuration by CAP. This can be useful, for instance, if an alternative authentication method is required for *specific endpoints* of your application.

```java
@Configuration
@EnableWebSecurity
@Order(1) // needs to have higher priority than CAP security config
public class AppSecurityConfig {

  @Bean
  public SecurityFilterChain appFilterChain(HttpSecurity http) throws Exception {
    return http
      .securityMatcher(AntPathRequestMatcher.antMatcher("/public/**"))
      .csrf(c -> c.disable()) // don't insist on csrf tokens in put, post etc.
      .authorizeHttpRequests(r -> r.anyRequest().permitAll())
      .build();
  }

}
```
Due to the custom configuration, all URLs matching `/public/**` are opened for public access.
::: tip
The Spring `SecurityFilterChain` requires CAP Java SDK [1.27.x](../releases/archive/2022/aug22#minimum-spring-boot-version-2-7-x) or later. Older versions need to use the deprecated `WebSecurityConfigurerAdapter`.
:::

::: warning _❗ Warning_ <!--  -->
Be cautious with the configuration of the `HttpSecurity` instance in your custom configuration. Make sure that only the intended endpoints are affected.
:::

Another typical example is the configuration of [Spring Actuators](https://docs.spring.io/spring-boot/docs/current/reference/html/actuator.html#actuator.enabling). For example a custom configuration can apply basic authentication to actuator endpoints `/actuator/**`:

```java
@Configuration
@EnableWebSecurity
@Order(1)
public class ActuatorSecurityConfig {

  @Bean
  public SecurityFilterChain actuatorFilterChain(HttpSecurity http) throws Exception {
    return http
      .securityMatcher(AntPathRequestMatcher.antMatcher("/actuator/**"))
      .httpBasic(Customizer.withDefaults())
      .authenticationProvider(/* configure basic authentication users here with PasswordEncoder etc. */)
      .authorizeHttpRequests(r -> r.anyRequest().authenticated())
      .build();
  }

}
```

### Custom Authentication { #custom-authentication}

You're free to configure any authentication method according to your needs. CAP isn't bound to any specific authentication method or user representation such as introduced with XSUAA, it rather runs the requests based on a [user abstraction](../guides/security/authorization#user-claims). The CAP user of a request is represented by a [UserInfo](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/latest/com/sap/cds/services/request/UserInfo.html) object that can be retrieved from the [RequestContext](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/latest/com/sap/cds/services/request/RequestContext.html) as explained in [Enforcement API & Custom Handlers](#enforcement-api).

Hence, if you bring your own authentication, you have to transform the authenticated user and inject as `UserInfo` to the current request. This is done by means of [UserInfoProvider](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/latest/com/sap/cds/services/runtime/UserInfoProvider.html) interface that can be implemented as Spring bean as demonstrated in [Registering Global Parameter Providers](../java/event-handlers/request-contexts#global-providers).
More frequently you might have the requirement to just adapt the request's `UserInfo` which is possible with the same interface:


```java
@Component
public class CustomUserInfoProvider implements UserInfoProvider {

    private UserInfoProvider defaultProvider;

    @Override
    public UserInfo get() {
        ModifiableUserInfo userInfo = UserInfo.create();
        if (defaultProvider != null) {
            UserInfo prevUserInfo = defaultProvider.get();
            if (prevUserInfo != null) {
                userInfo = prevUserInfo.copy();
            }
        }
        if (userInfo != null) {
           XsuaaUserInfo xsuaaUserInfo = userInfo.as(XsuaaUserInfo.class);
           userInfo.setName(xsuaaUserInfo.getEmail() + "/" +
                            xsuaaUserInfo.getOrigin()); // adapt name
        }

        return userInfo;
    }

    @Override
    public void setPrevious(UserInfoProvider prev) {
        this.defaultProvider = prev;
    }
}
```

In the example, the `CustomUserInfoProvider` defines an overlay on the default XSUAA-based provider (`defaultProvider`). The overlay redefines the user's name by a combination of email and origin.

### Mock User Authentication with Spring Boot { #mock-users}

By default, CAP Java creates a security configuration, which accepts _mock users_ for test purposes.

::: details Requirement

Mock users are only initialized if the `org.springframework.boot:spring-boot-starter-security` dependency is present in the `pom.xml` file of your service.

:::

#### Preconfigured Mock Users

For convenience, the runtime creates default mock users reflecting the [pseudo roles](../guides/security/authorization#pseudo-roles). They are named `authenticated`, `system` and `privileged` and can be used with an empty password. For instance, requests sent during a Spring MVC unit test with annotation `@WithMockUser("authenticated")` will pass authorization checks that require `authenticated-user`. The privileged user will pass any authorization checks. `cds.security.mock.defaultUsers = false` prevents the creation of default mock users at startup.

#### Explicitly Defined Mock Users

You can also define mock users explicitly. This mock user configuration only applies if:
* The service runs without an XSUAA service binding (non-productive mode)
* Mock users are defined in the active application configuration

Define the mock users in a Spring profile, which may be only active during testing, as in the following example:
::: code-group
```yaml [srv/src/main/resources/application.yaml]
---
spring:
  config.activate.on-profile: test
cds:
  security:
    mock:
      users:
        - name: Viewer-User
          password: viewer-pass
          tenant: CrazyCars
          roles:
            - Viewer
          attributes:
            Country: [GER, FR]
          additional:
            email: myviewer@crazycars.com
          features:
            - cruise
            - park

        - name: Privileged-User
          password: privileged-pass
          privileged: true
          features:
            - "*"
```
:::
- Mock user with name `Viewer-User` is a typical business user with SaaS-tenant `CrazyCars` who has assigned role `Viewer` and user attribute `Country` (`$user.Country` evaluates to value list `[GER, FR]`). This user also has the additional attribute `email`, which can be retrieved with `UserInfo.getAdditionalAttribute("email")`. The [features](../java/reflection-api#feature-toggles) `cruise` and `park` are enabled for this mock user.
- `Privileged-User` is a user running in privileged mode. Such a user is helpful in tests that bypasses all authorization handlers.

Property `cds.security.mock.enabled = false` disables any mock user configuration.

A setup for Spring MVC-based tests based on the given mock users and the CDS model from [above](#spring-boot) could look like this:

```java
@RunWith(SpringRunner.class)
@SpringBootTest
@AutoConfigureMockMvc
public class BookServiceOrdersTest {
	String ORDERS_URL = "/odata/v4/BooksService/Orders";

	@Autowired
	private MockMvc mockMvc;

	@Test
	@WithMockUser(username = "Viewer-User")
	public void testViewer() throws Exception {
		mockMvc.perform(get(ORDERS_URL)).andExpect(status().isOk());
	}
	@Test
	public void testUnauthorized() throws Exception {
		mockMvc.perform(get(ORDERS_URL)).andExpect(status().isUnauthorized());
	}
}
```

#### Mock Tenants

A `tenants` section allows to specify additional configuration for the _mock tenants_. In particular it is possible to assign features to tenants:
::: code-group
```yaml [srv/src/main/resources/application.yaml]
---
spring:
  config.activate.on-profile: test
cds:
  security:
    mock:
      users:
        - name: Alice
          tenant: CrazyCars
      tenants:
        - name: CrazyCars
          features:
            - cruise
            - park
```
:::
The mock user `Alice` is assigned to the mock tenant `CrazyCars` for which the features `cruise` and `park` are enabled.

## Authorization { #auth}

CAP Java SDK provides a comprehensive authorization service. By defining authorization rules declaratively via annotations in your CDS model, the runtime enforces authorization of the requests in a generic manner. Two different levels of authorization can be distinguished:

- [Role-based authorization](../guides/security/authorization#requires) allows to restrict resource access depending on user roles.
- [Instance-based authorization](../guides/security/authorization#instance-based-auth) allows to define user privileges even on entity instance level, that is, a user can be restricted to instances that fulfill a certain condition.

It's recommended to configure authorization declaratively in the CDS model. If necessary, custom implementations can be built on the [Authorization API](#enforcement-api).

A precise description of the general authorization capabilities in CAP can be found in the [Authorization](../guides/security/authorization) guide.

In addition to standard authorization, CAP Java provides additional out of the box capabilities to reduce custom code:

#### Deep Authorization { #deep-auth}

Queries to Application Services are not only authorized by the target entity which has a `@restrict` or `@requires` annotation, but also for all __associated entities__ that are used in the statement. 
__Compositions__ are neither checked nor extended with additional filters.
For instance, consider the following model:

```cds
@(restrict: [{ grant: 'READ', to: 'Manager' }])
entity Books {...}

@(restrict: [{ grant: 'READ', to: 'Manager' }])
entity Orders {
  key ID: String;
  items: Composition of many {
    key book: Association to Books;
    quantity: Integer;
  }
}
```

For the following OData request `GET Orders(ID='1')/items?$expand=book`, authorizations for `Orders` and for `Books` are checked. 
If the entity `Books` has a `where` clause for [instance-based authorization](/java/security#instance-based-auth), 
it will be added as a filter to the sub-request with the expand.

Custom CQL statements submitted to the [Application Service](/java/cqn-services/application-services) instances 
are also authorized by the same rules including the path expressions and subqueries used in them.

For example, the following statement checks role-based authorizations for both `Orders` and `Books`, 
because the association to `Books` is used in the select list. 

```java
Select.from(Orders_.class,
    f -> f.filter(o -> o.ID().eq("1")).items())
  .columns(c -> c.book().title());
```

For modification statements with associated entities used in infix filters or where clauses,
role-based authorizations are checked as well. Associated entities require `READ` authorization, in contrast to the target of the statement itself.

The following statement requires `UPDATE` authorization on `Orders` and `READ` authorization on `Books`
because an association from `Orders.items` to the book is used in the where condition.

```java
Update.entity(Orders_.class, f -> f.filter(o -> o.ID().eq("1")).items())
  .data("quantity", 2)
  .where(t -> t.book().ID().eq(1));
```
:::tip Modification of Statements
Be careful when you modify or extend the statements in custom handlers.
Make sure you keep the filters for authorization.
:::

Starting with CAP Java `4.0`, deep authorization is on by default. 
It can be disabled by setting <Config java>cds.security.authorization.deep.enabled: false</Config>.

[Learn more about `@restrict.where` in the instance-based authorization guide.](/guides/security/authorization#instance-based-auth){.learn-more}

#### Forbidden on Rejected Entity Selection { #reject-403 }

Entities that have an instance-based authorization condition, that is [`@restrict.where`](/guides/security/authorization#restrict-annotation), 
are guarded by the CAP Java runtime by adding a filter condition to the DB query **excluding not matching instances from the result**. 
Hence, if the user isn't authorized to query an entity, requests targeting a *single* entity return *404 - Not Found* response and not *403 - Forbidden*.

To allow the UI to distinguish between *not found* and *forbidden*, CAP Java can detect this situation and rejects`PATCH` and `DELETE` requests to single entities with forbidden accordingly.
The additional authorization check may affect performance.

::: warning
To avoid to disclosure the existence of such entities to unauthorized users, make sure that the key is not efficiently enumerable or add custom code to overrule the default behaviour otherwise.
:::

Starting with CAP Java `4.0`, the reject behaviour is on by default.
It can be disabled by setting <Config java>cds.security.authorization.instance-based.reject-selected-unauthorized-entity.enabled: false</Config>.

[Learn more about `@restrict.where` in the instance-based authorization guide.](/guides/security/authorization#instance-based-auth){.learn-more}

#### Authorization Checks On Input Data { #input-data-auth }

Input data of `CREATE` and `UPDATE` events is also validated with regards to instance-based authorization conditions.
Invalid input that does not meet the condition is rejected with response code `400`.

Let's assume an entity `Orders` which restricts access to users classified by assigned accounting areas:

```cds
annotate Orders with @(restrict: [
  { grant: '*', where: 'accountingArea = $user.accountingAreas' } ]);
```

A user with accounting areas `[Development, Research]` is not able to send an `UPDATE` request, that changes `accountingArea` from `Research` or `Development` to `CarFleet`, for example.
Note that the `UPDATE` on instances _not matching the request user's accounting areas_ (for example, `CarFleet`) are rejected by standard instance-based authorization checks.

Starting with CAP Java `4.0`, deep authorization is on by default.
It can be disabled by setting <Config java>cds.security.authorization.instanceBased.checkInputData: false</Config>.

[Learn more about `@restrict.where` in the instance-based authorization guide.](/guides/security/authorization#instance-based-auth){.learn-more}


### Enforcement API & Custom Handlers { #enforcement-api}

The generic authorization handler performs authorization checks driven by the annotations in an early Before handler registered to all application services by default. You may override or add to the generic authorization logic by providing custom handlers. The most important piece of information is the [UserInfo](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/latest/com/sap/cds/services/request/UserInfo.html) that reflects the authenticated user of the current request. You can retrieve it:

a) from the [EventContext](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/latest/com/sap/cds/services/EventContext.html):
  ```java
  EventContext context;
  UserInfo user = context.getUserInfo();
  ```

b) through dependency injection within a handler bean:

  ```java
  @Autowired
  UserInfo user;
  ```

The most helpful getters in `UserInfo` are listed in the following table:

| UserInfo method                               | Description
| :---------------------------------------------------- | :----------------------------------------------------- |
| `getName()`  | Returns the unique (logon) name of the user as configured in the IdP. Referred by `$user` and `$user.name`. |
| `getTenant()` | Returns the tenant of the user. |
| `isSystemUser()` | Indicates whether the request has been initiated by a technical service. Refers to [pseudo-role](../guides/security/authorization#pseudo-roles) `system-user`. |
| `isAuthenticated()` | True if the current user has been authenticated. Refers to [pseudo-role](../guides/security/authorization#pseudo-roles) `authenticated-user`. |
| `isPrivileged()` |  Returns `true` if the current user runs in privileged (that is, unrestricted) mode |
| `hasRole(String role)` | Checks if the current user has the given role. |
| `getRoles()` | Returns the roles of the current user |
| `getAttributeValues(String attribute)` | Returns the value list of the given user attribute. Referred by `$user.<attribute>`. |

It's also possible to modify the `UserInfo` object for internal calls. See section [Request Contexts](./event-handlers/request-contexts) for more details.
For instance, you might want to run internal service calls in privileged mode that bypasses authorization checks:

```java
cdsRuntime.requestContext().privilegedUser().run(privilegedContext -> {
	assert privilegedContext.getUserInfo().isPrivileged();
	// ... Service calls in this scope pass generic authorization handler
});
```
