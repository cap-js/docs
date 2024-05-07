---
notebook: true
---
<script setup>
  import NotebookHint from '../.vitepress/theme/components/NotebookHint.vue'
</script>

# Examples for cds.ql


<NotebookHint />

## Prepare a project

Clone samples:
<div class="impl node">
```sh
git clone https://github.com/sap-samples/cloud-cap-samples samples
cd samples
npm install
cd bookstore
```
</div>

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

