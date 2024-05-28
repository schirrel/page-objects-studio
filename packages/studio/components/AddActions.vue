<script setup lang="ts">
    import type {
        Action,
        GeneralNamingItem,
        Param,
        ParamsEntity,
    } from "~/models/types";

    const { data } = await useFetch("/api/actions");
    const emit = defineEmits(["selectFunction"]);

    const isOpen = ref(false);

    const selected = ref<Action | null>();
    function open(action: Action) {
        selected.value = action;
        isOpen.value = true;
    }

    function paramTest(param) {
        const str = param
            .map((prm) => prm.name + ` (${prm.type?.names.join("|")})`)
            .join(", ");
        return str;
    }

    watch(isOpen, () => {
        if (!isOpen.value) {
            selected.value = null;
        }
    });

    function selectFunction(action: Action, fn) {
        emit("selectFunction", { action, fn });
        isOpen.value = false;
    }
</script>

<template>
    <section>
        <UModal v-model="isOpen" class="actions-modal">
            <UCard
                v-if="selected"
                :ui="{
                    ring: '',
                    divide: 'divide-y divide-gray-100 dark:divide-gray-800',
                }">
                <template #header>
                    {{ selected.name }}
                    <p>{{ selected.description }}</p>
                </template>
                <table>
                    <thead>
                        <tr>
                            <th>Action</th>
                            <th>Description</th>
                            <th class="text-right">Params</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr
                            @click="selectFunction(selected, fn)"
                            class="hover:bg-slate-300 cursor-pointer"
                            v-for="fn in selected.functions"
                            :key="fn.id">
                            <td>{{ fn.id }}</td>
                            <td>{{ fn.description }}</td>
                            <td>
                                {{ paramTest(fn.params) }}
                            </td>
                        </tr>
                    </tbody>
                </table>
                <template #footer>
                    <UButton label="Close" @click="isOpen = false" />
                </template>
            </UCard>
        </UModal>
        <ul
            class="flex flex-wrap items-center justify-center text-gray-900 dark:text-white gap-8">
            <li
                v-for="action in data"
                :key="action.name"
                @click="open(action)"
                class="pointer-events-auto flex place-items-center justify-center shadow-2xl bg-slate-50 w-full md:w-36 h-36 mb-2 md:w-36 h-36 rounded-2xl">
                {{ action.name }}
            </li>
        </ul>
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
