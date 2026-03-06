<template>
    <Transition name="confirm">
        <div v-if="showSettings" class="settings-overlay" @click.self="showSettings = false">
            <div class="settings-modal">

                <div class="settings-header">
                    <div>
                        <p class="settings-eyebrow">Configuration</p>
                        <h1 class="settings-title">Settings</h1>
                    </div>
                    <button class="settings-close" @click="showSettings = false">✕</button>
                </div>

                <div class="settings-body">

                    <div class="settings-section">
                        <p class="settings-section-label">Automation</p>
                        <div class="settings-row">
                            <div class="settings-row-label">
                                <span>Automatic Daily Detection</span>
                                <small>Look for active game processes to automatically check daily tasks</small>
                            </div>
                            <label class="toggle">
                                <input type="checkbox" v-model="settings.checkGachaProcesses">
                                <span class="toggle-track"></span>
                            </label>
                        </div>
                    </div>

                    <div class="settings-section">
                        <p class="settings-section-label">Account Settings</p>
                        <p class="settings-section-desc">Configure automatic dailies and notifications per account</p>
                        <div class="game-groups">
                            <div v-for="game in props.accountsPerGame" :key="game.id" class="game-group">
                                <p class="game-group-title">{{ game.name }}</p>
                                <div class="account-grid">
                                    <div v-for="account in game.accounts" :key="account.id" class="account-chip-row">
                                        <span class="account-chip-label">{{ account.label || account.uid }}</span>
                                        <span class="account-chip-server">{{ account.server }}</span>
                                        <div class="chip-toggles">
                                            <label class="chip-toggle"
                                                :class="{ active: settings.automaticDailies[game.id]?.includes(account.id) }"
                                                title="Automatic Dailies" v-if="settings.checkGachaProcesses">
                                                <input type="checkbox"
                                                    :checked="settings.automaticDailies[game.id]?.includes(account.id)"
                                                    @change="toggleSetting(settings.automaticDailies, game.id, account.id)" />
                                                Auto
                                            </label>
                                            <label class="chip-toggle"
                                                :class="{ active: settings.windowsNotifications[game.id]?.includes(account.id) }"
                                                title="Notifications">
                                                <input type="checkbox"
                                                    :checked="settings.windowsNotifications[game.id]?.includes(account.id)"
                                                    @change="toggleSetting(settings.windowsNotifications, game.id, account.id)" />
                                                Notify
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>

                <div class="settings-footer">
                    <button class="cancel-btn" @click="showSettings = false">Cancel</button>
                    <button class="apply-btn" @click="saveChanges">Apply Changes</button>
                </div>

            </div>
        </div>
    </Transition>
</template>

<script setup>
import { useSettings } from '../composables/useSettings.js'

const { settings, showSettings, toggleSetting, saveSettings } = useSettings()

const props = defineProps({
    accountsPerGame: {
        type: Array,
        default: () => []
    }
})

const saveChanges = async () => {
    await saveSettings();
    showSettings.value = !showSettings.value
}
</script>

<style scoped>
.settings-overlay {
    position: fixed;
    inset: 0;
    z-index: 200;
    background: rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(5px);
    display: flex;
    align-items: center;
    justify-content: center;
}

.settings-modal {
    width: min(660px, 90vw);
    max-height: 82vh;
    border-radius: 16px;
    border: 1px solid var(--border-hover);
    background: var(--bg);
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.6);
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

.settings-header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    padding: 24px 28px 20px;
    border-bottom: 1px solid var(--border);
    flex-shrink: 0;
}

.settings-eyebrow {
    margin: 0 0 4px;
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.16em;
    text-transform: uppercase;
    color: var(--accent);
    opacity: 0.75;
}

.settings-title {
    margin: 0;
    font-size: 26px;
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--text);
}

.settings-close {
    width: 30px;
    height: 30px;
    border-radius: 7px;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--muted2);
    font-size: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.15s;
    flex-shrink: 0;
    margin-top: 2px;
}

.settings-close:hover {
    border-color: var(--border-hover);
    color: var(--text);
    background: var(--panel-hover);
}

.settings-body {
    flex: 1;
    overflow-y: auto;
    padding: 16px 28px 20px;
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.settings-body::-webkit-scrollbar {
    width: 8px;
}

.settings-body::-webkit-scrollbar-track {
    background: transparent;
}

.settings-body::-webkit-scrollbar-thumb {
    background: var(--border-hover);
    border-radius: 4px;
}

.settings-section {
    background: var(--card-solid);
    border: 1px solid var(--border);
    border-radius: 12px;
    padding: 18px 20px;
    transition: border-color 0.15s;
}

.settings-section:hover {
    border-color: var(--border-hover);
}

.settings-section-label {
    margin: 0 0 14px;
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.12em;
    text-transform: uppercase;
    color: var(--muted2);
}

.settings-section-desc {
    margin: -6px 0 16px;
    font-size: 12px;
    color: var(--muted);
    line-height: 1.55;
}

.settings-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
}

.settings-row-label {
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.settings-row-label span {
    font-size: 14px;
    font-weight: 600;
    color: var(--text);
}

.settings-row-label small {
    font-size: 11px;
    color: var(--muted);
    line-height: 1.5;
}

.toggle {
    position: relative;
    width: 42px;
    height: 23px;
    flex-shrink: 0;
}

.toggle input {
    opacity: 0;
    width: 0;
    height: 0;
    position: absolute;
}

.toggle-track {
    position: absolute;
    inset: 0;
    border-radius: 999px;
    background: var(--task-bg);
    border: 1px solid var(--border-hover);
    cursor: pointer;
    transition: background 0.2s, border-color 0.2s;
}

.toggle input:checked+.toggle-track {
    background: var(--accent-glow);
    border-color: var(--accent);
}

.toggle-track::after {
    content: '';
    position: absolute;
    top: 3px;
    left: 3px;
    width: 15px;
    height: 15px;
    border-radius: 50%;
    background: var(--muted);
    transition: transform 0.2s cubic-bezier(0.34, 1.4, 0.64, 1), background 0.2s;
}

.toggle input:checked+.toggle-track::after {
    transform: translateX(19px);
    background: var(--accent);
}

.game-groups {
    display: flex;
    flex-direction: column;
    gap: 18px;
}

.game-group-title {
    margin: 0 0 8px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    color: var(--muted2);
    text-transform: uppercase;
}

.account-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 7px;
}

.account-chip {
    display: flex;
    align-items: center;
    gap: 7px;
    padding: 6px 12px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--task-bg);
    cursor: pointer;
    user-select: none;
    transition: border-color 0.15s, background 0.15s;
}

.account-chip:hover {
    border-color: var(--border-hover);
    background: var(--panel-hover);
}

.account-chip--checked {
    border-color: var(--accent);
    background: var(--accent-glow);
}

.account-chip input {
    display: none;
}

.account-chip-label {
    font-size: 13px;
    font-weight: 600;
    color: var(--text);
}

.account-chip-server {
    font-size: 11px;
    color: var(--muted);
    font-family: 'Space Mono', monospace;
}

.account-chip-row {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 14px;
    border-radius: 10px;
    border: 1px solid var(--border);
    background: var(--task-bg);
    width: 100%;
    transition: border-color 0.15s;
}

.account-chip-row:hover {
    border-color: var(--border-hover);
}

.chip-toggles {
    margin-left: auto;
    display: flex;
    gap: 6px;
}

.chip-toggle {
    display: flex;
    align-items: center;
    gap: 5px;
    padding: 4px 10px;
    border-radius: 6px;
    border: 1px solid var(--border);
    background: transparent;
    color: var(--muted2);
    font-size: 11px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
    user-select: none;
}

.chip-toggle input { display: none; }

.chip-toggle:hover {
    border-color: var(--border-hover);
    color: var(--text);
}

.chip-toggle.active {
    border-color: var(--accent);
    background: var(--accent-glow);
    color: var(--accent);
}

.settings-footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;
    gap: 8px;
    padding: 14px 28px;
    border-top: 1px solid var(--border);
    flex-shrink: 0;
}

.cancel-btn {
    padding: 8px 18px;
    border-radius: 8px;
    border: 1px solid var(--border-hover);
    background: transparent;
    color: var(--muted2);
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s;
}

.cancel-btn:hover {
    background: var(--panel-hover);
    color: var(--text);
}

.apply-btn {
    padding: 8px 20px;
    border-radius: 8px;
    border: 1px solid var(--accent);
    background: var(--accent-glow);
    color: var(--accent);
    font-size: 13px;
    font-weight: 700;
    letter-spacing: 0.02em;
    cursor: pointer;
    transition: all 0.15s;
}

.apply-btn:hover {
    background: var(--accent);
    color: #000;
}

.confirm-enter-active,
.confirm-leave-active {
    transition: opacity 0.18s, transform 0.18s;
}

.confirm-enter-from,
.confirm-leave-to {
    opacity: 0;
    transform: scale(0.98) translateY(4px);
}

.section-slide-enter-active,
.section-slide-leave-active {
    transition: opacity 0.2s, transform 0.2s;
    overflow: hidden;
}

.section-slide-enter-from,
.section-slide-leave-to {
    opacity: 0;
    transform: translateY(-6px);
}
</style>