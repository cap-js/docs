---
shorty: OData
synopsis: >
  Find details about CAP's support for the OData protocol.
permalink: advanced/odata
redirect_from:
  - cds/odata-annotations
status: released
---

<script setup>
  import { h } from 'vue'
  const X =  () => h('span', { class: 'ga',      title: 'Available' },      ['✓']   )
  const Na = () => h('i',    { class: 'na',      title: 'not applicable' }, ['n/a'] )
  const D =  () => h('i',    { class: 'prog',    title: 'in progress'  },   ['in prog.'] )
  const O =  () => h('i',    { class: 'plan',    title: 'planned'  },       ['planned'] )
</script>
<style scoped>
  .ga   { color: var(--vp-c-green-dark); font-weight:900;}
  .na   { color: #aaa; font-size:90%; }
  .prog { color: var(--vp-c-green-dark); font-size:90%; font-weight:500; }
  .plan { color: #089; font-size:90% }
</style>

# Serving OData APIs

## Feature Overview { #overview}

OData is an OASIS standard, which essentially enhances plain REST with standardized query options like `$select`, `$expand`, `$filter`, etc. Find a rough overview of the feature coverage in the following table.

| Query Options  | Remarks                                   | Node.js    | Java    |
|----------------|-------------------------------------------|------------|---------|
| `$search`      | Search in multiple/all text elements<sup>(3)</sup>        | <X/>      | <X/>   |
| `$value`       | Retrieves single rows/values              | <X/>      | <X/>  |
| `$top`,`$skip` | Requests paginated results                | <X/>      | <X/>   |
| `$filter`      | Like SQL where clause                     | <X/>      | <X/>   |
| `$select`      | Like SQL select clause                    | <X/>      | <X/>   |
| `$orderby`     | Like SQL order by clause                  | <X/>      | <X/>   |
| `$count`       | Gets number of rows for paged results     | <X/>      | <X/>   |
| [Delta Payload](https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_DeltaPayloads) | For nested entity collections in deep update | <D/> | <X/> |
| `$apply`       | For [data aggregation](#data-aggregation) | <X/>      | <X/>   |
| `$expand`      | Deep-read associated entities             | <X/> <sup>(1)</sup>     | <X/> <sup>(2)</sup>  |
| [Lambda Operators](https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part2-url-conventions.html#_Toc31361024)   | Boolean expressions on a collection       | <X/>      | <X/> <sup>(4)</sup> |

<span id="features" />

- <sup>(1)</sup> Support for nested `$select`, `$expand`, `$filter` and `$orderby` options.
- <sup>(2)</sup> Support for nested `$select`, `$expand`, `$filter`, `$orderby`, `$top` and `$skip` options.
- <sup>(3)</sup> The elements to be searched are specified with the [`@cds.search` annotation](../guides/providing-services/#searching-data).
- <sup>(4)</sup> Current limitation: Navigation path identifying the collection can only contain one segment.


[Learn more in the **Getting Started guide on odata.org**.](https://www.odata.org/getting-started/){.learn-more}
[Learn more in the tutorials **Take a Deep Dive into OData**.](https://developers.sap.com/mission.scp-3-odata.html){.learn-more}

## Mapping of CDS Types { #type-mapping}

The table below lists [CDS's built-in types](../cds/types) and their mapping to the OData EDM type system.

| CDS Type       | OData V4                                |
| -------------- | --------------------------------------- |
| `UUID`         | _Edm.Guid_ <sup>(1)</sup>.              |
| `Boolean`      | _Edm.Boolean_                           |
| `UInt8  `      | _Edm.Byte_                              |
| `Int16`        | _Edm.Int16_                             |
| `Int32`        | _Edm.Int32_                             |
| `Integer`      | _Edm.Int32_                             |
| `Int64`        | _Edm.Int64_                             |
| `Integer64`    | _Edm.Int64_                             |
| `Decimal`      | _Edm.Decimal_                           |
| `Double`       | _Edm.Double_                            |
| `Date`         | _Edm.Date_                              |
| `Time`         | _Edm.TimeOfDay_                         |
| `DateTime`     | _Edm.DateTimeOffset_                    |
| `Timestamp`    | _Edm.DateTimeOffset_ with Precision="7" |
| `String`       | _Edm.String_                            |
| `Binary`       | _Edm.Binary_                            |
| `LargeBinary`  | _Edm.Binary_                            |
| `LargeString`  | _Edm.String_                            |

> <sup>(1)</sup> Mapping can be changed with, for example, `@odata.Type='Edm.String'`

OData V2 has the following differences:

| CDS Type     | OData V2                                        |
| ------------ | ----------------------------------------------- |
| `Date`       | _Edm.DateTime_ with `sap:display-format="Date"` |
| `Time`       | _Edm.Time_                                      |


### Overriding Type Mapping { #override-type-mapping}

Override standard type mappings using the annotation `@odata.Type` first, and then additionally define `@odata {MaxLength, Precision, Scale, SRID}`.

`@odata.Type` is effective on scalar CDS types only and the value must be a valid OData (EDM) primitive type for the specified protocol version. Unknown types and non-matching facets are silently ignored. No further value constraint checks are applied.

They allow, for example, to produce additional OData EDM types which are not available in the standard type mapping. This is done during
the import of external service APIs, see [Using Services](../guides/using-services#external-service-api).

```cds
entity Foo {
  ...,
  @odata: { Type: 'Edm.GeometryPolygon', SRID: 0 }
  geoCollection : LargeBinary;
};
```

Another prominent use case is the CDS type `UUID`, which maps to `Edm.Guid` by default. However, the OData standard
puts up restrictive rules for _Edm.Guid_ values - for example, only hyphenated strings are allowed - which can conflict with existing data.
Therefore, you can overridde the default mapping as follows:

```cds
entity Books {
  key ID : UUID @odata.Type:'Edm.String';
  ...
}
```

::: warning
It is possible to "cast" any scalar CDS type into any (in-)compatible EDM type:

```cds
entity Foo {
  // ...
  @odata: {Type: 'Edm.Decimal', Scale: 'floating' }
  str: String(17) default '17.4';
}
```

This translates into the following OData API contract:

```xml
<Property Name="str" Type="Edm.Decimal" Scale="floating" DefaultValue="17.4"/>
```

The client can now rightfully expect that float numbers are transmitted but in reality the values are still strings. There is no automatic data conversion behind the scenes.
:::


## OData Annotations { #annotations}

The following sections explain how to add OData annotations to CDS models and how they’re mapped to EDMX outputs.


### Terms and Properties

OData defines a strict two-fold key structure composed of `@<Vocabulary>.<Term>` and all annotations are always specified as a _Term_ with either a primitive value, a record value, or collection values. The properties themselves may, in turn, be primitives, records, or collections.

#### Example

```cds
@Common.Label: 'Customer'
@Common.ValueList: {
  Label: 'Customers',
  CollectionPath: 'Customers'
}
entity Customers { }
```

This is represented in CSN as follows:

```json
{"definitions":{
  "Customers":{
    "kind": "entity",
    "@Common.Label": "Customer",
    "@Common.ValueList.Label": "Customers",
    "@Common.ValueList.CollectionPath": "Customers"
  }
}}
```

And would render to EDMX as follows:

```xml
<Annotations Target="MyService.Customers">
  <Annotation Term="Common.Label" String="Customer"/>
  <Annotation Term="Common.ValueList">
    <Record Type="Common.ValueListType">
      <PropertyValue Property="Label" String="Customers"/>
      <PropertyValue Property="CollectionPath" String="Customers"/>
    </Record>
  </Annotation>
</Annotations>
```

::: tip
The value for `@Common.ValueList` is flattened to individual key-value pairs in CSN and 'restructured' to a record for OData exposure in EDMX.
:::

For each annotated target definition in CSN, the rules for restructuring from CSN sources are:

1. Annotations with a single-identifier key are skipped (as OData annotations always have a `@Vocabulary.Term...` key signature).
2. All individual annotations with the same `@<Vocabulary.Term>` prefix are collected.
3. If there is only one annotation without a suffix, &rarr; that one is a scalar or array value of an OData term.
4. If there are more annotations with suffix key parts &rarr; it's a record value for the OData term.


### Qualified Annotations

OData foresees [qualified annotations](http://docs.oasis-open.org/odata/odata/v4.0/errata03/os/complete/part3-csdl/odata-v4.0-errata03-os-part3-csdl-complete.html#_Toc453752511), which essentially allow to specify different values for a given property. CDS syntax for annotations was extended to also allow appending OData-style qualifiers after a `#` sign to an annotation key, but always only as the last component of a key in the syntax.

For example, this is supported:

```cds
@Common.Label: 'Customer'
@Common.Label#Legal: 'Client'
@Common.Label#Healthcare: 'Patient'
@Common.ValueList: {
  Label: 'Customers',
  CollectionPath:'Customers'
}
@Common.ValueList#Legal: {
  Label: 'Clients',
  CollectionPath:'Clients'
}
```

and would render as follows in CSN:

```json
{
  "@Common.Label": "Customer",
  "@Common.Label#Legal": "Clients",
  "@Common.Label#Healthcare": "Patients",
  "@Common.ValueList.Label": "Customers",
  "@Common.ValueList.CollectionPath": "Customers",
  "@Common.ValueList#Legal.Label": "Clients",
  "@Common.ValueList#Legal.CollectionPath": "Clients",
}
```

Note that there's no interpretation and no special handling for these qualifiers in CDS. You have to write and apply them in exactly the same way as your chosen OData vocabularies specify them.


### Primitives

::: tip
The `@Some` annotation isn't a valid term definition. The following example illustrates the rendering of primitive values.
:::

Primitive annotation values, meaning Strings, Numbers, `true`, `false`, and `null` are mapped to corresponding OData annotations as follows:

```cds
@Some.Null: null
@Some.Boolean: true
@Some.Integer: 1
@Some.Number: 3.14
@Some.String: 'foo'
```

```xml
<Annotation Term="Some.Null"><Null/></Annotation>
<Annotation Term="Some.Boolean" Bool="true"/>
<Annotation Term="Some.Integer" Int="1"/>
<Annotation Term="Some.Number" Decimal="3.14"/>
<Annotation Term="Some.String" String="foo"/>
```

[Have a look at our *CAP SFLIGHT* sample, showcasing the usage of OData annotations.](https://github.com/SAP-samples/cap-sflight/blob/main/app/travel_processor/capabilities.cds){.learn-more}

### Records

> The `@Some` annotation isn’t a valid term definition. The following example illustrates the rendering of record values.

Record-like source structures are mapped to `<Record>` nodes in EDMX, with primitive types translated analogously to the above:

```cds
@Some.Record: {
  Null: null,
  Boolean: true,
  Integer: 1,
  Number: 3.14,
  String: 'foo'
}
```
```xml
<Annotation Term="Some.Record">
  <Record>
    <PropertyValue Property="Null"><Null/></PropertyValue>
    <PropertyValue Property="Boolean" Bool="true"/>
    <PropertyValue Property="Integer" Int="1"/>
    <PropertyValue Property="Number" Decimal="3.14"/>
    <PropertyValue Property="String" String="foo"/>
  </Record>
</Annotation>
```

If possible, the type of the record in OData is deduced from the information in the [OData Annotation Vocabularies](#vocabularies):
```cds
@Common.ValueList: {
  CollectionPath: 'Customers'
}
```
```xml
<Annotation Term="Common.ValueList">
  <Record Type="Common.ValueListType">
    <PropertyValue Property="CollectionPath" String="Customers"/>
  </Record>
</Annotation>
```

Frequently, the OData record type cannot be determined unambiguously, for example if the type found in the vocabulary is abstract.
Then you need to explicitly specify the type by adding a property named `$Type` in the record. For example:
```cds
@UI.Facets : [{
  $Type  : 'UI.CollectionFacet',
  ID     : 'Customers'
}]
```
```xml
<Annotation Term="UI.Facets">
  <Collection>
    <Record Type="UI.CollectionFacet">
      <PropertyValue Property="ID" String="Travel"/>
    </Record>
  </Collection>
</Annotation>
```

There is one exception for a very prominent case: if the deduced [record type is `UI.DataFieldAbstract`](https://github.com/SAP/odata-vocabularies/blob/main/vocabularies/UI.md), the compiler
by default automatically chooses `UI.DataField`:
```cds
@UI.Identification: [{
  Value: deliveryId
}]
```
```xml
<Annotation Term="UI.Identification">
  <Collection>
    <Record Type="UI.DataField">
      <PropertyValue Property="Value" Path="deliveryId"/>
    </Record>
  </Collection>
</Annotation>
```
To overwrite the default, use an explicit `$Type` like shown previously.

[Have a look at our *CAP SFLIGHT* sample, showcasing the usage of OData annotations.](https://github.com/SAP-samples/cap-sflight/blob/a7b166b7b9b3d2adb1640b4b68c3f8a26c6961c1/app/travel_processor/value-helps.cds){.learn-more}


### Collections

> The `@Some` annotation isn’t a valid term definition. The following example illustrates the rendering of collection values.

Arrays are mapped to `<Collection>` nodes in EDMX and if primitives show up as direct elements of the array, these elements are wrapped into individual primitive child nodes of the resulting collection as is. The rules for records and collections are applied recursively:

```cds
@Some.Collection: [
  true, 1, 3.14, 'foo',
  { $Type:'UI.DataField', Label:'Whatever', Hidden }
]
```

```xml
<Annotation Term="Some.Collection">
  <Collection>
    <Null/>
    <Bool>true</Bool>
    <Int>1</Int>
    <Decimal>3.14</Decimal>
    <String>foo</String>
    <Record Type="UI.DataField">
      <PropertyValue Property="Label" String="Whatever"/>
      <PropertyValue Property="Hidden" Bool="True"/>
    </Record>
  </Collection>
</Annotation>
```

### References

>  The `@Some` annotation isn’t a valid term definition. The following example illustrates the rendering of reference values.

References in `cds` annotations are mapped to `.Path` properties or nested `<Path>` elements respectively:

```cds
@Some.Term: My.Reference
@Some.Record: {
  Value: My.Reference
}
@Some.Collection: [
  My.Reference
]
```

```xml
<Annotation Term="Some.Term" Path="My/Reference"/>
<Annotation Term="Some.Record">
  <Record>
    <PropertyValue Property="Value" Path="My/Reference"/>
  </Record>
</Annotation>
<Annotation Term="Some.Collection">
  <Collection>
    <Path>My/Reference</Path>
  </Collection>
</Annotation>
```

Use a [dynamic expression](#dynamic-expressions) if the generic mapping can't produce the desired `<Path>`:

```cds
@Some.Term: {$edmJson: {$Path: '/com.sap.foo.EntityContainer/EntityName/FieldName'}}
```

```xml
<Annotation Term="Some.Term">
  <Path>/com.sap.foo.EntityContainer/EntityName/FieldName</Path>
</Annotation>
```


### Enumeration Values

Enumeration symbols are mapped to corresponding `EnumMember` properties in OData.

Here are a couple of examples of enumeration values and the annotations that are generated. The first example is for a term in the
[Common vocabulary](https://github.com/SAP/odata-vocabularies/blob/main/vocabularies/Common.md):

```cds
@Common.TextFormat: #html
```

```xml
<Annotation Term="Common.TextFormat" EnumMember="Common.TextFormatType/html"/>
```

The second example is for a (record type) term in the [Communication vocabulary](https://github.com/SAP/odata-vocabularies/blob/main/vocabularies/Communication.md):

```cds
@Communication.Contact: {
  gender: #F
}
```

```xml
<Annotation Term="Communication.Contact">
  <Record Type="Communication.ContactType">
    <PropertyValue Property="gender" EnumMember="Communication.GenderType/F"/>
  </Record>
</Annotation>
```

### Annotating Annotations { #annotating-annotations}

OData can annotate annotations. This often occurs in combination with enums like `UI.Importance` and `UI.TextArrangement`.
CDS has no corresponding language feature. For OData annotations, nesting can be achieved in the following way:
* To annotate a Record, add an additional element to the CDS source structure. The name of this element is the full name of the annotation, including the `@`. See `@UI.Importance` in the following example.
* To annotate a single value or a Collection, add a parallel annotation that has the nested annotation name appended to the outer annotation name. See `@UI.Criticality` and `@UI.TextArrangement` in the following example.

```cds
@UI.LineItem: [
    {Value: ApplicationName, @UI.Importance: #High},
    {Value: Description},
    {Value: SourceName},
    {Value: ChangedBy},
    {Value: ChangedAt}
  ]
@UI.LineItem.@UI.Criticality: #Positive


@Common.Text: Text
@Common.Text.@UI.TextArrangement: #TextOnly
```

Alternatively, annotating a single value or a Collection by turning them into a structure with an artificial property `$value` is still possible, but deprecated:

```cds
@UI.LineItem: {
  $value:[ /* ... */ ], @UI.Criticality: #Positive
 }

@Common.Text: {
  $value: Text, @UI.TextArrangement: #TextOnly
}
```

As `TextArrangement` is common, there's a shortcut for this specific situation:

```cds
...
@Common: {
  Text: Text, TextArrangement: #TextOnly
}
```

In any case, the resulting EDMX is:

```xml
<Annotation Term="UI.LineItem">
  <Collection>
    <Record Type="UI.DataField">
      <PropertyValue Property="Value" Path="ApplicationName"/>
      <Annotation Term="UI.Importance" EnumMember="UI.ImportanceType/High"/>
    </Record>
    ...
  </Collection>
  <Annotation Term="UI.Criticality" EnumMember="UI.CriticalityType/Positive"/>
</Annotation>
<Annotation Term="Common.Text" Path="Text">
  <Annotation Term="UI.TextArrangement" EnumMember="UI.TextArrangementType/TextOnly"/>
</Annotation>
```

### Dynamic Expressions { #dynamic-expressions}

OData supports dynamic expressions in annotations. CDS syntax doesn't allow writing expressions
in annotation values, but for OData annotations you can use the "edm-json inline mechanism" by providing a [dynamic expression](http://docs.oasis-open.org/odata/odata-csdl-json/v4.01/odata-csdl-json-v4.01.html#_Toc38466479) as defined
in the [JSON representation of the OData Common Schema Language](http://docs.oasis-open.org/odata/odata-csdl-json/v4.01/odata-csdl-json-v4.01.html) enclosed in `{ $edmJson: { ... }}`.

Note that here the CDS syntax for string literals with single quotes (`'foo'`) applies,
and that paths are not automatically recognized but need to be written as `{$Path: 'fieldName'}`.
The CDS compiler translates the expression into the corresponding
[XML representation](http://docs.oasis-open.org/odata/odata-csdl-xml/v4.01/odata-csdl-xml-v4.01.html#_Toc38530421).

For example, the CDS annotation:

```cds
@UI.Hidden: {$edmJson: {$Ne: [{$Path: 'status'}, 'visible']}}
```

is translated to:

```xml
<Annotation Term="UI.Hidden">
  <Ne>
    <Path>status</Path>
    <String>visible</String>
  </Ne>
</Annotation>
```

### `sap:` Annotations

In general, back ends and SAP Fiori UIs understand or even expect OData V4 annotations. You should use those rather than the OData V2 SAP extensions.

<div id="translate-odata" />

If necessary, CDS automatically translates OData V4 annotations to
OData V2 SAP extensions when invoked with `v2` as the OData version.
This means that you shouldn’t have to deal with this at all.

Nevertheless, in case you need to do so, you can add `sap:...` attribute-style annotations as follows:

```cds
  @sap.applicable.path: 'to_eventStatus/EditEnabled'
  action EditEvent(...) returns SomeType;
```

Which would render to OData EDMX as follows:

```xml
  <FunctionImport Name="EditEvent" ...
    sap:applicable-path="to_eventStatus/EditEnabled">
    ...
  </FunctionImport>
```

The rules are:

* Only strings are supported as values.
* The first dot in `@sap.` is replaced by a colon `:`.
* Subsequent dots are replaced by dashes.


### Differences to ABAP

In contrast to ABAP CDS, we apply a **generic, isomorphic approach** where names and positions of annotations are exactly as specified in the [OData Vocabularies](#vocabularies). This has the following advantages:

* Single source of truth — users only need to consult the official OData specs
* Speed — we don't need complex case-by-case mapping logic
* No bottlenecks — we always support the full set of OData annotations
* Bidirectional mapping — we can translate CDS to EDMX and vice versa

Last but not least, it also saves us lots of effort as we don't have to write derivatives of all the OData vocabulary specs.


## Annotation Vocabularies { #vocabularies}


### [OASIS Vocabularies](https://github.com/oasis-tcs/odata-vocabularies#further-description-of-this-repository) { target="_blank"}

| Vocabulary                                                         | Description                                  |
| ------------------------------------------------------------------ | -------------------------------------------- |
| [@Aggregation](https://github.com/oasis-tcs/odata-vocabularies/tree/master/vocabularies/Org.OData.Aggregation.V1.md){target="_blank"}     | for describing aggregatable data             |
| [@Authorization](https://github.com/oasis-tcs/odata-vocabularies/tree/master/vocabularies/Org.OData.Authorization.V1.md){target="_blank"} | for authorization requirements               |
| [@Capabilities](https://github.com/oasis-tcs/odata-vocabularies/tree/master/vocabularies/Org.OData.Capabilities.V1.md){target="_blank"}   | for restricting capabilities of a service    |
| [@Core](https://github.com/oasis-tcs/odata-vocabularies/tree/master/vocabularies/Org.OData.Core.V1.md){target="_blank"}                   | for general purpose annotations              |
| [@JSON](https://github.com/oasis-tcs/odata-vocabularies/tree/master/vocabularies/Org.OData.JSON.V1.md){target="_blank"}                   | for JSON properties                          |
| [@Measures](https://github.com/oasis-tcs/odata-vocabularies/tree/master/vocabularies/Org.OData.Measures.V1.md){target="_blank"}           | for monetary amounts and measured quantities |
| [@Repeatability](https://github.com/oasis-tcs/odata-vocabularies/tree/master/vocabularies/Org.OData.Repeatability.V1.md){target="_blank"} | for repeatable requests                      |
| [@Temporal](https://github.com/oasis-tcs/odata-vocabularies/tree/master/vocabularies/Org.OData.Temporal.V1.md){target="_blank"}           | for temporal annotations                     |
| [@Validation](https://github.com/oasis-tcs/odata-vocabularies/tree/master/vocabularies/Org.OData.Validation.V1.md){target="_blank"}       | for adding validation rules                  |

### [SAP Vocabularies](https://github.com/SAP/odata-vocabularies#readme){target="_blank"}

| Vocabulary                                                    | Description                                       |
| ------------------------------------------------------------- | ------------------------------------------------- |
| [@Analytics](https://github.com/SAP/odata-vocabularies/tree/master/vocabularies/Analytics.md){target="_blank"}         | for annotating analytical resources               |
| [@CodeList](https://github.com/SAP/odata-vocabularies/tree/master/vocabularies/CodeList.md){target="_blank"}           | for code lists                                    |
| [@Common](https://github.com/SAP/odata-vocabularies/tree/master/vocabularies/Common.md){target="_blank"}               | for all SAP vocabularies                          |
| [@Communication](https://github.com/SAP/odata-vocabularies/tree/master/vocabularies/Communication.md){target="_blank"} | for annotating communication-relevant information |
| [@DataIntegration](https://github.com/SAP/odata-vocabularies/tree/master/vocabularies/DataIntegration.md){target="_blank"} | for data integration                          |
| [@PDF](https://github.com/SAP/odata-vocabularies/tree/master/vocabularies/PDF.md){target="_blank"}                     | for PDF                                           |
| [@PersonalData](https://github.com/SAP/odata-vocabularies/tree/master/vocabularies/PersonalData.md){target="_blank"}   | for annotating personal data                      |
| [@Session](https://github.com/SAP/odata-vocabularies/tree/master/vocabularies/Session.md){target="_blank"}             | for sticky sessions for data modification         |
| [@UI](https://github.com/SAP/odata-vocabularies/tree/master/vocabularies/UI.md){target="_blank"}                       | for presenting data in user interfaces            |

[Learn more about annotations in CDS and OData and how they work together](https://github.com/SAP-samples/odata-basics-handsonsapdev/blob/annotations/bookshop/README.md){.learn-more}

## Data Aggregation

Data aggregation in OData V4 is leveraged by the `$apply` system query option, which defines a pipeline of transformations that is applied to the _input set_ specified by the URI. On the _result set_ of the pipeline, the standard system query options come into effect.

<div id="data-aggregation-v2" />

### Example

```http
GET /Orders(10)/books?
    $apply=filter(year eq 2000)/
           groupby((author/name),aggregate(price with average as avg))/
    orderby(title)/
    top(3)
```

This request operates on the books of the order with ID 10. First it filters out the books from the year 2000 to an intermediate result set. The intermediate result set is then grouped by author name and the price is averaged. Finally, the result set is sorted by title and only the top 3 entries are retained.

### Transformations

| Transformation                | Description                                  | Node.js | Java   |
|-------------------------------|----------------------------------------------|---------|--------|
| `filter`                      | filter by filter expression                  | <X/>   | <X/>  |
| `search`                      | filter by search term or expression          | <Na/>  | <X/>  |
| `groupby`                     | group by dimensions and aggregates values    | <X/>   | <X/>  |
| `aggregate`                   | aggregate values                             | <X/>   | <X/>  |
| `compute`                     | add computed properties to the result set    | <Na/>  | <X/>  |
| `expand`                      | expand navigation properties                 | <Na/>  | <Na/> |
| `concat`                      | append additional aggregation to the result  | <X/><sup>(1)</sup>   | <X/>  |
| `skip` / `top`                | paginate                                     | <X/><sup>(1)</sup>   | <X/>  |
| `orderby`                     | sort the input set                           | <X/><sup>(1)</sup>   | <X/>  |
| `topcount`/`bottomcount`      | retain highest/lowest _n_ values             | <Na/>  | <Na/> |
| `toppercent`/`bottompercent`  | retain highest/lowest _p_% values            | <Na/>  | <Na/> |
| `topsum`/`bottomsum`          | retain _n_ values limited by sum             | <Na/>  | <Na/> |

- <sup>(1)</sup> Supported with experimental feature `cds.features.odata_new_parser = true`

#### `concat`

The [`concat` transformation](http://docs.oasis-open.org/odata/odata-data-aggregation-ext/v4.0/cs02/odata-data-aggregation-ext-v4.0-cs02.html#_Toc435016581) applies additional transformation sequences to the input set and concatenates the result:

```http
GET /Books?$apply=
    filter(author/name eq 'Bram Stroker')/
    concat(
        aggregate($count as totalCount),
        groupby((year), aggregate($count as countPerYear)))
```

This request filters all books, keeping only books by Bram Stroker. From these books, `concat` calculates (1) the total count of books *and* (2) the count of books per year. The result is heterogeneous.

The `concat` transformation must be the last of the apply pipeline. If `concat` is used, then `$apply` can’t be used in combination with other system query options.


#### `skip`, `top`, and `orderby`

Beyond the standard transformations specified by OData, CDS Java supports the transformations `skip`, `top`, and `orderby` that allow you to sort and paginate an input set:

```http
GET /Order(10)/books?
    $apply=orderby(price desc)/
           top(500)/
           groupby((author/name),aggregate(price with max as maxPrice))
```

This query groups the 500 most expensive books by author name and determines the price of the most expensive book per author.


### Aggregation Methods

| Aggregation Method            | Description        | Node.js | Java   |
|-------------------------------|--------------------|---------|--------|
| `min`           | smallest value                   | <X/>   | <X/>  |
| `max`           | largest                          | <X/>   | <X/>  |
| `sum`           | sum of values                    | <X/>   | <X/>  |
| `average`       | average of values                | <X/>   | <X/>  |
| `countdistinct` | count of distinct values         | <X/>   | <X/>  |
| custom method   | custom aggregation method        | <Na/>  | <Na/> |
| `$count`        | number of instances in input set | <X/>   | <X/>  |

### Custom Aggregates

Instead of explicitly using an expression with an aggregation method in the `aggregate` transformation, the client can use a _custom aggregate_. A custom aggregate can be considered as a virtual property that aggregates the input set. It’s calculated on the server side. The client doesn't know _How_ the custom aggregate is calculated.

They can only be used for the special case when a default aggregation method can be specified declaratively on the server side for a measure.

A custom aggregate is declared in the CDS model as follows:

* The measure must be annotated with an `@Aggregation.default` annotation that specifies the aggregation method.
* The CDS entity should be annotated with an `@Aggregation.CustomAggregate` annotation to expose the custom aggregate to the client.

```cds
@Aggregation.CustomAggregate#stock : 'Edm.Decimal'
entity Books as projection on bookshop.Books {
  ID,
  title,

  @Aggregation.default: #SUM
  stock
};
```

With this definition, it’s now possible to use the custom aggregate `stock` in an `aggregate` transformation:

```http
GET /Books?$apply=aggregate(stock) HTTP/1.1
```

which is equivalent to:

```http
GET /Books?$apply=aggregate(stock with sum as stock) HTTP/1.1
```

#### Currencies and Units of Measure

If a property represents a monetary amount, it may have a related property that indicates the amount's *currency code*. Analogously, a property representing a measured quantity can be related to a *unit of measure*. To indicate that a property is a currency code or a unit of measure it can be annotated with the [Semantics Annotations](https://help.sap.com/docs/SAP_NETWEAVER_750/cc0c305d2fab47bd808adcad3ca7ee9d/fbcd3a59a94148f6adad80b9c97304ff.html) `@Semantics.currencyCode` or `@Semantics.unitOfMeasure`.

```cds
@Aggregation.CustomAggregate#amount   : 'Edm.Decimal'
@Aggregation.CustomAggregate#currency : 'Edm.String'
entity Sales {
    key id        : GUID;
        productId : GUID;
        @Semantics.amount.currencyCode: 'currency'
        amount    : Decimal(10,2);
        @Semantics.currencyCode
        currency  : String(3);
}
```

The CAP Java SDK exposes all properties annotated with `@Semantics.currencyCode` or `@Semantics.unitOfMeasure` as a [custom aggregate](../advanced/odata#custom-aggregates) with the property's name that returns:

* The property's value if it’s unique within a group of dimensions
* `null` otherwise

A custom aggregate for a currency code or unit of measure should be also exposed by the `@Aggregation.CustomAggregate` annotation. Moreover, a property for a monetary amount or a measured quantity should be annotated with `@Semantics.amount.currencyCode` or `@Semantics.quantity.unitOfMeasure` to reference the corresponding property that holds the amount's currency code or the quantity's unit of measure, respectively.

### Other Features

| Feature                                 | Node.js | Java   |
|-----------------------------------------|---------|--------|
| use path expressions in transformations | <X/>   | <X/>  |
| chain transformations                   | <X/>   | <X/>  |
| chain transformations within group by   | <Na/>  | <Na/> |
| `groupby` with `rollup`/`$all`          | <Na/>  | <Na/> |
| `$expand` result set of `$apply`        | <Na/>  | <Na/> |
| `$filter`/`$search` result set          | <X/>   | <X/>  |
| sort result set with `$orderby`         | <X/>   | <X/>  |
| paginate result set with `$top`/`$skip` | <X/>   | <X/>  |


<div id="mass-data" />

## Singletons

A singleton is a special one-element entity introduced in OData V4. It can be addressed directly by its name from the service root without specifying the entity’s keys.

Annotate an entity with `@odata.singleton` or `@odata.singleton.nullable`, to use it as a singleton within a service, for example:

```cds
service Sue {
  @odata.singleton entity MySingleton {
    key id : String; // can be omitted
    prop : String;
    assoc : Association to myEntity;
  }
}
```

It can also be defined as an ordered `SELECT` from another entity:

```cds
service Sue {
  @odata.singleton entity OldestEmployee as
    select from Employees order by birthyear;
}
```

### Requesting Singletons

As mentioned above, singletons are accessed without specifying keys in the request URL. They can contain navigation properties, and other entities can include singletons as their navigation properties as well. The `$expand` query option is also supported.

```http
GET …/MySingleton
GET …/MySingleton/prop
GET …/MySingleton/assoc
GET …/MySingleton?$expand=assoc
```

### Updating Singletons

The following request updates a prop property of a singleton MySingleton:

```http
PATCH/PUT …/MySingleton
{prop: “New value”}
```

### Deleting Singletons

A `DELETE` request to a singleton is possible only if a singleton is annotated with `@odata.singleton.nullable`. An attempt to delete a singleton annotated with `@odata.singleton` will result in an error.

### Creating Singletons

Since singletons  represent a one-element entity, a `POST` request is not supported.

<div id ="api-flavors" />

## V2 Support

While CAP defaults to OData V4, the latest protocol version, some projects need to fallback to OData V2, for example, to keep using existing V2-based UIs.

### Enabling OData V2 via Proxy in Node.js Apps { #odata-v2-proxy-node}

CAP Node.js supports serving the OData V2 protocol through the [_OData V2 proxy protocol adapter_](https://www.npmjs.com/package/@sap/cds-odata-v2-adapter-proxy), which translates between the OData V2 and V4 protocols.

For Node.js projects, add the proxy as express.js middleware as follows:

1. Add the proxy package to your project:

    ```sh
    npm add @sap/cds-odata-v2-adapter-proxy
    ```

2. Add this to a project-local `./srv/server.js`:

    ```js
    const proxy = require('@sap/cds-odata-v2-adapter-proxy')
    const cds = require('@sap/cds')
    cds.on('bootstrap', app => app.use(proxy()))
    module.exports = cds.server
    ```

3. Access OData V2 services at [http://localhost:4004/v2/${path}](http://localhost:4004/v2).
4. Access OData V4 services at [http://localhost:4004/${path}](http://localhost:4004) (as before).

Example: Read service metadata for `CatalogService`:

- CDS:

    ```cds
    @path:'/browse'
    service CatalogService { ... }
    ```

- OData V2: `GET http://localhost:4004/v2/browse/$metadata`
- OData V4: `GET http://localhost:4004/browse/$metadata`

[Find detailed instructions at **@sap/cds-odata-v2-adapter-proxy**.](https://www.npmjs.com/package/@sap/cds-odata-v2-adapter-proxy){.learn-more}

### Using OData V2 in Java Apps

In CAP Java, serving the OData V2 protocol is supported natively by the [CDS OData V2 Adapter](../java/migration#v2adapter).

## Miscellaneous

### Omitting Elements from APIs

Add annotation `@cds.api.ignore` to suppress unwanted entity fields (for example, foreign-key fields) in APIs exposed from this the CDS model, that is, OData or OpenAPI. For example:

```cds
entity Books { ...
  @cds.api.ignore
  author : Association to Authors;
}
```

Please note that `@cds.api.ignore` is effective on regular elements that are rendered as `Edm.Property` only. The annotation doesn't suppress an `Edm.NavigationProperty` which is rendered for associations or compositions. If a managed association is annotated, the annotations are propagated to the (generated) foreign keys. In the previous example, the foreign keys of the managed association `author` are muted in the API.

### Absolute Context URL { #absolute-context-url}

In some scenarios, an absolute [context URL](https://docs.oasis-open.org/odata/odata/v4.01/odata-v4.01-part1-protocol.html#sec_ContextURL) is needed. In the Node.js runtime, this can be achieved through configuration `cds.odata.contextAbsoluteUrl`.

You can use your own URL (including a protocol and a service path), for example:

```js
cds.odata.contextAbsoluteUrl = "https://your.domain.com/yourService"
```

to customize the annotation as follows:

```json
{
  "@odata.context":"https://your.domain.com/yourService/$metadata#Books(title,author,ID)",
  "value":[
    {"ID": 201,"title": "Wuthering Heights","author": "Emily Brontë"},
    {"ID": 207,"title": "Jane Eyre","author": "Charlotte Brontë"},
    {"ID": 251,"title": "The Raven","author": "Edgar Allen Poe"}
  ]
}
```

If `contextAbsoluteUrl` is set to something truthy that doesn't match `http(s)://*`, an absolute path is constructed based on the environment of the application on a best effort basis.

Note that we encourage you to stay with the default relative format, if possible, as it's proxy safe.
