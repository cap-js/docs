---
status: released
---


# Fiori Support

See [Advanced > Draft-based Editing](../advanced/fiori#draft-support) for an overview on SAP Fiori Draft support in CAP.

[[toc]]


<!--
## Serving `$metadata` Requests



## Serving `$batch` Requests

-->

## Lean Draft

Lean draft is a new approach which makes it easier to differentiate between drafts and active instances in your code. This new architecture drastically reduces the complexity and enables more features like storing active instances in remote systems while keeping the corresponding drafts in the local persistence.

### Enablement

Lean draft is enabled by default. Add this to your `cds` configuration to disable the feature:

```json
{
  "cds": {
    "fiori": {
      "lean_draft": false
    }
  }
}
```

### Handlers Registration {#draft-support}

Class `ApplicationService` provides built-in support for Fiori Draft. All CRUD events are supported for both, active and draft entities.
Please note that draft-enabled entities must follow a specific draft choreography.

The examples are provided for `on` handlers, but the same is true for `before` and `after` handlers.

  ```js
  // only active entities
  srv.on(['CREATE', 'READ', 'UPDATE', 'DELETE'], 'MyEntity', /*...*/)
  // only draft entities
  srv.on(['CREATE', 'READ', 'UPDATE', 'DELETE'], 'MyEntity.drafts', /*...*/)
  // bound action/function on active entity
  srv.on('boundActionOrFunction', 'MyEntity', /*...*/)
  // bound action/function on draft entity
  srv.on('boundActionOrFunction', 'MyEntity.drafts', /*...*/)
  ```

It's also possible to use the array variant to register a handler for both entities, for example: `srv.on('boundActionOrFunction', ['MyEntity', 'MyEntity.drafts'], /*...*/)`.

Additionally, you can add your logic to the draft-specific events as follows:

  ```js
  // When a new draft is created
  srv.on('NEW', 'MyEntity.drafts', /*...*/)
  // When a draft is discarded
  srv.on('CANCEL', 'MyEntity.drafts', /*...*/)
  // When a new draft is created from an active instance
  srv.on('EDIT', 'MyEntity', /*...*/)
  // When the active entity is changed
  srv.on('SAVE', 'MyEntity', /*...*/)
  ```

- The `CANCEL` event is triggered when you cancel the draft. In this case, the draft entity is deleted and the active entity isn't changed.
- The `EDIT` event is triggered when you start editing an active entity. As a result `MyEntity.drafts` is created.
- The `SAVE` event is just a shortcut for `['UPDATE', 'CREATE']` on an active entity. This event is also triggered when you press the `SAVE` button in UI after finishing editing your draft. Note, that composition children of the active entity will also be updated or created.

::: info Compatibility flag
For compatibility to previous variants, set `cds.fiori.draft_compat` to `true`.
:::

### Draft Locks

To prevent inconsistency, the entities with draft are locked for modifications by other users. The lock is released when the draft is saved, canceled or a timeout is hit. The default timeout is 15 minutes. You can configure this timeout by the following application configuration property:

```properties
cds.drafts.cancellationTimeout=1h
```

### Bypassing the SAP Fiori Draft Flow

Creating or modifying active instances directly is possible without creating drafts. This comes in handy when technical services without a UI interact with each other.

To enable this feature, set this feature flag in your configuration:

```json
{
  "cds": {
    "fiori": {
      "bypass_draft": true
    }
  }
}
```

You can then create active instances directly:

```http
POST /Books

{
  "ID": 123,
  "IsActiveEntity": true
}
```

You can modify them directly:

```http
PATCH /Books(ID=123,IsActiveEntity=true)

{
  "title": "How to be more active"
}
```

This feature is required to enable [SAP Fiori Elements Mass Edit](https://sapui5.hana.ondemand.com/sdk/#/topic/965ef5b2895641bc9b6cd44f1bd0eb4d.html), allowing users to change multiple objects with the
same editable properties without creating drafts for each row.

:::warning
Note that this feature creates additional entry points to your application. Custom handlers are triggered with delta
payloads rather than the complete business object.

Custom handlers need to take care that a draft entity doesn't exist, if a bound action/function is called on active entity.
:::

### Garbage Collection of Stale Drafts

Inactive drafts can be deleted automatically after a timeout. You can configure this timeout by the following configuration:

```json
{
  "cds": {
    "fiori": {
      "draft_deletion_timeout": true
    }
  }
}
```

You can set the property to one of the following:
- `true` in order to obtain the default timeout of 30 days
- number of days like `'30d'` 
- number of hours like `'72h'`
- number of milliseconds like `1000`

### Differences to Previous Version

- Draft-enabled entities have corresponding CSN entities for drafts:

    ```js
    const { MyEntity } = srv.entities
    MyEntity.drafts // points to model.definitions['MyEntity.drafts']
    ```

- Queries are now cleansed from draft-related properties (like `IsActiveEntity`)
- `PATCH` event isn't supported anymore.
- The target is resolved before the handler execution and points to either the active or draft entity:

    ```js
    srv.on('READ', 'MyEntity.drafts', (req, next) => {
      assert.equal(req.target.name, 'MyEntity.drafts')
      return next()
    })
    ```

    ::: info Special case: "Editing Status: All"
    In the special case of the Fiori Elements filter "Editing Status: All", two separate `READ` events are triggered for either the active or draft entity.
    The individual results are then combined behind the scenes.
    :::

- Draft-related properties (with the exception of `IsActiveEntity`) are only computed for the target entity, not for expanded sub entities since this is not required by Fiori Elements.
- Manual filtering on draft-related properties is not allowed, only certain draft scenarios are supported.

