---
synopsis: >
  This section describes how to optimize resource consumption of productive CAP Java applications.

status: released
uacp: Used as link target from Help Portal at https://help.sap.com/products/BTP/65de2977205c403bbc107264b8eccf4b/9186ed9ab00842e1a31309ff1be38792.html
---

# Optimizing Applications
<style scoped>
  h1:before {
    content: "Java"; display: block; font-size: 60%; margin: 0 0 .2em;
  }
</style>


## GraalVM Native Image Support (beta)

Since Spring Boot 3 it's possible to compile Spring Boot applications to stand-alone native executables leveraging GraalVM Native Images.
Native Image applications have faster startup times and require less memory. CAP Java provides compatibility with the Native Image technology.

[Learn more about Native Image support in Spring Boot.](https://docs.spring.io/spring-boot/docs/current/reference/html/native-image.html){.learn-more}

If you want to compile your application as a native executable the following boundary conditions need to be considered:

1. The GraalVM Native Image build analyzes your application from the `main` entry point. Only the code that is reachable through static analysis is included into the native image. This means that the full classpath needs to be known and available already at build time.

2. Dynamic elements of your code, such as usage of reflection, JDK proxies, or resources need to be registered with the GraalVM Native Image build. You can learn more about this in the [GraalVM Native Image documentation](https://www.graalvm.org/latest/reference-manual/native-image/metadata/).

    ::: tip
    Many runtime hints for reflection, JDK proxy usage, and resources are contributed automatically to the Native Image build.
    This includes
    - Required reflection for event handler classes defined in application code.
    - JDK proxies for interfaces generated from the application's CDS model by the CDS Maven Plugin.
    :::

3. Spring Boot automatically defines and fixes all bean definitions of your application at build time. If you have bean definitions that are created based on conditions on externalized configuration or profiles, you need to supply these triggers to the Native Image build.

    CAP Java also creates various bean definitions based on service bindings. Therefore, you need to provide the metadata of expected service bindings at runtime already during build time. This is similar to the information you define in deployment descriptors (for example `mta.yaml` or Helm charts). This information is also required to be supplied to the Native Image build.

    The Spring Boot Maven Plugin allows you to [configure the Spring profiles](https://docs.spring.io/spring-boot/docs/current/reference/html/howto.html#howto.aot.conditions) that are used during the Native Image build. You can supply information to the Native Image Build in a `native-build-env.json`, which you can configure together with the Spring profile. For example you can provide information to the Native image build in the `native-build-env.json` which you can configure together with the spring profile in the `srv/pom.xml`:

    ::: code-group
    ```json [native-build-env.json]
    {
        "hana": [ { "name": "<hana-binding-name>" } ],
        "xsuaa": [ { "name": "<xsuaa-binding-name>" } ]
    }
    ```
    ```xml [srv/pom.xml]
    <profile>
        <id>native</id>
        <build>
            <pluginManagement>
                <plugins>
                    <plugin>
                        <groupId>org.springframework.boot</groupId>
                        <artifactId>spring-boot-maven-plugin</artifactId>
                        <executions>
                            <execution>
                                <id>process-aot</id>
                                <configuration>
                                    <profiles>cloud</profiles>
                                    <jvmArguments>-Dcds.environment.local.defaultEnvPath=../native-build-env.json</jvmArguments>
                                </configuration>
                            </execution>
                        </executions>
                    </plugin>
                </plugins>
            </pluginManagement>
        </build>
    </profile>
    ```
    :::

When using Spring Boot's parent POM, you can easily trigger the Native Image build by executing `mvn spring-boot:build-image -Pnative`.
This builds a Docker image using Cloud Native Buildpacks including a minimized OS and your application.
You can launch the Docker image by running `docker run --rm -p 8080:8080 <srv-project-name>:<version>`.

::: tip
If you want to try out CAP's Native Image support you can use the [SFlight sample application](https://github.com/SAP-samples/cap-sflight) which is prepared for GraalVM Native Images.
Note, that SFlight's native executable is built and configured to use SAP HANA and XSUAA by default. You therefore need to run it with the `cloud` profile and supply an SAP HANA and XSUAA service binding.
Alternatively you can make corresponding adaptations in `native-build-env.json` and `srv/pom.xml` to build the native executable for a different set of service bindings and profile.
:::

