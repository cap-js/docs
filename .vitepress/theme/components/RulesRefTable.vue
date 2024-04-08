<script setup lang="ts">
    interface Props {
      category: "Model Validation" | "Environment" | undefined;
    }
    // @ts-ignore
    withDefaults(defineProps<Props>(), {})
</script>

<script lang="ts">
    // @ts-ignore
    import { data } from '../../../tools/rules.data.ts';

    export default {
        data() {
            return data;
        }
    }
</script>

<template>
    <table class="ref-table">
        <tr v-for="entry in data[category]">
            <td class="col-prop">
                <text class="text-prop">{{ entry.isRecommended }}</text>
            </td>
            <td class="col-prop">
                <text class="text-prop">
                    {{ entry.hasFix }}
                </text>
            </td>
            <td class="col-prop">
                <text class="text-prop">
                    {{ entry.hasSuggestions }}
                </text>
            </td>
            <td class="col-prop" v-if="category !== 'Environment'">
                <text class="text-prop">
                    {{ entry.model }}
                </text>
            </td>
            <td class="col-rule">
                <span v-if="!entry.url" class="col-name">{{ entry.rule }}</span>
                <a :href="entry.url" v-if="!!entry.url">{{ entry.rule }}</a>
                <br>
                <text class="text-desc">{{ entry.description }}</text>
            </td>
        </tr>
    </table>
</template>

<style scoped>
.ref-table {
    display: block
}
.text-desc {
    font-size: small;
}
.col-rule {
    width: 70%;
    line-height: 120%;
}
.col-name {
    font-weight: 500;
    color: #7d7d7d;
}
.col-prop {
    width: 5% !important;
    text-align: center; 
    vertical-align: middle;
}
.text-prop {
    text-align: center;
}
</style>