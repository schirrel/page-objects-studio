<script setup lang="ts">
    const { data } = await useFetch("/api/actions");
    import { useFetch } from "nuxt/app";
    import { v4 as uuidv4 } from "uuid";
    import { ref, watch, computed } from "vue";
    import type { It } from "~/models/It";
import type { Action } from "~/models/types";

    const props = defineProps(["it"]);
    const emit = defineEmits(["selectFunction", "removeFunction"]);
    const it = ref<It>();

    const isOpen = ref(false);
    watch(
        props,
        (changed) => {
            if (changed?.it) {
                it.value = changed.it;
            }
        },
        {
            deep: true,
            immediate: true,
        }
    );

    function addFunction(act: Action) {
        isOpen.value = false;
        act._id = uuidv4();
        emit("selectFunction", act);
    }

    function removeAction(act: Action) {
        emit("removeFunction", act);
    }

    const columns = [
        {
            key: "name",
            label: "Action",
        },
        {
            key: "actions",
        },
    ];

    const list = computed(() => {
        return it.value?.actions?.map((action) => {
            return { name: action.fn.longname.replace("#", "."), action };
        });
    });
</script>

<template>
    <section>
        <UCard
            class="w-full"
            :ui="{
                base: '',
                ring: '',
                divide: 'divide-y divide-gray-200 dark:divide-gray-700',
                header: { padding: 'px-4 py-5' },
                body: {
                    padding: '',
                    base: 'divide-y divide-gray-200 dark:divide-gray-700',
                },
                footer: { padding: 'p-4' },
            }">
            <div class="flex justify-between items-center w-full px-4 py-3">
                <div class="flex gap-1.5 items-center">
                    <UButton
                        icon="i-heroicons-plus"
                        color="gray"
                        size="xs"
                        @click="isOpen = true">
                        Add Action
                    </UButton>
                </div>
            </div>
            {{ isOpen }}
            <UTable :columns="columns" :rows="list">
                <template #actions-data="{ row }">
                    <UButton
                        style="float: right"
                        color="red"
                        variant="ghost"
                        icon="i-heroicons-trash-20-solid"
                        label="Remove"
                        @click="removeAction(row)" />
                </template>
            </UTable>
        </UCard>
        <UModal v-model="isOpen" class="actions-modal">
            <UCard>
                <template #header>
                    <div class="flex items-center justify-between">
                        <h3
                            class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
                            Select Action
                        </h3>
                        <UButton
                            color="gray"
                            variant="ghost"
                            icon="i-heroicons-x-mark-20-solid"
                            class="-my-1"
                            @click="isOpen = false" />
                    </div>
                </template>
                <AddActions @selectFunction="addFunction" />
            </UCard>
        </UModal>
    </section>
</template>

<style>
    .actions-modal table {
        table-layout: fixed;
    }
    .actions-modal td {
        word-wrap: break-word;
        padding-right: 20px;
    }

    .actions-modal [data-headlessui-state] {
        min-width: 90vw !important;
    }
</style>
