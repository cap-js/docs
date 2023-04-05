---
label: Protocols
synopsis: >
  Protocol Adapters translate inbound requests and messages into instances of [cds.Request](events) and cds.Query.
layout: node-js
status: released
---
<!--- Migrated: @external/node.js/protocols.md -> @external/node.js/protocols.md -->

# Protocol Adapters

Protocol Adapters translate inbound requests and messages into instances of [cds.Request](events) and cds.Query.

<!--- {% include links-for-node.md %} -->
## Default Configuration

The protocol adapters are served at `/` and only the service prefix identifies the CDS service.
The service prefix is either defined by [`@path`](../cds/cdl#service-definitions) or derived from the service name.

## Protocol Annotations

If a service is annotated with [@protocol](../node.js/services#srv-protocol), it's only served at this protocol.

## Customization

The configuration of protocols must be done programmatically before bootstrapping the CDS services, for example, in a [custom server.js](../node.js/cds-serve#custom-server-js).
::: tip
Remember to enable [the beta feature for orchestration of express middlewares](../node.js/middlewares#configuration).
::: 

If an additional protocol is configured, all services without the `@protocol` annotation are served for this protocol by default.

### OData V4

```js
cds.env.protocols = {
  'odata-v4': { path: '/odata-v4' }
}
```

If `AdminService` is served additionally at this endpoint, the path is `/odata-v4/admin`.

### REST

```js
cds.env.protocols = {
  rest: { path: '/rest' }
}
```

If `AdminService` is served additionally at this endpoint, the path is `/rest/admin`.

### GraphQL Adapter

The GraphQL protocol adapter has reached an early general availability state and can be found in the package `@cap-js/graphql` [on the default _npm_ registry](https://www.npmjs.com/package/@cap-js/graphql).
Instructions on how to get started are included within the README of the [public repository](https://github.com/cap-js/cds-adapter-graphql).

```js
cds.env.protocols = {
  graphql: { path: '/gql', impl: '@cap-js/graphql' }
}
```

#### GraphQL Schema Using CLI

The GraphQL schema can be generated stand-alone using `cds compile -2 graphql`.

### Custom Protocol Adapter

Similar to the configuration of the GraphQL Adapter, you can plug in your own protocol.
The `impl` property must point to the implementation of your protocol adapter.
Additional options for the protocol adapter are provided on the same level.

```js
cds.env.protocols = {
  'custom-protocol': { path: '/custom', impl: '<custom-impl.js>', ...options }
}
```

## Current Limitations

- Configuration of protocols must be done programmatically.
- Additional protocols do not respect `@protocol` annotation yet.
- The configured protocols do not show up in the `index.html` yet.
