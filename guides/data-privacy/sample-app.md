---
layout: cookbook
shorty: Sample App
synopsis: >
  Learn how to build and deploy an app with PDM, DRM, and audit logging on SAP BTP CF.
breadcrumbs:
  - Cookbook
  - Data Privacy
  - Sample App
#status: released
---



# Data Privacy Sample App for SAP BTP CF

We should document how to build AND DEPLOY a SaaS app with PDM, audit logging, and DRM (when available).
There are many pitfalls such as returning all necessary xsappnames in a single deployment without manual copy & paste.



## Setup on BTP

Your application needs to be bound to an instance of the SAP Audit Log Service.
In case you're providing a SaaS application, you additionally need to return the `xsappname` of the service instance's UAA instance (i.e., `cds.env.requires['audit-log'].credentials.uaa.xsappname`).
If you miss doing this, audit logs that are emitted via the persistent outbox (the default in production as it provides the ultimate resilience) will be lost in nirvana, as the sending effort will end in an unrecoverable error.
As with all dependencies: If you add them later on, you'll need to update all subscriptions.

::: danger _TODO_
should we add this to mtxs?
- something like `if (cds.env.requires?.['audit-log']?.credentials?.uaa.xsappname) dependencies.push({ xsappname: ... })`
- requires `@cap-js/audit-logging` to be added to mtxs sidecar
- NOTE: if we don't do this, then a single deploy of an mta would not suffice! the first deploy creates the service instance and the developer then would need to look up the `uaa.xsappname` and add to mtxs sidecar package.json as to-be-returned dependency
:::

::: danger _TODO_
add `@sap/audit-logging` manually if changing impl to `audit-log-to-library` (default is now `audit-log-to-restv2`)?
:::



## `cds add audit-logging`

::: danger _TODO_
should we offer this?
:::

- add `@cap-js/audit-logging`
    - also for mtxs sidecar, if dependency shall be returned automatically
- add audit log service with oauth2 plan in mta.yaml
- if dependency shall not be returned automatically, somehow tell mtxs to return it
