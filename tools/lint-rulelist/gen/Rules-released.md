

## assoc2many-ambiguous-key
<span class='shifted label'>Model Validation</span>

### Rule Details
Ambiguous key with a `TO MANY` relationship since entries could appear multiple times with the same key.

### Examples
<span>✔️&nbsp;&nbsp; Example of <span style="color:green">correct</span> code for this rule:</span>

<pre><code>entity Books {
  key ID: UUID;
  author: Association to Author;
};

entity Author {
  key ID: UUID;
  books: Association to many Books on books.author = $self;
}</code></pre>

<span>❌&nbsp;&nbsp; Example of <span style="color:red">incorrect</span> code for this rule:</span>

<pre><code>entity Books {
  key ID: UUID;
  author: Association to Author;
};

entity Author {
  key ID: UUID;
  books: Association to many Books on books.author = $self;
}

view AuthorView as select from Author {
  key <span style="display:inline-block; position:relative; color:red; border-bottom:2pt dotted red" title="Ambiguous key in 'AuthorView'. Element 'bookIDs' leads to multiple entries so that key 'ID' is not unique."><b><i>ID</i></b></span>,
  books.ID as bookIDs
};</code></pre>

### Version
This rule was introduced in `@sap/eslint-plugin-cds 1.0.1`.








---

## auth-no-empty-restrictions
<span class='shifted label'>Model Validation</span>

### Rule Details
`@restrict` and `@requires` must not be empty.

### Examples
<span>✔️&nbsp;&nbsp; Example of <span style="color:green">correct</span> code for this rule:</span>

<pre><code>namespace db;

entity Books @(restrict: [
  { grant: 'READ', to: 'Buyer' },
]) {
    Name: String;
}

service BuyerService @(requires: 'authenticated-user'){
    entity Books @(restrict: [
    { grant: '*', to: 'Admin'}
  ]) as projection on db.Books;
}</code></pre>

<span>❌&nbsp;&nbsp; Example of <span style="color:red">incorrect</span> code for this rule:</span>

<pre><code>namespace db;

entity Books @(restrict: [
  { grant: 'READ', to: 'Buyer' },
]) {
    Name: String;
}

service <span style="display:inline-block; position:relative; color:red; border-bottom:2pt dotted red" title="No explicit restrictions provided on service `db.BuyerService` at `@requires`."><b><i>BuyerService</i></b></span> @(requires: ''){
    entity <span style="display:inline-block; position:relative; color:red; border-bottom:2pt dotted red" title="No explicit restrictions provided on entity `db.BuyerService.Books` at `@restrict`."><b><i>Books</i></b></span> @(restrict: '') as projection on db.Books;}
}

service <span style="display:inline-block; position:relative; color:red; border-bottom:2pt dotted red" title="No explicit restrictions provided on service `db.AnotherService` at `@requires`."><b><i>AnotherService</i></b></span> @(requires: []){
    entity <span style="display:inline-block; position:relative; color:red; border-bottom:2pt dotted red" title="No explicit restrictions provided on entity `db.AnotherService.Books` at `@restrict`."><b><i>Books</i></b></span> @(restrict: []) as projection on db.Books;
}</code></pre>

### Version
This rule was introduced in `@sap/eslint-plugin-cds 2.4.1`.








---

## auth-use-requires
<span class='shifted label'>Model Validation</span>

### Rule Details
Use `@requires` instead of `@restrict.to` in actions and services with unrestricted events.

### Examples
<span>✔️&nbsp;&nbsp; Example of <span style="color:green">correct</span> code for this rule:</span>

<pre><code>service CatalogService @(requires: 'Admin'){  
  entity Products {
      ID: Integer;
  }
  actions {
    @(requires: 'Admin')
    action addRating (stars: Integer);
  }
  function getViewsCount @(requires: 'Admin') () returns Integer;
}</code></pre>

<span>❌&nbsp;&nbsp; Example of <span style="color:red">incorrect</span> code for this rule:</span>

<pre><code>service CatalogService @(restrict: [{to: 'Admin'}]) {
  entity Products {
      ID: Integer;
  }
  actions {
    @restrict: [{grant:'*', to: 'Admin'}]
    action <span style="display:inline-block; position:relative; color:red; border-bottom:2pt dotted red" title="Use `@requires` instead of `@restrict.to` at action `addRating`."><b><i>addRating</i></b></span> (stars: Integer);
  }
  function getViewsCount @(restrict: [{ to: 'Admin' }]) () returns Integer;
}</code></pre>

### Version
This rule was introduced in `@sap/eslint-plugin-cds 2.4.1`.








---

## auth-valid-restrict-grant
<span class='shifted label'>Model Validation</span>

### Rule Details
`@restrict.grant` must have valid values.

### Examples
<span>✔️&nbsp;&nbsp; Example of <span style="color:green">correct</span> code for this rule:</span>

<pre><code>entity Products @(restrict : [{
  grant   : 'READ',
}]) {
  Name : String;
}

entity Orders @(restrict : [{
  grant   : ['READ', 'WRITE'],
}]) {
  Name : String;
}

entity Books @(restrict : [{
  grant   : ['*'],
}]) {
  Name : String;
}

entity Shops @(restrict : [{
  grant   : ['any'],
}]) {
  Name : String;
}</code></pre>

<span>❌&nbsp;&nbsp; Example of <span style="color:red">incorrect</span> code for this rule:</span>

<pre><code>entity <span style="display:inline-block; position:relative; color:red; border-bottom:2pt dotted red" title="Missing event/action on Products for `@restrict.grant`."><b><i>Products</i></b></span> @(restrict : [{  grant   : '',
}]) {
  Name : String;
}
  grant   : '',
}]) {
  Name : String;
}

entity <span style="display:inline-block; position:relative; color:red; border-bottom:2pt dotted red" title="Missing event/action on Orders for `@restrict.grant`."><b><i>Orders</i></b></span> @(restrict : [{  grant   : [],
}]) {
  Name : String;
}
  grant   : [],
}]) {
  Name : String;
}

entity <span style="display:inline-block; position:relative; color:red; border-bottom:2pt dotted red" title="Invalid item 'read'. Did you mean 'READ'?
Invalid item '[read]'. Did you mean '[`WRITE`]'?
Invalid item '[read]'. Did you mean '[`WRITE`]'?"><b><i>MoreBooks</i></b></span> @(restrict : [{  grant   : ['read'],
}]) {
  Name : String;
}
  grant   : ['read'],
}]) {
  Name : String;
}

entity <span style="display:inline-block; position:relative; color:red; border-bottom:2pt dotted red" title="Invalid item 'REAAD'. Did you mean 'READ'?"><b><i>MoreProducts</i></b></span> @(restrict : [{  grant   : 'REAAD',
}]) {
  Name : String;
}
  grant   : 'REAAD',
}]) {
  Name : String;
}

entity <span style="display:inline-block; position:relative; color:red; border-bottom:2pt dotted red" title="Invalid item '[READ,*]'. Did you mean '[`*`]'?"><b><i>EvenMoreProducts</i></b></span> @(restrict : [{  grant   : ['READ', '*'],
}]) {
  Name : String;
}
  grant   : ['READ', '*'],
}]) {
  Name : String;
}

entity <span style="display:inline-block; position:relative; color:red; border-bottom:2pt dotted red" title="Invalid item 'wriite'. Did you mean 'WRITE'?"><b><i>MoreOrders</i></b></span> @(restrict : [{
  grant   : ['READ', 'wriite'],
}]) {
  Name : String;
}

entity EvenMoreOrders @(restrict : [{
  grant   : ['CREATE', 'UPDATE', 'DELETE', 'INSERT', 'UPSERT', 'WRITE'],
}]) {
  Name : String;
}</code></pre>

### Version
This rule was introduced in `@sap/eslint-plugin-cds 2.4.1`.








---

## auth-valid-restrict-keys
<span class='shifted label'>Model Validation</span>

### Rule Details
`@restrict` must have properly spelled `to`, `grant`, and `where` keys.

### Examples
<span>✔️&nbsp;&nbsp; Example of <span style="color:green">correct</span> code for this rule:</span>

<pre><code>entity Products @(restrict : [{
  grant : 'READ',
  to    : 'Vendor',
  where : 'CreatedBy = $user'
}]) {
  Name : String;
}</code></pre>

<span>❌&nbsp;&nbsp; Example of <span style="color:red">incorrect</span> code for this rule:</span>

<pre><code>entity <span style="display:inline-block; position:relative; color:red; border-bottom:2pt dotted red" title="Misspelled key 'grrant'. Did you mean 'grant'?
Misspelled key 'too'. Did you mean 'to'?
Misspelled key 'wheree'. Did you mean 'where'?
Misspelled key 'too'. Did you mean 'to'?
Misspelled key 'wheree'. Did you mean 'where'?"><b><i>Products</i></b></span> @(restrict : [{
  grrant : 'READ',
  too    : 'Vendor',
  wheree : 'CreatedBy = $user'
}]) {
  Name : String;
}</code></pre>

### Version
This rule was introduced in `@sap/eslint-plugin-cds 2.4.1`.








---

## auth-valid-restrict-to
<span class='shifted label'>Model Validation</span>

### Rule Details
`@restrict.to` must have valid values.

### Examples
<span>✔️&nbsp;&nbsp; Example of <span style="color:green">correct</span> code for this rule:</span>

<pre><code>entity Products @(restrict : [{
  to   : 'authenticated-user',
}]) {
  Name : String;
}

entity Orders @(restrict : [{
  to   : ['authenticated-user', 'system-user'],
}]) {
  Name : String;
}</code></pre>

<span>❌&nbsp;&nbsp; Example of <span style="color:red">incorrect</span> code for this rule:</span>

<pre><code>entity <span style="display:inline-block; position:relative; color:red; border-bottom:2pt dotted red" title="Missing role on Products for `@restrict.to`."><b><i>Products</i></b></span> @(restrict : [{  to   : '',
}]) {
  Name : String;
}
  to   : '',
}]) {
  Name : String;
}

entity <span style="display:inline-block; position:relative; color:red; border-bottom:2pt dotted red" title="Missing roles on Orders for `@restrict.to`."><b><i>Orders</i></b></span> @(restrict : [{  to   : [],
}]) {
  Name : String;
}
  to   : [],
}]) {
  Name : String;
}

entity <span style="display:inline-block; position:relative; color:red; border-bottom:2pt dotted red" title="Invalid item '[authenticated-user,any]'. Did you mean '[`any`]'?"><b><i>Books</i></b></span> @(restrict : [{  to   : ['authenticated-user', 'any'],
}]) {
  Name : String;
}  to   : ['authenticated-user', 'any'],
}]) {
  Name : String;
}
entity <span style="display:inline-block; position:relative; color:red; border-bottom:2pt dotted red" title="Invalid item 'authenticated-usr'. Did you mean 'authenticated-user'?"><b><i>MoreProducts</i></b></span> @(restrict : [{
  to   : 'authenticated-usr',
}]) {
  Name : String;
}

entity MoreOrders @(restrict : [{
  to   : ['authenticated-user', 'anonymous'],
}]) {
  Name : String;
}

service CustomerService @(requires: 'authenticated-user') {
  entity Products @(restrict: [
    { grant: 'READ' },
    { grant: 'WRITE', to: 'Vendor' },
    { grant: 'addRating', to: 'Customer'}
  ]) {/*...*/}
  actions {
     action addRating (stars: Integer);
  }
  entity Orders @(restrict: [
    { grant: '*', to: 'Customer', where: 'CreatedBy = $user' }
  ]) {/*...*/}
  action monthlyBalance @(requires: 'Vendor') ();
}</code></pre>

### Version
This rule was introduced in `@sap/eslint-plugin-cds 2.4.1`.








---

## auth-valid-restrict-where
<span class='shifted label'>Model Validation</span>

### Rule Details
`@restrict.where` must have valid values.

### Examples
<span>✔️&nbsp;&nbsp; Example of <span style="color:green">correct</span> code for this rule:</span>

<pre><code>entity Products @(restrict : [{
  grant : '*',
  to    : 'Customer',
  where : 'CreatedBy = $user'
}]) {
  Name : String;
}</code></pre>

<span>❌&nbsp;&nbsp; Example of <span style="color:red">incorrect</span> code for this rule:</span>

<pre><code>entity <span style="display:inline-block; position:relative; color:red; border-bottom:2pt dotted red" title="Invalid `where` expression, CDS compilation failed."><b><i>Products</i></b></span> @(restrict : [{
  grant : '*',
  to    : 'Customer',
  where : 'CreatedBy === $user'
}]) {
  Name : String;
}</code></pre>

### Version
This rule was introduced in `@sap/eslint-plugin-cds 2.4.1`.








---

## extension-restrictions
<span class='shifted label'>Model Validation</span>

### Rule Details
Extensions must not violate restrictions set by the extended SaaS app.

### Examples
<span>✔️&nbsp;&nbsp; Example of <span style="color:green">correct</span> code for this rule:</span>

<pre><code>using { sap.capire.orders, OrdersService, sap.common } from 'base-app';

namespace x_bookshop.extension;

extend orders.Orders with {
  x_priority    : String;
  x_SalesRegion : Association to x_SalesRegion;
}

entity x_SalesRegion: common.CodeList {
  key regionCode : String(11);
}</code></pre>

<span>❌&nbsp;&nbsp; Example of <span style="color:red">incorrect</span> code for this rule:</span>

<pre><code>using { sap.capire.orders, OrdersService, sap.common } from 'base-app';

namespace x_bookshop.extension;

extend orders.Orders with {
  x_priority    : String;
  x_SalesRegion : Association to x_SalesRegion;
  <span style="display:inline-block; position:relative; color:red; border-bottom:2pt dotted red" title="/start with.*x_/i"><b><i>other</i></b></span>         : String;}

extend service OrdersService with {}

extend service OrdersService with {
  entity <span style="display:inline-block; position:relative; color:red; border-bottom:2pt dotted red" title="/limit.*OrdersService/i"><b><i>x_SalesRegion</i></b></span> as projection on extension.x_SalesRegion;}

@sql.append: 'foo'}

@sql.append: 'foo'
entity <span style="display:inline-block; position:relative; color:red; border-bottom:2pt dotted red" title="/annotation.*@sql\.append/i"><b><i>x_SalesRegion</i></b></span>: common.CodeList {
  key regionCode : String(11);
}</code></pre>

### Version
This rule was introduced in `@sap/eslint-plugin-cds 2.6.0`.








---

## latest-cds-version
<span class='shifted label'>Environment</span>

### Rule Details
Checks whether the latest `@sap/cds` version is being used.

### Examples
<span>✔️&nbsp;&nbsp; Example of <span style="color:green">correct</span> code for this rule:</span>

<pre><code>{
    "@sap/cds": {
        "current": "5.1.0",
        "wanted": "5.1.0",
        "latest": "5.1.0",
        "location": "node_modules\\@sap\\cds"
    }
}</code></pre>

<span>❌&nbsp;&nbsp; Example of <span style="color:red">incorrect</span> code for this rule:</span>

<pre><code>{
    "@sap/cds": {
        "current": "5.0.6",
        "wanted": "5.1.0",
        "latest": "5.1.0",
        "location": "node_modules\\@sap\\cds"
    }
}</code></pre>

### Version
This rule was introduced in `@sap/eslint-plugin-cds 1.0.4`.








---

## min-node-version
<span class='shifted label'>Environment</span>

### Rule Details
Checks whether the minimum Node.js version required by `@sap/cds` is achieved.

### Examples
<span>✔️&nbsp;&nbsp; Example of <span style="color:green">correct</span> code for this rule:</span>

<pre><code>{
    "nodeVersion": "v14.0.0",
    "nodeVersionCDS": ">=12"
}</code></pre>

<span>❌&nbsp;&nbsp; Example of <span style="color:red">incorrect</span> code for this rule:</span>

<pre><code>{
    "nodeVersion": "v10.0.0",
    "nodeVersionCDS": ">=12"
}</code></pre>

### Version
This rule was introduced in `@sap/eslint-plugin-cds 1.0.0`.








---

## no-db-keywords
<span class='shifted label'>Model Validation</span>

### Rule Details
Avoid using reserved SQL keywords.

### Examples
<span>✔️&nbsp;&nbsp; Example of <span style="color:green">correct</span> code for this rule:</span>

<pre><code>@cds.persistence.skip
entity GROUP {}

entity Orders {}</code></pre>

<span>❌&nbsp;&nbsp; Example of <span style="color:red">incorrect</span> code for this rule:</span>

<pre><code>entity <span style="display:inline-block; position:relative; color:red; border-bottom:2pt dotted red" title="'GROUP' is a reserved keyword in SQL"><b><i>GROUP</i></b></span> {}
entity <span style="display:inline-block; position:relative; color:red; border-bottom:2pt dotted red" title="'Order' is a reserved keyword in SQL"><b><i>Order</i></b></span> {}</code></pre>

### Version
This rule was introduced in `@sap/eslint-plugin-cds 2.1.0`.








---

## no-dollar-prefixed-names
<span class='shifted label'>Model Validation</span>

### Rule Details
Names must not start with $ to avoid possible shadowing of reserved variables.

### Examples
<span>✔️&nbsp;&nbsp; Example of <span style="color:green">correct</span> code for this rule:</span>

<pre><code>entity Book {
    title: String;
    pages: Integer;
    pricein$: Integer;
}

entity Order {
    name: String;
}</code></pre>

<span>❌&nbsp;&nbsp; Example of <span style="color:red">incorrect</span> code for this rule:</span>

<pre><code>entity Book {
    title: String;
    <span style="display:inline-block; position:relative; color:red; border-bottom:2pt dotted red" title="'$pages' is prefixed with a dollar sign ($)"><b><i>$pages</i></b></span>: Integer;
}

entity $self {
  key id : String;
}
view V as select from $self {
  $self.id
};</code></pre>

### Version
This rule was introduced in `@sap/eslint-plugin-cds 2.3.3`.








---

## no-join-on-draft
<span class='shifted label'>Model Validation</span>

### Rule Details
Draft-enabled entities shall not be used in views that make use of `JOIN`.

### Examples
<span>✔️&nbsp;&nbsp; Example of <span style="color:green">correct</span> code for this rule:</span>

<pre><code>namespace my;
entity Foo {
  key ID : UUID;
}
entity Bar {
  key ID : UUID;
}
service s {
}</code></pre>

<span>❌&nbsp;&nbsp; Example of <span style="color:red">incorrect</span> code for this rule:</span>

<pre><code>namespace my;
entity Foo {
  key ID : UUID;
}
entity Bar {
  key ID : UUID;
}
service s {
  @odata.draft.enabled
  entity Foo as projection on my.Foo;
  @odata.draft.enabled
  entity Bar as projection on my.Bar;
  entity <span style="display:inline-block; position:relative; color:red; border-bottom:2pt dotted red" title="Do not use draft-enabled entities in views that make use of `JOIN`."><b><i>FooBar</i></b></span> as select Foo.ID from Foo CROSS JOIN Bar;
}</code></pre>

### Version
This rule was introduced in `@sap/eslint-plugin-cds 2.2.1`.








---

## require-2many-oncond
<span class='shifted label'>Model Validation</span>

### Rule Details
Foreign key information of a `TO MANY` relationship must be defined within the target and specified in an `ON` condition.

### Examples
<span>✔️&nbsp;&nbsp; Example of <span style="color:green">correct</span> code for this rule:</span>

<pre><code>entity Authors {
  key ID: UUID;
  books : Association to many Books on books.author = $self;
}
entity Books {
  key ID: UUID;
  author : Association to Authors;
}</code></pre>

<span>❌&nbsp;&nbsp; Example of <span style="color:red">incorrect</span> code for this rule:</span>

<pre><code>entity Authors {
  key ID: UUID;
  <span style="display:inline-block; position:relative; color:red; border-bottom:2pt dotted red" title="You must provide an `ON` condition for `TO MANY` relationship 'books'."><b><i>books</i></b></span> : Association to many Books;
}
entity Books {
  key ID: UUID;
  author : Association to Authors;
}</code></pre>

### Version
This rule was introduced in `@sap/eslint-plugin-cds 2.1.0`.








---

## sql-cast-suggestion
<span class='shifted label'>Model Validation</span>

### Rule Details
Should make suggestions for possible missing SQL casts.

### Examples
<span>✔️&nbsp;&nbsp; Example of <span style="color:green">correct</span> code for this rule:</span>

<pre><code>entity Employees {
  key ID : UUID;
  firstname : String;
  lastname : String;
}
entity ListOfEmployees as SELECT from Employees {
  *, ID,
  1 as one : Integer,
  firstname || lastname as name1 : String,
  cast (firstname || lastname as String) as name2,
  cast (firstname || lastname as String) as name3 : String,
};</code></pre>

<span>❌&nbsp;&nbsp; Example of <span style="color:red">incorrect</span> code for this rule:</span>

<pre><code>entity Employees {
    key ID : UUID;
    firstname : String;
    lastname : String;
  }
  entity ListOfEmployees as SELECT from Employees {
    *, ID,
    1 as one : Integer,
    firstname || lastname as name1 : String,
    cast (firstname || lastname as String) as name2,
    cast (firstname || lastname as String) as name3 : String,
  };
  entity <span style="display:inline-block; position:relative; color:red; border-bottom:2pt dotted red" title="Potential issue - Missing SQL cast for column expression?
Potential issue - Missing SQL cast for column expression?
Potential issue - Missing SQL cast for column expression?"><b><i>ListOfEmployees2</i></b></span> as (
    SELECT from Employees {
      firstname || lastname as name1 : String,
    }
  ) UNION (
    SELECT from Employees {
      firstname || lastname as name1 : String,
    }
  );</code></pre>

### Version
This rule was introduced in `@sap/eslint-plugin-cds 1.0.8`.








---

## start-elements-lowercase
<span class='shifted label'>Model Validation</span>

### Rule Details
Regular element names should start with lowercase letters.

### Examples
<span>✔️&nbsp;&nbsp; Example of <span style="color:green">correct</span> code for this rule:</span>

<pre><code>entity Books {
  key ID: UUID;
  title: localized String(1111);
};</code></pre>

<span>❌&nbsp;&nbsp; Example of <span style="color:red">incorrect</span> code for this rule:</span>

<pre><code>entity Books {
  key ID: UUID;
  <span style="display:inline-block; position:relative; color:red; border-bottom:2pt dotted red" title="Element name 'Books.Title' should start with a lowercase letter."><b><i>Title</i></b></span>: localized String(1111);
};</code></pre>

### Version
This rule was introduced in `@sap/eslint-plugin-cds 1.0.4`.








---

## start-entities-uppercase
<span class='shifted label'>Model Validation</span>

### Rule Details
Regular entity names should start with uppercase letters.

### Examples
<span>✔️&nbsp;&nbsp; Example of <span style="color:green">correct</span> code for this rule:</span>

<pre><code>entity Books {
  key ID: UUID;
  title: localized String(1111);
};

event reviewed { book: Books:ID };
action review  ( book: Books:ID );</code></pre>

<span>❌&nbsp;&nbsp; Example of <span style="color:red">incorrect</span> code for this rule:</span>

<pre><code>entity <span style="display:inline-block; position:relative; color:red; border-bottom:2pt dotted red" title="Entity name 'books' should start with an uppercase letter."><b><i>books</i></b></span> {
  key ID: UUID;
  title: localized String(1111);
};</code></pre>

### Version
This rule was introduced in `@sap/eslint-plugin-cds 1.0.4`.








---

## valid-csv-header
<span class='shifted label'>Model Validation</span>

### Rule Details
CSV files for entities must refer to valid element names.

### Examples
<span>✔️&nbsp;&nbsp; Example of <span style="color:green">correct</span> code for this rule:</span>

<pre><code>ID;title;author_ID;stock;price;currency_code
201;Wuthering Heights;101;12;11.11;GBP
207;Jane Eyre;107;11;12.34;GBP</code></pre>

<span>❌&nbsp;&nbsp; Example of <span style="color:red">incorrect</span> code for this rule:</span>

<pre><code><span style="display:inline-block; position:relative; color:red; border-bottom:2pt dotted red" title="Invalid column '_att'. Did you mean 'ID'?"><b><i>_att</i></b></span>;tile;author_ID;stock;price;currency_cod
_att;<span style="display:inline-block; position:relative; color:red; border-bottom:2pt dotted red" title="Invalid column 'tile'. Did you mean 'title'?"><b><i>tile</i></b></span>;author_ID;stock;price;currency_cod
_att;tile;author_ID;stock;price;<span style="display:inline-block; position:relative; color:red; border-bottom:2pt dotted red" title="Invalid column 'currency_cod'. Did you mean 'currency_code'?"><b><i>currency_cod</i></b></span>
201;Wuthering Heights;101;12;11.11;GBP</code></pre>

### Version
This rule was introduced in `@sap/eslint-plugin-cds 2.3.0`.








---

