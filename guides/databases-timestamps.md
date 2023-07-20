### Consitent Timestamps

Values for elements of type `DateTime`  and `Timestamp` are now handled in a consistent way across all new database services, except for timestamp precisions, along these lines:

1. **Allowed input values** — as values you can either provide `Date` objects or ISO 8601 Strings in Zulu time zone, with correct number of fractional digits (0 for DateTimes, up to 7 for Timestamps).
2. **Comparisons** — comparing DateTime with DataTime elements is possible with plain `=`,  `<`, `>`, `<=`, `>=` operators, as well as Timestamp with Timestamp elements. When comparing with values, the values have to be provided as stated above.

**IMPORTANT:** While HANA and PostgreSQL provide native datetime and timestamp types, which allow you to provide arbitrary number of fractional digits. SQLite doesn't and the best we can do is storing such values as ISO Strings. In order to support comparisons, you must ensure to always provide the correct number of digits when ingesting string values. For example:

```js
await INSERT.into(Books).entries([
  { title:'A', createdAt: '2022-11-11T11:11:11Z' },      // wrong
  { title:'B', createdAt: '2022-11-11T11:11:11.000Z' },  // correct
  { title:'C', createdAt: '2022-11-11T11:11:11.123Z' },
})
let books = await SELECT('title').from(Books).orderBy('createdAt')
console.log(books) //> would return [{title:'B'},{title:'C'},{title:'A'}]
```

The order is wrong because of the `'Z'` in A being at the wrong position.

::: tip Prefer using `Date` objects

Unless the data came in through an OData layer which applies respective data input processing, prefer using Date objects instead of string literals to avoid situations as illustrated above.

For example, the above would be fixed by changing the INSERT to:

```js
await INSERT.into(Books).entries([
  { title:'A', createdAt: new Date('2022-11-11T11:11:11Z') },
  { title:'B', createdAt: new Date('2022-11-11T11:11:11.000Z') },
  { title:'C', createdAt: new Date('2022-11-11T11:11:11.123Z') },
})
```

:::
