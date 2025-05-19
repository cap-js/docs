---
synopsis: >
  Task Queues allow to schedule the processing of workloads in a resilient fashion.
status: released
---

# Task Queues

The _Outbox Pattern_ is a reliable strategy used in distributed systems to ensure that messages or events are consistently recorded and delivered, even in the face of failures.
This pattern, however, can not only be applied to outbound messages, but to inbound messages and server-internal background tasks as well.
The core principle remains the same:
1. Persist the message (or _task_) in the database -- using the same transaction as the triggering action, if applicable
2. Process it asynchronously afterwards -- incl. retries, if necessary

Over the next months, CAP will evolve its outbox to generic _Task Queues_ with the following four components:
1. Outbox → for outbound calls to remote services
2. Inbox → for asynchronously handling inbound requests
3. Background tasks → e.g., scheduled periodically
4. Callbacks → implement SAGA patterns

This guide will grow with the functionality.
Until then, please see the following existing documentation:
- [Transactional Outbox](../java/outbox) in CAP Java
- [Outboxing with `cds.outboxed`](../node.js/outbox) in CAP Node.js

##  <i>  More to Come </i>

This documentation is not complete yet, or the APIs are not released for general availability.
Stay tuned to upcoming releases for further updates.
