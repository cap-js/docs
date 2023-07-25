---
outline: [1,3]
status: released
synopsis: Start with a minimal setup and a grow-as-you-go approach.
---


# Jumpstart & Grow as You Go

CAP promotes getting started with **minimal upfront setup**, based on **convention over configuration**, and a **grow-as-you-go** approach, adding settings and tools later on, only when you need them. So, let's get started…

> Looking for other ways to setup and start projects?
> See the Get Started menu in the left-hand-side sidebar.

[[toc]]





## Setup for Local Development {#setup}

Follow the steps below to set up a local development environment. If you are a developer, you might already have most things installed, such as Node.js, Git, SQLite, Java, Maven, VS Code, and you only need to install `cds-dk` as described in step 2 below.



### 1. Install Node.js

#### … from [nodejs.org](https://nodejs.org)

Choose the **LTS** version, via the left-hand side button:

<img src="./assets/jumpstart/image-20230310202845639.png" alt="Screenshot showing exemplary buttons from the nodejs.org download page. The term LTS is magnified on the left-hand button." style="zoom: 33%;" />




### 2. Install CAP's cds-dk

… by running this in a terminal:

```sh
npm add -g @sap/cds-dk
```
[Running into problems? &rarr; See the troubleshooting guide.](../advanced/troubleshooting#npm-installation){.learn-more}


### 3. Install Git

Run this in a terminal to check whether you already have Git installed:
```sh
git version
```
If not, download and run the appropriate installer from [git-scm.com](https://git-scm.com/downloads).


### 4. Install SQLite

- **On Windows only:** Download and run the appropriate installer from [sqlite.org](https://sqlite.org/download.html).

### 5. Install Java & Maven

- **If you want to go for CAP Java projects**, ensure you have [Java](https://sapmachine.io) and [Maven](https://maven.apache.org/download.cgi) installed.


### 6. Install Visual Studio Code

#### … from [code.visualstudio.com](https://code.visualstudio.com)

Choose your preferred editor or IDE for developing CAP applications. <br>
We recommend Visual Studio Code.

In addition we recommend installing these VS Code Extensions:

   - [**SAP CDS Language Support**](https://marketplace.visualstudio.com/items?itemName=SAPSE.vscode-cds)
   - [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint)
   - [REST Client](https://marketplace.visualstudio.com/items?itemName=humao.rest-client)
   - [SQLite Viewer](https://marketplace.visualstudio.com/items?itemName=qwtel.sqlite-viewer)
   - [Rainbow CSV](https://marketplace.visualstudio.com/items?itemName=mechatroner.rainbow-csv)






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

::: details **Note:** VS Code CLI on macOS needs extra setup

Users on macOS must first run a command (*Shell Command: Install 'code' command in PATH*) to add the VS Code executable to the `PATH` environment variable. Find detailed instructions in [VS Code's macOS setup guide](https://code.visualstudio.com/docs/setup/mac#_launching-from-the-command-line).

:::



### Project Structure

The default project structure of CAP projects is as follows:

```zsh
bookshop/        # Your project's root folder
├─ app /         # UI-related content goes here
├─ srv/          # Service-related content goes here
├─ db/           # Domain models and database-related content goes here
├─ package.json  # Contains configuration for cds-dk
└─ readme.md     # A readme placeholder
```



### Minimal Configuration

Following the [convention over configuration](https://en.wikipedia.org/wiki/Convention_over_configuration) paradigm, CAP has defaults for many things that you’d have to configure in other frameworks. The goal is that things should just work out of the box, with zero configuration, whenever possible. You can override these defaults by specific configuration if you need to do so.

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

::: tip Convention over Configuration

We recommend to stay with CAP's conventions to benefit from things just working out of the box. Only add configurations or override the defaults if you really need to do so.

:::



## Rapid Development

After having created a project we can immediately start a live server by running this in an [*Integrated Terminal*](https://code.visualstudio.com/docs/terminal/basics) in Visual Studio Code:

::: code-group

```sh [Node.js]
cds watch
```

```sh [Java]
cd srv && mvn cds:watch
```

:::

::: details From the log output we see  `cds watch` is waiting for things to come...

```log
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

Whenever we add content, `cds watch` would react immediately, for example, by bootstrapping an in-memory SQLite database, filling it with initial data, and serving services to OData automatically, without need for time-consuming builds and deployments.

:::

### Mocked Platform Services

The rapid development experience, with minimum setup and fast turn-around times, is enabled by the CAP runtimes providing local stand-ins for common platform services. These allow us to run fully functional servers locally during development, in 'inner loop' mode.

Following are the defaults used automatically in *production*, or *development* mode.

| Production             | Development                      |
| ---------------------- | -------------------------------- |
| SAP HANA Cloud         | SQLite (in-memory or persistent) |
| IAS, XSUAA             | Mocked Authentication Strategy   |
| Message Brokers, Kafka | File-based Messaging             |
| Audit Log Service      | Console-based Logger             |



::: tip Stay in Inner Loop Development

... as much as possible to benefit from **accelerated development** at **minimized costs**. Use the full near-production setup only when you need it, for example for integration tests before releases.

:::

### Mocked Remote Services

A CDS service definition is all CAP needs to serve fully-functional OData services, with extensive database access included out of the box. This also allows us to mock remote services in service integration scenarios.

For example, assumed we want to integrate Business Partners from S/4, we do so by importing a service API, for example, the [EDMX from SAP Business Accelerator Hub](https://api.sap.com/api/API_BUSINESS_PARTNER), and translating that into a CDS service definition using `cds import`. As we now have a service definition we can just serve this by CAP as a mock implementation instead of always having to use the remote S/4 service during development. This again greatly speeds up development turn-around times.

A step-by-step walkthrough can be found in our [TechEd 2022 sample](https://github.com/SAP-samples/teched2022-AD265).{.learn-more}

## Speed up Your Pipelines

We strongly recommend to use the mocked services setup not only in development but also for functional tests in your test pipelines to speed them up by magnitudes.

Not only are inner-loop pipeline tests much faster, they also mean there's less complex setups, less dependency on high availability, and no risks your tests are considered denial of service attacks by used services.

::: tip Overall, using inner-loop tests...

helps speeding up your test runs by magnitudes, makes them more robust, and not the least: helps to minimize costs. Make use of that as much as possible and only use the full monty for *real* integration tests.

:::
