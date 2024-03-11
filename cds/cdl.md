---
# shorty: Definition Language
synopsis: >
  A reference and overview of all CDS concepts and features with compact examples written in CDS' definition language.
#permalink: /cds/cdl/
status: released
uacp: Used as link target from Help Portal at https://help.sap.com/products/BTP/65de2977205c403bbc107264b8eccf4b/855e00bd559742a3b8276fbed4af1008.html
---

<!--@include: ../links.md-->

# Definition Language (CDL)
<!-- <style scoped>
  h2 {
    font-weight: 300; font-size: 2.8em; color: #222;
    border-bottom: .5px solid silver;
    padding-bottom: 5px;
  }
  h3 {
    font-weight: 400;
    font-size: 1.5em;
  }
</style> -->

Find here a reference of all CDS concepts and features in the form of compact examples.
The examples are given in **_CDL_**, a human-readable syntax for defining models, and **_CQL_**, an extension of SQL to write queries.

[[toc]]


<br>

Refer also to [_The Nature of Models_](models) and the [_CSN specification_](./csn) to complete your understanding of CDS.

<br>


## Entity and Type Definitions

- [Entity Definitions](#entities) — `define entity`
- [Type Definitions](#types) — `define type`
- [Predefined Types](#predefined-types)
- [Structured Types](#structured-types)
- [Arrayed Types](#arrayed-types)
- [Virtual Elements](#virtual-elements)
- [Literals](#literals)
- [Delimited Identifiers](#delimited-identifiers)
- [Calculated elements](#calculated-elements)
- [Default Values](#default-values)
- [Type References](#typereferences)
- [Constraints](#constraints)
- [Enums](#enums)




### Entity Definitions — `define entity`
{#entities}

Entities are structured types with named and typed elements,
representing sets of (persisted) data that can be read and manipulated using usual CRUD operations.
They usually contain one or more designated primary key elements:

<!-- cds-mode: compile -->
```cds
define entity Employees {
  key ID : Integer;
  name : String;
  jobTitle : String;
}
```

> The `define` keyword is optional, that means `define entity Foo` is equal to `entity Foo`.


### Type Definitions — `define type`
{#types}

You can declare custom types to reuse later on, for example, for elements in entity definitions.
Custom-defined types can be simple, that is derived from one of the predefined types, structure types or [Associations](#associations).

```cds
define type User : String(111);
define type Amount {
  value : Decimal(10,3);
  currency : Currency;
}
define type Currency : Association to Currencies;
```
> The `define` keyword is optional, that means `define type Foo` is equal to `type Foo`.

[Learn more about **Definitions of Named Aspects**.](#aspects){.learn-more}




### Predefined Types


[See list of **Built-in Types**](types){.learn-more}




### Structured Types

You can declare and use custom struct types as follows:

```cds
type Amount {
  value : Decimal(10,3);
  currency : Currency;
}
entity Books {
  price : Amount;
}
```

Elements can also be specified with anonymous inline struct types.
For example, the following is equivalent to the definition of `Books` above:

```cds
entity Books {
  price : {
    value : Decimal(10,3);
    currency : Currency;
  };
}
```


### Arrayed Types

Prefix a type specification with `array of` or `many` to signify array types.

```cds
entity Foo { emails: many String; }
entity Bar { emails: many { kind:String; address:String; }; }
entity Car { emails: many EmailAddress; }
entity Car { emails: EmailAddresses; }
type EmailAddresses : many { kind:String; address:String; }
type EmailAddress : { kind:String; address:String; }
```

> Keywords `many` and `array of` are mere syntax variants with identical semantics and implementations.

When deployed to SQL databases, such fields are mapped to [LargeString](types) columns and the data is stored denormalized as JSON array.
With OData V4, arrayed types are rendered as `Collection` in the EDM(X).


::: warning
Filter expressions, [instance-based authorization](../guides/authorization#instance-based-auth) and [search](../guides/providing-services#searching-data) are not supported on arrayed elements.
:::

#### Null Values

For arrayed types the `null` and `not null` constraints apply to the _members_ of the collections. The default is `not null` indicating that the collections can't hold `null` values.

::: warning
An empty collection is represented by an empty JSON array. A `null` value is invalid for an element with arrayed type.
:::

In the following example the collection `emails` may hold members that are `null`. It may also hold a member where the element `kind` is `null`.
The collection `emails` itself must not be `null`!

```cds
entity Bar {
    emails      : many {
        kind    : String null;
        address : String not null;
    } null;  // -> collection emails may hold null values, overwriting default
}
```

### Virtual Elements

An element definition can be prefixed with modifier keyword `virtual`. This keyword indicates that this element isn't added to persistent artifacts, that is, tables or views in SQL databases. Virtual elements are part of OData metadata.

By default virtual elements are annotated with `@Core.Computed: true`, not writable for the client and will be [silently ignored](../guides/providing-services#readonly). This means also, that they are not accessible in custom event handlers. If you want to make virtual elements writable for the client, you explicitly need to annotate these elements with `@Core.Computed: false`. Still those elements are not persisted and therefore, for example, not sortable or filterable.

```cds
entity Employees {
  ...
  virtual something : String(11);
}
```
### Literals

Using literals in CDS models is commonly used, for example, to set default values. The literals in the following table show you how to define these values in your CDS source.

| Kind      | Example |
| --------- | --- |
| Null      | `null` |
| Boolean   | `true`, `false` |
| Numbers   | `11`, `2.4`, or `1.34e10` |
| Strings   | `'foo'` or `` `foo` `` or ```` ```foo``` ```` |
| Dates     | `date'2016-11-24'` |
| Times     | `time'16:11:32Z'` |
| Timestamp | `timestamp'2016-11-24T16:11:32.4209753Z'` |
| DateTime  | `'2016-11-24T16:11Z'` |
| Records   | `{"foo":<literal>, ...}` |
| Arrays    | `[<literal>, ...]` |

[Learn more about literals and their representation in CSN.](./csn#literals){.learn-more}


#### String Literals
{#multiline-literals}

String literals enclosed in single ticks, for example `'string'`,
are limited to a single line. A single tick `'` inside the literal is escaped by doubling it: `'it''s escaped`.

Use string literals enclosed in single or triple **backticks** for multiline strings. Within those strings, escape sequences from JavaScript, such as `\t` or `\u0020`, are supported. Line endings are normalized. If you don't want a line ending at that position, end a line with a backslash (`\`). Only for string literals inside triple backticks, indentation is stripped and tagging is possible.

**Examples:**

```cds
@documentation: ```
    This is a CDS multiline string.
    - The indentation is stripped.
    - \u{0055}nicode escape sequences are possible,
      just like common escapes from JavaScript such as
      \r \t \n and more!
    ```

@data: ```xml
    <main>
      The tag is ignored by the core-compiler but may be
      used for syntax highlighting, similar to markdown.
    </main>
    ```
@escaped: `OK Emoji: \u{1f197}`
entity DocumentedEntity {
  // ...
}
```


### Delimited Identifiers

Delimited identifiers allow you to use any identifier, even containing special characters or using a keyword.

::: warning
Special characters in identifiers or keywords as identifiers should be avoided for best interoperability.
:::

```cds
entity ![Entity] {
  bar           : ![Keyword];
  ![with space] : Integer;
}
```

> You can escape `]` by `]]`, for example `![L[C]]R]` which will be parsed as `L[C]R`.

<span id="calculated-fields"/>

### Calculated Elements {#calculated-elements}

Elements of entities and aspects can be specified with a calculation expression, in which you can
refer to other elements of the same entity/aspect.
This can be either a value expression or an expression that resolves to an association.

Calculated elements with a value expression are read-only, no value must be provided for
them in a WRITE operation. When reading such a calculated element, the result of the
expression is returned. They come in two variants: "on-read" and "on-write".
The difference between them is the point in time when the expression is evaluated.

#### On-read

```cds
entity Employees {
  firstName : String;
  lastName : String;
  name : String = firstName || ' ' || lastName;
  name_upper = upper(name);
  addresses : Association to many Addresses;
  city = addresses[kind='home'].city;
}
```

For a calculated element with "on-read" semantics, the calculation expression is evaluated when reading an entry from the entity.
Using such a calculated element in a query or view definition is equivalent to
writing the expression directly into the query, both with respect to semantics and to performance.
In CAP, it is implemented by replacing each occurrence of a calculated element in a query by the respective expression.

Entity using calculated elements:
```cds
entity EmployeeView as select from Employees {
  name,
  city
};
```
Equivalent entity:
```cds
entity EmployeeView as select from Employees {
  firstName || ' ' || lastName as name : String,
  addresses[kind='home'].city as city
};
```

Calculated elements "on-read" are a pure convenience feature. Instead of having to write
the same expression several times in queries, you can define a calculated element **once** and then
simply refer to it.

In the _definition_ of a calculated element "on-read", you can use almost all expressions that are allowed
in queries. Some restrictions apply:

* Subqueries are not allowed.
* Nested projections (inline/expand) are not allowed.
* A calculated element can't be key.

A calculated element can be *used* in every location where an expression can occur. A calculated element can't be used in the following cases:

* in the ON condition of an unmanaged association
* as the foreign key of a managed association
* in a query together with nested projections (inline/expand)

::: warning
 For the Node.js runtime, only the new database services under the _@cap-js_ scope support this feature.
:::

#### On-write

Calculated elements "on-write" (also referred to as "stored" calculated elements) are defined
by adding the keyword `stored`. A type specification is mandatory.

```cds
entity Employees {
  firstName : String;
  lastName : String;
  name : String = (firstName || ' ' || lastName) stored;
}
```

For a calculated element "on-write", the expression is already evaluated when an entry is written into
the database. The resulting value is then stored/persisted like a regular field, and when reading from the entity,
it behaves like a regular field as well. Using a stored calculated element can improve performance,
in particular when it's used for sorting or filtering. This is paid for by higher memory consumption.

While calculated elements "on-read" are handled entirely by CAP, the "on-write" variant is implemented by using
the corresponding feature for database tables.
The previous entity definition results in the following table definition:
```sql
-- SAP HANA syntax --
CREATE TABLE Employees (
  firstName NVARCHAR,
  lastName NVARCHAR,
  name NVARCHAR GENERATED ALWAYS AS (firstName || ' ' || lastName)
);
```
For the definition of calculated elements on-write, all the on-read variant's restrictions apply and referencing localized elements isn't allowed.
In addition, there are restrictions that depend on the particular database. Currently all databases
supported by CAP have a common restriction: The calculation expression may only refer to fields of the same
table row. Therefore, such an expression must not contain subqueries, aggregate functions, or paths with associations.

No restrictons apply for reading a calculated element on-write.

#### Association-like calculated elements (beta) {#association-like-calculated-elements}

A calculated element can also define a refined association, like in this example:

```cds
entity Employees {
  addresses : Association to many Addresses;
  homeAddress = addresses [1: kind='home'];
}
```

For such a calculated element, no explicit type can be specified.
Only a single association can occur in the expression, and a filter must be specified.

The effect essentially is like [publishing an association with a filter](#publish-associations-with-filter).


### Default Values

As in SQL you can specify default values to fill in upon INSERTs if no value is specified for a given element.

```cds
entity Foo {
  bar : String default 'bar';
  boo : Integer default 1;
}
```

Default values can also be specified in custom type definitions:
```cds
type CreatedAt : Timestamp default $now;
type Complex {
  real : Decimal default 0.0;
  imag : Decimal default 0.0;
}
```


### Type References {#typereferences}

If you want to base an element's type on another element of the same structure, you can use the `type of` operator.

```cds
entity Author {
  firstname : String(100);
   lastname : type of firstname; // has type "String(100)"
}
```

For referencing elements of other artifacts, you can use the element access through `:`.
Element references with `:` don't require `type of` in front of them.

```cds
entity Employees {
  firstname: Author:firstname;
  lastname: Author:lastname;
}
```


### Constraints

Element definitions can be augmented with constraint `not null` as known from SQL.

```cds
entity Employees {
  name : String(111) not null;
}
```


### Enums

You can specify enumeration values for a type as a semicolon-delimited list of symbols.
For string types, declaration of actual values is optional; if omitted, the actual values are the string counterparts of the symbols.

```cds
type Gender : String enum { male; female; non_binary = 'non-binary'; }
entity Order {
  status : Integer enum {
    submitted =  1;
    fulfilled =  2;
    shipped   =  3;
    canceled  = -1;
  };
}
```

To enforce your _enum_ values during runtime, use the [`@assert.range` annotation](../guides/providing-services#assert-range).
For localization of enum values, model them as [code list](./common#adding-own-code-lists).

<br>


## Views and Projections
{#views}

Use `as select from` or `as projection on` to derive new entities from existing ones by projections, very much like views in SQL. When mapped to relational databases, such entities are in fact translated to SQL views but they're frequently also used to declare projections without any SQL views involved.

The entity signature is inferred from the projection.

- [The `as select from` Variant](#as-select-from)
- [The `as projection on` Variant](#as-projection-on)
- [Views with Inferred Signatures](#views-with-inferred-signatures)

<div id="linkintoc" />

- [Views with Parameters](#views-with-parameters)


### The `as select from` Variant {#as-select-from}

Use the `as select from` variant to use all possible features an underlying relational database would support using any valid [CQL](./cql) query including all query clauses.

```cds
entity Foo1 as select from Bar; //> implicit {*}
entity Foo2 as select from Employees { * };
entity Foo3 as select from Employees LEFT JOIN Bar on Employees.ID=Bar.ID {
  foo, bar as car, sum(boo) as moo
} where exists (
  SELECT 1 as anyXY from SomeOtherEntity as soe where soe.x = y
)
group by foo, bar
order by moo asc;
```


### The `as projection on` Variant {#as-projection-on}

Use the `as projection on` variant instead of `as select from` to indicate that you don't use the full power of SQL in your query. For example, having a restricted query in an entity allows us to serve such an entity from external OData services.


```cds
entity Foo as projection on Bar {...}
```

Currently the restrictions of `as projection on` compared to `as select from` are:

- no explicit, manual `JOINs`
- no explicit, manual `UNIONs`
- no sub selects in from clauses

Over time, we can add additional checks depending on specific outbound protocols.


### Views with Inferred Signatures

By default views inherit all properties and annotations from their primary underlying base entity.
Their [`elements`](./csn#structured-types) signature is **inferred** from the projection on base elements.
Each element inherits all properties from the respective base element, except the `key` property.
The `key` property is only inherited if all of the following applies:
- No explicit `key` is set in the query.
- All key elements of the primary base entity are selected (for example, by using `*`).
- No path expression with a to-many association is used.
- No `union`, `join` or similar query construct is used.

For example, the following definition:

```cds
entity SomeView as select from Employees {
  ID,
  name,
  job.title as jobTitle
};
```

Might result in this inferred signature:

```cds
entity SomeView {
  key ID: Integer;
  name: String;
  jobTitle: String;
};
```

Note: CAP does **not** enforce uniqueness for key elements of a view or projection.

Use a CDL cast to set an element's type, if one of the following conditions apply:
+ You don't want to use the inferred type.
+ The query column is an expression (no inferred type is computed).

```cds
entity SomeView as select from Employees {
  ID : Integer64,
  name : LargeString,
  'SAP SE' as company : String
};
```

::: tip
By using a cast, annotations and other properties are inherited from the provided type and not the base element, see [Annotation Propagation](#annotation-propagation)
:::

<div id="afterinferredsig" />

<div id="beforeviewwithparam" />

### Views with Parameters

You can equip views with parameters that are passed in whenever that view is queried. Default values can be specified. Refer to these parameters in the view's query using the prefix `:`.

```cds
entity SomeView ( foo: Integer, bar: Boolean )
as SELECT * from Employees where ID=:foo;
```
[Learn more about how to expose views with parameters in **Services - Exposed Entities**.](#exposed-entities){ .learn-more}
[Learn more about views with parameters for existing HANA artifacts in **Native SAP HANA Artifacts**.](../advanced/hana){ .learn-more}



## Associations & Compositions {#associations}

Associations capture relationships between entities. They are like forward-declared joins added to a table definition in SQL.

- [Unmanaged Associations](#unmanaged-associations)
- [Managed Associations](#managed-associations)
- [To-many Associations](#to-many-associations)
- [Many-to-many Associations](#many-to-many-associations)

<span id="linkinassoctoc" />

- [Compositions](#compositions)
- [Managed Compositions](#managed-compositions)


### Unmanaged Associations

Unmanaged associations specify arbitrary join conditions in their `on` clause, which refer to available foreign key elements. The association's name (`address` in the following example) is used as the alias for the to-be-joined target entity.

```cds
entity Employees {
  address : Association to Addresses on address.ID = address_ID;
  address_ID : Integer;  //> foreign key
}
```
```cds
entity Addresses {
  key ID : Integer;
}
```


### Managed (To-One) Associations {#managed-associations}

For to-one associations, CDS can automatically resolve and add requisite foreign key elements from the target's primary keys and implicitly add respective join conditions.

```cds
entity Employees {
  address : Association to Addresses;
}
```

This example is equivalent to the [unmanaged example above](#unmanaged-associations), with the foreign
key element `address_ID` being added automatically upon activation to a SQL database.

> Note: For adding foreign key constraints on database level, see [Database Constraints.](../guides/databases#db-constraints).

If the target has a single primary key, a default value can be provided.
This default applies to the generated foreign key element `address_ID`:

```cds
entity Employees {
  address : Association to Addresses default 17;
}
```

### To-many Associations

For to-many associations specify an `on` condition following the canonical expression pattern `<assoc>.<backlink> = $self` as in this example:

```cds
entity Employees {
  key ID : Integer;
  addresses : Association to many Addresses
    on addresses.owner = $self;
}
```
```cds
entity Addresses {
  owner : Association to Employees;  //> the backlink
}
```

> The backlink can be any managed to-one association on the _many_ side pointing back to the _one_ side.


### Many-to-many Associations

For many-to-many association, follow the common practice of resolving logical many-to-many relationships into two one-to-many associations using a link entity to connect both.
For example:

```cds
entity Employees { ...
  addresses : Association to many Emp2Addr on addresses.emp = $self;
}
entity Emp2Addr {
  key emp : Association to Employees;
  key adr : Association to Addresses;
}
```

[Learn more about **Managed Compositions for Many-to-many Relationships**.](#for-many-to-many-relationships){.learn-more}


<div id="aftermanytomany" />

<div id="inbetweenthings" />

<div id="beforecompo" />


### Compositions

Compositions constitute document structures through _contained-in_ relationships.
They frequently show up in to-many header-child scenarios.

```cds
entity Orders {
  key ID: Integer; //...
  Items : Composition of many Orders.Items on Items.parent = $self;
}
entity Orders.Items {
  key pos : Integer;
  key parent : Association to Orders;
  product : Association to Products;
  quantity : Integer;
}
```

:::info Contained-in relationship
Essentially, Compositions are the same as _[associations](#associations)_, just with the additional information that this association represents a _contained-in_ relationship so the same syntax and rules apply in their base form.
:::

### Managed Compositions of Aspects {#managed-compositions}

Use managed compositions variant to nicely reflect document structures in your domain models, without the need for separate entities, reverse associations, and unmanaged `on` conditions.


#### With Inline Targets

```cds
entity Orders {
  key ID: Integer; //...
  Items : Composition of many {
    key pos : Integer;
    product : Association to Products;
    quantity : Integer;
  }
};
```

Managed Compositions are mostly syntactical sugar: Behind the scenes, they are unfolded to the [unmanaged equivalent as shown above](#compositions)
by automatically adding a new entity, the name of which being constructed as a [scoped name](#scoped-names) from the name of parent entity, followed by the name of the composition element,
that is `Orders.Items` in the previous example.
You can safely use this name at other places, for example to define an association to the generated child entity:

<!-- cds-mode: ignore -->
```cds
entity Orders {
  // …
  specialItem : Association to Orders.Items;
};
```


#### With Named Targets

Instead of anonymous target aspects you can also specify named aspects, which are unfolded the same way as anonymous inner types, as shown in the previous example:

```cds
entity Orders {
  key ID: Integer; //...
  Items : Composition of many OrderItems;
}
aspect OrderItems {
  key pos : Integer;
  product : Association to Products;
  quantity : Integer;
}
```

#### Default Target Cardinality

If not otherwise specified, a managed composition of an aspect has the default target cardinality *to-one*.

#### For Many-to-many Relationships

Managed Compositions are handy for [many-to-many relationships](#many-to-many-associations), where a link table usually is private to one side.

```cds
entity Teams { ...
  members : Composition of many { key user: Association to Users; }
}
entity Users { ...
  teams: Association to many Teams.members on teams.user = $self;
}
```

And here's an example of an attributed many-to-many relationship:

```cds
entity Teams { ...
  members : Composition of many {
    key user : Association to Users;
    role : String enum { Lead; Member; Collaborator; }
  }
}
entity Users { ... }
```

To navigate between _Teams_ and _Users_, you have to follow two associations: `members.user` or `teams.up_`.
In OData, use a query like:

```cds
GET /Teams?$expand=members($expand=user)
```

to get all users of all teams.


### Publish Associations in Projections {#publish-associations}

As associations are first class citizens, you can put them into the select list
of a view or projection ("publish") like regular elements. A `select *` includes all associations.
If you need to rename an association, you can provide an alias.

Example:
```cds
entity P_Employees as projection on Employees {
  ID,
  addresses
}
```

The effective signature of the projection contains an association `addresses` with the same
properties as association `addresses` of entity `Employees`.

#### Publish Associations with Filter (beta) {#publish-associations-with-filter}

::: warning
This is a beta feature. Beta features aren't part of the officially delivered scope that SAP guarantees for future releases.
For more information, see [Important Disclaimers and Legal Information](https://help.sap.com/viewer/disclaimer).
:::

When publishing an unmanaged association in a view or projection, you can add a filter condition.
The ON condition of the resulting association is the ON condition of the original
association plus the filter condition, combined with `and`.

Example:
```cds
entity P_Authors as projection on Authors {
  *,
  books[stock > 0] as availableBooks
};
```

In this example, in addition to `books` projection `P_Authors` has a new association `availableBooks`
that points only to those books where `stock > 0`.

If the filter condition effectively reduces the cardinality of the association
to one, you should make this explicit in the filter by adding a `1:` before the condition:

Example:
```cds
entity P_Employees as projection on Employees {
  *,
  addresses[1: kind='home'] as homeAddress  // homeAddress is to-one
}
```

An association that has been published with a filter is read-only. It must not be
used to modify the target entity.

Filters usually are provided only for to-many associations, which usually are unmanaged.
Thus publishing with a filter is almost exclusively used for unmanaged associations.
Nevertheless you can also publish a managed association with a filter. This will automatically
turn the resulting association into an unmanaged one. You must ensure that all foreign key elements
needed for the ON condition are explicitly published.

Example:
```cds
entity P_Books as projection on Books {
  author.ID as authorID,  // needed for ON condition of deadAuthor
  author[dateOfDeath is not null] as deadAuthor  // -> unmanaged association
};
```


## Annotations

This section describes how to add Annotations to model definitions written in CDL, focused on the common syntax options, and fundamental concepts. Find additional information in the [OData Annotations](../advanced/odata#annotations) guide.

- [Annotation Syntax](#annotation-syntax)
- [Annotation Targets](#annotation-targets)
- [Annotation Values](#annotation-values)
- [Expressions as Annotation Values](#expressions-as-annotation-values)
- [Records as Syntax Shortcuts](#records-as-syntax-shortcuts)
- [Annotation Propagation](#annotation-propagation)
- [The `annotate` Directive](#annotate)
- [Extend Array Annotations](#extend-array-annotations)


### Annotation Syntax

Annotations in CDL are prefixed with an `@` character and can be placed before a definition, after the defined name or at the end of simple definitions.

```cds
@before entity Foo @inner {
  @before simpleElement @inner : String @after;
  @before structElement @inner { /* elements */ }
}
```

Multiple annotations can be placed in each spot separated by whitespaces or enclosed in `@(...)` and separated by comma - like the following are equivalent:

```cds
entity Foo @(
  my.annotation: foo,
  another.one: 4711
) { /* elements */ }
```
```cds
@my.annotation:foo
@another.one: 4711
entity Foo { /* elements */ }
```

For an `@inner` annotation, only the syntax `@(...)` is available.

### Annotation Targets

You can basically annotate any named thing in a CDS model, such as:

Contexts and services:

<!-- cds-mode: ignore, because it shows syntax alternatives -->
```cds
@before [define] (context|service) Foo @inner { ... }
```

Definitions and elements with simple types:

<!-- cds-mode: ignore, because it shows syntax alternatives -->
```cds
@before [define] type Foo @inner : String @after;
@before [key] anElement @inner : String @after;
```

Entities, aspects, and other struct types and elements thereof:

<!-- cds-mode: ignore, because it shows syntax alternatives -->
```cds
@before [define] (entity|type|aspect|annotation) Foo @inner {
  @before simple @inner : String @after;
  @before struct @inner { ...elements... };
}
```

Enums:

<!-- cds-mode: ignore, because it shows only partial CDS -->
```cds
… status : String @inner enum {
  fulfilled @after;
}
```

Columns in a view definition's query:

<!-- cds-mode: ignore, because it shows only partial CDS -->
```cds
… as select from Foo {
  @before expr as alias @inner : String,
  …
}
```

Parameters in view definitions:

<!-- cds-mode: ignore, because it shows only partial CDS -->
```cds
… with parameters (
  @before param @(inner) : String @after
) …
```

Actions/functions including their parameters and result:

```cds
@before action doSomething @inner (
  @before param @(inner) : String @after
) returns @before resultType;
```

Or in case of a structured result:

```cds
action doSomething() returns @before {
  @before resultElem @inner : String @after;
};
```


### Annotation Values

Values can be literals, references, or expressions. Expressions are explained in more detail in the next section.
If no value is given, the default value is `true` as for `@aFlag` in the following example:

<!-- cds-mode: upcoming, cds-compiler v4.5 -->
```cds
@aFlag //= true, if no value is given
@aBoolean: false
@aString: 'foo'
@anInteger: 11
@aDecimal: 11.1
@aSymbol: #foo
@aReference: foo.bar
@anArray: [ /* can contain any kind of value */ ]
@anExpression: ( foo.bar * 17 )  // expression, see next section
```

As described in the [CSN spec](./csn#literals), the previously mentioned annotations would compile to CSN as follows:

```jsonc
{
  "@aFlag": true,
  "@aBoolean": false,
  "@aString": "foo",
  "@anInteger": 11,
  "@aDecimal": 11.1,
  "@aSymbol": {"#":"foo"},
  "@aReference": {"=":"foo.bar"},
  "@anArray": [ /* … */ ],
  "@anExpression": { /* see next section */ }
}
```

::: tip
In contrast to references in [expressions](#expressions-as-annotation-values), plain references aren't checked or resolved
by CDS parsers or linkers. They're interpreted and evaluated only on consumption-specific modules.
For example, for SAP Fiori models, it's the _4odata_ and _2edm(x)_ processors.
:::


### Expressions as Annotation Values (beta) {#expressions-as-annotation-values}

::: warning
Expressions in annotation values are released as beta feature.
We provide an early preview of this functionality to allow you to experiment with it and provide feedback.
The behavior may change in later releases, in particular:
the behavior and the CSN representation of paths in propagated annotations will change,
and the behavior of expressions in OData annotations will change.
:::

In order to use an expression as an annotation value, it must be enclosed in parentheses:
<!-- cds-mode: upcoming, cds-compiler v4.5 -->
```cds
@anExpression: ( foo.bar * 11 )
```

Syntactically, the same expressions are supported as in a select item or in the where clause of a query,
except subqueries. The expression can of course also be a single reference or a simple value:
<!-- cds-mode: upcoming, cds-compiler v4.5 -->
```cds
@aRefExpr: ( foo.bar )
@aValueExpr: ( 11 )
```

Some advantage of using expressions as "first class" annotation values are:
* syntax and references are checked by the compiler
* code completion
* (planned) [automatic path rewriting in propagated annotations](#propagation)
* (planned) [automatic translation of expressions in OData annotations](#odata-annotations)

#### Name resolution

Each path in the expression is checked:
* For an annotation assigned to an entity, the first path step is resolved as element of the entity.
* For an annotation assigned to an entity element, the first path step is resolved as the annotated element or its siblings.
* If the annotation is assigned to a subelement of a structured element, the top level
  elements of the entity can be accessed via `$self`.
* A parameter `par` of a parametrized entity can be accessed like in a query with `:par`.
* If a path cannot be resolved successfully, compilation fails with an error.

In contrast to `@aReference: foo.bar`, a single reference written as expression `@aRefExpr: ( foo.bar )`
is checked by the compiler.

#### CSN Representation

In CSN, the expression is represented as a record with two properties:
* A string representation of the expression is stored in property `=`.
* A tokenized representation of the expression is stored in one of the properties
`xpr`, `ref`, `val`, `func`, etc. (like if the expression was written in a query).

```json
{
  "@anExpression": {
    "=": "foo.bar * 11",
    "xpr": [ {"ref": ["foo", "bar"]}, "*", {"value": 11} ]
  },
  "@aRefExpr": {
    "=": "foo.bar",
    "ref": ["foo", "bar"]
  },
  "@aValueExpr": {
    "=": "11",
    "val": 11
  }
}
```

Note the different CSN representations for a [plain value `"@anInteger": 11`](#annotation-values) and a value written
as expression `@aValueExpr: ( 11 )`, respectively.

#### Propagation

[Annotations are propagated](#annotation-propagation) in views/projections, in includes, or along type references.
Currently, paths are not rewritten in propagated annotations. In a projection, for example,
all elements used in an annotation expression must be projected without renaming.
Thus, for the time being we recommend to use the feature mainly in top-level projections.

Example:
<!-- cds-mode: upcoming, cds-compiler v4.5 -->
```cds
@MyLength : (length)
@MyArea : (length * depth)
@MyHeight : (height)
entity Block {
  length : Integer;
  depth : Integer;
  height : Integer;
}

entity Rectangle as projection on Block {
  length,
  depth as width
}
```

All three annotations are propagated to the projection `Rectangle`. The propagated `@MyLength` is still valid.
The propagated annotation `MyArea` is invalid, as the referenced element `depth` has been renamed to `width`.
The propagated annotation `MyHeight` is invalid, as element `height` of `Block` has not been projected at all.
This results in a compiler error. To make it work, you would have to explicitly overwrite annotations
`@MyArea` and `@MyHeight` at `Rectangle`.

::: details Outlook on future releases
The compiler is going to take care of renamed elements and rewrites references in propagated annotations
in a later release. The CSN representation of propagated annotation expressions may change even
if today no error is issued. Propagated annotation expressions that today are accepted may lead
to an error in the future when the implementation is improved.
:::

#### CDS Annotations

Using an expression as annotation value only makes sense if the evaluator of the annotation is
prepared to deal with the new CSN representation.
Currently, the CAP runtimes only support expressions in the `where` property of the `@restrict` annotation.

<!-- cds-mode: upcoming, cds-compiler v4.5 -->
```cds
entity Orders @(restrict: [
    { grant: 'READ', to: 'Auditor', where: (AuditBy = $user.id) }
  ]) {/*...*/}
```

More annotations are going to follow in upcoming releases.

Of course, you can use this feature also in your custom annotations, where you control the code that evaluates
the annotations.

#### OData Annotations

The OData backend of CAP doesn't yet support expression valued annotations. This is planned for
a later release.
If you use the new expression syntax for OData annotations, the expression and contained references
are not correctly translated, and the resulting EDMX will change once the OData support is available.


### Records as Syntax Shortcuts

Annotations in CDS are flat lists of key-value pairs assigned to a target.
The record syntax - that is, `{key:<value>, ...}` - is a shortcut notation that applies a common prefix to nested annotations.
For example, the following are equivalent:

```cds
@Common.foo.bar
@Common.foo.car: 'wheels'
```
```cds
@Common: { foo.bar, foo.car: 'wheels' }
```
```cds
@Common.foo: { bar }
@Common.foo.car: 'wheels'
```
```cds
@Common.foo: { bar, car: 'wheels' }
```

and they would show up as follows in a parsed model (&rarr; see [CSN](./csn)):

```json
{
  "@Common.foo.bar": true,
  "@Common.foo.car": "wheels"
}
```

### Annotation Propagation {#annotation-propagation}

Annotations are inherited from types and base types to derived types, entities, and elements as well as from elements of underlying entities in case of views.

For example, given this view definition:

```cds
using Books from './bookshop-model';
entity BooksList as select from Books {
  ID, genre : Genre, title,
  author.name as author
};
```

* `BooksList` would inherit annotations from `Books`
* `BooksList.ID` would inherit from `Books.ID`
* `BooksList.author` would inherit from `Books.author.name`
* `BooksList.genre` would inherit from type `Genre`

The rules are:

1. Entity-level properties and annotations are inherited from the **primary** underlying source entity — here `Books`.

2. Each element that can **unambiguously** be traced back to a single source element, inherits that element's properties.

3. An explicit **cast** in the select clause cuts off the inheritance, for example, as for `genre` in our previous example.

::: tip
Propagation of annotations can be stopped via value `null`, for example, `@anno: null`.
:::

### The `annotate` Directive
{#annotate}

The `annotate` directive allows to annotate already existing definitions that may have been [imported](#imports) from other files or projects.

```cds
annotate Foo with @title:'Foo' {
  nestedStructField {
    existingField @title:'Nested Field';
  }
}
annotate Bar with @title:'Bar';
```

You can also directly annotate a single element:
```cds
annotate Foo:existingField @title: 'Simple Field';
annotate Foo:nestedStructField.existingField @title:'Nested Field';
```

Actions, functions, their parameters and `returns` can be annotated:


```cds
service SomeService {
  entity SomeEntity { key id: Integer } actions
  {
    action boundAction(P: Integer) returns String;
  };
  action unboundAction(P: Integer) returns String;
};

annotate SomeService.unboundAction with @label: 'Action Label' (@label: 'First Parameter' P)
                                        returns @label: 'Returns a string';
annotate SomeService.SomeEntity with actions {
     @label: 'Action label'
     boundAction(@label: 'firstParameter' P) returns @label: 'Returns a string';
}
```

The `annotate` directive is a variant of the [`extend` directive](#extend).
Actually, `annotate` is just a shortcut with the default mode being switched to `extend`ing existing fields instead of adding new ones.



### Extend Array Annotations {#extend-array-annotations}

Usually, the annotation value provided in an `annotate` directive overwrites an already existing annotation value.

If the existing value is an array, the *ellipsis* syntax allows to insert new values **before** or **after** the existing entries,
instead of overwriting the complete array. The ellipsis represents the already existing array entries. Of course, this works with any kind of array entries.

This is a sample of an existing array:

```cds
@anArray: [3, 4] entity Foo { /* elements */ }
```

This shows how to extend the array:

```cds
annotate Foo with @anArray: [1, 2, ...];  //> prepend new values: [1, 2, 3, 4]
annotate Foo with @anArray: [..., 5, 6];  //> append new values: [3, 4, 5, 6]
annotate Foo with @anArray: [1, 2, ..., 5, 6]; //> prepend and append
```

It's also possible to insert new entries at **arbitrary positions**. For this, use `... up to` with a *comparator* value that identifies the insertion point.

<!-- cds-mode: ignore, because it is not an actual snippet, but grammar definition -->
```cds
[... up to <comparator>, newEntry, ...]
```

`... up to` represents the existing entries of the array from the current position
up to and including the first entry that matches the comparator. New entries are then inserted behind the matched entry.
If there's no match, new entries are appended at the end of the existing array.

This is a sample of an existing array:

```cds
@anArray: [1, 2, 3, 4, 5, 6] entity Bar { /* elements */ }
```

This shows how to insert values after `2` and `4`:

```cds
annotate Bar with @anArray: [
  ... up to 2,  // existing entries 1, 2
   2.1, 2.2,    // insert new entries 2.1, 2.2
  ... up to 4,  // existing entries 3, 4
  4.1, 4.2,     // insert new entries 4.1, 4.2
  ...           // remaining existing entries 5, 6
];
```

The resulting array is:

```js
[1, 2, 2.1, 2.2, 3, 4, 4.1, 4.2, 5, 6]
```

If your array entries are objects, you have to provide a *comparator object*.
It matches an existing entry, if all attributes provided in the comparator match the corresponding attributes in an existing entry.
The comparator object doesn't have to contain all attributes that the existing array entries have,
simply choose those attributes that sufficiently characterize the array entry after which you want to insert.
Only simple values are allowed for the comparator attributes.

Example: Insert a new entry after `BeginDate`.

```cds
@UI.LineItem: [
    { $Type: 'UI.DataFieldForAction', Action: 'TravelService.acceptTravel', Label: '{i18n>AcceptTravel}' },
    { Value: TravelID,  Label: 'ID'    },
    { Value: BeginDate, Label: 'Begin' },
    { Value: EndDate,   Label: 'End'   }
  ]
entity TravelService.Travel { /* elements */ }
```

For this, you provide a comparator object with the attribute `Value`:

```cds
annotate TravelService.Travel with @UI.LineItem: [
  ... up to { Value: BeginDate },  // ... up to with comparator object
  { Value: BeginWeekday, Label: 'Day of week' }, // new entry
  ... // remaining array entries
];
```

::: tip
Only direct annotations can be extended using `...`. It's not supported to extend propagated annotations, for example, from aspects or types.
:::

<br>

## Aspects

CDS's aspects allow to flexibly extend definitions by new elements as well as overriding properties and annotations.
They're based on a mixin approach as known from Aspect-oriented Programming methods.

- [The `extend` Directive](#extend)
- [Named Aspects](#aspect) — `define aspect`
- [Shortcut Syntax `:`](#includes)
- [Looks Like Inheritance](#looks-like-inheritance)
- [Extending Views / Projections](#extend-view)


### The `extend` Directive { #extend}

Use `extend` to add extension fields or to add/override metadata to existing definitions, for example, annotations, as follows:

```cds
extend Foo with @(title: 'Foo') {
  newField : String;
  extend nestedStructField {
    newField : String;
    extend existingField @title:'Nested Field';
  }
}
extend Bar with @title: 'Bar'; // nothing for elements
```

::: tip
Make sure that you prepend the `extend` keyword to nested elements, otherwise this would mean that you want to add a new field with that name:
:::

[Learn more about the **annotate** Directive.](#annotate){.learn-more}

You can also directly extend a single element:
```cds
extend Foo:nestedStructField with { newField : String; }
```

With `extend` you can enlarge the *length* of a String or *precision* and *scale* of a Decimal:
```cds
extend User with (length:120);
extend Books:price.value with (precision:12,scale:3);
```
The extended type or element directly must have the respective property.

For multiple conflicting `extend` statements, the last `extend` wins, i.e. in three files `a.cds <- b.cds <- c.cds`, where `<-` means `using from`,
the `extend` from `c.cds` is applied, as it is the last in the dependency chain.


### Named Aspects — `define aspect` {#aspect}

You can use `extend` or `annotate` with predefined aspects, to apply the same extensions to multiple targets:

```cds
extend Foo with ManagedObject;
extend Bar with ManagedObject;
```
```cds
aspect ManagedObject {
  created { at: Timestamp; _by: User; }
}
```

> The `define` keyword is optional, that means `define aspect Foo` is equal to `aspect Foo`.

If you use `extend`, all nested fields in the named aspect are interpreted as being extension fields. If you use `annotate`, the nested fields are interpreted as existing fields and the annotations are copied to the corresponding target elements.

The named extension can be anything, for example, including other `types` or `entities`.
Use keyword `aspect` as shown in the example to declare definitions that are only meant to be used in such extensions, not as types for elements.



### Includes -- `:` as Shortcut Syntax {#includes}

You can use an inheritance-like syntax option to extend a definition with one or more [named aspects](#aspect)
as follows:

```cds
define entity Foo : ManagedObject, AnotherAspect {
  key ID : Integer;
  name : String;
  ...
}
```

This is syntactical sugar and equivalent to using a sequence of [extends](#extend) as follows:

```cds
define entity Foo {}
extend Foo with ManagedObject;
extend Foo with AnotherAspect;
extend Foo with {
  key ID : Integer;
  name : String;
  ...
}
```

You can apply this to any definition of an entity or a structured type.



### Looks Like Inheritance

The `:`-based syntax option described before looks very much like (multiple) inheritance and in fact has very much the same effects. Yet, as mentioned in the beginning of this
section, it isn't based on inheritance but on mixins, which are more powerful and also avoid common problems like the infamous diamond shapes in type derivations.

When combined with persistence mapping there are a few things to note, that goes down to which strategy to choose to map inheritance to, for example, relational models. See [_Aspects vs Inheritance_](./aspects-inheritance) for more details.


### Extending Views and Projections { #extend-view}

Use the `extend <entity> with columns` variant to extend the select list of a projection or view entity and do the following:

* Include more elements existing in the underlying entity.
* Add new calculated fields.
* Add new unmanaged associations.

```cds
extend Foo with @title:'Foo' columns {
  foo as moo @woo,
  1 + 1 as two,
  bar : Association to Bar on bar.ID = moo
}
```

::: tip
Enhancing nested structs isn't supported. Note also that you can use the common [`annotate`](#annotate) syntax, to just add/override annotations of a view's elements.
:::

<br>


## Services

- [Service Definitions](#service-definitions)
- [Exposed Entities](#exposed-entities)
- [(Auto-) Redirected Associations](#auto-redirect)
- [Auto-exposed Targets](#auto-expose)
- [Custom Actions/Functions](#actions)
- [Custom-defined Events](#events)
- [Extending Services](#extend-service)
  <span id="tocservices" />


### Service Definitions

CDS allows to define service interfaces as collections of exposed entities enclosed in a `service` block, which essentially is and acts the same as [`context`](#context):

```cds
service SomeService {
  entity SomeExposedEntity { ... };
  entity AnotherExposedEntity { ... };
}
```

The endpoint of the exposed service is constructed by its name, following some conventions (the string `service` is dropped and kebab-case is enforced). If you want to overwrite the path, you can add the `@path` annotation as follows:

```cds
@path: 'myCustomServicePath'
service SomeService { ... }
```


### Exposed Entities

The entities exposed by a service are most frequently projections on entities from underlying data models.
Standard view definitions, using [`as select from`](#views) or [`as projection on`](#as-projection-on), can be used for
exposing entities.

```cds
service CatalogService {
  entity Product as projection on data.Products {
    *, created.at as since
  } excluding { created };
}
service MyOrders {
  //> $user only implemented for SAP HANA
  entity Order as select from data.Orders { * } where buyer=$user.id;
  entity Product as projection on CatalogService.Product;
}
```

::: tip
You can optionally add annotations such as `@readonly` or `@insertonly` to exposed entities, which, will be enforced by the CAP runtimes in Java and Node.js.
:::

Entities can be also exposed as views with parameters:

```cds
service MyOrders {
  entity OrderWithParameter( foo: Integer ) as select from data.Orders where id=:foo;
}
```
A [`view with parameter`](#views-with-parameters) modeled in the previous example, can be exposed as follows:

```cds
service SomeService {
  entity ViewInService( p1: Integer, p2: Boolean ) as select from data.SomeView(foo: :p1, bar: :p2) {*};
}
```
Then the OData request for views with parameters should look like this:

```cds
GET: /OrderWithParameter(foo=5)/Set or GET: /OrderWithParameter(5)/Set
GET: /ViewInService(p1=5, p2=true)/Set
```

To expose an entity, it not necessarily has to be lexically enclosed in the service definition.
An entity's affiliation to a service is established using its fully qualified name.
If the name of an entity contains the name of a service as prefix, it belongs to/is exposed by that service.
In the following example, all entities belong to the same service:

::: code-group
```cds [myservice.cds]
service foo.MyService {
  entity A { /*...*/ };
}
entity foo.MyService.B { /*...*/ };
```
:::

::: code-group
```cds [another.cds]
namespace foo.MyService;
entity C { /*...*/ };
```
:::


### (Auto-) Redirected Associations {#auto-redirect}

When exposing related entities, associations are automatically redirected. This ensures that clients can navigate between projected entities as expected. For example:

```cds
service AdminService {
  entity Books as projection on my.Books;
  entity Authors as projection on my.Authors;
  //> AdminService.Authors.books refers to AdminService.Books
}
```

#### Resolving Ambiguities

Auto-redirection fails if a target can't be resolved unambiguously, that is, when there is more than one projection with the same minimal 'distance' to the source. For example, compiling the following model with two projections on `my.Books` would produce this error:

::: danger
Target "Books" is exposed in service "AdminService" by multiple projections "AdminService.ListOfBooks", "AdminService.Books" - no implicit redirection.
:::

```cds
service AdminService {
  entity ListOfBooks as projection on my.Books;
  entity Books as projection on my.Books;
  entity Authors as projection on my.Authors;
  //> which one should AdminService.Authors.books refer to?
}
```

#### Using `redirected to` with Projected Associations

You can use `redirected to` to resolve the ambiguity as follows:

```cds
service AdminService {
  entity ListOfBooks as projection on my.Books;
  entity Books as projection on my.Books;
  entity Authors as projection on my.Authors { *, // [!code focus]
    books : redirected to Books //> resolved ambiguity // [!code focus]
  };
}
```

#### Using `@cds.redirection.target` Annotations

Alternatively, you can use the boolean annotation `@cds.redirection.target` with value `true` to make an entity a preferred redirection target, or with value `false` to exclude an entity as target for auto-redirection.

```cds
service AdminService {
  @cds.redirection.target: true // [!code focus]
  entity ListOfBooks as projection on my.Books; // [!code focus]
  entity Books as projection on my.Books;
  entity Authors as projection on my.Authors;
}
```

### Auto-Exposed Entities {#auto-expose}

Annotate entities with `@cds.autoexpose` to automatically expose them in services containing entities with associations referring to them.

For example, given the following entity definitions:

```cds
// schema.cds
namespace schema;
entity Bar @cds.autoexpose { key id: Integer; }

using { sap.common.CodeList } from '@sap/cds/common';
entity Car : CodeList { key code: Integer; }
//> inherits  @cds.autoexpose from  sap.common.CodeList
```

... a service definition like this:

```cds
using { schema as my } from './schema.cds';
service Zoo {
  entity Foo { //...
    bar : Association to my.Bar;
    car : Association to my.Car;
  }
}
```

... would result in the service being automatically extended like this:

```cds
extend service Zoo with { // auto-exposed entities:
   @readonly entity Foo_bar as projection on Bar;
   @readonly entity Foo_car as projection on Car;
}
```

You can still expose such entities explicitly, for example, to make them read-write:

```cds
service Sue {
  entity Foo { /*...*/ }
  entity Bar as projection on my.Bar;
}
```

[Learn more about **CodeLists in `@sap/cds/common`**.](./common#code-lists){.learn-more}

### Custom Actions and Functions {#actions}

Within service definitions, you can additionally specify `actions` and `functions`. Use a comma-separated list of named and typed inbound parameters (optional) and a response type (optional for actions), which can be either a:

- [Predefined Type](#types)
- [Reference to a custom-defined type](#types)
- [Inline definition of an anonymous structured type](#structured-types)

```cds
service MyOrders {
  entity Order { /*...*/ };
  // unbound actions / functions
  type cancelOrderRet {
    acknowledge: String enum { succeeded; failed; };
    message: String;
  }
  action cancelOrder ( orderID:Integer, reason:String ) returns cancelOrderRet;
  function countOrders() returns Integer;
  function getOpenOrders() returns array of Order;
}
```

::: tip
The notion of actions and functions in CDS adopts that of [OData](https://docs.oasis-open.org/odata/odata/v4.0/os/part1-protocol/odata-v4.0-os-part1-protocol.html#_Toc372793737); actions and functions on service-level are _unbound_ ones.
:::


#### Bound Actions and Functions { #bound-actions}

Actions and functions can also be bound to individual entities of a service, enclosed in an additional `actions` block as the last clause in an entity/view definition.

```cds
service CatalogService {
  entity Products as projection on data.Products { ... }
    actions {
      // bound actions/functions
      action addRating (stars: Integer);
      function getViewsCount() returns Integer;
    }
}
```

Bound actions and functions have a binding parameter that is usually implicit.
It can also be modeled explicitly: the first parameter of a bound action or function is treated as binding parameter,
if it's typed by `[many] $self`. Use Explicit Binding to control the naming of the binding parameter. Use the
keyword `many` to indicate that the action or function is bound to a collection of instances rather than to a single one.

```cds
service CatalogService {
  entity Products as projection on data.Products { ... }
    actions {
      // bound actions/functions with explicit binding parameter
      action A1 (prod: $self, stars: Integer);
      action A2 (in: many $self);  // bound to collection of Products
    }
}
```

Explicitly modelled binding parameters are ignored for OData V2.


### Custom-Defined Events {#events}

Similar to [Actions and Functions](../cds/cdl#actions) you can declare `events`, which a service emits via messaging channels. Essentially, an event declaration looks very much like a type definition, specifying the event's name and the type structure of the event messages' payload.

```cds
service MyOrders { ...
  event OrderCanceled {
    orderID: Integer;
    reason: String;
  }
}
```

An event can also be defined as projection on an entity, type, or another event.
Only the effective signature of the projection is relevant.
```cds
service MyOrders { ...
  event OrderCanceledNarrow : projection on OrderCanceled { orderID }
}
```


### Extending Services {#extend-service}

You can [extend](#extend) services with additional entities and actions much as you would add new entities to a context:

```cds
extend service CatalogService with {
  entity Foo {};
  function getRatings() returns Integer;
}
```

Similarly, you can [extend](#extend) entities with additional actions
as you would add new elements:


```cds
extend entity CatalogService.Products with actions {
  function getRatings() returns Integer;
}
```

<div id="beforenamespaces" />

## Namespaces

- [The `namespace` Directive](#namespace)
- [The `context` Directive](#context)
- [Scoped Definitions](#scoped-names)
- [Fully Qualified Names](#fully-qualified-names)


### The `namespace` Directive {#namespace}

To prefix the names of all subsequent definitions, place a `namespace` directive at the top of a model. This is comparable to other languages, like Java.

::: code-group
```cds[namespace.cds]
namespace foo.bar;
entity Foo {}           //> foo.bar.Foo
entity Bar : Foo {}     //> foo.bar.Bar
```
:::

A namespace is not an object of its own. There is no corresponding definition in CSN.

### The `context` Directive {#context}

Use `contexts` for nested namespace sections.

::: code-group
```cds[contexts.cds]
namespace foo.bar;
entity Foo {}           //> foo.bar.Foo
context scoped {
  entity Bar : Foo {}   //> foo.bar.scoped.Bar
  context nested {
    entity Zoo {}       //> foo.bar.scoped.nested.Zoo
  }
}
```
:::


### Scoped Definitions {#scoped-names}

You can define types and entities with other definitions' names as prefixes:

```cds
namespace foo.bar;
entity Foo {}           //> foo.bar.Foo
entity Foo.Bar {}       //> foo.bar.Foo.Bar
type Foo.Bar.Car {}     //> foo.bar.Foo.Bar.Car
```


### Fully Qualified Names

A model ultimately is a collection of definitions with unique, fully qualified names. For example, the second model above would compile to this [CSN](./csn):

::: code-group
```json [contexts.json]
{"definitions":{
  "foo.bar.Foo": { "kind": "entity" },
  "foo.bar.scoped": { "kind": "context" },
  "foo.bar.scoped.Bar": { "kind": "entity",
    "includes": [ "foo.bar.Foo" ]
  },
  "foo.bar.scoped.nested": { "kind": "context" },
  "foo.bar.scoped.nested.Zoo": { "kind": "entity" }
}}
```
:::

<br>

## Import Directives {#imports}

- [The `using` Directive](#using)

<span id="tocimport" />

- [Model Resolution](#model-resolution)


### The `using` Directive {#using}

Using directives allows to import definitions from other CDS models. As shown in line three below you can specify aliases to be used subsequently. You can import single definitions as well as several ones with a common namespace prefix. Optional: Choose a local alias.

::: code-group
```cds [using-from.cds]
using foo.bar.scoped.Bar from './contexts';
using foo.bar.scoped.nested from './contexts';
using foo.bar.scoped.nested as specified from './contexts';

entity Car : Bar {}            //> : foo.bar.scoped.Bar
entity Moo : nested.Zoo {}     //> : foo.bar.scoped.nested.Zoo
entity Zoo : specified.Zoo {}  //> : foo.bar.scoped.nested.Zoo
```
:::

Multiple named imports through ES6-like deconstructors:

```cds
using { Foo as Moo, sub.Bar } from './base-model';
entity Boo : Moo { /*...*/ }
entity Car : Bar { /*...*/ }
```

> Also in the deconstructor variant of `using` shown in the previous example, specify fully qualified names.


<span id="import-dir"/>

### Model Resolution

Imports in `cds` work very much like [`require` in Node.js](https://nodejs.org/api/modules.html#requireid) and `import`s in [ES6](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import).
In fact, we reuse **[Node's module loading mechanisms](https://nodejs.org/api/modules.html#modules_all_together)**.
Hence, the same rules apply:

- Relative path resolution<br>
  Names starting with `./` or `../` are resolved relative to the current model.
- Resolving absolute references<br>
  Names starting with `/` are resolved absolute to the file system.
- Resolving module references<br>
  Names starting with neither `.` nor `/` such as `@sap/cds/common` are fetched for in `node_modules` folders:
   - Files having _.cds_, _.csn_, or _.json_ as suffixes, appended in order
   - Folders, from either the file set in `cds.main` in the folder's _package.json_ or `index.<cds|csn|json>` file.

::: tip
To allow for loading from precompiled _.json_ files it's recommended to **omit _.cds_ suffixes** in import statements, as shown in the provided examples.
:::



## Comments {#comments}

- [Single-Line Comments](#single-comment)
- [Multi-Line Comments](#multi-comment)
- [Doc comments](#doc-comment)


### Single-Line Comments — `//` {#single-comment}

Any text between `//` and the end of the line is ignored:

```cds
entity Employees {
  key ID : Integer;  // a single-line comment
  name : String;
}
```

### Multi-Line Comments — `/*  */` {#multi-comment}

Any text between `/*` and `*/` is ignored:

```cds
entity Employees {
  key ID : Integer;
/*
  a multi-line comment
*/
  name : String;
}
```

unless it is a doc comment.

### Doc Comments — `/**  */`
{#doc-comment}

A multi-line comment of the form `/** … */` at an [annotation position](#annotation-targets) is considered a *doc comment*:

```cds
/**
 * I am the description for "Employee"
 */
entity Employees {
  key ID : Integer;
  /**
   * I am the description for "name"
   */
  name : String;
}
```

The text of a doc comment is stored in CSN in the property `doc`.
When generating OData EDM(X), it appears as value for the annotation `@Core.Description`.

When generating output for deployment to SAP HANA, the first paragraph of a doc comment is translated to the HANA `COMMENT` feature for tables, table columns, and for views (but not for view columns):

```sql
CREATE TABLE Employees (
  ID INTEGER,
  name NVARCHAR(...) COMMENT 'I am the description for "name"'
) COMMENT 'I am the description for "Employee"'
```

Doc comments need to be switched on when calling the compiler:

```sh
# in CLI:
cds compile foo.cds --docs
```
```js
// in JavaScript:
cds.compile(..., { docs: true })
```

::: tip
Propagation of doc comments can be stopped via an empty one: `/** */`.
:::
