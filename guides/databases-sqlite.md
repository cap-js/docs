---
status: released
---

# Using SQLite for Development {#sqlite}



CAP provides extensive support for SQLite, which allows projects to speed up development by magnitudes at minimized costs. We strongly recommend to make use of this option during development and testing as much as possible. 

[[toc]]



## Setup & Configuration

Run this to use SQLite during development:

```sh
npm add @cap-js/sqlite -D
```

[See also the general information on installing database packages.](databases#setup-configuration){.learn-more}



## In-memory Databases

Installing `@cap-js/sqlite` as described above automatically configures your application to use an in-memory SQLite database. For example, you can see this in the log output when starting your application, with `cds watch`:

```sh
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

```sh
{
  impl: '@cap-js/sqlite',
  credentials: { url: ':memory:' },
  kind: 'sqlite'
}
```





## Persistent Databases



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

With that in place, when starting the server it will use this prepared database instead of bootstrapping and in-memory one:

```sh
...
[cds] - connect to db > sqlite { url: 'db.sqlite' }
...
```

::: tip

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

   > **Note:** ALTER TYPE commands are neither neccessary nor supported by SQLite, as SQLite is essentially typeless.



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





## SQLite in Production?

As stated in the beginning, SQLite is mostly intended to speed up development, not for production. This is not because of limited warranties or lack of support, it's only because of suitability. A major criterion is this: 

Cloud applications usually are served by server clusters, each server in which is connected to a shared database. SQLite could only be used in such setups with the persistend database file accessed through a network file system; but this is rarely available and slow. Hence an enterprise client-server database is the better choice for that. 

Having said this, there can indeed be scenarios where SQLite might be used also in production, such as using SQLite as in-memory caches. → [Find a detailed list of criteria on the sqlite.org website](https://www.sqlite.org/whentouse.html).



## Legacy SQLite Service

The above refers to the New SQLite Service [@cap-js/sqlite](https://www.npmjs.com/package/@cap-js/sqlite), available since cds7, which has several advantages over the former one, such as:

- full support for CQL path expressions and infix filters
- using the new database services architecture
- using [`better-sqlite3`](https://www.npmjs.com/package/better-sqlite3) driver. 

Yet, in case you need to stick to the old implementation, just **don't** install `@cap-js/sqlite` but keep your existing setup instead, and dependency to [sqlite3](https://www.npmjs.com/package/sqlite3) driver instead.
