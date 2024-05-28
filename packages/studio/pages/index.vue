<template>
    <div class="grid grid-cols-2 gap-4">
        <div>
            <UCard>
                <template #header> Test </template>

                <UForm :state="state" class="space-y-4" @submit="onSubmit">
                    <UFormGroup label="File Name" name="fileName">
                        <UInput v-model="state.filename" />
                    </UFormGroup>

                    <UFormGroup label="Test Name" name="testName">
                        <UInput v-model="state.testname" />
                    </UFormGroup>

                    <UAccordion :items="items">
                        <template #options>
                            <Options @listUpdated="optionsUpdated" :options="state.options" />
                        </template>
                        <template #regressions>
                            <div class="flex justify-between items-center w-full px-4 py-3">
                                <div class="flex items-center gap-1.5">
                                    <UInput v-model="test.name" />
                                </div>

                                <div class="flex gap-1.5 items-center">
                                    <UButton
                                        icon="i-heroicons-check"
                                        :disabled="test.name === '' || test.name === undefined"
                                        @click="addTest"
                                    >
                                        Add
                                    </UButton>
                                </div>
                            </div>
                            <TestIts :its="state.its" @update="updateState" />
                        </template>
                    </UAccordion>

                    <UButton type="submit"> Save </UButton>
                </UForm>
            </UCard>
        </div>
        <div>
            <Preview :data="state" />
        </div>
    </div>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types';
import { v4 as uuidv4 } from 'uuid';

const state = ref({
    filename: '',
    testname: '',
    options: [],
    its: []
});

const spec = ref({
    title: '',
    code: ''
});

const test = ref({
    name: undefined
});

function optionsUpdated(options) {
    state.value.options = options;
}

function addTest() {
    state.value.its.push({ name: test.value.name, label: test.value.name, options: [], id: uuidv4() });
    test.value.name = undefined;
}

async function onSubmit(event: FormSubmitEvent) {
}
const items = [
    {
        label: 'Options',
        icon: 'i-heroicons-wrench-screwdriver',
        defaultOpen: true,
        slot: 'options'
    },
    {
        label: 'Regression Steps (its)',
        icon: 'i-heroicons-square-3-stack-3d',
        slot: 'regressions',
        defaultOpen: true
    }
];

function updateState(data) {
    if (data.its) {
        state.value.its = data.its;
    }
}

const buildItText = (it) => {
    const optionsDefinitions = it.options.map((f) => `${f.name}: ${f.value}`).join(`,`);
    const actions =
        it.actions?.map((act) => (act.fn ? '\n' + act.fn.longname.replace('#', '.') + '();\n' : '')).join(`\n\t`) || '';
    return `\tit('${it.name}', ${optionsDefinitions ? `{ options: ${optionsDefinitions}}` : ''} ()=> {${actions}})`;
};

watch(
    state,
    function () {
        spec.value.title = state.value.filename + '.spec.ts';
        const optionsDefinitions = state.value.options.map((f) => `${f.name}: ${f.value}`).join(`,`);
        spec.value.code = `describe('${state.value.testname}', ${optionsDefinitions ? `{ options: ${optionsDefinitions}}` : ''} ()=> {
${state.value.its.map(buildItText).join('\n')}
})`;
    },
    { deep: true, immediate: true }
);
</script>
