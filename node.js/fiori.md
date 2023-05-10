# Fiori Support



[[toc]]



## Serving `$metadata` Requests



## Serving `$batch` Requests



## Draft Support 

Class `ApplicationService` provides built-in support for Fiori Draft, which add these additional CRUD events:

You can add your validation logic in the before operation handler for the `CREATE` or `UPDATE` event (as in the case of nondraft implementations) or on the `SAVE` event (specific to drafts only):

```js
srv.before ('NEW','Books.draft', ...)  // run before creating new drafts
srv.after ('NEW','Books.draft', ...)      // for newly created drafts
srv.after ('EDIT','Books', ...)     // for starting edit draft sessions
srv.before ('PATCH','Books.draft', ...)   // for field-level validations during editing
srv.before ('SAVE','Books.draft', ...)    // run at final save only
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

