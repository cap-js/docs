---
layout: cookbook
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

# Basics of Data Privacy with CAP

{{ $frontmatter.synopsis }}


## Introduction


Data protection is associated with numerous legal requirements and privacy concerns. In addition to compliance with general data protection and privacy acts, you need to consider compliance with industry-specific legislation in different countries.

SAP provides specific features and functions to support compliance regarding the relevant legal requirements, including data protection. SAP does not give any advice on whether these features and functions are the best method to support company, industry, regional, or country-specific requirements. Furthermore, this information should not be taken as advice or a recommendation regarding additional features that would be required in specific IT environments. Decisions related to data protection must be made on a case-by-case basis, considering the given system landscape and the applicable legal requirements.

CAP supports applications in their obligations to comply to data privacy regulations, by automating tedious tasks as much as possible based on annotated models. Using annotations and configurations, CAP supports you using SAP BTP services, which enable you to fulfill specific data privacy requirements in your application. This % if jekyll.environment != "external" %}includes generic audit logging, for example, audit logging of read access and/or change access, based on respectively annotated models, and personal data management% else %}, means at first, personal data management% endif %}, with the help of annotations and configurations and the SAP Personal Data Manager service.

<span id="sdfgew343244" />

## Indicate Personal Data in Your Domain Model { #indicate-privacy }

Use `@PersonalData` annotations to indicate entities and elements in your domain model, which will contain personal data.
::: tip
The best practice is to do that in separate files. <br>
See also: [Using Aspects for Separation of Concerns](../../guides/domain-modeling#separation-of-concerns).
:::

Let's have a look at our [sample](https://github.com/SAP-samples/cloud-cap-samples/tree/gdpr/gdpr).

Open the _db/data-privacy.cds_ file, which contains our data privacy-related annotations.

```cds
// Proxy for importing schema from bookshop sample
using {sap.capire.bookshop} from './schema';

// annotations for Data Privacy
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
```
It is important to annotate the data privacy-relevant entities as `DataSubject`, `DataSubjectDetails`, or `Other`.


You can annotate different CDS artifacts, such as entities or fields. The data privacy annotations work on different levels - from the entity level to the field level, as described below.


### Entity-Level Annotations

Entity-level annotations indicate which entities are relevant for data privacy. The most important annotations are:

<!-- cds-mode: ignore, because it's the same annotation repeated -->
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

::: warning _❗ Data Subject and Data Object_{:.warning-title}<br>
For each specific personal data operation on a data object (like a Sales Order) a valid data subject (like a Customer) is needed.
The application has to clarify that this link between data object and data subject - which is typically induced by an annotation like
`Customer @PersonalData.FieldSemantics : 'DataSubjectID';` - is never broken. Thus, semantically correct personal data operation logs can only be written on top of a semantical correctly built application.

Make sure that the data subject is a valid CAP entity, otherwise the metadata-driven automatism will not work.
:::

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
```

This allows you to manage the data privacy-related actions on a fine granular level only using metadata definitions with annotations and without any need of implementation.

<div id="field-annos-more" />

<!-- Build that as own guide as soon as it's ready


## Retention Manager

Goal – find out which personal data has to be deleted at a certain point in time.

When?
Find out the correct time for deletion.

What?
Find out the correct amount of data to be deleted.


To support this, we’ll invent some new CDS annotation to mark all possible candidates for 'End of Business' indicating time fields in each legal ground (like Consent, Order etc.).

This new CDS annotation for "End of Business" indicators will serve as input for the retention manager.

An additional configuration at the customer site per type of transactional document defines the actual retention time (like 2 years, 5 years, etc.).
Finally, the retention manager searches all candidates (of natural persons) for possible deletion (across all object types).

Finally, the search results will be cross checked:
Check all legal grounds, if deletion of certain data really is allowed.                                                                (One active Legal ground is sufficient to stop the deletion!)

CDS could support this process by building certain queries - based on annotations - to find out which legal ground is invalid at a certain point in time (tt.mm.yyyy) and no other legal ground (of the same type) per person (DataSubject) exists.

Static implementation for such queries already exists. We try to bring this on a dynamic meta-data-driven level with help of CDS annotations and CDS queries.
 
## Consent Repository

The consent repository is already built with help of CAP and therefore with CDS and with full OData support.

See the [Concent Management Documentation](https://github.../foundation-apps/ConsentManagementDocumentation) for more details.

## Central Business Partner

To reuse the Business Partner from an SAP S/4HANA system, a central Business Partner service is created. If your application makes use of this Business Partner service, you only have to annotate the relation to the Business Partner and your application can make use of the service. In addition, all settings that are necessary to integrate all DPP processes will be performed automatically.

-->
