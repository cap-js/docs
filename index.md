---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "SAP Cloud Application Programming Model"
  image: /cap-logo.svg

  tagline:
    Build cloud-native applications
    with maximized productivity
    at minimized costs,
    and proven best practices
    served out of the box.

  actions:

    - theme: alt
      text: Get Started
      link: /get-started/in-a-nutshell

    - theme: alt
      text: Learn More
      link: /about/

    - theme: brand
      text: What's New?
      link: /releases

features:

- title: Focus on Domain
  icon: ⭕️
  details:
    •&nbsp; Capture intent ⇒ What, not how! <br/>
    •&nbsp; Minimized boilerplate coding <br/>
    •&nbsp; Developers + domain experts <br/>
  link: about/
  linkText: Read Primer

- title: Rapid Development
  icon: 🌀
  details:
    •&nbsp; Jumpstart with minimal setup <br/>
    •&nbsp; Rapid dev at minimized costs <br/>
    •&nbsp; Grow as you go... <br/>
  link: get-started/in-a-nutshell
  linkText: Getting Started

- title: Proven Best Practices
  icon: 🧩
  details:
    •&nbsp; Enterprise-grade solutions <br/>
    •&nbsp; Proven in SAP products <br/>
    •&nbsp; Served out of the box <br/>
  link: guides/providing-services
  linkText: Providing Services

- title: Cloud Native
  icon: 💯
  details:
    •&nbsp; Multitenancy, Extensibility, ... <br/>
    •&nbsp; Resilience, Scalability, ... <br/>
    •&nbsp; Intrinsically taken care of <br/>
  link: guides/using-services
  linkText: Consuming Services

---

<style>
.VPFeature .details li {
  white-space: nowrap;
}
</style>
