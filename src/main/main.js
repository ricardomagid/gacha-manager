import { app, BrowserWindow, ipcMain, protocol, net } from 'electron';
import { initDB, runMigrations, seedDatabase, syncGameConfig } from './db/db.js';
import { fetchTasksForAccount, fetchAccounts, fetchGamesWithoutAccounts, insertAccounts, updateAccount, deleteAccount, insertTaskLog, deleteLastTaskLog } from './helper.js';
import path from 'node:path';
import started from 'electron-squirrel-startup';
import Store from 'electron-store';
import { Notification } from 'electron';

protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
]);

const store = new Store()
let mainWindow;

const PRELOAD_PATH = path.join(__dirname, 'preload.js');

if (started) {
  app.quit();
}

// Groups tasks by type for a given account
function getTasksForUI(account_id) {
  let accountTasks = fetchTasksForAccount(account_id);

  return accountTasks.reduce((tasks, task) => {
    (tasks[task.type] ??= []).push(task);
    return tasks;
  }, {});
}

// Returns all accounts grouped by game with their tasks attached
function getGroupedAccounts() {
  const accounts = fetchAccounts();

  const grouped = Object.values(
    accounts.reduce((acc, account) => {
      if (!acc[account.game]) {
        acc[account.game] = {
          name: account.game,
          id: account.game_id,
          game_version: account.current_version,
          accounts: []
        };
      }

      acc[account.game].accounts.push({
        id: account.id,
        uid: account.game_uid,
        server: account.server,
        label: account.label,
        tasks: getTasksForUI(account.id)
      });

      return acc;
    }, {})
  );

  return grouped;
}

// --- Window Management ---

const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 650,
    minWidth: 800,
    minHeight: 550,
    webPreferences: {
      preload: PRELOAD_PATH,
    },
  });

  if (typeof MAIN_WINDOW_VITE_DEV_SERVER_URL !== 'undefined') {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadURL('app://./index.html');
  }
};

// --- IPC Handlers ---

ipcMain.handle("getGamesWithoutAccounts", () => {
  return fetchGamesWithoutAccounts();
})

ipcMain.handle('getGroupedAccounts', () => {
  return getGroupedAccounts();
});

ipcMain.handle('insertAccounts', (event, gameList) => {
  try {
    insertAccounts(gameList);
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
});

ipcMain.handle("updateAccount", (event, accountData) => {
  try {
    updateAccount(accountData.id, accountData.server, accountData.uid, accountData.label);
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle("deleteAccount", (event, accId) => {
  try {
    deleteAccount(accId);
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle("insertTaskLog", (event, taskLogData) => {
  try {
    insertTaskLog(taskLogData.task_id, taskLogData.account_id);
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle("deleteLastTaskLog", (event, taskLogData) => {
  try {
    deleteLastTaskLog(taskLogData.task_id, taskLogData.account_id);
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle("loadSettings", () => {
  try {
    return { success: true, data: store.store }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle("saveSettings", (event, settings) => {
  try {
    store.set(settings)
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

ipcMain.handle('sendNotification', (event, {title, body}) => {
  try {
    const notification = new Notification({
      title: title,
      body: body,
      silent: false
    })

    notification.show()
    return { success: true }
  } catch (error) {
    return { success: false, error: error.message }
  }
})

// --- App Entry Point ---

app.whenReady().then(() => {
  protocol.handle('app', (request) => {
    const url = request.url.replace('app://', '');
    return net.fetch('file://' + path.join(__dirname, '../renderer/main_window', url).replace(/\\/g, '/'));
  });

  app.setAppUserModelId(process.execPath);

  initDB();
  runMigrations();
  seedDatabase();
  syncGameConfig();

  createMainWindow()

});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
