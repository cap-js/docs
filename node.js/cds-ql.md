---
shorty: cds.ql
synopsis: >
  Use the `cds.ql` to construct queries using a [fluent](cds-ql#fluent-api), SQL-like API.
layout: node-js
status: released
---
<!--- Migrated: @external/node.js/cds.ql/0-index.md -> @external/node.js/cds-ql.md -->

# Embedded CQL with `cds.ql`

{{$frontmatter.synopsis}} In combination with [tagged template strings](#tts) this creates a sweeping embedded CQL experience. The API can be used via global constants or through `cds.ql`:

```js
const cds = require('@sap/cds')   //> adds global constants
const q = SELECT.from('Foo')     //> using global constant
```

```js
const { SELECT, INSERT } = cds.ql  //> gets local variables
const q = SELECT.from('Foo')      //> using local variable
```

<br>

<!--- % include links-for-node.md %} -->
<!--- % include _chapters toc="2,3" %} -->


## Constructing Queries

You can choose between two primary styles to construct queries: A [SQL-like fluent API](#fluent-api) style provided by `cds.ql` or a call-level [Querying API provided by `cds.Service`](services#srv-run). The lines between both blur, as the latter is actually just a shortcut to the former. This is especially true when combining both with the use of [tagged template string literals](#tts).



###  <em>  Using Fluent APIs with classic method calls </em> {#fluent-api}


The Fluent API resembles well-known SQL syntax to construct queries like that:

```js
let q1 = SELECT.one.from('Books').where({ID:201})
let q2 = INSERT.into('Books').entries({title:'Wuthering Heights'})
let q3 = UPDATE('Books').where({ID:201}).with({title:'Sturmhöhe'})
let q4 = DELETE.from('Books').where({ID:201})
```


::: tip *Not Locked in to SQL*{.tip-title}
While both, [CQN](../cds/cqn) as well as the [fluent API](#fluent-api) resemble well-known SQL syntax, `cds.ql` isn't locked in to SQL. In fact, queries can be sent to any kind of services, including NoSQL databases or [remote services](remote-services) for execution.
:::


###  <em>  Using Service APIs plus Fluent APIs </em> {#service-api}

The following uses [the Querying API provided by `cds.Service`](services#srv-run) to construct exactly the same effective queries as the ones constructed with the fluent API above:

```js
let q1 = cds.read('Books',201)
let q2 = cds.create('Books',{title:'Wuthering Heights'})
let q3 = cds.update('Books',201,{title:'Sturmhöhe'})
let q4 = cds.delete('Books',201)
```

[As documented in the `cds.Services` API](services#convenient-shortcuts) docs, these methods are actually just shortcuts to the respective Fluent API methods above, and can be continued with calls to fluent API function, thus blurring the lines. For example, also these lines are equivalent to both variants above:


```js
let q1 = cds.read('Books').where({ID:201})
let q2 = cds.create('Books').entries({title:'Wuthering Heights'})
let q3 = cds.update('Books').where({ID:201}).with({title:'Sturmhöhe'})
let q4 = cds.delete('Books').where({ID:201})
```


###  <em>  Using Tagged Template String Literals </em> {#tts}

Version 5 of `@sap/cds` introduced support for [tagged template string literals](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Template_literals) with both API styles, which greatly promotes embedded CQL experience.

The [Fluent API example above](#fluent-api) could be rewritten like this:

```sql
let q1 = SELECT.one.from `Books` .where `ID=${201}`
let q2 = INSERT.into `Books` .entries ({title:'Wuthering Heights'})
let q3 = UPDATE `Books` .where `ID=${201}` .with `title=${'Sturmhöhe'}`
let q4 = DELETE.from `Books` .where `ID=${201}`
```

Similarly, we could rewrite [the Service API example](#service-api) like this:

```js
let q1 = cds.read `Books` .where `ID=${201}`
let q2 = cds.create `Books` .entries ({title:'Wuthering Heights'})
let q3 = cds.update `Books` .where `ID=${201}` .with `title=${'Sturmhöhe'}`
let q4 = cds.delete `Books` .where `ID=${201}`
```


###  <em>  Using Reflected Definitions as Query Targets </em> {#using-reflected-defs}

It is recommended best practice to use entity definitions reflected from a service's model to construct queries.
Doing so greatly simplifies code as it avoids repeating namespaces all over the place.

For example:

```sql
const { Books } = cds.entities
let q1 = SELECT.one.from (Books) .where `ID=${201}`
let q2 = INSERT.into (Books) .entries ({title:'Wuthering Heights'})
let q3 = UPDATE (Books) .where `ID=${201}` .with `title=${'Sturmhöhe'}`
let q4 = DELETE.from (Books) .where `ID=${201}`
```

[Learn more about using reflected definitions from a service's model](services#srv-entities){.learn-more}


## Executing Queries

Essentially queries are executed by passing them to a service's [`srv.run`](services#srv-run) method. Most frequently, you can also just use `await` on a query to do so.


###  <em>  Passing Queries to `srv.run(...)` </em>

The basic mechanism to execute a query is to pass it to a [`srv.run`](services#srv-run) method.
For example, using the primary database service `cds.db`:

```sql
let query = SELECT `ID,title` .from `Books`
```
```js
let books = await cds.run (query)
```
[Note: `cds` acts as a shortcut to `cds.db` &rarr; see `cds.run` for details](cds-facade#cds-run){.learn-more}


##### Sending Queries to Other Services

Instead of a database service, you can also send queries to other services, local or remote ones. For example:

```js
const cats = await cds.connect.to ('CatalogService')
let books = await cats.run (query)
```
[Learn more about connecting to other services](cds-connect){.learn-more}

`CatalogService` might be a remote service connected via OData. In this case, the query would be translated to an OData request sent via http.




###  <em>  Promise-`await`-ing Queries </em> {#await-ing-queries}

Alternatively, you can just `await` a constructed query, which by default passes the query to the [primary database service's](cds-facade#cds-db) `srv.run` method. That is, the following two code samples are equivalent:

```js
let books = await SELECT `ID,title` .from `Books`
```
```js
let books = await cds.run (SELECT `ID,title` .from `Books`)
```


###  <em>  With Reflected Query Targets </em>

As explained above, it is recommended best practice to [use reflected definitions as query targets](#using-reflected-defs). These definitions 'remember' where they came from, hence `await`-ing respective queries will send them to the originating service, hence the following two samples are equivalent:

```js
// asumed we did that before:
const cats = await cds.connect.to ('CatalogService')
const { Books } = cats.entities
```
```js
let books = await SELECT `ID,title` .from (Books)
```
```js
let books = await cats.run (SELECT `ID,title` .from (Books))
```




###  <em>  With Bound Queries from `srv.<crud>` </em>

Finally, when using the [CRUD-style Service Querying APIs](services#srv-run), the constructed queries returned by the respective methods are bound to the originating service, and will be sent to that service's `srv.run()` method upon `await`. Hence these samples are equivalent:

```js
let books = await srv.read `ID,title` .from `Books`
```
```js
let query = srv.read `ID,title` .from `Books`
let books = await srv.run(query)
```



###  <em>  Queries are First-Class Objects </em>

Constructing queries doesn't execute them immediately, but just captures the given query information. Very much like functions in JavaScript, queries are first-class objects, which can be assigned to variables, modified, passed as arguments, or returned from functions. Let's investigate this somewhat more, given this example:

```js
const cats = await cds.connect.to('CatalogService') //> connected via OData
const books = await cats.read `Books` .where `name like '%Poe%'`
```

This is what happens behind the scenes:

1. `cats.read` constructs and returns a new query
2. which is complemented with a `where` clause
3. Upon `await` the query is passed to `cats.run()`
4. A registered event handler translates the query to an OData request and sends that to the remote service

And on the remote side:

1. The OData protocol adapter translates the inbound query to CQN query
2. This query is passed to the remote service provider
3. A registered event handler forwards that query to the local `cds.db` service
4. The database service implementation translates the query to plain SQL and sends that to the database for execution



###  <em>  Leveraging Late Materialization </em>

You can also combine queries much like sub selects in SQL to form more complex queries as shown in this example:

```sql
let input = '%Brontë%'
let Authors = SELECT `ID` .from `Authors` .where `name like ${input}`
let Books = SELECT.from `Books` .where `author_ID in ${Authors}`
```
```js
await cds.run (Books) //> late/no materialization of Authors
```

With that we leverage late materialization, offered by SQL databases.
Compare that to inferior imperative programming:

```js
let input = '%Brontë%'
let Authors = await SELECT `ID` .from `Authors` .where `name like ${input}`
for (let a of Authors) { //> looping over eagerly materialized Authors
  let Books = await SELECT.from `Books` .where `author_ID = ${a.ID}`
}
```




###  <em>  Avoiding SQL Injection by Design </em>

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


## **SELECT** ... {#SELECT}

Fluent API to construct [CQN SELECT](../cds/cqn#select) query objects in a [CQL](../cds/cql)/SQL-like style. In contrast to SQL, though, the clauses can be arrayed in arbitrary order.

### SELECT...

<div class='indent' markdown="1">

The root constant `SELECT` is a function itself, which acts as a shortcut to `SELECT.columns`, thereby resembling SQL syntax as close as possible:

```sql
SELECT `a, b as c` .from `Foo`  -- is a shortcut for:
SELECT .columns `a, b as c` .from `Foo`
```

Moreover, it accepts a single tagged template string which can comprise all [CQL](../cds/cql) clauses, starting with `from`:

```js
const limit = 11, sort_column = 'a'
const q = SELECT `from Foo {
   a, b as c, sum(d)
} where x < ${limit}
group by a,b
order by ${sort_column} asc`
const foos = await q
```

This can be used to construct [CQN](../cds/cqn) query objects from statement using [CQL](../cds/cql) language constructs which are not covered by `cds.ql` Fluent API.

</div>

### <i>&#8627;</i> .one <i>|</i> .distinct {#select-one }

<div class='indent' markdown="1">

Start constructing a query with `SELECT.one` to indicate we're interested in only the first row. At runtime, a single entry, if any, is returned instead of an array:

```js
const one = await SELECT.one.from (Authors)
```

> same effect, but potentially more expensive:

```js
const [one] = await SELECT.from (Authors)
```

Start the query with `SELECT.distinct` to skip duplicates as in SQL:

```js
SELECT.distinct.from (Authors)
```

</div>

### <i>&#8627;</i>.columns  <i>  (cols) </i> {#select-columns  .first-of-many}

<div class="indent" markdown="1">

Specifies  which columns to be fetched, very much like SQL select clauses, enhanced by [CQL](../cds/cql) projections and path expressions. If called repeatedly, respective columns are added cumulatively.


#### <em> API Style Variants </em>

The clauses methods can be used in varying order as follows...

1. SQL-style Prefix Projections
```sql
SELECT `a, b as c, count(d) as e` .from `Foo`
```
... which essentially is a shortcut to:
```sql
SELECT .columns `a, b as c, count(d) as e` .from `Foo`
```

2. CQL-style Postfix Projections
```sql
SELECT .from `Foo` .columns `a, b as c, count(d) as e`
```

... optionally enclosed in braces:
```sql
SELECT .from `Foo` .columns `{ a, b as c, count(d) as e }`
```

> The examples above show [tagged template syntax variants](#tts), the same styles are available with [classic method call variants](#fluent-api) or when [Service Querying APIs](#service-api).



#### <em> Arguments Variants </em>

In all API style variants, the arguments describe the desired projections, which in turn can be specified by one of....


1. [A projection function](#projection-functions):
```js
SELECT.from `Foo` .columns (foo => {
     foo.a, foo.b.as('c')
})
```

2. [A tagged template string](#tts):
```js
SELECT.from `Foo` .columns `{ a, b as c }`
```

3. [CQL column expressions](../cds/cql):
```js
SELECT.from `Foo` .columns ('a', 'b as c')
```

4. [CQN expression objects](../cds/cqn):
```js
SELECT.from `Foo` .columns ({ref:['a']}, {ref:['b'], as:'c'})
```

5. An array of 3 and/or 4:
```js
SELECT.from `Foo` .columns ([ 'a', 'b as c' ])
```

> All of the examples above produce the same CQN.



#### <em> Projection Functions </em>

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

**Note:** Not every CQL or SQL construct can be expressed with projection functions. This is where tagged template strings kick in.

</div>

<div id="beforefrom" />

### <i>&#8627;</i> .from  <i>  (entity, key?, cols?)  </i> { #select-from }

<div class='indent' markdown='1'>

 Fills in [CQN `from` clauses](../cds/cqn.md#select), optionally adding a primary key, and a projection. The latter are alternatives for using separate `.one`, `.where` and  `.columns` clauses.


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

> NOTE: Specifying a `key` argument automatically [enables `SELECT.one`](#select-one)
  and moves the `where` clause into the entity reference.



##### Argument `entity` can be one of:

- A string with an entity's fully-qualified name, or relative to the target service's namespace (the default namespace for primary db).
```js
SELECT.from `my.bookshop.Books`
SELECT.from `Books` //> for namespace my.bookshop
```

- An entity definition from a reflected model.
```js
const { Books } = cds.entities
SELECT.from (Books)
```

##### Argument `key` can be one of:

- a single value in case of a single key, named `ID`:
```js
SELECT.from (Books,201)
```

- a [query-by-example](#where) object for single or compound keys:
```js
SELECT.from (Books, {ID:201})
SELECT.from (Books.texts, {ID:201, locale:'de'})
```
[Learn more about `<entity>.texts` property](cds-reflect#entity-texts){.learn-more}

##### Argument `cols` is a projection ...

→ [as accepted by `.columns (cols)`](#select-columns)



</div>

### <i>&#8627;</i>.alias  <i>  (string) </i> { #select-alias }

Specifies the alias which you can refer to in other functions:

```js
SELECT.from ('Authors').alias('a')
  .where({ exists: SELECT.from('Books').where('author_ID = a.ID')})
```

### <i>&#8627;</i>.where  <i>  (expr) </i> { #where  .first-of-many}
### <i>&#8627;</i>.having  <i>  (expr) </i>

<div class='indent' markdown='1'>

These methods allow to fill in corresponding  [CQL](../cds/cql) clauses with predicate  expressions, which can be specified in different variants:

1. As tagged template string literals:
```sql
SELECT.from `Books` .where `ID = ${req.data.ID}`
```
> Offers most flexibility, including native constructs. Still values are isolated and passed via argument bindings, hence avoiding SQL injection.

2. As alternating string / value arguments list:
```sql
SELECT.from `Books` .where ('ID =', req.data.ID)
```
> Was a predecessor to variant 1, now more or less became obsolete with the availability of tagged template string variants.

3. As query-by example object literal:
```sql
SELECT.from `Books` .where ({ ID: req.data.ID })
```
> Comes in handy when applying user input obtained as objects. It supports restricted ways to express certain operators as shown below.

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

</div>

### <i>&#8627;</i>.groupBy  <i>  (...refs)  </i>

<div class='indent' markdown='1'>

Allows to capture SQL-like `group by` clauses. Arguments are a single tagged template string, or column expression strings or [CXN](../cds/cxn.md) objects, like that:

```js
SELECT ... .groupBy `a.name, b`
SELECT ... .groupBy ('a.name', 'b')
SELECT ... .groupBy ({ref:['a','name']}, {ref:['b']})
```

</div>

### <i>&#8627;</i>.orderBy  <i>  (...refs+) </i>

<div class='indent' markdown='1'>

Equivalent of the standard SQL `order by` clauses. Arguments are a single tagged template string, or column expression strings, optionally followed by `asc` or `desc`, or [CXN](../cds/cxn.md) objects, like that:

```js
SELECT ... .orderBy `a.name, b desc`
SELECT ... .orderBy ('a.name', 'b desc')
SELECT ... .orderBy ({ref:['a','name']}, {ref:['b'],sort:'desc'})
```

</div>


### <i>&#8627;</i>.limit  <i>  (rows, offset?) </i>

<div class='indent' markdown='1'>

Equivalent of the standard SQL `limit` and `offset` clauses.
Arguments can be standard numbers or [CXN](../cds/cxn.md) expression objects.

```js
SELECT ... .limit (25)      //> first page
SELECT ... .limit (25,100)  //> fifth page
```

</div>


### <i>&#8627;</i>.forUpdate  <i>  (options?) ... </i> {#select-forUpdate }

<div class='indent' markdown='1'>

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
</div>

<br><br>

### <i>&#8627;</i>.forShareLock  <i>  () </i> {#select-forsharelock }

Locks the selected rows in the current transaction, thereby preventing concurrent updates by other parallel
transactions, until the transaction is committed or rolled back. Using a shared lock allows all transactions to read the locked record.

If a queried record is already exclusively locked by another transaction, the `.forShareLock()` method waits for the lock to be released.


## **INSERT** ... {#INSERT}

Fluent API to construct [CQN INSERT](../cds/cqn#insert) query objects in a [CQL](../cds/cql)/SQL-like style. In contrast to SQL, though, the clauses can be arrayed in arbitrary order.

### INSERT...

<div class='indent' markdown="1">

The root constant `INSERT` is a function itself, which acts as a shortcut to `INSERT.entries`, thereby allowing uses like that:


```js
const books = [
   { ID:201, title:'Wuthering Heights', author_id:101, stock:12 },
   { ID:251, title:'The Raven', author_id:150, stock:333 },
   { ID:271, title:'Catweazle', author_id:170, stock:222 }
]
INSERT (books) .into (Books)
```

</div>

### <i>&#8627;</i> .into  <i>  (entity, ...data?) </i> {#insert-into }

<div class="indent" markdown="1">

Specifies the target entity to insert data into, either as a string or a reflected definition..


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

</div>



### <i>&#8627;</i>.entries  <i>  (...data) </i> {#insert-entries }

<div class="indent" markdown="1">

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

</div>


### <i>&#8627;</i> .values <i>/</i> rows <i> (...) </i> {#insert-rows }

<div class="indent" markdown="1">

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
</div>

### <i>&#8627;</i>.as  <i>  ( SELECT... ) </i> {#insert-as }

<div class="indent" markdown="1">

Constructs a _INSERT into SELECT_ statement.
```js
INSERT.into('Bar') .as (SELECT.from('Foo'))
```
</div>

<br><br>


## **UPSERT** ... {#UPSERT}

Fluent API to construct [CQN UPSERT](../cds/cqn#upsert) query objects in a [CQL](../cds/cql)/SQL-like style. In contrast to SQL, though, the clauses can be arrayed in arbitrary order.

### UPSERT...

<div class='indent' markdown="1">

The root constant `UPSERT` is a function itself, which acts as a shortcut to `UPSERT.entries`, thereby allowing uses like that:


```js
const books = [
   { ID:201, title:'Wuthering Heights', author_id:101, stock:12 },
   { ID:251, title:'The Raven', author_id:150, stock:333 },
   { ID:271, title:'Catweazle', author_id:170, stock:222 }
]
UPSERT (books) .into (Books)
```

</div>

### <i>&#8627;</i> .into  <i>  (entity, ...data?) </i> {#upsert-into }

<div class="indent" markdown="1">

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

</div>


### <i>&#8627;</i>.entries  <i>  (...data) </i> {#upsert-entries }

<div class="indent" markdown="1">

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

</div>


## **UPDATE** ... {#UPDATE}

### UPDATE...

<div class="indent" markdown="1">

The root constant `UPDATE` is a function itself, which acts as a shortcut to `UPDATE.entity`, thereby resembling SQL syntax as close as possible:


```sql
UPDATE `Books` .set `stock = stock - ${quantity}` -- as shortcut to:
UPDATE.entity `Books` .set `stock = stock - ${quantity}`
```

</div>

### <i>&#8627;</i>.entity  <i>  (entity, key?) ... </i>

<div class="indent" markdown="1">

Specifies the target of the update operation, either as a fully qualified name, a name local to the target service or as a reflected definition.

##### Argument `entity` can be one of:

- A string with an entity's fully-qualified name, or relative to the target service's namespace (the default namespace for primary db).

```js
UPDATE `my.bookshop.Books` ...
UPDATE `Books` ... //> for namespace my.bookshop
```

- An entity definition from a reflected model.

```js
const { Books } = cds.entities
UPDATE (Books) .with(...)
```

##### Argument `key` can be one of:

- a single value in case of a single key, named `ID`:

```js
UPDATE (Books,201) .with(...)
```

- a [query-by-example](#where) object for single or compound keys:

```js
UPDATE (Books, {ID:201}) .with(...)
UPDATE (Books.texts, {ID:201, locale:'de'}) .with(...)
```

[Learn more about `<entity>.texts` property](cds-reflect#entity-texts){.learn-more}

</div>


### <i>&#8627;</i>.with, set  <i>  (...) </i>

<div class="indent" markdown="1">

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

</div>

### <i>&#8627;</i>.where  <i>  (expr) </i>

[As in SELECT.where](#where){.learn-more}

<br><br>


## **DELETE** ... {#DELETE}

Fluent API to construct [CQN DELETE](../cds/cqn#delete) query objects in a [CQL](../cds/cql)/SQL-like style. In contrast to SQL, though, the clauses can be arrayed in arbitrary order.

### DELETE...

<div class='indent' markdown="1">
</div>

### <span style="color:grey"><i>&#8627;</i> </span> .from <i> (entity, key?) ... </i>

<div class="indent" markdown="1">

```js
DELETE.from('Books').where ({stock:{'<':1}})
```
</div>

### <span style="color:grey"><i>&#8627;</i> </span>.where <i> (expr) </i>

[As in SELECT.where](#where){.learn-more}

<br><br>


## Class cds.**Query**  { #cds-query}

Instances of `cds.Query` capture queries at runtime. Subclasses provide [fluent APIs](#fluent-api) to construct queries as highlighted below.



### .cmd  <i>  &#8674; 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | ... </i> {#query-cmd}


The current command, that is one of these strings:

- `'SELECT'`
- `'INSERT'`
- `'UPDATE'`
- `'DELETE'`
- `'CREATE'`
- `'DROP'`

This is usefull for generic query processors, such as outbound protocol adapters or database services, which need to translate given queries into target representations.


### .then  <i>  &#8594; results </i> {#query-then}

All instances of `cds.Query`, that is, all queries constructed with the fluent API functions as documented below, are thenables. `await`ing them executes the query with the target's service, or the primary database service as explained in section [Executing Queries](#await-ing-queries).
