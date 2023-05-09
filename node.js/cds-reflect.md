---
shorty: cds.reflect
synopsis: >
  Find here information about reflecting parsed CDS models in CSN representation.
layout: node-js
status: released
---
<!--- Migrated: @external/node.js/cds-reflect.md -> @external/node.js/cds-reflect.md -->

# Reflecting CDS Models

{{$frontmatter?.synopsis}}

<!--- % assign m = '<span style="color:grey"> m</span>' %} -->
<!--- % include links-for-node.md %} -->
<!--- % include _toc levels="2,3" %} -->

[def]: ../cds/csn#definitions
[defs]: ../cds/csn#definitions



## cds.**reflect**  <i>  ([csn](../cds/csn)) &#8674; LinkedCSN </i> {#cds-reflect .method style="margin-bottom: 0px}

## cds.**linked**  <i>  ([csn](../cds/csn)) &#8674; LinkedCSN </i> {#cds-linked .method style="margin-top: 0px"}
[`cds.linked`]: #cds-linked


Method `cds.linked` (or `cds.reflect` which is an alias to the same method) turn given parsed models, into instances of [class `LinkedCSN`](#linked-csn), thus adding the reflection methods documented in the following section.

In addition they turn all definitions, and all elements thereof, to _linked_ definitions by prototype-chaining them to their base definitions up to one of [`cds.builtin.types`]. This in turn makes all definitions instances of the respective [`cds.builtin.classes`](#cds-builtin-classes), and allows to use the methods [as documented below](#cds-builtin-classes) on them.

For example this usage of `cds.linked`:

```js
const m = cds.linked (CDL`
  type Bar : String(22);
  entity Foo { bar: Bar }
  entity Woo as projection on Foo;
`)
```

... will result in the equivalent of this:

```js
const { entity, 'cds.String':String } = cds.builtin.types
const Bar = {__proto__: String }
const Foo = {__proto__: entity, elements: { bar: {__proto__: Bar } }}
const Woo = {__proto__: Foo }
const m = new LinkedCSN ({ definitions: { Bar, Foo, Woo }})
```


Returned instances are cached, so subsequent calls to `cds.reflect` with the same parsed model return the same cached instance.

```js
let model = await cds.load ('some-cds-model')
let reflected = cds.linked (model)       //> result is cached
let reflected2 = cds.linked (model)      //> === reflected
let reflected3 = cds.linked (reflected)  //> === reflected
```



## Class **`LinkedCSN`** {#linked-csn}
[reflected model]: #cds-reflect
[linked model]: #cds-reflect
[LinkedCSN]: #cds-reflect

Models passed through [`cds.linked`] become instances of this class, and hence inherit the following properties and methods:

### . services {.property}

This is a getter property providing convenient and cached access to all service definitions in a model.

```js
let csn = CDL`
  service CatalogService { ... }
  service AdminService { ... }
`
let m = cds.linked (csn)
let [ CatalogService, AdminService ] = m.services
```


### . entities() {.method}
### . events() {.method}

### . operations() {.method}

These properties / methods provide convenient and cached access to a model's definitions within a given namespace.
If no namespace is specified, the model's declared namespace is used, if any.

For example:

```js
let csn = CDL`
  namespace my.bookshop;
  entity Books {...}
  entity Authors {...}
  service CatalogService {
    entity ListOfBooks as projection on Books {...}
  }
`
let m = cds.linked (csn)
let { Books, Authors } = m.entities
let { ListOfBooks } = m.entities ('my.bookshop.CatalogService')
```

The methods each return an object of respective definitions. Object destructuring operators allow to easily access single definitions by name as shown above.



### m. each* (x, defs?) {#each .method }


Fetches definitions matching the given filter, returning an iterator on them.

```js
let m = cds.reflect (csn)
for (let d of m.each('entity')) {
  console.log (d.kind, d.name)
}
```

The first argument **_x_** specifies a filter to match definitions, which can be one of:

- a `function` returning `true` or `false`
- a `string` referring to a _kind_ of definition

Derived kinds are supported, for example, `m.each('struct')` matches structs
as well as entities; kind `'any'` matches all.

The second optional argument **_[defs]_** allows to specify the definitions to fetch in, defaults to `this.definitions`.



### m. all (x, defs?) {#all .method }

Convenience shortcut to [`[... model.each()]`](#each), for example, the following are equivalent:

```js
m.all('entity')        //> using shortcut
[...m.each('entity')]  //> using spread operator
```


### m. find (x, defs?) {#find .method }

Convenience shortcut to fetch definitions matching the given filter, returning the first match, if any. For example:

```js
let service = m.find('service')
```

The implementation uses to [`.each()`](#each) as follows:

```js
for (let any of m.each('service'))  return any
```




### m. foreach / forall (x, visitor, defs) {#foreach .method }

Calls the visitor for each definition matching the given filter. `foreach` iterates through the passed in defs only, `forall` in addition walks through all nested element definitions hierarchically.

* `x` — the filter to match definitions [&rarr; see _.each(x)_](#each)
* `visitor` — the callback function
* `defs` — the definitions to fetch in, default: `this.definitions`

Examples:

```js
// print the names of all services
let m = cds.reflect(csn)
m.foreach ('service', s => console.log(s.name))
```
```js
// print the names of all Associations in Books element
let { Books } = m.entities()
m.foreach ('Association', a => console.log(a.name), Books.elements)
```
```js
// print the names of all Associations in the model
m.forall ('Association', a => console.log(a.name))
```
```js
// print hierarchy of all definitions recursively
let m = cds.linked(csn)
m.forall (d => {
  let s=''; for (let p=d.parent; p; p=p.parent)  s += '  - '
  console.log (s, d.kind, d.name)
})
```




## cds. builtin .classes {#cds-builtin-classes}

[`cds.builtin.classes`]: #cds-builtin-classes


This property gives you access to the very roots of `cds`'s type system. When a model is passed through [`cds.linked`] all definitions effectively become instances of one of these classes.
In essence they are defined as follows:

```js
class any {...}
class context extends any {...}
cds.service = class service extends context {...}
cds.type = class type extends any {...}
              class scalar extends type {...}
                class boolean extends scalar {...}
                class number extends scalar {...}
                class date extends scalar {...}
                class string extends scalar {...}
cds.array  = class array extends type {...}
cds.struct = class struct extends type {...}
cds.entity = class entity extends struct {...}
cds.event = class event extends struct {...}
cds.Association = class Association extends type {...}
cds.Composition = class Composition extends Association {...}
```

> A few prominent ones of the above classes are available through top-level shortcuts as indicated by the `cds.<classname> =` prefixes in the above pseudo code, find more details on these in the following sections.

For example, you can use these classes as follows:

```js
let model = CDL`
   entity Books { author: Association to Authors; }
   entity Authors { key ID: UUID; }
`)
let m = cds.linked(model)
let { Books, Authors } = m.entities
let isEntity = Books instanceof cds.entity
let keys = Books.keys
let { author } = Books.elements
if (author.is2many) ...
```



### instanceof

You can use JavaScript's standard `instanceof` in combination with the built-in classes to check a linked definition's type:

```js
let m = cds.linked(csn)
let { Foo } = m.entities
if (Foo instanceof cds.entity)  console.log ("it's an entity")
```



### mixin() {.method}

Provided a convenient way to enhance one or more of the builtin classes with additional methods.
Use it like that:

```js
const cds = require ('@sap/cds')

// simplistic csn2cdl enablement
cds.builtin.classes .mixin (
  class type {
    toCDL(){ return `${this.kind} ${this.name} : ${this.typeAsCDL()};\n` }
    typeAsCDL(){ return `${this.type.replace(/^cds\./,'')}` }
  },
  class struct {
    typeAsCDL() { return `{\n${ Object.values(this.elements).map (
      e => `  ${e.toCDL()}`
    ).join('')}}`}
  },
  class entity extends cds.struct {
    typeAsCDL() { return (
      this.includes ? this.includes+' ' : ''
    ) + super.typeAsCDL() }
  },
  class Association {
    typeAsCDL(){ return `Association to ${this.target}` }
  },
)

// test drive
let csn = CDL`
entity Books : cuid { title:String; author: Association to Authors }
entity Authors : cuid { name:String; }
aspect cuid : { key ID:UUID; }
`
cds.linked(csn).foreach (d => console.log(d.toCDL()))
```





### `any` {.class}

All [`cds.linked`] definitions are instances of this class, or subclasses thereof, and hence support the following properties and methods:



#### . name {.property}

The linked definition's fully qualified name as a non-enumerable property.



#### . kind {.property}

The linked definition's resolved kind as a non-enumerable property.
One of `context`, `service`, `entity`, `type`, `aspect`, `event`, `element`, or `annotation` as documented in the [CSN specification](../cds/csn#definitions).




#### any. is (kind)  {.method}

Checks if a linked definition is of certain kind. Besides the [specified `kinds`](#kind), the argument may also be `struct`, `array`, or `view`.



### cds. Association {.class}


All linked definitions of type `Association` or `Composition`, including elements, are instances of this class, which primarily provides convenience getters access the target definition, or to check its type or cardinality.


#### . _target {.property}

Refers to the association's resolved target definition.


#### . isAssociation {.property}

Convenient shortcut to check whether a definition is an Association. Returns `true` for all Associations, including Compositions.

#### . isComposition {.property}

Convenient shortcut to check whether a definition is a Composition. Returns `true` for all Compositions.

#### . is2one {.property}

Convenient shortcut to check whether an association definition is to-one or to-many. See also the specification of [CSN Associations](../cds/csn#associations) { .indent}


### cds. Composition {.class}

### cds. entity {.class }

```tsx
class cds.entity extends cds.struct {...}
```

All linked entity definitions are instances of this class, which primarily provides convenience getters to quickly access all `keys`, `Associations`, or `Compositions` within the entity's `elements`.

#### . keys {.property}

A getter returning a cached object with an entity definition's declared primary keys by name. The returned object adheres to the specification of [CSN Definitions][defs].


#### . associations {.property}

A getter returning a cached object of all Associations from an entity definition's elements. The returned object adheres to the specification of [CSN Definitions][defs].

#### . compositions {.property}

A getter returning a cached object of all Compositions from an entity definition's elements. The returned object adheres to the specification of [CSN Definitions][defs].


#### . texts {.property}

Returns the linked definition's fully qualified name + `'.texts'` to easily refer to the texts entity containing translations for `localized` elements, if any.

[Learn more about **Localized Data**](../guides/localized-data){.learn-more}


#### . drafts {.property}

If draft is enabled, a definition to easily refer to draft data for the current entity is returned.

[Learn more about **Draft Data**](../advanced/fiori#draft-support){.learn-more} { .indent}



### cds. event {.class}

```tsx
class cds.entity extends cds.struct {...}
```


### cds. type {.class}

```tsx
class cds.type extends any {...}
```


### cds. struct {.class }

```tsx
class cds.entity extends cds.type {...}
```

This is the base class of a  struct elements, types, aspects, and entities.

#### . elements {.property}

The entity's declared elements as [documented in the CSN Specification](../cds/csn#entity-definitions). { .indent}



### cds. service {.class}

```tsx
class cds.type extends any {...}
```



## cds. builtin. types {.property}
[`cds.builtin.types`]: #cds-builtin-types


This property gives you access to all prototypes of the builtin classes as well as to all linked definitions of the [builtin pre-defined types](../cds/types). The resulting object is in turn like the `definitions` in a [LinkedCSN].

Actually, at runtime CDS is in fact bootstrapped out of this using core [CSN](../cds/csn) object structures and [`cds.linked`] techniques. Think of it to be constructed as follows:

```cds
cds.builtin.types = cds.linked (CDL`
  using from './roots';
  context cds {
    type UUID         : String(36);
    type Boolean      : boolean;
    type Integer      : number;
    type UInt8        : Integer;
    type Int16        : Integer;
    type Int32        : Integer;
    type Int64        : Integer;
    type Integer64    : Integer;
    type Decimal      : number;
    type Double       : number;
    type Date         : date;
    type Time         : date;
    type DateTime     : date;
    type Timestamp    : date;
    type String       : string;
    type Binary       : string;
    type LargeString  : string;
    type LargeBinary  : string;
  }
`) .definitions
```

With `./roots` being this in-memory CSN:

```js
const { any, context, service ,
  type, scalar, string, number, boolean, date,
  array, struct, entity, event, aspect
  Association, Composition
} = cds.builtin.classes

const roots = module.exports = {definitions:{
  any: new any,
  context: new context ({type:'any'}),
  type: new type ({type:'any'}),
    scalar: new scalar ({type:'type'}),
      string: new string ({type:'scalar'}),
      number: new number ({type:'scalar'}),
      boolean: new boolean ({type:'scalar'}),
      date: new date ({type:'scalar'}),
    array: new array ({type:'type'}),
    struct: new struct ({type:'type'}),
      entity: new entity ({type:'struct'}),
      event: new event ({type:'struct'}),
      aspect: new aspect ({type:'struct'}),
    Association: new Association ({type:'type'}),
      Composition: new Composition ({type:'Association'}),
  service: new service ({type:'context'}),
}}
```
> Indentation indicates inheritance.
