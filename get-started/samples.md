---
status: released
---

# CAP Samples

In here, we collected several interesting learning resources for you. Not all of them are maintained by the CAP team, not all of them cover CAP in its entirety, but they are well prepared sources we can recommend for your learning. From the short description we provide for every resource, you're hopefully able to tell if that fits to the need you're currently having.

::: tip Contributions Welcome...
We're just getting started with this page. Please help us in that endeavour by [adding/proposing resources](https://github.com/cap-js/docs/pulls) that helped you and also to improve the descriptions. Just press <kbd>e</kbd> to start making your contribution.

:::


[[toc]]



<style scoped>

  h3.github::before {
    content: "";
    background: url(./assets/github.svg) no-repeat 0 0;
    background-size: 30px;
    height: 30px;
    width: 30px;
    margin-top: -4px;
    margin-right: 11px;
    vertical-align: middle;
    display: inline-block;
  }

  .dark h3.github::before, .dark li._nodejs a::before, .dark li._java a::before {
    filter: brightness(.884) invert(1) hue-rotate(177deg);
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



## Bookshop et al... {.github}

The bookshop sample is our original sample provided by the CAP team and featured in the [getting started guides](../get-started/in-a-nutshell).
It is available in both Node.js and Java. The Node.js variant contains additional samples besides bookshop that demonstrate various features of CAP.

Available for:

- [](https://github.com/sap-samples/cloud-cap-samples) {._nodejs}
- [](https://github.com/sap-samples/cloud-cap-samples-java) {._java}




## Incidents Mgmt {.github}

A reference sample application for CAP and the SAP BTP Developer Guide.

Available for:

- [](https://github.com/cap-js/incidents-app) {._nodejs}



## SFlight Fiori App {.github}

This sample is a CAP adaptation of the popular [SFLIGHT](https://blog.sap-press.com/what-is-sflight-and-the-flight-and-booking-data-model-for-abap) sample app in ABAP. It is a great source for how to add SAP Fiori applications to a CAP project, including adding UI test suites on various stacks.

Available for:

- [](https://github.com/sap-samples/cap-sflight) {._nodejs}
- [](https://github.com/sap-samples/cap-sflight) {._java}



## Star Wars App {.github}

SWAPI - the Star Wars API. This sample is based upon the sample at [swapi.dev](https://swapi.dev) which in turn was based upon [swapi.co](https://swapi.dev/about). The original source can be found at https://github.com/Juriy/swapi.

The projects described above have fallen out of maintenance but still offered the opportunity for a fun yet challenging learning experience from a non-trivial data model. The many bi-directional, many-to-many relationships with the data provides a good basis for an SAP Cloud Application Programming Model and Fiori Draft UI sample.

Available for:

- [](https://github.com/SAP-samples/cloud-cap-hana-swapi) {._nodejs}



## BTP SaaS App {.github}

The Sustainable SaaS (SusaaS) sample application has been built in a partner collaboration to help interested developers, partners, and customers in developing multitenant Software as a Service applications using CAP and deploying them to the SAP Business Technology Platform (SAP BTP).

- [](https://github.com/SAP-samples/btp-cap-multitenant-saas) {._nodejs}
