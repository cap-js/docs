---
synopsis: >
  Describes authentication and authorization in CAP Java.
status: released
uacp: Used as link target from Help Portal at https://help.sap.com/products/BTP/65de2977205c403bbc107264b8eccf4b/9186ed9ab00842e1a31309ff1be38792.html
---
<!--- Migrated: @external/java/security.md -> @external/java/security.md -->

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

User requests with invalid authentication need to be rejected as soon as possible, to limit the resource impact to a minimum. Ideally, authentication is one of the first steps when processing a request. This is one reason why it's not an integral part of the CAP runtime and needs to be configured on application framework level. In addition, CAP Java is based on a [modular architecture](architecture#modular_architecture) and allows flexible configuration of the authentication method. For productive scenarios, [XSUAA and IAS](#xsuaa-ias) authentication is supported out of the box, but a [custom authentication](#custom-authentication) can be configured as well. For the local development and test scenario, there's a built-in [mock user](#mock-users) support.

### Configure XSUAA and IAS Authentication { #xsuaa-ias}
To enable your application for XSUAA or IAS-authentication we recommend to use the `cds-starter-cloudfoundry` or the `cds-starter-k8s` starter bundle, which covers all required dependencies.

:::details Individual Dependencies
These are the individual dependencies that can be explicitly added in the `pom.xml` file of your service:
   * `com.sap.cloud.security:resourceserver-security-spring-boot-starter` that brings [spring-security library](https://github.com/SAP/cloud-security-services-integration-library/tree/main/spring-security)
   * `org.springframework.boot:spring-boot-starter-security`
   * `cds-feature-identity`

:::

In addition, your application needs to be bound to corresponding service instances depending on your scenario.  The following list describes which service needs to be bound depending on the tokens your applications should accept:
   * only accept tokens issued by XSUAA --> bind your application to an [XSUAA service instance](../guides/authorization#xsuaa-configuration)
   * only accept tokens issued by IAS --> bind your application to an [IAS service instance](https://help.sap.com/docs/IDENTITY_AUTHENTICATION)
   * accept tokens issued by XSUAA and IAS --> bind your application to service instances of both types.

::: tip Specify Binding
CAP Java picks only a single binding of each type. If you have multiple XSUAA or IAS bindings, choose a specific binding with property `cds.security.xsuaa.binding` respectively `cds.security.identity.binding`.
Choose an appropriate XSUAA service plan to fit the requirements. For instance, if your service should be exposed as technical reuse service, make use of plan `broker`.
:::

### Transition from `cds-feature-xsuaa` to `cds-feature-identity`{ #transition-xsuaa-ias}
CAP also provides support for XSUAA-based authentication via the maven dependency `cds-feature-xsuaa` which is based on the [spring-xsuaa library](https://github.com/SAP/cloud-security-services-integration-library/tree/main/spring-xsuaa). 
We recommend to move to `cds-feature-identity`, as the spring-xsuaa library is deprecated. When moving to `cds-feature-identity`, please keep the following in mind:

- As `cds-feature-xsuaa` still takes priority over `cds-feature-identity` for backward compatibility, remove all existing dependencies to `cds-feature-xsuaa` and `xsuaa-spring-boot-starter`.
- If you are using the `cds-starter-cloudfoundry` or the `cds-starter-k8s` starter bundle, make sure to **explicitly** exclude the mentioned dependencies using `<exclusions>...</exclusions>`.

::: code-group

```xml [srv/pom.xml (cds-starter-cloudfoundry)]
<dependency>
    <groupId>com.sap.cds</groupId>
    <artifactId>cds-starter-cloudfoundry</artifactId>
    <exclusions>
        <exclusion>
            <groupId>com.sap.cds</groupId>
            <artifactId>cds-feature-xsuaa</artifactId>
        </exclusion>
        <exclusion>
            <groupId>com.sap.cloud.security.xsuaa</groupId>
            <artifactId>xsuaa-spring-boot-starter</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

```xml [srv/pom.xml (cds-starter-k8s)]
<dependency>
    <groupId>com.sap.cds</groupId>
    <artifactId>cds-starter-k8s</artifactId>
    <exclusions>
        <exclusion>
            <groupId>com.sap.cds</groupId>
            <artifactId>cds-feature-xsuaa</artifactId>
        </exclusion>
        <exclusion>
            <groupId>com.sap.cloud.security.xsuaa</groupId>
            <artifactId>xsuaa-spring-boot-starter</artifactId>
        </exclusion>
    </exclusions>
</dependency>
```

:::

Now follow the description in [Configure XSUAA and IAS Authentication](#xsuaa-ias).

### Automatic Spring Boot Security Configuration { #spring-boot}

Only if **both, the library dependencies and an XSUAA/IAS service binding are in place**, the CAP Java SDK activates a Spring security configuration, which enforces authentication for all endpoints **automatically**:
* Protocol adapter endpoints (managed by CAP such as OData V4/V2 or custom protocol adapters)
* Remaining custom endpoints (not managed by CAP such as custom REST controllers or Spring Actuators)

The security auto configuration authenticates all endpoints by default, unless corresponding CDS model is not explicitly opened to public with [pseudo-role](../guides/authorization#pseudo-roles) `any` (configurable behaviour).
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
| `/BooksService/Reviews`   | <X/><sup>1</sup> |
| `/BooksService/Orders`    |       <X/>       |


> <sup>1</sup> Since version 1.25.0
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
| `cds.security.xsuaa.enabled`  | Switches off automatic XSUAA security configuration. | `true`
| `cds.security.identity.enabled`  | Switches off automatic IAS security configuration. | `true`

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

You're free to configure any authentication method according to your needs. CAP isn't bound to any specific authentication method or user representation such as introduced with XSUAA, it rather runs the requests based on a [user abstraction](../guides/authorization#user-claims). The CAP user of a request is represented by a [UserInfo](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/latest/com/sap/cds/services/request/UserInfo.html) object that can be retrieved from the [RequestContext](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/latest/com/sap/cds/services/request/RequestContext.html) as explained in [Enforcement API & Custom Handlers](#enforcement-api).

Hence, if you bring your own authentication, you've to transform the authenticated user and inject as `UserInfo` to the current request. This is done by means of [UserInfoProvider](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/latest/com/sap/cds/services/runtime/UserInfoProvider.html) interface that can be implemented as Spring bean as demonstrated in [Registering Global Parameter Providers](../java/event-handlers/request-contexts#global-providers).
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
#### Preconfigured Mock Users

For convenience, the runtime creates default mock users reflecting the [pseudo roles](../guides/authorization#pseudo-roles). They are named `authenticated`, `system` and `privileged` and can be used with an empty password. For instance, requests sent during a Spring MVC unit test with annotation `@WithMockUser("authenticated")` will pass authorization checks that require `authenticated-user`. The privileged user will pass any authorization checks. `cds.security.mock.defaultUsers = false` prevents the creation of default mock users at startup.

#### Explicitly Defined Mock Users

You can also define mock users explicitly. This mock user configuration only applies if:
* The service runs without an XSUAA service binding (non-productive mode)
* Mock users are defined in the active application configuration

Define the mock users in a Spring profile, which may be only active during testing, as in the following example:

```yaml
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

```yaml
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

The mock user `Alice` is assigned to the mock tenant `CrazyCars` for which the features `cruise` and `park` are enabled.

## Authorization { #auth}

CAP Java SDK provides a comprehensive authorization service. By defining authorization rules declaratively via annotations in your CDS model, the runtime enforces authorization of the requests in a generic manner. Two different levels of authorization can be distinguished:

- [Role-based authorization](#role-based-auth) allows to restrict resource access depending on user roles.
- [Instance-based authorization](#instance-based-auth) allows to define user privileges even on entity instance level, that is, a user can be restricted to instances that fulfill a certain condition.

It's recommended to configure authorization declaratively in the CDS model. If necessary, custom implementations can be built on the [Authorization API](#enforcement-api).

A precise description of the general authorization capabilities in CAP can be found in the [Authorization](../guides/authorization) guide.

### Role-Based Authorization { #role-based-auth}

Use CDS annotation `@requires` to specify in the CDS model which role a user requires to access the annotated CDS resources such as services, entities, actions, and functions (see [Restricting Roles with @requires](../guides/authorization#requires)). The generic authorization handler of the runtime rejects all requests with response code 403 that don't match the accepted roles.
More specific access control is provided by the `@restrict` annotation, which allows to combine roles with the allowed set of events. For instance, this helps to distinguish between users that may only read an entity from those who are allowed to edit. See section [Control Access with @restrict](../guides/authorization#restrict-annotation) to find details about the possibilities.


### Instance-Based Authorization { #instance-based-auth}

Whereas role-based authorization applies to whole entities only, [Instance-Based Authorization](../guides/authorization#instance-based-auth) allows to add more specific conditions that apply on entity instance level and depend on the attributes that are assigned to the request user. A typical use case is to narrow down the set of visible entity instances depending on user properties (for example, `CountryCode` or `Department`). Instance-based authorization is also basis for [domain-driven authorizations](../guides/authorization#domain-driven-authorization) built on more complex model constraints.

#### Current Limitations

The CAP Java SDK translates the `where`-condition in the `@restrict` annotation to a predicate, which is appended to the `CQN` statement of the request. This applies only to `READ`,`UPDATE`, and `DELETE` events. In the current version, the following limitations apply:
* For `UPDATE` and `DELETE` events no paths in the `where`-condition are supported.
* Paths in `where`-conditions with `to-many` associations or compositions can only be used with an [`exists` predicate](../guides/authorization#exists-predicate).
* `UPDATE` and `DELETE` requests that address instances that aren't covered by the condition (for example, which aren't visible) aren't rejected, but work on the limited set of instances as expected.
As a workaround for the limitations with paths in `where`-conditions, you may consider using the `exists` predicate instead.

CAP Java SDK supports [User Attribute Values](../guides/authorization#user-attrs) that can be referred by `$user.<attribute-name>` in the where-clause of the `@restrict`-annotation. Currently, only comparison predicates with user attribute values are supported (`<,<=,=,=>,>`). Note that generally a user attribute represents an *array of strings* and *not* a single value. A given value list `[code1, code2]` for `$user.code` in predicate `$user.code = Code` evaluates to `(code1 = Code) or (code2 = Code)` in the resulting statement.

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
| `isSystemUser()` | Indicates whether the request has been initiated by a technical service. Refers to [pseudo-role](../guides/authorization#pseudo-roles) `system-user`. |
| `isAuthenticated()` | True if the current user has been authenticated. Refers to [pseudo-role](../guides/authorization#pseudo-roles) `authenticated-user`. |
| `isPrivileged()` |  Returns `true` if the current user runs in privileged (that is, unrestricted) mode |
| `hasRole(String role)` | Checks if the current user has the given role. |
| `getRoles()` | Returns the roles of the current user |
| `getAttributeValues(String attribute)` | Returns the value list of the given user attribute. Referred by `$user.<attribute>`. |

It's also possible to modify the `UserInfo` object for internal calls. See section [Request Contexts](./request-contexts) for more details.
For instance, you might want to run internal service calls in privileged mode that bypasses authorization checks:

```java
cdsRuntime.requestContext().privilegedUser().run(privilegedContext -> {
	assert privilegedContext.getUserInfo().isPrivileged();
	// ... Service calls in this scope pass generic authorization handler
});
```
