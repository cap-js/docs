---
status: released
---


# Querying in JavaScript



[[toc]]



##  Constructing Queries

Module `cds.ql` provides a SQL-like fluent API to construct queries:

```js
let q1 = SELECT.from('Books').where({ID:201})
let q2 = INSERT.into('Books',{ title: 'Wuthering Heights' })
let q3 = UPDATE('Books',201).with({ title: 'Sturmhöhe' })
let q4 = DELETE.from('Books').where({ID:201})
```

Alternative to classic method calls we can also use the fluent API with tagged templates:

```sql
let q1 = SELECT.from `Books` .where `ID=${201}`
let q2 = INSERT.into `Books` .entries ({ title:'Wuthering Heights' })
let q3 = UPDATE `Books` .where `ID=${201}` .with `title=${'Sturmhöhe'}`
let q4 = DELETE.from `Books` .where `ID=${201}`
```

The API is made available through global objects `SELECT`, `INSERT`, `UPSERT`, `UPDATE`, `DELETE`. Alternatively, you can obtain these objects from `cds.ql` like so:

```js
const cds = require('@sap/cds')
const { SELECT, INSERT, UPDATE, DELETE } = cds.ql
```

The API is also available through [`cds.Service`'s CRUD-style Convenience API](core-services#crud-style-api) {.learn-more}

::: details Using Reflected Definitions 

It is recommended best practice to use entity definitions reflected from a service's model to construct queries.
Doing so greatly simplifies code as it avoids repeating namespaces all over the place.

```sql
const { Books } = cds.entities
let q1 = SELECT.from (Books) .where `ID=${201}`
```

[Learn more about using reflected definitions from a service's model](core-services#entities){.learn-more}

:::

::: details *Not Locked in to SQL*
While both [CQL](../cds/cql) / [CQN](../cds/cqn) as well as the fluent API of `cds.ql` resemble well-known SQL syntax neither of them are locked in to SQL. In fact, queries can be sent to any kind of services, including NoSQL databases or remote services for execution.
:::




## Executing Queries

Queries are executed by passing them to a service's [`srv.run()`](core-services#srv-run-query) method, for example, to the primary database:

```js
let query = SELECT `ID,title` .from `Books`
let books = await cds.db.run (query)
```

Alternatively, you can just `await` a constructed query, which by default passes the query to `cds.db.run()`. So, the following is equivalent to the above:

```js
let books = await SELECT `ID,title` .from `Books`
```
Instead of a database service, you can also send queries to other services, local or remote ones. For example:

```js
const cats = await cds.connect.to ('CatalogService')
let books = await cats.run (query)
```

> `CatalogService` might be a remote service connected via OData. In this case, the query would be translated to an OData request sent via http.



##  First-Class Objects

Constructing queries doesn't execute them immediately, but just captures the given query information. Very much like functions in JavaScript, queries are first-class objects, which can be assigned to variables, modified, passed as arguments, or returned from functions. Let's investigate this somewhat more, given this example:

```js
let cats = await cds.connect.to('CatalogService') //> connected via OData
let PoesBooks = SELECT.from (Books) .where `name like '%Poe%'`
let books = await cats.get (PoesBooks)
```

This is what happens behind the scenes:

1. We use the fluent API to construct a query as a CQN and assign it to `PoesBooks`
2. We pass the query as an argument to function `cats.get()`
3. The get event handler translates the query to an OData request sent to the remote service
4. The remote OData protocol adapter translates the inbound query back to CQN
5. This CQN query is passed on to the remote service provider
6. A registered event handler forwards that query to the local `cds.db` service
7. The database service implementation translates the query to plain SQL and sends that to the database for execution



####  Leveraging Late Materialization

You can also combine queries much like sub selects in SQL to form more complex queries as shown in this example:

```sql
let input = '%Brontë%'
let Authors = SELECT `ID` .from `Authors` .where `name like ${ input }`
let Books = SELECT.from `Books` .where `author_ID in ${ Authors }`
```
```js
await cds.run (Books) //> late/no materialization of Authors
```

With that we leverage late materialization, offered by SQL databases.
Compare that to inferior imperative programming:

```js
let input = '%Brontë%'
let Authors = await SELECT `ID` .from `Authors` .where `name like ${ input }`
for (let a of Authors) { //> looping over eagerly materialized Authors
  let Books = await SELECT.from `Books` .where `author_ID = ${ a.ID }`
}
```




##   Avoiding SQL Injection

All the APIs are designed to easily avoid [SQL Injection](https://wikipedia.org/wiki/SQL_injection) by default.
For example, let's see how the following code would be executed:

```js
let input = 201 //> might be entered by end users
let books = await SELECT.from `Books` .where `ID=${input}`
```

The query is...

1. captured as a CQN object with the where clause represented as:
```js
..., where:[ {ref:['title']}, '=', {val:201} ]
```

2. translated to plain SQL string with binding parameters
```sql
SELECT ID from Books where ID=?
```

3. executed with binding parameters provided from `{val}`entries in CQN
```js
dbc.run (sql, [201])
```

The only mistake you could do is to imperatively concatenate user input with CQL or SQL fragements, instead of using the tagged strings or other options promoted by `cds.ql`. For example, assumed you had written the above code sample like that:

```js
let input = 201 //> might be entered by end users
let books = await SELECT.from `Books` .where ('ID='+input)
let bookz = await SELECT.from `Books` .where (`ID=${input}`)
```
> **Note** also that tagged template strings never have surrounding parentheses! I.e., the third line above does the very same string concatenation as the second line.


A malicious user might enter some SQL code fragment like that:
```sql
0; DELETE from Books; -- gotcha!
```
{style="margin: 10px 40px"}

In effect, your generated SQL statements would effectively look like that:

```sql
SELECT ID from Books where ID=0;
DELETE from Books; -- gotcha!
```
::: danger **WARNING:**
Whenever there's user input involved...
<br> Never use string concatenation when constructing queries!
<br> Never surround tagged template strings with parentheses!
:::



## Class `cds.ql.Query` 

Instances of `cds.Query` capture queries at runtime. Subclasses provide [fluent APIs](#fluent-api) to construct queries as highlighted below.



### .cmd {.property}


The current command, that is one of these strings:

- `'SELECT'`
- `'INSERT'`
- `'UPSERT'`
- `'UPDATE'`
- `'DELETE'`
- `'CREATE'`
- `'DROP'`

This is usefull for generic query processors, such as outbound protocol adapters or database services, which need to translate given queries into target representations.



### q. then() {.method}

Instances of `cds.Query` are thenables. `await`ing them executes the query with the bound service or the primary database service.

```js
await SELECT.from(Books) // is equivalent to:
await cds.db.run( SELECT.from(Books) )
```



### q. bind (srv) {.method}

Binds a query for execution with the given `srv` . 

```js
let srv = new cds.Service
await SELECT.from(Books).bind(srv) // is equivalent to:
await srv.run( SELECT.from(Books) )
```





## SELECT ...

Fluent API to construct [CQN SELECT](../cds/cqn#select) query objects in a [CQL](../cds/cql)/SQL-like style. In contrast to SQL, though, the clauses can be arrayed in arbitrary order.

`SELECT` itself is a function acting as a shortcut to `SELECT.columns`, thereby resembling SQL syntax:

```sql
SELECT `a, b` .from `Foo`  -- is a shortcut for:
SELECT .columns `a, b` .from `Foo`
```

Moreover, it accepts a single tagged template string starting with `from`:

```js
const limit = 11, sort_column = 'a'
const q = SELECT `from Foo {
   a, b as c, sum(d)
} where x < ${limit}
group by a,b
order by ${sort_column} asc`
const foos = await q
```

This allows constructing [CQN](../cds/cqn) query objects using [CQL](../cds/cql) language constructs which are not covered by `cds.ql` fluent API.



### .one {.property}


Start constructing a query with `SELECT.one` to indicate we're interested in only the first row. At runtime, a single entry, if any, is returned instead of an array:

```js
const one = await SELECT.one.from (Authors)
```

> same effect, but potentially more expensive:

```js
const [one] = await SELECT.from (Authors)
```



### .distinct {.property}

Start the query with `SELECT.distinct` to skip duplicates as in SQL:

```js
SELECT.distinct.from (Authors)
```



### .columns() {.method}

```tsx
function SELECT.colums ( projection : function )
function SELECT.colums ( cql : tagged template string )
function SELECT.colums ( columns[] : CQL expr string | CQN expr object )
function SELECT.colums ( ...columns[] : CQL expr string | CQN expr object )
```

Specifies which columns to be fetched, very much like SQL select clauses, enhanced by [CQL](../cds/cql) projections and path expressions. The arguments can be a projection function, a tagged template string, or individual column expressions as CQL string snippets, or as [CQN column expression objects](../cds/cqn.md#select). 

```sql
SELECT.from `Books` .columns (b => { b.title, b.author.name.as('author') })
SELECT.from `Books` .columns `{ title, author.name as author }`
SELECT.from `Books` .columns `title, author.name as author`
SELECT.from `Books` .columns ( 'title', 'author.name as author')
SELECT.from `Books` .columns ( 'title', {ref:['author','name'],as:'author'} )
SELECT.from `Books` .columns (['title', {ref:['author','name'],as:'author'} ])
```

Projection functions are the **most recommended** way to specify projections as they have several advantages (with tagged templates coming closest):

- they support nested projections, aka expands
- they don't need to call a parser
- they resemble CQL very much
- they use standard JavaScript constructs
- we can perspectively offer type inference and code completion

With respect to resembling CQL let's compare this query in CQL using entity aliases to the `cds.ql` code sample below:

```sql
SELECT from Authors a {
   a.ID, a.name, a.books {
     *, createdAt as since,
     suppliers[city='Paris']{*}
   }
}
```

Here is the same using `cds.ql` with projection functions:

```js
SELECT.from ('Authors', a => {
   a.ID, a.name, a.books (b => {
     b`.*`, b.createdAt`as since`,
     b.suppliers`[city='Paris']`('*')
   })
})
```

Projection functions use these mechanisms:

- projections are single-argument arrow functions: `a => { ... }`
- with the argument as entity alias in column expressions: `a.name`
- with functions for nested projections: `a.books (b => {...})`
- with `*` as special case of that: ```b`.*` ```, and `b.suppliers('*')`
- with template strings for aliases: ```b.createdAt`as since` ```
- as well as for infix filters: ```b.suppliers`[city='Paris']` ```

**Note:** Not every CQL or SQL construct can be expressed with projection functions. This is where tagged template strings kick in



### .from() {.method}

```tsx
function SELECT.from ( 
   entity : string | CSN definition | tagged template string,
   key?   : string | number | object,
   cols?  : array  | projection
)
```

Fills in [CQN `from` clauses](../cds/cqn.md#select), optionally adding a primary key, and a projection. 
The latter are alternatives for using separate `.one`, `.where` and  `.columns` clauses. <br/>
For example, these queries:

```js
SELECT.from (Books,201)
SELECT.from (Books,201, b => { b.ID, b.title })
```

... are equivalent to these:

```js
SELECT.one.from (Books) .where ({ID:201})
SELECT.one.from (Books) .where ({ID:201})
.columns (b => { b.ID, b.title })
```

> NOTE: Specifying a `key` argument automatically [enables `SELECT.one`](#select-one).



Argument `key` can be a single string or number value, or a [query-by-example](#where) object:

```js
SELECT.from (Books,201) //> shortcut for {ID:201}
SELECT.from (Books, {ID:201})
SELECT.from (Books.texts, {ID:201, locale:'de'})
```

Argument `cols` is a projection [as accepted by `.columns (cols)`](#select-columns)



### .alias() {.method}

Specifies the alias which you can refer to in other functions:

```js
SELECT.from ('Authors').alias('a').where({ 
   exists: SELECT.from('Books').where('author_ID = a.ID')
})
```



### .where() {.method}

### .having() {.method}

```tsx
function SELECT.where/having ( qbeobj : query-by-example object )
function SELECT.where/having ( clause : tagged template string )
function SELECT.where/having ( expr: string, value: any, ... )
```

These methods fill in corresponding  [CQL](../cds/cql) clauses with predicate  expressions, which can be specified as a query-by-example object, a tagged template string, or as an alternating string / value arguments list:

```js
SELECT.from `Books` .where ({ ID: req.data.ID }) // qbe
SELECT.from `Books` .where `ID = ${req.data.ID}` // tts
SELECT.from `Books` .where ('ID =', req.data.ID) // expr/value list
```
Assumed we got some user input as follows:

```js
const name='foo', kinds=[1,2,3], min=0.1, max=0.9, stock=111
```

With tagged template strings we could construct a query like that:

```js
SELECT.from `Foo` .where `name like ${name} and (
   kind in ${kinds}
   or ratio between ${min} and ${max}
   or stock >= ${stock}
)`
```

Doing the same with object literals would look like that:

```js
SELECT.from('Foo') .where ({ name: {like:'%foo%'}, and: {
   kind: { in: kinds },
   or: { ratio: { between: min, and: max },
     or: { stock: { '>=': stock } }
    }
}})
```

The provided expression is consistently accounted for by wrapping the existing where clause in an `xpr` if needed.



### .groupBy() {.method}

Fills in SQL `group by` clauses. Arguments are a single tagged template string, or column expression strings or [CXN](../cds/cxn.md) objects, like that:

```js
SELECT ... .groupBy `a.name, b`
SELECT ... .groupBy ('a.name', 'b')
SELECT ... .groupBy ({ref:['a','name']}, {ref:['b']})
```



### .orderBy() {.method}

Fills in SQL `order by` clauses. Arguments are a single tagged template string, or column expression strings, optionally followed by `asc` or `desc`, or [CXN](../cds/cxn.md) objects, like that:

```js
SELECT ... .orderBy `a.name, b desc`
SELECT ... .orderBy ('a.name', 'b desc')
SELECT ... .orderBy ({ref:['a','name']}, {ref:['b'],sort:'desc'})
```



### .limit() {.method}

Equivalent of the standard SQL `limit` and `offset` clauses.
Arguments can be standard numbers or [CXN](../cds/cxn.md) expression objects.

```js
SELECT ... .limit (25)      //> first page
SELECT ... .limit (25,100)  //> fifth page
```



### .forUpdate() {.method}


Exclusively locks the selected rows for subsequent updates in the current transaction, thereby preventing concurrent updates by other parallel transactions.

```js
try {
   let book = await SELECT.from(Books,201).forUpdate()
   //> book is locked for other transactions
   await UPDATE (Books,201) .with ({...})
} catch (e) {
   //> failed to acquire the lock, likely because of timeout
}
```

The `options` argument is optional; currently supported is:

* `wait` — an integer specifying the timeout after which to fail with an error in case a lock couldn't be obtained. The time unit is database-specific. On SAP HANA, for example, the time unit is seconds. A default `wait` value that is used if `options.wait == null` can be specified via `cds.env.sql.lock_acquire_timeout`. A value of `-1` can be used to deactivate the default for the individual call. If the wait option isn’t specified, the database-specific default behavior applies.

All acquired locks are released when the current transaction is finished, that is, committed  or rolled back.



### .forShareLock() {.method}

Locks the selected rows in the current transaction, thereby preventing concurrent updates by other parallel
transactions, until the transaction is committed or rolled back. Using a shared lock allows all transactions to read the locked record.

If a queried record is already exclusively locked by another transaction, the `.forShareLock()` method waits for the lock to be released.





## INSERT ...

Fluent API to construct [CQN INSERT](../cds/cqn#insert) query objects in a [CQL](../cds/cql)/SQL-like style. In contrast to SQL, though, the clauses can be arrayed in arbitrary order.


 `INSERT` itself is a function acting as a shortcut to `INSERT.entries`, allowing uses like that:


```js
const books = [
   { ID:201, title:'Wuthering Heights', author_id:101, stock:12 },
   { ID:251, title:'The Raven', author_id:150, stock:333 },
   { ID:271, title:'Catweazle', author_id:170, stock:222 }
]
INSERT (books) .into (Books)
```



### .into() {.method}

```tsx
function INSERT.into (
  entity   : string | CSN definition | tagged template string,
  entries? : object[]
)
```


Specifies the target entity to insert data into, either as a string or a reflected definition:


```js
const { Books } = cds.entities
INSERT.into (Books) .entries (...)
INSERT.into ('Books') .entries (...)
INSERT.into `Books` .entries (...)
```

You can optionally pass records of data [as  accepted by `.entries`](#insert-entries) as a shortcut to which:

```js
INSERT.into (Books, [
   { ID:201, title:'Wuthering Heights', author_id:101, stock:12 },
   { ID:251, title:'The Raven', author_id:150, stock:333 },
   { ID:271, title:'Catweazle', author_id:170, stock:222 }
])
```



### .entries() {.method}


Allows inserting multiple rows with one statement where each row
is a record with named values, for example, as could be read from a JSON
source.


```js
INSERT.into (Books) .entries (
   { ID:201, title:'Wuthering Heights', author_id:101, stock:12 },
   { ID:251, title:'The Raven', author_id:150, stock:333 },
   { ID:271, title:'Catweazle', author_id:170, stock:222 }
)
```

The entries can be specified as individual method parameters of type object — as shown above —, or as a single array of which.



### .values() {.method}

### .rows() {.method}


Use `.columns` with `.values` as in SQL:

```js
INSERT.into (Books) .columns (
   'ID', 'title', 'author_id', 'stock'
) .values (
   201, 'Wuthering Heights', 101, 12
)
```

>  Both, `.columns` and `.values` can alternatively wrapped into an array.

Use  `.rows` instead of `.values` to insert multiple rows with one statement:

```js
INSERT.into (Books) .columns (
   'ID', 'title', 'author_id', 'stock'
) .rows (
   [ 201, 'Wuthering Heights', 101, 12 ],
   [ 251, 'The Raven', 150, 333 ],
   [ 252, 'Eleonora', 150, 234 ]
)
```
### .as() {.method}


Constructs a _INSERT into SELECT_ statement.
```js
INSERT.into('Bar') .as (SELECT.from('Foo'))
```




## UPSERT ...

Fluent API to construct [CQN UPSERT](../cds/cqn#upsert) query objects in a [CQL](../cds/cql)/SQL-like style. In contrast to SQL, though, the clauses can be arrayed in arbitrary order.


 `UPSERT`  itself is a function acting as a shortcut to `UPSERT.entries`, allowing uses like that:


```js
const books = [
   { ID:201, title:'Wuthering Heights', author_id:101, stock:12 },
   { ID:251, title:'The Raven', author_id:150, stock:333 },
   { ID:271, title:'Catweazle', author_id:170, stock:222 }
]
UPSERT (books) .into (Books)
```

### .into() {.method}

```tsx
function UPSERT.into (
  entity   : string | CSN definition | tagged template string,
  entries? : object[]
)
```


Specifies the target entity to upsert data into, either as a string or a reflected definition..


```js
const { Books } = cds.entities
UPSERT.into (Books) .entries (...)
UPSERT.into ('Books') .entries (...)
UPSERT.into `Books` .entries (...)
```

You can optionally pass records of data [as  accepted by `.entries`](#upsert-entries) as a shortcut to which:

```js
UPSERT.into (Books, [
   { ID:201, title:'Wuthering Heights', author_id:101, stock:12 },
   { ID:251, title:'The Raven', author_id:150, stock:333 },
   { ID:271, title:'Catweazle', author_id:170, stock:222 }
])
```


### .entries() {.method}


Allows upserting multiple rows with one statement where each row
is a record with named values, for example, as could be read from a JSON
source.


```js
UPSERT.into (Books) .entries (
   { ID:201, title:'Wuthering Heights', author_id:101, stock:12 },
   { ID:251, title:'The Raven', author_id:150, stock:333 },
   { ID:271, title:'Catweazle', author_id:170, stock:222 }
)
```

The entries can be specified as individual method parameters of type object — as shown above —, or as a single array of which.



## UPDATE ... 

Fluent API to construct [CQN UPDATE](../cds/cqn#update) query objects in a [CQL](../cds/cql)/SQL-like style. In contrast to SQL, though, the clauses can be arrayed in arbitrary order.

 `UPDATE` itself is a function acting as a shortcut to `UPDATE.entity`, allowing usages like this:


```sql
UPDATE `Books` .set `stock = stock - ${quantity}` -- as shortcut to:
UPDATE.entity `Books` .set `stock = stock - ${quantity}`
```

### .entity() {.method}

```tsx
function UPDATE.entity ( 
   entity : string | CSN definition | tagged template string,
   key?   : string | number | object,
)
```

Specifies the target of the update operation, optionally followed by a primary key, and a projection. 
The latter provides an alternative for using separate  `.where` clauses. <br/>
For example, these queries are equivalent:

```js
UPDATE (Books,201)...
UPDATE (Books) .where ({ID:201}) ...
```

Argument `key` can be a single string or number value, or a [query-by-example](#where) object:

```js
UPDATE (Books,201) ... //> shortcut for {ID:201}
UPDATE (Books, {ID:201}) ...
UPDATE (Books.texts, {ID:201, locale:'de'}) ...
```



### .set() {.method}

### .with() {.method}


 Specifies the data to update...

1. As a single-expression tagged template string
```js
let [ ID, quantity ] = [ 201, 1 ]
UPDATE `Books` .set `stock = stock - ${quantity}` .where `ID=${ID}`
```

2. As an object with keys being element names of the target entity and values being simple values, [query-by-example](#where) expressions,  or [CQN](../cds/cqn.md) expressions:
```js
let [ ID, quantity ] = [ 201, 1 ]
UPDATE (Books,ID) .with ({
  title: 'Sturmhöhe',       //>  simple value
  stock: {'-=': quantity},    //>  qbe expression
  descr: {xpr: [{ref:[descr]}, '||', 'Some addition to descr.'])
})
```

> Method `.set` and `.with` are aliases to the same method.



### .where() {.method}

[As in SELECT.where](#where) {.learn-more}





## DELETE ... 

Fluent API to construct [CQN DELETE](../cds/cqn#delete) query objects in a [CQL](../cds/cql)/SQL-like style. In contrast to SQL, though, the clauses can be arrayed in arbitrary order.

```js
DELETE.from('Books').where ({stock:{'<':1}})
```



### .from() {.method}

```tsx
function SELECT.from ( 
   entity : string | CSN definition | tagged template string,
   key?   : string | number | object
)
```

[As in SELECT.from](#from) {.learn-more}



### .where() {.method}

[As in SELECT.where](#where) {.learn-more}

