---
shorty: Project Layouts
synopsis: >
  Learn more details about recommended project layouts, customizing layouts and best practices.
status: released
impl-variants: true
---

# Project Setup and Layouts


{{$frontmatter.synopsis}}

## Start New Projects with `cds init` {:#cds-init}

Use `cds init` to start new projects. 

<div class="impl node">

```sh
cds init <project-name>
```
</div>

<div class="impl java">

```sh
cds init <project-name> --add-java
```
</div>

Following the ideas of _Convention over Configuration_ and _Grow as you go_ new CAP projects have a minimal setup. Yet as soon as you add models, you can deploy them to databases, and as soon as you add a first service definition, you get a full-fledged OData server up and running, for example using `cds watch`. {:.impl .node}

Following the ideas of _Convention over Configuration_ and _Grow as you go_ new CAP projects have a minimal setup. Yet as soon as you add models, you can deploy them to databases, and as soon as you add a first service definition, you get a full-fledged OData server up and running, for example using `mvn cds:watch`. {:.impl .java}

[Learn more in the **Getting Started in a Nutshell** guide.](../in-a-nutshell){:.learn-more}




## Default Project Layouts

Projects created with [`cds init`](#cds-init) have this default layout: {:.impl .node}

Projects created with [`cds init --add-java`](#cds-init) have this default layout: {:.impl .java}

| Files/Folders | Description |
|:--- |:--- |
| _app/_ | UI content goes in here; one or more in subfolders |
| _db/_ | [Domain Models](../../guides/domain-models/) and database-related content go in here |
| _srv/_ | [Service definitions](../../guides/providing-services/) and implementations go in here |
| _package.json_ or _pom.xml_ | your project descriptor |


While you’re free to choose your own project layout, we recommend adopting the following default layout to leverage built-in support and zero configuration.

You could argue that a domain model isn’t necessarily database-related, and if there’s a database involved, domain models can usually be deployed to it as is. Putting the domain models there help you to benefit from CAP's convention-over-configuration default, to deploy all content from _./db_ to a database.



## Customizing Layouts

Many `cds` commands work with the above project layout by default. For example, when you run `cds watch`, CDS models will be automatically fetched and loaded from these locations: {:.impl .java}

Many `cds` and `mvn cds` commands work with the above project layout by default. For example, when you run `mvn cds:watch` or `mvn spring-boot:run`, CDS models will be automatically fetched and loaded from these locations: {:.impl .java}

- _db/index.cds_ or _db/*.cds_
- _srv/index.cds_ or _srv/*.cds_
- _app/index.cds_ or _app/*.cds_
- _schema.cds_
- _services.cds_

These locations are taken from a configuration option `cds.roots`, which in turn you can inspect using the `cds env` command: 

```sh
cds env get roots
#> [ 'db/', 'srv/', 'app/', 'schema', 'services' ]
cds env get folders
#> { db:'db/', srv:'srv/', app:'app/' }
```

You can change these settings to adjust your project layout, for example, in your _package.json_ file as documented in the [Node.js Configuration](../../node.js/cds-env) guide: 

```json
{
  "cds": {
    "folders": { "db":"db/", "srv":"srv/", "app":"app/" },
    "roots": [ <...cds.folders>, "schema", "services" ],
    ...
  }
}
```

> The values shown above reflect the defaults.



## Best Practices

A project can comprise data models as well as content for multiple databases, multiple services, and multiple UI apps. These may end up in several deployables that go to different runtime containers. For example:

* All UI apps are deployed as static web content to frontend servers.
* All services including implementation go to single Node.js servers.
* The data models and content go to different database servers.




###  <span style="color:teal">Good</span>: Keep Related Pieces in One Project

Distributed deployment is common and by no means a reason to split everything into separate projects as you certainly want all pieces to be deployed in concert. So we recommend to always put related modules together in one project.

#### Rules of Thumb:

  * Go for separate projects if the result has an independent lifecycle.
  * Otherwise, put all related modules in one project.
  * In particular never split along private interfaces.

###  <span style="color:darkred">Bad</span>: Splitting into Projects per Deployable

In contrast, if you split into separate projects - worst case one per UI app and per each service - this would mean that each module would have an individual lifecycle and would have to be deployed separately. Suppose that you made changes to your service and  corresponding ones to the UI app that uses it. You'd have to synchronize the deployments and if one fails the other one might be unusable.

