---
outline: [1,3]
---



# Jumpstart & Grow as You Go

CAP promotes getting started with **minimal upfront setup**, based on **convention over configuration**, and a **grow-as-you-go** approach, adding settings and tools later on, only when you need them. So, let's get started... 

> Looking for other ways to setup and start projects?   
> See the Get Started menu in the left-hand-side sidebar.

[[toc]]






## Setup for Local Development

### **1. Install Node.js** 

#### ... from [nodejs.org](https://nodejs.org) 

Choose the **LTS** version, via the feft-hand side button:

<img src="./assets/jumpstart/image-20230310202845639.png" alt="image-20230310202845639" style="zoom: 33%;" />




### **2. Install CAP's cds-dk** 

... by running this in a terminal:

```sh
npm add -g @sap/cds-dk
```



### **3. Install Visual Studio Code** 

#### ... from [code.visualstudio.com](https://code.visualstudio.com).

Choose your preferred editor or IDE for developing CAP applications. <br>
We recommend Visual Studio Code. 

In addition we recommend installing these VSCode Extensions:

   - [**SAP CDS Language Support**](https://marketplace.visualstudio.com/items?itemName=SAPSE.vscode-cds) 
   - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
   - [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)
   - [SQLite Viewer](https://marketplace.visualstudio.com/items?itemName=qwtel.sqlite-viewer)
   - [Rainbow CSV](https://marketplace.visualstudio.com/items?itemName=mechatroner.rainbow-csv)



### 4. Install Git 

Run this in a terminal to check, whether you already have git installed:

```sh
git version
```

If not, download and run the appropriate installer from [git-scm.com](https://git-scm.com/downloads).



## Jumpstart CAP Projects

Assumed we want to create a project named *bookshop*, we'd do so like this:

::: code-group

```sh [Node.js]
cds init bookshop
```
```sh [Java]
cds init bookshop --add java
```

:::

Then open it in Visual Studio Code:

```sh
code bookshop
```

::: details **Note:** VSCode CLI on macOS needs extra setup

Users on macOS must first run a command (*Shell Command: Install 'code' command in PATH*) to add VS Code executable to the `PATH` environment variable. Find detailed instructions on this in [VSCode's macOS setup guide](https://code.visualstudio.com/docs/setup/mac#_launching-from-the-command-line).

:::



### Project Structure

The default project structure of CAP projects is as follows:

```sh
bookshop/        # Your project's root folder
├─ app /         # UI-related content goes here
├─ srv/          # Service-related content goes here
├─ db/           # Domain models and database-related content goes here
├─ package.json  # Contains configuration for cds-dk  
└─ readme.md     # A readme placeholder
```



### Convention over Configuration

CAP has defaults for many things that you’d have to configure in other frameworks. The goal is things should just work out of the box with zero configuration as much as possible. You can override these default by specific configuration if you need to do so.

For example you could override the defaults for the project structure like that: 

::: code-group

```jsonc [package.json]
{ ...
  "cds": {
    "folders": {
       "db": "database/",
       "srv": "services/",
       "app": "uis/"
    }
  }
}
```

:::

::: tip 

We recommend to **stay with CAP's conventions** to benefit from things just working out-of-the-box. Only add configurations or overrride the defaults if you really need to do so.

:::



## Rapid Development

After having created a project we can immediately start a life server by running this in an [*Integrated Terminal*](https://code.visualstudio.com/docs/terminal/basics) in Visual Studio Code: 

::: code-group

```sh [Node.js]
cds watch
```

```sh [Java]
cd srv && mvn cds:watch
```

:::

::: details From the log output we see  `cds watch` is waiting for things to come...

```sh
[dev] cds w

cds serve all --with-mocks --in-memory?
live reload enabled for browsers

      ___________________________

   No models found in db/,srv/,app/,schema,services. // [!code focus]
   Waiting for some to arrive... // [!code focus]

```

:::

We'd go on by adding CDS domain models and service definitions, as well as custom logic, as outlined in these sample project guides:

-  [*Hello World!*](hello-world)  
- *[Getting Started in a Nutshell](in-a-nutshell)*  

::: tip Served out of the box...

Whenever we add content, `cds watch` would react immediately, e.g. by bootstrapping an in-memory SQLite database, filling it with initial data, and serving services to OData automatically, without need for time-consuming builds and deployments. 

:::

### Mocked Platform Services

The rapid development experience, with minimum setup and fast turn-around times, is enabled by the CAP runtimes providing local stand-ins for common platform services. These allow us to run fully functional servers locally during development, in 'inner loop' mode.

Following are the defaults used automatically in *production*, or *development* mode. 

| Production             | Development                      |
| ---------------------- | -------------------------------- |
| HANA Cloud             | SQLite (in-memory or persistent) |
| IAS, XSUAA             | Mocked Authentication Strategy   |
| Message Brokers, Kafka | File-based Messaging             |
| Audit Log Service      | Console-based Logger             |



::: tip Stay in Inner Loop Development

... as much as possible to benefit from **accellerated development** at **minimized costs**. Use the full near-production setup only when you need it, for example for integration tests before releases. 

:::

### Mocked Remote Services

A CDS service definition is all CAP needs to serve fully-functional OData services, with extensive database access included out of the box. This also allows us to mock remote services in service integration scenarios. 

For example, assumed we want to integrate Business Partners from S/4, we do so by importing a service API, e.g., the [edmx from SAP API Business Hub](https://api.sap.com/api/API_BUSINESS_PARTNER), and translating that into a CDS service definition using `cds import`. As we now have a service definition we can just serve this by CAP as a mock implementation instead of always having to use the remote S/4 service during development. This again greatly speeds up development turn-around times. 

:::details Try it yourself 
A step by step example for this can be found [here](https://github.com/SAP-samples/teched2022-AD265)
:::

### Speed up Your Pipelines

We strongly recommend to use the mocked services setup not only in development but also for functional tests in your test pipelines to speed them up by magnitudes.

Not only are inner-loop pipeline test much faster, they also mean there's less complex setups, less dependency on high availability, and no risks your tests are considered denial of service attacks by used services. 

::: tip Overall, using inner-loop tests...

helps speeding up your test runs by magnitudes, makes them more robust, and not the least: helps to minimize costs. Make use of that as much as possible and only use the full monty for *real* integration tests.

:::



## Grow as You Go...

As your project evolves, you would gradually add new features, for example as outlined in the sections below. The idea of grow as you go is to keep you focused on your application's domain and functionality, getting fast results in inner-loop development. 

Later on you can easily add configurations, **only when you realy need that**. 

::: tip Intrinsic Cloud Qualities

As we see below, we can add qualities like multitenancy or extensibility late in time. This is made possible by the fact that there is no difference between a single-tenant and a multitenant application from content perspective: CAP does all the neccessary things, e.g. for tenant isolation, behind the scenes. Similar, CAP provides intrinsic extensibility, which means there's nothing you, as an app developer need to do to enable this. 

:::

### Prepare for Production

While we used SQLite in-memory databases and mocked authentication during development, we would use HANA Cloud and a combination of App Router, IAS and/or XSUAA in production. We can quickly do so as follows:

```sh
cds add hana,approuter,xsuaa --for production
```

This adds respective packages and configuration to your project. The content of your project, i.e., models or code, doesn't change and doesn't have to be touched. The option  `--for production` controls that these service variants are only used when in production profile, that is, when the app is deployed to the could. Locally you continue to develop in airplane mode. 



### Deploy to Cloud

After we are prepared for production we can deploy to the cloud. In case of BTP CloudFoundry, this is commonly done using MTA tooling. The required `mta.yaml` can be added and fully generated with:

```sh
cds add mta
```



### Add Multitenancy 

If you are creating a SaaS application you need to additionally add support for tenant subscriptions and tenant upgrades. When a tenant subscribes, new database containers have to be bootstraped along with other resources, like message channels. CAP provides the so-called MTX services which do that automatically in a sidecar micro service. You can add all requisite packages and configurations by:

```sh
cds add multitenancy
```



### Add Extensibility

Extensibility is required to allow customers to adapt SaaS applications to their needs, for example, by adding extension fields and entities. CAP provides powerful intrinsic extensibility: Nothing needs to be changed or added to your content for that. You again just need to switch it on by:

```sh
cds add extensibility
```



### Add CI/CD Pipelines

Continuous Integration and Continuous Delivery is accomplished through test and deploy pipelines based on technologies like Jenkins, Travis, or GitHub Actions. We can have a headstart by: 

```sh
cds add pipelines
```



## Late-Cut Micro Services

Micro services are deployment units, with main motivations being: separate scaling, different technologies, separate delivery cycles. 

Compared to *micro* services, CAP services are ***nano***: They constitute active functional entities of your application. Given their uniform, protocol-agnostic programmatic APIs, all services can be placed into one single procces (that is, a monolith), or distributed accross different micro services. Here's a simple example:

::: code-group
```js [ServiceA]
class ServiceA extends cds.Service { init(){
   const b = cds.connect.to('ServiceB')
   this.on ('foo', ()=> b.send('bar'))
}}
```
```js [ServiceB]
class ServiceB extends cds.Service { init(){
   this.on ('*', console.log)
}}
```
:::

If nothing else is configured, both services would be served in the same process. 
We can move them to separate ones, seperate micro services by simply adding this config to the one hosting `ServiceA`:

```json
{"cds":{
  "requires": {
    "ServiceB": "rest"
  }
}}
```

::: details Kind `rest` declares the service to be remote, consumed via REST protocol.
:::

This flexibility allows you to, again, focus on your domain, and avoid the efforts and costs of premature microservice design and overhead, especially in the early phases of development. 

::: tip Avoid Premature Micro-Services Design

Experience shows that initial cuts of applications into micro services, quite frequently turn out to be problematic later on. Refrain from that and rather delay the cuts until you learned more about you application during development.

::: 
