<script setup lang="ts">
import { computed, ref, reactive, watch } from 'vue'
import { useToast } from 'primevue/usetoast';
import type { Ref } from 'vue';
import axios from 'axios';

const emit = defineEmits(['enterSuccess']);

const toast = useToast();

let tableIdStr = ref("");
let username = ref("");
function requestEnter() {
    console.log(tableIdStr.value, username.value);
    let inputValid = true;
    if (tableIdStr.value === "") {
        inputValid = false;
        toast.add({
            severity: "error",
            summary: "Table ID field is empty"
        })
    }
    if (username.value === "") {
        inputValid = false;
        toast.add({
            severity: "error",
            summary: "Username field is empty"
        })
    }
    if (inputValid) {
        axios.get(`/enter?tableId=${tableIdStr.value}&username=${username.value}`)
            .then((res) => {
                let userId = res.data.userId;
                if (userId === -1) {
                    toast.add({
                        severity: "info",
                        summary: `Table with ID = ${tableIdStr.value} already has two players!`
                    })
                } else if (userId < -1) {
                    toast.add({
                        severity: "info",
                        summary: `Sorry, something went wrong...`
                    })
                } else {
                    emit('enterSuccess', Number(tableIdStr.value), username.value, userId);
                }
            })
    }

}
</script>


<template>
    <Toast />
    <Card>
        <template #title>Reversi Fight</template>
        <template #content>
            <Toolbar>
                <template #start>
                    <InputGroup>
                        <InputGroupAddon>
                            <i class="pi pi-table"></i>
                        </InputGroupAddon>
                        <InputText placeholder="Table ID (number > 0)" v-model="tableIdStr" />
                    </InputGroup>
                </template>

                <template #center>
                    <InputGroup>
                        <InputGroupAddon>
                            <i class="pi pi-user"></i>
                        </InputGroupAddon>
                        <InputText placeholder="Username" v-model="username" />
                    </InputGroup>
                </template>

                <template #end>
                    <Button label="Enter" @click="requestEnter"></Button>
                </template>
            </Toolbar>

            <div>
                <img class="introP" src="/src/assets/intro.jpg">
            </div>
        </template>
    </Card>
</template>

<style>
img {
    max-width: 100%;
    height: auto;
}
</style>