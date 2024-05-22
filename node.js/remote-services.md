---
label: Remote Services
synopsis: >
  Class `cds.RemoteService` is a service proxy class to consume remote services via different [protocols](/node.js/cds-serve#cds-protocols), like OData or plain REST.
# layout: node-js
status: released
---

# Remote Services <Concept />

Class `cds.RemoteService` is a service proxy class to consume remote services via different [protocols](/node.js/cds-serve#cds-protocols), like OData or plain REST.

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

If the remote system you want to consume requires it, you can enable the new CSRF-token handling of `@sap-cloud-sdk/core` via configuration options `csrf` and `csrfInBatch`. These options allow to configure CSRF-token handling for each remote service separately.

#### Basic Configuration

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

In this example, CSRF handling is enabled for the `API_BUSINESS_PARTNER` service, for regular requests (`csrf: true`) and requests made within batch operations (`csrfInBatch: true`).

#### Advanced Configuration

Actually `csrf: true` is a convenient preset. If needed, you can further customize the CSRF-token handling with additional parameters:

```json
"cds": {
    "requires": {
        "API_BUSINESS_PARTNER": {
            ...
            "csrf": {  // [!code focus]
              "method": "get",  // [!code focus]
              "url": "..."  // [!code focus]
            }
        }
    }
}
```

Here, the CSRF-token handling is customized at a more granular level:

 - `method`: The HTTP method for fetching the CSRF token. The default is `head`.
 - `url`: The URL for fetching the CSRF token. The default is the resource path without parameters.


::: tip
See [Using Destinations](../guides/using-services#using-destinations) for more details on destination configuration.
:::

##  <i>  More to Come </i>

This documentation is not complete yet, or the APIs are not released for general availability. There's more to come in this place in upcoming releases.
