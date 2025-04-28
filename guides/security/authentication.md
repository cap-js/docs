---
# layout: cookbook
label: Authentication
synopsis: >
  This guide explains how to authenticate CAP services and how to work with users.
status: released
---

<script setup>
  import { h } from 'vue'
  const Y  =  () => h('span', { class: 'y',   title: 'Available' },      ['✓']   )
  const X  =  () => h('span', { class: 'x',   title: 'Available' },      ['✗']   )
  const Na =  () => h('span', { class: 'na',  title: 'Not available' },  ['n/a']   )
</script>
<style scoped>
  .y   { color: var(--green); font-weight:900; }
  .x   { color: var(--red);   font-weight:900; }
  /* .na  { font-weight:500; } */
</style>


# Authentication

In essence, authentication verifies the user's identity and validates the presented claims, such as granted roles and tenant membership. 
Briefly, **authentication** ensures _who_ is going to use the service. 
In contrast, **authorization** dictates _how_ the user can interact with the application's resources based on their granted privileges. 
As access control relies on verified claims, authentication is a mandatory prerequisite for authorization.


[[toc]]


## Key Concepts { #key-concepts }

- diagram (IdP, identity service, ...)

### Leveraging Platform Services { #key-concept-platform-services }
CAP does not deal with user login flows, password and credential management, user sessions, or any cryptographic logic. 
Instead, CAP seamlessly integrates with platform services that cover these critical security topics centrally. 
By relying on these services, CAP ensures that security-related tasks are handled by specialized components designed for this purpose. 
This approach not only simplifies the implementation process but also enhances security by leveraging robust, well-tested mechanisms provided by the platform.
By leveraging platform services, CAP allows developers to focus on core application functionality without worrying about the intricacies of security implementation.

### Pluggable and Customizable { #key-concept-pluggable }

CAP has a plugin-based architecture to allow integration of authentication services as offered with existing services provided by the BTP platform. 
Additionally, CAP supports the integration of custom authentication strategies. 
This flexibility is crucial for scenarios where the default authentication methods do not fully meet the requirements of the application.
Moreover, this integration helps to easily incorporate non-CAP and even non-BTP services, thereby providing a flexible and interoperable environment. 

For example, in a local development setup, it might be necessary to use a custom authentication strategy to thoroughly test security features. 
CAP allows developers to configure and activate the appropriate authentication strategy according to the runtime context, ensuring that the authentication process remains adaptable and robust across different environments.


### Autoconfigured and Secured by Default { #key-concept-autoconfigured }
CAP application endpoints are authenticated automatically, which means no error-prone configuration or coding is required to handle all endpoints thoroughly. 
This autoconfiguration feature significantly reduces the risk of misconfiguration and ensures that all endpoints are secured by default. 
When you deploy a CAP application, all endpoints will reject unauthorized users by default, thus providing a secure baseline.

Making endpoints public requires manual configuration either in the middleware or in the CDS model. 
This approach ensures that developers consciously decide which endpoints should be accessible to the public, thereby maintaining a high level of security and control over the application's access points.


### Decoupled from Authorization { #key-concept-decoupled-authn }
CAP provides an abstract user API as the basis for authorization. 
This decoupling ensures that authentication is executed in a separate and independent component. 
The authentication information is then propagated to the authorization logic, allowing for a clear separation of concerns. 
Authentication is a mandatory pre-step for authorization, ensuring that only authenticated users are subject to authorization checks.
Additionally, authentication can be executed in a separate service, such as an ingress router of a service mesh. 
This decoupling allows for a flexible combination of authentication and authorization strategies. 

For instance, in a Deploy-With-Confidence (DwC) context, CAP authentication can be delegated to a central ingress router component called Jupiter, which handles the authentication process independently. [TODO: SAP internal]

### Decoupled from Business Logic  { #key-concept-decoupled-coding }
If required in rare cases, the CAP user API may be used, but application code should not be subject to change in case an integrated service changes its authentication strategy. 
This decoupling safeguards the application logic from being tightly coupled with authentication mechanisms, ensuring that changes in authentication strategies do not necessitate changes in the business logic.

Likewise, the CAP framework allows performing outbound service calls while handling authentication under the hood. 
This abstraction layer ensures that the application can interact with other services securely without the developers having to worry about the details of authentication. 
This setup also allows for testing application security in a local test or development setup which is self-contained and reliable.


## CAP Users

A successfull authentication in CAP results in an object representation of the request user determined by the concrete user logged in.
It contains [basic information](#user-claims) about the user including name, ID, tenant and additional claims such as roles or assigned attribute values.
This user abstraction is basis for _model-driven_ [CDS authorization](../guides/security/authorization), [managed data](../guides/domain-modeling#managed-data) as well as for [custom authorization enforcement](../guides/security/authorization#enforcement).
Referring to the key concepts, the abstraction serves to decouple authorization and business logic from pluggable authentication strategy.

### User Claims { #user-claims }

After successful authentication, a CAP user is represented by the following properties:

- Unique (logon) _name_ identifying the user. Unnamed, technical users have a fixed name such as `system` or `anonymous`.
- _Tenant_ for multitenant applications.
- _Roles_ that the user has been granted by an administrator (see [User Roles](#roles)) or that are derived by the authentication level (see [Pseudo Roles](#pseudo-roles)).
- _Attributes_ that the user has been assigned by an user administrator.

In the CDS model, some of the user properties can be referenced with the `$user` prefix:

| User Property                 | Reference           |
|-------------------------------|---------------------|
| Name                          | `$user`             |
| Attribute (name \<attribute>) | `$user.<attribute>` |

> A single user attribute can have several different values. For instance, the `$user.language` attribute can contain `['DE','FR']`.

### User Roles { #roles}

As a basis for access control, you can design CAP roles that are application specific and that are assigned to users at application runtime.
A role should reflect _how_ a user can interact with the application and rather not describe a fine-grained event on technical level.

annotate Issues with @(restrict: [
    { grant: ['READ','WRITE'],
      to: 'ReportIssues',
      where: ($user = CreatedBy) },
    { grant: ['READ'],
      to: 'ReviewIssues' },
    { grant: '*',
      to: 'ManageIssues' }
]);


For instance, the role `Vendor` could describe access rules for users who are allowed to read sales articles and update sales figures, a `ProcurementManager` have full access to sales articles. 

CAP roles represent basic building blocks for authorization rules that are defined by the application developers who have in-depth domain knowledge.
Independently from that, user administrators combine CAP roles in higher-level policies and assign to business users in the platform's central authorization management solution.

::: tip
CDS-based authorization deliberately refrains from using technical concepts, such as _scopes_ as in _OAuth_, in favor of user roles, which are closer to the technical domain of business applications.
:::

### Pseudo Roles { #pseudo-roles}


  - pseudo roles ? 
  - public users
  - business users
  - technical users
  - provider vs. business tenant

  
It's frequently required to define access rules that aren't based on an application-specific user role, but rather on the _authentication level_ of the request. For instance, a service could be accessible not only for identified, but also for anonymous (for example, unauthenticated) users. Such roles are called pseudo roles as they aren't assigned by user administrators, but are added at runtime automatically.

The following predefined pseudo roles are currently supported by CAP:

* `authenticated-user` refers to named or unnamed users who have presented a valid authentication claim such as a logon token.
* [`system-user` denotes an unnamed user used for technical communication.](#system-user)
* [`internal-user` is dedicated to distinguish application internal communication.](#internal-user)
* `any` refers to all users including anonymous ones (that means, public access without authentication).

#### system-user
The pseudo role `system-user` allows you to separate access by _technical_ users from access by _business_ users. Note that the technical user can come from a SaaS or the PaaS tenant. Such technical user requests typically run in a _privileged_ mode without any restrictions on an instance level. For example, an action that implements a data replication into another system needs to access all entities of subscribed SaaS tenants and can’t be exposed to any business user. Note that `system-user` also implies `authenticated-user`.

::: tip
For XSUAA or IAS authentication, the request user is attached with the pseudo role `system-user` if the presented JWT token has been issued with grant type `client_credentials` or `client_x509` for a trusted client application.
:::

#### internal-user
Pseudo-role `internal-user` allows to define application endpoints that can be accessed exclusively by the own PaaS tenant (technical communication). The advantage is that similar to `system-user` no technical CAP roles need to be defined to protect such internal endpoints. However, in contrast to `system-user`, the endpoints protected by this pseudo-role do not allow requests from any external technical clients. Hence is suitable for **technical intra-application communication**, see [Security > Application Zone](/guides/security/overview#application-zone).

::: tip
For XSUAA or IAS authentication, the request user is attached with the pseudo role `internal-user` if the presented JWT token has been issued with grant type `client_credentials` or `client_x509` on basis of the **identical** XSUAA or IAS service instance.
:::

::: warning
All technical clients that have access to the application's XSUAA or IAS service instance can call your service endpoints as `internal-user`.
**Refrain from sharing this service instance with untrusted clients**, for instance by passing services keys or [SAP BTP Destination Service](https://help.sap.com/docs/connectivity/sap-btp-connectivity-cf/create-destinations-from-scratch) instances.
:::




### Modifying Users { #modifying-users }
  - UserProvider  

### Propagating Users { #propagating-users }
	- request internal
	- tenant switch
	- privileged mode
	- original authentication claim
	- asynchronous -> implicit to technical user


## Providing Authenticated Services { #authenticating-services }

According to key concept [pluggable and customizable](key-concept-pluggable), the authentication method is customizable freely. 
CAP [leverages platform services](#key-concept-platform-services) to provide a set of authentication strategies that cover all important scenarios:

- For _local development_ and _unit testing_, [mock user](#mock-user-auth) is an appropriate built-in authentication feature.

- For _cloud deployments_, in particular deployments for production, CAP integration of [SAP Cloud Identity Services](https://help.sap.com/docs/IDENTITY_AUTHENTICATION) is first-choice for applications:  
  - [Identity Authentication Service (IAS)](#ias-auth) offers an [OpenId Connect](https://openid.net/connect/) compliant, cross-landscape identity management and single sign-on capabilities. 
  - [Authorization Management Service (AMS)](#ams-auth) offers central role and access management.

- [XS User and Authentication and Authorization Service](https://help.sap.com/docs/CP_AUTHORIZ_TRUST_MNG) (XSUAA) is a full-fleged [OAuth 2.0](https://oauth.net/2/)-based authorization server.
It is available to support existing applications and services in the scope of individual BTP landscapes.

::: tip
CAP applications can run IAS and XSUAA in hybrid mode to support a smooth migration.
:::

::: warn
Without security middleware configured, CDS services are exposed to public. 
Basic configuration of an authentication strategy is mandatory to protect your CAP application.
:::

### Mock User Authentication { #mock-user-auth }
  - Test Authentiction
  - setup
  - testing

::: Info
Mock users are deactivated by default in production environment.
:::

### IAS Authentication and AMS { #ias-auth }
  - setup cds add ias
  - role definition / assignment -> CAP Authorization ?
  
### AMS Integration { #ams-auth }
    - setup cds add ams
  - Define Reuse Service

### XSUAA Authentication { #xsuaa-auth }
  - setup cds add xsuaa
  - role definition / assignment -> CAP Authorization ?
  - Define Reuse Service

### Custom Authentication { #custom-auth }
  - Service mesh 
  - DWC Integration (internal)
  - pointer to hooks and properties


## Consuming Authenticated Services { #consuming-authenticated-services }

### Local Services

Local CDS services which are meant for *internal* usage only can be easily consumed by in-process function calls.
They shouldn't be exposed via protocol adapters at all. 
In order to prevent access from external clients, annotate those services with `@protocol: 'none'`:

```cds
@protocol: 'none'
service InternalService {
  ...
}
```
`InternalService` is not handled by protocol adapters and can only receive events sent by in-process handlers.

### Application-Internal Services
- internal-user (IAS + XSUAA)

### BTP Reuse Services
- IAS 
- XSUAA

### External Services
- IAS App-2-App
- Via Destination (S/4)


## Anti Patterns
	- CAP backend has visible endpoints (AppRouter does not shield the endpoint!)
	- Clients might have tokens (authenticated-user -> pretty open for all kinds of users!!)
	- Don't mix business roles vs. technical roles vs. provider roles 
  - Don't deviate from security defaults
  - Don't miss to add authentication tests
  - Don't authenticate manually
  - Don't code against concrete user claims (e.g. XSUAAUserInfo)








Find detailed instructions for setting up authentication in these runtime-specific guides:

- [Set up authentication in Node.js.](/node.js/authentication)
- [Set up authentication in Java.](/java/security#authentication)


In _productive_ environment with security middleware activated, **all protocol adapter endpoints are authenticated by default**<sup>1</sup>, even if no [restrictions](#restrictions) are configured. Multi-tenant SaaS-applications require authentication to provide tenant isolation out of the box. In case there is the business need to expose open endpoints for anonymous users, it's required to take extra measures depending on runtime and security middleware capabilities.

> <sup>1</sup> Starting with CAP Node.js 6.0.0 resp. CAP Java 1.25.0. _In previous versions endpoints without restrictions are public in single-tenant applications_.



## User Claims { #user-claims}




### Mapping User Claims

Depending on the configured [authentication](#prerequisite-authentication) strategy, CAP derives a *default set* of user claims containing the user's name, tenant and attributes:

| CAP User Property   | XSUAA JWT Property               | IAS JWT Property        |
|---------------------|----------------------------------|-------------------------|
| `$user`             | `user_name`                      | `sub`                   |
| `$user.tenant`      | `zid`                            | `zone_uuid`             |
| `$user.<attribute>` | `xs.user.attributes.<attribute>` | All non-meta attributes |

::: tip
CAP does not make any assumptions on the presented claims given in the token. String values are copied as they are.
:::

In most cases, CAP's default mapping will match your requirements, but CAP also allows you to customize the mapping according to specific needs. For instance, `user_name` in XSUAA tokens is generally not unique if several customer IdPs are connected to the underlying identity service.
Here a combination of `user_name` and `origin` mapped to `$user` might be a feasible solution that you implement in a custom adaptation. Similarly, attribute values can be normalized and prepared for [instance-based authorization](#instance-based-auth). Find details and examples how to programmatically redefine the user mapping here:

- [Set up Authentication in Node.js.](/node.js/authentication)
- [Custom Authentication in Java.](/java/security#custom-authentication)

::: warning Be very careful when redefining `$user`
The user name is frequently stored with business data (for example, `managed` aspect) and might introduce migration efforts. Also consider data protection and privacy regulations when storing user data.
:::

## Programmatic Enforcement { #enforcement}

The service provider frameworks **automatically enforce** restrictions in generic handlers. They evaluate the annotations in the CDS models and, for example:

* Reject incoming requests if static restrictions aren't met.
* Add corresponding filters to queries for instance-based authorization, etc.

If generic enforcement doesn't fit your needs, you can override or adapt it with **programmatic enforcement** in custom handlers:

- [Authorization Enforcement in Node.js](/node.js/authentication#enforcement)
- [Enforcement API & Custom Handlers in Java](/java/security#enforcement-api)

## Role Assignments with IAS and AMS

The Authorization Management Service (AMS) as part of SAP Cloud Identity Services (SCI) provides libraries and services for developers of cloud business applications to declare, enforce and manage instance based authorization checks. When used together with CAP the AMS  "Policies” can contain the CAP roles as well as additional filter criteria for instance based authorizations that can be defined in the CAP model. transformed to AMS policies and later on refined by customers user and authorization administrators in the SCI administration console and assigned to business users.

### Use AMS as Authorization Management System on SAP BTP

SAP BTP is currently replacing the authorization management done with XSUAA by an integrated solution with AMS. AMS is integrated into SAP Cloud Identity (SCI), which will offer authentication, authorization, user provisioning and management in one place.

For newly build applications the usage of AMS is generally recommended. The only constraint that comes with the usage of AMS is that customers need to copy their users to the Identity Directory Service as the central place to manage users for SAP BTP applications. This is also the general SAP strategy to simplify user management in the future.

### Case For XSUAA

There is one use case where currently an XSUAA based authorization management is preferable: When XSUAA based services to be consumed by a CAP application come with their own business user roles and thus make user role assignment in the SAP Cloud Cockpit necessary. This will be resolved in the future when the authorization management will be fully based on the SCI Admin console.

For example, SAP Task Center you want to consume an XSUAA-based service that requires own end user role. Apart from this, most services should be technical services that do not require an own authorization management that is not yet integrated in AMS.


<!-- [Learn more about using IAS and AMS with CAP Java.](/java/ams){.learn-more} -->
[Learn more about using IAS and AMS with CAP Node.js](https://github.com/SAP-samples/btp-developer-guide-cap/blob/main/documentation/xsuaa-to-ams/README.md){.learn-more}


## Role Assignments with XSUAA { #xsuaa-configuration}

Information about roles and attributes has to be made available to the UAA platform service. This information enables the respective JWT tokens to be constructed and sent with the requests for authenticated users. In particular, the following happens automatically behind-the-scenes upon build:


### 1. Roles and Attributes Are Filled into the XSUAA Configuration

Derive scopes, attributes, and role templates from the CDS model:

```sh
cds add xsuaa --for production
```

This generates an _xs-security.json_ file:

::: code-group
```json [xs-security.json]
{
  "scopes": [
    { "name": "$XSAPPNAME.admin", "description": "admin" }
  ],
  "attributes": [
    { "name": "level", "description": "level", "valueType": "s" }
  ],
  "role-templates": [
    { "name": "admin", "scope-references": [ "$XSAPPNAME.admin" ], "description": "generated" }
  ]
}
```
:::

For every role name in the CDS model, one scope and one role template are generated with the exact name of the CDS role.

::: tip Re-generate on model changes
You can have such a file re-generated via
```sh
cds compile srv --to xsuaa > xs-security.json
```
:::

See [Application Security Descriptor Configuration Syntax](https://help.sap.com/docs/HANA_CLOUD_DATABASE/b9902c314aef4afb8f7a29bf8c5b37b3/6d3ed64092f748cbac691abc5fe52985.html) in the SAP HANA Platform documentation for the syntax of the _xs-security.json_ and advanced configuration options.

<!-- REVISIT: Not ideal cds compile --to xsuaa can generate invalid xs-security.json files -->
::: warning Avoid invalid characters in your models
Roles modeled in CDS may contain characters considered invalid by the XSUAA service.
:::

If you modify the _xs-security.json_ manually, make sure that the scope names in the file exactly match the role names in the CDS model, as these scope names will be checked at runtime.

### 2. XSUAA Configuration Is Completed and Published

#### Through MTA Build

If there's no _mta.yaml_ present, run this command:

```sh
cds add mta
```

::: details See what this does in the background…

1. It creates an _mta.yaml_ file with an `xsuaa` service.
2. The created service added to the `requires` section of your backend, and possibly other services requiring authentication.
::: code-group
```yaml [mta.yaml]
modules:
  - name: bookshop-srv
    requires:
      - bookshop-auth // [!code ++]
resources:
  name: bookshop-auth // [!code ++]
  type: org.cloudfoundry.managed-service // [!code ++]
  parameters: // [!code ++]
    service: xsuaa // [!code ++]
    service-plan: application // [!code ++]
    path: ./xs-security.json # include cds managed scopes and role templates // [!code ++]
    config: // [!code ++]
      xsappname: bookshop-${org}-${space} // [!code ++]
      tenant-mode: dedicated # 'shared' for multitenant deployments // [!code ++]
```
:::


Inline configuration in the _mta.yaml_ `config` block and the _xs-security.json_ file are merged. If there are conflicts, the [MTA security configuration](https://help.sap.com/docs/HANA_CLOUD_DATABASE/b9902c314aef4afb8f7a29bf8c5b37b3/6d3ed64092f748cbac691abc5fe52985.html) has priority.

[Learn more about **building and deploying MTA applications**.](/guides/deployment/){ .learn-more}

### 3. Assembling Roles and Assigning Roles to Users

This is a manual step an administrator would do in SAP BTP Cockpit. See [Set Up the Roles for the Application](/node.js/authentication#auth-in-cockpit) for more details. If a user attribute isn't set for a user in the IdP of the SAP BTP Cockpit, this means that the user has no restriction for this attribute. For example, if a user has no value set for an attribute "Country", they're allowed to see data records for all countries.
In the _xs-security.json_, the `attribute` entity has a property `valueRequired` where the developer can specify whether unrestricted access is possible by not assigning a value to the attribute.


### 4. Scopes Are Narrowed to Local Roles

Based on this, the JWT token for an administrator contains a scope `my.app.admin`. From within service implementations of `my.app` you can reference the scope:

```js
req.user.is ("admin")
```
... and, if necessary, from others by:

```js
req.user.is ("my.app.admin")
```

<br>

> See the following sections for more details:
- [Developing Security Artifacts in SAP BTP](https://help.sap.com/products/BTP/65de2977205c403bbc107264b8eccf4b/419ae2ef1ddd49dca9eb65af2d67c6ec.html)
- [Maintaining Application Security in XS Advanced](https://help.sap.com/docs/HANA_CLOUD_DATABASE/b9902c314aef4afb8f7a29bf8c5b37b3/35d910ee7c7a445a950b6aad989a5a26.html)
