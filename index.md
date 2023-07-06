---
layout: home
status: released

hero:
  name: Welcome to CAP XXX
  text: The Cloud Application Programming Model
  tagline:
    Building Cloud-native Applications with Maximized Productivity at Minimized Costs, based on Proven Best Practices Served Out of the Box.
  image: /assets/logos/cap.svg
  actions:
  - theme: brand
    text: About CAP
    link: /about/
  - theme: brand
    text: Get Started
    link: /get-started/in-a-nutshell
  - theme: alt
    text: See Samples
    link: /resources/#public-resources
  - theme: alt
    text: See Release Notes
    link: /releases/

features:
- title: Jumpstart & Grow as You Go
  icon: ⚒️
  details:
    Jumpstart with minimum setup.
    Develop locally in fast turn-arounds with mocked production services.
    Add things only when they are actually required.
  link: about/
- title: Intrinsic Cloud Qualities
  icon: ⛅️
  details:
    Multitenancy, Extensibility, Security, Scalability, Resilience, Messaging, Observability, ...
    CAP facilitates these to great extents in <b>platform-agnostic</b> ways.
  link: about/#services
- title: Enterprise Best Practices
  icon: 📂
  details:
    Proven best practices for Authorization, Localization/i18n, Localized Data, Temporal Data, Data Privacy, Verticalization are served out of the box.
  link: about/#generic-providers
- title: Focus on Domain
  icon: 🎯
  details:
    All this + CDS to capture intent instead of imperative coding, greatly reduces boilerplate, and fosters close collaboration of developers and domain experts.
  link: about/#domain-modeling
---

<style>

/* make hero text a bit wider to avoid unlucky wrapping */
@media (min-width: 960px) {
  .VPHero.has-image .main,
  .VPHero .text {
    max-width: 620px !important;
  }
}

</style>
