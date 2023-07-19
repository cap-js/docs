---
layout: cookbook
shorty: Audit Log
synopsis: >
  Enable and use audit-log capabilities with your CAP application.
breadcrumbs:
  - Cookbook
  - Data Privacy
  - Audit Logging
status: released
---
<!--- Migrated: @external/guides/67-Data-Privacy/03-audit-log.md -> @external/guides/data-privacy/audit-log.md -->

# Audit Logging with CAP

<div v-html="$frontmatter?.synopsis" />

## Introduction

This section deals with Audit Logging for reading sensitive data and changes to personal data. As a prerequisite, you have [indicated entities and elements in your domain model, which will contain personal data](introduction#indicate-privacy).

<span id="inintroduction" />

In CAP, audit logging can be handled mostly automatically by adding certain annotations to your business entity definitions and adding some configuration/ plugin to your project.

::: warning _❗ Data Subject and Data Object_<br>
For each audit log on a data object (like a Sales Order) a valid data subject (like a Customer) is needed.
The application has to clarify that this link between data object and data subject - which is typically induced by an annotation like
`Customer @PersonalData.FieldSemantics : 'DataSubjectID';` - is never broken. Thus, semantically correct audit logs can only be written on top of a semantically correct built application.

Make sure that the data subject is a valid CAP entity, otherwise the metadata-driven automatism will not work.
:::

<img src="./assets/Data-Privacy.drawio.svg" alt="Data Privacy.drawio.svg" style="zoom:111%;" />

## About the Audited Object

### Data Subject

In our case `Customers` is the main master data entity with the semantics of 'Data Subject'.

```cds
using { cuid, Country } from '@sap/cds/common';

 entity Customers : cuid, managed {
  email        : String;
  firstName    : String;
  lastName     : String;
  dateOfBirth  : Date;
  postalAddress : Association to CustomerPostalAddress on postalAddress.Customer = $self;
}

```

This entity is annotated in the _db/data-privacy.cds_ file.

```cds

annotate bookshop.Customers with @PersonalData : {
  DataSubjectRole : 'Customer',
  EntitySemantics : 'DataSubject'
}
{
  ID           @PersonalData.FieldSemantics : 'DataSubjectID';
  emailAddress @PersonalData.IsPotentiallyPersonal;
  firstName    @PersonalData.IsPotentiallyPersonal;
  lastName     @PersonalData.IsPotentiallyPersonal;
  dateOfBirth  @PersonalData.IsPotentiallyPersonal;
}

```

Here we again have the four levels of annotations as already described in the chapter [Indicate Personal Data in Your Domain Model](introduction#indicate-privacy).

When you've annotated your (business) entity like this, the audit logs for read access and data modifications will be written automatically by the underlying CAP framework.

In the context of audit logging, the `@PersonalData.IsPotentiallyPersonal` field-level annotation is relevant for inducing audit logs for _Insert_, _Update_, and _Delete_, whereas the `@PersonalData.IsPotentiallySensitive` annotation is relevant for _Read_ access audit logs.

::: warning _Warning_
The `@PersonalData.IsPotentiallySensitive` annotation induces an audit log for each and every _Read_ access.
--- Only use this annotation in [relevant cases](https://ec.europa.eu/info/law/law-topic/data-protection/reform/rules-business-and-organisations/legal-grounds-processing-data/sensitive-data/what-personal-data-considered-sensitive_en).
--- Avoid unnecessary logging activities in your application.
:::

###  Data Subject Details

In the first example, the audited object was identical to the data subject, but this is not always the case.

In many cases you have additional master data describing more details of the data subject stored in a separate entity.
In our terminology this has the semantics 'Data Subject Details'.

In our example we have the additional entities `CustomerPostalAddress` and `CustomerBillingData` which contain additional master data belonging to a certain 'Customer', but which are stored in separate entities, for better clarity and better separation of concerns.

```cds

entity CustomerPostalAddress : cuid, managed {
  Customer       : Association to one Customers;
  street         : String(128);
  town           : String(128);
  country        : Country;
  someOtherField : String(128);
};

entity CustomerBillingData : cuid, managed {
  Customer      : Association to one Customers;
  creditCardNo  : String;
};

```

These entities are annotated in the _db/data-privacy.cds_ file.

```cds
annotate bookshop.CustomerPostalAddress with @PersonalData : {
  DataSubjectRole : 'Customer',
  EntitySemantics : 'DataSubjectDetails'
}
{
  Customer @PersonalData.FieldSemantics : 'DataSubjectID';
  street   @PersonalData.IsPotentiallyPersonal;
  town     @PersonalData.IsPotentiallyPersonal;
  country  @PersonalData.IsPotentiallyPersonal;
}

annotate bookshop.CustomerBillingData with @PersonalData : {
  DataSubjectRole : 'Customer',
  EntitySemantics : 'DataSubjectDetails'
}
{
  Customer @PersonalData.FieldSemantics : 'DataSubjectID';
  creditCardNo @PersonalData.IsPotentiallySensitive;
}

```

Very similarly to the section on 'Data Subject' this entity is as well annotated in four levels.
More details on these annotations can be found in the chapter [Indicate Personal Data in Your Domain Model](introduction#indicate-privacy).

::: warning _Warning_
Annotation `@AuditLog.Operation` is not applicable for the Node.js runtime.
:::

###  Transactional Data

In the section on 'Data Subject' and 'Data Subject Details' we have seen, how to annotate the master data entities carrying the semantical information of the 'Data Subject'.

Now we have a look at classical transactional data.

In the Personal Data Terminology all transactional data like 'Sales Orders', 'Shipments', 'Payments' are summarizes under the classification 'Other', which means they are relevant for Data Privacy, but they are neither 'Data Subject' nor 'Data Subject Details'.
More details on this Terminology can be found in the chapter [Indicate Personal Data in Your Domain Model](introduction#indicate-privacy).

In our example we have the entity 'Orders'

```cds
entity Orders : cuid, managed {
  OrderNo         : String @title:'Order Number'; //> readable key
  Items           : Composition of many OrderItems on Items.parent = $self;
  currency        : Currency;
  Customer        : Association to Customers;
  personalComment : String;
}
```

To ensure proper audit logging we annotate using the usual four levels as described in the chapter [Indicate Personal Data in Your Domain Model](introduction#indicate-privacy).

```cds
annotate bookshop.Orders with @PersonalData.EntitySemantics : 'Other'
{
  ID              @PersonalData.FieldSemantics : 'ContractRelatedID';
  Customer        @PersonalData.FieldSemantics : 'DataSubjectID';
  personalComment @PersonalData.IsPotentiallyPersonal;
}
annotate bookshop.Orders with @AuditLog.Operation : {
  Read   : true,
  Insert : true,
  Update : true,
  Delete : true
};
```

Finally, we annotate all standard operations (`Read`, `Insert`, `Update`, `Delete`) as relevant for the audit log - which should be the default case for most of the relevant business entities.

::: warning _Warning_
Annotation `@AuditLog.Operation` is not applicable for the Node.js runtime.
:::

<div id="ddkkkeuz32188fjj" />

<span id="sdfgew343224" />


## Transactional Outbox

By default all log messages are sent through a transactional outbox. This means, when sent, log messages are first stored in a local outbox table, which acts like a queue for outbound messages. Only when requests are fully and successfully processed, will these messages be forwarded to the audit log service.

![Transactional Outbox.drawio](./assets/Transactional-Outbox.drawio.svg)



This provides an ultimate level of resiliency, plus additional benefits:

- **Audit log messages are guaranteed to be delivered** &mdash; even if the audit log service should be down for a longer time period.

- **Asynchronous delivery of log messages** &mdash; the main thread doesn't wait for requests being sent and successfully processed by the audit log service.

- **False log messages are avoided** &mdash;  messages are forwarded to the audit log service on successfully committed requests; and skipped in case of rollbacks.




## Programmatic API

In addition to the generic audit logging provided out of the box, applications can also log custom events with custom data using the programmatic API.

Connecting to the service:

```js
const audit = await cds.connect.to('audit-log')
```

Sending log messages:

```js
await audit.log ('SomeEvent', { … })
```

<br>


::: tip
The Audit Log Service API is implemented as a CAP service, with the service API defined in CDS as shown below. In effect, the common patterns of [*CAP Service Consumption*](../../using-services) apply, as well as all the usual benefits like *mocking*, *late-cut µ services*, *resilience* and *extensibility*.
:::

### Basic Service API

The basic service definition declares the generic `log` operation used for all kinds of events, along with type `LogMessage` declares the common fields of all log messages — these fields are filled in automatically if not provided by the caller.

```cds
namespace sap.auditlog;

service AuditLogService {

  action log     (event: String, data: LogEntry);
  action logSync (event: String, data: LogEntry);

}

/** Common fields, filled in automatically if missing */
type LogEntry {
  uuid      : UUID;
  tenant    : String;
  user      : String;
  timestamp : Timestamp;
}
```

::: warning _Warning_
Only applicable for the Node.js runtime. Java still uses old model, I assume.
:::

Usage is like that:

```js
await audit.log ('SomeEvent', {
  some_details: 'whatever'
})
```

### Personal Data-Related Events

In addition, pre-defined event payloads for personal data-related events are declared:

```cds
namespace sap.auditlog;

service AuditLogService {
  // … as above

  event SensitiveDataRead : LogEntry {
    // dataSubjects : many DataSubject;
    dataSubject  : DataSubject;
    dataObject   : DataObject;
    // channel      : String;
    attributes   : many { name: String };
    // attachments  : many { name: String; id: String };
  }

  event PersonalDataChanged : LogEntry {
    dataSubject   : DataSubject;
    dataObject    : DataObject;
    attributes    : many { name: String; old: String; new: String; };
  }

}

type DataObject  : { type: String; id: {} }
type DataSubject : DataObject { role: String }
```

Send corresponding log messages complying to these definitions like that:

```js
await audit.log ('SensitiveDataRead', {
  dataSubject: {
    type: 'sap.capire.bookshop.Customers',
    id: { ID: '1923bd11-b1d6-47b6-a91b-732e755fa976' },
    role: 'Customer',
  },
  dataObject: {
    type: 'sap.capire.bookshop.Customers',
    id: { ID: '1923bd11-b1d6-47b6-a91b-732e755fa976' }
  },
  attributes: [
    { name: 'creditCardNo' }
  ]
})
```



### Config Change Events

```cds
service AuditLogService {
  // … as above
  event ConfigChange : LogMessage {
    object        : DataObject;
    attributes    : ChangedAttributes;
  }
}
```

::: warning _Warning_
Not applicable for the Node.js runtime.
:::



### Security Events

```cds
service AuditLogService {
  // ... as above
  event FailedLogin : LogMessage {
    action : String;
    data   : String;
  }
}
```

::: warning _Warning_
Not applicable for the Node.js runtime.
:::



## Service Providers

In addition, everybody could provide new implementations in the same way as we implement the mock variant:

```js
const cds = require('@sap/cds')

class ConsoleAuditLogService extends cds.Service {
  log (event, data) {
    console.log (event, data)
  }
}

module.exports = ConsoleAuditLogService
```
