---
synopsis: >
  This guide provides instructions on how to use databases with CAP applications.
  Out of the box-support is provided for HANA, SQLite, H2, and PostgreSQL.
status: released
uacp: Used as link target from Help Portal at https://help.sap.com/products/BTP/65de2977205c403bbc107264b8eccf4b/e4a7559baf9f4e4394302442745edcd9.html
---


# Using Databases

<div v-html="$frontmatter?.synopsis" />

[[toc]]



## Setup & Configuration



### Adding Database Packages

Following are cds-plugin packages for CAP Node.js runtime that provide support for respective databases:

| Database                       | Package                                                      | Remarks                            |
| ------------------------------ | ------------------------------------------------------------ | ---------------------------------- |
| **[SAP HANA Cloud](databases-hana)**     | [`@sap/cds-hana`](https://www.npmjs.com/package/@sap/cds-hana) | recommended for production         |
| **[SQLite](databases-sqlite)**       | [`@cap-js/sqlite`](https://www.npmjs.com/package/@cap-js/sqlite) | recommended for development        |
| **[PostgreSQL](databases-postgres)** | [`@cap-js/postgres`](https://www.npmjs.com/package/@cap-js/postgres) | maintained by community + CAP team |

> Follow the links above to find specific information for each.

In general, all you need to do is to install one of the database packages, like so:

Using SQLite for development:

```sh
npm add @cap-js/sqlite -D
```

Using HANA for production:

```sh
npm add @sap/cds-hana
```

::: details Prefer `cds add hana` ...

... which also does the equivalent of `npm add @sap/cds-hana` but in addition cares for updating `mta.yaml` and other deployment resources as documented in the [deployment guide](deployment/to-cf#_1-using-sap-hana-database).

:::

### Auto-Wired Configuration

The afore-mentioned packages use `cds-plugin` technique to automatically configure the primary database with `cds.env`. For example if you added sqlite and hana, this will effectively result in this auto-wired configuration:

```json
{"cds":{
  "requires": {
    "db": {
      "[development]": { "kind": "sqlite", "impl": "@cap-js/sqlite", "credentials": { "url": "memory" } },
      "[production]": { "kind": "hana", "impl": "@sap/cds-hana", "deploy-format": "hdbtable" }
    }
  }
}}
```

::: details In contrast to former — that is pre cds7 — setups this means...

1. You don't need to — and should not — add direct dependencies to driver packages, like [`hdb`](https://www.npmjs.com/package/hdb) or [`sqlite3`](https://www.npmjs.com/package/sqlite3) anymore in your *package.json* files.
2. You don't need to configure `cds.requires.db` anymore, unless you want to override defaults brought with the new packages.

:::



### Custom Configuration

The above setups auto-wire things through configuration presets automatically enabled via `cds-plugin` techniques. You can always use the basic configurations for other setups, or to override individual properties as follows:

1. Install a database driver package, e.g.
   ```sh
   npm add @cap-js/sqlite
   ```

   > Add option `-D` if you want this for development only.

2. Configure the primary database as a required service through `cds.requires.db`, for example:

   ```json
   {"cds":{
     "requires": {
       "db": {
         "kind": "sqlite",
         "impl": "@cap-js/sqlite",
         "credentials": {
           "url": "db.sqlite"
         }
       }
     }
   }}
   ```

The config options are as follows:

- `kind` — a name of a preset, like `sql`, `sqlite`, or `hana`
- `impl` — the module name of a CAP database service implementation
- `credentials` — an object with db-specific configurations, most commonly `url`

::: warning

Credentials like `username` and  `password` should **not** be added here but provided through service bindings, for example, via `cds bind`.

:::

::: tip

You can always inspect the effective configuration using the `cds env` CLI command like that:

```sh
cds env cds.requires.db
```
→ prints:

```sh
{
  kind: 'sqlite',
  impl: '@cap-js/sqlite',
  credentials: { url: ':db.sqlite:' }
}
```

:::





## Providing Initial Data



Put CSV files into `db/data` to fill your database with initial data. For example in our [*cap/samples/bookshop*](https://github.com/SAP-samples/cloud-cap-samples/tree/main/bookshop/db/data) application, we do so for *Books*, *Authors* and *Genres* as follows:

```zsh
bookshop/
├─ db/
│ └─ data/ #> place your .csv files here
│ │ ├─ sap.capire.bookshop-Authors.csv
│ │ ├─ sap.capire.bookshop-Books.csv
│ │ ├─ sap.capire.bookshop-Books.texts.csv
│ │ └─ sap.capire.bookshop-Genres.csv
│ └─ schema.cds
└─ ...
```

The **filenames** are expected to match fully-qualified names of respective entitiy definitions in your CDS models, optionally using a dash `-` instead of a dot `.` for cosmetic reasons.

### Using `.csv` Files

The **content** of these files are standard CSV content with the column titles corresponding to declared element names like that:

::: code-group

```csvc [db/data/sap.capire.bookshop-Books.csv]
ID,title,author_ID,stock
201,Wuthering Heights,101,12
207,Jane Eyre,107,11
251,The Raven,150,333
252,Eleonora,150,555
271,Catweazle,170,22
```

:::

> Note: `author_ID` is the generated foreign key for the managed Association  `author`  → lean more about that in the [Generating SQL DDL](#generating-sql-ddl) section below.

If your content contains ...

- commas or line breaks → enclose it in double quotes `"..."`
- double quotes → escape them with doubled double quotes: `""`

```csv
ID,title,descr
252,Eleonora,"""Eleonora"" is a short story by Edgar Allan Poe, first published in 1842 in Philadelphia in the literary annual The Gift. ...
```

::: danger
On SAP HANA, only use CSV files for _configuration data_ that can’t be changed by application users.<br>
See [CSV data gets overridden in the HANA guide for details](databases-hana#csv-data-gets-overridden).
:::



### Use `cds add data`

Run this to generate an initial set of .csv files with column titles fillled in based on your CDS models:

```sh
cds add data
```





### Sample Data

Quite frequently you need to distinguish between sample data and real initial data, and CAP supports that by allowing you to provide initial in two places:

| Location    | Deployed...          | Purpose                                                  |
| ----------- | -------------------- | -------------------------------------------------------- |
| `db/data`   | always               | initial data for configurations, code lists, and similar |
| `test/data` | if not in production | sample data for tests and demos                          |







## Querying at Runtime



Most queries to databases are constructed and executed from [generic event handlers of CRUD requests](providing-services#generic-providers), so quite frequently there's nothing to do. The folloing is for the remaining cases where you have to provide custom logic, and as part of it execute database queries.



### DB-Agnostic Queries

At runtime we usually [construct and execute queries using cds.ql](querying) APIs in a database-agnostic way. For example queries like this are supported for all databases:

```js
SELECT.from (Authors, a => {
  a.ID, a.name, a.books (b => {
    b.ID, b.title
  })
})
.where ({name:{like:'A%'}})
.orderBy ('name')
```



### Native DB Queries

If required you can also use native DB features by passing native SQL queries:

```js
cds.db.run (`SELECT from sqlite_schema where name like ?`, name)
```







## Generating SQL DDL



When you run your server with `cds watch`  during development, an in-memory database is bootstrapped automatically, with SQL DDL statements generated based on your CDS models automatically. You can also do this manually with  the CLI command `cds compile --to sql`.

For example, given these CDS models (derivated from [*cap/samples/bookshop*](https://github.com/SAP-samples/cloud-cap-samples/tree/main/bookshop)):

::: code-group

```cds [db/schema.cds]
using { Currency } from '@sap/cds/common';
namespace sap.capire.bookshop;

entity Books {
  key ID : UUID;
  title  : localized String;
  descr  : localized String;
  author : Association to Authors;
  price  : {
    amount   : Decimal;
    currency : Currency;
  }
}

entity Authors {
  key ID : UUID;
  name  : String;
  books : Association to many Books on books.author = $self;
}
```
:::
::: code-group

```cds [srv/cat-service.cds]
using { sap.capire.bookshop as my } from '../db/schema';
service CatalogService {
  entity ListOfBooks as projection on Books {
    *, author.name as author
  }
}
```
:::

### Using `cds compile -2 sql`

We can generate a SQL DDL script by running this in the root directory containing both *.cds* files:

```sh
cds compile srv/cat-service --to sql > ddl.sql
```

Which would generate this output:

::: code-group

```sql [ddl.sql]
CREATE TABLE sap_capire_bookshop_Books (
  ID NVARCHAR(36) NOT NULL,
  title NVARCHAR(5000),
  descr NVARCHAR(5000),
  author_ID NVARCHAR(36),
  price_amount DECIMAL,
  price_currency_code NVARCHAR(3),
  PRIMARY KEY(ID)
);

CREATE TABLE sap_capire_bookshop_Authors (
  ID NVARCHAR(36) NOT NULL,
  name NVARCHAR(5000),
  PRIMARY KEY(ID)
);

CREATE TABLE sap_common_Currencies (
  name NVARCHAR(255),
  descr NVARCHAR(1000),
  code NVARCHAR(3) NOT NULL,
  symbol NVARCHAR(5),
  minorUnit SMALLINT,
  PRIMARY KEY(code)
);

CREATE TABLE sap_capire_bookshop_Books_texts (
  locale NVARCHAR(14) NOT NULL,
  ID NVARCHAR(36) NOT NULL,
  title NVARCHAR(5000),
  descr NVARCHAR(5000),
  PRIMARY KEY(locale, ID)
);

CREATE VIEW CatalogService_ListOfBooks AS SELECT
  Books.ID,
  Books.title,
  Books.descr,
  author.name AS author,
  Books.price_amount,
  Books.price_currency_code
FROM sap_capire_bookshop_Books AS Books
LEFT JOIN sap_capire_bookshop_Authors AS author
ON Books.author_ID = author.ID;

--- some more technical views skipped ...
```

:::



### Rules for generated DDL

A few observations on the generated SQL DDL output:

1. **Tables / Views** — declared entities become tables, projected entities become views
2. **Type Mapping** — [CDS types are mapped to database-specifc SQL types](../cds/types)
3. **Slugified FQNs** — dots in fullly qualified CDS names become underscores in SQL names
4. **Flattened Structs** — structured elements like `Books:price` are flattened with underscores
5. **Generated Foreign Keys** — for managed to-one Associations, foreign key columns are created. For example, this applies to `Books:author`.





In addition, you can use the following annotations to fine-tune generated SQL.



### @cds.persistence.skip

Add  `@cds.persistence.skip` to an entity to indicate that this entity should be skipped from generated DDL scripts, and also no SQL views to be generated on top of it:

```cds
@cds.persistence.skip
entity Foo {...}                 //> No SQL table will be generated
entity Bar as select from Foo;   //> No SQL view will be generated
```



### @cds.persistence.exists

Add  `@cds.persistence.exists` to an entity to indicate that this entity should be skipped from generated DDL scripts. In contrast to `@cds.persistence.skip` a db relation is expected to exist, so we can generate SQL views on top.

```cds
@cds.persistence.exists
entity Foo {...}                 //> No SQL table will be generated
entity Bar as select from Foo;   //> The SQL view will be generated
```

::: details On HANA ...

If the respective entity is user-defined function or a calculation view, one of the annotations `@cds.persistence.udf` or `@cds.persistence.calcview` also needs to be assigned. See [Calculated Views and User-Defined Functions](../advanced/hana#calculated-views-and-user-defined-functions) for more details.

:::



### @cds.persistence.table

Annotate an entity with `@cds.persistence.table` to create a table with the effective signature of the view definition instead of a SQL view.

```cds
@cds.persistence.table
entity Foo as projection on Bar {...}
```

> All parts of the view definition not relevant for the signature (like `where`, `group by`, ...) are ignored.



### @sql.prepend / append {#native-db-clauses}

Use `@sql.prepend` and `@sql.append` to add native SQL clauses to before or after generated SQL output of CDS entities or elements.

For example:

````cds
@sql.append: ```sql
  GROUP TYPE foo
  GROUP SUBTYPE bar
```
entity E { ...,
  @sql.append: 'FUZZY SEARCH INDEX ON'
  text: String(100);
}

@sql.append: 'WITH DDL ONLY'
entity V as select from E { ... };
````

would result in this output:

```sql
CREATE TABLE E ( ...,
  text NVARCHAR(100) FUZZY SEARCH INDEX ON
) GROUP TYPE foo
GROUP SUBTYPE bar;

CREATE VIEW V AS SELECT ... FROM E WITH DDL ONLY;
```

The following rules apply:

- The compiler doesn’t check or process the provided SQL snippets in any way. You are responsible to ensure that the resulting statement is valid and doesn’t negatively impact your database or your application. We don’t provide support for problems caused by using this feature.

- If you refer to a column name in the annotation, you need to take care of
  a potential name mapping yourself, for example, for structured elements.

- Annotation  `@sql.prepend` is only supported for entities translating to tables. It can't be used with views nor with elements.
- For HANA there is an implicit `@sql.prepend:'COLUMN'` which is overwritten by an explicitly provided `@sql.prepend`.

* Both `@sql.prepend` and `@sql.append` are disallowed in SaaS extension projects.

If you use native database clauses in combination with `@cds.persistence.journal`, see [Schema Evolution Support of Native Database Clauses](databases-hana#schema-evolution-native-db-clauses).





### Reserved Words

The CDS compiler and CAP runtimes provide smart quiting for reserved words in SQLite and in SAP HANA so that they can still be used in most situations. But in general reserved words cannot be used as identifiers. The list of reserved words varies per database.

Find here a collection of resources on selected databases and their reference documentation:

* [SAP HANA SQL Reference Guide for SAP HANA Platform (Cloud Version)](https://help.sap.com/docs/HANA_SERVICE_CF/7c78579ce9b14a669c1f3295b0d8ca16/28bcd6af3eb6437892719f7c27a8a285.html)
* [SAP HANA SQL Reference Guide for SAP HANA Cloud](https://help.sap.com/docs/HANA_CLOUD_DATABASE/c1d3f60099654ecfb3fe36ac93c121bb/28bcd6af3eb6437892719f7c27a8a285.html)
* [SQLite Keywords](https://www.sqlite.org/lang_keywords.html)
* [H2 Keywords/Reserved Words](http://www.h2database.com/html/advanced.html#keywords)

[There also reserved words related to SAP Fiori.](../advanced/fiori#reserved-words){.learn-more}





## Database Constraints {#db-constraints}

The information about foreign key relations contained in the associations of CDS models can be used to generate foreign key constraints on the database tables.

Enable generation of foreign key constraints on the database with:

```js
cds.features.assert_integrity = 'db'
```
With that switched on, foreign key constraints are generated for managed to-one associations. For example, given this model:

```cds
entity Books {
  key ID : Integer; ...
  author : Association to Authors;
}
entity Authors {
  key ID : Integer; ...
}
```

The following `Books_author` constraint would be added to table `Books`:

```sql
CREATE TABLE Authors (
  ID INTEGER NOT NULL,  -- primary key referenced by the constraint
  ...,
  PRIMARY KEY(ID)
);
CREATE TABLE Books (
  ID INTEGER NOT NULL,
  author_ID INTEGER,    -- generated foreign key field
  ...,
  PRIMARY KEY(ID),
  CONSTRAINT Books_author //[!code focus]
    FOREIGN KEY(author_ID)  -- link generated foreign key field author_ID ...
    REFERENCES Authors(ID)  -- ... with primary key field ID of table Authors
    ON UPDATE RESTRICT
    ON DELETE RESTRICT
    VALIDATED           -- validate existing entries when constraint is created
    ENFORCED            -- validate changes by insert/update/delete
    INITIALLY DEFERRED  -- validate only at commit
)
```

No constraints are generated for...
* Unmanaged associations or compositions
* To-many associations or compositions
* Associations annotated with `@assert.integrity: false`
* Associations which's source or target entity is annotated with `@cds.persistence.exists` or `@cds.persistence.skip`



If the association is the backlink of a **composition**, the constraint's delete rule changes to `CASCADE`. For example that applies to the `parent` association in here:

```cds
entity Genres {
  key ID   : Integer;
  parent   : Association to Genres;
  children : Composition of many Genres on children.parent = $self;
}
```



::: warning
Database constraints are not intended for checking user input. Instead, they protect
the integrity of your data in the database layer against programming errors. If a constraint violation occurs, the error messages coming from the database aren't standardized by the runtimes but presented as-is.

→ Use [`@assert.target`](providing-services#assert-target) for corresponding input validations.
:::

## Using Native Features  { #native-db-functions}

In general the CDS 2 SQL compiler doesn't 'understand' SQL functions but translates them to SQL generically as long as they follow the standard call syntax of `function(param1, param2)`. This allows you to use native database functions inside your CDS models.

Example:

```cds
entity BookPreview as select from Books {
  IFNULL (descr, title) as shorttext   //> using HANA function IFNULL
};
```

The `OVER` clause for SQL Window Functions is supported, too:

```cds
entity RankedBooks as select from Books {
  name, author,
  rank() over (partition by author order by price) as rank
};
```



#### Using Native Functions with Different DBs { #sqlite-and-hana-functions}

In case of conflicts, follow these steps to provide different models for different databases:

1. Add db-specific schema extensions in db-specific subfolders of `./db`:

   ::: code-group

   ```cds [db/sqlite/index.cds]
   using { AdminService } from '..';
   extend projection AdminService.Authors with {
      strftime('%Y',dateOfDeath)-strftime('%Y',dateOfBirth) as age : Integer
   }
   ```

   ```cds [db/hana/index.cds]
   using { AdminService } from '..';
   extend projection AdminService.Authors with {
      YEARS_BETWEEN(dateOfBirth, dateOfDeath) as age : Integer
   }
   ```

   :::

2. Add profile-specific configuration to your *package.json* to use these db-specific extensions:

   ```json
   { "cds": { "requires": {
     "db": {
      "kind": "sql",
      "[development]": { "model": "db/sqlite" },
      "[production]": { "model": "db/hana" }
    }
   }}}
   ```

CAP samples demonstrate this in [cap/samples/fiori](https://github.com/SAP-samples/cloud-cap-samples/commit/65c8c82f745e0097fab6ca8164a2ede8400da803). <br>
There is also a [code tour](https://github.com/SAP-samples/cloud-cap-samples#code-tours) available for that.
