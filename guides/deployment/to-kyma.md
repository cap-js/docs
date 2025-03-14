---
label: Deploy to Kyma/K8s
synopsis: >
  A step-by-step guide on how to deploy a CAP (Cloud Application Programming Model) application to Kyma Runtime of SAP Business Technology Platform.
breadcrumbs:
  - Cookbook
  - Deployment
  - Deploy to Kyma
impl-variants: true
status: released
# uacp: Used as link target from Help Portal at https://help.sap.com/viewer/65de2977205c403bbc107264b8eccf4b/Cloud/en-US/29c25e504fdb4752b0383d3c407f52a6.html and https://help.sap.com/viewer/65de2977205c403bbc107264b8eccf4b/Cloud/en-US/e4a7559baf9f4e4394302442745edcd9.html
---

<script setup>
  import { h } from 'vue'
  const X  =  () => h('span', { class: 'x',   title: 'mandatory' }, ['✓'] )
</script>
<style scoped>
  .x   { color: var(--vp-c-green-2); }
</style>

# Deploy to Kyma Runtime

You can run your CAP application in the [Kyma Runtime](https://discovery-center.cloud.sap/serviceCatalog/kyma-runtime?region=all). This runtime of the SAP Business Technology Platform is the SAP managed offering for the [Kyma project](https://kyma-project.io/). This guide helps you to run your CAP applications on SAP BTP Kyma Runtime.

<ImplVariantsHint />

[[toc]]

## Overview

As well as Kubernetes, Kyma is a platform to run containerized workloads. The service's files are provided as a container image, commonly referred to as a Docker image. In addition, the containers to be run on Kubernetes, their configuration and everything else that is needed to run them, are described by Kubernetes resources.

In consequence, two kinds of artifacts are needed to run applications on Kubernetes:

1. Container images
2. Kubernetes resources

The following diagram shows the steps to run on the SAP BTP Kyma Runtime:

![A CAP Helm chart is added to your project. Then you built your project as container images and push those images to a container registry of your choice. As last step the Helm chart is deployed to your Kyma resources, where service instances of SAP BTP services are created and pods pull the previously created container images from the container registry.](assets/deploy-kyma.drawio.svg)

1. [**Add** a Helm chart](#cds-add-helm)
2. [**Build** container images](#build-images)
3. [**Deploy** your application by applying Kubernetes resources](#deploy-helm-chart)

## Prerequisites {#prerequisites}

+ You prepared your project as described in the [Deploy to Cloud Foundry](to-cf) guide.
+ Use a Kyma enabled [Trial Account](https://account.hanatrial.ondemand.com/) or [learn how to get access to a Kyma cluster](#get-access-to-a-cluster).
+ You need a [Container Image Registry](#get-access-to-a-container-registry)
+ Get the required SAP BTP service entitlements
+ Download and install the following command line tools:
  + [`kubectl` command line client](https://kubernetes.io/docs/tasks/tools/) for Kubernetes
  + [Docker Desktop or Docker for Linux](https://docs.docker.com/get-docker/)
  + [`pack` command line tool](https://buildpacks.io/docs/tools/pack/)
  + [`helm` command line tool](https://helm.sh/docs/intro/install/)
  + [`ctz` command line tool](https://www.npmjs.com/package/ctz)

::: warning
Make yourself familiar with Kyma and Kubernetes. CAP doesn't provide consulting on it.
:::

## Prepare for Production

The detailed procedure is described in the [Deploy to Cloud Foundry guide](to-cf#prepare-for-production). Run this command to fast-forward:

```sh
cds add hana,xsuaa --for production
```

## Add Helm Chart {#cds-add-helm}

CAP provides a configurable [Helm chart](https://helm.sh/) for Node.js and Java applications.

```sh
cds add helm
```

This command adds the Helm chart to the _chart_ folder of your project with 3 files: `values.yaml`, `Chart.yaml` and `values.schema.json`.

During cds build, the _gen_/_chart_ folder is generated. This folder will have all the necessary files required to deploy the helm chart. Files from the _chart_ folder in root of the project are copied to the folder generated in _gen_ folder.

The files in the _gen/chart_ folder support the deployment of your CAP service, database and UI content, and the creation of instances for BTP services.

[Learn more about CAP Helm chart.](#about-cap-helm){.learn-more}

## Build Images {#build-images}

We'll be using the [Containerize Build Tool](https://www.npmjs.com/package/ctz/) to build the images. The modules are configured in a `containerize.yaml` descriptor file, which we generate with:

```sh
cds add containerize
```

#### Configure Image Repository

Specify the repository where you want to push the images:

```yaml
...
repository: <your-container-registry>
```

::: warning
You should be logged in to the above repository to be able to push images to it. You can use `docker login <your-container-registry> -u <your-user>` to login.
:::

Now, we use the `ctz` build tool to build all the images:

```sh
ctz containerize.yaml
```

> This will start containerizing your modules based on the configuration in the specified file. After it is done, it will ask whether you want to push the images or not. Type `y` and press enter to push your images. You can also use the above command with `--push` flag to skip this. If you want more logs, you can use the `--log` flag with the above command.

[Learn more about Containerize Build Tool](https://www.npmjs.com/package/ctz/){.learn-more}

### UI Deployment

For UI access, you can use the standalone and the managed App Router as explained in [this blog](https://blogs.sap.com/2021/12/09/using-sap-application-router-with-kyma-runtime/).

The `cds add helm` command [supports deployment](#html5-applications) to the [HTML5 application repository](https://help.sap.com/products/BTP/65de2977205c403bbc107264b8eccf4b/f8520f572a6445a7bfaff4a1bbcbe60a.html?locale=en-US&version=Cloud) which can be used with both options.

For that, create a container image with your UI files configured with the [HTML5 application deployer](https://help.sap.com/docs/BTP/65de2977205c403bbc107264b8eccf4b/9b178ab3388c4647b0c52f2c85641844.html).

The `cds add helm` command also supports deployment of standalone approuter.

To configure backend destinations, have a look at the [approuter configuration section.](#configure-approuter-specifications)

## Deploy Helm Chart {#deploy-helm-chart}

Once your Helm chart is created, your container images are uploaded to a registry and your cluster is prepared, you're almost set for deploying your Kyma application.

### Create Service Instances for SAP HANA Cloud {#hana-cloud-instance}

1. Enable SAP HANA for your project as explained in the [CAP guide for SAP HANA](../databases-hana).
2. Create an SAP HANA database.
3. To create HDI containers from Kyma, you need to [create a mapping between your namespace and SAP HANA Cloud instance](https://blogs.sap.com/2022/12/15/consuming-sap-hana-cloud-from-the-kyma-environment/).

::: warning Set trusted source IP addresses
Make sure that your SAP HANA Cloud instance can be accessed from your Kyma cluster by [setting the trusted source IP addresses](https://help.sap.com/docs/HANA_CLOUD/9ae9104a46f74a6583ce5182e7fb20cb/0610e4440c7643b48d869a6376ccaecd.html).
:::

### Deploy using CAP Helm Chart

Before deployment, you need to set the container image and cluster specific settings.

#### Configure Access to Your Container Images

Add your container image settings to your _chart/values.yaml_:

```yaml
...
global:
  domain: <your-kyma-domain>
  imagePullSecret:
    name: <your-imagepull-secret>
  image:
    registry: <your-container-registry>
    tag: latest
```

You can use the pre-configured domain name for your Kyma cluster:

```yaml
kubectl get gateway -n kyma-system kyma-gateway \
        -o jsonpath='{.spec.servers[0].hosts[0]}'
```

To use images on private container registries you need to [create an image pull secret](https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/).

For image registry, use the same value you mentioned in `containerize.yaml`

#### Configure Approuter Specifications

By default `srv-api` and `mtx-api` (only in Multi Tenant Application) are configured. If you're using any other destination or your `xs-app.json` file has a different destination, update the destinations under the `backendDestinations` key in _values.yaml_ file:

```yaml
backendDestinations:
  backend:
    service: srv
```

> `backend` is the name of the destination. `service` points to the deployment name whose url will be used for this destination.

#### Deploy CAP Helm Chart

1. Execute `cds build --production` to generate the helm chart in _gen_ folder.
2. Deploy using `helm` command:

    ```sh
    helm upgrade --install bookshop ./gen/chart \
         --namespace bookshop-namespace
         --create-namespace
    ```

    This installs the Helm chart from the _gen/chart_ folder with the release name `bookshop` in the namespace `bookshop-namespace`.

    ::: tip
    With the `helm upgrade --install` command you can install a new chart as well as upgrade an existing chart.
    :::

This process can take a few minutes to complete and create the log output:

```log
[…]
The release bookshop is installed in namespace [namespace].

Your services are available at:
  [workload] - https://bookshop-[workload]-[namespace].[configured-domain]
[…]
```

Copy and open this URL in your web browser. It's the URL of your application.

::: info
  If a standalone approuter is present, the srv and sidecar aren't exposed and only the approuter URL will be logged. But if an approuter isn't present then srv and sidecar are also exposed and their URL will also be logged.
:::

[Learn more about using a private registry with your Kyma cluster.](#setup-your-cluster-for-a-private-container-registry){.learn-more} [Learn more about the CAP Helm chart settings](#configure-helm-chart){ .learn-more} [Learn more about using `helm upgrade`](https://helm.sh/docs/helm/helm_upgrade){ .learn-more}

::: tip
Try out the [CAP SFLIGHT](https://github.com/SAP-samples/cap-sflight)
and [CAP for Java](https://github.com/SAP-samples/cloud-cap-samples-java) examples on Kyma.
:::

## Customize Helm Chart {#customize-helm-chart}

### About CAP Helm Chart { #about-cap-helm}

The following files are added to a _chart_ folder by executing `cds add helm`:

| File/Pattern          | Description  |
| --------------------- | ---------------------------------------------------------- |
| _values.yaml_         | [Configuration](#configure-helm-chart) of the chart; The initial configuration is determined from your CAP project. |
| _Chart.yaml_          | Chart metadata that is initially determined from the _package.json_ file                                |
| _values.schema.json_  | JSON Schema for _values.yaml_ file                                                                      |

The following files are added to a _gen/chart_ folder along with all the files in the _chart_ folder in the root of the project by executing `cds build` after adding `helm`:

| File/Pattern          | Description  |
| --------------------- | ---------------------------------------------------------- |
| _templates/*.tpl_     | Template libraries used in the template resources                                                       |
| _templates/NOTES.txt_ | Message printed after installing or upgrading the Helm charts                                           |
| _templates/*.yaml_    | Template files for the Kubernetes resources                                                             |

[Learn how to create a Helm chart from scratch from the Helm documentation.](https://helm.sh/docs){.learn-more}

### Configure {#configure-helm-chart}

[CAP's Helm chart](#cds-add-helm) can be configured by the settings as explained below. Mandatory settings are marked with <X/>.

You can change the configuration by editing the _chart/values.yaml_ file. When you call `cds add helm` again, your changes will be persisted and only missing default values are added.

The `helm` CLI also offers you other options to overwrite settings from _chart/values.yaml_ file:

+ Overwrite properties using the  `--set` parameter.
+ Overwrite properties from a YAML file using the `-f` parameter.

::: tip
It is recommended to do the main configuration in the _chart/values.yaml_ file and have additional YAML files for specific deployment types (dev, test, productive) and targets.
:::

#### Global Properties

| Property        | Description                                                   | Mandatory |
| --------------- | ------------------------------------------------------------- | :---------: |
| imagePullSecret &rarr; name | Name of secret to access the container registry   | (<X/> ) <sup>1</sup>    |
| domain          | Kubernetes cluster ingress domain (used for application URLs) | <X/>         |
| image &rarr; registry | Name of the container registry from where images are pulled   | <X/>   |

<sup>1</sup>: Mandatory only for private docker registries

#### Deployment Properties

The following properties are available for the `srv` key:

| Property                     | Description                                                                                                                                                | Mandatory |
|------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------|:---------:|
| **bindings**                 | [Service Bindings](#configuration-options-for-service-bindings)                                                                                            |           |
| **resources**                | [Kubernetes Container resources](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/)                                           |   <X/>    |
| **env**                      | Map of additional env variables                                                                                                                            |           |
| **health**                   | [Kubernetes Liveness, Readyness and Startup Probes](https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/) |           |
| &rarr; liveness &rarr; path  | Endpoint for liveness and startup probe                                                                                                                    |   <X/>    |
| &rarr; readiness &rarr; path | Endpoint for readiness probe                                                                                                                               |   <X/>    |
| &rarr; startupTimeout        | Wait time in seconds until the health checks are started                                                                                                   |           |
| **image**                    | [Container image](#configuration-options-for-container-images)                                                                                             |           |

You can explore more configuration options in the subchart's directory _gen/chart/charts/web-application_.

#### SAP BTP Services

The helm chart supports to create service instances for commonly used services. Services are pre-populated in the _chart/values.yaml_ file based on the used services in the `requires` section of the CAP configuration (for example, _package.json_) file.

You can use the following services in your configuration:

| Property                               | Description                                                                                                                                         | Mandatory |
|----------------------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------|:---------:|
| **xsuaa**                              | Enables the creation of a XSUAA service instance. See details for [Node.js](../../node.js/authentication) and [Java](../../java/security) projects. |           |
| parameters &rarr; xsappname            | Name of XSUAA application. Overwrites the value from the _xs-security.json_ file. (unique per subaccount)                                           |   <X/>    |
| parameters &rarr; HTML5Runtime_enabled | Set to true for use with Launchpad Service                                                                                                          |           |
| **event-mesh**                         | Enables SAP Event Mesh; [messaging guide](../messaging/), [how to enable the SAP Event Mesh](../messaging/event-mesh)                               |           |
| **html5-apps-repo-host**               | HTML5 Application Repository                                                                                                                        |           |
| **hana**                               | HDI Shared Container                                                                                                                                |           |
| **service-manager**                    | Service Manager Container                                                                                                                           |           |
| **saas-registry**                      | SaaS Registry Service                                                                                                                               |           |

[Learn how to configure services in your Helm chart](#configuration-options-for-services){.learn-more}

#### SAP HANA

The deployment job of your database content to a HDI container can be configured using the `hana-deployer` section with the following properties:

| Property      | Description                                                                                                      | Mandatory |
|---------------|------------------------------------------------------------------------------------------------------------------|:---------:|
| **bindings**  | [Service binding](#configuration-options-for-service-bindings) to the HDI container's secret                     |   <X/>    |
| **image**     | [Container image](#configuration-options-for-container-images) of the HDI deployer                               |   <X/>    |
| **resources** | [Kubernetes Container resources](https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/) |   <X/>    |
| **env**       | Map of additional environment variables                                                                          |           |

#### HTML5 Applications

The deployment job of HTML5 applications can be configured using the `html5-apps-deployer` section with the following properties:

[Container image]: #configuration-options-for-container-images
[HTML5 application deployer]: https://help.sap.com/docs/BTP/65de2977205c403bbc107264b8eccf4b/9b178ab3388c4647b0c52f2c85641844.html
[Kubernetes Container resources]: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/

| Property                 | Description                                                                                                                           | Mandatory |
|--------------------------|---------------------------------------------------------------------------------------------------------------------------------------|:---------:|
| **image**                | [Container image] of the [HTML5 application deployer]                                                                                 |   <X/>    |
| **bindings**             | [Service bindings](#configuration-options-for-service-bindings) to XSUAA, destinations and HTML5 Application Repository Host services |   <X/>    |
| **resources**            | [Kubernetes Container resources]                                                                                                      |   <X/>    |
| **env**                  | Map of additional environment variables                                                                                               |           |
| &rarr; SAP_CLOUD_SERVICE | Name for your business service (unique per subaccount)                                                                                |   <X/>    |

::: tip
Run `cds add html5-repo` to automate the setup for HTML5 application deployment.
:::

#### Backend Destinations

Backend destinations maybe required for HTML5 applications or for App Router deployment. They can be configured using the `backendDestinations` section with the following properties:

| Property         | Description                                         |
|------------------|-----------------------------------------------------|
| (key)            | Name of backend destination                         |
| service: (value) | Value is the target Kubernetes service (like `srv`) |

If you want to add an external destination, you can do so by providing the `external` property like this:

```yaml
...
backendDestinations:
  srv-api:
    service: srv
  ui5: # [!code ++]
    external: true # [!code ++]
    name: ui5 # [!code ++]
    Type: HTTP # [!code ++]
    proxyType: Internet # [!code ++]
    url: https://ui5.sap.com # [!code ++]
    Authentication: NoAuthentication # [!code ++]
```

> Our helm chart will remove the `external` key and add the rest of the keys as-is to the environment variable.

#### Arbitrary Service

These are the steps to create and bind to an arbitrary service, using the binding of the feature toggle service to the CAP application as an example:

1. In the _chart/Chart.yaml_ file, add an entry to the `dependencies` array.

    ```yaml
    dependencies:
      ...
      - name: service-instance
        alias: feature-flags
        version: 0.1.0
    ```

2. Add the service configuration and the binding in the _chart/values.yaml_ file:

    ```yaml
    feature-flags:
      serviceOfferingName: feature-flags
      servicePlanName: lite
    ...
    srv:
       bindings:
         feature-flags:
            serviceInstanceName: feature-flags
    ```

    > The `alias` property in the `dependencies` array must match the property added in the root of _chart/values.yaml_ and the value of `serviceInstanceName` in the binding.
::: warning
There should be at least one service instance created by `cds add helm` if you want to bind an arbitrary service.
:::

#### Configuration Options for Services

_Services have the following configuration options:_

| Property            | Type        | Description                                            | Mandatory
| ------------------- | ----------- | ---------------------------------------- |:-----: |
| **fullNameOverride**    | string      | Use instead of the generated name                      |
| **serviceOfferingName** | string      | Technical service offering name from service catalog   | <X/>
| **servicePlanName**     | string      | Technical service plan name from service catalog       | <X/>
| **externalName**        | string      | The name for the service instance in SAP BTP           |
| **customTags**          | array of string      | List of custom tags describing the service instance, will be copied to `ServiceBinding` secret in the key called `tags`          |
| **parameters**          | object      | Object with service parameters                         |
| **jsonParameters**      | string      | Some services support the provisioning of additional configuration parameters. For the list of supported parameters, check the documentation of the particular service offering.           |
| **parametersFrom**      | array of object      | List of secrets from which parameters are populated.           |

The `jsonParameters` key can also be specified using the `--set file` flag while installing/upgrading Helm release. For example, `jsonParameters` for the `xsuaa` property can be defined using the following command:

```sh
helm install bookshop ./chart --set-file xsuaa.jsonParameters=xs-security.json
```

You can explore more configuration options in the subchart's directory _gen/chart/charts/service-instance_.

#### Configuration Options for Service Bindings

| Property                | Description                                      |     Mandatory      |
|-------------------------|--------------------------------------------------|:------------------:|
| (key)                   | Name of the service binding                      |                    |
| secretFrom              | Bind to Kubernetes secret                        | (<X/>)<sup>1</sup> |
| serviceInstanceName     | Bind to service instance within the Helm chart   | (<X/>)<sup>1</sup> |
| serviceInstanceFullname | Bind to service instance using the absolute name | (<X/>)<sup>1</sup> |
| parameters              | Object with service binding parameters           |                    |

<sup>1</sup>: Exactly one of these properties need to be specified

#### Configuration Options for Container Images

| Property   | Description                                     | Mandatory |
|------------|-------------------------------------------------|:---------:|
| repository | Full container image repository name            |   <X/>    |
| tag        | Container image version tag (default: `latest`) |           |

<span id="beforemodify" />

### Modify

Modifying the Helm chart allows you to customize it to your needs. However, this has consequences if you want to update with the latest changes from the CAP template.

You can run `cds add helm` again to update your Helm chart. It has the following behavior for modified files:

1. Your changes of the _chart/values.yaml_ and _chart/Chart.yaml_ will not be modified. Only new or missing properties will be added by `cds add helm`.
2. To modify any of the generated files such as templates or subcharts, copy the files from _gen/chart_ folder and place it in the same level inside the _chart_ folder. After the next `cds build` executions the generated chart will have the modified files.
3. If you want to have some custom files such as templates or subcharts, you can place them in the _chart_ folder at the same level where you want them to be in _gen/chart_ folder. They will be copied as is.

### Extend

1. Adding new files to the Helm chart does not conflict with `cds add helm`.
2. A modification-free approach to change files is to use [Kustomize](https://kustomize.io/) as a [post-processor](https://helm.sh/docs/topics/advanced/#post-rendering) for your Helm chart. This might be usable for small changes if you don't want to branch-out from the generated `cds add helm` content.

## Additional Information

### SAP BTP Services and Features

You can find a list of SAP BTP services in the [Discovery Center](https://discovery-center.cloud.sap/viewServices?provider=all&regions=all&showFilters=true). To find out if a service is supported in the Kyma and Kubernetes environment, go to the **Service Marketplace** of your Subaccount in the SAP BTP Cockpit and select Kyma or Kubernetes in the environment filter.

You can find information about planned SAP BTP, Kyma Runtime features in the [product road map](https://roadmaps.sap.com/board?PRODUCT=73554900100800003012&PRODUCT=73554900100800003012).

#### Connectivity Service

To access the Connectivity Service, add the following modules in your Kyma Cluster:

- connectivity-proxy
- transparent-proxy
- istio

You can do that using the `kubectl` CLI:

```sh 
kubectl edit kyma default -n kyma-system
```

Then, add the three modules:
```yaml [editor]
spec:
  modules:
    - name: connectivity-proxy
    - name: transparent-proxy
    - name: istio
```

Finally, you should see a success message as follows:

```sh
kyma.operator.kyma-project.io/default edited
```

[Learn more about adding modules, also from the Kyma Dashboard.](https://help.sap.com/docs/btp/sap-business-technology-platform/enable-and-disable-kyma-module?version=Cloud#loio1b548e9ad4744b978b8b595288b0cb5c){.learn-more}

### Using Service Instance created on Cloud Foundry

To bind service instances created on Cloud Foundry to a workload (`srv`, `hana-deployer`, `html5-deployer`, `approuter` or `sidecar`) in Kyma environment, do the following:

1. In your cluster, create a secret with credentials from the service key of that instance.

2. Use the `fromSecret` property inside the `bindings` key of the workload.

For example, if you want to use an `hdi-shared` instance created on Cloud Foundry:

1. [Create a Kubernetes secret](https://kubernetes.io/docs/concepts/configuration/secret/#creating-a-secret) with the credentials from a service key from the Cloud Foundry account.
2. Add additional properties to the Kubernetes secret.

    ```yaml
    stringData:
      # <…>
      .metadata: |
        {
          "credentialProperties":
            [
              { "name": "certificate", "format": "text"},
              { "name": "database_id", "format": "text"},
              { "name": "driver", "format": "text"},
              { "name": "hdi_password", "format": "text"},
              { "name": "hdi_user", "format": "text"},
              { "name": "host", "format": "text"},
              { "name": "password", "format": "text"},
              { "name": "port", "format": "text"},
              { "name": "schema", "format": "text"},
              { "name": "url", "format": "text"},
              { "name": "user", "format": "text"}
            ],
          "metaDataProperties":
            [
              { "name": "plan", "format": "text" },
              { "name": "label", "format": "text" },
              { "name": "type", "format": "text" },
              { "name": "tags", "format": "json" }
            ]
        }
      type: hana
      label: hana
      plan: hdi-shared
      tags: '[ "hana", "database", "relational" ]'
    ```

::: tip
Update the values of the properties accordingly.
:::

3. Change the `serviceInstanceName` property to `fromSecret` from each workload which has that service instance in `bindings` in _chart/values.yaml_ file:

    ::: code-group

    ```yaml [srv]
    …
    srv:
      bindings:
        db:
            serviceInstanceName: // [!code --]
            fromSecret: <your secret> // [!code ++]
    ```

    ```yaml [hana-deployer]
    …
    hana-deployer:
      bindings:
        hana:
          serviceInstanceName: // [!code --]
          fromSecret: <your secret> // [!code ++]
    ```

    :::

4. Delete `hana` property in _chart/values.yaml_ file.

    ::: code-group

      ```yaml
      …
      hana: // [!code --]
        serviceOfferingName: hana // [!code --]
        servicePlanName: hdi-shared // [!code --]
      …
      ```

    :::

5. Make the following changes to _chart/Chart.yaml_ file.

    ::: code-group

      ```yaml
      …
      dependencies:
        …
        - name: service-instance // [!code --]
          alias: hana // [!code --]
          version: ">0.0.0" // [!code --]
        …
      ```

    :::

### About Cloud Native Buildpacks

Cloud Native Buildpacks provide advantages such as embracing [best practices](https://buildpacks.io/features/) and secure standards like:

+ Resulting images use an unprivileged user.
+ Builds are [reproducible](https://buildpacks.io/docs/features/reproducibility/).
+ [Software Bill of Materials](https://buildpacks.io/docs/features/bill-of-materials/) (SBoM) for all dependencies baked into the image.
+ Auto detection, no need to manually select base images.

Additionally Cloud Native Buildpacks can be easily plugged together to fulfill more complex requirements. For example the [ca-certificates](https://github.com/paketo-buildpacks/ca-certificates) enables adding additional certificates to the system trust-store at build and runtime. When using Cloud Native Buildpacks you can continuously benefit from the best practices coming from the community without any changes required.

[Learn more about Cloud Native Buildpacks Concepts](https://buildpacks.io/docs/concepts/){ .learn-more}

One way of using Cloud Native Buildpacks in CI/CD is by utilizing the [`cnbBuild`](https://www.project-piper.io/steps/cnbBuild/) step of Project "Piper". This does not require any special setup, like providing a Docker daemon, and works out of the box for Jenkins and Azure DevOps Pipelines.

[Learn more about Support for Cloud Native Buildpacks in Jenkins](https://medium.com/buildpacks/support-for-cloud-native-buildpacks-in-jenkins-656330156e77){ .learn-more}

<div id="beforegetaccesstoacluster" />

### Get Access to a Cluster

You can either purchase a Kyma cluster from SAP, create your [personal trial](https://hanatrial.ondemand.com/) account or sign-up for the [free tier](https://www.sap.com/products/business-technology-platform/trial.html#new-customers) offering to get a SAP managed Kyma Kubernetes cluster.

<span id="beforecontainerreg" />

### Get Access to a Container Registry

SAP BTP doesn't provide a container registry.

You can choose from offerings of hosted open source and private container image registries, as well as solutions that can be run on premise or in your own cloud infrastructure. However, you need to consider that the Kubernetes cluster needs to access the container registry from its network.

+ The use of a public container registry gives everyone access to your container images.
+ In a private container registry, your container images are protected. You will need to configure a **pull secret** to allow your cluster to access it.

#### Setup Your Cluster for a Public Container Registry

Make sure that the container registry is accessible from your Kubernetes cluster. No further setup is required.

#### Setup Your Cluster for a Private Container Registry

To use a docker image from a private repository, you need to [create an image pull secret](https://kubernetes.io/docs/tasks/configure-pod-container/pull-image-private-registry/) and configure this secret for your containers.
::: warning
It is recommended to use a technical user for this secret that has only read permission, because users with access to the Kubernetes cluster can reveal the password from the secret easily.
:::

<span id="afterprivatereg" />

<span id="beforeend" />
