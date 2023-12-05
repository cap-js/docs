---
label: Hybrid Testing
synopsis: >
  How to locally test your application with real cloud services.
permalink: advanced/hybrid-testing
status: released
uacp: Used as link target from Help Portal at https://help.sap.com/products/BTP/65de2977205c403bbc107264b8eccf4b/29c25e504fdb4752b0383d3c407f52a6.html and https://help.sap.com/products/BTP/65de2977205c403bbc107264b8eccf4b/e4a7559baf9f4e4394302442745edcd9.html
---

# Hybrid Testing { #hybrid-testing}

## Introduction

You can easily test your CAP application using a local database and mock ups. But at some point, you're going to want to test with real cloud services. Of course, you can always deploy your application to the cloud.

With  **hybrid testing** capabilities, you can stay in your local development environment and avoid the long turnaround times of cloud deployment, and you can selectively decide which services you want to use from the cloud.

Use the `cds bind` command to connect your application to services on the cloud. Start your application with the `hybrid` profile to use these service bindings. You can switch between local mock configuration and cloud service configuration by simply setting or omitting the profile parameter.

## Bind to Cloud Services

### Services on Cloud Foundry

```sh
cds bind -2 my-hana:my-hana-key
```

Binds your local CAP application to the service key `my-hana-key` of the service instance `my-hana`, using your currently targeted Cloud Foundry space. The service instance `my-hana` is a _managed_ service.
cds bind also supports Cloud Foundry _user-provided_ services.

[Got errors? See our troubleshooting for connection issues with SAP HANA Cloud.](../get-started/troubleshooting#connection-failed-89008){.learn-more}
[Learn how to bind to user-provided services on Cloud Foundry.](#binding-user-provided-services){.learn-more}

Output:

```log
[bind] - Retrieving data from Cloud Foundry...
[bind] - Binding db to Cloud Foundry managed service my-hana:my-hana-key with kind hana.
[bind] - Saving bindings to .cdsrc-private.json in profile hybrid.
[bind] -
[bind] - TIP: Run with cloud bindings: cds watch --profile hybrid
```

**Note:** The service key needs to be created beforehand as it is not created by default when using _mta_ deployment.

::: tip
You can omit `:my-hana-key` here, because the key name is just the name of the instance with `-key` added.
:::

In many cases, CAP knows which CDS service and kind to use for a cloud service. Like in the previous example, the `db` CDS service gets bound and set to the `hana` kind, because the given service instance is of type `hana` with plan `hdi-shared`.

[Learn how to bind to arbitrary cloud services.](#with-cds-service-and-kind){.learn-more}

The binding information is stored in the _.cdsrc-private.json_ file of your project in the `requires` section:

```json
{
  "requires": {
    "[hybrid]": {
      "db": {
        "kind": "hana",
        "binding": {
          "type": "cf",
          "apiEndpoint": "https://api.sap.hana.ondemand.com",
          "org": "your-cf-org",
          "space": "your-cf-space",
          "instance": "my-hana",
          "key": "my-hana-key",
          "vcap": {
            "label": "hana",
            "plan": "hdi-shared"
          },
          "resolved": false
        }
      }
    }
  }
}
```

Bindings are assigned to the `hybrid` profile by default.

Note that no credentials are saved. Only the information about **where the credentials can be obtained** is stored on your machine.

[All `cds bind` command line options](#cds-bind-usage){.learn-more}

#### User-Provided Services on Cloud Foundry { #binding-user-provided-services}

```sh
cds bind my-ups -2 my-user-provided-service
```

Binds your local CAP application to the user provided service instance `my-user-provided-service`, using your currently targeted Cloud Foundry space. The service name `my-ups` is optional - it has to match the service name used in the CDS `required` services configuration.

Output:

```log
[bind] - Retrieving data from Cloud Foundry...
[bind] - Binding my-ups to Cloud Foundry user provided service my-user-provided-service.
[bind] - Saving bindings to .cdsrc-private.json in profile hybrid.
[bind] -
[bind] - TIP: Run with cloud bindings: cds watch --profile hybrid
```

`cds watch --profile hybrid` will automatically resolve user-provided service instance bindings using the same technique as for any other managed service binding.

### Services on Kubernetes


You can bind to **Service Bindings** of Open Service Broker service instances, such as SAP BTP services, on your Kubernetes cluster and to plain Kubernetes **Secrets** by adding the `--on k8s` option to the `cds bind` command:

```sh
cds bind -2 <service binding or secret> --on k8s
```

The command uses your current Kubernetes context. That is your current server and namespace. You need to be logged in as a precondition.

#### Bind to Kubernetes Service Bindings

To list all **Service Bindings** in your current Kubernetes context, you can use the `kubectl get servicebindings` command:

```log
NAME                  SERVICE-INSTANCE      SECRET-NAME           STATUS   AGE
cpapp-xsuaa-binding   cpapp-xsuaa           cpapp-xsuaa-secret    Ready    11s
```

Use the service binding name for the `-2` option:

```sh
cds bind -2 cpapp-xsuaa-binding --on k8s
```

Output:

```log
[bind] - Retrieving data from Kubernetes...
[bind] - Binding uaa to Kubernetes service binding cpapp-xsuaa-binding with kind xsuaa
[bind] - Saving bindings to .cdsrc-private.json in profile hybrid
[bind] -
[bind] - TIP: Run with cloud bindings: cds watch --profile hybrid
```

The binding information is stored in the _.cdsrc-private.json_ file of your project in the `requires` section:

```json
{
  "requires": {
    "[hybrid]": {
      "auth": {
        "binding": {
          "type": "k8s",
          "name": "cpapp-xsuaa-binding",
          "cluster": "https://apiserver.d9a6204.kyma-stage.shoot.live.k8s-hana.ondemand.com",
          "instance": "cpapp-xsuaa",
          "namespace": "dev",
          "secret": "cpapp-xsuaa-secret",
          "resolved": false,
          "vcap": {
            "label": "xsuaa",
            "plan": "application"
          }
        },
        "kind": "xsuaa"
      }
    }
  }
}
```

#### Bind to Kubernetes Secrets

Alternatively, you can bind to Kubernetes **Secrets**.

You can use the `kubectl get secrets` command to list all secrets in your current Kubernetes context:

```log
NAME                                    TYPE                                  DATA   AGE
cap-hdi-container                       Opaque                                11     44h
```

Use the secret name for the `-2` option.

You need to provide either the service argument or the `--kind` option as well, because secrets have no service metadata.

```sh
cds bind -2 cap-hdi-container --on k8s --kind hana
```

Output:

```log
[bind] - Retrieving data from Kubernetes...
[bind] - Binding db to Kubernetes secret cap-hdi-container with kind hana
[bind] - Saving bindings to .cdsrc-private.json in profile hybrid
[bind] -
[bind] - TIP: Run with cloud bindings: cds watch --profile hybrid
```

::: warning
If a service binding with the same name exists, `cds bind` will connect to the service binding instead.
:::

## Run with Service Bindings

### Run CAP Node.js Apps with Service Bindings { #node}

Now, you can run your CAP service locally using the cloud service bindings:

```sh
cds watch --profile hybrid
```

It will resolve the cloud bindings in your configuration:
1. **Bindings to Cloud Foundry:** The credentials are downloaded from the service key of the Cloud Foundry API endpoint, org, and space that were targeted when `cds bind` was being called. This requires you to be logged in to the correct Cloud Foundry API endpoint.
2. **Bindings to Kubernetes:** The credentials are downloaded from the service bindings and secrets of the Kubernetes cluster and namespace that were in the current context when `cds bind` was being called.

You can also resolve and display credentials using the `cds env` command:

```sh
cds env get requires.db.credentials --profile hybrid --resolve-bindings
```

Example output:

```js
{
  url: 'jdbc:sap://BDB9AC0F20CB46B494E6742047C4F99A.hana.eu10.hanacloud.ondemand.com:443?encrypt=true&validateCertificate=true&currentschema=BDB9AC0F20CB46B494E6742047C4F99A',
  host: 'bdb9ac0f20cb46b494e6742047c4f99a.hana.eu10.hanacloud.ondemand.com',
  port: '443',
  driver: 'com.sap.db.jdbc.Driver',
  schema: 'BDB9AC0F20CB46B494E6742047C4F99A',
  hdi_user: 'BDB9AC0F20CB46B494E6742047C4F99A_DT',
  hdi_password: 'abc...xyz',
  user: 'BDB9AC0F20CB46B494E6742047C4F99A_RT',
  password: 'abc....xyz',
  certificate: '-----BEGIN CERTIFICATE-----\n' +
    '...' +
    '-----END CERTIFICATE-----'
}
```

### Run Arbitrary Commands with Service Bindings

With `cds bind` you avoid storing credentials on your hard disk. If you need to start other applications with cloud service bindings from local, then you can use the [`exec` sub command](#cds-bind-exec) of `cds bind`.

For example, you can run the approuter from the `approuter` child directory:

::: code-group
```sh [Mac/Linux]
cds bind --exec -- npm start --prefix approuter
```
```cmd [Windows]
cds bind --exec -- npm start --prefix approuter
```
```powershell [Powershell]
cds bind --exec '--' npm start --prefix approuter
```
:::

This works by building up a `VCAP_SERVICES` variable from the bindings in the chosen profiles (default: `hybrid`). You can run the following command to print the content of the generated `VCAP_SERVICES` variable:

::: code-group
```sh [Mac/Linux]
cds bind --exec -- node -e 'console.log(process.env.VCAP_SERVICES)'
```
```cmd [Windows]
cds bind --exec -- node -e 'console.log(process.env.VCAP_SERVICES)'
```
```powershell [Powershell]
cds bind --exec '--' node -e 'console.log(process.env.VCAP_SERVICES)'
```
:::

### Run CAP Java Apps with Service Bindings

Start your CAP Java application with the [`cds bind --exec` command](#cds-bind-exec) to use the service bindings.

For example:

```sh
cds bind --exec mvn spring-boot:run
```

### Bindings from a Cloud Application

Instead of binding to specific cloud services, you can run your application with all service bindings of an application on the SAP BTP, Cloud Foundry environment.

::: tip
But you need to have (1) your application deployed, and (2) be logged in to your Cloud Foundry space using the `cf` command line.
:::

For example, you can use the following syntax with `bash` or similar shells:

```sh
VCAP_SERVICES=$(cf env <CF-APP-NAME> | perl -0pe '/VCAP_SERVICES:(.*?)VCAP_APPLICATION:/smg; $_=$1') cds watch --profile hybrid
```

Your profile should have the `kind` settings to use the bound services, for example `requires.db = hana`.

## `cds bind` Usage { #cds-bind-usage}

### By Cloud Service Only

The shortest way to use `cds bind` is to specify only the Cloud Foundry service instance name:

```sh
cds bind -2 my-hana
```

This implies that a service key exists with the suffix `-key`. In this example: `my-hana-key`.

You can specify a different key after a colon ("`:`"):

```sh
cds bind -2 my-hana:my-different-key
```

### With CDS Service and Kind

If `kind` or CDS `service` cannot be determined automatically by `cds bind`, you need to specify it:

```sh
cds bind credstore -2 my-credstore --kind credstore
```

You are informed with an error message if this is required.

### Bind Multiple Services with One Command

There is a handy shortcut to bind multiple services with one command:

```sh
cds bind -2 my-hana,my-destination,my-xsuaa
```

::: tip
This shortcut is only possible if you don't need to provide a `service` or a `kind`.
:::

### With Profile and Output File

By default, the bindings for the `hybrid` profile are stored in the _.cdsrc-private.json_ file in your current working directory.

This can be overwritten using the `--profile` and `--output-file` options.

### Execute Commands with Bindings { #cds-bind-exec}

You can start arbitrary command line programs with your bindings.

The service bindings are [resolved from the cloud](#node) and [provided in the `VCAP_SERVICES` env variable](../node.js/cds-connect#provide-service-bindings) to the application. So it works with every application that can consume Cloud Foundry credentials.

```sh
cds bind --exec [--] <command> <args ...>
```

Use the double-dash (`--`) if your command has args starting with a dash (`-`) character. Otherwise the `cds` command line will try to parse them as their own options.

On PowerShell you need to quote the double dash (`--`) when an option with double dash follows, e.g.

```powershell
cds bind --exec '--' somecmd --someflag --some-double-dash-parameter 42
```

Profiles can be set using the optional `--profile` parameter. By default the `hybrid` profile is used.

```sh
cds bind --exec --profile <profile> [--] <command> <args ...>
```

The `--profile` parameter must follow `exec` directly.

## Use Cases

Most of the following use cases are shown for Node.js, but can be easily adapted for Java.

<!--

@TODO: will be added back once "cds deploy --bind" is available

### HANA

If you want to test your application with a real SAP HANA database, do the following steps.

**Preconditions**<br />
You need to have access to a SAP HANA Cloud instance from your Cloud Foundry space and the instance is configured to be accessible from your computer's IP.
:::

1. Log into your desired Cloud Foundry org and space

2. Deploy HANA data base content:

    > **TODO: Concept** - Since the HDI container and service key might not exists, it is more convenient to add the bind option to the `cds deploy` command. By this `cds bind` knows not to save the credentials into _default-env.json_ file. Without the `--bind` option, it still saved the _default-env.json_ file but should add a deprecation warning that this will be removed in future.

    ```sh
    cds deploy --to hana --bind
    ```

    HDI container and service key is automatically created if it doesn't exists yet. See `cds deploy` documentation for further information.

    The `--bind` option creates a service binding to the HDI container in the `hybrid` profile. You can choose a different profile with the `--profile` option.

3. Run your CAP service with HANA data base:

    ```sh
    cds watch --profile hybrid
    ```


> **TODO:** How to handle subsequent `cds deploy` commands? Should we detect the `hybrid` profile and re-use the binding for the deployment. This needs to be thought to the end...

-->

### Destinations

Learn how to [connect to remote services from local
](../guides/using-services#connect-to-remote-services-locally) using SAP BTP destinations.

### Authentication and Authorization using XSUAA

Learn how to do hybrid testing using the XSUAA service in the [CAP Node.js authentication documentation](../node.js/authentication#xsuaa-setup).

<!--

Needs to be tested -> Next release

### CAP Java Multi-Tenancy

This example assumes that XSUAA is used for authentication. However, this will require a subscription of the application using SaaS registry. Otherwise you won't be able to login. Alternatively, the approuter is not setup as SaaS but as ordinary application.

Bind to XSUAA and Service Manager:

```sh
cds bind -2 cpapp-xsuaa,cpapp-service-manager
```

Run Java CAP service with cloud service bindings:

```sh
cds bind --exec -- mvn spring-boot:run -Dmtx.url=http://localhost:4004
```

If MTX is setup as an sub project with an own _package.json_, you need to run it using `cds bind --exec` to use the bindings from the main project:

```sh
cds bind --exec cds watch mtx
```

Run approuter with cloud service bindings:

```sh
cds bind --exec -- "npm start --prefix approuter"
```

-->

### Integration Tests

`cds bind` can be handy for testing with real cloud services in your CI/CD pipeline.

Configure your required bindings for testing and save them to your project's _package.json_ file for your tests' profile:

```sh
cds bind -2 integration-test-hana -o package.json -p integration-test
```

No credentials are saved!

In your CI/CD pipeline you can resolve the bindings and inject them into the test commands:

```sh
# Install DK for "cds env"
npm i @sap/cds-dk --no-save

# Login
cf auth $USER $PASSWORD

## Uncomment if your service bindings have
## no "org" and "space" set (see note below)
# cf target -o $ORG -s $SPACE

# Set profile
export CDS_ENV=integration-test
# Set resolved bindings
export cds_requires="$(cds env get requires --resolve-bindings)"

# Execute test
npm run integration-test
```

<!-- TODO: "cds deploy" should take the existing bindings for hana -->

With `CDS_ENV`, you specify the configuration profile for the test, where you previously put the service binding configuration.

`cds env get requires` prints the `requires` section of the configuration as a JSON string. By adding the `--resolve-bindings` option, it includes the credentials of the service bindings from the cloud. To make the credentials available for all subsequent `cds` commands and the tests, the `requires` JSON string is put into the `cds_requires` variable.

::: tip
Service bindings created by `cds bind` contain the Cloud Foundry API endpoint, org, and space. You can allow your services to connect to the currently targeted Cloud Foundry org and space by removing these properties from the binding structure.
:::
