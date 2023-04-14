---
layout: cds-ref
shorty: Query Notation
synopsis: >
  Specification of the Core Query Notation (CQN) format that is used to capture queries as plain JavaScript objects.
status: released
uacp: Used as link target from Help Portal at https://help.sap.com/products/BTP/65de2977205c403bbc107264b8eccf4b/855e00bd559742a3b8276fbed4af1008.html
---
<!--- Migrated: @external/cds/22-CQN.md -> @external/cds/cqn.md -->

# Query Notation (CQN)

[expr]: cxn#expressions
[xpr]: cxn#operators
[ref]: cxn#references
[val]: cxn#literal-values
[_xpr]: cxn#operators


CQN is a canonical plain object representation of CDS queries. Such query objects can be obtained by parsing [CQL](./cql), by using the [query builder APIs](../node.js/cds-ql), or by simply constructing respective objects directly in your code.


#### Examples

The following three snippets all construct the same query object:

```js
// Parsing CQL
let query = cds.parse.cql (`SELECT from Foo`)
```

```js
// Query building
let query = SELECT.from('Foo')
```

```js
// Constructing CQN objects in your code
let query = {SELECT:{from:[{ref:['Foo']}]}}
```

That object can be [executed with `cds.run`](../node.js/services#srv-run):

```js
cds.run (query)
```

::: warning _❗ Warning_ <!--  -->
Because of SQL injection, it's strongly discouraged to use `cds.parse.cql` in your request handlers.
:::


#### Content

[[toc]]


## SELECT
[SELECT]: #select

A fully equipped `SELECT` query is represented as an object following this template (all properties except `from` are optional):

```js
SELECT = {SELECT:{
  distinct: true,
  from: source | join,
  mixin: { ...element },
  columns: projection,
  excluding: [ ...string ],
  where: _xpr,
  groupBy: [ ...expr ],
  having: _xpr,
  orderBy: [ ...ordering_term ],
  limit: { rows:expr, offset:expr },
  forUpdate: { wait: number },
  forShareLock: { wait: number },
  search: _xpr,
  count: Boolean
}}
```

| Property    | Description                                                               |
|-------------|---------------------------------------------------------------------------|
| `from`      | a primary [source] or [joined sources][joins]                             |
| `mixin`     | a dictionary of several [CSN element definitions](./csn#structured-types) |
| `columns`   | an array of [column expressions](#columns)                                |
| `excluding` | an array of names                                                         |
| `where`     | a [predicate expression][_xpr]                                            |
| `groupBy`   | an array of [expressions][expr]                                           |
| `having`    | a [predicate expression][_xpr]                                            |
| `orderBy`   | an array of [ordering terms](#ordering-terms)                             |
| `limit`     | a dictionary of two [expressions][expr]: rows and offset                  |
| `search`    | a [predicate expression][_xpr]                                            |
| `count`     | a Boolean                                                                 |


```js
source         =  ( ref | SELECT ) + { as:string }
join           =  { join:string, args:[...source], on:_xpr }
projection     =  [ ...column_expr ]
column_expr    =  expr + { as:string, cast:def, (expand|inline):projection }
ordering_term  =  expr + { sort: 'asc'|'desc', nulls: 'first'|'last' }
```

**Sources** are [references][ref] or [subqueries][SELECT] with an optional: { #sources}

[source]: #sources
[sources]: #sources

* `as` – a string specifying a chosen source alias

**Joins** combine two [sources] with these properties: { #joins}

[joins]: #joins
[join]: #joins

* `join` is one of `'left'`, `'right'`, `'full'`, `'inner'`, or `'cross'`
* `args` is an array of two [sources] or [joins]
* `on` is a [predicate expression][_xpr] capturing the JOIN condition

**Column Expressions** are a plain string `'*'`, or [expressions][expr] with these optional additional properties: { #columns}

* `as` is a string with the chosen name in the result set
* `cast` is a [CSN type definition](./csn#type-definitions)
* `inline` \| `expand` are nested [projections][SELECT]


**Ordering Terms** are [expressions][expr], usually [references][ref], with one or none of... { #ordering-terms}

* `sort` = 'asc' \| 'desc'
* `nulls` = 'first' \| 'last'

### Example

For example, the following query in CQL:

```sql
SELECT from samples.bookshop.Books {
  title, author.name as author,
  1 as one,
  x+2 as two : Integer,
} excluding {
  dummy
}
WHERE ID=111
GROUP BY x.y
HAVING x.y<9
ORDER BY title asc
LIMIT 11 OFFSET 22
```

is represented in CQN as:

```js
CQN = {SELECT:{
  from: {ref:["samples.bookshop.Books"]},
  columns: [
    {ref:["title"]},
    {ref:["author","name"], as: "author"},
    {val:1, as: "one"},
    {xpr:[{ref:['x']}, '+', {val:2}], as: "two",
      cast: {type:"cds.Integer"}
    }
  ],
  excluding: [
    "dummy"
  ],
  where: [{ref:["ID"]}, "=", {val: 111}],
  groupBy: [{ref:["x","y"]}],
  having: [{ref:["x","y"]}, "<", {val: 9}],
  orderBy: [{ref:["title"], sort:'asc' }],
  limit: {rows:{val:11}, offset:{val:22}}
}}
```


### Example : \<name\>.* {.impl.beta}

For example, the following query in CQL:

```sql
SELECT from samples.bookshop.Books {
  author.*,
  author.{*},
  author as a3 { *, name }
}
```

is represented in CQN as:

```js
CQN = {SELECT:{
  from: {ref:["samples.bookshop.Books"]},
  columns: [
    {ref:['author'], inline:['*']},
    {ref:['author'], inline:['*']},
    {ref:['author'], expand:['*', {ref:['name']} ], as:'a3'}
  ]
}}
```


### Hierarchies { .impl.concept}

For the representation of a hierarchy, the `from` attribute is extended:

```js
from: ... | hierarchy
hierarchy = {hierarchy:{
  source: ref,
  parent: ref,
  levels: [...ref],
  orderBy: [...ordering_term],
  start: _xpr,
  nodetype: ref,
  directory: { association: ref, where: _xpr},
  period: { from: ref, to: ref},
  valid: { from: ref, to: ref}
}}
```

| Property    | Description                                                   |                                                                                                   |
|-------------|---------------------------------------------------------------|---------------------------------------------------------------------------------------------------|
| `source`    | primary [source]                                              |                                                                                                   |
| `parent`    | association [reference][ref]                                  | _A reference to an association that defines the to-parent relation for parent-child hierarchies._ |
| `levels`    | array of field [references][ref] for leveled hierarchies      | _Field references that define a leveled hierarchy._                                               |
| `orderBy`   | array of [ordering terms](#ordering-terms)                    | _Defines the ordering of siblings._                                                               |
| `start`     | [predicate expression][_xpr]                                  | _References the element that defines the condition identifying the root nodes._                   |
| `nodetype`  | field [reference][ref]                                        | _Node type of a hierarchy node in a heterogeneous hierarchy._                                     |
| `directory` | association [reference][ref] and [predicate expression][_xpr] | _References an association that points to the directory entity._                                  |
| `period`    | contains field [references][ref]                              | _Identifies the columns that define the time period for a temporal hierarchy._                    |
| `valid`     | contains field [references][ref]                              | _Identifies the columns that determine whether a record in the temporal hierarchy is valid._      |


#### Example

For example, the following query in CQL:

```sql
SELECT from hierarchy (
  source CostCenter
  child to parent association parentCostCenter
  siblings order by parentCostCenter.id
){
  ID, name, ...
}
```

is represented in CQN as:

```js
CQN = {SELECT:{
  from: {
    hierarchy: {
      source: {ref: ["CostCenter"]},
      parent: {ref: ["parentCostCenter"]},
      orderBy: [{ref: ["parentCostCenter", "id"]}]
    }
  }
  columns: [
    {ref:["ID"]},
    {ref:["name"]},
    ...
  ]
}
```

## UPSERT

```js
UPSERT = {UPSERT:{
   into: (ref + { as:string }) | string,
   entries: [ ...{ ...column:any } ],
   as: SELECT
}}
```

## INSERT

```js
INSERT = {INSERT:{
   into: (ref + { as:string }) | string,
   columns: [ ...string ],
   values: [ ...any ],
   rows: [ ...[ ...any ] ],
   entries: [ ...{ ...column:any } ],
   as: SELECT
}}
```

Either and only one of the properties `values` or `rows` or `entries` is expected to be specified. Each of which is expected to have one or more entries:

* `values` is an array of values, which positionally match to specified `columns`.
* `rows` is an array of one or more `values`.
* `entries` is an array of records with name-value pairs.

Examples:

```js
CQN = {INSERT:{
  into: { ref: ['Books'] },
  columns: [ 'ID', 'title', 'author_id', 'stock' ],
  values: [ 201, 'Wuthering Heights', 101, 12 ]
}}
```
```js
CQN = {INSERT:{
  into: { ref: ['Books'] },
  columns: [ 'ID', 'title', 'author_id', 'stock' ],
  rows: [
    [ 201, 'Wuthering Heights', 101, 12 ],
    [ 251, 'The Raven', 150, 333 ],
    [ 252, 'Eleonora', 150, 234 ]
  ]
}}
```
```js
CQN = {INSERT:{
  into: { ref: ['Books'], as: 'NewBooks' },
  entries: [
    { ID:201, title:'Wuthering Heights', author_id:101, stock:12 },
    { ID:251, title:'The Raven', author_id:150, stock:333 },
    { ID:271, title:'Catweazle', author_id:170, stock:222 }
  ]
}}
```

The last one also allows to express so-called 'deep inserts'. Let's assume we want to store an author with two books:

```js
CQN = {INSERT:{ into: { ref: ['Authors'] }, entries: [
  { ID:150, name:'Edgar Allen Poe', books:[
    { ID:251, title:'The Raven' },
    { ID:252, title:'Eleonora' }
  ] }
]}}
```

Instead of inserting new entries for books we might want to just add relationships to already existing books, in that case just specify one or more primary key values of the target instance.

```js
CQN = {INSERT:{ into: { ref: ['Authors'] }, entries: [
  { ID:150, name:'Edgar Allen Poe', books:[
    251, 252,
  ] }
]}}
```


## UPDATE

```js
UPDATE = {UPDATE:{
   entity: ref + { as:string },
   data: { ...column:any },
   where: _xpr
}}
```


## DELETE

```js
DELETE = {DELETE:{
   from: ref + { as:string },
   where: _xpr
}}
```


## CREATE

```js
CREATE = {CREATE:{
   entity: entity | string,
   as: SELECT
}}
```


## DROP

```js
DROP = {DROP:{
   table: ref,
   view: ref,
   entity: ref
}}
```
Examples:

```js
CQN = {DROP:{
  table: { ref: ['Books'] }
}}
```

```js
CQN = {DROP:{
  view: { ref: ['Books'] }
}}
```

```js
CQN = {DROP:{
  entity: { ref: ['Books'] }
}}
```

