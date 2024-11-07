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


```sh
git clone https://github.com/sap-samples/cloud-cap-samples samples
cd samples
npm install
cd bookstore
```


Start the server:


```sh
cds watch
```


## Sample queries

### Simple SELECT statement

```
const query = SELECT.from(Author)
```

