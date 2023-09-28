---
shorty: Compiler v2
synopsis: >
  This document describes the upgrade to compiler version 2, released March 2021. As both compiler version 1 and version 2 are out of maintenance by now,
  we expect that all projects have already upgraded. If in doubt, run `cds v` to find out which version of the CAP modules you have in use.

# layout: cds-ref
redirect_from: releases/compiler-v2
status: released
---

<!-- Keep this page, as _many_ links point to it! -->

# Upgrade to Compiler v2

{{ $frontmatter.synopsis }}

CDS compiler version 2 brings numerous improvements, which allow us to significantly streamline model processing going forward.
Changes mostly affect internal implementations of the compiler and nonpublic parts of the artifacts produced by the compiler (CSN, EDMX, ...), hence are unlikely to be observed by users of CDS.

Nevertheless, there are a few changes that you as a user should notice and that can require adaptation of your models and/or code.
This section describes these changes and what is necessary to migrate your application to compiler v2. For a complete list of all changes, refer to the compiler's changelog.

<style scoped>
  h3 {
    margin: 77px 0 44px;
    font-size: 1.5em;
    font-weight:500;
  }
  .error {
    font-family: monospace;
    font-style: italic;
    font-size: 95%;
  }
</style>


## Things You _Must_ Fix {#must-fix}

Following are the most likely things you might face when upgrading to compiler v2, and **must** fix.

::: tip
Most of these things can already be fixed with compiler v1,
before upgrading to v2 &rarr; find respective hints in the following sections.
:::

### Fix ambiguous `redirects`

When there's no unique target for [**_auto-redirection_**](../guides/providing-services#redirected-associations),
compiler v1 'silently' skipped respective associations with a warning.
Yet, many ignored these warnings, which lead to hard-to-detect subsequent errors.
Therefore, we raised that to an error-level message with compiler v2.


Example:

```cds
context my {
  entity E { ..., f: Association to F; }
  entity F { ... }
}
service S {
  entity F1 as projection on my.F; //> redirection target for E.f?
  entity F2 as projection on my.F; //> redirection target for E.f?
  entity E as projection on my.E;  //> which target to use for E.f?
}
```

Compiling this would produce this error message in compiler v2 or warning with compiler v1:

Target “F” is exposed in service “S” by multiple projections “S.F1”, “S.F2” - no implicit redirection.
{.error.danger}
<!-- TODO -->


You have three options to solve this problem, which can also be combined:


::: tip **Option 1:**<br>
Annotate ambiguous targets with `@cds.redirection.target: false`
:::

```cds
service S {
  entity F1 @(cds.redirection.target:false) as projection on my.F;
  entity F2 @(cds.redirection.target:false) as projection on my.F;
  entity E as projection on my.E;  //> E.f will be skipped as before
}
```

> Annotate all such targets like that to get exactly the former behavior.

::: tip
Call `cds fix-redirects` to let the compiler generate the required annotate statements for you.
:::

::: tip **Option 2:**<br>
Annotate the preferred targets with `@cds.redirection.target: true`
:::

```cds
service S {
  entity F1 @(cds.redirection.target:true) as projection on my.F;
  entity F2 as projection on my.F;
  entity E as projection on my.E;  //> E.f will refer to S.F1
}
```


::: tip **Option 3:**<br>
Redirect an association's target explicitly with `redirected to`
:::

```cds
service S {
  entity F1 as projection on my.F;
  entity F2 as projection on my.F;
  entity E as projection on my.E {
    *, f : redirected to F1        //> E.f will refer to S.F1
  }
}
```

You can fix this already with compiler v1 &rarr; just pay attention to the warning.


### Fix refs to `Foo.element`

With compiler v2 the only syntax to refer to elements is `Foo:element`. Former versions also tolerated
`Foo.elements` with a warning. With the introduction of [_Scoped Names_](./cdl#scoped-names),
this is not reliably robust anymore, therefore we had to raise the warning to an error.

Example:

```cds
entity Foo { a: Integer; }
entity Bar { b: Foo.a; }
```

Compiling this would produce this error with compiler v2 or warning with compiler v1:

Artifact “Foo.a” hasn't been found
{.error.danger}
<!-- TODO -->
Replace the dot before "a" by a colon.
{.error.warning}

::: tip
**Fix:** Rewrite such references from `Foo.a` to `Foo:a`.
:::

You can fix this already with compiler v1 &rarr; just pay attention to the warning.


### Fix refs to `Foo_texts`

With compiler v2, suffixes of generated texts entities change from `_texts` to `.texts`.
This is to consistently apply the same principles and automatisms, including upcoming ones,
of [_Scoped Names_](./cdl#scoped-names) and [_Managed Compositions_](./cdl#managed-compositions) also for [_Localized Data_](../guides/localized-data#behind-the-scenes).

While you should not have to refer to these generated entities at all,
we saw this did happen in stakeholder models.

Example:
{#foo-texts-example}

```cds
entity Foo : cuid { /* ...; */ title : localized String; }
entity FooTexts as projection on Foo_texts; //> error
```

Compiling this would produce that error:

No artifact has been found with name “Foo_texts”
{.error.danger}
<!-- TODO -->

::: tip **Fix:**
Adjust references to use suffix `.texts` instead of `_texts`,
both, in CDS models as well as in Node.js or Java coding.
:::

> That is, in the previous example:

```cds
entity FooTexts as projection on Foo.texts;
```



### Fix Uses of `"string?"`

Delimited identifiers with double quotes `"..."` are no longer allowed.
They've been deprecated since CDS compiler version 1.23.0 with a warning.
In compiler v2, this message is raised to an **error**.

Reason for this change is that `"..."` is oftentimes mistaken as a string literal. So, today many usages of double quotes are probably wrong.
When replacing the double quotes, check carefully whether you want a delimited identifier or a string literal.

Example:

<!-- cds-mode: ignore, because it's deprecated syntax -->
```cds
@UI.Facets: [{ ..., "@UI.Hidden": "cancelled" }]
@Common.Label: "A Label String"
entity Foo { /* ...; */ cancelled: Boolean; }
entity "Strange Name, isn't it?" { /*...*/ }
```

Compiling this would result in four errors of this form (warning in case of compiler v1):

Deprecated delimited identifier syntax, use ![...]
{.error.danger}
<!-- TODO -->
Deprecated delimited identifier syntax, use ![...]
{.error.warning}

::: tip **Fix:**
Correct each to either of:
<br> **1.** &mdash; `'string'` if you actually meant to specify a string literal
<br> **2.** &mdash; `identifier` for references, which don't need quoting at all
<br> **3.** &mdash; `![non-identifier]` if you really need a quoted identifier &rarr; rare
:::

Applying these fixes to the previous example would result in:

```cds
@UI.Facets: [{ ..., @UI.Hidden: cancelled }]
@Common.Label: 'A Label String'
entity Foo { /* ...; */ cancelled: Boolean; }
entity ![Strange Name, isn't it?] { /* ... */ }
```

> **Ad 2:** We saw many cases of quoted element references in annotation values, such as in _@UI.Hidden:_`cancelled` above &rarr; you don't need to quote valid identifiers.

> **Ad 3:** Note that with compiler v2, and in contrast to cv1, nested annotation keys like `@UI.Hidden` above don't have to be quoted anymore.

You can partially fix this already with compiler v1, especially with respect to the most common cases 1 and 2 above.


### Use `as` Alias Always

Compiler v2 now reports a warning when you use the SQL laziness of specifying table or column aliases
without keyword `as`. You really should fix that as we've seen hard-to-detect errors in models.

Example:

```cds
entity Foo as select from Bar b // table alias w/o 'as'
{
  column1 c1,  // column alias w/o 'as'
  column2,
  column3      // missing comma !!
  column4      // -> column alias w/o 'as' !!!
};
```

Compiling this would give you one error and two warnings of this kind:

Add the keyword **AS** in front of the alias name
{.error.warning}

::: tip **Fix:**
Always do as the warning asks you to do
:::

Reasoning: The table aliases can conflict with keywords when moving to other databases in future,
hence too fragile to allow in going forward.
The missing comma case is ugly and hard to detect.


### Use explicit `casts`

With compiler v2, appending a type declaration to a column expression in a
view's query doesn't generate a `cast` in SQL anymore, as that created
conflicts with various database-specific behaviors. Hence, add such casts
explicitly from now on.

Example:

```cds
entity Foo as select from Bar {
  (foo || bar) as foobar : String
};
```

Can fail at runtime with an SAP HANA exception like that:

... exception 70006930
{.error.danger}

::: tip **Fix:**
Add explicit SQL `cast` expressions as shown in the following sample.
:::


```cds
entity Foo as select from Bar {
  cast (foo || bar as String) as foobar
};
```


### Use Valid `types` Only

Compiler v2 removed some quirks when specifying types, such as for elements, parameters, or in casts,
which caused hard-to-resolve subsequent errors.

While we saw this in models only rarely, find below error messages you might face when upgrading to compiler v2, with corresponding fixes.

#### 1. Only `types` Allowed:

```cds
aspect SomeAspect {...}
entity SomeEntity {...}
entity E { x: SomeAspect; y: SomeEntity; }
```

Compiling this produces errors of this form:

A type or an element is expected here.
{.error.danger}

::: tip **Fix:**
Don't use an `aspect` or an `entity` where only types are allowed.
:::


#### 2. Only `entities` from Same Service Allowed:

```cds
entity ExternalEntity {...}
service S { action foo() returns ExternalEntity; }
```

Compiling this produces errors of this form in compiler v2 or warnings in compiler v1:

A type, an element, or a service entity is expected here
{.error.danger}

Entity type must be from the current service 'S'
{.error.warning}

::: tip **Fix Option 1**<br>
Add a projection on the entity in the service and use this as _foo_'s return type.
:::

::: tip **Fix Option 2**<br>
Define and use an auxiliary type, for example `type T : E {}`.
:::

You can fix this already with compiler v1 &rarr; just pay attention to the warning.


## Things You _Should_ Fix {#should-fix}

Following are things, which don't break when upgrading to compiler v2, but nevertheless **should**
be fixed whenever possible, as they might cause nifty follow-up problems.
Most of these things have been warnings already with compiler v1,
which you should have been paid attention to.



### Avoid Names Starting with `$`

All names that start with `$` are reserved for internal purposes.
Using such names for your own definitions (also with delimiters) results in a **warning** and should be avoided.

Example:

```cds
entity $Funny { ... };   // this name should not be used
entity ![$Too] { ... };  // this name should not be used
```

::: tip **Fix:**
Choose a different name.
:::



### Replace `abstract entity`

Abstract entities are deprecated, the definition of an `abstract entity` now results in this warning:

Abstract entity definitions are deprecated; use aspect definitions instead.
{.error.warning}

::: tip **Fix:**
Use [aspects](./cdl#aspects) instead of abstract entities.
:::

> Abstract entities are now represented in CSN as an aspect, that is, `{kind:'aspect'}`.


## Changes in CSN

Due to the changes in the CSN format, the CSN `$version` has been increased to 2.0.
The compiler still accepts CSN documents that use the old format.

You'll only notice these changes, if you've custom code that evaluates CSN.


### New/Changed: Property `projection`

Projections like `entity P as projection on E` are now represented in CSN as property `projection`:

```json
{
  "kind": "entity",
  "projection": {
    "from": {
      "ref": ["E"]
    }
  }
}
```

With compiler v1, projections were represented as `query.SELECT` plus `$syntax: projection`.

#### Migration

If you've custom code that evaluates the CSN and operates on projections, you need to adapt that code. This, for example, applies to code that collects all views and projections in a CSN.


### New/Changed: kind `aspect`

Aspects like `aspect A { ... }` are represented in CSN with kind `aspect`:

```json
{
  "definitions": {
    "A": {
      "kind": "aspect",
      "elements": { ... }
    }
  }
}
```

With compiler v1, aspects were represented with kind `type` plus `$syntax: aspect`.

In addition, abstract entities are now represented in CSN like aspects (see that also "Abstract entities are deprecated").

#### Migration

If you've custom code that evaluates the CSN and operates on aspects, you need to adapt that code.


### New/Changed: Nested `{xpr}`

Unnecessary parentheses aren't represented in CSN anymore. Parentheses around sub-expressions are represented as `xpr`.
Tuples in expressions like `x in (1, 2, 3)` are expressed as `list`.

Example:

<!-- cds-mode: xpr -->
```cds
a * ( b + ( c ) )
```
is now represented as:

```json
"xpr": [{"ref": ["a"]}, "*", {"xpr": [{"ref": ["b"]}, "+", {"ref": ["c"]} ]}]
```

The tuple:

<!-- cds-mode: xpr -->
```cds
(1, 2, 3)
```
is now represented as:

```json
"list": [ {"val": 1}, {"val": 2}, {"val": 3 } ]
```

#### Migration

If you have custom code that evaluates expressions in CSN, you need to adapt that code.


### Changed: Simplified `{val}` for Number Literals

A unary minus now is represented as part of the literal value.
A decimal number is now represented as number if the string representation of that number is equal to the original CDL representation.

In expressions:

| CDL    | CSN v1 | CSN v2 |
| ---    | ---    | ---    |
| `-1`   | `{"xpr": ["-", {"val": 1}]}`                          | `{"val": -1}`   |
| `1.1`  | `{"val": "1.1", "literal": "number"}`                 | `{"val": 1.1}`  |
| `-1.1` | `{"xpr": ["-", {"val": "1.1", "literal": "number"}]}` | `{"val": -1.1}` |

Annotation values:

| CDL    | CSN v1 | CSN v2 |
| ---    | ---    | ---    |
| `-1`   | `-1`     | `-1`   |
| `1.1`  | `"1.1"`  | `1.1`  |
| `-1.1` | `"-1.1"` | `-1.1` |

#### Migration

Even if you've code that evaluates CSN, this change shouldn't break it: if it worked with the
old representation of numbers, it should also work with the new one. In the unlikely event that it doesn't work,
you've to adapt the code.


### Changed: `up_` as Managed Association

For managed compositions, the generated `up_` association is changed from _unmanaged_ to _managed_.

#### Migration

If you've custom code that evaluates the CSN and operates on these generated `up_` associations, you need to adapt that code.

This change has no effect on generated EDMX for OData and generated database objects.

As a consequence of this change, the feature "managed composition" can't be used with `--to hana`
in the undocumented and deprecated naming mode `hdbcds`.
If you want to use the feature "managed composition" and stay with naming mode `hdbcds`,
you need to switch to generating hdbtable/hdbview files.


### Changed: Names of Auto-Exposed Entities

With compiler v2, the names of [auto-exposed](./cdl#auto-expose) entities change,
as the names generated by compiler v1 weren't guaranteed to be unique.
While you should not have to refer to these auto-exposed entities at all, we saw this did happen in stakeholder models.

A prominent example is the auto-exposure of text entities:

```cds
entity Foo { /* ...; */ descr: localized String; }
service S {
  entity Bar as projection on Foo;
}
```

The projection exposing the text entity for `Foo` in the service had the name `S.Foo_texts` in compiler v1.
Now the name is `S.Bar.texts`.

#### Migration

Adjust references to the auto-exposed entities, both, in CDS models as well as in Node.js or Java coding.

Note, however, that these auto-exposed entities and in particular their names are not a documented API of CDS.
Their names can change or they can even disappear in a future version. If you really need explicit access to them, we recommend to explicitly expose them in the service.


### Removed: `localized.<...>` Entries in CSN

For entities with "localized" elements, "convenience" views are still generated
[behind the scenes](../guides/localized-data#behind-the-scenes) into the database, but the CSN doesn't contain them anymore.

You shouldn't rely on the presence of these views in the database, as they can disappear in a future version.

Example for the definition:

```cds
entity E {
  key id : Integer;
  t : localized String;
}
entity P as projection on E;
```

the CSN used to contain the view definitions `localized.E` and `localized.P`, which now aren't present anymore.

#### Migration

If you've custom code that evaluates CSN and makes use of these view definitions, you need to adapt that code.


### Removed: Auto-Exposed Types in OData Transformed CSN

During OData processing, additional types can be generated in the service to make the EDMX self-contained.
With compiler v2, these additional types are not reflected in CSN anymore.

#### Migration

If you've got custom code that evaluates the CSN and uses these types, you need to adapt that code.
Also in Java, [accessor-](../java/advanced#accessor-interfaces) or [model interfaces](../java/advanced#model-interfaces) generated for these types, will change.


### Removed: Property `$syntax`

CSN does no longer contain the undocumented, internal attribute `$syntax`.

#### Migration

If you've custom code that evaluates the CSN and uses the property `$syntax`, you need to adapt that code.
See also "Representation of aspects" and "Representation of projections".


## Changes in SQL Output

### Removed: Virtual Elements as Calculated Fields

If a CDS view or projection contains virtual elements, they're no longer reflected in the generated database view.

Example:

```cds
entity E { /* ...; */ virtual foo : Integer; }
entity P as projection on E;
```

The database view generated by compiler v2 looks like:

```sql
CREATE VIEW P AS SELECT id FROM E
```

while compiler v1 used to add an entry for the virtual field:

```sql
CREATE VIEW P AS SELECT id, NULL AS foo FROM E
```

#### Migration

If you've custom code that relies on the presence of these fields in database views,
you need to adapt that code. This adaptation can already be made in compiler v1.




## Impact on Java Code

CAP Java supports using CDS models that have been compiled with the CDS complier v2. When starting a new project, it's recommended and straightforward to use the compiler v2. However, when *upgrading* the CDS compiler of an existing CAP Java project to compiler v2 some particularities should be observed.

### Name of Text Entities

For every entity that has *localized* elements the CDS compiler [behind the scenes](../guides/localized-data#behind-the-scenes) generates a corresponding "texts" entity that holds the translated texts. The name of this entity changes with CDS compiler v2.

::: warning _❗ Warning_
With compiler v1 the "texts" entity is generated with the suffix `_texts`, while the compiler v2 uses the suffix `.texts`!
:::

For the following entity:

```cds
entity Books {
  key ID    : UUID; //= source's primary key
      title : localized String;
}
```

the compiler v1 generates:

```cds
// CDS compiler v1
extend entity Books with {
  texts : Composition of many Books_texts on texts.ID=ID;
  localized : Association to Books_texts on localized.ID=ID
    and localized.locale = $user.locale;
}

entity Books_texts {
  key locale : String(5);
  key ID     : UUID;
      title  : String;
}
```

whereas the compiler v2 will generate:

```cds
// CDS compiler v2
extend entity Books with {
  texts : Composition of many Books.texts on texts.ID=ID;
  localized : Association to Books.texts on localized.ID=ID
    and localized.locale = $user.locale;
}

entity Books.texts {
  key locale : String(5);
  key ID     : UUID;
      title  : String;
}
```

While this change is taken into account automatically by the OData protocol adapters, it might require attention in your Java custom code.

#### Avoid Using the Fully Qualified "texts" Entity Name { #texts-entity-name}

The best way to tackle this change is to avoid to *directly* use the fully qualified name of the "texts" entity. Instead, it is recommended to access it indirectly via the `texts` association:

For example, instead of:

```java
Map<String, Object> id = singletonMap(ID, 17);
Select.from("bookshop.Books_texts").matching(id);
```

you should rather construct the query as:

```java
Map<String, Object> id = singletonMap(ID, 17);
Select.from("bookshop.Books", b -> b.matching(id).to("texts"));
```

#### CSV Files

CAP Java allows to [provide initial data](../guides/databases#providing-initial-data) to your application using CSV files. The name of the CSV file should adhere to the pattern `<namespace>-<entity>.csv` (`<qualified-entity-name>.csv`). Renaming the CSV file is recommended.

```sh
mv bookshop-Books_texts.csv bookshop-Books.texts.csv
```

::: warning _❗ Warning_
If a CSV file has already been deployed to a productive SAP HANA schema it can't be renamed any longer. To support this situation cds deploy as well as the CSV data loader in CAP Java still suppport CSV files with a `_texts` suffix.
:::

### Interfaces for Types Defined Outside of Service

In CDS a type may be used _within_ a service that is defined _outside_ of this service, like the type `Status` in the following example:

```cds
type Status {
    code : Boolean;
}

service orders {
  function cancel(orderId : Integer) returns Status;
}
```

This would be invalid in OData. In order to allow for such a mapping also in OData the compiler automatically "exposes" the otherwise undefined types in the EDMX service definition:

 ```xml
<edmx:Edmx Version="4.0">
  <edmx:DataServices>
    <Schema Namespace="orders">
      <EntityContainer Name="EntityContainer">
        <FunctionImport Name="cancel" Function="orders.cancel"/>
      </EntityContainer>
      <ComplexType Name="Status">          <!-- auto exposed -->
        <Property Name="code" Type="Edm.Boolean"/>
      </ComplexType>
      <Function Name="cancel" IsBound="false" IsComposable="false">
        <Parameter Name="orderId" Type="Edm.Int32"/>
        <ReturnType Type="orders.Status"/>
      </Function>
    </Schema>
  </edmx:DataServices>
</edmx:Edmx>
```

In this example, the return type of the `cancel` function is automatically exposed as `orders.Status` in the `orders` service.

With compiler v1 this change was also reflected in the CSN. With compiler v2 this is not the case any longer.

::: warning _❗ Warning_
If types are used in a service that are defined outside of the service the [generated accessor interface](../java/data#generated-accessor-interfaces) will change when upgrading from compiler v1 to v2!
:::

If compiler v1 is used CAP Java will generate interfaces using the automatically exposed type from EDMX:

```java
// CDS Compiler v1

interface Status { // from CDS model
  Boolean getCode();
}

---

interface orders.Status {  // from EDMX
  Boolean getCode();
}

interface orders.CancelContext extends EventContext {
    CancelContext result(orders.Status result); // from EDMX
    orders.Status result();
}
```

If compiler v2 is used CAP Java will instead generate interfaces using the types from the CDS model definition:

```java
// CDS Compiler v1

interface Status { // from CDS model
  Boolean getCode();
}

---

interface orders.CancelContext extends EventContext {
    CancelContext result(Status result); // from EDMX
    Status result();
}
```

Your custom coded needs to be adapted accordingly. This will not be necessary if you avoid upfront using a type in a service that has been defined outside of the service.

### Interfaces for Inline Defined Types

CDS allows to use anonymous inline defined types in a service, for example as items types of an arrayed type or as a return type of a function:

```cds
service hr {
  entity Person {
    emails: many {
        key kind    : String;
            address : String;
    };
  }
}
```

OData, however, does not support anonymous types. Hence, the compiler will automatically create a type definition for inline defined typed in the EDMX model:

```xml
<edmx:Edmx Version="4.0">
  <edmx:DataServices>
    <Schema Namespace="hr">
      <EntityContainer Name="EntityContainer">
        <EntitySet Name="Person" EntityType="hr.Person"/>
      </EntityContainer>
      <EntityType Name="Person">
        <Property Name="emails" Type="Collection(hr.Person_emails)" Nullable="false"/>
      </EntityType>
      <ComplexType Name="Person_emails">    <!-- generated -->
        <Property Name="kind" Type="Edm.String" Nullable="false"/>
        <Property Name="address" Type="Edm.String"/>
      </ComplexType>
    </Schema>
  </edmx:DataServices>
</edmx:Edmx>
```

In this example the compiler generated the type `Person_emails` in the OData service `hr`.

::: warning _❗ Warning_
If an inline defined type is used in a service the [generated accessor interface](../java/data#generated-accessor-interfaces) will change (an inner interface is generated) when upgrading from compiler v1 to v2!
:::

If compiler v1 is used CAP Java generates a *top-level* interface for item type:

```java
// CDS compiler v1
package hr;

interface Person {
    Collection<PersonEmails> getEmails();
    void setEmails(Collection<PersonEmails> emails);
}

interface PersonEmails {
    String getKind();
    void setKind(String kind);
    String getAddress();
    void setAddress(String address);
}
```

If compiler v2 is used CAP Java generates an *inner* interface for item type:

```java
// CDS compiler v2
package hr;

interface Person {
    Collection<Emails> getEmails();
    void setEmails(Collection<Emails> emails);

    interface Emails {
        String getKind();
        void setKind(String kind);
        String getAddress();
        void setAddress(String address);
    }
}
```

Your custom coded needs to be adapted accordingly. This will not be necessary if you avoid upfront using an inline defined type in a service but instead use a type that is defined in the service.
