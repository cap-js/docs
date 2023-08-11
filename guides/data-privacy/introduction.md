---
# layout: cookbook
shorty: Basics
synopsis: >
  This guide explains the basic annotations related to data privacy.
breadcrumbs:
  - Cookbook
  - Data Privacy
  - Introduction
status: released
---
<!--- Migrated: @external/guides/67-Data-Privacy/01-intro.md -> @external/guides/data-privacy/introduction.md -->

# Basics of Data Privacy

{{ $frontmatter.synopsis }}



## Introduction


Data protection is associated with numerous legal requirements and privacy concerns. In addition to compliance with general data protection and privacy acts, you need to consider compliance with industry-specific legislation in different countries.

SAP provides specific features and functions to support compliance regarding the relevant legal requirements, including data protection. SAP does not give any advice on whether these features and functions are the best method to support company, industry, regional, or country-specific requirements. Furthermore, this information should not be taken as advice or a recommendation regarding additional features that would be required in specific IT environments. Decisions related to data protection must be made on a case-by-case basis, considering the given system landscape and the applicable legal requirements.

CAP supports applications in their obligations to comply to data privacy regulations, by automating tedious tasks as much as possible based on annotated models. Using annotations and configurations, CAP supports you using SAP BTP services, which enable you to fulfill specific data privacy requirements in your application. This means at first, personal data management, with the help of annotations and configurations and the SAP Personal Data Manager service.

ADDED FROM GUIDE #4:

Compliance to data privacy regulations is an important requirement for all busines applications nowadays. CAP provides easy ways to designate personal data, as well as out-of-the-box integration with SAP BTP services, like SAP Personal Data Manager service. This greatly relieves application developers these tedious tasks and related efforts.

::: danger _TODO_
linie zu DRM sollte gestrichelt sein
:::

<img src="./assets/Data-Privacy.drawio.svg" alt="Data Privacy.drawio.svg" style="zoom:111%;" />

::: tip
DRM integration in progress
:::

<!--
::: danger _TODO_
keep?
:::

<span id="inintroduction" />
-->



### Data Protection and Privacy Requirements

EU regulation etc. -> [Personal Data](https://en.wikipedia.org/wiki/Personal_data)

#### Right of access to personal data

See [Right of access to personal data](https://en.wikipedia.org/wiki/Right_of_access_to_personal_data) -> SAP Personal Data Manager

#### Right to be forgotten

See [Right to be forgotten](https://en.wikipedia.org/wiki/Right_to_be_forgotten) -> SAP Data Rentention Manager



### Addressed Requirements

The most essential requests you have to answer are those in the table below, with the job to be done in response to that given on the right-hand side:

| Question / Request                          | Discipline                                               |
| ------------------------------------------- | -------------------------------------------------------- |
| *When was personal data stored/changed?*    | → [Audit Logging](#audit-logging)                        |
| *What data about me do you have stored?*    | → [Personal Data Management](#sap-personal-data-manager) |
| → "Right of access to personal data"        |                                                          |
| *Please delete all personal data about me!* | → [Retention Management](#sap-data-retention-manager)    |
| → "Right to be forgotten"                   |                                                          |

<br>

::: warning
**PLEASE NOTE:** Full compliance is more than that! <br>
While CAP and SAP BTP services greatly facilitate fulfilling the obligations related to data privacy, there are usually numerous **additional regulations** you have comply to, such as from industry-specific legislation in different countries.
:::



<span id="sdfgew343244" />



## Indicate Personal Data in Your Domain Model { #indicate-privacy }

See full sample in [cloud-cap-samples](https://github.com/SAP-samples/cloud-cap-samples/tree/gdpr/gdpr).

### Base Model

In the remainder of this guide, we'll use this domain model as the base to add data privacy and audit logging.

db/schema.cds
{.sample-label}

```cds
using { Country, managed, cuid } from '@sap/cds/common';
namespace sap.capire.bookshop;

entity Customers : cuid, managed {
  emailAddress  : String;
  firstName     : String;
  lastName      : String;
  dateOfBirth   : Date;
  addresses     : Composition of Addresses on addresses.customer = $self;
  billingData   : Composition of BillingData on billingData.customer = $self;
}

entity Addresses : cuid, managed {
  customer       : Association to Customers;
  street         : String(128);
  town           : String(128);
  country        : Country;
  someOtherField : String(128);
}

entity BillingData : cuid, managed {
  customer     : Association to Customers;
  creditCardNo : String(16);
}

entity Orders : cuid, managed {
  orderNo      : String(111); // human-readable key
  customer     : Association to Customers;
  personalNote : String;
  dateOfOrder  : Date;
  Items        : Composition of many { … }
}
```

### Annotating Personal Data

Let's annotate our data model to identify personal data. In essence, in all our entities we search for elements which carry personal data, such as person names, birth dates, etc., and tag them accordingly. All found entities are classified as either *Data Subjects*, *Data Subject Details* or *Other*.

Use `@PersonalData` annotations to indicate entities and elements in your domain model, which will contain personal data.

For more details on the `@PersonalData` vocabulary, see [this](https://github.com/SAP/odata-vocabularies/blob/main/vocabularies/PersonalData.md).

::: danger _TODO_
- add BillingData to diagram
- adjust types to `DataSubject`, `DataSubjectDetails`, and `Other (e.g., Transactional Data)`
:::

<img src="./assets/Data-Subjects.drawio.svg" alt="Data Subjects.drawio" style="zoom:111%;" />

Following the [best practice of separation of concerns](../../domain-modeling#separation-of-concerns), we do that in a separate file `db/data-privacy.cds`:

db/data-privacy.cds
{.sample-label}

```cds
using {sap.capire.bookshop} from './schema';

annotate bookshop.Customers with @PersonalData : {
  DataSubjectRole : 'Customer',
  EntitySemantics : 'DataSubject'
} {
  ID           @PersonalData.FieldSemantics : 'DataSubjectID';
  emailAddress @PersonalData.IsPotentiallyPersonal;
  firstName    @PersonalData.IsPotentiallyPersonal;
  lastName     @PersonalData.IsPotentiallyPersonal;
  dateOfBirth  @PersonalData.IsPotentiallyPersonal;
}

annotate bookshop.Addresses with @PersonalData : {
  DataSubjectRole : 'Customer',
  EntitySemantics : 'DataSubjectDetails'
} {
  customer @PersonalData.FieldSemantics : 'DataSubjectID';
  street   @PersonalData.IsPotentiallyPersonal;
  town     @PersonalData.IsPotentiallyPersonal;
  country  @PersonalData.IsPotentiallyPersonal;
}

annotate bookshop.BillingData with @PersonalData : {
  DataSubjectRole : 'Customer',
  EntitySemantics : 'DataSubjectDetails'
} {
  customer     @PersonalData.FieldSemantics : 'DataSubjectID';
  creditCardNo @PersonalData.IsPotentiallySensitive;
}

annotate bookshop.Orders with @PersonalData : {
  DataSubjectRole : 'Customer',
  EntitySemantics : 'Other'
} {
  customer     @PersonalData.FieldSemantics : 'DataSubjectID';
  personalNote @PersonalData.IsPotentiallyPersonal;
}
```

It is important to annotate the data privacy-relevant entities as `DataSubject`, `DataSubjectDetails`, or `Other`.

You can annotate different CDS artifacts, such as entities or fields. The data privacy annotations work on different levels - from the entity level to the field level, as described below.

- The **entity-level annotations** signify relevant entities as *Data Subject*, *Data Subject Details*, or *Other* in data privacy terms, as depicted in the graphic below.

- The **key-level annotations** signify object primary keys, as well as references to data subjects (which have to be present on each object).

- The **field-level annotations** identify elements containing personal data.

### Entity-Level Annotations


#### EntitySemantics

Entity-level annotations indicate which entities are relevant for data privacy.

```cds
@PersonalData.EntitySemantics: 'DataSubject'
@PersonalData.EntitySemantics: 'DataSubjectDetails'
@PersonalData.EntitySemantics: 'Other'
```

Annotation            | Description
--------------------- | -------------
`DataSubject`         | The entities of this set describe a data subject (an identified or identifiable natural person), for example, Customer or Vendor.
`DataSubjectDetails`  | The entities of this set contain details of a data subject (an identified or identifiable natural person) but do not by themselves identify/describe a data subject, for example, CustomerPostalAddress.
`Other`             | Entities containing personal data or references to data subjects, but not representing data subjects or data subject details by themselves. For example, customer quote, customer order, or purchase order with involved business partners. These entities are relevant for audit logging. There are no restrictions on their structure. The properties should be annotated suitably with `FieldSemantics`.

::: warning _❗ Data Subject and Data Object_<br>
For each specific personal data operation on a data object (like a Sales Order) a valid data subject (like a Customer) is needed.

The application has to clarify that this link between data object and data subject - which is typically induced by an annotation like `Customer @PersonalData.FieldSemantics : 'DataSubjectID'` - is never broken. Thus, semantically correct personal data operation logs can only be written on top of a semantical correctly built application.

Make sure that the data subject is a valid CAP entity, otherwise the metadata-driven automatism will not work.
:::


#### DataSubjectRole

```cds
@PersonalData.DataSubjectRole: '<Role>'
```

Can be added to `@PersonalData.EntitySemantics: 'DataSubject'`. User-chosen string designing the role name to use. Default is the entity name.

Example:

```cds
annotate Customers with @PersonalData: {
  EntitySemantics: 'DataSubject',
  DataSubjectRole: 'Customer'
};
```


### Key-Level Annotations

Key-level annotations indicate the corresponding key information.

```cds
@PersonalData.FieldSemantics: 'DataSubjectID'
```

This key information consists of the `DataSubject` (= Person) and its identifiers and the corresponding personal documents (such as Order, Consent, ...) and its identifiers. The latter is always captured implicitly, so we mainly have to specify the type and the key of the `DataSubject`.


### Field-Level Annotations

Field-level annotations tag which fields are relevant for data privacy in detail.

```cds
@PersonalData.IsPotentiallyPersonal
@PersonalData.IsPotentiallySensitive
```

This allows you to manage the data privacy-related actions on a fine granular level only using metadata definitions with annotations and without any need of implementation.

::: warning _Warning_
Please see [Audit Logging](./audit-logging.md) for implications before marking data as sensitive.
:::
