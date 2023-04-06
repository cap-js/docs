---
layout: cookbook
label: Personal Data Management
shorty: PDM
synopsis: >
  Use the SAP Personal Data Manager (PDM) with a CAP application
breadcrumbs:
  - Cookbook
  - Data Privacy
  - PDM
status: released
---
<!--- Migrated: @external/guides/67-Data-Privacy/02-personal-data-manager.md -> @external/guides/data-privacy/pdm.md -->

# Personal Data Management with CAP

{{ $frontmatter.synopsis }}

::: warning _❗ To follow this cookbook hands-on you need an enterprise account._ <!--  -->
The SAP Personal Data Manager service is currently only available for [enterprise accounts](https://discovery-center.cloud.sap/missiondetail/3019/3297/). An entitlement in trial accounts is not possible.
:::

## Provide a Service Interface to SAP Personal Data Manager

SAP Personal Data Manager needs to call into your application to read personal data so you have to define a respective service endpoint, complying to the interface required by SAP Personal Data Manager.
Following the CAP principles, we recommend adding a new dedicated CAP service that handles all the personal data manager requirements for you. This keeps the rest of your data model clean and enables reuse, just as CAP promotes it.


### CAP Service Model for SAP Personal Data Manager

Open the _srv/pdm-service.cds_ file, which contains the content for the Personal Data Manager service.

```cds
//using from '@capire/orders';
using {sap.capire.bookshop as db} from '../db/data-privacy';
using {sap.capire.bookshop.Books} from '@capire/bookshop';
using {sap.capire.bookshop.Orders} from '@capire/orders';
using {sap.capire.bookshop.OrderItems} from '@capire/orders';

@requires: 'PersonalDataManagerUser' // security check
service PDMService{

  entity Customers             as projection on db.Customers;
  entity CustomerPostalAddress as projection on db.CustomerPostalAddress;

  //   create view on Orders and Items as flat projection
  entity OrderItemView         as
    select from Orders {
          ID,
      key Items.ID        as Item_ID,
          OrderNo,
          Customer.ID     as Customer_ID,
          Customer.email  as Customer_Email,
          Items.book.ID   as Item_Book_ID,
          Items.quantity    as Item_Quantity,
          Items.netQuantity as Item_NetQuantity
    };

  //  annotate new view
  annotate PDMService.OrderItemView with @(PersonalData.EntitySemantics : 'Other') {
    Item_ID        @PersonalData.FieldSemantics : 'ContractRelatedID';
    Customer_ID    @PersonalData.FieldSemantics : 'DataSubjectID';
    Customer_Email @PersonalData.IsPotentiallyPersonal;
  };

  //  Data Privacy annotations on 'Customers' and 'CustomerPostalAddress'
  //  are derived from original entity definitions.


// annotations for Personal Data Manager - Search Fields
annotate bookshop.Customers with @Communication.Contact : {
  n    :
  {
    surname : lastName,
    given   : firstName
  },
  bday : dateOfBirth
}

};
```
::: tip
Make sure to have [indicated all relevant entities and elements in your domain model](introduction#indicate-privacy).
:::

### Provide Flat Projections

As an additional step, you have to create flat projections on the additional business data, like transactional data.

In our model, we have `Orders` and `OrderItems`, which are connected via a [composition](https://github.com/SAP-samples/cloud-cap-samples/blob/gdpr/orders/db/schema.cds). Since SAP Personal Data Manager needs flattened out structures, we define a helper view `OrderItemView` to flatten this out.

We have to then add data privacy-specific annotations to this new view as well. The `OrderItemView` as transactional data is marked as `Other`. In addition, it is important to tag the correct field, which defines the corresponding data subject, in our case that is `Customer_ID    @PersonalData.FieldSemantics: 'DataSubjectID';`


### Annotating Search Fields

In addition, the most important search fields of the data subject have to be annotated with the corresponding annotation `@Communication.Contact`.

To perform a valid search in the SAP Personal Data Manager application, you will need _Surname_, _Given Name_, and _Birthday_ or the _Data Subject ID_. Details about this annotation can be found in
[Communication Vocabulary](https://github.com/SAP/odata-vocabularies/blob/main/vocabularies/Communication.md).



### Restrict Access Using the `@requires` Annotation

To restrict access to this sensitive data, the `PDMservice` is protected by the `@requires: 'PersonalDataManagerUser'` annotation. Calling the `PDMservice` externally without the corresponding permission is forbidden. The Personal Data Manager service calls the `PDMservice` with the needed role granted. This is configured in the _xs-security.json_ file, which is explained later.

[Learn more about security configuration and the SAP Personal Data Manager.](https://help.sap.com/docs/PERSONAL_DATA_MANAGER/620a3ea6aaf64610accdd05cca9e3de2/4ee5705b8ded43e68bde610223722971.html#loio8eb6d9f889594a2d98f478bd57412ceb){:.learn-more}


### Activate Access Checks in _xs-security.json_

Because we protected the `PDMservice`, we need to establish the security check properly. In particular, you need the _xs-security.json_ file to make the security check active. The following _xs-security.json_ is from our sample.

```json
{
    "xsappname": "gdpr-bookshop",
    "tenant-mode": "shared",
    "scopes": [
        {
            "name": "$XSAPPNAME.PersonalDataManagerUser",
            "description": "Authority for Personal Data Manager",
            "grant-as-authority-to-apps": [
                "$XSSERVICENAME(pdm)"
            ]
        }
    ]
}
```

Here you define that your personal data manager service instance, called `pdm`, is allowed to access your CAP application granting the `PersonalDataManagerUser` role.


### Add `@sap/xssec` Library

To make the authentication work, you have to enable the security strategy by installing the `@sap/xssec` package:

```sh
npm install @sap/xssec
```

[Learn more about authorization in CAP using Node.js.](../../node.js/authentication#jwt){:.learn-more}


At this point, you are done with your application. Let's set up the SAP Personal Data Manager and try it out.



## Connecting SAP Personal Data Manager



### Build and Deploy Your Application

The Personal Data Manager can't connect to your application running locally. Therefore, you first need to deploy your application. In our sample, we added two manifest files using `cds add cf-manifest` and SAP HANA configuration using `cds add hana`.

The general deployment is described in detail in [Deploy Using Manifest Files](../../guides/deployment/to-cf).

Make a production build:

```sh
cds build --production
```

Deploy your application:

```sh
cf create-service-push
```

For multitenant-specific information, refer to our [Multitenancy Guide](../../guides/deployment/as-saas).


### Subscribe to SAP Personal Data Manager Service

[Subscribe to the service](https://help.sap.com/docs/PERSONAL_DATA_MANAGER/620a3ea6aaf64610accdd05cca9e3de2/ef10215655a540b6ba1c02a96e118d66.html) from the _Service Marketplace_ in the SAP BTP cockpit.


![tile in the cockpit](assets/pdmCockpitCreate.png){:width="300"}

Follow the wizard to create your subscription.


### Create Role Collections

SAP Personal Data Manager comes with the following roles:

Role Name | Role Template
----------|------
PDM_Administrator | PDM_Administrator
PDM_CustomerServiceRepresentative | PDM_CustomerServiceRepresentative
PDM_OperatorsClerk | PDM_OperatorsClerk

All of these roles have two different _Application Identifiers_.
::: tip
Application identifiers with **!b** are needed for the UI, and identifiers with **!t** are needed for executing the Postman collection.
:::

[Learn more about defining a role collection in SAP BTP cockpit](https://help.sap.com/products/BTP/65de2977205c403bbc107264b8eccf4b/4b20383efab341f181becf0a947a5498.html){:.learn-more}

### Create a Service Instance

You need a configuration file, like the following, to create a service instance for the Personal Data Manager.

```json
{
  "xs-security": {
    "xsappname": "gdpr-bookshop",
    "authorities": ["$ACCEPT_GRANTED_AUTHORITIES"]
  },
  "fullyQualifiedApplicationName": "gdpr-bookshop",
  "appConsentServiceEnabled": true
}


```

Create a service instance using the SAP BTP cockpit or execute the following command:

```sh
cf create-service personal-data-manager-service standard pdm -c ./.pdm/pdm-instance-config.json
```

### Bind the Service Instance to Your Application.

With both the application deployed and the SAP Personal Data Manger service set up, you can now bind the service instance of the Personal Data Manager to your application. Use the URL of your application in a configuration file, such as the following example, which you need when binding a service instance.

```json
{
  "fullyQualifiedApplicationName": "gdpr-bookshop",
  "fullyQualifiedModuleName": "gdpr-srv",
  "applicationTitle": "PDM Bookshop",
  "applicationTitleKey": "PDM Bookshop",
  "applicationURL": "https://gdpr-srv.cfapps.eu10.hana.ondemand.com/", // get the URL from the CF CLI command: cf apps
  "endPoints": [
    {
      "type": "odatav4",
      "serviceName": "pdm-service",
      "serviceTitle": "GDPR",
      "serviceTitleKey": "GDPR",
      "serviceURI": "pdm",
      "hasGdprV4Annotations": true,
      "cacheControl": "no-cache"
    }
  ]
}
```

Here the `applicationURL`, the `fullyQualifiedModuleName`, and the `serviceURI` have to be those of your Cloud Foundry deployment and your CAP service definition (_services-manifest.yaml_).

Bind the service instance using the SAP BTP cockpit or execute the following command:

```sh
cf bind-service gdpr-srv pdm -c ./.pdm/pdm-config.json
```

You need two configuration files for the Personal Data Manager service.
In our [sample](https://github.com/SAP-samples/cloud-cap-samples/tree/gdpr/gdpr), you can find the _.pdm/pdm-instance-config.json_ and _.pdm/pdm-config.json_ files. Use them in addition to the [reference documentation](
https://help.sap.com/docs/PERSONAL_DATA_MANAGER/620a3ea6aaf64610accdd05cca9e3de2/4ee5705b8ded43e68bde610223722971.html) to build your own files later on.

## Using the SAP Personal Data Manager Application

Open the SAP Personal Data Manager application from the _Instances and Subscriptions_ page in the SAP BTP cockpit.

![tile in the cockpit](assets/pdmCockpit.png){:width="500"}

In the personal data manager application you can search for data subjects with _First Name_, _Last Name_, and _Date of Birth_, or alternatively with their _ID_.

![PDM UI](assets/pdmApplication.png){:width="500"}
