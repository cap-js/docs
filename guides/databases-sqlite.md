---
status: released
---

# Use SQLite for Development {#sqlite}



## Setup & Configuration

Run this to use SQLite during development:

```sh
npm add @cap-js/sqlite -D
```



#### Using Legacy SQLite Service

The above refers to the New SQLite Service, available since cds7, which has several advantages over the former one, such as full support for path expressions, and using [`better-sqlite3`](https://www.npmjs.com/package/better-sqlite3). Yet, in case you need to stick to the old implementation, just **don't** install `@cap-js/sqlite` but keep your existing setup instead. 



## With In-memory Databases

Installing `@cap-js/sqlite` as described above automatically configures your application to use an in-memory SQLite database during development. For example, you can see this in the log output when starting your application, with `cds watch`:

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





## With Persistent Databases



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

With that in place, when you start your server, it will use this prepared database, instead of bootstrapping and in-memory database:

```sh
...
[cds] - connect to db > sqlite { url: 'db.sqlite' }
...
```

::: warning 

Remember to always re-deploy your database whenever you made changes to your models or your data. Just run `cds deploy` again, without any parameters to do so. 

:::



## With Schema Evolution

When running `cds deploy` repeatedly it will **drop-create** all tables and views. This is appropriate for during development, but not for database upgrades in production, as all customer data would be lost.

To avoid this `cds deploy` also supports automatic schema evolution, which you can use as follows...

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
   - `DROP & CREATE VIEW` statements for views on changed entities
4. Fill in initial data from provided `.csv` files using `UPSERT` commands
5. Store a CSN representation of the current model in `cds_model`


#### Limitations

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
