# Fiori Support



[[toc]]



## Serving `$metadata` Requests



## Serving `$batch` Requests



## Draft Support 

Class `ApplicationService` provides built-in support for Fiori Draft, which add these additional CRUD events:

You can add your validation logic in the before operation handler for the `CREATE` or `UPDATE` event (as in the case of nondraft implementations) or on the `SAVE` event (specific to drafts only):

```js
srv.before ('NEW','Books.drafts', ...)  // run before creating new drafts
srv.after ('NEW','Books.drafts', ...)      // for newly created drafts
srv.after ('EDIT','Books', ...)     // for starting edit draft sessions
srv.before ('PATCH','Books.drafts', ...)   // for field-level validations during editing
srv.before ('SAVE','Books.drafts', ...)    // run at final save only
```

These events get triggered during the draft edit session whenever the user tabs from one field to the next, and can be used to provide early feedback.



### Event: `'NEW'`

```tsx
function srv.on ('NEW', <entity>.drafts, req => {...})
```

Starts a draft session with an empty draft entity.



### Event: `'EDIT'`

```tsx
function srv.on ('EDIT', <entity>, req => {...})
```

Starts a draft session with a draft entity copied from an existing active entity.



### Event: `'PATCH'`

```tsx
function srv.on ('PATCH', <entity>.drafts, req => {...})
function srv.on ('PATCH', <entity>, req => {...})
```

Reacts on PATCH events on draft entities.

Same event can go to active entities, bypassing draft mechanism, but respecting draft locks.



### Event: `'SAVE'`

```tsx
function srv.on ('SAVE', <entity>.drafts, req => {...})
```

Ends a draft session by UPDATEing the active entity with draft entity data. 



### Event: `'CANCEL'`

```tsx
function srv.on ('CANCEL', <entity>.drafts, req => {...})
```

Ends a draft session by canceling, i.e., deleting the draft entity. 





## Draft Locks



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

### Differences to Previous Version

#### Draft-enabled entities have corresponding CSN entities for drafts:

```js
const { MyEntity } = srv.entities
MyEntity.drafts // points to model.definitions['MyEntity.drafts']
```

- Handlers must be registered for the correct entity, the following variants are allowed:

```js
srv.on(['CREATE', 'READ', 'UPDATE', 'DELETE'], 'MyEntity', /*...*/)
srv.on(['CREATE', 'READ', 'UPDATE', 'DELETE'], 'MyEntity.drafts', /*...*/)
srv.on('boundActionOrFunction', 'MyEntity', /*...*/)
srv.on('boundActionOrFunction', 'MyEntity.drafts', /*...*/)
srv.on('NEW', 'MyEntity.drafts', /*...*/)
srv.on('CANCEL', 'MyEntity.drafts', /*...*/)
srv.on('EDIT', 'MyEntity', /*...*/)
srv.on('SAVE', 'MyEntity', /*...*/)
```

::: details **Note:** For compatibility to the previous variants, you can set `cds.fiori.draft_compat` to `true`.
:::

- Queries are now cleansed from draft-related properties (e.g. `IsActiveEntity`)
- The target is resolved before the handler execution and points to either the active or draft entity:

```js
srv.on('READ', 'MyEntity.drafts', (req, next) => {
  assert.equal(req.target.name, 'MyEntity.drafts')
  return next()
})
```

::: details **Note:** In the special case of the Fiori Elements filter "Editing Status: All", two separate `READ` events are triggered for either the active or draft entity.
The individual results are then combined behind the scenes. Draft entries are always positioned on top of active ones.
:::

- Draft-related properties (with the exception of `IsActiveEntity`) are only computed for the target entity, not for expanded sub entities since this is not required by Fiori Elements.
- Manual filtering on draft-related properties is not allowed, only certain draft scenarios are supported.

