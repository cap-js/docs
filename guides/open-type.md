---
index: 54
title: Open Type
synopsis: >
  CAP provides out-of-the-box support for open types.
layout: cookbook  
status: released
---

# Open Type

<div v-html="$frontmatter.synopsis" />

## Open Entity and open Complex Types

An entity type or a complex type may indicate that it is open, allowing clients to add properties dynamically to instances of the type by specifying uniquely named property values in the payload used to insert or update an instance of the type. To indicate that the entity or complex type is open, the corresponding type must be annotated with `@open`.


```cds
service CatalogService {
  @open
  entity Book {
    key id : Integer;
  }
}
```

The entity `Book` is open, allowing the client to enrich the entity with additional properties, e.g.: 

```json
{"id": 1, "title": "Tow Sawyer"}
``` 
or

```json
{"title": "Tow Sawyer", 
 "author": {"id": 2, "name": "Mark Twain"}}
```

Open types can also be referenced in non-open types and entities. This, however, doesn't make the referencing entity/type open.

```cds
service CatalogService {
  type Book {
    guid: Integer;
    author: Author;
  }

  @open
  type Author {}
}
```
Allowing the following payloads:

`{"guid": 1, "author": {"id": 2, "name": "Mark Twain"}}`

Note, that type `Book` is not open thus doesn't allow dynamic properties, in contrast to type `Author`.

### Java Type mapping

#### Simple types

The simple values of deserialized JSON payload can be of type: `String`, `Boolean`, `Integer`, `BigDecimal`.

|JSON                     | Java Type of the `value`|
|-------------------------|-------------------------|
|`{"value": "Tom Sawyer"}`| `java.lang.String`      |
|`{"value": true}`        | `java.lang.Boolean`     |
|`{"value": 1}`           | `java.lang.Integer`     |
|`{"value": 36.6}`        | `java.lang.BigDecimal`  |

#### Structured types

The complex and structured types are deserialized to `Map`, Collections to `List`.

|JSON                                                               | Java Type of the `value`             |
|-------------------------------------------------------------------|--------------------------------------|
|`{"value": {"name": "Mark Twain"}}`                                | `java.util.Map<String, Object>`      |
|`{"value":[{"name": "Mark Twain"}, {"name": "Charlotte Bronte"}}]}`| `java.util.List<Map<String, Object>>`|
