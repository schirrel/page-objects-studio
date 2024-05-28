<template>
    <section>
        <div class="flex justify-between items-center w-full px-4 py-3">
            <div class="flex items-center gap-1.5">
                <UInput v-model="option.name" />
                <UCheckbox v-model="option.value" label="Enable" />
            </div>

            <div class="flex gap-1.5 items-center">
                <UButton
                    icon="i-heroicons-check"
                    :disabled="option.name === '' || option.name === undefined"
                    @click="addOption"
                >
                    Add
                </UButton>
            </div>
        </div>

        <UTable :rows="state.options" />
    </section>
</template>

<script setup lang="ts">
const emit = defineEmits(['listUpdated']);
const props = defineProps(['options']);

const state = ref({
    options: props.options ?? []
});

const option = ref({
    name: undefined,
    value: true
});
function addOption() {
    state.value.options.push({ ...option.value });
    option.value.name = undefined;
    option.value.value = false;
    emit('listUpdated', state.value.options);
}
</script>
