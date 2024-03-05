---
synopsis: >
  Find here information about the change tracking feature in CAP Java.
status: released
---

# Change Tracking (beta)
<style scoped>
  h1:before {
    content: "Java"; display: block; font-size: 60%; margin: 0 0 .2em;
  }
</style>

As of CAP Java 2.7.0, the change tracking feature is available. The feature tracks the changes of all modifying 
operations executed via CQN statements which are indirectly triggered by the protocol adapters or directly by a custom code. 
Changes made through the native SQL, JDBC or other means that bypass the CAP Java runtime or that are forwarded 
to the remote services are not tracked.

## Enabling change tracking

To use the change tracking feature, you need to enable it in the `pom.xml` file of your service by adding the following dependency:

```xml
<dependency>
  <groupId>com.sap.cds</groupId>
    <artifactId>cds-feature-change-tracking</artifactId>
    <scope>runtime</scope>
</dependency>
```

Your POM also must include the goal to resolve the CDS model delivered from the feature. 
See [Reference the New CDS Model in an Existing CAP Java Project](./plugins#reference-the-new-cds-model-in-an-existing-cap-java-project).

For the UI part, you also need to enable the feature described 
here [On-the-fly Localization of EDMX](https://cap.cloud.sap/docs/releases/dec23#on-the-fly-localization-of-edmx).

### Annotating entities

To capture changes, you need to extend your entities with a technical aspect and annotate the entity 
with annotation `@changelog` that will mark the elements whose changes are to be logged.

Given the following entity that represents a book on the domain level:

```cds
namespace model;

entity Books {
    key ID: UUID;
    title: String;
    stock: Integer;
}
```

And the corresponding service definition with the projection of the entity:

```cds
namespace srv;

using {model} from '../db/schema'; // Our domain model

service Bookshop {
    entity Books as projection on model.Book;
}
```

You need to include the change log model that is delivered to you from the feature like this:

```cds
using {sap.changelog as changelog} from 'com.sap.cds/change-tracking';
```

Then, you have to **extend the domain entity** with the aspect `changelog.changeTracked` like this: 

```cds
extend model.Books with changelog.changeTracked;
```

This aspect will include the association `changes` that will let you consume the change log both programmatically 
via CQN statements and in the UI. This implies that every projection 
of the entity `Books` will have this association and the changes will be visible in all of them. 

Your extended service definition should look like this:

```cds
namespace srv;

using {sap.changelog as changelog} from 'com.sap.cds/change-tracking';
using {model} from '../db/schema';

extend model.Books with changelog.changeTracked;

service Bookshop {
    entity Books as projection on model.Books;
}
```

Then, you need to annotate elements of the entity you want to track with the `@changelog` annotation:

```cds
annotate Bookshop.Books {
  title @changelog;
  stock @changelog;
};
```

:::warning
Elements annotated with `@changelog` and which are subject to audit logging, i.e. annotated 
with `@PersonalData` are ignored by the change tracking feature. 
Personal data must be handled by the [Audit Logging](./auditlog) service.
:::

The level where you annotate your elements with the annotation `@changelog` is very important: if you annotate
the elements on the domain level, that means that every change made through every projection of the entity will be tracked.
If you annotate the elements on the projection level, only the changes made through that projection is tracked.

In case of the `Books` example above, the changes made through the service entity `Bookshop.Books` are tracked, but the changes
made on the domain entity are omitted. That can be beneficial if you have a service that is used for data replication
or mass changes where change tracking can be very expensive operation, and you do not want to generate changes from such operations.

### Identifiers for the changes

You can store some elements of the entity together with the changes in the change log to produce user-friendly identifier. 
You define this identifier by annotating the entity with the `@changelog` annotation and including the elements you want
to store together with the changed value:

```cds
annotate Bookshop.Book with @changelog: [
  title
];
```
This identifier can contain the elements of the entity or a values of to-one associations that are reachable via path. 
For example, for a book you can store an author name if you have an association from the book to the author. 

The best candidates for identifier elements are the elements that are insert-only or that do not change often. 

:::warning
The values of the identifier are stored together with the change log as-is. They are not translated and some data types might 
not be formatted per user locale or some requirements e.g. different units of measurement or currencies. 
You should consider this when you decide what to include in the identifier.
:::

### Displaying changes in the UI

If you want to display the change log together with the overview of your entity, you need to add the facet
to the object page that will display the changes:

```cds
annotate Bookshop.Books with @(
  UI : { ...
    Facets : [ ...
       {
          $Type               : 'UI.ReferenceFacet',
          ID                  : 'ChangeHistoryFacet',
          Label               : '{i18n>ChangeHistory}',
          Target              : 'changes/@UI.PresentationVariant',
          ![@UI.PartOfPreview]: false
        } ...
   ] ...
  } ...);
```

If you want to have a common UI for all changes, you need to expose the change log as a projection and define
your own presentation for it as the changes are exposed only as part of the change tracked entity.

## Detection of changes

Every modifying CQN-based operation requires additional READ events to retrieve the old state 
of the entity and the new state after the modifying operation.

The images are compared and differences are stored within the change log. Nature of the change is determined by comparing the old and new 
values of the entity: data that were not present in the old values are considered as added whereas data that are not present in 
the new values are considered as deleted. Elements that are present in both old and new values but have different values 
are considered as modified. This also works across compositions.

Each change detected by the change tracking feature is stored in the change log as a separate entry in the change log.

## How change logs are stored?

The namespace `sap.changelog` defines an entity `Changes` that reflects each change, so the changes are stored in a flat table for all entities together.

Each entry in the `Changes` entity contains the following information:

- A marker that represents the nature of the change: addition, modification or deletion.
- The qualified name of the entity that was changed and the qualified name of the root entity. They depend on the projection that was used to 
  change the entity and reflect the root and a target of the modifying operation. For flat entities, they are the same.
- The attribute of the target projection that was changed. 
- The new and old values as strings. 
- The user who made the change and the timestamp of the change.
- The data type of the changed attribute.
- The technical path from the root entity to the tracked target entity.

## Things to consider when using change tracking

- Consider the storage costs of the change log. The change log can grow very fast and can consume a lot of space 
  in case of frequent changes. You should consider the retention policy of the change log as it will not be deleted when you delete the entities. 
- Consider the performance impact. Change tracking needs to execute additional reads during updates to retrieve and compare updated values. 
  This can slow down the update operations and can be very expensive in case of updates that affect a lot of entities.
- Consider the ways your entities are changed. You might want to track the changes only on the service projection level that are used for 
  the user interaction and not on the domain level (for instance during data replication).
- If you want to expose the complete change log to the user, you need to consider the security implications of this. If your entities have complex access rules, 
  you need to consider how to extend this rules to the change log. 
