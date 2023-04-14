---
label: CDS Design Time
synopsis: >
  This guide is about consuming CDS design-time APIs programmatically.
layout: node-js
status: released
---

# CDS Design Time APIs

{{$frontmatter.synopsis}}

<!--- % assign cds = '<span style="color:#800; font-weight:500">cds</span>' %} -->

<!--- % include links-for-node.md %} -->
<!--- % include _toc levels="2,3" %} -->


## Import `@sap/cds-dk`

The design-time APIs are provided with package `@sap/cds-dk` and can be used as follows:

1. Install it locally:
```sh
npm add @sap/cds-dk
```

2. Import it in Node.js:
```js
const cds = require('@sap/cds-dk')
```




## <span style="color:#800; font-weight:500">cds</span>.import  <i>  (file, options) &#8594; [csn](../cds/csn) </i> { #import }

As an application developer, you have the option to convert OData specification (EDMX / XML), or OpenAPI specification (JSON) files to CSN from JavaScript API as an alternative to the `cds import` command.

> `cds.import` is available in the CDS development tool kit *version 4.3.1* onwards .

The API signature looks like this:

```js
const csn = await cds.import(file, options)
```

##### Arguments:

* `file` &mdash; Specify the path to a single input file to be converted for CSN.
* `options` &mdash; `cds.import()` support the following `options`:

<!--- % assign o = '<span style="font-weight:400">options</span>' %} -->

#### <span style="font-weight:400">options</span>.keepNamespace

_This option is only applicable for OData conversion._ <br>

| Value  |  Description                                      |
|------- |---------------------------------------------------|
| `true` | Keep the original namespace from the EDMX content.|
| `false`| Take the filename as namespace.         |

> If the option is not defined, then the CSN is generated with the namespace defined as EDMX filename.
<br>

#### <span style="font-weight:400">options</span>.includeNamespaces

_This option is only applicable for OData conversion._ <br>
It accepts a list of namespaces whose attributes are to be retained in the CSN / CDS file. To include all the namespaces present in the EDMX pass "*".

> For OData V2  EDMX attributes with the namespace "sap" & "m" are captured by default.
<br>

## <span style="color:#800; font-weight:500">cds</span>.import.from.edmx  <i>  (file, options) &#8594; [csn](../cds/csn) </i> { #import-from-edmx }

This API can be used to convert the OData specification file (EDMX / XML) into CSN.
The API signature looks like this:
```js
const csn = await cds.import.from.edmx(ODATA_EDMX_file, options)
```
<br>

## <span style="color:#800; font-weight:500">cds</span>.import.from.openapi  <i>  (file) &#8594; [csn](../cds/csn) </i> { #import-from-openapi }

This API can be used to convert the OpenAPI specification file (JSON) into CSN.
The API signature looks like this:
```js
const csn = await cds.import.from.openapi(OpenAPI_JSON_file)
```
<br>

Example:

```js
const cds = require('@sap/cds-dk')
module.exports = async (srv) => {
  const csns = await Promise.all([
    // for odata
    cds.import('./odata_sample.edmx', { includeNamespaces: 'sap,c4c', keepNamespace: true }),
    // for openapi
    cds.import('./openapi_sample.json'),
    // for odata
    cds.import.from.edmx('./odata_sample.xml', { includeNamespaces: '*', keepNamespace: false }),
    // for openapi
    cds.import.from.openapi('./openapi_sample.json')
  ]);

  for (let i = 0; i < csns.length; i++) {
    let json = cds.compile.to.json (csns[i])
    console.log (json)
  }
}
```

#### Special Type Mappings

The following mapping is used during the import of an external service API, see [Using Services](../guides/using-services/#external-service-api). In addition, the [Mapping of CDS Types](../advanced/odata#type-mapping) shows import-related mappings.

| OData                                                  | CDS Type                                                                     |
| ------------------------------------------------------ | ---------------------------------------------------------------------------- |
| _Edm.Single_                                           | `cds.Double` + `@odata.Type: 'Edm.Single'`                                |
| _Edm.Byte_                                             | `cds.Integer` + `@odata.Type: 'Edm.Byte'`                                 |
| _Edm.SByte_                                            | `cds.Integer` + `@odata.Type: 'Edm.SByte'`                                |
| _Edm.Stream_                                           | `cds.LargeBinary` + `@odata.Type: 'Edm.Stream'`                           |
| _Edm.DateTimeOffset<br>Precision : Microsecond_        | `cds.Timestamp` + `@odata.Type:'Edm.DateTimeOffset'` + `@odata.Precision:<>` |
| _Edm.DateTimeOffset<br>Precision : Second_             | `cds.DateTime` + `@odata.Type:'Edm.DateTimeOffset'` + `@odata.Precision:0`   |
| _Edm.DateTime<br>Precision : Microsecond_ <sup>1</sup> | `cds.Timestamp` + `@odata.Type:'Edm.DateTime'` + `@odata.Precision:<>`       |
| _Edm.DateTime<br>Precision : Second_ <sup>1</sup>      | `cds.DateTime` + `@odata.Type:'Edm.DateTime'` + `@odata.Precision:0`         |

<sup>1</sup> only OData V2

