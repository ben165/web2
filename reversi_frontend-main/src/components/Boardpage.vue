<script setup lang="ts">

import { computed, ref, reactive, watch } from 'vue'
import type { Ref } from 'vue';

import { State, BoardElement, StoneColor, otherPlayer } from './helper'

import axios from 'axios'

import { useConfirm } from 'primevue/useconfirm';
import ConfirmDialog from 'primevue/confirmdialog';
import Dialog from 'primevue/dialog';

const props = defineProps<{
    tableId?: number,
    username?: string,
    userId?: number
}>()
const tableId = props.tableId;
const username = props.username;
const userId = props.userId;

const emit = defineEmits(['leaveConfirmed']);

const urlParams = new URLSearchParams(window.location.search);
let player: StoneColor = StoneColor.BLACK;

let state = reactive(new State(1, 1, "0000000000000000000000000001200000021000000000000000000000000000"));
let data = reactive({
    opponent: "",
    online: false,
})

function updateData(opponent: string, online: boolean) {
    if (data.opponent !== opponent) { data.opponent = opponent };
    if (data.online !== online) { data.online = online }
}
const imaginaryBoardElement = new BoardElement(-1, 0, StoneColor.EMPTY);
let current: Ref<BoardElement> = ref(imaginaryBoardElement);

let intervallId: number = 0;
function poll() {
    intervallId = setInterval(
        () => axios.get(`http://localhost:3000/gameinfo?tableId=${tableId}&userId=${userId}`)
            .then((res) => {
                state.update(res.data.turn, res.data.player, res.data.boardStr);
                updateData(res.data.opponent, res.data.online);
                player = res.data.color;
                if (res.data.cancel === Number(otherPlayer(player))) {
                    restart2();
                }
            }), 1000)
}

function move(elm: BoardElement) {
    if (player === state.player) {
        state.makeMove(elm.getIndex());
        let body = {
            player: player,   
            move: elm.getIndex(),
            tableId: tableId
        };
        axios.post('http://localhost:3000/makeMove', body);
    }
}

function toColor(x: StoneColor) {
    if (x === StoneColor.EMPTY) return "green";
    else if (x === StoneColor.BLACK) return "black";
    else if (x === StoneColor.WHITE) return "white";
    else return "red";
}

function newCurrent(elm: BoardElement): void {
    current.value = elm;
}

function removeCurrent(): void {
    current.value = imaginaryBoardElement;
}

function isCurrentFlip(elm: BoardElement): boolean {
    let currentElm = current.value;
    return (player === state.player && currentElm && currentElm.flips.includes(elm.getIndex()));
}

function heighleightInvalidMove(elm: BoardElement): string {
    let currentElm = current.value;
    return (player === state.player && currentElm && (elm.getIndex() === currentElm.getIndex()) && (currentElm.flips.length === 0))
        ? 'display' : 'none';
}

function count(stoneColor: StoneColor): string {
    let count = 0;
    for (let i = 0; i < state.boardStr.length; i++) {
        if (Number(state.boardStr[i]) === stoneColor) {
            count++;
        }
    }
    return count.toString().padStart(2, '0');
}

let countBlack = computed(() => {
    return count(StoneColor.BLACK);
});

let countWhite = computed(() => {
    return count(StoneColor.WHITE);
});

poll();

const confirm = useConfirm();

function leave() {
    confirm.require({
        message: 'Are you sure you want to leave?',
        position: 'top',
        accept: () => {
            clearInterval(intervallId);
            emit('leaveConfirmed');
        },
    })
}

function restart2() {
    confirm.require({
        message: 'Your opponent wants to restart. Do you agree?',
        position: 'top',
        accept: () => {
            axios.post("http://localhost:3000/cancel", {
                player: player,
                tableId: tableId,
            });
        },
        reject: () => {
            axios.post("http://localhost:3000/cancel", {
                player: Number(StoneColor.EMPTY),
                tableId: tableId,
            });
        }
    })
}

function restart() {
    confirm.require({
        message: 'Are you sure you want to starte a new game?',
        position: 'top',
        accept: () => {
            axios.post("http://localhost:3000/cancel", {
                player: player,
                tableId: tableId,
            });
        },
    })
}

let showWinner = ref(false);

watch(
    () => state.winner,
    (winner) => {
        if (winner !== StoneColor.EMPTY) showWinner.value = true;
    }
)

</script>

<template>
    <ConfirmDialog></ConfirmDialog>
    <Dialog v-model:visible="showWinner">
        <img v-if="state.winner === player" src="/src/assets/winner.jpg"/>
        <img v-else src="/src/assets/looser.jpg" width="400" />
    </Dialog>
    <div>
        <Panel id="panel" :header="`Reversi Fight ${tableId}`">
            <div>
                <Toolbar>
                    <template #start>
                        <Button v-tooltip.bottom="'Leave'" icon="pi pi-sign-out" severity="danger"
                            @click="leave()"></button>
                    </template>

                    <template #center>
                        <Chip :class="player === state.player ? 'bg-primary': ''" :label="username"></Chip>
                        <svg width="100" height="100" transform="scale(0.7)">
                            <circle cx="50" cy="50" r="40" :fill="toColor(player)" :stroke="toColor(otherPlayer(player))" stroke-width="2">

                            </circle>
                            <text x="35" y="60" :fill="toColor(otherPlayer(player))" font-size="30">{{ player === StoneColor.BLACK ? countBlack : countWhite }}</text>
                        </svg>
                        :
                        <svg width="100" height="100" transform="scale(0.7)">
                            <circle cx="50" cy="50" r="40" :fill="toColor(otherPlayer(player))" :stroke="toColor(player)" stroke-width="2">

                            </circle>
                            <text x="35" y="60" :fill="toColor(player)" font-size="30">{{ player === StoneColor.BLACK ? countWhite : countBlack }}</text>
                        </svg>
                        
                        <Chip v-if="data.online" :class="player !== state.player ? 'bg-primary': ''" :label="data.opponent"></Chip>
                        <ProgressSpinner v-else style="width: 30px; height: 30px" stroke-width="8" />
                    </template>

                    <template #end>
                        <Button v-tooltip.bottom="'Restart'" icon="pi pi-refresh" severity="warning"
                            @click="restart()"></button>
                    </template>
                </Toolbar>
            </div>
            <div>
                <svg viewBox="0 0 800 800" @mouseleave="removeCurrent()" version="1.1" width="100%" height="100%"
                    xmlns="http://www.w3.org/2000/svg">
                    <g v-for="elm in state.board" @click="move(elm)" @mouseover="newCurrent(elm)" :key="elm.getIndex()">
                        <rect :x="100 * elm.x" :y="100 * elm.y" width="12.5%" height="12.5%" stroke="black" stroke-width="3"
                            fill="green"></rect>
                        <circle :display="(elm.stone === 0) && !isCurrentFlip(elm) ? 'none' : ''" :cx="100 * elm.x + 50"
                            :cy="100 * elm.y + 50" r="40" :fill="toColor(elm.stone)" :stroke-width="5"
                            :stroke="isCurrentFlip(elm) ? 'red' : 'none'">
                        </circle>
                        <g :display="heighleightInvalidMove(elm)">
                            <line :x1="100 * elm.x + 20" :x2="100 * elm.x + 80" :y1="100 * elm.y + 20"
                                :y2="100 * elm.y + 80" stroke="red" stroke-width="5" />
                            <line :x1="100 * elm.x + 80" :x2="100 * elm.x + 20" :y1="100 * elm.y + 20"
                                :y2="100 * elm.y + 80" stroke="red" stroke-width="5" />
                        </g>
                    </g>
                </svg>
            </div>
        </Panel>
    </div>
</template>


<style>
img {
    max-width: 50%;
    height: auto;
}
</style>
