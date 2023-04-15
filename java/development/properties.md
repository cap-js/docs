---
embed: link
status: released
---

<script setup>
import { data } from './properties.data.js'
</script>

<style scoped>
  h1:before {
    content: "Java"; display: block; font-size: 60%; margin: 0 0 .2em;
  }

  tr:hover .header-anchor, tr .header-anchor:focus { opacity: 1; }
  td.group { font-weight:500; }
  th.anchor, td.anchor { border-right:none; }
  th.prop,   td.prop { border-left:none; padding-left:0px;}

  /* expand this extra wide table on big screens */
  @media screen and (min-width: 1600px) {
    table {
      min-width: fit-content;
    }
  }
</style>

<!--- Migrated: @external/java/400-Development/01-properties/properties.md -> @external/java/development/properties.md -->

# CDS Properties

The following table lists all configuration properties, that can be used to configure the CAP Java SDK.
::: tip
In property files `<index>` should be replaced with a number and `<key>` with an arbitrary String. In YAML files, you can use standard YAML list and map structures.
:::

<table>
  <thead>
    <tr>
      <th class="anchor"></th>
      <th class="prop">Property</th>
      <th class="type">Type</th>
      <th class="default">Default Value</th>
      <th class="descr">Description</th>
    </tr>
  </thead>
  <tr v-for="r in data" :key="r.name" :id="r.anchor">
    <td class="anchor"><a :href="'#'+r.anchor" class="header-anchor"></a></td>
    <td class="prop" :class="{ group: r.header }" v-html="r.name"></td>
    <td class="type">{{ r.type }}</td>
    <td class="default">{{ r.defaultValue }}</td>
    <td class="descr" v-html="r.description"></td>
  </tr>
</table>
