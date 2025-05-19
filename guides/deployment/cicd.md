---
breadcrumbs:
  - Cookbook
  - Deployment
  - More Options
label: Deploy with CI/CD
synopsis: >
  A comprehensive guide to implementing continuous integration and continuous deployment (CI/CD) for CAP projects using best practices, tools, and services.
# layout: cookbook
status: released
---

# Deploy using CI/CD Pipelines
{{ $frontmatter.synopsis }}

[[toc]]


<span id="afterstart" />

<span id="beforecicd" />

## SAP Continuous Integration and Delivery

[SAP Continuous Integration and Delivery](https://help.sap.com/viewer/SAP-Cloud-Platform-Continuous-Integration-and-Delivery) lets you configure and run predefined continuous integration and delivery pipelines. It connects with your Git SCM repository and in its user interface, you can easily monitor the status of your builds and detect errors as soon as possible, which helps you prevent integration problems before completing your development.

SAP Continuous Integration and Delivery has a ready-to-use pipeline for CAP, that is applicable to Node.js, Java and multitarget application (MTA) based projects. It does not require you to host your own Jenkins instance and it provides an easy, UI-guided way to configure your pipelines.

Try the tutorial [Get Started with SAP Continuous Integration and Delivery](https://developers.sap.com/tutorials/cicd-start-cap.html) to configure a CI/CD pipeline that builds, tests, and deploys your code changes.

## CI/CD Pipelines with SAP Piper

For more flexibility you can set up continuous delivery in your software development project, applicable to both SAP Business Technology Platform (BTP) and SAP on-premise platforms. SAP implements tooling for continuous delivery in project [Piper](https://www.project-piper.io/).

Try the tutorial [Create Automated System Tests for SAP Cloud Application Programming Model Projects](https://developers.sap.com/tutorials/cicd-wdi5-cap.html) to create system tests against a CAP-based sample application and automate your tests through a CI/CD pipeline.

[See a comparison with SAP Continuous Integration and Delivery Service.](https://www.project-piper.io/){.learn-more}

## GitHub Actions

GitHub offers continuous integration workflows using [GitHub Actions](https://docs.github.com/en/actions/automating-builds-and-tests/about-continuous-integration). In our [SFlight sample,](https://github.com/SAP-samples/cap-sflight) we use GitHub Actions in two simple workflows to test our samples on [current Node.js and Java versions](https://github.com/SAP-samples/cap-sflight/tree/main/.github/workflows).

