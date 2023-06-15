---
status: released
---

# Using SQLite for Development {#sqlite}



CAP provides extensive support for SQLite, which allows projects to speed up development by magnitudes at minimized costs. We strongly recommend to make use of this option during development and testing as much as possible.

::: tip New SQLite Service
This guide focuses on the new SQLite Service provided through *[@cap-js/sqlite](https://www.npmjs.com/package/@cap-js/sqlite)*, which has many advantages over the former one as documented in the [*Features*](#features) section below. Find also instructions for [*Migration*](#migration) from old service below.
:::



[[toc]]





## Setup & Configuration

Run this to use SQLite during development:

```sh
npm add @cap-js/sqlite -D
```

[See also the general information on installing database packages.](databases#setup-configuration){.learn-more}







## In-memory Databases

Installing `@cap-js/sqlite` as described above automatically configures your application to use an in-memory SQLite database. For example, you can see this in the log output when starting your application, with `cds watch`:

```log
...
[cds] - connect to db > sqlite { url: ':memory:' } //[!code focus]
  > init from db/init.js
  > init from db/data/sap.capire.bookshop-Authors.csv
  > init from db/data/sap.capire.bookshop-Books.csv
  > init from db/data/sap.capire.bookshop-Books.texts.csv
  > init from db/data/sap.capire.bookshop-Genres.csv
/> successfully deployed to in-memory database. //[!code focus]
...
```



You can inspect the effective configuration using `cds env`:

```sh
cds env requires.db
```

→ should display this output:

```js
{
  impl: '@cap-js/sqlite',
  credentials: { url: ':memory:' },
  kind: 'sqlite'
}
```





## Persistent Databases


<!--
TODO: A plain cds.requires.db = 'sqlite' also behaves this way.
If possible, all common scenarios should be covered by shortcuts only.
-->
You can also use persistent SQLite databases. Follow these steps to do so:

1. Specify a db filename in your `db` configuration as follows:

   ::: code-group
   ```json [package.json]
   { "cds": { "requires": {
      "db": {
         "kind": "sqlite",
         "credentials": { "url": "db.sqlite" } //[!code focus]
      }
   }}}
   ```
   :::

2. Then run `cds deploy`:
   ```sh
   cds deploy
   ```

This will:

1. Create a database file with the given name
2. Create the tables and views according to your CDS model
3. Fill in initial data from provided `.csv` files

With that in place, when starting the server it will use this prepared database instead of bootstrapping an in-memory one:

```log
...
[cds] - connect to db > sqlite { url: 'db.sqlite' }
...
```

::: tip Re-deploy on changes

Remember to always re-deploy your database whenever you made changes to your models or your data. Just run `cds deploy` again to do so.

:::

### Drop-Create Schema

When running `cds deploy` repeatedly it will always drop-create all tables and views. This is **most appropriate for development** as schema changes are very frequent and broad during development.



## Schema Evolution

While drop-create is most appropriate for development, it isn't for database upgrades in production, as all customer data would be lost. To avoid this `cds deploy` also supports automatic schema evolution, which you can use as follows...

1. Enable automatic schema evolution in your `db` configuration:

   ::: code-group
   ```json [package.json]
   { "cds": { "requires": {
      "db": {
         "kind": "sqlite",
         "credentials": { "url": "db.sqlite" },
         "schema_evolution": "auto" //[!code focus]
      }
   }}}
   ```
   :::

2. Then run `cds deploy`:

   ```sh
   cds deploy
   ```

This will:

1. Read a CSN of a former deployment from table `cds_model`
2. Calculate the delta to current model
3. Generate and run SQL DDL statements with:
   - `CREATE TABLE` statements for new entities 
   - `CREATE VIEW` statements for new views
   - `ALTER TABLE` statements for entities with new or changed elements
   - `DROP & CREATE VIEW` statements for views affected by changed entities
4. Fill in initial data from provided `.csv` files using `UPSERT` commands
5. Store a CSN representation of the current model in `cds_model`



### Dry-run Offline

We can use `cds deploy` with option `--dry` to simulate and inspect how things work.

1. Capture your current model in a CSN file:
   ```sh 
   cds deploy --dry --model-only > cds-model.csn
   ```

2. Make changes to your models, for example to *[cap/samples/bookshop/db/schema.cds](https://github.com/SAP-samples/cloud-cap-samples/blob/main/bookshop/db/schema.cds)*:
   ```cds
   entity Books { ...
      title : localized String(222); //> increase length from 111 to 222
      foo : Association to Foo;      //> add a new relationship 
      foo : String;                  //> add a new element
   }
   entity Foo { key ID: UUID }       //> add a new entity
   ```

3. Generate delta SQL DDL script:
   ```sh
   cds deploy --dry --delta-from cds-model.csn > delta.sql
   ```

4. Inspect the generated SQL script, which should look like this:
   ::: code-group

   ```sql [delta.sql]
   -- Drop Affected Views
   DROP VIEW localized_CatalogService_ListOfBooks;
   DROP VIEW localized_CatalogService_Books;
   DROP VIEW localized_AdminService_Books;
   DROP VIEW CatalogService_ListOfBooks;
   DROP VIEW localized_sap_capire_bookshop_Books;
   DROP VIEW CatalogService_Books_texts;
   DROP VIEW AdminService_Books_texts;
   DROP VIEW CatalogService_Books;
   DROP VIEW AdminService_Books;
   
   -- Alter Tables for New or Altered Columns
   -- ALTER TABLE sap_capire_bookshop_Books ALTER title TYPE NVARCHAR(222);
   -- ALTER TABLE sap_capire_bookshop_Books_texts ALTER title TYPE NVARCHAR(222);
   ALTER TABLE sap_capire_bookshop_Books ADD foo_ID NVARCHAR(36);
   ALTER TABLE sap_capire_bookshop_Books ADD bar NVARCHAR(255);
   
   -- Create New Tables
   CREATE TABLE sap_capire_bookshop_Foo (
     ID NVARCHAR(36) NOT NULL,
     PRIMARY KEY(ID)
   );
   
   -- Re-Create Affected Views 
   CREATE VIEW AdminService_Books AS SELECT ... FROM sap_capire_bookshop_Books AS Books_0;
   CREATE VIEW CatalogService_Books AS SELECT ... FROM sap_capire_bookshop_Books AS Books_0 LEFT JOIN sap_capire_bookshop_Authors AS author_1 O ... ;
   CREATE VIEW AdminService_Books_texts AS SELECT ... FROM sap_capire_bookshop_Books_texts AS texts_0;
   CREATE VIEW CatalogService_Books_texts AS SELECT ... FROM sap_capire_bookshop_Books_texts AS texts_0;
   CREATE VIEW localized_sap_capire_bookshop_Books AS SELECT ... FROM sap_capire_bookshop_Books AS L_0 LEFT JOIN sap_capire_bookshop_Books_texts AS localized_1 ON localized_1.ID = L_0.ID AND localized_1.locale = session_context( '$user.locale' );
   CREATE VIEW CatalogService_ListOfBooks AS SELECT ... FROM CatalogService_Books AS Books_0;
   CREATE VIEW localized_AdminService_Books AS SELECT ... FROM localized_sap_capire_bookshop_Books AS Books_0;
   CREATE VIEW localized_CatalogService_Books AS SELECT ... FROM localized_sap_capire_bookshop_Books AS Books_0 LEFT JOIN localized_sap_capire_bookshop_Authors AS author_1 O ... ;
   CREATE VIEW localized_CatalogService_ListOfBooks AS SELECT ... FROM localized_CatalogService_Books AS Books_0;
   ```

   :::

   > **Note:** ALTER TYPE commands are neither necessary nor supported by SQLite, as SQLite is essentially typeless.



### Limitations

Automatic schema evolution only allows changes without potential data loss.

::: tip Allowed:
- Adding entities and elements
- Increasing the length of Strings
- Increasing the size of Integers
:::

::: warning Disallowed:
- Removing entities or elements
- Changes to primary keys
- All other type changes
:::

For example the following type changes are allowed: 

```cds
entity Foo {
   anInteger : Int64;     // from former: Int32
   aString : String(22);  // from former: String(11)
}
```



## Features

Following is an overview of advanced features supported by the new database service(s).

> These apply to all new database services, SQLiteService, HANAService, and PostgresService. 



### Path Expressions & Filters

The new database service provides **full support** for all kinds of [path expressions](https://cap.cloud.sap/docs/cds/cql#path-expressions), including [infix filters](https://cap.cloud.sap/docs/cds/cql#with-infix-filters), and [exists predicates](https://cap.cloud.sap/docs/cds/cql#exists-predicate). For example, you can try this out with *[cap/samples](https://github.com/sap-samples/cloud-cap-samples)* as follows: 

```sh
cds repl --profile better-sqlite
var { server } = await cds.test('bookshop'), { Books, Authors } = cds.entities
await INSERT.into (Books) .entries ({ title: 'Unwritten Book' })
await INSERT.into (Authors) .entries ({ name: 'Upcoming Author' })
await SELECT `from ${Books} { title as book, author.name as author, genre.name as genre }`
await SELECT `from ${Authors} { books.title as book, name as author, books.genre.name as genre }`
await SELECT `from ${Books} { title as book, author[ID<170].name as author, genre.name as genre }`
await SELECT `from ${Books} { title as book, author.name as author, genre.name as genre }` .where ({'author.name':{like:'Ed%'},or:{'author.ID':170}})
await SELECT `from ${Books} { title as book, author.name as author, genre.name as genre } where author.name like 'Ed%' or author.ID=170`
await SELECT `from ${Books}:author[name like 'Ed%' or ID=170] { books.title as book, name as author, books.genre.name as genre }`
await SELECT `from ${Books}:author[150] { books.title as book, name as author, books.genre.name as genre }`
await SELECT `from ${Authors} { ID, name, books { ID, title }}`
await SELECT `from ${Authors} { ID, name, books { ID, title, genre { ID, name }}}`
await SELECT `from ${Authors} { ID, name, books.genre { ID, name }}`
await SELECT `from ${Authors} { ID, name, books as some_books { ID, title, genre.name as genre }}`
await SELECT `from ${Authors} { ID, name, books[genre.ID=11] as dramatic_books { ID, title, genre.name as genre }}`
await SELECT `from ${Authors} { ID, name, books.genre[name!='Drama'] as no_drama_books_count { count(*) as sum }}`
await SELECT `from ${Authors} { books.genre.ID }`
await SELECT `from ${Authors} { books.genre }`
await SELECT `from ${Authors} { books.genre.name }`

```



### Optimized Expands

The old database service implementation(s) translated deep reads, i.e., SELECTs with expands, into several database queries and collected the individual results into deep result structures. The new service uses `json_object` functions and alike to instead do that in one single query, with sub selects, which greatly improves performance. 

Example: 

```sql
SELECT.from(Authors, a => {
  a.ID, a.name, a.books (b => {
    b.title, b.genre (g => {
       g.name
    })
  })
})
```

Required three queries with three roundtrips to the database, now only one query is required. 





### Localized Queries

With the old implementation when running queries like `SELECT.from(Books)` would always return localized data, without being able to easily read the non-localized data. The new service does only what you asked for, offering new `SELECT.localized` options:

```js
let books = await SELECT.from(Books)       //> non-localized data
let lbooks = await SELECT.localized(Books) //> localized data
```

Usage variants include:  

```js
SELECT.localized(Books)
SELECT.from.localized(Books)
SELECT.one.localized(Books)
```


### Standard Functions

A specified set of standard functions is now supported in a **database-agnostic** way and translated to database-specific variants. These functions are by and large the same as specified in OData: 

* `concat(x,y,...)` — concatenates the given strings 
* `contains(x,y)` — checks whether `y` is contained in `x`, may be fuzzy 
* `search(xs,y)` — checks whether `y` is contained in any of `xs`, may be fuzzy
* `startswith(x,y)` — checks whether `y` starts with `x`
* `endswith(x,y)` — checks whether `y` starts with `x`
* `matchesPattern(x,y)` — checks whether `x` matches regex `y`
* `substring(x,i,n)` — extracts a substring from `x` starting at `i` with length `n`
* `indexof(x,y)` — returns the (zero-based) index of the first occurrence of `y` in `x`
* `length(x)` — returns the length of string `x`
* `tolower(x)` — returns all-lowercased `x`
* `toupper(x)` — returns all-uppercased `x`
* `ceiling(x)` — returns ceiled `x`
* `year` `month`, `day`, `hour`, `minute`, `second` — return parts of a datetime 

The db service implementation translates these to the best-possible native SQL functions, thus enhancing the extend of **portable** queries. 

For example, this CQL query:

```sql
SELECT from Books where search((title,descr),'y')
```

gets translated to this native SQLite query:

```sql
SELECT * from sap_capire_bookshop_Books 
 WHERE ifnull(instr(lower(title),lower('y')),0) 
    OR ifnull(instr(lower(descr),lower('y')),0) 
```

> Note: only single values are supported for the second argument `y`.

::: warning 

**Note** that usage is **case-sensitive**, which means you have to write these functions exactly as given above; all-uppercase usages are not supported. 

:::



### HANA Functions

In addition to the standard functions, which all new database services will support, the new SQLite service also supports these common HANA functions, to further increase the scope for portable testing:

- `years_between`
- `months_between`
- `days_between`
- `seconds_between`
- `nano100_between`

> Both usages are allowed here: all-lowercase as given above, as well as all-uppercase.



### Session Variables

The new SQLite service can leverage  [*better-sqlite*](https://www.npmjs.com/package/better-sqlite3)'s user-defined functions to support *session context* variables. In particular, the pseudo variables `$user.id`, `$user.locale`,  `$valid.from`, and `$valid.to` are available in native SQL queries like so: 

```sql
SELECT session_context('$user.id')
SELECT session_context('$user.locale')
SELECT session_context('$valid.from')
SELECT session_context('$valid.to')
```

Amongst other, this allows us to get rid of static helper views for localized data like `localized_de_sap_capire_Books`. 





### Using Lean Draft

The old implementation was overly polluted with draft handling. But as draft is actually a Fiori UI concept, nothing of that should show up in database layers. Hence, we eliminated all draft handling from the new database service implementations, and implemented draft in a modular, non-intrusive way — called *'Lean Draft'*. The most important change is that we don't do expensive UNIONs anymore but work with single cheap selects. 



### Improved Performance

The combination of the above-mentioned improvements commonly leads to significant performance improvements. For example displaying the list page of Travels in [cap/sflight](https://github.com/SAP-samples/cap-sflight) took **>250ms** in the past, and **~15ms** now.





## Migration



While we were able to keep all public APIs stable, we had to apply changes and fixes to some **undocumented behaviours and internal APIs** in the new implementation. While not formally breaking changes, you may have used or relied on these undocumented APIs and behaviours. In that case find instructions about how to resolve this in the following sections. 

> These apply to all new database services, SQLiteService, HANAService, and PostgresService. 



### Use Old and New in Parallel

During migration you may want to occasionally run and test your app with both, the new SQLite service and the old one. Do so as follows...

1. Add the new service with `--no-save`
   ```sh
   npm add @cap-js/sqlite --no-save
   ```

   > This bypasses the *cds-plugin* mechanism, which works through package dependencies.

2. Run or test your app with the `better-sqlite` profile using one of these options:

   ```sh
   cds watch bookshop --profile better-sqlite
   ```

   ```sh
   CDS_ENV=better-sqlite cds watch bookshop
   ```

   ```sh
   CDS_ENV=better-sqlite jest --silent
   ```

3. Run or test your app with the old SQLite service as before:
   ```sh
   cds watch bookshop
   ```
   ```sh
   jest --silent
   ```

   



### Avoid UNIONs and JOINs

Many advanced features supported by the new database services, like path expressions or deep expands, rely on the ability to infer queries from CDS models. This task gets extremely complex when adding UNIONs and JOINs to the equation — at least the effort and overhead is hardly matched by generated value. Therefore we dropped support of UNIONs and JOINs in CQN queries. 

For example, this means queries like that are deprecated / not supported any longer:

```js
SELECT.from(Books).join(Authors,...)
```

Mitigations: 

1. Use [path expressions](#path-expressions-filters) instead of joins — actually the former lack of support for path expressions was the most common reason for having to use joins at all. 

2. Use plain SQL queries like that:

   ```js
   await db.run(`SELECT from ${Books} join ${Authors} ...`)
   ```

3. Use helper views modelled in CDS, which still supports all complex UNIONs and JOINs, then use this view via `cds.ql`.





### Fixed Localized Data

Formerly, when reading data using cds.ql, it *always* returned localized data. For example: 

```js
SELECT.from(Books)       // always read from localized.Books instead
```

This was not only wrong, but also expensive. Localized data is an application layer concept. Database services should return, what was asked for, nothing else. → Use [*Localized Queries*](#localized-queries) if you really want to read localized data from the database:

```js
SELECT.localized(Books)  // reads localized data
SELECT.from(Books)       // reads plain data
```

::: details No changes to app services behaviour

Generic application service handlers use *SELECT.localized* to request localized data from the database. Hence, CAP services automatically serve localized data as before. 

:::





### New Streaming API

New STREAM event, ...



### Skipped BLOBs 

Formerly `LargeBinary` elements, aka BLOBs, always got served as any other column. Now they are skipped from _SELECT *_ queries. Yet, you can still enforce reading them by explicitly selecting them. 

For example:

```js
SELECT.from(Books)          //> [{ ID, title, ..., image }] // [!code --]
SELECT.from(Books)          //> [{ ID, title, ... }]
SELECT('image').from(Books) //> [{ image }]
```

BLOBs hold potentially large amounts of data, so they should rather be streamed than read like that. Another reason to refrain from using the explicit read is that some databases don't support that.



### Skipped Virtuals

In contrast to former behaviour, new database services ignore all virtual elements and hence don't add them to result set entries. Selecting only virtual elements in a query leads to an error. 

::: details Reasoning...

Virtual elements are meant to be calculated and filled in by custom handlers of your application services. Nevertheless, the old database services always returned `null`, or specified `default` values, for virtual elements. This behavior was removed, as it provides little value, if at all.

:::

For example given that definition:

```cds
entity Foo { 
  virtual foo : Integer;
  bar : Integer;
}
```

Behavior changed like that:

```js
SELECT.from('Foo')         //> [{ foo:1, bar:null }, ...] // [!code --]
SELECT.from('Foo')         //> [{ foo:1 }, ...] 
SELECT('bar').from('Foo')  //> ERROR: no columns to read 
```

### Miscellaneous

- Only `$now` and `$user` are supported as values for `@cds.on.insert/update`.
- CQNs with subqueries require table aliases to refer to elements of outer queries.
- CQNs with an empty columns array now throws an error.
- Column names in CSVs must map to physical column names:

```csvc
ID;title;author_ID;currency_code // [!code ++] 
ID;title;author.ID;currency.code // [!code --] 
```



### Adopt Lean Draft

As mentioned [above](#using-lean-draft), we eliminated all draft handling from new database service implementations, and instead implemented draft in a modular, non-intrusive, and optimized way — called *'Lean Draft'*. 

When using the new service the new `cds.fiori.lean_draft` mode is automatically switched on. You may additionally switch on `cds.fiori.draft_compat` in case you run into problems. 

More detailed documentation for that will follow soon. 





### Finalizing Migration

When you finished migration remove the old [*sqlite3* driver](https://www.npmjs.com/package/sqlite3) :

```sh
npm rm sqlite3
```

And activate the new one as cds-plugin:

```sh
npm add @cap-js/sqlite --save
```



## SQLite in Production?

As stated in the beginning, SQLite is mostly intended to speed up development, not for production. This is not because of limited warranties or lack of support, it's only because of suitability. A major criterion is this: 

Cloud applications usually are served by server clusters, in which each server is connected to a shared database. SQLite could only be used in such setups with the persistent database file accessed through a network file system; but this is rarely available and slow. Hence an enterprise client-server database is the better choice for that. 

Having said this, there can indeed be scenarios where SQLite might be used also in production, such as using SQLite as in-memory caches. → [Find a detailed list of criteria on the sqlite.org website](https://www.sqlite.org/whentouse.html).
