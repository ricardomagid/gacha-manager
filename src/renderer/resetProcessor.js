import { GAME_CONFIG } from '../game-config'

// Standard daily reset times (UTC) for most gacha game servers
const UTC_RESET_HOURS = {
  "America": 9,
  "Europe": 3,
  "Asia": 20,
  "TW/HK/MO": 20
}

const HSR_WEEKLY_ANCHORS = Object.fromEntries(
  Object.entries(GAME_CONFIG['Honkai: Star Rail'].weekly_anchors).map(([k, v]) => [k, new Date(v)])
);

const HSR_ENDGAME_ANCHORS = Object.fromEntries(
  Object.entries(GAME_CONFIG['Honkai: Star Rail'].endgame_anchors).map(([k, v]) => [k, new Date(v)])
);

const RESET_CONFIG = {
  "Weekly Bosses": (lastDailyReset) =>
    getWeeklyResetWindow(lastDailyReset),

  "Divergent Universe": (lastDailyReset) =>
    getHSRWeeklyResetWindow(lastDailyReset, "Divergent Universe"),

  "Currency Wars": (lastDailyReset) =>
    getHSRWeeklyResetWindow(lastDailyReset, "Currency Wars"),

  "Hollow Zero": (lastDailyReset) =>
    getWeeklyResetWindow(lastDailyReset),

  "Spiral Abyss": (lastDailyReset) =>
    getMidMonthResetWindow(lastDailyReset),

  "Imaginarium Theater": (lastDailyReset) =>
    getMonthlyResetWindow(lastDailyReset),

  "Memory of Chaos": (lastDailyReset) =>
    getHSREndgameResetWindow(lastDailyReset, "Memory of Chaos"),

  "Pure Fiction": (lastDailyReset) =>
    getHSREndgameResetWindow(lastDailyReset, "Pure Fiction"),

  "Apocalyptic Shadow": (lastDailyReset) =>
    getHSREndgameResetWindow(lastDailyReset, "Apocalyptic Shadow"),
};

function getLastDailyReset(now, serverResetHour) {
  const lastReset = new Date(Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate(),
    serverResetHour
  ));

  if (now.getTime() < lastReset.getTime()) {
    lastReset.setUTCDate(lastReset.getUTCDate() - 1);
  }

  return lastReset;
}

function getWeeklyResetWindow(lastDailyReset) {
  const lastReset = new Date(lastDailyReset);
  const day = lastReset.getUTCDay()
  const daysUntilLastMonday = day === 0 ? 6 : (day - 1)

  lastReset.setUTCDate(lastReset.getUTCDate() - daysUntilLastMonday);

  const nextReset = new Date(lastReset);
  nextReset.setUTCDate(nextReset.getUTCDate() + 7);

  return { last: lastReset, next: nextReset };
}

function getMonthlyResetWindow(lastDailyReset) {
  const lastReset = new Date(lastDailyReset);

  lastReset.setUTCDate(1);

  const nextReset = new Date(lastReset);
  nextReset.setUTCMonth(nextReset.getUTCMonth() + 1);

  return { last: lastReset, next: nextReset };
}

function getMidMonthResetWindow(lastDailyReset) {
  const lastReset = new Date(lastDailyReset);

  if (lastReset.getUTCDate() < 16) {
    lastReset.setUTCMonth(lastReset.getUTCMonth() - 1);
  }

  lastReset.setUTCDate(16);

  const nextReset = new Date(lastReset);
  nextReset.setUTCMonth(nextReset.getUTCMonth() + 1);
  nextReset.setUTCDate(16);

  return { last: lastReset, next: nextReset };
}

function getHSRWeeklyResetWindow(lastDailyResetInput, mode) {
  const current = new Date(lastDailyResetInput);
  return getIntervalResetWindow(
    HSR_WEEKLY_ANCHORS[mode],
    current,
    14
  );
}

function getHSREndgameResetWindow(lastDailyResetInput, mode) {
  const current = new Date(lastDailyResetInput);
  return getIntervalResetWindow(
    HSR_ENDGAME_ANCHORS[mode],
    current,
    42
  );
}

function getIntervalResetWindow(anchor, current, intervalDays) {
  const anchorDate = new Date(anchor);
  anchorDate.setUTCHours(current.getUTCHours());

  const diffMs = current - anchorDate;
  const intervalMs = intervalDays * 86_400_000;

  const cycles = Math.floor(diffMs / intervalMs);

  const last = new Date(anchorDate.getTime() + cycles * intervalMs);
  const next = new Date(last.getTime() + intervalMs);

  return { last, next };
}

export function computeTaskResetData(gameGroups) {
  gameGroups.forEach(gameGroup => {
    gameGroup.accounts.forEach(account => {
      computeSingleAccountResetData(account);
    });
  });

  return gameGroups;
}

export function computeSingleAccountResetData(account) {
  const now = new Date();

  const resetHour = UTC_RESET_HOURS[account.server];
  const lastDailyReset = getLastDailyReset(now, resetHour);
  const nextDailyReset = new Date(lastDailyReset);
  nextDailyReset.setUTCDate(nextDailyReset.getUTCDate() + 1);

  Object.values(account.tasks).forEach(taskType => {
    taskType.forEach(task => {
      const resetWindow = task.type === 'Daily'
        ? { last: lastDailyReset, next: nextDailyReset }
        : RESET_CONFIG[task.label](lastDailyReset);

      const isDone = task.last_completed !== null && new Date(task.last_completed) > resetWindow.last;

      task.duration = resetWindow.next - resetWindow.last;
      task.nextReset = resetWindow.next - now;
      task.isCompleted = isDone;
    })
  })
}