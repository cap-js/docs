---
synopsis: >
  ChangeSet Contexts are an abstraction around transactions. This chapter describes how ChangeSets are related to transactions and how to manage them with the CAP Java SDK.
status: released
uacp: Used as link target from Help Portal at https://help.sap.com/products/BTP/65de2977205c403bbc107264b8eccf4b/9186ed9ab00842e1a31309ff1be38792.html
---

# ChangeSet Contexts
<style scoped>
  h1:before {
    content: "Java"; display: block; font-size: 60%; margin: 0 0 .2em;
  }
</style>

{{ $frontmatter.synopsis }}

## Overview

ChangeSet Contexts are used in the CAP Java SDK as a light-weight abstraction around transactions. They are represented by the [ChangeSetContext](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/latest/com/sap/cds/services/changeset/ChangeSetContext.html) interface.
ChangeSet Contexts only define transactional boundaries, but do not define themselves how a transaction is started, committed or rolled back.
They are therefore well suited to plug in different kinds of transaction managers to integrate with different kinds of transactional resources.

The currently active ChangeSet Context can be accessed from the [Event Context](./provisioning-api#eventcontext):

```java
context.getChangeSetContext();
```

## Defining ChangeSet Contexts { #defining-changeset-contexts}

When [events](../about/#events) are processed on [services](./consumption-api) the CAP Java SDK ensures that a ChangeSet Context is opened.
If no ChangeSet Context is active the processing of an event ensures to open a new ChangeSet Context. This has the effect, that by default a ChangeSet Context is opened around the outermost event that was triggered on any service.
This ensures that every top-level event is executed with its own transactional boundaries.

For example, if a `CREATE` event is triggered on an Application Service, which is split into multiple `CREATE` events to different entities on the Persistence Service, the processing of the `CREATE` event on the Application Service ensures to open a new ChangeSet Context around all of these events. All interactions with the Persistence Service and therefore all interactions with the database, happen in a single transaction, which is committed, when the processing of the `CREATE` event on the Application Service finishes. In general, this frees event handler implementations to worry about transactions.

Nevertheless you can explicitly define ChangeSet Contexts. It is also possible to nest these ChangeSet Contexts, allowing for suspending previous transactions.
The [CdsRuntime](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/latest/com/sap/cds/services/runtime/CdsRuntime.html) provides an API to define a new ChangeSet Context:

```java
runtime.changeSetContext().run(context -> {
    // executes inside a dedicated ChangeSet Context
});
```

The code that is executed inside the `java.util.function.Function` or `java.util.function.Consumer` that is passed to the `run()` method, is executed in a dedicated ChangeSet Context.

## Reacting on ChangeSets

It is possible to register listeners on the ChangeSet Context to perform certain actions shortly before the transaction will be committed or after the transaction was committed or rolled-back.
The [ChangeSetListener](https://www.javadoc.io/doc/com.sap.cds/cds-services-api/latest/com/sap/cds/services/changeset/ChangeSetListener.html) interface can be used for this case. It allows to register a listener, which is executed shortly before the ChangeSet is closed (`beforeClose()`) or one, that is executed after the ChangeSet was closed (`afterClose(boolean)`). The `afterClose` method has a boolean parameter, which indicates if the ChangeSet was completed successfully (`true`) or failed and rolled-back (`false`).

```java
ChangeSetContext changeSet = context.getChangeSetContext();
changeSet.register(new ChangeSetListener() {

    @Override
    public void beforeClose() {
        // do something before changeset is closed
    }

    @Override
    public void afterClose(boolean completed) {
        // do something after changeset is closed
    }

});
```

## Cancelling ChangeSets

The ChangeSet Context can  be used to cancel a ChangeSet without throwing an exception.
All events in the changeset are processed in that case, but the transaction is rolled back at the end.
A changeset can still be canceled from within the `beforeClose()` listener method.

```java
ChangeSetContext changeSet = context.getChangeSetContext();
// cancel changeset without throwing an exception
changeSet.markForCancel();
```

## Database Transactions in Spring Boot

Database transactions in CAP are always started and initialized lazily during the first interaction with the Persistence Service.
When running in Spring Boot, CAP Java completely integrates with Spring's transaction management. As a result you can use Spring's `@Transactional` annotations or the `TransactionTemplate` to control transactional boundaries as an alternative to using the ChangeSet Context.

This integration with Spring's transaction management also comes in handy, in case you need to perform plain JDBC connections in your event handlers.
This might be necessary, when calling SAP HANA procedures or selecting from tables not covered by CDS and the Persistence Service.

When annotating an event handler with `@Transactional`, Spring ensures that a transaction is initialized. CAP in that case ensures, that this transaction is managed as part of an existing ChangeSet Context, for which the transaction wasn't yet initialized. If no such ChangeSet Context exists, a new ChangeSet Context is created. In case the transaction propagation is specified as `REQUIRES_NEW`, Spring, and CAP ensure that a new transaction and ChangeSet Context are initialized. This mechanism suspends existing transactions and ChangeSet Context, until the newly created one is closed.

Spring's transaction management can therefore be used to control transactional boundaries and to initialize transactions more eagerly than CAP.
This can be combined with Spring's standard capabilities to get access to a plain JDBC connection:

```java
@Autowired
private JdbcTemplate jdbc;

@Autowired
private DataSource ds;

@Before(event = CqnService.EVENT_CREATE, entity = Books_.CDS_NAME)
@Transactional // ensure transaction is initialized
public void beforeCreateBooks(List<Books> books) {
    // JDBC template
    jdbc.queryForList("SELECT 1 FROM DUMMY");

    // Connection object
    Connection conn = DataSourceUtils.getConnection(ds);
    conn.prepareCall("SELECT 1 FROM DUMMY").executeQuery();
}
```

### Setting Session Context Variables

You can leverage the simplified access to JDBC APIs in Spring Boot to set session context variables on the JDBC connection.
When setting these variables this way, they will also influence statements executed by CAP itself through the Persistence Service APIs.

The following example shows how to set session context variables by means of a custom event handler that is called on all interactions with the Persistence Service.
If setting session context variables is needed only for specific queries, it is also possible to narrow down the invocation of the event handler by providing a more specific `@Before` annotation:

```java
@Component
@ServiceName(value = "*", type = PersistenceService.class)
public class SessionContextHandler implements EventHandler {

    private final static Set<ChangeSetContext> handled = Collections.synchronizedSet(new HashSet<>());

    @Autowired
    private DataSource dataSource;

    @Before
    protected void setSessionContextVariables(EventContext context) {
        ChangeSetContext changeSet = context.getChangeSetContext();
        // handle every transaction only once
        if(handled.add(changeSet)) {
            // set the session variable
            setSessionContextVariable("foo", "bar");

            changeSet.register(new ChangeSetListener(){

                @Override
                public void beforeClose() {
                    // clear the session variable
                    setSessionContextVariable("foo", null);
                    handled.remove(changeSet);
                }

            });
        }
    }

    private void setSessionContextVariable(String name, String value) {
        Connection con = null;
        try {
            // obtains the transaction connection
            con = DataSourceUtils.getConnection(dataSource);
            con.setClientInfo(name, value);
        } catch (SQLClientInfoException e) {
            // handle appropriately
        } finally {
            // only releases the obtained connection
            // the transaction connection is still kept open with the
            // session variables set
            DataSourceUtils.releaseConnection(con, dataSource);
        }
    }

}
```
