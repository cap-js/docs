---
synopsis: >
  This section describes how to configure CAP Java applications.

status: released
uacp: Used as link target from Help Portal at https://help.sap.com/products/BTP/65de2977205c403bbc107264b8eccf4b/9186ed9ab00842e1a31309ff1be38792.html
---

# Configuring Applications
<style scoped>
  h1:before {
    content: "Java"; display: block; font-size: 60%; margin: 0 0 .2em;
  }
</style>


## Profiles and Properties

This section describes how to configure applications. 
CAP Java applications can fully leverage [Spring Boot's](#spring-boot-integration) capabilities for [Externalized Configuration](https://docs.spring.io/spring-boot/docs/current/reference/html/features.html#features.external-config). 
This enables you to define multiple **configuration profiles** for different scenarios, like local development and cloud deployment.

For a first introduction, have a look at our [sample application](https://github.com/sap-samples/cloud-cap-samples-java) and the [configuration profiles](https://github.com/SAP-samples/cloud-cap-samples-java/blob/master/srv/src/main/resources/application.yaml) we added there.

Now, that you're familiar with how to configure your application, start to create your own application configuration. See the full list of [CDS properties](properties) as a reference.

## Service Bindings {#kubernetes-service-bindings}

In the SAP BTP, Kyma Runtime, credentials of service bindings are stored in Kubernetes secrets. Using volumes, you can mount secrets into your application's container. These volumes contain a file for each of the secrets properties.

### Get the Secret into Your Container

To use a Kubernetes secret with your CAP service, you create a volume from it and mount it to the service's container.

*For example:*

```yaml
spec:
  volumes:
    - name: bookshop-db-secret-vol
      secret:
        secretName: bookshop-db-secret
  containers:
  - name: app-srv
    ...
    volumeMounts:
      - name: bookshop-db-secret-vol
        mountPath: /etc/secrets/sapcp/hana/bookshop-db
        readOnly: true
```

### Prepare Your CAP Application

Add the `cds-feature-k8s` feature in the _pom.xml_ file of your CAP application to consume service credentials:

```xml
<dependencies>
	<!-- Features -->
	<dependency>
		<groupId>com.sap.cds</groupId>
		<artifactId>cds-feature-k8s</artifactId>
		<scope>runtime</scope>
	</dependency>
</dependencies>
```

The feature supports reading multiple credentials from a common base directory and to read credentials from arbitrary directories.

### Read Credentials from a Base Directory

The base directory for service credentials is the _/etc/secrets/sapcp_ directory. You can overwrite the default base directory with the `cds.environment.k8s.secretsPath` property.

Within this base directory, the directory structure for the service credentials is _\<service-name\>/\<instance-name\>_.

### Read Credentials from Arbitrary Directories

You can also configure service bindings using the  `cds.environment.k8s.serviceBindings` configuration property.

For example:

```yaml
cds:
  environment:
    k8s:
      serviceBindings:
        bookshop-db:
          secretsPath: /etc/secrets/hana
          service: hana
          plan: hdi-shared
          tags:
           - hana
           - db
        bookshop-uaa:
          secretsPath: /etc/somewhere/else/xsuaa
          ...
```

The parameters `plan` and `tags` are optional.
