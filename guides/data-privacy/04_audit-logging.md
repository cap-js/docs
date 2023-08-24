---
shorty: Audit Logging
synopsis: >
  Enable and use audit-logging capabilities within your CAP application.
breadcrumbs:
  - Cookbook
  - Data Privacy
  - Audit Logging
status: released
---



# Audit Logging

<div v-html="$frontmatter?.synopsis" />

_The following is mainly written from a Node.js perspective. For Java's perspective, please see [Java - Audit Logging](https://pages.github.tools.sap/cap/docs/java/auditlog)._



## Introduction

CAP provides means for writing [custom audit logs](#custom-audit-logging) using the programmatic APIs, as well as out-of-the-box support for [automatic audit logging](#generic-audit-logging) of select events.
By default, all audit logs -- whether custom or automatic -- are written via the [transactional outbox](#transactional-outbox) to ensure they are (eventually) stored without having to wait for an acknowledgement by the store itself.



### Out-of-the-box Audit Logging

Currently, CAP provides out-of-the-box audit logging for the following events:

- Changes to *personal* data — enabled by default
- Reads of *sensitive* data — __disabled by default__, see TODO

More automatic events are on the roadmap and will follow soon.



### Transactional Outbox { #transactional-outbox }

By default all log messages are sent through a transactional outbox. This means, when sent, log messages are first stored in a local outbox table, which acts like a queue for outbound messages. Only when requests are fully and successfully processed, will these messages be forwarded to the audit log service.

![Transactional Outbox.drawio](./assets/Transactional-Outbox.drawio.svg)

This provides an ultimate level of resiliency, plus additional benefits:

- **Audit log messages are guaranteed to be delivered** &mdash; even if the audit log service should be down for a longer time period.

- **Asynchronous delivery of log messages** &mdash; the main thread doesn't wait for requests being sent and successfully processed by the audit log service.

- **False log messages are avoided** &mdash;  messages are forwarded to the audit log service on successfully committed requests; and skipped in case of rollbacks.



### How-to in a Nutshell

In essence, the steps to use Audit Logging in CAP are:

1. [Add `@PersonalData` annotations](01_introduction#indicate-privacy) to your domain models
1. [Enable audit logging](#setup) via plugin
1. [Test-drive locally](#generic-audit-logging) → `cds watch` w/ audit logs in console
1. [Using SAP Audit Log Service](#sap-audit-log-service) for production



## Setup & Configuration { #setup }

The audit logging functionality was externalized to the open source CDS Plugin Package [`@cap-js/audit-logging`](https://www.npmjs.com/package/@cap-js/audit-logging), which is co-owned by CAP and the SAP Audit Log Service team.

[CDS Plugin Packages](../../node.js/cds-plugins) are self-containing extensions, i.e., they include not only the relevant code but also bring their own default configuration. Hence, in order to use audit logging in your CAP application, you only need to run:

```sh
npm add @cap-js/audit-logging
```

::: details Behind the Scenes…

Next to bringing the respective code, the plugin:

1. Sets `cds.requires.audit-log: true` in `cds.env`, equivalent to:
    ```json
    {"cds":{
      "requires": {
        "audit-log": true
      }
    }}
    ```

2. Which in turn activates the `audit-log` configuration **presets**:
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

<span id="data-privacy-add-audit-logging" />

::: danger TODO @ Rene
why (internal) fragment not being shown?
:::



## Generic Audit Logging { #generic-audit-logging }

The [@PersonalData annotations](01_introduction#indicate-privacy) are all we need to automatically log personal data-related events. Let's see that in action…

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

- Intercepting all write operations potentially involving personal data
- Intercepting all read operations potentially involving sensitive data
    - If configured, cf. `handle`
- Determining the affected fields containing personal data, if any
- Constructing log messages, and sending them to the connected audit log service
- All emitted log messages are sent through the [transactional outbox](#transactional-outbox)
- Applying resiliency mechanisms like retry with exponential backoff, etc.



## Custom Audit Logging { #custom-audit-logging }

In addition to the generic audit logging provided out of the box, applications can also log custom events with custom data using the programmatic API.

Connecting to the service:

```js
const audit = await cds.connect.to('audit-log')
```

Sending log messages:

```js
await audit.log('SomeEvent', { … })
```

::: tip
The Audit Log Service API is implemented as a CAP service, with the service API defined in CDS as shown below. In effect, the common patterns of [*CAP Service Consumption*](../using-services) apply, as well as all the usual benefits like *mocking*, *late-cut µ services*, *resilience* and *extensibility*.
:::


### Basic Service API

The basic service definition declares the generic `log` and `logSync` operations used for all kinds of events, along with type `LogEntry`, which declares the common fields of all log messages — these fields are filled in automatically (values provided by the caller are ignored).

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
await audit.log('SomeEvent', {
  some_details: 'whatever'
})

await audit.logSync('SomeOtherEvent', {
  some_other_details: 'whatever else'
})
```

The difference between `log` and `logSync` is that `logSync` circumvents the [transactional outbox](#transactional-outbox) and, hence, resolves once writing to the audit log store was successful. In production, for example, that would mean that the audit log was acknowledged by the SAP Audit Log Service. However, it also means that the benefits of the transactional outbox, such as resilience, are skipped.

If configuration `outbox` is set to `false`, the two operations behave identical, namely `log` bahaves like `logSync`. For this reason (and better error handling), you should always `await` calling `log` as well.

Additionally, the service has pre-defined event payloads for the four event types:
1. _Log read access to sensitive personal data_
1. _Log changes to personal data_
1. _Security event log_
1. _Configuration change log_

These payloads are based on [SAP Audit Log Service's REST API](https://help.sap.com/docs/btp/sap-business-technology-platform/audit-log-write-api-for-customers?locale=en-US), which maximizes performance by omitting any intermediate data structures.



### Personal Data-Related Events

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



### AuditLogService

::: danger TODO
keep?
:::

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



## Using SAP Audit Log Service { #sap-audit-log-service }

Here is what you need to do in order to integrate with SAP Audit Log Service:

1. In your space, create a service instance of service _SAP Audit Log Service_ (`auditlog`) with plan `premium`
2. Add the service instance as _existing resource_ to your `mta.yml` and bind to your application in its _requires_ section
    - Existing resources are defined like this:
      ```yml
      resources:
      - name: my-auditlog-service
        type: org.cloudfoundry.existing-service
      ```

<span id="data-privacy-audit-log-service-saas" />

::: danger TODO @ Rene
why (internal) fragment not being shown?
:::

A more comprehensive guide, incl. tutorials, is currently under development.
