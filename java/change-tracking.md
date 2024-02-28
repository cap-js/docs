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

As of CAP Java 2.7.0, the change tracking feature is available. You can use this feature to track the changes of your entities and display them in the UI.

### Enabling change tracking

To use the change tracking feature, you need to enable it in your `pom.xml` file. Add the following dependency to your project:

```xml
    <dependency>
	    <groupId>com.sap.cds</groupId>
		<artifactId>cds-feature-change-tracking</artifactId>
		<scope>runtime</scope>
    </dependency>
```

You POM also must include the goal to resolve the CDS model delivered from the feature. See [Reference the New CDS Model in an Existing CAP Java Project](./plugins#reference-the-new-cds-model-in-an-existing-cap-java-project).

### Annotating entities

To capture changes, you need to extend your entities with a technical aspect and annotate the entity 
the annotation `@changelog` that will mark the elements whose changes are to be logged.

Given the following entity that represents a `Book` on the domain level:

```cds
namespace model;

entity Books {
    key ID: UUID;
    title: String;
    published: Date;
    stock: Integer;
}
```

```cds
namespace srv;

using {model} from '../db/schema'; // Our domain model

service Bookshop {
    entity Books as projection on model.Book;
}
```

You need to include the change log model that is delivered to you from the feature. It is typically available within 
your `srv` module, so you can include it in your `cds` file like this:

```cds
using {sap.changelog as changelog} from 'com.sap.cds/change-tracking';
```

Then, you have to extend the _domain_ entity with the aspect `changelog.changeTracked` that will store the references 
between changed entities and their changes:

```cds
namespace srv;

using {sap.changelog as changelog} from 'com.sap.cds/change-tracking';
using {model} from '../db/schema'; // Our domain model

extend model.Orders with changelog.changeTracked;

service Bookshop {
    entity Books as projection on model.Books;
}
```

This aspect will store the references between changed entities and their changes and include in your entity 
an association `changes` that will let you consume the change log both programmatically via CQN statements and in the UI. 
That implies that every projection of the entity `Books` will have this association and the changes will be 
visible in all of them.

Then, you need to say what elements of the entity you want to track. You can do this by annotating the elements 
of the entity with the `@changelog` annotation:

```cds
annotate Bookshop.Books {
  title @changelog;
  stock @changelog;
};
```

:::warning
Do not annotate the elements that are subject to audit logging for both read and write accesses 
(see [Audit Logging](./auditlog) for more information)
with the `@changelog` annotation. Such elements will never be change tracked and will be ignored by the change tracking feature.
:::

### Identifying changes

You can store some elements of the entity together with the changes in the change log to produce user-friendly identifier. 
You define this identifier by annotating the entity with the `@changelog` annotation and including the elements you want
to store together with the changed value:

```cds
annotate Bookshop.Book with @changelog: [
  title
];
```
This identifier can contain the elements of the entity or a values of to-one associations that are reachable via path. 
E.g. for a book you can store an author name if you have an association from the book to the author.

The elements of the identifier can be change tracked, but the best candidates are the elements 
that are insert-only or that do not change often. 

:::warning
The values of the identifier are stored together with the change log as-is. They are not translated and some data types might 
not be formatted per user locale or some requirements e.g. different units of measurement or currencies. 
You should consider this when you decide what to include in the identifier.
:::

### Displaying changes in the UI

The change tracking feature does not impose any restrictions on how you display the change logs in the UI, but delivers
you the components that you can use to display the changes together with the main entity on an object page as one of the
possible ways of doing so.

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

The definition of this facet is delivered from the change tracking feature and can be re-used for all entities.

If you want to have a common UI for all changes, you need to expose the change log as a projection and define
your own presentation for it as the changes are exposed only as part of the change tracked entity.

### What is change tracked?

The change tracking feature tracks the changes of all modifying operations that are executed on the entity via CQN statements, 
that includes the statements that you execute via custom code as well. It supports all kinds of modifying operations 
including the deep and the bulk updates. Changes made through native SQL, JDBC or other means that bypasses the CAP Java runtime are not tracked. 
Modifications that are forwarded to remote applications via Remote OData are not tracked as well.  

The level where you annotate your elements is very important: if you annotate the elements on the domain level,
that means that every change made through every projection of the entity will be tracked. If you annotate the elements
on the projection level, only the changes made through that projection will be tracked.

In case of the `Books` example above, the changes made through the `Books` projection will be tracked, but the changes
made on the domain entity will not be. That can be beneficial if you have a service that is used for data replication
or mass changes where change tracking can be very expensive operation, and you do not want to generate changes from such operations.

When you decide how to annotate your elements, you should consider not only the structure of it but also the way it is changed
in your applications including your custom code e.g. actions or functions. Otherwise, you might miss some changes or the change logs 
will be very hard to trace back to the origin of the change. 

### How change tracking feature identifies the changes?

Every modifying operation that is executed via the CQN requires an additional reads to retrieve the old state 
of the entity and the new state after the modifying operation.

Then they are compared and stored within the change log. Nature of the change is determined by comparing the old and new 
values of the entity: data that were not present in the old values are considered as added, data that are not present in 
the new values are considered as deleted. Elements that are present in both old and new values but have different values 
are considered as modified. This also works across compositions.

Each change detected by the change tracking feature is stored in the change log as a separate entry in the change log.

### How change logs are stored?

The namespace `sap.changelog` defines an entity `Changes` that reflects each change, so the changes are stored in a flat table for all entities together.

Each entry in the `Changes` entity contains the following information:

- the marker that represents the nature of the change: addition, modification or deletion.
- the qualified name of the entity that was changed and the qualified name of the root entity. They depend on the projection that was used to 
  change the entity and reflect the root and a target of the modifying operation. For flat entities, they are the same.
- the attribute of the target projection that was changed. 
- the new and old values as a strings. 
- the user who made the change and the timestamp of the change.
- the data type of the changed attribute.
- the path that contains the primary keys of the entity and names of the attributes from the root to the target.

### Things to consider when using change tracking

- Consider the storage costs of the change log. The change log can grow very fast and can consume a lot of space 
  in case of frequent changes. You should consider the retention policy of the change log as it will not be deleted when you delete the entities. 
- Consider the performance impact. Change tracking needs to execute additional reads during updates to retrieve and compare updated values. 
  This can slow down the update operations and can be very expensive in case of updates that affect a lot of entities.
- Consider the ways your entities are changed. You might want to track the changes only on the projections that are used for 
  the user interaction and not on the domain level or for data replication.
- If you want to expose the complete change log to the user, you need to consider the security implications of this. If your entities have complex access rules, 
  you need to consider how to extend this rules to the change log. 
