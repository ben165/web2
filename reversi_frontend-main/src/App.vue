<script setup lang="ts">

import { ref } from 'vue'

import Boardpage from './components/Boardpage.vue'
import Startpage from './components/Startpage.vue'

let enterStatus = ref(false);

let tableId: number;
let username: string;
let userId: number;

function enter(table: number, name: string, id: number) {
    tableId = table;
    username = name;
    userId = id;
    enterStatus.value = true;
}

function leave() {
    enterStatus.value = false;
}

</script>


<template>
    <Startpage v-if="!enterStatus" @enterSuccess="enter"></Startpage>
    <Boardpage v-else @leaveConfirmed="leave" :tableId="tableId" :username="username" :userId="userId"></Boardpage>
</template>