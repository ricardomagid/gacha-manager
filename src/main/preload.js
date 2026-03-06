import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
    getGamesWithoutAccounts: () => ipcRenderer.invoke('getGamesWithoutAccounts'),
    insertAccounts: (gameList) => ipcRenderer.invoke('insertAccounts', gameList),
    updateAccount: (accountData) => ipcRenderer.invoke('updateAccount', accountData),
    deleteAccount: (accId) => ipcRenderer.invoke('deleteAccount', accId),
    getGroupedAccounts: () => ipcRenderer.invoke('getGroupedAccounts'),
    deleteLastTaskLog: (taskLogData) => ipcRenderer.invoke('deleteLastTaskLog', taskLogData),
    insertTaskLog: (taskLogData) => ipcRenderer.invoke('insertTaskLog', taskLogData),
    loadSettings: () => ipcRenderer.invoke('loadSettings'),
    saveSettings: (settings) => ipcRenderer.invoke('saveSettings', settings)
});