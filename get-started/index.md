---
section: Getting Started
status: released
---

# Getting Started

<!-- [Sample Projects](https://github.com/sap-samples/cloud-cap-samples)
: See and try out our prebuilt sample projects on GitHub. -->

#### About "Capire"

"Capire" (Italian for ‘understand’) is the name of our CAP documentation you're looking at right now. It's organized as follows:

- [*About CAP*](../about/) — a brief introduction and overview of key concepts
- [*Getting Started*](#) — a few guides to get you started quickly
- [*Cookbook*](../guides/) — task-oriented guides from an app developer's point of view
- [*Advanced*](../advanced/) — additional guides re peripheries and deep dives
- [*Tools*](../tools/) - choose your preferred tools
- *Reference docs* → for [*CDS*](../cds/), [*Java*](../java/), [*Node.js*](../node.js/)
- [*Releases*](../releases/) - information about what is new and what has changed
- [*Resources*](../resources/) — links to other sources of information


#### Local Setup

::: tip
Keep in mind that CAP supports both stacks: Node.js and Java. You can switch between them with the links at the beginning of the following pages.
:::

With the first steps below, you can go for a minimal local setup as follows:

1. [Install _Node.js_](https://nodejs.org/) &rarr; always use the latest LTS version.
2. [Install _SQLite_](https://sqlite.org/download.html) (only required on Windows).
3. Install [`@sap/cds-dk`](https://www.npmjs.com/package/@sap/cds-dk) globally with:

    ```sh
    npm i -g @sap/cds-dk
    cds # test it
    ```

4. For CAP Java projects, install [Java](https://sapmachine.io) and [Maven](https://maven.apache.org/download.cgi) additionally.


[Problems? &rarr; See the troubleshooting guide.](../advanced/troubleshooting#npm-installation){.learn-more}

::: tip
Also use [our tools](../tools/) to improve your development experience.
:::


<script setup>
import { data as pages } from './index.data.js'
</script>

<br>
<IndexList :pages='pages' />
