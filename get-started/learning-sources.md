---
status: released

---

# Learning Sources

In here, we collected several interesting learning resources for you. Not all of them are maintained by the CAP team, not all of them cover CAP in its entirety but they are well prepared sources we can recommend for your learning. From the short description we provide for every resources, you're hopefully able to tell if that fits to the need you're currently having.

:::info
We're just getting started with this page.

Feel free to add/propose resources that helped you and also to improve the descriptions.

:::


[[toc]]



<style>

  h3.github::before {
    content: "";
    background: url(./assets/github.svg) no-repeat 0 0;
    background-size: 40px;
    height: 40px;
    width: 40px;
    margin-right: 11px;
    vertical-align: middle;
    display: inline-block;
  }

  li._nodejs {
    display: inline;
    margin-right: 2em;
  }
  li._nodejs a::before {
    content: "";
    background: url(../assets/logos/nodejs.svg) no-repeat 0 0;
    background-size: 4em;
    height: 4em;
    width: 4em;
    vertical-align: middle;
    display: inline-block;
  }

  li._java {
    display: inline;
    margin-right: 2em;
  }
  li._java a::before {
    content: "";
    background: url(../assets/logos/java.svg) no-repeat 0 0;
    background-size: 5.5em;
    height: 5.5em;
    width: 5.5em;
    vertical-align: middle;
    display: inline-block;
  }

</style>




## Sample Projects

### Bookshop et al... {.github}

The bookshop sample is our original sample provided by the CAP team and featured in the [getting started guides](../get-started/in-a-nutshell).
It is available in both Node.js and Java. The Node.js variant contains additional samples besides bookshop that demonstrate various features of CAP.

Available for:

- [](https://github.com/sap-samples/cloud-cap-samples) {._nodejs}
- [](https://github.com/sap-samples/cloud-cap-samples-java) {._java}




### Incidents Mgmt {.github}

A reference sample application for CAP and development recommendations provided by the SAP BTP Developer Guide.

Available for:

- [](https://github.com/cap-js/incidents-app) {._nodejs}



### SFlight Fiori {.github}

The purpose of this sample app is to:

- Demonstrate SAP Fiori annotations
- Demonstrate and compare SAP Fiori features on various stacks (CAP Node.js, CAP Java SDK, ABAP)
- Run UI test suites on various stacks

Available for:

- [](https://github.com/sap-samples/cap-sflight) {._nodejs}
- [](https://github.com/sap-samples/cap-sflight) {._java}



### Star Wars {.github}

SWAPI - the Star Wars API. This sample is based upon the sample at [swapi.dev](https://swapi.dev) which in turn was based upon [swapi.co](https://swapi.dev/about). The original source can be found at https://github.com/Juriy/swapi.

The projects described above have fallen out of maintenance but still offered the opportunity for a fun yet challenging learning experience from a non-trivial data model. The many bi-directional, many-to-many relationships with the data provides a good basis for an SAP Cloud Application Programming Model and Fiori Draft UI sample.

Available for:

- [](https://github.com/SAP-samples/cloud-cap-hana-swapi) {._nodejs}

### BTP SaaS App {.github}

The Sustainable SaaS (SusaaS) sample application has been built in a partner collaboration to help interested developers, partners, and customers in developing multitenant Software as a Service applications using CAP and deploying them to the SAP Business Technology Platform (SAP BTP).

- [](https://github.com/SAP-samples/btp-cap-multitenant-saas) {._nodejs}



## Tutorials

- [Build a Business Application Using CAP for Node.js](https://developers.sap.com/mission.cp-starter-extensions-cap.html)
- [Build a Business Application Using CAP for Java](https://developers.sap.com/mission.cap-java-app.html)
- [AD264 - Build Extensions with SAP Cloud Application Programming Model (CAP)](https://github.com/SAP-samples/teched2023-AD264/)


## Videos

- [Devtoberfest Session about Hybrid Testing and Alternative DBs by Thomas Jung.](https://youtu.be/vqub4vJbZX8?si=j5ZkPR6vPb59iBBy)

## Blogs

- [Surviving and Thriving with the SAP Cloud Application Programming Model - <br> a Series of Blog Post by Max Streifeneder (2023). ](https://blogs.sap.com/tag/captricks/)
- [Multitenant SaaS applications on SAP BTP using CAP? Tried-and-True! - <br> by Martin Frick (2022).](https://blogs.sap.com/2022/10/19/multitenant-saas-applications-on-sap-btp-using-cap-tried-and-true/)

## Courses {.impl .beta}

- OpenSAP
-

## CAP Plugins {.impl .beta}

- CAP community

- Change Tracking

- Audit Logging

- ...
