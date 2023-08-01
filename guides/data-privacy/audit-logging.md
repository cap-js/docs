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

_The following is mainly written from a Node.js perspective. For Java's perspective, please see [Java - Audit Logging](https://pages.github.tools.sap/cap/docs/java/auditlog)._



## Introduction

CAP provides out-of-the-box support for automatic audit logging of these events:

- Changes to *personal* data — enabled by default
- Reads of *sensitive* data — disabled by default

In essence, the steps to use that are:

1. [Add `@PersonalData` Annotations](#annotations) to your domain models → as shown before.
1. [Enable audit-logging](#enable-audit-logging) → `cds add audit-logging`
1. [Test-drive locally](#generic-audit-logging) → `cds watch` w/ audit logs in console
1. [Using SAP Audit Log Service](#sap-audit-log-service) for production

::: danger TODO
`cds add audit-logging` is not yet supported
:::

In addition, custom audit logs can be recorded using the programmatic APIs.

As a prerequisite, you have to [indicate entities and elements in your domain model, which will contain personal data](introduction#indicate-privacy).



## About the Audited Object


### Data Subject

In our case `Customers` is the main master data entity with the semantics of 'Data Subject'.

```cds
using { cuid, Country } from '@sap/cds/common';

entity Customers : cuid, managed {
  email       : String;
  firstName   : String;
  lastName    : String;
  dateOfBirth : Date;
  addresses   : Composition of many CustomerPostalAddress on addresses.Customer = $self;
  billingData : Composition of many CustomerBillingData on billingData.Customer = $self;
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

When you've annotated your (business) entity like this, the audit logs for read access and data modifications will be written automatically by the underlying CAP framework.

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
entity Addresses : cuid, managed {
  customer       : Association to one Customers;
  street         : String(128);
  town           : String(128);
  country        : Country;
  someOtherField : String(128);
};

entity BillingData : cuid, managed {
  customer      : Association to one Customers;
  creditCardNo  : String;
};
```

These entities are annotated in the _db/data-privacy.cds_ file.

```cds
annotate bookshop.Addresses with @PersonalData : {
  DataSubjectRole : 'Customer',
  EntitySemantics : 'DataSubjectDetails'
} {
  customer @PersonalData.FieldSemantics : 'DataSubjectID';
  street   @PersonalData.IsPotentiallyPersonal;
  town     @PersonalData.IsPotentiallyPersonal;
  country  @PersonalData.IsPotentiallyPersonal;
}

annotate bookshop.BillingData with @PersonalData : {
  DataSubjectRole : 'Customer',
  EntitySemantics : 'DataSubjectDetails'
} {
  customer @PersonalData.FieldSemantics : 'DataSubjectID';
  creditCardNo @PersonalData.IsPotentiallySensitive;
}
```

Very similarly to the section on 'Data Subject' this entity is as well annotated in four levels.
More details on these annotations can be found in the chapter [Indicate Personal Data in Your Domain Model](introduction#indicate-privacy).

You may have noticed property `someOtherField` was not annotated. Hence, no modification will be logged.


###  Transactional Data

In the section on 'Data Subject' and 'Data Subject Details' we have seen, how to annotate the master data entities carrying the semantical information of the 'Data Subject'.

Now we have a look at classical transactional data.

In the Personal Data Terminology all transactional data like 'Sales Orders', 'Shipments', 'Payments' are summarizes under the classification 'Other', which means they are relevant for Data Privacy, but they are neither 'Data Subject' nor 'Data Subject Details'.
More details on this Terminology can be found in the chapter [Indicate Personal Data in Your Domain Model](introduction#indicate-privacy).

In our example we have the entity 'Orders'

```cds
entity Orders : cuid, managed {
  orderNo         : String @title: 'Order Number'; //> readable key
  items           : Composition of many OrderItems on items.parent = $self;
  currency        : Currency;
  customer        : Association to Customers;
  personalComment : String;
}
```

To ensure proper audit logging we annotate using the usual four levels as described in the chapter [Indicate Personal Data in Your Domain Model](introduction#indicate-privacy).

```cds
annotate bookshop.Orders with @PersonalData.EntitySemantics : 'Other'
{
  ID              @PersonalData.FieldSemantics : 'ContractRelatedID';
  customer        @PersonalData.FieldSemantics : 'DataSubjectID';
  personalComment @PersonalData.IsPotentiallyPersonal;
}
```


### Operation-Level Annotations

::: danger _TODO_
check if still needed for Java. In Node.js, this is no longer considered.
:::

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


## Setup & Configuration

::: danger TODO
`cds add audit-logging` is not yet supported
:::

Run this to enable audit logging

```sh
cds add audit-logging
```

::: details Behind the Scenes…

This CLI command is a convenient shortcut for…

1. Installing required 3rd-party packages, e.g.
    ```js
    npm add @cap-js/audit-logging
    ```

2. Which sets `cds.requires.audit-log = true` in `cds.env`, equivalent to:
    ```json
    {"cds":{
      "requires": {
        "audit-log": true
      }
    }}
    ```

3. Which in turn activates the `audit-log` configuration **preset**:
    ```jsonc
    {
       "audit-log": {
         "handle": ["WRITE"],
         "[development]": {
           "impl": "@cap-js/audit-logging/srv/audit-log-to-console",
           "outbox": false
         },
         "[production]": {
           "impl": "@cap-js/audit-logging/srv/audit-log-to-restv2",
           "outbox": true
         }
       }
    }
    ```

**The individual config options are:**

- `impl` — the service implementation to use
- `outbox` — whether to use transactional outbox or not
- `handle` — which events (`READ` and/or `WRITE`) to intercept and generate log messages from

**The preset uses profile-specific configs** for development and production. Use the `cds env` command to find out the effective configuration for your current environment:

```sh
cds env requires.audit-log
```

```sh
cds env requires.audit-log --profile production
```

:::

See the [Sample App](./sample-app.md) for more details.


## Generic Audit Logging

[The @PersonalData annotations](introduction#indicate-privacy) are all we need to automatically log personal data-related events. Let's see that in action…

1. **Start the server** as usual:

    ```sh
    cds watch
    ```

2. **Send an udate** request, changing personal data

    ```http
    PATCH http://localhost:4004/admin/Customers(8e2f2640-6866-4dcf-8f4d-3027aa831cad) HTTP/1.1
    Authorization: Basic alice:in-wonderland
    Content-Type: application/json

    {
      "firstName": "Johnny",
      "dateOfBirth": "2002-03-09"
    }
    ```

3. **See the audit logs** in the server's console output:

    ```js
    {
      data_subject: {
        type: 'AdminService.Customers',
        id: { ID: '8e2f2640-6866-4dcf-8f4d-3027aa831cad' },
        role: 'Customer',
      },
      object: {
       type: 'AdminService.Customers',
       id: { ID: '8e2f2640-6866-4dcf-8f4d-3027aa831cad' }
      },
      attributes: [
        { name: 'firstName', old: 'John', new: 'Johnny' },
        { name: 'dateOfBirth', old: '1970-01-01', new: '2002-03-09' }
      ],
      user: 'alice',
      tenant: 't1',
      uuid: '1391A703E2CBE52E817269EC7527368C',
      time: '2023-02-26T08:13:48.287Z'
    }
    ```



**Behind the scenes** the generic audit logging implementation automatically cares for:

- Intercepting all read operations potentially involving sensitive data and
- Intercepting all write operations potentially involving personal data
- Determining the affected fields containing personal data, if any
- Constructing log messages, and sending them to the connected audit log service
- All emitted log messages are sent through the [transactional outbox](#transactional-outbox)
- Applying resiliency mechanisms like retry with exponential backoff, etc.



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

::: tip
The Audit Log Service API is implemented as a CAP service, with the service API defined in CDS as shown below. In effect, the common patterns of [*CAP Service Consumption*](../using-services) apply, as well as all the usual benefits like *mocking*, *late-cut µ services*, *resilience* and *extensibility*.
:::


### Basic Service API

The basic service definition declares the generic `log` operation used for all kinds of events, along with type `LogEntry` declares the common fields of all log messages — these fields are filled in automatically if not provided by the caller.

```cds
namespace sap.auditlog;

service AuditLogService {

  action log    (event : String, data : LogEntry);
  action logSync(event : String, data : LogEntry);

}

/** Common fields, filled in automatically */
type LogEntry {
  uuid   : UUID;
  tenant : String;
  user   : String;
  time   : Timestamp;
}
```

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
  }

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

Send corresponding log messages complying to these definitions like that:

```js
await audit.log ('SensitiveDataRead', {
  data_subject: {
    type: 'sap.capire.bookshop.Customers',
    id: { ID: '1923bd11-b1d6-47b6-a91b-732e755fa976' },
    role: 'Customer',
  },
  object: {
    type: 'sap.capire.bookshop.BillingData',
    id: { ID: '399a2704-3d2d-4fa1-9e7d-a4e45c67749b' }
  },
  attributes: [
    { name: 'creditCardNo' }
  ]
})
```

```js
await audit.log ('PersonalDataModified', {
  data_subject: {
    type: 'sap.capire.bookshop.Customers',
    id: { ID: '1923bd11-b1d6-47b6-a91b-732e755fa976' },
    role: 'Customer',
  },
  object: {
    type: 'sap.capire.bookshop.Customers',
    id: { ID: '1923bd11-b1d6-47b6-a91b-732e755fa976' }
  },
  attributes: [
    { name: 'emailAddress', old: 'foo@example.com', new: 'bar@example.com' }
  ]
})
```



### Configuration Modified Events

```cds
service AuditLogService {
  // … as above

  event ConfigurationModified : LogEntry {
    object     :      DataObject;
    attributes : many Modification;
  }

}
```

Send corresponding log messages complying to these definitions like that:

```js
await audit.log ('ConfigurationModified', {
  object: {
    type: 'sap.common.Currencies',
    id: { ID: 'f79ba248-c348-4962-9fef-680c3b88807c' }
  },
  attributes: [
    { name: 'symbol', old: 'EUR', new: '€' }
  ]
})
```

Note: Configuration modified events are not (yet) logged out of the box.


### Security Events

```cds
service AuditLogService {
  // … as above

  event SecurityEvent : LogEntry {
    data : {};
    ip   : String;
  }

}
```

Send corresponding log messages complying to these definitions like that:

```js
await audit.log ('SecurityEvent', {
  data: {
    user: 'alice',
    action: 'Attempt to access restricted service "PDMService" with insufficient authority'
  },
  ip: '127.0.0.1'
})
```

Note: Security events are not (yet) logged out of the box.


### AuditLogService

Here is the complete reference modeling as contained in `@cap-js/audit-logging`:

```cds
namespace sap.auditlog;

service AuditLogService {

  action log    (event : String, data : LogEntry);
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
  };

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

/** Common fields, filled in automatically */
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

The contents of aspect `LogEntry` are automatically applied and cannot be provided manually (i.e., are overwritten by the service implementation).



## Custom Implementation

In addition, everybody could provide new implementations in the same way as we implement the mock variant:

```js
const cds = require('@sap/cds')

class MyAuditLogService extends cds.Service {
  log (event, data) {
    console.log (event, data)
  }
  logSync (event, data) {
    console.log (event, data)
  }
}

module.exports = MyAuditLogService
```

As always, custom implementations need to be configured:

```json
{
  "cds": {
    "requires": {
      "audit-log": {
        "impl": "./lib/MyAuditLogService.js"
      }
    }
  }
}
```
