<template>
    <div :class="selectedTheme" id="app">
        <NotificationCenter />
        <AppSettings :accountsPerGame="accountsPerGame" />
        <ConfirmDialogue />
        <div class="app-bar">
            <span class="app-bar-logo">Theme</span>
            <div class="app-bar-right">
                <button class="theme-btn" :class="{ active: selectedTheme === '' }" @click="selectedTheme = ''">
                    <span class="theme-swatch emerald"></span>
                    <span>Default</span>
                </button>
                <button class="theme-btn" :class="{ active: selectedTheme === 'sparkle' }"
                    @click="selectedTheme = 'sparkle'">
                    <span class="theme-swatch crimson"></span>
                    <span>Sparkle</span>
                </button>
                <button class="settings-btn" @click="showSettings = !showSettings">
                    <span>⚙</span>
                    <span>Settings</span>
                </button>
            </div>
        </div>
        <SetupView v-if="currentView === 'setup'" @done="onSetupDone" :selectedTheme="selectedTheme" />
        <TasksView v-else-if="currentView === 'tasks'" :accountsPerGame="accountsPerGame"
            @refreshAccount="updateAccountTaskData" @refresh="loadData" :selectedTheme="selectedTheme" />
        <ScheduleView v-else-if="currentView === 'schedule'" :selectedTheme="selectedTheme" />
    </div>
</template>

<script setup>
import { watch, ref, onMounted, onUnmounted } from 'vue'

import '../styles/app.css';
import SetupView from './SetupView.vue'
import TasksView from './TasksView.vue'
import ScheduleView from './ScheduleView.vue'
import NotificationCenter from './components/NotificationCenter.vue'
import ConfirmDialogue from './components/ConfirmDialogue.vue'
import AppSettings from './components/AppSettings.vue'
import { useNotification } from './composables/useNotification.js'
import { useSettings } from './composables/useSettings.js'
import { computeTaskResetData, computeSingleAccountResetData } from './resetProcessor'

const { setTheme } = useNotification()
const { showSettings } = useSettings()

const accountsPerGame = ref([])
const currentView = ref(null);
const selectedTheme = ref('')
let taskTimer = null

const loadData = async () => {
    const groupedAccounts = await window.api.getGroupedAccounts()
    accountsPerGame.value = computeTaskResetData(groupedAccounts)
}

const updateAccountTaskData = (game_id, account_id) => {
    const game = accountsPerGame.value.find(game => game.id === game_id)
    let acc = game.accounts.find(acc => acc.id === account_id)
    if (!acc) return
    computeSingleAccountResetData(acc)
}

const onSetupDone = async () => {
    await loadData()
    currentView.value = 'tasks'
}

const scheduleUpdate = () => {
    const now = new Date()
    const msUntilNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds()

    taskTimer = setTimeout(() => {
        accountsPerGame.value = computeTaskResetData(accountsPerGame.value)
        scheduleUpdate()
    }, msUntilNextMinute)
}

watch(selectedTheme, (val) => setTheme(val), { immediate: true })

onMounted(async () => {
    await loadData()

    currentView.value = accountsPerGame.value.length === 0 ? 'setup' : 'tasks'
    scheduleUpdate()
})

onUnmounted(() => {
    clearTimeout(taskTimer)
})
</script>