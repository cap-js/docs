import { DefaultTheme } from 'vitepress'
const sidebar: DefaultTheme.Sidebar = [
  {
    "link": "/about/",
    "text": "About",
    "items": [
      {"link": "/about/related", "text": "Related Concepts", "items": []},
      {"link": "/about/features", "text": "Features", "items": []},
      {"link": "/about/glossary", "text": "Glossary", "items": []}
    ],
    "collapsed": true
  },
  {
    "link": "/get-started/",
    "text": "Getting Started",
    "items": [
      {"link": "/get-started/hello-world", "text": "Hello World!", "items": []},
      {"link": "/get-started/in-a-nutshell", "text": "in a Nutshell", "items": []},
      {"link": "/get-started/projects/", "text": "Project Layouts", "items": []},
      {"link": "/get-started/grow-as-you-go", "text": "Grow As You Go", "items": []}
    ],
    "collapsed": true
  },
  {
    "link": "/guides/",
    "text": "Cookbook",
    "items": [
      {"link": "/guides/domain-models/", "text": "Domain Modeling", "items": []},
      {"link": "/guides/providing-services/", "text": "Providing Services", "items": []},
      {"link": "/guides/using-services/", "text": "Consuming Services", "items": []},
      {
        "link": "/guides/messaging/",
        "text": "Messaging",
        "items": [
          {"link": "/guides/messaging/s4", "text": "Events from S/4", "items": []},
          {"link": "/guides/messaging/event-mesh", "text": "SAP Event Mesh", "items": []}
        ],
        "collapsed": true
      },
      {"link": "/guides/databases/", "text": "Databases", "items": []},
      {"link": "/guides/authorization/", "text": "Authorization", "items": []},
      {"link": "/guides/i18n/", "text": "Localization, i18n", "items": []},
      {"link": "/guides/localized-data/", "text": "Localized Data", "items": []},
      {"link": "/guides/temporal-data/", "text": "Temporal Data", "items": []},
      {"link": "/guides/media-data/", "text": "Media Data", "items": []},
      {
        "link": "/guides/data-privacy/",
        "text": "Data Privacy",
        "items": [
          {"link": "/guides/data-privacy/introduction", "text": "Basics", "items": []},
          {"link": "/guides/data-privacy/pdm", "text": "Personal Data Management", "items": []},
          {"link": "/guides/data-privacy/audit-log", "text": "Audit Log", "items": []}
        ],
        "collapsed": true
      },
      {
        "link": "/guides/multitenancy/",
        "text": "Multitenancy",
        "items": [
          {"link": "/guides/multitenancy/mtxs", "text": "MTX Reference", "items": []},
          {"link": "/guides/multitenancy/old-mtx-migration", "text": "MTX Migration", "items": []},
          {"link": "/guides/multitenancy/old-mtx-apis", "text": "Old MTX", "items": []}
        ],
        "collapsed": true
      },
      {
        "link": "/guides/extensibility/",
        "text": "Extensibility",
        "items": [
          {"link": "/guides/extensibility/customization", "text": "Extend SaaS Apps", "items": []},
          {"link": "/guides/extensibility/ui-flex", "text": "Key-User Extensibility", "items": []},
          {"link": "/guides/extensibility/feature-toggles", "text": "Feature Toggles", "items": []},
          {"link": "/guides/extensibility/composition", "text": "Reuse & Compose", "items": []},
          {"link": "/guides/extensibility/customization-old", "text": "Extending and Customizing SaaS Solutions (Old)", "items": []}
        ],
        "collapsed": true
      },
      {
        "link": "/guides/deployment/",
        "text": "Deployment",
        "items": [
          {"link": "/guides/deployment/to-cf", "text": "Deploy to CF", "items": []},
          {"link": "/guides/deployment/deploy-to-kyma", "text": "Deploy to Kyma/K8s", "items": []},
          {"link": "/guides/deployment/as-saas", "text": "Deploy as SaaS App", "items": []},
          {"link": "/guides/deployment/cicd", "text": "Deploy with CI/CD", "items": []},
          {"link": "/guides/deployment/custom-builds", "text": "Custom Builds", "items": []}
        ],
        "collapsed": true
      }
    ],
    "collapsed": true
  },
  {
    "link": "/advanced/",
    "text": "Advanced",
    "items": [
      {"link": "/advanced/openapi", "text": "OpenAPI", "items": []},
      {"link": "/advanced/odata/", "text": "OData", "items": []},
      {"link": "/advanced/fiori/", "text": "Fiori UIs", "items": []},
      {"link": "/advanced/monitoring/", "text": "Monitoring", "items": []},
      {"link": "/advanced/hybrid-testing/", "text": "Hybrid Testing", "items": []},
      {"link": "/advanced/hana/", "text": "Native SAP HANA", "items": []},
      {"link": "/advanced/performance-modeling/", "text": "Performance Modeling", "items": []},
      {"link": "/advanced/troubleshooting/", "text": "Troubleshooting", "items": []}
    ],
    "collapsed": true
  },
  {
    "link": "/tools/",
    "text": "Tools",
    "items": [{"link": "/tools/lint-rulelist/rules-released", "text": "CDS Lint Rules", "items": []}],
    "collapsed": true
  },
  {
    "link": "/cds/",
    "text": "CDS",
    "items": [
      {"link": "/cds/cdl", "text": "Definition Language", "items": []},
      {"link": "/cds/csn", "text": "Schema Notation", "items": []},
      {"link": "/cds/cql", "text": "Query Language", "items": []},
      {"link": "/cds/cqn", "text": "Query Notation", "items": []},
      {"link": "/cds/cxn", "text": "Expressions", "items": []},
      {"link": "/cds/types", "text": "Built-in Types", "items": []},
      {"link": "/cds/common", "text": "@sap/cds/common", "items": []},
      {"link": "/cds/annotations", "text": "Annotations", "items": []},
      {"link": "/cds/compiler-messages", "text": "Compiler Messages", "items": []},
      {"link": "/cds/compiler-v2/", "text": "Upgrade to Compiler v2", "items": []},
      {"link": "/cds/models", "text": "Nature of Models", "items": []}
    ],
    "collapsed": true
  },
  {
    "link": "/java/",
    "text": "Java",
    "items": [
      {"link": "/java/getting-started/", "text": "Getting Started", "items": []},
      {"link": "/java/architecture/", "text": "Stack Architecture", "items": []},
      {"link": "/java/consumption-api/", "text": "Services", "items": []},
      {"link": "/java/provisioning-api/", "text": "Event Handlers", "items": []},
      {"link": "/java/data/", "text": "Working with Data", "items": []},
      {"link": "/java/query-api/", "text": "Building CQL Statements", "items": []},
      {"link": "/java/query-execution/", "text": "Executing CQL Statements", "items": []},
      {"link": "/java/query-introspection/", "text": "Introspecting CQL Statements", "items": []},
      {"link": "/java/reflection-api/", "text": "Working with CDS Models", "items": []},
      {"link": "/java/persistence-services/", "text": "Persistence Services", "items": []},
      {"link": "/java/application-services/", "text": "Application Services", "items": []},
      {"link": "/java/fiori-drafts/", "text": "Fiori Drafts", "items": []},
      {"link": "/java/indicating-errors/", "text": "Indicating Errors", "items": []},
      {"link": "/java/request-contexts/", "text": "Request Contexts", "items": []},
      {"link": "/java/changeset-contexts/", "text": "ChangeSet Contexts", "items": []},
      {"link": "/java/security/", "text": "Security", "items": []},
      {"link": "/java/remote-services/", "text": "Remote Services", "items": []},
      {"link": "/java/messaging-foundation/", "text": "Messaging", "items": []},
      {"link": "/java/multitenancy/", "text": "Multitenancy (Classic)", "items": []},
      {"link": "/java/advanced/", "text": "Advanced Concepts", "items": []},
      {"link": "/java/auditlog/", "text": "Audit Logging", "items": []},
      {"link": "/java/outbox/", "text": "Outbox", "items": []},
      {
        "link": "/java/development/",
        "text": "Development",
        "items": [{"link": "/java/development/properties", "text": "CDS Properties", "items": []}],
        "collapsed": true
      },
      {"link": "/java/observability/", "text": "Observability", "items": []},
      {"link": "/java/migration/", "text": "Migration", "items": []}
    ],
    "collapsed": true
  },
  {
    "link": "/node.js/",
    "text": "Node.js",
    "items": [
      {"link": "/node.js/cds-facade", "text": "<code>cds</code> Facade", "items": []},
      {"link": "/node.js/app-services/", "text": "Application Services", "items": []},
      {"link": "/node.js/best-practices/", "text": "Best Practices", "items": []},
      {"link": "/node.js/cds-compile", "text": "cds.compile", "items": []},
      {"link": "/node.js/cds-connect", "text": "cds.connect", "items": []},
      {"link": "/node.js/cds-context-tx", "text": "Transactions", "items": []},
      {"link": "/node.js/cds-dk", "text": "CDS Design Time", "items": []},
      {"link": "/node.js/cds-env", "text": "Configuration", "items": []},
      {"link": "/node.js/cds-log", "text": "cds.log", "items": []},
      {"link": "/node.js/cds-reflect", "text": "cds.reflect", "items": []},
      {"link": "/node.js/cds-serve", "text": "cds.serve/r", "items": []},
      {"link": "/node.js/cds-test", "text": "cds.test", "items": []},
      {"link": "/node.js/cds-ql/", "text": "cds.ql", "items": []},
      {"link": "/node.js/events/", "text": "<code>cds</code>.Event/Request", "items": []},
      {"link": "/node.js/services/", "text": "Class <code>cds</code>.Service", "items": []},
      {"link": "/node.js/databases/", "text": "Databases", "items": []},
      {"link": "/node.js/messaging/", "text": "Messaging", "items": []},
      {"link": "/node.js/middlewares/", "text": "Middlewares", "items": []},
      {"link": "/node.js/protocols/", "text": "Protocols", "items": []},
      {"link": "/node.js/remote-services/", "text": "Remote Services", "items": []},
      {"link": "/node.js/authentication/", "text": "Authentication", "items": []},
      {"link": "/node.js/typescript", "text": "Using TypeScript", "items": []}
    ],
    "collapsed": true
  },
  {
    "link": "/releases/",
    "text": "Releases",
    "items": [
      {
        "link": "/releases/changelog/",
        "text": "Changelog",
        "items": [
          {"link": "/releases/changelog/2018", "text": "Changelog 2018", "items": []},
          {"link": "/releases/changelog/2019", "text": "Changelog 2019", "items": []},
          {"link": "/releases/changelog/2020", "text": "Changelog 2020", "items": []},
          {"link": "/releases/changelog/2021", "text": "Changelog 2021", "items": []},
          {"link": "/releases/changelog/2022", "text": "Changelog 2022", "items": []}
        ],
        "collapsed": true
      },
      {
        "link": "/releases/archive/",
        "text": "Archive",
        "items": [
          {
            "link": "/releases/archive/2020/",
            "text": "All of 2020",
            "items": [
              {"link": "/releases/feb20/", "text": "February 2020", "items": []},
              {"link": "/releases/mar20/", "text": "March 2020", "items": []},
              {"link": "/releases/apr20/", "text": "April 2020", "items": []},
              {"link": "/releases/may20/", "text": "May 2020", "items": []},
              {"link": "/releases/jun20/", "text": "June 2020", "items": []},
              {"link": "/releases/july20/", "text": "July 2020", "items": []},
              {"link": "/releases/aug20/", "text": "August 2020", "items": []},
              {"link": "/releases/sep20/", "text": "September 2020", "items": []},
              {"link": "/releases/oct20/", "text": "October 2020", "items": []},
              {"link": "/releases/nov20/", "text": "November 2020", "items": []}
            ],
            "collapsed": true
          },
          {
            "link": "/releases/archive/2021/",
            "text": "All of 2021",
            "items": [
              {"link": "/releases/jan21/", "text": "January 2021", "items": []},
              {"link": "/releases/feb21/", "text": "February 2021", "items": []},
              {"link": "/releases/mar21/", "text": "March 2021", "items": []},
              {"link": "/releases/may21/", "text": "May 2021", "items": []},
              {"link": "/releases/july21/", "text": "July 2021", "items": []},
              {"link": "/releases/aug21/", "text": "August 2021", "items": []},
              {"link": "/releases/oct21/", "text": "October 2021", "items": []},
              {"link": "/releases/nov21/", "text": "November 2021", "items": []},
              {"link": "/releases/dec21/", "text": "December 2021", "items": []}
            ],
            "collapsed": true
          },
          {"link": "/releases/feb22/", "text": "February 2022", "items": []},
          {"link": "/releases/mar22/", "text": "March 2022", "items": []},
          {"link": "/releases/apr22/", "text": "April 2022", "items": []},
          {"link": "/releases/jun22/", "text": "June 2022", "items": []},
          {"link": "/releases/aug22/", "text": "August 2022", "items": []}
        ],
        "collapsed": true
      },
      {"link": "/releases/sep22/", "text": "September 2022", "items": []},
      {"link": "/releases/oct22/", "text": "October 2022", "items": []},
      {"link": "/releases/dec22/", "text": "December 2022", "items": []},
      {"link": "/releases/jan23/", "text": "January 2023", "items": []},
      {"link": "/releases/schedule", "text": "Schedule", "items": []}
    ],
    "collapsed": true
  },
  {
    "link": "/resources/",
    "text": "Resources",
    "items": [{"link": "/resources/events/", "text": "CAP Events Overview", "items": []}],
    "collapsed": true
  }
]
export default sidebar