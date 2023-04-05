<!--- Migrated: @external/guides/67-Data-Privacy/66-Data-Privacy/TODO.md -> @external/guides/data-privacy/data-privacy/todo.md -->
# TODO re Audit Log

## Requirements

*As a CAP-based project I want to add audit logging for ...*

- [ ] reading/writing personal data 
- [ ] security events 
- [ ] config changes 
- [ ] other audit-relevant events

## Objectives

- [ ] **MUST** be in good shape for SAP-internal projects → Golden Path
- [ ] **SHOULD** be made available to external customers as well 
  - [ ] → **MUST**: via console
  - [ ] → **COULD** we add simple db-based mocked audit logging?
- [ ] **SHOULD**: Product Standards / Cloud Qualities compliance?
- [ ] **MUST**: Security → mTLS

## TODOs

- [ ] **Q:** Brauchen wir `{vcap:{label:'auditlog'}}`?
- [ ] **BUG:** PATCH Customers → DataModification logged TWICE


- [ ] **BUG:** PATCH Customers → ReadAccess logged 
- [ ] **BAD:** READ 30 Customers → 30 ReadAccess logs → use `data_subjects` instead 
- [ ] **BAD:** Remove `npm install --production` from mta before-all script
- [ ] **GLITCH:** Simply use `npx cds build --production` in mta script
- [ ] **GLITCH**: In `{ ..., old: '1970-01-01', new: '2002-03-09' }` old should likely be `null` or `undefined`
- [ ] **GILTCH:** Eliminate `features.audit_personal_data `

- [ ] We could streamline the vocabulary → see proposal in new guide

- [ ] `@AuditLog.Operation: {...:true}` should be default

- [ ] We have to make **Node.js** and **Java** runtimes work as depicted above

  
