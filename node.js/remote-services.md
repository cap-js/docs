---
label: Remote Services
synopsis: >
  Class `cds.RemoteService` is a service proxy class to consume remote services via different [protocols](protocols), like OData or plain REST.
# layout: node-js
status: released
---
<!--- Migrated: @external/node.js/remote-services.md -> @external/node.js/remote-services.md -->

# Remote Services { .concept}

Class `cds.RemoteService` is a service proxy class to consume remote services via different [protocols](protocols), like OData or plain REST.

[[toc]]

<!--- % include links-for-node.md %} -->
<!--- % include _chapters toc="2,3" %} -->

<!--- % assign srv = '<span style="color:grey">&#8627; </span>' %} -->
<!--- % assign srv = '<span style="color:grey">srv</span>' %} -->


## cds.**RemoteService**  <i>  class </i> { #cds-remote-service}

### class cds.**RemoteService**  <i>  extends cds.Service </i>

## cds.RemoteService — Configuration {#remoteservice-configuration }
[remoteservice configuration]: #remoteservice-configuration


<!--- % assign tx = '<span style="color:grey">srv</span>' %} -->



### CSRF-Token Handling

If the remote system you want to consume requires it, you can enable the new CSRF-token handling of `@sap-cloud-sdk/core` via configuration options: `csrf: true/false` and `csrfInBatch: true/false`. These options allow to configure CSRF-token handling for each remote service separately. Global configuration `cds.env.features.fetch_csrf = true` is deprecated.

```json
"cds": {
    "requires": {
        "API_BUSINESS_PARTNER": {
            "kind": "odata",
            "model": "srv/external/API_BUSINESS_PARTNER",
            "csrf": true,
            "csrfInBatch": true
        }
    }
}
```
::: tip
See [Using Destinations](../guides/using-services#using-destinations) for more details on destination configuration.
:::

##  <i>  More to Come </i>

This documentation is not complete yet, or the APIs are not released for general availability. There's more to come in this place in upcoming releases.
