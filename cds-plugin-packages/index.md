---
status: released
---

<script setup>
  import PluginRow from '../.vitepress/theme/components/PluginRow.vue';
</script>

# CDS Plugin Packages

The `cds-plugin` technique allows to provide extension packages with auto-configuration.

[[toc]]

## List of Plugin Packages

<table>
  <thead>
    <th>Name</th>
    <th colspan="2">Supported Stacks</th>
    <th>Open Source</th>
    <th>Capabilities</th>
  </thead>
  <tbody>
    <PluginRow
      name="attachments"
    />
    <PluginRow
      name="audit-logging"
      repo="https://github.com/cap-js/audit-logging"
      :stacks="[
        { id: 'node', url: 'https://www.npmjs.com/package/@cap-js/audit-logging' },
        { id: 'java', url: '#' }
      ]"
      :capabilities="[
        'Integration to the SAP Audit Log service',
        'Out-of-the-box personal data-related audit logging based on annotations'
      ]"
    />
    <PluginRow
      name="change-tracking"
      repo="https://github.com/cap-js/change-tracking"
      :stacks="[
        { id:'node', url: 'https://www.npmjs.com/package/@cap-js/change-tracking' },
        { id: 'java', url: '#' }
      ]"
      :capabilities="[
        'Out-of-the box support for automatic capturing, storing, and viewing of the change records of modeled entities'
      ]"
    />
    <PluginRow
      name="graphql"
    />
    <PluginRow
      name="messaging"
    />
    <PluginRow
      name="notifications"
    />
  </tbody>
</table>
