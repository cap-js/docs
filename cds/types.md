---
# layout: cds-ref
shorty: Built-in Types
synopsis: >
  Find here a brief overview of the predefined types shipped with CDS.
status: released
---


# Built-in Types


The following table lists the built-in types available to all CDS models. In addition to that, there are common reuse types and aspects provided through [`@sap/cds/common`](common).


| CDS Type | Remarks | ANSI SQL <sup>(1)</sup> |
| --- | --- | --- |
| `UUID` | CAP generates [RFC 4122](https://tools.ietf.org/html/rfc4122)-compliant UUIDs <sup>(2)</sup> | _NVARCHAR(36)_  |
| `Boolean` | | _BOOLEAN_  |
| `Integer` |  | _INTEGER_  |
| `Int16` | | _SMALLINT_  |
| `Int32` | | _INTEGER_  |
| `Int64` | | _BIGINT_  |
| `UInt8` | Not available on PostgreSQL and H2 | _TINYINT_  |
| `Decimal` (`prec`, `scale`) | A *decfloat* type is used if arguments are omitted | _DECIMAL_  |
| `Double` | | _DOUBLE_  |
| `Date` | | _DATE_  |
| `Time` | | _TIME_  |
| `DateTime` | _sec_ precision | _TIMESTAMP_  |
| `Timestamp` | _µs_ precision, with up to 7 fractional digits |  _TIMESTAMP_  |
| `String` (`length`) | Default *length*: 255; on HANA: 5000 <sup>(3)</sup> | _NVARCHAR_  |
| `Binary` (`length`) | default *length*: 255; on HANA: 5000 <sup>(4)</sup> |  _VARBINARY_  |
| `LargeBinary` |  | _BLOB_ |
| `LargeString` |  | _NCLOB_  |
| `Map` | Mapped to *NCLOB* for HANA. | *JSON* type |
| `Vector` (`dimension `) | Requires SAP HANA Cloud QRC 1/2024, or later |  _REAL_VECTOR_  |


> <sup>(1)</sup> Concrete mappings to specific databases may differ.
>
> <sup>(2)</sup> See also [Best Practices](../guides/domain-modeling#don-t-interpret-uuids).
>
> <sup>(3)</sup> Configurable through `cds.cdsc.defaultStringLength`. 
>
> <sup>(4)</sup> Configurable through `cds.cdsc.defaultBinaryLength`. 

#### See also...

[Common Types and Aspects](common) {.learn-more}

[Mapping to OData EDM types](../advanced/odata#type-mapping) {.learn-more}

[HANA-native Data Types](../advanced/hana#hana-types){.learn-more}
