---
# layout: cds-ref
shorty: Query Notation
synopsis: >
  Specification of the Core Query Notation (CQN) format that is used to capture queries as plain JavaScript objects.
status: released
---

# Query Notation (CQN)


[[toc]]



## Introduction

CQN is a canonical plain object representation of CDS queries. Such query objects can be obtained by parsing [CQL](./cql), by using the [query builder APIs](../node.js/cds-ql), or by simply constructing respective objects directly in your code.

For example, the following three snippets all construct the same query object:

```js
// Parsing CQL tagged template strings
let query = cds.ql `SELECT from Foo`
```

```js
// Query building
let query = SELECT.from (ref`Foo`)
```

```js
// Constructing plain CQN objects
let query = {SELECT:{from:[{ref:['Foo']}]}}
```

Such queries can be [executed with `cds.run`](../node.js/core-services#srv-run-query):

```js
let results = await cds.run (query)
```



## SELECT

Following is the TypeScript declaration of `SELECT` query objects:

```tsx
class SELECT { SELECT: {
  distinct?   : true
  count?      : true
  one?        : true
  from        : source
  columns?    : column[]
  where?      : xo[]
  having?     : xo[]
  search?     : xo[]
  groupBy?    : expr[]
  orderBy?    : order[]
  limit?      : { rows: val, offset: val }
}}
```
> Using:
> [`source`](#source),
> [`colum`](#column),
> [`xo`](#xo),
> [`expr`](#expr),
> [`order`](#order),
> [`val`](#val)

CQL SELECT queries enhance SQL's SELECT statements with these noteworthy additions:

- The `from` clause supports [`{ref}`](#ref) paths with *[infix filters](#infix)*.
- The `columns` clause supports deeply *[nested projections](#expand)*.
- The `count` property requests the total count, similar to OData's `$count`.
- The `one` property causes a single row object to be read instead of an array.

Also `SELECT` statements with `from` as the only mandatory property are allowed,
which is equivalent to SQL's `SELECT * from ...`.



### `.from`

{#source}

Property `from` specifies the source of the query, which can be a table, a view, or a subquery.
It is specified with type `source` as follows:

```tsx
class SELECT { SELECT: { //...
  from : source // [!code focus]
}}
```
```tsx
type source = ref &as | SELECT | {
  join : 'inner' | 'left' | 'right'
  args : [ source, source ]
  on?  : expr
}
```
> Using:
> [`ref`](#ref),
> [`as`](#as),
> [`expr`](#expr)
>
> Used in:
> [`SELECT`](#select)



### `.columns`

{#column}

{#as}

Property `columns` specifies the columns to be selected, projected, or aggregated, and is specified as an array of `column`s:

```tsx
class SELECT { SELECT: { //...
  columns : column[] // [!code focus]
}}
```
```tsx
type column = '*' | expr &as &cast | ref &as &(
  { expand?: column[] } |
  { inline?: column[] }
) &infix
interface as { as?: name }
interface cast { cast?: {type:name} }
```
> A `cast` is essentially a CSN [type definition](./csn#type-definitions).
>
> Using:
> [`expr`](#expr),
> [`name`](#name)
> [`ref`](#ref),
> [`infix`](#infix)
>
> Used in:
> [`SELECT`](#select)


### `.where`
### `.having`
### `.search`

Properties `where`, and `having`, specify the filter predicates to be applied to the rows selected, or grouped, respectively. Property `search` is of same kind and is used for full-text search.

```tsx
class SELECT { SELECT: {
  where  : xo[] // [!code focus]
  having : xo[] // [!code focus]
  search : xo[] // [!code focus]
}}
```


### `.orderBy`

```tsx
class SELECT { SELECT: { //...
  orderBy : order[] // [!code focus]
}}
```
```tsx
type order = expr & {
  sort  : 'asc' | 'desc'
  nulls : 'first' | 'last'
}
```
> Using:
> [`expr`](#expr)
>
> Used in:
> [`SELECT`](#select)
>
<style>
  h2#insert { margin-bottom: 0px }
  main .vp-doc h2 + h2,
  main .vp-doc h3 + h3 { margin-top: 0px }
</style>

## INSERT
## UPSERT

CQN representations for `INSERT` and `UPSERT` are essentially identical:

```tsx
class INSERT { INSERT: UPSERT['UPSERT'] }
class UPSERT { UPSERT: {
  into      : ref
  entries?  : data[]
  columns?  : string[]
  values?   : scalar[]
  rows?     : scalar[][]
  from?     : SELECT
}}
```
```tsx
interface data  { [elm:string]: scalar | data | data[] }
```

> Using:
> [`ref`](#ref),
> [`expr`](#expr)
> [`scalar`](#scalar),
> [`SELECT`](#select)
>
> See also:
> [`UPDATE.data`](#data),

Data to be inserted can be specified in one of the following ways:

* Using [`entries`](#entries) as an array of records with name-value pairs.
* Using [`values`](#values) as in SQL's _values_ clauses.
* Using [`rows`](#rows) as an array of one or more `values`.

The latter two options require a `columns` property to specify names of columns
to be filled with the values in the same order.


### `.entries`

Allows input data to be specified as records with name-value pairs,
including _deep_ inserts.

```js
let q = {INSERT:{ into: { ref: ['Books'] }, entries: [
  { ID:201, title:'Wuthering Heights' },
  { ID:271, title:'Catweazle' }
]}}
```
```js
let q = {INSERT:{ into: { ref: ['Authors'] }, entries: [
  { ID:150, name:'Edgar Allen Poe', books: [
    { ID:251, title:'The Raven' },
    { ID:252, title:'Eleonora' }
  ]}
]}}
```
[See definition in `INSERT` summary](#insert) {.learn-more}



### `.values`

Allows input data to be specified as an single array of values, as in SQL.

```js
let q = {INSERT:{ into: { ref: ['Books'] },
  columns: [ 'ID', 'title', 'author_id', 'stock' ],
  values: [ 201, 'Wuthering Heights', 101, 12 ]
}}
```
[See definition in `INSERT` summary](#insert) {.learn-more}


### `.rows`

Allows input data for multiple rows to be specified as arrays of values.

```js
let q = {INSERT:{ into: { ref: ['Books'] },
  columns: [
    'ID', 'title', 'author_id', 'stock'
  ],
  rows: [
    [ 201, 'Wuthering Heights', 101, 12 ],
    [ 252, 'Eleonora', 150, 234 ]
  ]
}}
```
[See definition in `INSERT` summary](#insert) {.learn-more}



## UPDATE

```tsx
class UPDATE { UPDATE: {
  entity  : ref
  where?  : expr
  data    : data
  with    : changes
}}
```
> Using:
> [`ref`](#ref),
> [`expr`](#expr),
> [`data`](#data),
> [`changes`](#changes)


### `.data`

Data to be updated can be specified in property `data` as records with name-value pairs, same as in [`INSERT.entries`](#entries).

```tsx
interface data  { [element:name]: scalar | data | data[] }
```
> Using:
> [`name`](#name),
> [`scalar`](#scalar)


### `.with`

{#changes}

Property `with` specifies the changes to be applied to the data, very similar to property [`data`](#data) with the difference to also allow [expressions](#expressions) as values.

```tsx
interface changes { [element:name]: scalar | expr | changes | changes[] }
```

> Using:
> [`name`](#name),
> [`expr`](#expr),
> [`scalar`](#scalar)



## DELETE

```js
class DELETE { DELETE: {
  from    : ref
  where?  : expr
}}
```
> Using:
> [`ref`](#ref),
> [`expr`](#expr)


## Expressions

{#expr}

{#ref}

{#val}

{#xpr}

{#list}

{#func}

{#param}

Following are the axiomatic building blocks used in CQN expressions:

```tsx
type expr  = ref | val | xpr | list | func | param | SELECT
```
```tsx
type ref   = { ref: ( name | { id:name &infix })[] }
type val   = { val: scalar }
type xpr   = { xpr: xo[] }
type list  = { list: expr[] }
type func  = { func: string, args: expr[] }
type param = { ref: [ '?' | number | string ], param: true }
```


<div id="hierarchy-queries" />
