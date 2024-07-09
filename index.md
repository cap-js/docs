---
layout: home
status: released
title: Home
titleTemplate: ':title | capire'

hero:
  name: SAP Cloud Application Programming Model
  tagline:
    Building cloud-native applications with maximized productivity at minimized costs, based on proven best practices served out of the box.
  image: /assets/logos/cap.svg
  actions:
  - theme: brand
    text: About CAP
    link: /about/
  - theme: alt
    text: Get Started
    link: /get-started/in-a-nutshell
  - theme: alt
    text: Release Notes
    link: /releases/

features:
- title: Jumpstart & Grow as You Go
  icon: 🚀
  details:
    Jumpstart with minimum setup.
    Develop locally in fast turn-arounds with mocked production services.
    Add things only when they are actually required.
  link: /get-started/jumpstart
- title: Intrinsic Cloud Qualities
  icon: 💎
  details:
    Multitenancy, Extensibility, Security, Scalability, Resilience, Messaging, Observability, ...
    CAP facilitates these to great extents in <b>platform-agnostic</b> ways.
  link: about/#services
- title: Enterprise Best Practices
  icon: 🏆
  details:
    Proven best practices for Authorization, Localization/i18n, Localized Data, Temporal Data, Data Privacy, Verticalization are served out of the box.
  link: about/#generic-providers
- title: Focus on Domain
  icon: ⭕️
  details:
    All this + CDS to capture intent instead of imperative coding, greatly reduces boilerplate, and fosters close collaboration of developers and domain experts.
  link: about/#domain-modeling
---

<style>

/* make hero text smaller in narrow sizes */
@media (max-width: 640px) {
  .VPHome .VPHero .name {
    font-size: 33px;
  }
}

</style>
