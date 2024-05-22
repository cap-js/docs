---
section: Tools
shorty: Tools
redirect_from:
  - get-started/dev-tools
  - get-started/tools
status: released
# outline: 2
---

# Choose Your Preferred Tools
{{$frontmatter?.synopsis}}


<script setup>
import { useData } from 'vitepress'
const { theme } = useData()
const { versions } = theme.value.capire

import { data as pages } from './index.data.ts'
</script>

<br>
<IndexList :pages='pages' />
