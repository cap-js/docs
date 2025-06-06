---
# layout: cds-ref
shorty: Annotations
synopsis: >
  Find here a reference and glossary of common annotations intrinsically supported by the CDS compiler and runtimes.
status: released
uacp: Used as link target from Help Portal at https://help.sap.com/products/BTP/65de2977205c403bbc107264b8eccf4b/855e00bd559742a3b8276fbed4af1008.html
---

# Common Annotations

{{ $frontmatter.synopsis }}

[Learn more about the syntax of annotations.](./cdl#annotations){.learn-more}

[[toc]]


## General Purpose

| Annotation     | Description | Alternatives       |
|----------------|-------------|--------------------|
| `@title`       |             | `Common.Label`     |
| `@description` |             | `Core.Description` |


## Access Control

| Annotation    | Description                                                      |
|---------------|------------------------------------------------------------------|
| `@restrict`   | see [Authorization](../guides/security/authorization#restrict-annotation) |
| `@requires`   | see [Authorization](../guides/security/authorization#requires)            |


## Input Validation

| Annotation          | Description                                                          |
|---------------------|----------------------------------------------------------------------|
| `@readonly `        | see [Input Validation](../guides/providing-services#readonly)       |
| `@mandatory`        | see [Input Validation](../guides/providing-services#mandatory)      |
| `@assert.target`    | see [Input Validation](../guides/providing-services#assert-target)  |
| `@assert.format`    | see [Input Validation](../guides/providing-services#assert-format)  |
| `@assert.range`     | see [Input Validation](../guides/providing-services#assert-range)   |




## Services / APIs

| Annotation           | Description                                                                        |
|----------------------|------------------------------------------------------------------------------------|
| `@path`              | see [Services](./cdl#service-definitions)                                          |
| `@impl`              | see [Reuse & Compose](../guides/extensibility/composition#reuse-code)              |
| `@odata.etag`        | see [Providing Services](../guides/providing-services#etag)                       |
| `@cds.autoexpose`    | see [Providing Services](../guides/providing-services#auto-exposed-entities)      |
| `@cds.api.ignore`    | see [OData](../advanced/odata#omitting-elements-from-apis)                         |
| `@cds.query.limit`   | see [Providing Services](../guides/providing-services#annotation-cds-query-limit) |
| `@cds.localized`     | see [Localized Data](../guides/localized-data#read-operations)                     |
| `@cds.valid.from/to` | see [Temporal Data](../guides/temporal-data#using-annotations-cds-valid-from-to)   |
| `@cds.search`        | see [Search Capabilities](../guides/providing-services#searching-data)            |

## Persistence

| Annotation                | Description                                                            |
|---------------------------|------------------------------------------------------------------------|
| `@cds.persistence.exists` | see [Generating DDL Files](../guides/databases#cds-persistence-exists) |
| `@cds.persistence.table`  | see [Generating DDL Files](../guides/databases#cds-persistence-table)  |
| `@cds.persistence.skip`   | see [Generating DDL Files](../guides/databases#cds-persistence-skip)   |
| `@cds.persistence.mock`   | `false` excludes this entity from automatic mocking                    |
| `@cds.on.insert`          | see [Providing Services](../guides/providing-services)                 |
| `@cds.on.update`          | see [Providing Services](../guides/providing-services)                 |
| `@sql.prepend`            | see [Generating DDL Files](../guides/databases#sql-prepend-append)     |
| `@sql.append`             | see [Generating DDL Files](../guides/databases#sql-prepend-append)     |

## OData

[Learn more about **OData Annotations in CDS**.](../advanced/odata#annotations){.learn-more}

Shortcuts:

| Annotation          | Description                                          |
|---------------------|------------------------------------------------------|
| `@ValueList.entity` | see [Domain Modeling](../guides/domain-modeling)     |
| `@odata.Type`       | see [OData](../advanced/odata#override-type-mapping) |
| `@odata.MaxLength`  | see [OData](../advanced/odata#override-type-mapping) |
| `@odata.Precision`  | see [OData](../advanced/odata#override-type-mapping) |
| `@odata.Scale`      | see [OData](../advanced/odata#override-type-mapping) |
| `@odata.singleton`  | see [OData](../advanced/odata#singletons)            |

Intrinsically supported OData Annotations:

| Annotation             | Description                                                      |
|------------------------|------------------------------------------------------------------|
| `@Core.Computed`       | see [Providing Services](../guides/providing-services#readonly) |
| `@Core.Immutable`      | see [Providing Services](../guides/providing-services#readonly) |
| `@Core.MediaType`      | see [Media Data](../guides/providing-services#serving-media-data)                          |
| `@Core.IsMediaType`    | see [Media Data](../guides/providing-services#serving-media-data)                          |
| `@Core.IsUrl`          | see [Media Data](../guides/providing-services#serving-media-data)                          |
| `@Capabilities...`     | see [Fiori](../advanced/fiori)                                   |
