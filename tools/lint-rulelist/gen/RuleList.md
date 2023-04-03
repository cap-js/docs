

Rules in ESLint are grouped by type to help you understand their purpose. Each rule has emojis denoting:

✔️ if the plugin's "recommended" configuration enables the rule

🔧 if problems reported by the rule are automatically fixable (`--fix`)

💡  if problems reported by the rule are manually fixable (editor)

🚧 if rule exists in plugin (main branch) but is not yet released (artifactory)
`
| Recommended | Auto-Fixable | Manually-Fixable | Pending Work | Name                                                                                       | Description                                                                                                               |
|:-----------:|:------------:|:----------------:|:------------:|--------------------------------------------------------------------------------------------|:--------------------------------------------------------------------------------------------------------------------------|
|      ✔️      |              |                  |              | [assoc2many-ambiguous-key](../tools/lint-rulelist/rules#assoc2many-ambiguous-key)     | Ambiguous key with a `TO MANY` relationship since entries could appear multiple times with the same key.                  |
|      ✔️      |              |        💡        |              | [auth-no-empty-restrictions](../tools/lint-rulelist/rules#auth-no-empty-restrictions) | `@restrict` and `@requires` must not be empty.                                                                            |
|      ✔️      |              |        💡        |              | [auth-use-requires](../tools/lint-rulelist/rules#auth-use-requires)                   | Use `@requires` instead of `@restrict.to` in actions and services with unrestricted events.                               |
|      ✔️      |              |                  |              | [auth-valid-restrict-grant](../tools/lint-rulelist/rules#auth-valid-restrict-grant)   | `@restrict.grant` must have valid values.                                                                                 |
|      ✔️      |              |                  |              | [auth-valid-restrict-keys](../tools/lint-rulelist/rules#auth-valid-restrict-keys)     | `@restrict` must have properly spelled `to`, `grant`, and `where` keys.                                                   |
|      ✔️      |              |        💡        |              | [auth-valid-restrict-to](../tools/lint-rulelist/rules#auth-valid-restrict-to)         | `@restrict.to` must have valid values.                                                                                    |
|      ✔️      |              |        💡        |              | [auth-valid-restrict-where](../tools/lint-rulelist/rules#auth-valid-restrict-where)   | `@restrict.where` must have valid values.                                                                                 |
|      ✔️      |              |                  |              | [extension-restrictions](../tools/lint-rulelist/rules#extension-restrictions)         | Extensions must not violate restrictions set by the extended SaaS app.                                                    |
|             |              |        💡        |              | [latest-cds-version](../tools/lint-rulelist/rules#latest-cds-version)                 | Checks whether the latest `@sap/cds` version is being used.                                                               |
|             |              |                  |              | [min-node-version](../tools/lint-rulelist/rules#min-node-version)                     | Checks whether the minimum Node.js version required by `@sap/cds` is achieved.                                            |
|      ✔️      |              |                  |              | [no-db-keywords](../tools/lint-rulelist/rules#no-db-keywords)                         | Avoid using reserved SQL keywords.                                                                                        |
|      ✔️      |              |                  |              | [no-dollar-prefixed-names](../tools/lint-rulelist/rules#no-dollar-prefixed-names)     | Names must not start with $ to avoid possible shadowing of reserved variables.                                            |
|      ✔️      |              |                  |              | [no-join-on-draft](../tools/lint-rulelist/rules#no-join-on-draft)                     | Draft-enabled entities shall not be used in views that make use of `JOIN`.                                                |
|      ✔️      |              |                  |              | [require-2many-oncond](../tools/lint-rulelist/rules#require-2many-oncond)             | Foreign key information of a `TO MANY` relationship must be defined within the target and specified in an `ON` condition. |
|      ✔️      |              |        💡        |              | [sql-cast-suggestion](../tools/lint-rulelist/rules#sql-cast-suggestion)               | Should make suggestions for possible missing SQL casts.                                                                   |
|             |      🔧      |        💡        |              | [start-elements-lowercase](../tools/lint-rulelist/rules#start-elements-lowercase)     | Regular element names should start with lowercase letters.                                                                |
|             |      🔧      |        💡        |              | [start-entities-uppercase](../tools/lint-rulelist/rules#start-entities-uppercase)     | Regular entity names should start with uppercase letters.                                                                 |
|      ✔️      |              |        💡        |              | [valid-csv-header](../tools/lint-rulelist/rules#valid-csv-header)                     | CSV files for entities must refer to valid element names.                                                                 |

