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
    <table class="lint-ref-table">
        <thead>
            <tr>
                <th class="col-prop">Recommended</th>
                <th class="col-prop">Fixable</th>
                <th class="col-prop">Sugguestions</th>
                <th class="col-prop" v-if="category !== 'Environment'">Editor</th>
                <th class="lint-rule">Rule</th>
            </tr>
        </thead>
        <tr v-for="entry in data[category]">
            <td class="lint-rule-prop">
                <text class="lint-prop-symbol">{{ entry.isRecommended }}</text>
            </td>
            <td class="lint-rule-prop">
                <text class="lint-prop-symbol">
                    {{ entry.hasFix }}
                </text>
            </td>
            <td class="lint-rule-prop">
                <text class="lint-prop-symbol">
                    {{ entry.hasSuggestions }}
                </text>
            </td>
            <td class="col-prop" v-if="category !== 'Environment'">
                <text class="lint-prop-symbol">
                    {{ entry.model }}
                </text>
            </td>
            <td class="lint-rule">
                <span v-if="!entry.url" class="col-name">{{ entry.rule }}</span>
                <a :href="entry.url" v-if="!!entry.url">{{ entry.rule }}</a>
                <br>
                <text class="lint-rule-desc">{{ entry.description }}</text>
            </td>
        </tr>
    </table>
</template>

<style scoped>
.lint-ref-table {
    display: block
}
.lint-rule-desc {
    font-size: small;
}
.lint-rule {
    width: 70%;
    line-height: 120%;
}
.lint-rule-name {
    font-weight: 500;
    color: #7d7d7d;
}
.lint-rule-prop {
    width: 5% !important;
    text-align: center; 
    vertical-align: middle;
}
.lint-rule-symbolprop {
    text-align: center;
}
</style>