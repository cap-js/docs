---
layout: cds-ref
shorty: Annotations
synopsis: >
  Find here a reference and glossary of common annotations intrinsically supported by the CDS compiler and runtimes.
status: released
uacp: Used as link target from Help Portal at https://help.sap.com/products/BTP/65de2977205c403bbc107264b8eccf4b/855e00bd559742a3b8276fbed4af1008.html
---

# Common Annotations

{{ $frontmatter.synopsis }}

[Learn more about the syntax of annotations.](./cdl#annotations){.learn-more}


## General Purpose

| Annotation     | Description | Alternatives       |
|----------------|-------------|--------------------|
| `@title`       |             | `Common.Label`     |
| `@description` |             | `Core.Description` |


## Access Control

| Annotation    | Description                                                       |
|---------------|-------------------------------------------------------------------|
| `@readonly`   | see [Input Validation](../guides/providing-services/#readonly)    |
| `@insertonly` | see [Generic Handlers]                                            |
| `@restrict`   | see [Authorization](../guides/authorization#restrict-annotation) |
| `@requires`   | see [Authorization](../guides/authorizatio#requires)            |


## Input Validation

| Annotation          | Description                                                          |
|---------------------|----------------------------------------------------------------------|
| `@readonly `        | see [Input Validation](../guides/providing-services/#readonly)       |
| `@mandatory`        | see [Input Validation](../guides/providing-services/#mandatory)      |
| `@assert.unique`    | see [Input Validation](../guides/providing-services/#unique)         |
| `@assert.integrity` | see [Input Validation](../guides/providing-services/#refs)           |
| `@assert.target`    | see [Input Validation](../guides/providing-services/#assert-target)  |
| `@assert.format`    | see [Input Validation](../guides/providing-services/#assert-format)  |
| `@assert.range`     | see [Input Validation](../guides/providing-services/#assert-range)   |
| `@assert.notNull`   | see [Input Validation](../guides/providing-services/#assert-notNull) |




## Services / APIs

| Annotation           | Description                                                                      |
|----------------------|----------------------------------------------------------------------------------|
| `@path`              | see [Services](./cdl#service-definitions)                                        |
| `@impl`              | see [Reuse & Compose](../guides/extensibility/composition#reuse-code)            |
| `@odata.etag`        | see [Providing Services](../guides/providing-services/#etag)                     |
| `@cds.autoexpose`    | see [Providing Services](../guides/providing-services/#auto-exposed-entities)    |
| `@cds.api.ignore`    | see [OData](../advanced/odata#omitting-elements-from-apis)                       |
| `@cds.query.limit`   | see [Providing Services](../guides/providing-services/#annotation-cdsquerylimit) |
| `@cds.localized`     | see [Localized Data](../guides/localized-data/#read-operations)                  |
| `@cds.valid.from/to` | see [Temporal Data](../guides/temporal-data/#using-annotations-cdsvalidfromto)   |
| `@cds.search`        | see [Search Capabilities](../guides/providing-services/#searching-data)          |

## Persistence

| Annotation                | Description                                                        |
|---------------------------|--------------------------------------------------------------------|
| `@cds.persistence.exists` | tells `compile.to.sql` this is created otherwise                   |
| `@cds.persistence.table`  | tells `compile.to.sql` to create a table, not a view               |
| `@cds.persistence.skip`   | tells the compiler, this entity shall not exist in database at all |
| `@cds.persistence.mock`   | `false` excludes this entity from automatic mocking                |
| `@cds.on.insert`          | see [Providing Services]                                           |
| `@cds.on.update`          | see [Providing Services]                                           |


## OData

[Learn more about **OData Annotations in CDS**.][OData Annotations]{.learn-more}

Shortcuts:

| Annotation          | Description                                          |
|---------------------|------------------------------------------------------|
| `@ValueList.entity` | see [Domain Modeling]                                |
| `@odata.Type`       | see [OData](../advanced/odata#override-type-mapping) |
| `@odata.MaxLength`  | see [OData](../advanced/odata#override-type-mapping) |
| `@odata.Precision`  | see [OData](../advanced/odata#override-type-mapping) |
| `@odata.Scale`      | see [OData](../advanced/odata#override-type-mapping) |
| `@odata.singleton`  | see [OData](../advanced/odata#singletons)            |

Intrinsically supported OData Annotations:

| Annotation             | Description                                                      |
|------------------------|------------------------------------------------------------------|
| `@Core.Computed`       | see [Providing Services](../guides/providing-services/#readonly) |
| `@Core.Immutable`      | see [Providing Services](../guides/providing-services/#readonly) |
| `@Core.MediaType`      | see [Media Data](../guides/media-data/)                          |
| `@Core.IsMediaType`    | see [Media Data](../guides/media-data/)                          |
| `@Core.IsUrl`          | see [Media Data](../guides/media-data/)                          |
| `@Capabilities...`     | see [Fiori](../advanced/fiori)                                   |
| `@Common.FieldControl` | see [Input Validation]                                           |
