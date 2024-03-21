---
# layout: cds-ref
shorty: Query Notation
synopsis: >
  Specification of the Core Query Notation (CQN) format that is used to capture queries as plain JavaScript objects.
status: released
uacp: Used as link target from Help Portal at https://help.sap.com/products/BTP/65de2977205c403bbc107264b8eccf4b/855e00bd559742a3b8276fbed4af1008.html
---

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

That object can be [executed with `cds.run`](../node.js/core-services#srv-run-query):

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

<div id="afterexample" />

<div id="beforeupsert" />

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
