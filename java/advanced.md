---
synopsis: >
  Find here an overview of advanced concepts.
status: released
# redirect_from:
# - java/cds4j/static-model
# - java/cds4j/typed-access
# - java/cds4j/datastore
uacp: Used as link target from Help Portal at https://help.sap.com/products/BTP/65de2977205c403bbc107264b8eccf4b/9186ed9ab00842e1a31309ff1be38792.html
---

# Advanced Concepts
<style scoped>
  h1:before {
    content: "Java"; display: block; font-size: 60%; margin: 0 0 .2em;
  }
</style>

{{ $frontmatter.synopsis }}


<!-- #### Content -->
<!--- {% include _chapters toc="2,3" %} -->

## The CDS Data Store Connector {: #cdsdatastoreconnector}

The `CdsDataStoreConnector` is a public API which allows to connect to a [`CdsDataStore`](#cdsdatastore) instance.

CAP Java automatically creates a `CdsDataStoreConnector` that is configured with the [_primary_ data source](./persistence-services#default-persistence-service) and used by the [Persistence Service](./persistence-services).

In order to use CDS models and CDS queries with a _secondary_ data source in CAP Java you need to manually create a CDS Data Store connector. For a [supported](./persistence-services#database-support) JDBC database this is done by the static `CdsDataStoreConnector.createJdbcConnector(...)` method, providing the CDS model, the [transaction manager](https://www.javadoc.io/doc/com.sap.cds/cds4j-api/latest/com/sap/cds/transaction/TransactionManager.html), and a connection supplier or data source.

The transaction manager must reflect the transactional state of the JDBC connections supplied by the connection supplier or data source.

```java
CdsDataStoreConnector jdbcConnector = CdsDataStoreConnector.createJdbcConnector(cdsModel, transactionManager)
    .connection(connectionSupplier).build();

CdsDataStore dataStore = jdbcConnector.connect();
```

Invoking a `connect()` method creates an instance of the Data Store API.

## The CDS Data Store {: #cdsdatastore}

The Data Store API is used to _execute_ CQN statements against the underlying data store (typically a database). It's a technical component that allows to execute [CQL](../cds/cql) statements.
The CDS Data Store is used to implement the [Persistence Service](./consumption-api#persistenceservice), but is also available independent from the CAP Java SDK. So, it's not a service and isn’t based on events and event handlers.

The `CdsDataStore` API is similar to the [`CqnService` API](./query-execution#queries). The only difference is, that the `run` method is called `execute`:

```java
CdsDataStore dataStore = ...;
Select query = Select.from("bookshop.Books").where(b -> b.get("ID").eq(17));
Result result = dataStore.execute(query);
```

Use the `CdsDataStore` API to set user session context information. Utilize the `SessionContext` API which follows a builder pattern, as shown in the following example:

```java
SessionContext sessionContext = SessionContext.create().setUserContext(UserContext.create().setLocale(Locale.US).build()).build());
dataStore.setSessionContext(sessionContext);
```

::: tip
When implementing a CAP application, using the [Persistence Service](./consumption-api#persistenceservice) is preferred over the CDS Data Store.
:::

## Execute Native SQL with Spring's JDBC Template {: #jdbctemplate}

The JDBC template is the Spring API, which in contrast to the CQN APIs allows executing native SQL statements and call stored procedures (alternative to [Native HANA Object](../advanced/hana#create-native-sap-hana-object)). It seamlessly integrates with Spring's transaction and connection management. The following example shows the usage of `JdbcTemplate` in the custom handler of a Spring Boot enabled application. It demonstrates the execution of the stored procedure and native SQL statement.

```java
@Autowired
JdbcTemplate jdbcTemplate;
...

public void setStockForBook(int id, int stock) {
   jdbcTemplate.update("call setStockForBook(?,?)", id, stock);  // Run the stored procedure `setStockForBook(id in number, stock in number)`
}

public int countStock(int id) {
   SqlParameterSource namedParameters = new MapSqlParameterSource().addValue("id", id);
   return jdbcTemplate.queryForObject(
      "SELECT stock FROM Books WHERE id = :id", namedParameters, Integer.class); // Run native SQL
}
```

See [Class JdbcTemplate](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/jdbc/core/JdbcTemplate.html) for more details.


## Using CQL with a Static CDS Model {: #staticmodel}

The static model and accessor interfaces can be generated using the [CDS Maven Plugin](./development/#cds-maven-plugin).

::: warning _❗ Warning_ <!-- {.:warning-title} -->
Currently, the generator doesn't support using reserved [Java keywords](https://docs.oracle.com/javase/specs/jls/se13/html/jls-3.html#jls-3.9) as identifiers in the CDS model. Conflicting element names can be renamed in Java using the [@cds.java.name](./data#renaming-elements-in-java) annotation.
:::

### Static Model in the Query Builder

The [Query Builder API](./query-api) allows you to dynamically create [[CDS Query Language (CQL)]](/cds/cql) queries using entity and element names given as strings:

```java
Select.from("my.bookshop.Books")
  .columns("title")
  .where(book -> book.to("author").get("name").eq("Edgar Allan Poe"));
```

This query is constructed dynamically. It's checked only at runtime that the entity `my.bookshop.Authors` actually exists
and that it has the element `name`.  Moreover, the developer of the query doesn't get any code completion at design time. These disadvantages are avoided by using a static model to construct the query.

#### Model Interfaces

The static model is a set of interfaces that reflects the structure of the CDS model in Java (like element references with their types, associations, etc.) and allow to fluently build queries in a type-safe way. For every entity in the model, the model contains a corresponding `StructuredType` interface, which
represents this type. As an example, for this CDS model the following model interfaces are generated:

CDS model

```cds
namespace my.bookshop;

entity Books {
  key ID : Integer;
  title  : String(111);
  author : Association to Authors;
}

entity Authors {
  key ID : Integer;
  name   : String(111);
  books  : Association to many Books on books.author = $self;
}
```
[Find this source also in **cap/samples**.](https://github.com/sap-samples/cloud-cap-samples-java/blob/5396b0eb043f9145b369371cfdfda7827fedd039/db/schema.cds#L5-L21){:.learn-more}

Java

```java
@CdsName("my.bookshop.Books")
public interface Books_ extends StructuredType<Books_> {
  ElementRef<Integer> ID();
  ElementRef<String> title();
  Authors_ author();
  Authors_ author(Function<Authors_, Predicate> filter);
}
```

```java
@CdsName("my.bookshop.Authors")
public interface Authors_ extends StructuredType<Authors_> {
  ElementRef<Integer> ID();
  ElementRef<String> name();
  Books_ books();
  Books_ books(Function<Books_, Predicate> filter);
}
```

####  Accessor Interfaces

The corresponding data is captured in a data model similar to JavaBeans. These beans are interfaces generated by the framework and providing the data access methods - getters and setters - and containing the CDS element names as well. The instances of the data model are created by the [CDS Query Language (CQL)] Execution Engine (see the following example).

Note the following naming convention: the model interfaces, which represent the structure of the CDS Model, always end with underscore, for example `Books_`. The accessor interface, which refers to data model, is simply the name of the CDS entity - `Books`.

The following data model interface is generated for `Books`:

```java
@CdsName("my.bookshop.Books")
public interface Books extends CdsData {

  String ID = "ID";
  String TITLE = "title";
  String AUTHOR = "author";

  Integer getID();
  void setID(Integer id);

  String getTitle();
  void setTitle(String title);

  Authors getAuthor();
  void setAuthor(Map<String, ?> author);
}
```

#### Javadoc comments

The static model and accessor interfaces can be extended with [Javadoc comments](../cds/cdl#doc-comment).

Currently the generator supports Javadoc comments using the interface and getter/setter methods. The following example shows Javadoc comments defined in the CDS model and how they appear in the generated interfaces.

```cds
namespace my.bookshop;
/**
 * The creator/writer of a book, article, or document.
 */
entity Author {
	   key Id : Integer;
	   /**
	    * The name of the author.
	    */
	   name : String(30);
}
```

```java
/**
 * The creator/writer of a book, article, or document.
 */
@CdsName("my.bookshop.Author")
public interface Author extends CdsData {

  String ID = "Id";
  String NAME = "name";

  Integer getId();
  void setId(Integer id);
  /**
   * The name of the author.
   */
  String getName();
  /**
   * The name of the author.
   */
  void setName(String name);
}
```

#### Usage

In the query builder, the interfaces reference entities. The interface methods can be used in
lambda expressions to reference elements or to compose path expressions:

```java
Select<Books_> query = Select.from(Books_.class)			// Note the usage of model interface Books_ here
  .columns(book -> book.title())
  .where  (book -> book.author().name().eq("Edgar Allan Poe"));

List<Books> books = dataStore.execute(query).listOf(Books.class);	// After executing the query the result can be converted to a typed representation List of Books.
```
