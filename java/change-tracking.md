---
synopsis: >
  Find here information about the change tracking feature in CAP Java.
status: released
---

# Change Tracking <Beta />

<style scoped>
  h1:before {
    content: "Java"; display: block; font-size: 60%; margin: 0 0 .2em;
  }
</style>

The feature tracks the changes of all modifying operations executed via CQN statements, which are indirectly triggered
by the protocol adapters or directly by a custom code.
Changes made through the native SQL, JDBC, or other means that bypass the CAP Java runtime or that are forwarded
to the remote services aren't tracked.

## Enabling Change Tracking

To use the change tracking feature, you need to add a dependency to [cds-feature-change-tracking](https://central.sonatype.com/artifact/com.sap.cds/cds-feature-change-tracking) in the `pom.xml` file of your service:

```xml
<dependency>
  <groupId>com.sap.cds</groupId>
    <artifactId>cds-feature-change-tracking</artifactId>
    <scope>runtime</scope>
</dependency>
```

Your POM must also include the goal to resolve the CDS model delivered from the feature.
See [Reference the New CDS Model in an Existing CAP Java Project](/java/building-plugins#reference-the-new-cds-model-in-an-existing-cap-java-project).

For the UI part, you also need to enable the [On-the-fly Localization of EDMX](/releases/archive/2023/dec23#on-the-fly-localization-of-edmx).

### Annotating Entities

To capture changes for an entity, you need to extend it with a technical aspect and annotate it
with the annotation `@changelog` that declares the elements whose changes are to be logged.

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
    entity Books as projection on model.Books;
}
```

Include the change log model that is provided by this feature:

```cds
using {sap.changelog as changelog} from 'com.sap.cds/change-tracking';
```

Extend **the domain entity** with the aspect `changelog.changeTracked` like this:

```cds
extend model.Books with changelog.changeTracked;
```

This aspect adds the association `changes` that lets you consume the change log both programmatically
via CQN statements and in the UI. This implies that every projection
of the entity `Books` has this association and the changes will be visible in all of them.

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

Annotate elements of the entity that you want to track with the `@changelog` annotation:

```cds
annotate Bookshop.Books {
  title @changelog;
  stock @changelog;
};
```

:::warning Personal data is ignored
Elements with [personal data](../guides/data-privacy/annotations#personaldata), that is, elements that are annotated
with @PersonalData and hence subject to audit logging, are ignored by the change tracking.
:::

The level where you annotate your elements with the annotation `@changelog` is very important. If you annotate
the elements on the _domain_ level, every change made through every projection of the entity is tracked.
If you annotate the elements on the _service_ level, only the changes made through that projection are tracked.

In case of the books example above, the changes made through the service entity `Bookshop.Books` are tracked, but the changes
made on the domain entity are omitted. That can be beneficial if you have a service that is used for data replication
or mass changes where change tracking can be a very expensive operation, and you do not want to generate changes from such operations.

Change tracking also works with the entities that have compositions and tracks the changes made to the items of the compositions.

For example, if you have an entity that represents the order with a composition that represents the items of the order,
you can annotate the elements of both and track the changes made through the order and the items in a deep update.

```cds
entity OrderItems {
  key ID: UUID;
  [...]
  quantity: Integer @changelog;
}

entity Orders {
  key ID: UUID;
  customerName: String @changelog;
  [...]
  items: Composition of many OrderItems;
}
```

### Identifiers for Changes

You can store some elements of the entity together with the changes in the change log to produce a user-friendly identifier.
You define this identifier by annotating the entity with the `@changelog` annotation and including the elements that you want
to store together with the changed value:

```cds
annotate Bookshop.Book with @changelog: [
  title
];
```

This identifier can contain the elements of the entity or values of to-one associations that are reachable via path.
For example, for a book you can store an author name if you have an association from the book to the author.

The best candidates for identifier elements are the elements that are insert-only or that don't change often.

:::warning Stored as-is
The values of the identifier are stored together with the change log as-is. They are not translated and some data types might
not be formatted per user locale or some requirements, for example, different units of measurement or currencies.
You should consider this when you decide what to include in the identifier.
:::

### Displaying Changes

The changes of the entity are exposed as an association `changes` that you can use to display the change log in the UI.
By default, the entity `Changes` is auto-exposed, but it won't be writable via OData requests.

If you want to display the change log together with the overview of your entity, you need to add the facet
to the object page that displays the changes:

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
your own presentation for it as the changes are exposed only as part of the change-tracked entity. This projection
must be read-only and shouldn't be writable via OData requests.

The change log is extended with the texts for your entities from the `@title` annotation and the element. Otherwise, the change log contains only the technical names of the entities and the elements.
Titles are translated, if they're annotated as translatable. See [Externalizing Texts Bundles](../guides/i18n#localization-i18n) for more information.

## How Changes are Stored

The namespace `sap.changelog` defines an entity `Changes` that reflects each change, so the changes are stored in a flat table for all entities together.

Each entry in the `Changes` entity contains the following information:

- A marker that represents the nature of the change: addition, modification, or deletion.
- The qualified name of the entity that was changed and the qualified name of the root entity. They depend on the projection that was used to
  change the entity and reflect the root and a target of the modifying operation. For flat entities, they're the same.
- The attribute of the target projection that was changed.
- The new and old values as strings.
- The user who made the change and the timestamp of the change.
- The data type of the changed attribute.
- The technical path from the root entity to the tracked target entity.

## Detection of Changes

The change tracking intercepts the modifying CQL statements (`Insert`, `Upsert`, `Update`, and `Delete`) and
requires additional READ events to retrieve the old and the new image of the entity.

These two images are compared and differences are stored in the change log. The nature of the change is determined by comparing the old and new
values of the entity: data that weren't present in the old values are considered as added whereas data that aren't present in
the new values are considered as deleted. Elements that are present in both old and new values but have different values
are considered as modified. Each change detected by the change tracking feature is stored in the change log as a separate entry.

In the case of the deeply structured documents, for example, entities with the compositions, the change tracking feature detects
the changes across the complete document and stores them in the change log with the metadata reflecting the structure of the change.

For example, given the order and item model from above, if you change values for the tracked elements with
the deep update, for example, the customer name in the order and the quantity of the item, the change log contains
two entries: one for the order and one for the item. The change log entry for the item will also reflect that
the root of the change is an order.

:::warning Prefer deep updates for change tracked entities
If you change the values of the `OrderItems` entity directly via an OData request or a CQL statement, the change log contains only one entry for the item and won't be associated with an order.
:::

## Things to Consider when Using Change Tracking

- Consider the storage costs of the change log. The change log can grow very fast and can consume a lot of space
  in case of frequent changes. You should consider the retention policy of the change log as it won't be deleted when you delete the entities.
- Consider the performance impact. Change tracking needs to execute additional reads during updates to retrieve and compare updated values.
  This can slow down the update operations and can be very expensive in the case of updates that affect a lot of entities.
- Consider the ways your entities are changed. You might want to track the changes only on the service projection level that are used for
  the user interaction and not on the domain level (for instance during data replication).
- If you want to expose the complete change log to the user, you need to consider the security implications of this. If your entities have complex access rules,
  you need to consider how to extend these rules to the change log.


## Diff Processor

In your business logic you may want to compare two states of an entity e.g. before and after an operation. Usually, you might want to react on changed values, for instance, to track changes accordingly.
To do that you can use `CdsDiffProcessor`, similar to the [Data Processor](/java/cds-data#cds-data-processor). 
It traverses through two states of the entity and reports you differences between them along the way.

You create an instance of the `CdsDiffProcessor` using the `create()` method:

```java
CdsDiffProcessor diff = CdsDiffProcessor.create();
```

You can compare the data represented as [structured data](/java/cds-data#structured-data), results of the CQN statements or arguments of event handlers. 
To do a comparison, `CdsDiffProcessor` requires the following in your data:

- entities must include full set of primary keys
- names of the elements must match the elements of the entity type
- associations must be represented as [nested Structures and Associations](/java/cds-data#nested-structures-and-associations) according to the association cardinality.

The [delta representation](/java/working-with-cql/query-api#deep-update-delta) of collections is also supported.

You run the comparison by calling the `process()` method and supplying new and old image of the data as a `Map` or a collection of them and the type of the compared entity.

```java
List<Map<String, Object>> newImage;
List<Map<String, Object>> oldImage;
CdsStructuredType type;

diff.process(newImage, oldImage, type);
```

In case of the results of CQN statements, use the type [that comes with the result](/java/working-with-cql/query-execution#introspecting-the-row-type). 
It may not exactly match the type of the entity that you have selected, but allows you to compare the elements that were synthesized within the statement e.g. constants, case expressions, inlined and aliased values etc.

```java
Result newImage = service.run(Select.from(...));
Result oldImage = service.run(Select.from(...));

diff.process(newImage, oldImage, newImage.rowType());
```

:::tip Draft-enabled Entities
For draft-enabled entities, you may omit value of `IsActiveEntity` in the images.
If you compare active and inactive state of the same entity using them as an old and new image make sure that
the values of `IsActiveEntity` is either absent or the same in both images.
:::

When one of the images is empty, the `CdsDiffProcessor` traverses through the existing state treating it as an addition or removal mirroring the logic accordingly.

Changes detected by `CdsDiffProcessor` are reported to one or more visitors implementing the interface `CdsDiffProcessor.DiffVisitor`.

The visitor is added to `CdsDiffProcessor` with the `add()` method.

```java
diff.add(new DiffVisitor() {
  @Override
  public void changed(Path newPath, Path oldPath, CdsElement element, Object newValue, Object oldValue) {
      // changes
  }

  @Override
  public void added(Path newPath, Path oldPath, CdsElement association, Map<String, Object> newValue) {
      // additions
  }

  @Override
  public void removed(Path newPath, Path oldPath, CdsElement association, Map<String, Object> oldValue) {
      // removals
  }
});
```

The visitor can be added together with the [element filter](/java/cds-data#element-filters) that limits the subset of changes reported to the visitor.

```java
diff.add(
  new Filter() {
    @Override
    public boolean test(Path path, CdsElement element, CdsType type) {
        return true;
    }
  },
  new DiffVisitor() {
    ...
  }
);
```

You may add as many visitors as you need by chaining the `add()` calls. 
Each instance of the `CdsDiffProcessor` can have own set of visitors added to it.

If your visitors need to be stateful, prefer one-time disposable objects for them. `CdsDiffProcessor` does not manage the state of them.

### Implementing a DiffVisitor

Additions and removals to/from entity state reported as calls to methods `added()` or `removed()` as a parts of the entity content as a structured data. 
They are not traversed further on the element level.

The methods `added()` and `removed()` have the following arguments:

- `newPath` and the `oldPath` as an instances of [`Path`](https://www.javadoc.io/doc/com.sap.cds/cds4j-api/latest/com/sap/cds/ql/cqn/Path.html) reflecting the new and old state of the entity.
- `association` as an instance of [`CdsElement`](https://www.javadoc.io/doc/com.sap.cds/cds4j-api/latest/com/sap/cds/reflect/CdsElement.html) or null value, if the entity is added from the root.
- state of the changed data as a `Map` as the `newValue` or `oldValue`.

The instances of the `Path` represent the placement of the changed item within the whole entity. While these paths are always have the same structure, `oldPath` or `newPath` respectively has an empty values to represent absence of the entity state.

Let's break it down with the examples:

Given that we have a collection of books each has a composition of many editions.

+ When a new book is added to the collection, the method `added()` is called once with the `Path` instance with one segment representing a book as the `newPath`, `association` will be null and the `newValue` will also be the state of the book. We can deduce that the new book was added to a collection of the books with certain state.

+ When a new editions are added to two of the books in the collection one per each book: the method `added()` is called twice with the `Path` instance with two segments representing the book and the association to the edition, association element is the value of the argument `association`, the state of the edition is the `newValue`. In this case, each added edition is accompanied by the state of the respective book. 

+ Given the previous example, there are two new editions added to one of the books: the `added()` method will be called once per edition added. Path instances with same book (same primary key) tell you which edition belong to which book.

Method `changed()` is called for each change in the element values and has the following arguments: 

- pair of `Path` instances (`newPath` and `oldPath`) reflecting the new and old state of the entity.
- changed element as an instance of [`CdsElement`](https://www.javadoc.io/doc/com.sap.cds/cds4j-api/latest/com/sap/cds/reflect/CdsElement.html). 
- new and old value as an `Object` instances.

Paths have the same target (the entity where changed element is) but their values represent the old and new state of the entity as a whole including non-changed elements.

Let's break it down with the examples: 

Given that we have a collection of books with editions, as before.

+ When book title is changed from one value to the other, the method `changed()` is called once with both `Path` instances representing a book (with old and new state, including the title), element `title` is available as an instance of `CdsElement`, the new and old value of the title are available as `newValue` and `oldValue`.
+ When title of the edition is changed for one of the books, the `changed()` method is called once, the paths include the book and the edition. Element reference and values are set accordingly.

Each change will be observable at most once excluding the states of the entities in the `Path` instances which are stable between calls.

For changes in the associations, when association state is present in both images, even if key values are different, the `change()` method will always be called for the content of the association traversing it value-by-value. In case data is absent in one of them, the `added()` or `removed()` will be called instead.

Several visitors added to the `CdsDiffProcessor` are called one by one, but you should not expect the guaranteed order of the calls for them. Consider them as an independent beings.

:::danger Immutable Data
Do not modify the state of the images inside the visitors. Consider the data presented to it immutable.
:::

### Filtering for DiffVisitor

Element filters are useful if you want to extract some common condition out of your visitor implementation so that you do not have to branch in all methods of your visitor. 

As a general rule, you may assume that element filter is called at least once for each value you have in your
images even if their values are not changed and the visitor supplied next to the filter is called for elements where the element filter condition is evaluated to `true`.

In the implementation of the filter you can use the definition of the
[`CdsElement`](https://www.javadoc.io/doc/com.sap.cds/cds4j-api/latest/com/sap/cds/reflect/CdsElement.html), its type
or a [`Path`](https://www.javadoc.io/doc/com.sap.cds/cds4j-api/latest/com/sap/cds/ql/cqn/Path.html) to decide if you want your visitor to be notified about the detected change.

In simple cases, you may use the element and its type to limit the visitor so that it observes only elements having a certain annotation
or having a certain common type, for example, only numbers.

For more complex scenarios, [`Path`](https://www.javadoc.io/doc/com.sap.cds/cds4j-api/latest/com/sap/cds/ql/cqn/Path.html) can be used. It represents the placement
of the element that is offered to a filter in the structure of the whole entity as a sequence of segments.
The most useful part of the path is the target available as the result of the `target()` method that you can use to evaluate the type of the current entity, its annotations and
the values of primary keys.

For example, if you compare a collection of books to find out of there is a differences in it, but you are only interested in authors, you can write a filter using the entity type.

```java
diff.add(new Filter() {
  @Override
  public boolean test(Path path, CdsElement cdsElement, CdsType cdsType) {
    return path.target().type().getQualifiedName().equals(Authors_.CDS_NAME);
  }
}, ...);
```

Filters cannot limit the nature of the changes your visitor will observe and are always positive.

### Deep Traversal

For documents that have a lot of associations or a compositions and are changed in a deep way you might want to see additions for each level separately.

To enable this, you create an instance of `CdsDiffProcessor` like that:

```java
CdsDiffProcessor diff = CdsDiffProcessor.create().forDeepTraversal();
```

In this mode, the methods `added()` and `removed()` are called not only for the root of the added or removed data, but also traverse the added or removed data entity by entity.

It can be useful, if you want to track the additions and removals of the certain entities on the leaf levels or as part of visitors tailored for generic use cases.