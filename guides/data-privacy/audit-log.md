---
layout: cookbook
shorty: Audit Log
synopsis: >
  Enable and use audit-log capabilities with your CAP application.
breadcrumbs:
  - Cookbook
  - Data Privacy
  - Audit Logging
status: released
---
<!--- Migrated: @external/guides/67-Data-Privacy/03-audit-log.md -> @external/guides/data-privacy/audit-log.md -->

# Audit Logging with CAP

{{ $frontmatter.synopsis }}

## Introduction

This section deals with Audit Logging for reading sensitive data and changes to personal data. As a prerequisite, you have [indicated entities and elements in your domain model, which will contain personal data](introduction#indicate-privacy).

% if jekyll.environment != "external" %}
Related to the security standards (SAP internal links):
- [SEC-265: Log changes to personal data](https://wiki.one.int.sap/wiki/x/nICvTw)
- [SEC-254: Log read access to sensitive personal data](https://wiki.one.int.sap/wiki/x/tqHgMg)
% endif %}

In CAP, audit logging can be handled mostly automatically by adding certain annotations to your business entity definitions and adding some configuration to your project.

::: warning _❗ Data Subject and Data Object_<br>
For each audit log on a data object (like a Sales Order) a valid data subject (like a Customer) is needed.
The application has to clarify that this link between data object and data subject - which is typically induced by an annotation like
`Customer @PersonalData.FieldSemantics : 'DataSubjectID';` - is never broken. Thus, semantically correct audit logs can only be written on top of a semantically correct built application.

Make sure that the data subject is a valid CAP entity, otherwise the metadata-driven automatism will not work.
:::

##  Audited Object is Data Subject

In our case `Customers` is the main master data entity with the semantics of 'Data Subject'.

```cds
using { cuid, Country } from '@sap/cds/common';

 entity Customers : cuid, managed {
  email        : String;
  firstName    : String;
  lastName     : String;
  creditCardNo : String;
  dateOfBirth  : Date;
  postalAddress : Association to CustomerPostalAddress on postalAddress.Customer = $self;
}

```

This entity is annotated in the _db/data-privacy.cds_ file.

```cds

annotate bookshop.Customers with @PersonalData : {
  DataSubjectRole : 'Customer',
  EntitySemantics : 'DataSubject'
}
{
  ID           @PersonalData.FieldSemantics : 'DataSubjectID';
  emailAddress @PersonalData.IsPotentiallyPersonal;
  firstName    @PersonalData.IsPotentiallyPersonal;
  lastName     @PersonalData.IsPotentiallyPersonal;
  creditCardNo @PersonalData.IsPotentiallySensitive;
  dateOfBirth  @PersonalData.IsPotentiallyPersonal;
}

annotate bookshop.Customers with @AuditLog.Operation : {
  Read   : true,
  Insert : true,
  Update : true,
  Delete : true
};

```

Here we again have the four levels of annotations as already described in the chapter [Indicate Personal Data in Your Domain Model](introduction#indicate-privacy).

When you've annotated your (business) entity like this, the audit logs for read access and data modifications will be written automatically by the underlying CAP framework.

In the context of audit logging, the `@PersonalData.IsPotentiallyPersonal` field-level annotation is relevant for inducing audit logs for _Insert_, _Update_, and _Delete_, whereas the `@PersonalData.IsPotentiallySensitive` annotation is relevant for _Read_ access audit logs.

::: warning _Warning_
The `@PersonalData.IsPotentiallySensitive` annotation induces an audit log for each and every _Read_ access.
--- Only use this annotation in [relevant cases](https://ec.europa.eu/info/law/law-topic/data-protection/reform/rules-business-and-organisations/legal-grounds-processing-data/sensitive-data/what-personal-data-considered-sensitive_en).
--- Avoid unnecessary logging activities in your application.
:::


##  Audited Object is Data Subject Details

In the first example, the audited object was identical to the data subject, but this is not always the case.

In many cases you have additional master data describing more details of the data subject stored in a separate entity.
In our terminology this has the semantics 'Data Subject Details'.

In our example we have the additional entity `CustomerPostalAddress` which contains additional master data belonging to a certain 'Customer', but which are stored in a separate entity, for better clarity or better separation of concerns.

```cds

entity CustomerPostalAddress : cuid, managed {
  Customer       : Association to one Customers;
  street         : String(128);
  town           : String(128);
  country        : Country;
  someOtherField : String(128);
};

```

This entity is annotated in the _db/data-privacy.cds_ file.

```cds
annotate bookshop.CustomerPostalAddress with @PersonalData : {
  DataSubjectRole : 'Customer',
  EntitySemantics : 'DataSubjectDetails'
}
{
  Customer @PersonalData.FieldSemantics : 'DataSubjectID';
  street   @PersonalData.IsPotentiallyPersonal;
  town     @PersonalData.IsPotentiallyPersonal;
  country  @PersonalData.IsPotentiallyPersonal;
}

annotate bookshop.CustomerPostalAddress with @AuditLog.Operation : {
  Read   : true,
  Insert : true,
  Update : true,
  Delete : true
};

```

Very similarly to the section on 'Data Subject' this entity is as well annotated in four levels.
More details on these annotations can be found in the chapter [Indicate Personal Data in Your Domain Model](introduction#indicate-privacy).

##  Audited Object is Transactional Data

In the section on 'Data Subject' and 'Data Subject Details' we have seen, how to annotate the master data entities carrying the semantical information of the 'Data Subject'.

Now we have a look at classical transactional data.

In the Personal Data Terminology all transactional data like 'Sales Orders', 'Shipments', 'Payments' are summarizes under the classification 'Other', which means they are relevant for Data Privacy, but they are neither 'Data Subject' nor 'Data Subject Details'.
More details on this Terminology can be found in the chapter [Indicate Personal Data in Your Domain Model](introduction#indicate-privacy).

In our example we have the entity 'Orders'

```cds
entity Orders : cuid, managed {
  OrderNo         : String @title:'Order Number'; //> readable key
  Items           : Composition of many OrderItems on Items.parent = $self;
  currency        : Currency;
  Customer        : Association to Customers;
  personalComment : String;
}
```

To ensure proper audit logging we annotate using the usual four levels as described in the chapter [Indicate Personal Data in Your Domain Model](introduction#indicate-privacy).

```cds
annotate bookshop.Orders with @PersonalData.EntitySemantics : 'Other'
{
  ID              @PersonalData.FieldSemantics : 'ContractRelatedID';
  Customer        @PersonalData.FieldSemantics : 'DataSubjectID';
  personalComment @PersonalData.IsPotentiallyPersonal;
}
annotate bookshop.Orders with @AuditLog.Operation : {
  Read   : true,
  Insert : true,
  Update : true,
  Delete : true
};
```

Finally, we annotate all standard operations (`Read`, `Insert`, `Update`, `Delete`) as relevant for the audit log - which should be the default case for most of the relevant business entities.

## Add Audit-Log Configuration {.impl.concept }

### Add `@sap/audit-logging` Package

```sh
npm add @sap/audit-logging
```

### Add CDS Configuration

```json
"cds": {
  "requires": {
    "[production]": {
      "audit-log": true
    },
    "[development]": {
      "audit-log": {
        "kind": "audit-log-to-console",
        "outbox": false
      },
    }
  }
  "features": {
    "audit_personal_data": true
  }
}
```

### Test-Run Locally

```sh
cds watch
```



<span id="sdfgew343224" />