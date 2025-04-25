---
synopsis: >
  Learn about the flow feature in CAP Java.
status: draft TODO: released (only valid status)
---

# Flow: Modeling State Transitions <Beta /> <Since version="4.0.0" of="com.sap.cds:cds-feature-flow" />
<style scoped>
  h1:before {
    content: "Java"; display: block; font-size: 60%; margin: 0 0 .2em;
  }
</style>

{{ $frontmatter.synopsis }}

Use the flow feature to define flows in your CDS model. The feature ensures that transitions between states are explicitly modeled, validated, and performed in a controlled manner.

## Enabling Flows { #enabling-flows }

To use the flow feature, add a dependency to [cds-feature-flows](TODO) in the `srv/pom.xml` file of your service:

```xml
<dependency>
  <groupId>com.sap.cds</groupId>
    <artifactId>cds-feature-flows</artifactId>
    <scope>runtime</scope>
</dependency>
```

## Modeling Flows { #modeling-flows }

Flows are defined in the CDS model using annotations. Flows consist out of one status element and one or more _flow_ actions. Annotate the status element with `@flow.status`. Define all transitions as bound actions (TODO link /cap/docs/cds/cdl#bound-actions), list the valid entry states using `@flow.from` and the target state using `@flow.to`. 

::: tip Best Practice
We recommend to always use `@flow.status` in combination with `@readonly`.
This gives full control over all transitions to the flow feature.
:::

### Details
Let's dive into the details of the annotations:

`@flow.status`
- This annotation is mandatory. 
- The annotated element must be either an enum or an association to an enum.
- Only one status element per entity is supported.
- Draft-enabled entities are supported.
- `null` is **not** a valid state. Model your empty state explicitly. 

`@flow.from`
- This annotation is optional. Leave it out and all states are valid entry states.
- This annotation's value type is an array. Each array element's type must match the status element.

`@flow.to`
- This annotation is optional. Leave it out and the target state is the entry state.
- This annotation's value type must match the status element.

Please note, while both `@flow.from` and `@flow.to` are optional, one of them is mandatory to mark the action as a flow action.

## Using and Extending Flows
When using the flow feature, default handlers (todo link /docs/java/cqn-services/application-services#implement-event-handler) are provided for your flow actions.

The default `Before` handler will validate that your entity instance is in a valid entry state. A validation error will return a 409 Http Status Code.

The default `On` handler will complete the action for void return types.

The default `After` handler will process the transition and update the status to the target state.

### Custom Event Handler { #custom-event-handler}
You can extend the default flow handlers with an event handler to implement custom event logic that should run on a transition. 

TODO: node example: less than 100, more than 100

TODO: does readonly mean using the persistence service in custom handlers?


## Sample { #sample }

Let's take a look at the [CAP SFLIGHT App](https://github.com/SAP-samples/cap-sflight) sample and how we can update it using the flow feature.

The `cds-feature-flow` has been added to the dependenies.

Following is an extract of the relevant parts of the entity model that has been extended with the `@flow.status` annotation:

```cds
entity Travel : managed {
  key TravelUUID : UUID;
  TravelID       : Integer default 0 @readonly;
  @flow.status
  TravelStatus   : Association to TravelStatus default 'O' @readonly;
};

type TravelStatusCode : String(1) enum {
  Open     = 'O';
  Accepted = 'A';
  Canceled = 'X';
};
```

Now, let's have a look at the flow annotations in the service model:

```cds
service TravelService @(path:'/processor') {

  entity Travel as projection on my.Travel actions {
    @(flow: { 
        from:[ Open ],                     
        to: Canceled 
    })
    action rejectTravel();
    @(flow: { 
        from:[ Open ],                     
        to: Accepted 
    })
    action acceptTravel();
  };

}
```

We can simply remove the [AcceptRejectHandler](https://github.com/SAP-samples/cap-sflight/blob/main/srv/src/main/java/com/sap/cap/sflight/processor/AcceptRejectHandler.java). All of the logic is taken care of by the flow feature. The flow feature will validate that entry state is `Open`. The flow feature will transit the status to `Accepted` and `Canceled` respectively. 

TODO: validate that draft will work the same as in contracts/tests. It looks different here.




