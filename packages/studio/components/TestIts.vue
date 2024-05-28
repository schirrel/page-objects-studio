<template>
    <UAccordion :items="its">
        <template #item="{ item }">
            <article class="p-4">
                {{ item.name }}

                <UTabs :items="itTabItems">
                    <template #options>
                        <Options
                            :options="item.options"
                            @listUpdated="(options) => optionsUpdatedForIt(item, options)"
                        />
                    </template>
                    <template #actions>
                        <Actions
                            :it="item"
                            @selectFunction="(data) => addFunction(item, data)"
                            @removeFunction="(data) => removeFunction(item, data)"
                        />
                    </template>
                </UTabs>
            </article>
        </template>
    </UAccordion>
</template>

<script setup lang="ts">
import type { FormSubmitEvent } from '#ui/types';
const emit = defineEmits(['update']);
const props = defineProps(['its']);

const its = ref([]);

function optionsUpdatedForIt(itToUpdate, options) {
    its.value.forEach((it) => {
        if (itToUpdate.id == it.id) {
            itToUpdate.options = options;
            return;
        }
    });
    emit('update', { its: its.state });
}

const itTabItems = [
    {
        slot: 'options',
        label: 'Options'
    },
    {
        slot: 'actions',
        label: 'Actions'
    }
];
function addFunction(itToUpdate, action) {
    its.value.forEach((it) => {
        if (itToUpdate.id == it.id) {
            itToUpdate.actions = itToUpdate.actions || [];
            itToUpdate.actions.push(action);
            return;
        }
    });
    emit('update', { its: its.state });
}

function removeFunction(itToUpdate, val) {
    its.value.forEach((it) => {
        if (itToUpdate.id == it.id) {
            itToUpdate.actions = itToUpdate.actions.filter((act) => act._id !== val.action._id);
            return;
        }
    });
    emit('update', { its: its.state });
}

watch(
    props,
    (changed) => {
        if (changed?.its) {
            its.value = changed.its;
        }
    },
    {
        deep: true,
        immediate: true
    }
);
</script>
