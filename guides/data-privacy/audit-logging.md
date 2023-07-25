---
layout: cookbook
shorty: Audit Logging
synopsis: >
  Enable and use audit-logging capabilities with your CAP application.
breadcrumbs:
  - Cookbook
  - Data Privacy
  - Audit Logging
status: released
---
<!--- Migrated: @external/guides/67-Data-Privacy/03-audit-log.md -> @external/guides/data-privacy/audit-log.md -->



# Audit Logging

<div v-html="$frontmatter?.synopsis" />


## Introduction

This section deals with Audit Logging for reading sensitive data and changes to personal data. As a prerequisite, you have [indicated entities and elements in your domain model, which will contain personal data](introduction#indicate-privacy).

<!--

TODO: already in Basics -> here or there?

<span id="inintroduction" />

In CAP, audit logging can be handled mostly automatically by adding certain annotations to your business entity definitions and adding some configuration/ plugin to your project.

::: warning _❗ Data Subject and Data Object_<br>
For each audit log on a data object (like a Sales Order) a valid data subject (like a Customer) is needed.
The application has to clarify that this link between data object and data subject - which is typically induced by an annotation like
`Customer @PersonalData.FieldSemantics : 'DataSubjectID';` - is never broken. Thus, semantically correct audit logs can only be written on top of a semantically correct built application.

Make sure that the data subject is a valid CAP entity, otherwise the metadata-driven automatism will not work.
:::

<img src="./assets/Data-Privacy.drawio.svg" alt="Data Privacy.drawio.svg" style="zoom:111%;" />

-->


## About the Audited Object


### Data Subject

In our case `Customers` is the main master data entity with the semantics of 'Data Subject'.

```cds
using { cuid, Country } from '@sap/cds/common';

entity Customers : cuid, managed {
  email           : String;
  firstName       : String;
  lastName        : String;
  dateOfBirth     : Date;
  postalAddresses : Composition of many CustomerPostalAddress on postalAddresses.Customer = $self;
  billingData     : Composition of many CustomerBillingData on billingData.Customer = $self;
}
```

This entity is annotated in the _db/data-privacy.cds_ file.

```cds
annotate bookshop.Customers with @PersonalData : {
  DataSubjectRole : 'Customer',
  EntitySemantics : 'DataSubject'
} {
  ID          @PersonalData.FieldSemantics : 'DataSubjectID';
  email       @PersonalData.IsPotentiallyPersonal;
  firstName   @PersonalData.IsPotentiallyPersonal;
  lastName    @PersonalData.IsPotentiallyPersonal;
  dateOfBirth @PersonalData.IsPotentiallyPersonal;
}
```

Here we again have the four levels of annotations as already described in the chapter [Indicate Personal Data in Your Domain Model](introduction#indicate-privacy).

<!--
When you've annotated your (business) entity like this, the audit logs for read access and data modifications will be written automatically by the underlying CAP framework.
-->

In the context of audit logging, the `@PersonalData.IsPotentiallyPersonal` field-level annotation is relevant for inducing audit logs for _Insert_, _Update_, and _Delete_, whereas the `@PersonalData.IsPotentiallySensitive` annotation is relevant for _Read_ access audit logs.

::: warning _Warning_
The `@PersonalData.IsPotentiallySensitive` annotation induces an audit log for each and every _Read_ access.
--- Only use this annotation in [relevant cases](https://ec.europa.eu/info/law/law-topic/data-protection/reform/rules-business-and-organisations/legal-grounds-processing-data/sensitive-data/what-personal-data-considered-sensitive_en).
--- Avoid unnecessary logging activities in your application.
For example, try to avoid reading sensitive data at all by obscuring credit card numbers as `**** **** **** 1234`
:::

We recommend using fields with the `IsPotentiallySensitive` annotation only in detail view entities. This ensures that the audit log for reading sensitive data is only triggered after explicitly jumping to the detail view from the respective overview list view.

::: warning _Warning_
In `@cap-js/audit-logging`, out-of-the-box logging is configurable via `cds.requires['audit-log'].handle = [...]`, with possible values `READ` and `WRITE`, and a default of `['WRITE']`.
That is, data accesses are not logged by default, but must be opted into by overriding the default config.
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
} {
  Customer @PersonalData.FieldSemantics : 'DataSubjectID';
  street   @PersonalData.IsPotentiallyPersonal;
  town     @PersonalData.IsPotentiallyPersonal;
  country  @PersonalData.IsPotentiallyPersonal;
}

annotate bookshop.CustomerBillingData with @PersonalData : {
  DataSubjectRole : 'Customer',
  EntitySemantics : 'DataSubjectDetails'
} {
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
```


### Operation-Level Annotations

Finally, we annotate all standard operations (`Read`, `Insert`, `Update`, `Delete`) as relevant for the audit log - which should be the default case for most of the relevant business entities.

Operation-level annotations indicate which `@AuditLog.Operation` (_Read_, _Insert_, _Update_, _Delete_), related to data-privacy requirements, will be handled automatically in the audit log (read access or change log). This annotation is introduced to manage CAP Audit Logs on a fine granular basis, for three reasons:
  + The first annotation on the entity level is also valid for the SAP Personal Data Manager service.
  + Some entities do not need all Audit Log operations.
  + Some entities manage their Audit Log operations themselves.

The default would be to switch on CAP Audit Logging for all standard operations.

According to the information provided by annotations - written by the responsible developer or architect - the runtime will automatically write all the required read access and change logs by means of the audit log interface described in [Audit Log V2](https://github.wdf.sap.corp/xs-audit-log/audit-java-client/wiki/Audit-Log-V2).

::: warning _Warning_
`@AuditLog.Operation` is not applicable for `@cap-js/audit-logging` (i.e., the Node.js stack).
:::


## Transactional Outbox

By default all log messages are sent through a transactional outbox. This means, when sent, log messages are first stored in a local outbox table, which acts like a queue for outbound messages. Only when requests are fully and successfully processed, will these messages be forwarded to the audit log service.

![Transactional Outbox.drawio](./assets/Transactional-Outbox.drawio.svg)


This provides an ultimate level of resiliency, plus additional benefits:

- **Audit log messages are guaranteed to be delivered** &mdash; even if the audit log service should be down for a longer time period.

- **Asynchronous delivery of log messages** &mdash; the main thread doesn't wait for requests being sent and successfully processed by the audit log service.

- **False log messages are avoided** &mdash;  messages are forwarded to the audit log service on successfully committed requests; and skipped in case of rollbacks.


## Programmatic API

TODOs:
- add model
- add link to [Java's API](/java/auditlog#auditlog-service)

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
The Audit Log Service API is implemented as a CAP service, with the service API defined in CDS as shown below. In effect, the common patterns of [*CAP Service Consumption*](../using-services) apply, as well as all the usual benefits like *mocking*, *late-cut µ services*, *resilience* and *extensibility*.
:::


## AuditLogService

Reference modeling in `@cap-js/audit-logging`:

```cds
namespace sap.auditlog;

service AuditLogService {

  action log(event : String, data : LogEntry);
  action logSync(event : String, data : LogEntry);

  event SensitiveDataRead : LogEntry {
    data_subject : DataSubject;
    object       : DataObject;
    attributes   : many {
      name       : String;
    };
    attachments  : many {
      id         : String;
      name       : String;
    };
    channel      : String;
  }

  event PersonalDataModified : LogEntry {
    data_subject :      DataSubject;
    object       :      DataObject;
    attributes   : many Modification;
    success      :      Boolean default true;
  };

  event ConfigurationModified : LogEntry {
    object     :      DataObject;
    attributes : many Modification;
  };

  event SecurityEvent : LogEntry {
    data : {};
    ip   : String;
  };

}

type LogEntry {
  uuid   : UUID;
  tenant : String;
  user   : String;
  time   : Timestamp;
}

type DataObject {
  type : String;
  id   : {};
}

type DataSubject : DataObject {
  role : String;
}

type Modification {
  name : String;
  old  : String;
  new  : String;
}
```

The content of aspect `LogEntry` are automatically applied and cannot be provided manually (i.e., are overwritten by the service implementation).


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

## Setup on BTP

Your application needs to be bound to an instance of the SAP Audit Log Service.
In case you're providing a SaaS application, you additionally need to return the `xsappname` of the service instance's UAA instance (i.e., `cds.env.requires['audit-log'].credentials.uaa.xsappname`).
If you miss doing this, audit logs that are emitted via the persistent outbox (the default in production as it provides the ultimate resilience) will be lost in nirvana, as the sending effort will end in an unrecoverable error.
As with all dependencies: If you add them later on, you'll need to update all subscriptions.

TODO: should we add this to mtxs?
- something like `if (cds.env.requires?.['audit-log']?.credentials?.uaa.xsappname) dependencies.push({ xsappname: ... })`
- requires `@cap-js/audit-logging` to be added to mtxs sidecar
- NOTE: if we don't do this, then a single deploy of an mta would not suffice! the first deploy creates the service instance and the developer then would need to look up the `uaa.xsappname` and add to mtxs sidecar package.json as to-be-returned dependency

TODO: add `@sap/audit-logging` manually if changing impl to `audit-log-to-library` (default is now `audit-log-to-restv2`)?

## `cds add audit-logging`

should we offer this?

- add `@cap-js/audit-logging`
    - also for mtxs sidecar, if dependency shall be returned automatically
- add audit log service with oauth2 plan in mta.yaml
- if dependency shall not be returned automatically, somehow tell mtxs to return it
