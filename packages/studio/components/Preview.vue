<template>
    <div>
        <h1 class="font-semibold text-2xl mb-11">{{ spec.title }}</h1>
        <pre class="code-preview"><code class="language-javascript" v-html="spec.code"></code></pre>

    </div>
</template>

<script setup lang="ts">
import hljs from 'highlight.js/lib/core';
import javascript from 'highlight.js/lib/languages/javascript';
import { type It } from '../models/It'
import { type Action } from '../models/Action'
// Then register the languages you need
hljs.registerLanguage('javascript', javascript);

const props = defineProps(['data']);
const spec = ref({
    title: '',
    code: ''
});

const buildItText = (it: It) => {
    const optionsDefinitions = it.options.map((f) => `${f.name}: ${f.value}`).join(`,`);
    const actions =
        it.actions?.map((act: Action) => (act.fn ? '\n\t' + act.fn.longname.replace('#', '.') + '();\n' : '')).join('') || '';
    return `\tit('${it.name}', ${optionsDefinitions ? `{ options: { ${optionsDefinitions}}, }` : ''} ()=> {${actions}\t})`;
};

watch(
    props,
    function () {
        const data = props.data;
        spec.value.title = data.filename + '.spec.ts';
        const optionsDefinitions = data.options.map((f: Record<string, any>) => `${f.name}: ${f.value}`).join(`, `);
        const code = `describe('${data.testname}', ${optionsDefinitions ? `{ options: { ${optionsDefinitions} },` : ''} ()=> {
${data.its.map(buildItText).join('\n')}
})`;
        spec.value.code = hljs.highlight(code, { language: 'javascript' }).value;
    },
    { deep: true, immediate: true }
);
</script>


<style lang="scss">
@use "highlight.js/scss/atom-one-dark.scss";
.code-preview{
    background: #333;
    color: #eee;
    padding: 20px 8px;
    border-radius: 4px;
}
</style>