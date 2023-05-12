---
status: released
---

# Grow As You Go...

As your project evolves, you would gradually add new features, for example as outlined in the sections below. The idea of grow as you go is to keep you focused on your application's domain and functionality, getting fast results in inner-loop development.

Later on you can easily add configurations, **only when you realy need that**.

::: tip Intrinsic Cloud Qualities

As we see below, we can add qualities like multitenancy or extensibility late in time. This is made possible by the fact that there is no difference between a single-tenant and a multitenant application from content perspective: CAP does all the necessary things, for example for tenant isolation, behind the scenes. Similar, CAP provides intrinsic extensibility, which means there's nothing you, as an app developer need to do to enable this.

:::

## Prepare for Production

While we used SQLite in-memory databases and mocked authentication during development, we would use SAP HANA Cloud and a combination of App Router, IAS and/or XSUAA in production. We can quickly do so as follows:

```sh
cds add hana,approuter,xsuaa --for production
```

This adds respective packages and configuration to your project. The content of your project, that is, models or code, doesn't change and doesn't have to be touched. The option  `--for production` controls that these service variants are only used when in production profile, that is, when the app is deployed to the cloud. Locally you continue to develop in airplane mode.



## Deploy to Cloud

After we are prepared for production we can deploy to the cloud. In case of the SAP BTP, Cloud Foundry environment, this is commonly done using MTA tooling. The required `mta.yaml` can be added and fully generated with:

```sh
cds add mta
```



## Add Multitenancy

If you are creating a SaaS application you need to additionally add support for tenant subscriptions and tenant upgrades. When a tenant subscribes, new database containers have to be bootstraped along with other resources, like message channels. CAP provides the so-called MTX services which do that automatically in a sidecar micro service. You can add all requisite packages and configurations by:

```sh
cds add multitenancy
```



## Add Extensibility

Extensibility is required to allow customers to adapt SaaS applications to their needs, for example, by adding extension fields and entities. CAP provides powerful intrinsic extensibility. Nothing needs to be changed or added to your content for that. Again, you just need to switch it on by:

```sh
cds add extensibility
```



## Add CI/CD Pipelines

Continuous Integration and Continuous Delivery is accomplished through test and deploy pipelines based on technologies like Jenkins, Travis, or GitHub Actions. You can have a headstart by:

```sh
cds add pipeline
```



## Late-Cut Micro Services

Micro services are deployment units, with main motivations being: separate scaling, different technologies, separate delivery cycles.

Compared to *micro* services, CAP services are ***nano***: They constitute active functional entities of your application. Given their uniform, protocol-agnostic programmatic APIs, all services can be placed into one single process (that is, a monolith), or distributed across different micro services. Here's a simple example:

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
