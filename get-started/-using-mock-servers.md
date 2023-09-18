---
shorty: Grow As You Go
synopsis: >
  This section contains **best practices for speeding up development** by jump-starting projects
  with zero setup, eliminating boilerplate code, and parallelizing work.
# status: released
---
<!--- Migrated: @external/get-started/07-grow-as-you-go.md -> @external/get-started/grow-as-you-go.md -->

# Grow As You Go...

{{$frontmatter?.synopsis}}

<!--- % include _toc levels="2,3,6" %} -->
<!--- % include links.md %} -->

## Jump-Starting Projects {#jumpstart}

Assuming that you've installed [_@sap/cds-dk_](jumpstart#setup), jump-starting a project in CAP is as simple as this:

```sh
mkdir demo && cd demo  # create a new project folder
cds watch              # ask cds to watch for things to come
```


###### Convention over Configuration

Following the principles of *Convention over Configuration*, CAP provides defaults for many things that you'd have to configure in other frameworks. Stay within the confines of these defaults to benefit from things just working automatically. You can always override the defaults by adding your own configurations.

###### Zero Setup

The project folder is empty at the beginning, so there's really no setup required. No config files, no manifests whatsoever. The simple reason is that we don't need them in these early phases of a project. We may need some later on, for example, when we reach the step about [Deploying to the Cloud](../guides/deployment/), but there's no need to bother with this now.

## Contracts First

Most frequently, CAP projects are about creating services. Service definitions describe the API contract between a service provider and its consumers. To speed things up, you can quickly create an all-in-one service as follows:

Copy and paste this into a file `srv/cat-service.cds`:

```cds
@path:'/browse'
service CatalogService {

  entity Books {
    key ID : UUID;
    title  : String;
    descr  : String;
    author : Association to Authors;
  }

  entity Authors {
    key ID : UUID;
    name   : String;
    books  : Association to many Books on books.author=$self;
    birth  : Date;
    death  : Date;
  }

}
```

<!--Having contracts like these in place allows to **[parallelize your teams](#parallelize-your-work)** working on different ends early on.-->

###### Prefer Top-Down Approaches

Instead of following a bottom-up approach, starting from the data model, then putting services on top, then adding UIs, and so on, it's much better to apply a top-down approach as follows:

1. Roughly sketch your application's usage and use-cases, for example, your UIs.
2. Capture required interfaces in [use case-oriented service definitions](#single-purposed-services).
3. Start building the actual UIs on top, ***and in parallel…***
4. Have other teams working on the data models below.

This ***(a)*** allows you to separate and parallelize work loads and ***(b)*** results in much better service interfaces than the one you'd get by using the bottom-up approach.

<div id="beforerunningootb" />

## Running Out of the Box

When we save the file we created in the former step, the `cds` watcher in the terminal immediately reacts, showing this output:

```sh
[cds](cds) - connect to datasource - sqlite::memory:
[cds](cds) - serving CatalogService at /browse
[cds](cds) - service definitions loaded from:

  srv/cat-service.cds
  node_modules/@sap/cds/common.cds

[cds](cds) - server listening on http://localhost:4004 ... (terminate with ^C)
[cds](cds) - launched in: 355.732ms
```

###### Full-Fledged OData Services

Click the link [http://localhost:4004](http://localhost:4004), ... et voila, we are in contact with a full-fledged OData service (for example, see [$metadata](http://localhost:4004/browse/$metadata)​) in which we can even start [Fiori previews](http://localhost:4004/$fiori-preview/?service=CatalogService&entity=Books) to get idea of what a UI might look like.

Let's do some **ad hoc tests**:

* [Browse Books w/ author's name](http://localhost:4004/browse/Books?$select=ID,title&$expand=author($select=name))
* [Browse Authors w/ written books](http://localhost:4004/browse/Authors?$expand=books)

###### Served by Generic Providers

What we see here are the effects of [Generic Providers](../guides/providing-services), which handle many things out of the box, such as compiling the CDS models into [OData](../advanced/odata) `$metadata` documents on the fly, as well automatically serving all CRUD requests, thereby handling all the OData protocol features such as `$batch`, up to complex choreographies such as [Fiori Draft](../advanced/fiori#draft-support). This saves us lots of work at this point and allows us to immediately go on with the next steps instead of implementing all of this in boilerplate code.

[Learn more about generic providers.](../guides/providing-services){.learn-more}

<div id="beforemockingappserv" />

## Mocking App Services {#with-mocks}

Use `cds run --in-memory` to quickly start a lightweight Node.js server with *sqlite's* transient in-memory database instead of always deploying to and connecting to your target database. Do that not only in Node.js projects but also as a mock server in Java projects, for example, for frontend-related tasks, or as a mock up for remote services to integrate with.

*Prerequisites*

* API description of the mocked service
* CAP tools installed ([Create a Business Service with Node.js Using Visual Studio Code](https://developers.sap.com/tutorials/cp-apm-nodejs-create-service.html))
* Node.js installed ([Official Node.js website](https://nodejs.org))

> The sample mock server created in the following steps is based on the mock server developed in the TechEd 2019 tutorial [Creating an SAP S/4HANA Extension with SAP Cloud Application Programming Model and SAP Cloud SDK](https://github.com/SAP-samples/cloud-cap-walkthroughs/tree/master/exercises-node/exercise04).

###### Create a Project for the Mock Server

1. Create an empty project for the mock server by executing `cds init mockserver` in the terminal.
2. Execute `code mockserver` to open the newly created project in VS Code.
3. Open the package.json file and add `"@sap/cds-dk": "^1.0.0"` as a dependency. Execute `npm i` to install all dependencies.

###### Add Service API Definition

1. Download the service API definition from the [SAP Business Accelerator Hub](https://api.sap.com/api/API_BUSINESS_PARTNER/overview) in EDMX format.
2. Import the downloaded API definition by running `cds import ~/Downloads/API_BUSINESS_PARTNER.edmx`.
This converts the EDMX service API definition to a Core Schema Notation (CSN) definition and places it into a local subfolder `srv/external`.

###### Add a Dummy `services.cds` File

1. In the `srv` folder, create a file named `services.cds`.
2. Add this line in the file:

```cds
using { API_BUSINESS_PARTNER } from './external/API_BUSINESS_PARTNER';
```

> Keep this file empty to serve imported APIs the default way. It can be used to tailor the mock server to your specific needs, for example, by adding or overriding certain definitions.

###### Run the Mock Server

1. Execute `cds run --with-mocks --in-memory` to start the mock server with in-memory database.

Alternatively you can execute `cds watch`, which essentially is a shortcut to the same `cds run` command but also starts a monitor to restart the server automatically if sources are changed.
{.indent}

###### Optionally Add Sample Data

1. Create a new file `init.js` in the `srv` folder.
2. Paste the following code:

```js
module.exports = (db)=>{
  const { A_BusinessPartnerAddress: Addresses } = db.entities(
    'API_BUSINESS_PARTNER'
  )
  return cds.run ([
    INSERT.into(Addresses).columns(
      'BusinessPartner',
      'AddressID',
      'CityName',
      'StreetName'
    ).rows(
      [ '1003764', '28238', 'Walldorf', 'Dietmar-Hopp-Allee' ],
      [ '1003765', '28241', 'Palo Alto', 'Hillview Avenue' ],
      [ '1003766', '28244', 'Hallbergmoos', 'Zeppelinstraße' ],
      [ '1003767', '28247', 'Potsdam', 'Konrad-Zuse-Ring' ]
    )
    // add more INSERTs here, as appropriate
  ])
}
```

###### Mock Custom Responses

To extend the mock server with custom logic, you can [create a custom handler](../guides/providing-services#adding-custom-logic). To do so, create a `.js` file with the same name next to the imported service definition file, in our case `srv/external/API_BUSINESS_PARTNER.js`. Add the custom logic there:

```js
module.exports = cds.service.impl (srv => {
  // add your custom handlers here...
})
```

###### Mock Error Cases

To create error cases, explicitly return errors in a custom handler by using the [`req.error`](../node.js/events#req-error) or [`req.reject`](../node.js/events#req-reject) functions. For example, add the following code in the `API_BUSINESS_PARTNER.js` file:

```js
module.exports = cds.service.impl(srv => {
  srv.before('READ', 'A_BusinessPartnerAddress', req => {
    const { BusinessPartner, AddressID:ID } = req.data
    if (BusinessPartner === '1003764' && ID === '28238')
      req.reject (500, 'Your error message.')
  })
})
```

To trigger this error, use the following request:

```http
GET http://localhost:4004/api-business-partner/A_BusinessPartnerAddress(BusinessPartner='1003764',AddressID='28238')
```

###### Reset Mock Data at Runtime

To reset the mock data at runtime without restarting the mock server, define an [unbound action](../guides/providing-services#custom-actions-functions).

> When using `cds watch`, executing `rs` in the terminal with the running watch command will restart the mock server and reset the mock data without the need of an unbound action.

Declare the action in the mock service definition. In `srv/services.cds` add the following code:

```cds
extend service API_BUSINESS_PARTNER with {
  action reset();
}
```

In `srv/external/API_BUSINESS_PARTNER.js` add the implementation of the action:

```js
    srv.on('reset',async () => {
        const db = await cds.connect.to('db')
        await db.run(()=> require('../init')(db))
    })
```

This will delete the data from the database and fill it with the initial data.

Trigger the reset action with the following POST request:

```http
GET http://localhost:4004/api-business-partner/reset
```

<div id="beforegrowingon" />


## Growing On...

* [Domain Modeling](../guides/domain-modeling)
* [Providing](../guides/providing-services)
* [Events & Messaging](../guides/messaging/)
* [Using Generic Providers](../guides/providing-services#generic-providers)
* [Using Databases](../guides/databases)
* [Localization (i18n)](../guides/i18n)
* [Adding Localized Data](../guides/localized-data)
* [Adding Temporal Data](../guides/temporal-data)
* [Adding Authorization](../guides/authorization)
* [Adding Data Privacy](../guides/data-privacy/)
* [Using Multitenancy](../guides/deployment/as-saas)
* [Reuse & Compose](../guides/extensibility/composition)
* [SaaS Extensibility](../guides/extensibility/)
* [Serving OData APIs](../advanced/odata)
* [Serving SAP Fiori UIs](../advanced/fiori)
* [Deploying to the Cloud](../guides/deployment/)
* [Adding Audit Logging](../guides/data-privacy/audit-logging)
* [Using Monitoring](../advanced/monitoring) & Analytics
* Adding Tests
* [Using CI/CD](../guides/deployment/cicd)

## Deploying to the Cloud

CAP applications can be deployed to SAP BTP, Cloud Foundry environment. In the end, it's about deploying regular Node.js and/or Java applications, and about creating and binding appropriate service instances (see the [Cloud Foundry Developer Guide](https://docs.cloudfoundry.org/devguide/)). For more details, see [Deploying to the Cloud](../guides/deployment/).


<div id="endofmockserver" />