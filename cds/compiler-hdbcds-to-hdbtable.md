---
shorty: Moving from .hdbcds to .hdbtable
synopsis: >
  This document describes the issues to expect when migrating from .hdbcds-based HDI deployment to .hdbtable-based HDI deployment.

# layout: cds-ref
redirect_from: releases/compiler-v2
status: internal
---

# Moving from .hdbcds to .hdbtable

{{ $frontmatter.synopsis }}

With @sap/cds-compiler@5 we've deprecated the `to.hdbcds` function. We will not be developing new features for it.

In order to move from `to.hdbcds` to the .hdbtable-based `to.hdi` three steps need to be done:

- ensure your current datamodel is actually the deployed datamodel
- switch the deployment format from `hdbcds` to `hdbtable` using option `cds.requires.db.deploy-format`<!-- todo: can only find this option mentioned in a changelog :( -->
- set `undeploy.json` to undeploy all the CAP-generated .hdbcds-files

::: code-group

```json [db/undeploy.json]
[
  "src/gen/**/*.hdbcds"
]
```
:::

- build and deploy your datamodel

In theory, there is an intelligent handover mechanism when following the above steps that inside of HDI simply switches ownership of the tables to the .hdbtable plugin and does not require a full table migration. In practice, there are some scenarios where the .hdbcds we generate and the .hdbtable we generate do not allow a seamless migration.

If the tables do not contain much data, it should not make that much of a difference. With huge amounts of data, expect a longer and more resource intensive deployment!

So far we've identified the following scenarios where a seamless migration is not possible - one of them with a workaround:

## `WITH ASSOCIATIONS`

Unfortunately associations cause issues in our .hdbcds to .hdbtable handover. With the option `withHanaAssociations`, you can ensure that associations will not be part of the .hdbcds and .hdbtable files and therefore not hinder the migration.

This only works if your custom coding does not use these associations on the database.

::: code-group

```json [cdsrc.json]
{
  "cdsc": {
    "withHanaAssociations": false
  }
}
```
:::

Once you've set this option, run a new build of your .hdbcds artifacts. The should not contain the associations anymore. Deploy these newly generated files and then proceed with the steps described initially.

<!-- todo: show effect of the option? -->


## timesliced temporal/@cds.valid.key

```cds
namespace com.acme.hr;
using { temporal } from '@sap/cds/common';
using { com.acme.common.Persons } from './common';

entity Employees : Persons {
  jobs : Composition of many WorkAssignments on jobs.empl=$self;
  job1 : Association to one /*of*/ WorkAssignments;
}

entity WorkAssignments: temporal {
  key ID  : UUID;
  sliceId : UUID @cds.valid.key; // ID of the time slice
  role    : String(111);
  empl    : Association to Employees;
  dept    : Association to Departments;
}

entity Departments {
  key ID  : UUID;
  name    : String(111);
  head    : Association to Employees;
  members : Association to many Employees on members.jobs.dept = $self;
}
```

In the above sample, the entity `TemporalWithTimeSliceId` can't be seamlessly migrated and a full table migration will take place.

## Multiline doc comments

```cds
entity Employees {
  key ID : Integer;
  /**
    * I am the description for "name".
    * I span across multiple lines.
    *
    * With multiple paragraphs.
    */
  name : String;
}
```

In the above sample, the entity `Service.BaseEntity` can't be seamlessly migrated and a full table migration will take place. This is due to a difference in the way `doc`-comments are passed to the database.

::: code-group

```json [cdsrc.json]
{
  "hana": {
    "comments": true
  }
}
```
:::

<!-- todo: can hdbcds easily drop comments? -->

If you don't actually need the comments on database-level, then you can disable them with option `hana.comments`. Once you've set this option, run a new build of your .hdbcds artifacts. The should not contain the associations anymore. Deploy these newly generated files and then proceed with the steps described initially.

## @sql.append and @sql.prepend

Native database features added via `@sql.append` and `@sql.prepend` might work or might not - we cannot offer any guidance here.

