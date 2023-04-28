---
layout: cds-ref
shorty: Nature of Models
synopsis: >
  Introduces the fundamental principles of CDS models.
status: released
---


# The Nature of Models

<div v-html="$frontmatter?.synopsis" />


Models in `cds` are plain JavaScript objects conforming to the _[Core Schema Notation (CSN)](./csn)_. They can be parsed from [_.cds_ sources](./cdl), read from _.json_ or _.yaml_ files or dynamically created in code at runtime.

The following ways and examples of creating models are equivalent:

### In Plain Coding at Runtime

```js
const cds = require('@sap/cds')

// define the model
var model = {definitions:{
    Products: {kind:'entity', elements:{
        ID: {type:'Integer', key:true},
        title: {type:'String', length:11, localized:true},
        description: {type:'String', localized:true},
    }},
    Orders: {kind:'entity', elements:{
        product: {type:'Association', target:'Products'},
        quantity: {type:'Integer'},
    }},
}}

// do something with it
console.log (cds.compile.to.yaml (model))
```


### Parsed at Runtime

```js
const cds = require('@sap/cds')

// define the model
var model = cds.parse (`
    entity Products {
        key ID: Integer;
        title: localized String(11);
        description: localized String;
    }
    entity Orders {
        product: Association to Products;
        quantity: Integer;
    }
`)

// do something with it
console.log (cds.compile.to.yaml (model))
```


### From _.cds_ Source Files

```cds
// some.cds source file
entity Products {
    key ID: Integer;
    title: localized String(11);
    description: localized String;
}
entity Orders {
    product: Association to Products;
    quantity: Integer;
}
```

Read/parse it, and do something with it, for example:

```js
const cds = require('@sap/cds')
cds.get('./some.cds') .then (cds.compile.to.yaml) .then (console.log)
```

> Which is equivalent to: `cds ./some.cds -2 yaml` using the CLI


### From _.json_ Files

```json
{"definitions": {
    "Products": {
        "kind": "entity",
        "elements": {
            "ID": { "type": "Integer", "key": true },
            "title": { "type": "String", "length": 11, "localized": true },
            "description": { "type": "String", "localized": true }
        }
    },
    "Orders": {
        "kind": "entity",
        "elements": {
            "product": { "type": "Association", "target": "Products" },
            "quantity": { "type": "Integer" }
        }
    }
}}
```

```js
const cds = require('@sap/cds')
cds.get('./some.json') .then (cds.compile.to.yaml) .then (console.log)
```

<div id="beforefrontends" />

### From Other Frontends

You can add any other frontend instead of using [CDL](./cdl); it's just about generating the respective [CSN](./csn) structures, most easily as _.json_. For example, different parties already added these frontends:

* ABAP CDS 2 csn
* OData EDMX 2 csn
* Fiori annotation.xml 2 csn
* i18n properties files 2 csn
* Java/JPA models 2 csn


## Processing Models

All model processing and compilation steps, which can be applied subsequently just work on the basis of plain CSN objects. There’s no assumption about and no lock-in to a specific source format.
