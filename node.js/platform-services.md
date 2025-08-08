---
label: Platform Services
synopsis: >
  Platform services provide CAP-level integrations to technical components of SAP BTP.
#status: released
---

# Platform Services <Internal />

<div v-html="$frontmatter?.synopsis" />

[[toc]]


## Unified Customer Landscape (UCL) <Internal />

<!-- COPIED FROM JAVA -->
The CAP integration with the Unified Customer Landscape (UCL) makes it easy to plug into UCL´s Tenant Mapping API (aka Service Provider Integration Interface (SPII)).
This is required if your application shall participate in UCL formations and exchange configuration data with other participants of the formation.

BLA BLA BLA

Activate `UCLService` via:

```jsonc
"cds": {
  "requires": {
    "ucl": true
  }
}
```

Implement `assign` and `unassign` callbacks as follows:

```js
const cds = require('@sap/cds')

cds.on('served', async () => {
  const ucl = await cds.connect.to('ucl')
  ucl.on('assign', async function(req) {
    // execute assign procedure

    return {
      state: 'READY',
      configuration: { ... }
    }
  })
  ucl.on('unassign', async function(req) {
    // execute unassign procedure

    return {
      state: 'READY',
      configuration: { ... }
    }
  })
})
```
