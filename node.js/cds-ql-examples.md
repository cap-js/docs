---
notebook: true
---
<script setup>
  import NotebookHint from '../.vitepress/theme/components/NotebookHint.vue'
</script>

# Examples for cds.ql


<NotebookHint />

This page is based on an [issue](https://github.com/cap-js/docs/issues/785). Let me quickly summarize what the feedback/need was.

- Querying in a complex data model with a lot of Associations and Compositions
- more syntax examples for typical SQL where conditions would be helpful too, like
  - { 'in': myArray }
  - { 'not in': myArray }
  - { 'like': '%test%' }
  - { or: { field1: { '>=': 900 }, field2: { '<=': 200 } } }
- How to check if an Association/Composition exists/not exists.

Notes on internal discussions can be found [here](https://github.tools.sap/cap/docs/issues/723)

## Prepare a project

Clone samples:


```sh
git clone https://github.com/sap-samples/cloud-cap-samples samples
cd samples
npm install
cd bookstore
```


Start the server:

<div class="impl node">

```sh
cds watch
```

</div>

## Sample queries

### Simple SELECT statement

```
const query = SELECT.from(Author)
```

