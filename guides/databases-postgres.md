---
status: released
---

# Using PostgreSQL



This guide focuses on the new PostgreSQL Service provided through *[@cap-js/postgres](https://www.npmjs.com/package/@cap-js/postgres)*, which is based on the same new database services architecture than the new [SQLite Service](databases-sqlite). This architecture brings significantly enhanced feature sets and feature parity, as documented in the [*Features* section of the SQLite guide](databases-sqlite#features). 

*Learn about migrating from the former `cds-pg` in the [Migration](#migration) chapter below.*{.learn-more}

[[toc]]



## Setup & Configuration

Run this to use [PostgreSQL](https://www.postgresql.org/) for production:

```sh
npm add @cap-js/postgres
```

### Auto-wired Configuration

The `@cap-js/postgres` packages uses `cds-plugin` technique to auto-configure your application to use a PostgreSQL database for production.

You can inspect the effective configuration using `cds env`:

```sh
cds env requires.db --for production
```

Output:

```js
{
  impl: '@cap-js/postgres',
  dialect: 'postgres',
  kind: 'postgres'
}
```

[See also the general information on installing database packages](databases#setup-configuration){.learn-more}



### Using Docker

You can use Docker to run a PostgreSQL database locally. Do so as follows... 

1. Install and run [Docker Desktop](https://www.docker.com)

2. Create a file like that: 
   ::: code-group

   ```yaml [pg.yml]
   services:
     db:
       image: postgres:alpine
       environment: { POSTGRES_PASSWORD: postgres }
       ports: [ '5432:5432' ]
       restart: always
   ```

   :::

3. Create and run the docker container:

   ```sh
   docker-compose -f pg.yml up -d
   ```

   



### Service Bindings

In the cloud, use given techiques to bind a cloud-based instance of PostgreSQL to your application. 

For local development provide the credentials via a suitable [`cds env`](../node.js/cds-env) technique, like one of the following...



#### Using defaults with `[pg]` profile

The `@cds-js/postgres` comes with default credentials under profile `[pg]` that match the defaults used in the [docker setup above](#using-docker). So, in case you sticked to these defaults you can skip the next sections and just go ahead, deploy your database:

```sh
cds deploy --profile pg
```

and run your application:

```sh
cds watch --profile pg
```

Learn more about that in the [Deployment](#deployment) chapter below.



#### In your private `~/.cdsrc.json`

Add it to your private `~/.cdsrc.json` if you want to use these credentials on your local machine only: 

::: code-group

```json [~/.cdsrc.json]
{
  "requires": {
    "db": {
      "[pg]": {
        "kind": "postgres",
        "credentials": {
          "host": "localhost", "port": 5432,
          "user": "postgres",
          "password": "postgres",
          "database": "postgres"
        }
      }
    }
  }
}
```

:::

#### In project `.env` files

Alternatively, use a `.env` file in jour project's root folder if you want to share the same credentials with your team mates: 

::: code-group

```properties [.env]
cds.requires.db.[pg].kind = postgres
cds.requires.db.[pg].credentials.host = localhost
cds.requires.db.[pg].credentials.port = 5432
cds.requires.db.[pg].credentials.user = postgres
cds.requires.db.[pg].credentials.password = postgres
cds.requires.db.[pg].credentials.database = postgres
```

:::

::: tip Using Profiles

The configuration examples above use the [`cds.env` profile](../node.js/cds-env#profiles) `[pg]` to allow to selectively test with PostgreSQL databases from the command line like so:

```sh
cds watch --profile pg
```

The profile name can be freely chosen, of course.

:::



## Deployment

### Using `cds deploy` 

Deploy your database as usual with that:

```sh
cds deploy
```

Or with that if you used profile `[pg]` as introduced in the setup chapter above:

```sh
cds deploy --profile pg
```



### With Deployer App

When deploying to cloud foundry, this can be accomplished by providing a simple deployer app, which you can construct as follows...

1. Create a new folder named `gen/pg`:
   ```sh
   mkdir -p gen/pg
   ```

2. Generate a pre-compiled cds model:
   ```sh
   cds compile '*' > gen/pg/csn.json
   ```

3. Add required `.csv` files, for example:
   ```sh
   cp -r db/data gen/pg
   ```

4. Add a *package.json* to `gen/pg` with this content:
   ::: code-group
   ```json [gen/pg/package.json]
   { 
     "dependencies": {
       "@sap/cds": "*"
     },
     "scripts": {
       "start": "cds-deploy"
     }
   }
   ```
   :::
   > **Note the dash in `cds-deploy`**, which is required as we don't use `@cds-dk` for deployment and runtime, so the `cds` CLI executable is not available. 

5. Finally, package and deploy that, for example using [MTA-based deployment](deployment/to-cf#build-mta). 




## Schema Evolution

When re-deploying after you made changes to your CDS models, like adding fields, automatic schema evolution is applied. Whenever you  run `cds deploy` (or `cds-deploy`) it executes these steps:

1. Read a CSN of a former deployment from table `cds_model`.
2. Calculate the **delta** to current model.
3. Generate and run SQL DDL statements with:
   - `CREATE TABLE` statements for new entities
   - `CREATE VIEW` statements for new views
   - `ALTER TABLE` statements for entities with new or changed elements
   - `DROP & CREATE VIEW` statements for views affected by changed entities
4. Fill in initial data from provided _.csv_ files using `UPSERT` commands.
5. Store a CSN representation of the current model in `cds_model`.

> You can switch of automatic schema evolution, if necessary,  by setting `cds.requires.db.schema_evolution = false`.



### Limitations

Automatic schema evolution only allows changes without potential data loss.

#### Allowed{.good}

- Adding entities and elements
- Increasing the length of Strings
- Increasing the size of Integers

#### Disallowed{.bad}

- Removing entities or elements
- Changes to primary keys
- All other type changes

For example the following type changes are allowed:

```cds
entity Foo {
   anInteger : Int64;     // from former: Int32
   aString : String(22);  // from former: String(11)
}
```

::: tip

If you need to apply such disallowed changes during development, just drop and recreate your database, e.g. by killing it in docke an re-create it using the `docker-compose` command as [documented above](#using-docker).

:::



### Dry-Run Offline

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
      bar : String;                  //> add a new element
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
   ALTER TABLE sap_capire_bookshop_Books ALTER title TYPE VARCHAR(222);
   ALTER TABLE sap_capire_bookshop_Books_texts ALTER title TYPE VARCHAR(222);
   ALTER TABLE sap_capire_bookshop_Books ADD foo_ID VARCHAR(36);
   ALTER TABLE sap_capire_bookshop_Books ADD bar VARCHAR(255);
   
   -- Create New Tables
   CREATE TABLE sap_capire_bookshop_Foo (
     ID VARCHAR(36) NOT NULL,
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

   > **Note:** In case of SQLite, ALTER TYPE commands are neither necessary nor supported, as SQLite is essentially typeless.





## Migration

Thanks to CAP's database-agnostic cds.ql API, we are confident that the new PostgreSQL servcie comes without breaking changes. Nevertheless, please check the instructions in the [SQLite Migration guide](databases-sqlite#migration), with by and large applies also to the new PostgreSQL service.

### `cds deploy --model-only`

Not a breaking change, but definitely required to migrate former `cds-pg` databases, is to prepare it for schema evolution. 

To do so run `cds deploy` once with the `--model-only` flag:

```sh
cds deploy --model-only
```

This will...:

- Create the `cds_model` table in your database
- Fill it with the current model obtained through `cds compile '*'` 

::: warning IMPORTANT:

Your `.cds` models are expexcted to reflect the deployed state of your database.

:::

### With Deployer App

When you have a SaaS application, upgrade all your tenants using the [deployer app](#with-deployer-app) with CLI option `--model-only` added to the start script command of your *package.json*. After having done that, don't forget to remove the `--model-only` option from the start script, to activate actual schema evolution.



## MTX Support

... to come soon.
