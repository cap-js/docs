---
synopsis: >
  This chapter contains comprehensive guides that help you to work through migrations such as from CAP Java 1.x to CAP Java 2.x.
status: released
uacp: Used as link target from Help Portal at https://help.sap.com/products/BTP/65de2977205c403bbc107264b8eccf4b/9186ed9ab00842e1a31309ff1be38792.html
---
<!--- Migrated: @external/java/900-Migration/0-index.md -> @external/java/migration.md -->

<script setup>
  import Cds4j from './components/Cds4jLink.vue'
  import CdsSrv from './components/CdsServicesLink.vue'
</script>


# Migration Guides

<style scoped>
  h1:before {
    content: "Java"; display: block; font-size: 60%; margin: 0 0 .2em;
  }
</style>

{{ $frontmatter.synopsis }}

[[toc]]


## CAP Java 1.34 to CAP Java 2.0 { #one-to-two}

This section describes the changes in CAP Java between the major versions 1.34 and 2.0. It provides also helpful information how to migrate a CAP Java application to the new major version 2.0.

As preparation, we strongly recommend to firstly upgrade to 1.34.x and then follow this guide to upgrade to 2.0.x.

### Spring Boot 3

CAP Java 2 uses Spring Boot 3 as underlying framework. Consult the [Spring Boot 3.0 Migration Guide](https://github.com/spring-projects/spring-boot/wiki/Spring-Boot-3.0-Migration-Guide) for changes between Spring Boot 2.7 and Spring Boot 3.0. A CAP Java application is typically only affected by Spring Boot 3 incompatibilities if it uses native Spring APIs.

#### Java 17

Spring Boot 3 requires Java 17 as minimum version.
Maven dependencies, which are not managed by CAP Java, need to be updated to Java 17 compatible versions.

#### Jakarta EE 10

Spring Boot 3 requires Jakarta EE 10. This includes a switch in package names from `javax` to `jakarta`. For example all Servlet-related classes are moved from package `javax.servlet` to `jakarta.servlet`.

For instance, replace
```java
import javax.servlet.http.HttpServletResponse;
```
with
```java
import jakarta.servlet.http.HttpServletResponse;
```

Maven dependencies, which are not managed by CAP Java or Spring Boot, need to be updated to Jakarta EE 10 compatible versions.

#### Spring Security

Since version 1.27 CAP Java is running with Spring Boot 2.7, which uses Spring Security 5.7. Spring Boot 3 uses Spring Security 6. In case you defined custom security configurations you need to follow the guides, which describe the [migration from 5.7 to 5.8](https://docs.spring.io/spring-security/reference/5.8/migration/index.html) and the [migration from 5.8 to 6.0](https://docs.spring.io/spring-security/reference/6.0/migration/index.html).

### Minimum Dependency Versions

Make sure that all libraries used in your project are either compatible with Spring Boot 3 / Jakarta EE 10 or alternatively offer a new version which you can adopt.

CAP Java 2.0 itself requires updated [dependency versions](./development/#dependencies-version-2) of:
- `@sap/cds-dk`
- `@sap/cds-compiler`
- XSUAA library
- SAP Cloud SDK
- Java Logging (replace `cf-java-logging-support-servlet` with `cf-java-logging-support-servlet-jakarta`)

::: warning
The Cloud SDK BOM `sdk-bom` manages XSUAA until version 2.x, which isn't compatible with CAP Java 2.x.
You have two options:
* Replace `sdk-bom` with `sdk-modules-bom`, which [manages all Cloud SDK dependencies but not the transitive dependencies.](https://sap.github.io/cloud-sdk/docs/java/guides/manage-dependencies#the-sap-cloud-sdk-bill-of-material)
* Or, add [dependency management for XSUAA](https://github.com/SAP/cloud-security-services-integration-library#installation) before Cloud SDK's `sdk-bom`.
:::

### API Cleanup

Some interfaces, methods, configuration properties and annotations, which had already been deprecated in 1.x, are now removed in version 2.0. Please strictly fix all usage of [deprecated APIs](#overview-of-removed-interfaces-and-methods) by using the recommended replacement.

::: tip
In your IDE, enable the compiler warning "Signal overwriting or implementing deprecated method".
:::

#### Legacy Upsert

Up to cds-services 1.27, upsert always completely _replaced_ pre-existing data with the given data: it was implemented as
cascading delete followed by a deep _insert_. In the insert phase, for all elements that were absent in the data,
the initializations were performed: UUID generation, `@cds.on.insert` handlers, and initialization with default values.
Consequently, in the old implementation, an upsert with partial data would have reset absent elements to their initial values!
To avoid a reset with the old upsert, data always had to be complete.

Since version 1.28 the upsert is implemented as a deep _update_ that creates data if not existing.  An upsert with partial data now leaves the absent elements untouched. In particular, UUID values are _not generated_ with the new upsert implementation.

Application developers upgrading from cds-services <= 1.27 need to be aware of these changes.
Check, if the usage of upsert in your code is compatible with the new implementation, especially:

* Ensure that all key values are contained in the data and you don't rely on UUID key generation.
* Check if insert is more appropriate.

::: warning
The global configuration parameter `cds.sql.upsert.strategy`, as well as the upsert hint to switch back to the legacy upsert behavior are not supported anymore with 2.0. If you rely on the replace behavior of the legacy upsert, use a cascading delete followed by a deep insert.
:::

#### Representation of Pagination {#limit}
The interfaces <Cds4j link="ql/cqn/CqnLimit.html">CqnLimit</Cds4j> and <Cds4j link="ql/Limit.html">Limit</Cds4j> are removed. Use the methods `limit(top)` and `limit(top, skip)` of the `Select` and `Expand` to specify the pagination settings. Use the methods <Cds4j link="ql/cqn/CqnEntitySelector.html#skip--">top()</Cds4j> and <Cds4j link="ql/cqn/CqnEntitySelector.html#skip--">skip()</Cds4j> of the `CqnEntitySelector` to introspect the pagination settings of a `CqnExpand` and `CqnSelect`.

#### Statement Modification {#modification}

##### Removal of Deprecated CqnModifier
The deprecated <Cds4j link="ql/cqn/CqnModifier.html">CqnModifier</Cds4j>, whose default methods make expensive copies of literal values, is removed. Instead, use the <Cds4j latest link="ql/cqn/Modifier.html">Modifier</Cds4j> as documented in [Modifying CQL Statements](query-api#copying-modifying-cql-statements).

If your modifier overrides one or more of the `CqnModifier:literal` methods that take `value` and `cdsType` as arguments, override `Modifier:literal(CqnLiteral<?> literal)` instead. You can create new values using `CQL.val(value).type(cdsType);`.

##### Removal of Deprecated Methods in Modifier {#modifier}
The deprecated methods `ref(StructuredTypeRef)` and `ref(ElementRef<?>)` are removed, instead implement the new methods `ref(CqnStructuredTypeRef)` and `ref(CqnElementRef)`. Use `CQL.copy(ref)` if you require a modifiable copy of the ref.

```java
Modifier modifier = new Modifier() {
	@Override
	public CqnStructuredTypeRef ref(CqnStructuredTypeRef ref) {
		RefBuilder<StructuredTypeRef> copy = CQL.copy(ref); // try to avoid copy
		copy.targetSegment().filter(newFilter);
		return copy.build();
	}

	@Override
	public CqnValue ref(CqnElementRef ref) {
		List<Segment> segments = new ArrayList<>(ref.segments());
		segments.add(0, CQL.refSegment(segments.get(0).id(), filter));
		return CQL.get(segments).as(alias);
	}
}
CqnStatement copy = CQL.copy(statement, modifier);
```

### Removed Interfaces and Methods Overview {#overview-of-removed-interfaces-and-methods}


#### com.sap.cds

| Class / Interface | Method / Field | Replacement |
| --- | --- | --- |
| <Cds4j link="ConstraintViolationException.html">ConstraintViolationException</Cds4j> | | <Cds4j latest link="UniqueConstraintException.html">UniqueConstraintException</Cds4j> |
| <Cds4j link="ResultBuilder.html">ResultBuilder</Cds4j> | <Cds4j link="ResultBuilder.html#updatedRows-int:A-java.util.List-">updatedRows</Cds4j> | see <Cds4j link="ResultBuilder.html#updatedRows-int:A-java.util.List-">javadoc</Cds4j> |

#### com.sap.cds.ql

| Class / Interface | Method / Field | Replacement |
| --- | --- | --- |
| <Cds4j link="ql/CQL.html">CQL</Cds4j> | <Cds4j link="ql/CQL.html#literal-T-">literal</Cds4j> | <Cds4j latest link="ql/CQL.html#val-T-">val</Cds4j> or <Cds4j latest link="ql/CQL.html#constant-T-">constant</Cds4j> |
| <Cds4j link="ql/Select.html">Select</Cds4j> | <Cds4j link="ql/Select.html#groupBy-java.util.Collection-">groupBy</Cds4j> | <Cds4j latest link="ql/Select.html#groupBy-java.util.List-">groupBy</Cds4j> |

#### com.sap.cds.ql.cqn

| Class / Interface | Method / Field | Replacement |
| --- | --- | --- |
| <Cds4j link="ql/cqn/CqnParameter.html">CqnParameter</Cds4j> | <Cds4j link="ql/cqn/CqnParameter.html#getName--">getName</Cds4j> | <Cds4j link="ql/cqn/CqnParameter.html#name--">name</Cds4j> |
| <Cds4j link="ql/cqn/CqnReference.Segment.html">CqnReference.Segment</Cds4j> | <Cds4j link="ql/cqn/CqnReference.Segment.html#accept-com.sap.cds.ql.cqn.CqnVisitor-">accept(visitor)</Cds4j> | <Cds4j latest link="ql/cqn/CqnReference.html#accept-com.sap.cds.ql.cqn.CqnVisitor-">CqnReference.accept(visitor)</Cds4j> |
| <Cds4j link="ql/cqn/CqnSelectList.html">CqnSelectList</Cds4j> | <Cds4j link="ql/cqn/CqnSelectList.html#prefix--">prefix</Cds4j> | <Cds4j latest link="ql/cqn/CqnSelectList.html#ref--">ref</Cds4j> |
| <Cds4j link="ql/cqn/CqnSelectListItem.html">CqnSelectListItem</Cds4j> | <Cds4j link="ql/cqn/CqnSelectListItem.html#displayName--">displayName</Cds4j> | <Cds4j latest link="ql/cqn/CqnSelectListItem.html#asValue--">asValue</Cds4j> + <Cds4j latest link="ql/cqn/CqnSelectListValue.html#displayName--">displayName</Cds4j> |
| | <Cds4j link="ql/cqn/CqnSelectListItem.html#alias--">alias</Cds4j> | <Cds4j latest link="ql/cqn/CqnSelectListItem.html#asValue--">asValue</Cds4j> + <Cds4j latest link="ql/cqn/CqnSelectListValue.html#alias--">alias</Cds4j> |
| <Cds4j link="ql/cqn/CqnSortSpecification.html">CqnSortSpecification</Cds4j> | <Cds4j link="ql/cqn/CqnSortSpecification.html#item--">item</Cds4j> | <Cds4j latest link="ql/cqn/CqnSortSpecification.html#value--">value</Cds4j> |
| <Cds4j link="ql/cqn/CqnSource.html">CqnSource</Cds4j> | <Cds4j link="ql/cqn/CqnSource.html#isQuery--">isQuery</Cds4j> | <Cds4j latest link="ql/cqn/CqnSource.html#isSelect--">isSelect</Cds4j> |
| | <Cds4j link="ql/cqn/CqnSource.html#asQuery--">asQuery</Cds4j> | <Cds4j latest link="ql/cqn/CqnSource.html#asSelect--">asSelect</Cds4j> |
| <Cds4j link="ql/cqn/CqnVisitor.html">CqnVisitor</Cds4j> | <Cds4j link="ql/cqn/CqnVisitor.html#visit-com.sap.cds.ql.cqn.CqnReference.Segment-">visit(CqnReference.Segment seg)</Cds4j> | <Cds4j latest link="ql/cqn/CqnVisitor.html#visit-com.sap.cds.ql.cqn.CqnElementRef-">visit(CqnElementRef)</Cds4j>, <Cds4j latest link="ql/cqn/CqnVisitor.html#visit-com.sap.cds.ql.cqn.CqnStructuredTypeRef-">visit(CqnStructuredTypeRef)</Cds4j>|
| <Cds4j link="ql/cqn/CqnXsert.html">CqnXsert</Cds4j> | <Cds4j link="ql/cqn/CqnXsert.html#getKind--">getKind</Cds4j> | <Cds4j latest link="ql/cqn/CqnStatement.html#isInsert--">isInsert</Cds4j>, <Cds4j latest link="ql/cqn/CqnStatement.html#isUpsert--">isUpsert</Cds4j> |
| <Cds4j link="ql/cqn/Modifier.html">Modifier</Cds4j> | <Cds4j link="ql/cqn/CompatibilityDefaults.html#ref-com.sap.cds.ql.StructuredTypeRef-">ref(StructuredTypeRef ref)</Cds4j> | <Cds4j link="ql/cqn/Modifier.html#ref-com.sap.cds.ql.cqn.CqnStructuredTypeRef-">ref(CqnStructuredTypeRef ref)</Cds4j> |
| | <Cds4j link="ql/cqn/CompatibilityDefaults.html#ref-com.sap.cds.ql.ElementRef-">ref(ElementRef<?> ref)</Cds4j> | <Cds4j link="ql/cqn/Modifier.html#ref-com.sap.cds.ql.cqn.CqnElementRef-">ref(CqnElementRef ref)</Cds4j> |
| | <Cds4j link="ql/cqn/CompatibilityDefaults.html#in-com.sap.cds.ql.Value-java.util.Collection-">in(Value, Collection)</Cds4j> | <Cds4j link="ql/cqn/Modifier.html#in-com.sap.cds.ql.Value-com.sap.cds.ql.cqn.CqnValue-">in(Value, CqnValue)</Cds4j> |
| | <Cds4j link="ql/cqn/CompatibilityDefaults.html#match-com.sap.cds.ql.StructuredTypeRef-com.sap.cds.ql.Predicate-com.sap.cds.ql.cqn.CqnMatchPredicate.Quantifier-">match(ref, pred, quantifier)</Cds4j> | <Cds4j link="ql/cqn/Modifier.html#match-com.sap.cds.ql.cqn.CqnMatchPredicate-">match(CqnMatchPredicate match)</Cds4j> |
| | <Cds4j link="ql/cqn/CompatibilityDefaults.html#selectListItem-com.sap.cds.ql.Value-java.lang.String-">selectListItem(value, alias)</Cds4j> | <Cds4j link="ql/cqn/Modifier.html#selectListValue-com.sap.cds.ql.Value-java.lang.String-">selectListValue(value, alias)</Cds4j> |
| | <Cds4j link="ql/cqn/CompatibilityDefaults.html#inline-com.sap.cds.ql.StructuredTypeRef-java.util.List-">inline(ref, items)</Cds4j> | <Cds4j link="ql/cqn/Modifier.html#inline-com.sap.cds.ql.cqn.CqnInline-">inline(CqnInline inline)</Cds4j> |
| | <Cds4j link="ql/cqn/CompatibilityDefaults.html#expand-com.sap.cds.ql.StructuredTypeRef-java.util.List-java.util.List-com.sap.cds.ql.cqn.CqnLimit-">expand(ref, items, orderBy, limit)</Cds4j> | <Cds4j link="ql/cqn/Modifier.html#expand-com.sap.cds.ql.cqn.CqnExpand-">expand(CqnExpand expand)</Cds4j> |
| | <Cds4j link="ql/cqn/CompatibilityDefaults.html#expand-com.sap.cds.ql.Expand-">expand(Expand<?> expand)</Cds4j> | <Cds4j link="ql/cqn/Modifier.html#expand-com.sap.cds.ql.cqn.CqnExpand-">expand(CqnExpand expand)</Cds4j> |
| | <Cds4j link="ql/cqn/CompatibilityDefaults.html#limit-com.sap.cds.ql.Limit-">limit(Limit limit)</Cds4j> | <Cds4j link="ql/cqn/Modifier.html#top-long-">top(long top)</Cds4j> and <Cds4j link="ql/cqn/Modifier.html#skip-long-">skip(long skip)</Cds4j> |

#### com.sap.cds.reflect

| Class / Interface | Method / Field | Replacement |
| --- | --- | --- |
| <Cds4j link="reflect/CdsAssociationType.html">CdsAssociationType</Cds4j> | <Cds4j link="reflect/CdsAssociationType.html#keys--">keys</Cds4j> | <Cds4j latest link="reflect/CdsAssociationType.html#refs--">refs</Cds4j> |
| <Cds4j link="reflect/CdsStructuredType.html">CdsStructuredType</Cds4j> | <Cds4j link="reflect/CdsStructuredType.html#isInlineDefined--">isInlineDefined</Cds4j> | <Cds4j latest link="reflect/CdsStructuredType.html#isAnonymous--">isAnonymous</Cds4j> |


#### com.sap.cds.services

| Class / Interface | Method / Field | Replacement |
| --- | --- | --- |
|<CdsSrv link="services/ErrorStatus.html">ErrorStatus</CdsSrv> | <CdsSrv link="services/ErrorStatus.html#getCode--">getCode()</CdsSrv> | <CdsSrv latest link="services/ErrorStatus.html#getCodeString--">getCodeString()</CdsSrv>|
| <CdsSrv link="services/ServiceException.html">ServiceException</CdsSrv> | <CdsSrv link="services/ServiceException.html#messageTarget-java.lang.String-java.lang.String-java.util.function.Function-">messageTarget(prefix, entity, path)</CdsSrv> |<CdsSrv latest link="services/ServiceException.html#messageTarget-java.lang.String-java.util.function.Function-">messageTarget(parameter, path)</CdsSrv> |

#### com.sap.cds.services.cds

|Class/Interface  | Method  | Replacement  |
|---------|---------| -----|
|<CdsSrv link="services/cds/CdsService.html">CdsService</CdsSrv>   |  | <CdsSrv latest link="services/cds/CqnService.html">CqnService</CdsSrv>        |

#### com.sap.cds.services.environment

| Class / Interface | Method / Field | Replacement |
| --- | --- | --- |
|<CdsSrv latest link="services/environment/ServiceBinding.html">ServiceBinding</CdsSrv>  |   |   [com.sap.cloud.environment.<br>`servicebinding.api.ServiceBinding`](https://github.com/SAP/btp-environment-variable-access/blob/main/api-parent/core-api/src/main/java/com/sap/cloud/environment/servicebinding/api/ServiceBinding.java)      |

::: details

##### Interface `ServiceBinding`
The interface <CdsSrv latest link="services/environment/ServiceBinding.html">`com.sap.cds.services.environment.ServiceBinding`</CdsSrv> is deprecated and replaced with interface [`com.sap.cloud.environment.servicebinding.api.ServiceBinding`](https://github.com/SAP/btp-environment-variable-access/blob/main/api-parent/core-api/src/main/java/com/sap/cloud/environment/servicebinding/api/ServiceBinding.java). For convenience the adapter class `com.sap.cds.services.utils.environment.ServiceBindingAdapter` is provided, which maps the deprecated interface to the new one.

:::

#### com.sap.cds.services.handler

|Class/Interface  | Method  | Replacement  |
|---------|---------| -----|
|<CdsSrv link="services/handler/EventPredicate.html">EventPredicate</CdsSrv>   |  | n/a |

::: details

#### Interface `EventPredicate`
The interface `com.sap.cds.services.handler.EventPredicate` is removed. Consequently, all methods at interface <CdsSrv latest link="services/Service.html">`com.sap.cds.services.Service`</CdsSrv> containing this interface as argument are removed. All removed method were marked as deprecated in prior releases.

:::

#### com.sap.cds.services.messages

| Class / Interface | Method / Field | Replacement |
| --- | --- | --- |
| <CdsSrv link="services/messages/Message.html">Message</CdsSrv> | <CdsSrv link="services/messages/Message.html#target-java.lang.String-java.lang.String-java.util.function.Function-">target(prefix, entity, path)</CdsSrv> | <CdsSrv link="services/messages/Message.html#target-java.lang.String-java.util.function.Function-">target(start, path)</CdsSrv>|
| <CdsSrv link="services/messages/MessageTarget.html">MessageTarget</CdsSrv> | <CdsSrv link="services/messages/MessageTarget.html#getPrefix--">getPrefix()</CdsSrv> | <CdsSrv latest link="services/messages/MessageTarget.html#getParameter--">getParameter()</CdsSrv> |
| | <CdsSrv link="services/messages/MessageTarget.html#getEntity--">getEntity()</CdsSrv>, <CdsSrv link="services/messages/MessageTarget.html#getPath--">getPath()</CdsSrv>| <CdsSrv latest link="services/messages/MessageTarget.html#getRef--">getRef()</CdsSrv>  |

#### com.sap.cds.services.persistence

| Class / Interface | Method / Field | Replacement |
| --- | --- | --- |
| <CdsSrv link="services/persistence/PersistenceService.html">PersistenceService</CdsSrv> | <CdsSrv link="services/persistence/PersistenceService.html#getCdsDataStore--">getCdsDataStore()</CdsSrv> | Use <CdsSrv link="services/persistence/PersistenceService.html#getCdsDataStore--">PersistenceService</CdsSrv> |

#### com.sap.cds.services.request

| Class / Interface | Method / Field | Replacement |
| --- | --- | --- |
|<CdsSrv link="services/request/ParameterInfo.html">ParameterInfo</CdsSrv> | <CdsSrv link="services/request/ParameterInfo.html#getQueryParameters--">getQueryParameters()</CdsSrv> | <CdsSrv latest link="services/request/ParameterInfo.html#getQueryParams--">getQueryParams()</CdsSrv> |
| <CdsSrv link="services/request/UserInfo.html">UserInfo</CdsSrv> | <CdsSrv link="services/request/UserInfo.html#getAttribute-java.lang.String-">getAttribute(String)</CdsSrv> | <CdsSrv link="services/request/UserInfo.html#getAttributeValues-java.lang.String-">getAttributeValues(String)</CdsSrv> |



#### com.sap.cds.services.runtime

| Class / Interface | Method / Field | Replacement |
| --- | --- | --- |
| <CdsSrv link="services/runtime/CdsModelProvider.html">CdsModelProvider</CdsSrv> | <CdsSrv link="services/runtime/CdsModelProvider.html#get-java.lang.String-">get(tenantId)</CdsSrv>  | <CdsSrv latest link="services/runtime/CdsModelProvider.html#get-com.sap.cds.services.request.UserInfo-com.sap.cds.services.request.FeatureTogglesInfo-">get(userInfo, features)</CdsSrv>|
| <CdsSrv link="services/runtime/CdsRuntime.html">CdsRuntime</CdsSrv> |<CdsSrv link="services/runtime/CdsRuntime.html#runInChangeSetContext-java.util.function.Consumer-">runInChangeSetContext(Consumer)</CdsSrv> | <CdsSrv latest link="services/runtime/CdsRuntime.html#changeSetContext--">changeSetContext()</CdsSrv>.<CdsSrv latest link="services/runtime/ChangeSetContextRunner.html#run-java.util.function.Consumer-">run(Consumer)</CdsSrv> |
| |<CdsSrv link="services/runtime/CdsRuntime.html#runInChangeSetContext-java.util.function.Function-">runInChangeSetContext(Function)</CdsSrv> | <CdsSrv latest link="services/runtime/CdsRuntime.html#changeSetContext--">changeSetContext()</CdsSrv>.<CdsSrv latest link="services/runtime/ChangeSetContextRunner.html#run-java.util.function.Function-">run(Function)</CdsSrv> |
| |<CdsSrv link="services/runtime/CdsRuntime.html#runInRequestContext-com.sap.cds.services.runtime.Request-java.util.function.Consumer-">runInRequestContext(Consumer)</CdsSrv> | <CdsSrv latest link="services/runtime/CdsRuntime.html#requestContext--">requestContext()</CdsSrv>.<CdsSrv latest link="services/runtime/RequestContextRunner.html#run-java.util.function.Consumer-">run(Consumer)</CdsSrv> |
| |<CdsSrv link="services/runtime/CdsRuntime.html#runInRequestContext-com.sap.cds.services.runtime.Request-java.util.function.Function-">runInRequestContext(Function)</CdsSrv> | <CdsSrv latest link="services/runtime/CdsRuntime.html#requestContext--">requestContext()</CdsSrv>.<CdsSrv latest link="services/runtime/RequestContextRunner.html#run-java.util.function.Function-">run(Function)</CdsSrv> |
| <CdsSrv link="services/runtime/Request.html">Request</CdsSrv> | CdsRuntime.runInRequestContext(Request, Function\|Consumer) | <CdsSrv latest link="services/runtime/CdsRuntime.html#requestContext--">CdsRuntime.requestContext()</CdsSrv><CdsSrv latest link="services/runtime/RequestContextRunner.html#run-java.util.function.Consumer-">.run(Function)</CdsSrv> |
| <CdsSrv link="services/runtime/RequestParameters.html">RequestParameters</CdsSrv> | CdsRuntime.runInRequestContext(Request, Function\|Consumer) | <CdsSrv latest link="services/runtime/CdsRuntime.html#requestContext--">CdsRuntime.requestContext()</CdsSrv><CdsSrv latest link="services/runtime/RequestContextRunner.html#run-java.util.function.Consumer-">.run(Function)</CdsSrv> |
| <CdsSrv link="services/runtime/RequestUser.html">RequestUser</CdsSrv> | CdsRuntime.runInRequestContext(Request, Function\|Consumer) | <CdsSrv latest link="services/runtime/CdsRuntime.html#requestContext--">CdsRuntime.requestContext()</CdsSrv><CdsSrv latest link="services/runtime/RequestContextRunner.html#run-java.util.function.Consumer-">.run(Function)</CdsSrv> |

::: details

#### Method `CdsRuntime.runInRequestContext(Request, Function|Consumer)`
The interface <CdsSrv link="services/runtime/Request.html">`Request`</CdsSrv> and its used interfaces <CdsSrv link="services/runtime/RequestParameters.html">`RequestParameters`</CdsSrv> and <CdsSrv link="services/runtime/RequestUser.html">`RequestUser`</CdsSrv> are removed. They were still used in the method <CdsSrv link="services/runtime/CdsRuntime.html#runInRequestContext-com.sap.cds.services.runtime.Request-java.util.function.Consumer-">`CdsRuntime.runInRequestContext(Request, Function|Consumer)`</CdsSrv>, which was also deprecated and should be replaced by <CdsSrv latest link="services/runtime/CdsRuntime.html#requestContext--">`CdsRuntime.requestContext()`</CdsSrv><CdsSrv latest link="services/runtime/RequestContextRunner.html#run-java.util.function.Consumer-">`.run(Function)`</CdsSrv>

:::

#### Overview of Removed CDS Properties

Some CdsProperties were already marked as deprected in CAP Java 1.x and are now removed in 2.x.

| removed | replacement |
| --- | --- |
| <CdsSrv link="services/environment/CdsProperties.DataSource.html">cds.dataSource.serviceName</CdsSrv> | `cds.dataSource.binding` |
| cds.drafts.associationsToInactiveEntities | see [Lean Draft](#lean-draft) |
| <CdsSrv link="services/environment/CdsProperties.Locales.Normalization.html">cds.locales.normalization.whiteList</CdsSrv> | `cds.locales.normalization.includeList` |
| <CdsSrv link="services/environment/CdsProperties.Messaging.MessagingServiceConfig.Queue.html">cds.messaging.services.\<key\>.queue.maxFailedAttempts</CdsSrv> | Use custom error handling |
| <CdsSrv link="services/environment/CdsProperties.Messaging.MessagingServiceConfig.html">cds.messaging.services.\<key\>.topicNamespace</CdsSrv> | `cds.messaging.services.<key>.subscribePrefix` |
| <CdsSrv link="services/environment/CdsProperties.MultiTenancy.html">cds.multiTenancy.instanceManager</CdsSrv> | `cds.multiTenancy.serviceManager` |
| <CdsSrv link="services/environment/CdsProperties.MultiTenancy.Sidecar.DataSource.html">cds.multiTenancy.dataSource.hanaDatabaseIds</CdsSrv> | obsolete, information is automatically retrieved from bindings |
| <CdsSrv link="services/environment/CdsProperties.ODataV4.html">cds.odataV4.indexPage</CdsSrv> | `cds.indexPage` |
| <CdsSrv link="services/environment/CdsProperties.Security.html#isAuthenticateUnknownEndpoints--">cds.security.authenticateUnknownEndpoints</CdsSrv> | `cds.security.authentication.authenticateUnknownEndpoints` |
| <CdsSrv link="services/environment/CdsProperties.Security.html#getAuthorizeAutoExposedEntities--">cds.security.authorizeAutoExposedEntities</CdsSrv> | if disabled, add auto-exposed entities explicitly into your service definition |
| <CdsSrv link="services/environment/CdsProperties.Security.Authorization.html#getAutoExposedEntities--">cds.security.authorization.autoExposedEntities</CdsSrv> | if disabled, add auto-exposed entities explicitly into your service definition |
| <CdsSrv link="services/environment/CdsProperties.Security.html#getDefaultRestrictionLevel--">cds.security.defaultRestrictionLevel</CdsSrv> | `cds.security.authentication.mode` |
| <CdsSrv link="services/environment/CdsProperties.Security.html#getDraftProtection--">cds.security.draftProtection</CdsSrv> | `cds.security.authorization.draftProtection` |
| <CdsSrv link="services/environment/CdsProperties.Security.html#getInstanceBasedAuthorization--">cds.security.instanceBasedAuthorization</CdsSrv> | if disabled, remove `@requires` / `@restrict` annotations |
| <CdsSrv link="services/environment/CdsProperties.Security.Authorization.html#getInstanceBasedAuthorization--">cds.security.authorization.instanceBasedAuthorization</CdsSrv> | remove `@requires` / `@restrict` annotations |
| <CdsSrv link="services/environment/CdsProperties.Security.html#isOpenMetadataEndpoints--">cds.security.openMetadataEndpoints</CdsSrv> | `cds.security.authentication.authenticateMetadataEndpoints` |
| <CdsSrv link="services/environment/CdsProperties.Security.html#getOpenUnrestrictedEndpoints--">cds.security.openUnrestrictedEndpoints</CdsSrv> | `cds.security.authentication.mode` |
| <CdsSrv link="services/environment/CdsProperties.Security.Xsuaa.html">cds.security.xsuaa.serviceName</CdsSrv> | `cds.security.xsuaa.binding` |
| <CdsSrv link="services/environment/CdsProperties.Security.Xsuaa.html">cds.security.xsuaa.normalizeUserNames</CdsSrv> | obsolete, effectively hard-coded to `false` |
| <CdsSrv link="services/environment/CdsProperties.html">cds.services</CdsSrv> | cds.application.services |
| <CdsSrv link="services/environment/CdsProperties.Sql.Upsert.html">cds.sql.upsert</CdsSrv> | See [Legacy Upsert](#legacy-upsert) |

### Removed Annotations Overview

- `@search.cascade` is no longer supported. It's replaced by [@cds.search](../guides/providing-services#cds-search).

### Changed Behavior

#### Immutable Values

The implementations of `Value` are now immutable. This change makes [copying & modifying CQL statements](./query-api#copying-modifying-cql-statements) cheaper, which significantly improves the performance.

Changing the type of a value via `Value::type` now returns a new (immutable) value or throws an exception if the type change is not supported:

```Java
Literal<Number> number = CQL.val(100);
Value<String>   string = number.type(CdsBaseType.STRING); // number is unchanged
```

#### Immutable References

In CDS QL, a [reference](../cds/cxn#references) (_ref_) identifies an entity set or element of a structured type. References can have multiple segments and ref segments can have filter conditions.

The default implementations of references (`ElementRef` and `StructuredTypeRef`), as well as ref segments (`RefSegment`) are now immutable. This change makes [copying & modifying CQL statements](./query-api#copying-modifying-cql-statements) much cheaper, which significantly improves the performance.

##### - Set alias or type

`CQL:entity:asRef`, `CQL:to:asRef` and `CQL:get` create immutable refs. Modifying the ref is not supported. Methods `as(alias)` and `type(cdsType)` now return a *new* (immutable) ref:

```java
ElementRef<?> authorName = CQL.get("name").as("Author");
ElementRef<?> nombre = authorName.as("nombre");         // authorName is unchanged
ElementRef<?> string = authorName.type("cds.String");   // authorName is unchanged
```

##### - Modify ref segments

Also the segments of an immutable ref can't be modified in-place any longer. Create an immutable ref segment with filter as follows:

```java
Segment seg = CQL.refSegment("title", predicate);
```

The deprecated `RefSegment:id` and `RefSegment:filter` methods now throw an `UnsupportedOperationException`. For in-place modification of ref segments use `CQL.copy(ref)` to create a `RefBuilder`, which is a modifiable copy of the original ref. The `RefBuilder` allows to modify the segments in-place to change the segment ID or set a filter. Finally call the `build` method to create an immutable ref.

To manipulate a ref in a [Modifier](#modifier), implementations need to override the new `ref(CqnStructuredTypeRef ref)` and `ref(CqnElementRef ref)` methods.

#### Null Values in CDS QL Query Results

With CAP Java 2.0, `null` values are not removed from the result of CDS QL queries anymore, this needs to be considered when using methods that operate on the key set of `Row`, such as `Row:containsKey`, `Row:keySet` and `Row:entrySet`.

#### Result of Updates Without Matching Entity

The `Result` rows of CDS QL Updates are not cleared anymore if no entity was updated. To find out if the entity has been updated, check the [update count](./query-api#update):

```Java
CqnUpdate update = Update.entity(BOOKS).entry(book); // w/ book: {ID: 0, stock: 3}
Result result = service.run(update);

long updateCount = result.rowCount(); // 0 matches with ID 0
```

For batch updates use `Result::rowCount` with the [batch index](./query-execution#batch-execution):

```Java
// books: [{ID: 251, stock: 11}, {ID: 252, stock: 7}, {ID: 0, stock: 3}]
CqnUpdate update = Update.entity(BOOKS).entries(books);
Result result = service.run(update);

result.batchCount(); // number of batches (3)
result.rowCount(2);  // 0 matches with ID 0
```

#### Provider Tenant Normalization

The default value of CDS Property `cds.security.authentication.normalizeProviderTenant` is changed to `true`. With this change, the provider tenant is normalized and set to `null` in the UserInfo by default. If you have subscribed the provider tenant to your application you need to disable this feature.

### Lean Draft

The property `cds.drafts.associationsToInactiveEntities` has been removed. It enabled a feature, which caused associations to other draft documents to combine active and inactive versions of the association target. This mixing of inactive and active data is no longer supported.
In cases where it is still required to connect two independent draft documents through an association, you can annotate this association with `@odata.draft.enclosed`. Note: This ensures that the active version points to an active target, while the inactive version points to an inactive target. It will not mix active and inactive data into the same association.

The following table summarizes the behaviour of associations between different draft-enabled entities:

| Source Entity | Association Type | Target Entity | Draft Document Boundaries |
| --- | --- | --- | --- |
| active<sup>1</sup> | composition | active | same document |
| inactive<sup>2</sup> | composition | inactive | same document |
| active | [backlink](../cds/cdl#to-many-associations) association | active | same document |
| inactive | backlink association | inactive | same document |
| active | association | active | independent documents |
| inactive | association | active | independent documents |
| active | association with `@odata.draft.enclosed` | active | independent documents |
| inactive | association with `@odata.draft.enclosed` | inactive | independent documents |

<sup>1</sup> `IsActiveEntity = true`
<br>
<sup>2</sup> `IsActiveEntity = false`

### Changes to Maven Plugins

#### cds-maven-plugin

The deprecated parameters `generateMode` and `parserMode` are removed from the [goal generate](./assets/cds-maven-plugin-site/generate-mojo.html){target="_blank"}.

#### cds4j-maven-plugin

The deprecated Maven plugin `cds4j-maven-plugin` is removed and no longer available. It's replaced by the [`cds-maven-plugin`](./assets/cds-maven-plugin-site/plugin-info.html){target="_blank"} which provides the same functionality and more.


## Classic MTX to Streamlined MTX

How to migrate from [classic MTX](./multitenancy) to [streamlined MTX](../guides/multitenancy/) is described [here](../guides/multitenancy/old-mtx-migration).


## CAP Java Classic to CAP Java 1.x

To make the CAP Java SDK and therefore the applications built on it future-proof, we revamped the CAP Java SDK. Compared the classic CAP Java Runtime (also known as the "Java Gateway stack"), the new CAP Java SDK has numerous benefits:

- Starts up much faster
- Supports local development with SQLite
- Has clean APIs to register event handlers
- Integrates nicely with Spring and Spring Boot
- Supports custom protocol adapters (OData V4 support included)
- Has a modular design: Add features as your application grows
- Enables connecting to advanced SAP BTP services like SAP Event Mesh

We strongly recommend adopting the new CAP Java SDK when starting a new project. Existing projects that currently use the classic CAP Java Runtime can adopt the new CAP Java SDK midterm to take advantage of new features and the superior architecture. In the following sections, we describe the steps to migrate a Java project from the classic CAP Java Runtime to the new CAP Java SDK.



### OData Protocol Version

The classic CAP Java Runtime came in several different flavors supporting either the OData V2 or V4 protocols. The new CAP Java SDK streamlines this by providing a common [protocol adapter layer](architecture#protocol-adapters), which enables to handle any OData protocol version or even different protocols with *one* application backend. Hence, if you decide to change the protocol that exposes your domain model, you no longer have to change your business logic.

::: tip
By default, the CAP Java Runtime comes with protocol adapters for OData V4 and [OData V2 (Beta)](#v2adapter). Therefore, you can migrate your frontend code to new CAP Java SDK without change. In addition, you have the option to move from SAP Fiori Elements V2 to SAP Fiori Elements V4 at any time.
:::

### Migrate the Project Structure

Create a new CAP Java project beside your existing one, which you want to migrate. You can use the CAP Java Maven archetype to create a new CAP Java project:

```sh
mvn archetype:generate -DarchetypeArtifactId=cds-services-archetype -DarchetypeGroupId=com.sap.cds -DarchetypeVersion=RELEASE
```

<div id="release-sap" />

Further details about creating a new CAP Java project and the project structure itself can be found in section [Starting a New Project](./getting-started#new-project).

By default, the Java service module goes to the folder `srv`. If you want to use a different service module folder, you have to adapt it manually.
Rename the service module folder to your preferred name and adjust also the `<modules>` section in the file `pom.xml` in your projects root folder:

```xml
...
<modules>
	<module>srv</module> <!-- replace srv with your folder name -->
</modules>
...
```

::: tip
If you've changed the service module folder name, you have to consider this in the next steps.
:::

### Copy the CDS Model

Now, you can start migrating your CDS model from the classic project to the newly created CAP Java project.

Therefore, copy your CDS model and data files (_*.cds_ & _*.csv_) manually from the classic project to the corresponding locations in the new project, presumably the `db` folder. If you organize your CDS files within subfolders, also re-create these subfolders in the new project to ensure the same relative path between copied CDS files. Otherwise, compiling your CDS model in the new project would fail.

Usually the CDS files are located in the following folders:

| Usage | Location in classic project | Location in new CAP Java project |
| --- | --- | --- |
| Database Model | `<CLASSIC-PROJECT-ROOT>/db/**` | `<NEW-PROJECT-ROOT>/db/**` |
| Service Model | `<CLASSIC-PROJECT-ROOT>/srv/**` | `<NEW-PROJECT-ROOT>/srv/**` |

If your CDS model depends on other reusable CDS models, add those dependencies to `<NEW-PROJECT-ROOT>/package.json`:

```json
...
"dependencies": {
	"@sap/cds": "^3.0.0",
	...  // add your CDS model reuse dependencies here
},
...
```

::: tip
In your CDS model, ensure that you explicitly define the data type of the elements whenever an aggregate function (max, min, avg etc.) is used, else the build might fail.
:::

In the following example, element `createdAt` has an explicitly specified datatype (that is `timestamp`):

```cds
view AddressView as select from Employee.Address {
    street, apartment, postal_code, MAX(createdAt) AS createdAt: timestamp
};
```

#### CDS Configuration

The CDS configuration is also part of `<PROJECT-ROOT>/package.json` and has to be migrated as well from the classic to the new project.
Therefore, copy and replace the whole `cds` section from your classic _package.json_ to the new project:

```json
...
"dependencies": {
	"@sap/cds": "^3.0.0",
},
"cds": { // copy this CDS configuration from your classic project
	...
}
...
```

::: tip
If there's also a `<CLASSIC-PROJECT-ROOT>/.cdsrc.json` in your classic project to configure the CDS build, copy this file to the new project.
:::

You can validate the final CDS configuration by executing a CDS command in the root folder of the new project:

```sh
cds env
```

It prints the effective CDS configuration on the console. Check, that this configuration is valid for your project.
Execute this command also in your classic project and compare the results, they should be same.

Further details about effective CDS configuration can be found in section [Effective Configuration](../node.js/cds-env#cli).

#### First Build and Deployment

After you've copied all your CDS files, maintained additional dependencies and configured the CDS build,
you can try to build your new CAP Java project the first time.
Therefore, execute the following Maven command in the root folder of your new CAP Java project:

```sh
mvn clean install
```

If this Maven build finishes successfully, you can optionally try to deploy your CDS model to an SAP HANA database by executing the following CDS command:

```sh
cds deploy --to hana
```

[See section **SAP HANA Cloud** for more details about deploying to SAP HANA.](../guides/databases-hana){.learn-more}


### Migrate Java Business Logic

#### Migrate Dependencies

Now, it's time to migrate your Java business logic. If your event handlers require additional libraries that go beyond the already provided Java Runtime API,
add those dependencies manually to section `dependencies` in file `<NEW-PROJECT-ROOT>/srv/pom.xml`, for example:

```xml
...
<dependencies>
	<!-- add your additional dependencies here -->
	...
	<dependency>
		<groupId>com.sap.cds</groupId>
		<artifactId>cds-starter-spring-boot-odata</artifactId>
	</dependency>
	<dependency>
		<groupId>org.xerial</groupId>
		<artifactId>sqlite-jdbc</artifactId>
	</dependency>
	...
</dependencies>
...
```

::: tip
Don't add any dependencies of the classic Java Runtime to the new project. Those dependencies are already replaced with the corresponding version of the new CAP Java SDK.
:::


#### Migrate Event Handlers

In the next steps, you have to adapt your Java classes to be compatible with the new Java Runtime API.
That means, you'll copy and migrate your event handler classes from the classic to the new project.
It will be required to modify and adapt your Java source code to be compatible with the new Java SDK.

Usually the event handler classes and tests are located in these folders:

| Usage | Location in classic project | Location in new CAP Java project |
| --- | --- | --- |
| Handler classes| `<CLASSIC-PROJECT-ROOT>/srv/src/main/java/**` | `<NEW-PROJECT-ROOT>/srv/src/main/java/**` |
| Test classes  | `<CLASSIC-PROJECT-ROOT>/srv/src/test/java/**` | `<NEW-PROJECT-ROOT>/srv/src/test/java/**` |

Copy your Java class files (`*.java`) manually from the classic project to corresponding locations in the new project.
It's important that you re-create the same subfolder structure in the new project as it is in the classic project.
The subfolder structure reflects the Java package names of your Java classes.

##### Annotations

Annotate all of your event handler classes with the following annotations and ensure a unique service name:

```java
@org.springframework.stereotype.Component
@com.sap.cds.services.handler.annotations.ServiceName("serviceName")
```

::: tip
All event handler classes also *have* to implement the marker interface `com.sap.cds.services.handler.EventHandler`. Otherwise, the event handlers defined in the class won't get called.
:::

Finally, your event handler class has to look similar to this example:

```java
import org.springframework.stereotype.Component;
import com.sap.cds.services.handler.EventHandler;
import com.sap.cds.services.handler.annotations.ServiceName;

@Component
@ServiceName("AdminService")
public class AdminServiceHandler implements EventHandler {

}
```

The new CAP Java SDK introduces new annotations for event handlers. Replace event annotations at event handler methods according to this table:

| Classic Java Runtime | CAP Java SDK |
| --- | --- |
| `@BeforeCreate(entity = "yourEntityName")` | `@Before(event = CqnService.EVENT_CREATE, entity = "yourEntityName")` |
| `@BeforeDelete(entity = "yourEntityName")` | `@Before(event = CqnService.EVENT_DELETE, entity = "yourEntityName")` |
| `@BeforeRead(entity = "yourEntityName")` | `@Before(event = CqnService.EVENT_READ, entity = "yourEntityName")` |
| `@BeforeQuery(entity = "yourEntityName")` | `@Before(event = CqnService.EVENT_READ, entity = "yourEntityName")` |
| `@BeforeUpdate(entity = "yourEntityName")` | `@Before(event = CqnService.EVENT_UPDATE, entity = "yourEntityName")` |
| `@Create(entity = "yourEntityName")` | `@On(event = CqnService.EVENT_CREATE, entity = "yourEntityName")` |
| `@Delete(entity = "yourEntityName")` | `@On(event = CqnService.EVENT_DELETE, entity = "yourEntityName")` |
| `@Query(entity = "yourEntityName")` | `@On(event = CqnService.EVENT_READ, entity = "yourEntityName")` |
| `@Read(entity = "yourEntityName")` | `@On(event = CqnService.EVENT_READ, entity = "yourEntityName")` |
| `@Update(entity = "yourEntityName")` | `@On(event = CqnService.EVENT_UPDATE, entity = "yourEntityName")` |
| `@AfterCreate(entity = "yourEntityName")` | `@After(event = CqnService.EVENT_CREATE, entity = "yourEntityName")` |
| `@AfterRead(entity = "yourEntityName")` | `@After(event = CqnService.EVENT_READ, entity = "yourEntityName")` |
| `@AfterQuery(entity = "yourEntityName")` | `@After(event = CqnService.EVENT_READ, entity = "yourEntityName")` |
| `@AfterUpdate(entity = "yourEntityName")` | `@After(event = CqnService.EVENT_UPDATE, entity = "yourEntityName")` |
| `@AfterDelete(entity = "yourEntityName")` | `@After(event = CqnService.EVENT_DELETE, entity = "yourEntityName")` |

::: tip
The `sourceEntity` annotation field doesn't exist in the new CAP Java SDK. In case your event handler should only be called for specific source entities you need to achieve this by [analyzing the CQN](query-introspection#using-the-iterator) in custom code.
:::

##### Event Handler Signatures

The basic signature of an event handler method is `void process(EventContext context)`.
However, it doesn't provide the highest level of comfort. Event handler signatures can vary on three levels:
- EventContext arguments
- POJO-based arguments
- Return type

Replace types from package `com.sap.cloud.sdk.service.prov.api.request` in the classic Java Runtime by types from package `com.sap.cds.services.cds` as described by the following table:

| Classic Java Runtime | New CAP Java SDK |
| --- | --- |
| `CreateRequest` | `CdsCreateEventContext` |
| `DeleteRequest` | `CdsDeleteEventContext` |
| `QueryRequest` | `CdsReadEventContext` |
| `ReadRequest` | `CdsReadEventContext` |
| `UpdateRequest` | `CdsUpdateEventContext` |
| `ExtensionHelper` | Use dependency injection provided by Spring |

You can also get your entities injected by adding an additional argument with one of the following types:
- `java.util.stream.Stream<yourEntityType>`
- `java.util.List<yourEntityType>`

[See section **Event Handler Method Signatures** for more details.](provisioning-api#handlersignature){.learn-more}

Also replace the classic handler return types with the corresponding new implementation:

| Classic Java Runtime | New CAP Java SDK |
| --- | --- |
| return `BeforeCreateResponse` | call `CdsCreateEventContext::setResult(..)` or return `Result` |
| return `BeforeDeleteResponse` | call `CdsDeleteEventContext::setResult(..)` or return `Result` |
| return `BeforeQueryResponse` | call `CdsReadEventContext::setResult(..)` or return `Result` |
| return `BeforeReadResponse` | call `CdsReadEventContext::setResult(..)` or return `Result` |
| return `BeforeUpdateResponse` | call `CdsUpdateEventContext::setResult(..)` or return `Result` |


### Delete Obsolete Files

There are numerous files in your classic project, which aren't required and supported anymore in the new project.
Don't copy any of the following files to the new project:

```txt
<PROJECT-ROOT>/
|-- db/
|   |-- .build.js
|   `-- package.json
`-- srv/src/main/
            |-- resources/
            |    |-- application.properties
            |    `-- connection.properties
            `-- webapp/
                 |-- META-INF/
                 |   |-- sap_java_buildpack/config/resources_configuration.xml
                 |   `-- context.xml
                 `-- WEB-INF/
                     |-- resources.xml
                     |-- spring-security.xml
                     `-- web.xml
```


### Transaction Hooks

In the Classic Java Runtime, it was possible to hook into the transaction initialization and end phase by adding the annotations `@InitTransaction` or `@EndTransaction` to a public method. The method annotated with `@InitTransaction` was invoked just after the transaction started and before any operation executed. Usually this hook was used to validate incoming data across an OData batch request.

[See section **InitTransaction Hook** for more details about init transaction hook in classic CAP Java.](./custom-logic/hooks#inittransaction-hook){.learn-more}

The method annotated with `@EndTransaction` was invoked after all the operations in the transaction were completed and before the transaction was committed.

[See section **EndTransaction Hook** for more details about end transactions hook in classic CAP Java.](./custom-logic/hooks#endtransaction-hook){.learn-more}

The new CAP Java SDK doesn't support these annotations anymore. Instead, it supports registering a `ChangeSetListener` at the `ChangeSetContext` supporting hooks for `beforeClose` and `afterClose`.

[See section **Reacting on ChangeSets** for more details.](changeset-contexts#reacting-on-changesets){.learn-more}

To replace the `@InitTransaction` handler, you can use the `beforeClose` method, instead. This method is called at the end of the transaction and can be used, for example, to validate incoming data across multiple requests in an OData batch *before* the transaction is committed. It's possible to cancel the transaction in this phase by throwing an `ServiceException`.

The CAP Java SDK sample application shows how such a validation using the `ChangeSetListener` approach can be implemented. See [here](https://github.com/SAP-samples/cloud-cap-samples-java/blob/cross-validation/srv/src/main/java/my/bookshop/handlers/ChapterServiceHandler.java) for the example code.

Note that to validate incoming data for *single* requests, we recommend to use a simple `@Before` handler, instead.

[See section **Introduction to Event Handlers** for a detailed description about `Before` handler.](provisioning-api#before){.learn-more}


<!--- Migrated: @external/java/900-Migration/04-security.md -> @external/java/migration/security.md -->
### Security Settings

For applications based on Spring Boot, the new CAP Java SDK simplifies configuring *authentication* significantly: Using the classic CAP Java Runtime, you had to configure authentication for all application endpoints (including the endpoints exposed by your CDS model) explicitly. The new CAP Java SDK configures authentication for all exposed endpoints automatically, based on the security declarations in your CDS model.

*Authorization* can be accomplished in both runtimes with CDS model annotations  `@requires` and `@restrict` as described in section [Authorization and Access Control](../guides/authorization). Making use of the declarative approach in the CDS model is highly recommended.

In addition, the new CAP Java SDK enables using additional authentication methods. For instance, you can use basic authentication for mock users, which are useful for local development and testing. See section [Mock Users](./security#mock-users) for more details.

An overview about the general security configuration in the new CAP Java SDK can be found in section [Security](security).


#### Configuration and Dependencies

To make use of authentication and authorization with JWT tokens issued by XSUAA on the SAP BTP, add the following dependency to your `pom.xml`:

```xml
<dependency>
	<groupId>com.sap.cds</groupId>
	<artifactId>cds-feature-xsuaa</artifactId>
</dependency>
```

This feature provides utilities to access information in JWT tokens, but doesn't activate authentication by default. Therefore, as in the classic CAP Java Runtime, activate authentication by adding a variant of the [XSUAA library](https://github.com/SAP/cloud-security-xsuaa-integration) suitable for your application (depending on if you use Spring, Spring Boot, plain Java) as described in the following sections.

##### Spring Boot

Activate Spring security with XSUAA authentication by adding the following Maven dependency:

```xml
<dependency>
	<groupId>com.sap.cloud.security.xsuaa</groupId>
	<artifactId>xsuaa-spring-boot-starter</artifactId>
	<version>${xsuaa.version}</version>
</dependency>
```

Maintaining a `spring-security.xml` file or a custom `WebSecurityConfigurerAdapter` or `SecurityFilterChain` isn't necessary anymore because the new CAP Java SDK runtime *autoconfigures* authentication in the Spring context according to your CDS model:

- Endpoints exposed by the CDS model annotated with `@restrict` are automatically authenticated.
- Endpoints exposed by the CDS model *not* annotated with `@restrict` are public by definition and hence not authenticated.
- All other endpoints the application exposes manually through Spring are authenticated. If you need to change this default behavior either [manually configure these endpoints](./security#spring-boot) or turn off auto configuration of custom endpoints by means of the following application configuration parameter:

  ```yaml
  cds.security.authentication.authenticate-unknown-endpoints: false
  ```

##### Plain Java

The existing authentication configuration stays unchanged. No autoconfiguration is provided.

#### Enforcement API & Custom Handlers

The new CAP Java SDK offers a technical service called `AuthorizationService`, which serves as a replacement for the former Enforcement APIs. Obtain a reference to this service just like for all other services, either explicitly through a `ServiceCatalog` lookup or per dependency injection in Spring:

```java
@Autowire
AuthorizationService authService;
```
Information of the request user is passed in the current `RequestContext`:

```java
EventContext context;
UserInfo user = context.getUserInfo();
```

or through dependency injection within a handler bean:

```java
@Autowire
UserInfo user;
```

With the help of these interfaces, the classic enforcement API can be mapped to the new API as listed in the following table:

| classic API                                           | new API                                          | Remarks
| :---------------------------------------------------- | :----------------------------------------------------- | ------------------- |
| `isAuthenticatedUser(String serviceName)`  | `authService.hasServiceAccess(serviceName, event)` |
| `isRegisteredUser(String serviceName)` | no substitution required  |
| `hasEntityAccess(String entityName, String event)` | `authService.hasEntityAccess(entityName, event)`    |
| `getWhereCondition()	`  | `authService.calcWhereCondition(entityName, event)` |
| `getUserName()` | `user.getName()` | The user's name is also referenced with `$user` and used for `managed` aspect.
| `getUserId()` | `user.getId()` |
| `hasUserRole(String roleName)` | `user.hasRole(roleName)`           |
| `getUserAttribute(String attributeName)` | `user.getAttribute(attributeName)`    |
| `isContainerSecurityEnabled()` | no substitution required            |

[See section **Enforcement API & Custom Handlers in Java** for more details.](./security#enforcement-api){.learn-more}

<span id="moreenforcement" />


<!--- Migrated: @external/java/900-Migration/05-database.md -> @external/java/migration/database.md -->
### Data Access and Manipulation

There are several ways of accessing data. The first and most secure way is to use the Application Service through an `CqnService` instance. The second is to use `PersistenceService`, in that case the query execution is done directly against underlying datasource, bypassing all authority checks available on service layer. The third one is to use CDS4J component called `CdsDataStore`, which also executes queries directly.

#### Access Application Service in Custom Handler and Query Execution

To access an Application Service in custom handler and to execute queries, perform the following steps:

1) Inject the instance of `CqnService` in your custom handler class:

```java
	@Resource(name = "CatalogService")
	private CqnService catalogService;
```
[See section **Services Accepting CQN Queries** for more details.](consumption-api#cdsservices){.learn-more}

2) In each custom handler, replace instance of `DataSourceHandler` as well as `CDSDataSourceHandler` with the `CqnService` instance.

3) Rewrite and execute the query (if any).

Example of query execution in *Classic Java Runtime*:

```java
CDSDataSourceHandler cdsHandler = DataSourceHandlerFactory.getInstance().getCDSHandler(getConnection(), queryRequest.getEntityMetadata().getNamespace());

CDSQuery cdsQuery = new CDSSelectQueryBuilder("CatalogService.Books")
	.selectColumns("id", "title")
	.where(new ConditionBuilder().columnName("title").IN("Spring", Java"))
	.orderBy("title", true)
	.build();

cdsHandler.executeQuery(cdsQuery);
```

[See section **CDS Data Source** for more details.](./custom-logic/remote-data-source#cds-data-source){.learn-more}

The corresponding query and its execution in *New CAP Java SDK* looks as follows:

```java
Select query =  Select.from("CatalogService.Books")
	.columns("id", "title")
	.where(p -> p.get("title")
	.in("Spring", "Java"))
	.orderBy("title");

catalogService.run(query);
```

[See section **Query Builder API** for more details.](./query-api){.learn-more}

4) Rewrite and execute the CRUD operations (if any).

|Action|Classic Java Runtime|New CAP Java SDK|
|---|---|---|
|Create|`dsHandler.executeInsert(request.getData(), true)`|`catalogService.run(event.getCqn())` or `catalogService.run(Insert.into("Books").entry(book))`|
|Read|`dsHandler.executeRead(request.getEntityMetadata().getName(), request.getKeys(), request.getEntityMetadata().getElementNames());`|`catalogService.run(event.getCqn())` or `catalogService.run(Select.from("Books").where(b->b.get("ID").eq(42)))`|
|Update|`dsHandler.executeUpdate(request.getData(), request.getKeys(), true)`|`catalogService.run(event.getCqn())` or `catalogService.run(Update.entity("Books").data(book))`|
|Delete| `dsHandler.executeDelete(request.getEntityMetadata().getName(), request.getKeys())` |`catalogService.run(event.getCqn())` or `catalogService.run(Delete.from("Books").where(b -> b.get("ID").eq(42)))`|

As you can see in *New CAP Java SDK* it's possible to either directly execute a CQN of the event, or you can construct and execute your own custom query.

[See section **Query Builder API** for more details.](./query-api){.learn-more}

#### Accessing `PersistenceService`

If for any reason you decided to use `PersistenceService` instead of `CqnService` in your custom handler, you need to inject the instance of `PersistenceService` in your custom handler class:

```java
@Autowired
private PersistenceService persistence;
```

[See section **Persistence API** for more details.](./consumption-api#persistenceservice){.learn-more}

Example of Query execution in *Classic Java Runtime*:

```java
CDSDataSourceHandler cdsHandler = ...;

CDSQuery cdsQuery = new CDSSelectQueryBuilder("CatalogService.Books")
	.selectColumns("id", "title")
	.where(new ConditionBuilder().columnName("title").IN("Spring", Java"))
	.orderBy("title", true)
	.build();

cdsHandler.executeQuery(cdsQuery);
```

The corresponding query execution in *New CAP Java SDK* looks as follows:

```java
Select query =  Select.from("CatalogService.Books")
	.columns("id", "title")
	.where(p -> p.get("title")
	.in("Spring", "Java"))
	.orderBy("title");

persistence.run(query);
```

#### Accessing `CdsDataStore`

If you want to use `CdsDataStore` in your custom handler, you first need to do the steps described in section [Accessing PersistenceService](#accessing-persistenceservice). After that you can get the instance of `CdsDataStore` using `persistence.getCdsDataStore()` method:

```java
Select query =  ...; // construct the query

CdsDataStore cdsDataStore = persistence.getCdsDataStore();
cdsDataStore.execute(query);
```


### CDS OData V2 Adapter { #v2adapter}

When you generate a new project using the [CAP Java Maven Archetype](./getting-started#new-project), OData V4 is enabled by default.

To be able to migrate the backend from the *Classic Java Runtime* without making changes in your frontend code, you can activate the *OData V2 Adapter* as follows:

1. Add the following dependency to the `pom.xml` of your `srv` module:

	```xml
	<dependency>
		<groupId>com.sap.cds</groupId>
		<artifactId>cds-adapter-odata-v2</artifactId>
		<scope>runtime</scope>
	</dependency>
	```

2. In addition, turn off the OData V4 adapter by replacing the following dependency:

	```xml
	<dependency>
		<groupId>com.sap.cds</groupId>
		<artifactId>cds-starter-spring-boot-odata</artifactId>
	</dependency>
	```

	with

	```xml
	<dependency>
		<groupId>com.sap.cds</groupId>
		<artifactId>cds-starter-spring-boot</artifactId>
	</dependency>
	```

	if present. Additionally, remove the dependency

	```xml
	<dependency>
		<groupId>com.sap.cds</groupId>
		<artifactId>cds-adapter-odata-v4</artifactId>
	</dependency>
	```

	if present.

3. To make the CDS Compiler generate EDMX for OData V2, add or adapt the following property in the _.cdsrc.json_ file:

	```json
	{
		[...]
		"odata": {
			"version": "v2"
		}
	}
	```

	::: tip
	In case you're using [multitenancy](./multitenancy), keep in mind to make the same change in the _.cdsrc.json_ of the _mtx-sidecar_.
	:::

After rerunning the Maven build and starting the CAP Java application, Application Services are served as OData V2. By default, the endpoints will be available under `<host:port>/odata/v2/<Service>`. The default response format is `xml`, to request `json` use `$format=json` or `Accept: application/json` header.

::: tip
The index page available at \<host:port\> lists service endpoints of all protocol adapters.
:::



#### Enabling OData V2 and V4 in Parallel

You can also use OData V2 and V4 in parallel. However, by default the Maven build generates EDMX files for one OData version, only. Therefore, you've to add an extra compile step for the missing OData version to the Maven build of your application:

1. In _.cdsrc_, choose `v4` for `odata.version`

2. Add an extra compile command to the subsection `commands` of the section with ID `cds.build` in the *pom.xml* file in the *srv* folder of your project:

	```xml
	<command>compile ${project.basedir} -s all -l all -2 edmx-v2 -o ${project.basedir}/src/main/resources/edmx/v2</command>
	```

	This command picks up all service definitions in the Java project base directory (`srv` by default) and generates EDMX for OData V2. It also localizes the generated EDMX files with all available translations. For more information on the previous command, call `cds help compile` on the command line. If your service definitions are located in a different directory, adopt the previous command. If your service definitions are contained in multiple directories, add the previous command for each directory separately. Make sure to use at least `cds-dk 3.2.0` for this step.

3. Make sure that the dependencies to the OData V2 and V4 adapters are present in your *pom.xml* file:

	```xml
	<dependency>
		<groupId>com.sap.cds</groupId>
		<artifactId>cds-starter-spring-boot</artifactId>
	</dependency>

	<dependency>
		<groupId>com.sap.cds</groupId>
		<artifactId>cds-adapter-odata-v2</artifactId>
		<scope>runtime</scope>
	</dependency>

	<dependency>
		<groupId>com.sap.cds</groupId>
		<artifactId>cds-adapter-odata-v4</artifactId>
		<scope>runtime</scope>
	</dependency>
	```

4. Optionally it's possible to configure different serve paths for the application services for different protocols. See [Serve configuration](./application-services#serve-configuration) for more details.

After rebuilding and restarting your application, your Application Services are exposed as OData V2 and OData V4 in parallel. This way, you can migrate your frontend code iteratively to OData V4.

<!-- TODO: Move this to "Development" section -->

<span id="afterenablingodata" />
