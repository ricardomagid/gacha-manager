import { db } from './db/db.js';

export function fetchAccounts() {
    return db.prepare(`
        SELECT a.id, a.server, a.label, a.game_uid, g.id AS game_id, g.name AS game, g.current_version 
        FROM accounts a 
        JOIN games g ON a.game_id = g.id
    `).all();
}

export function fetchGamesWithoutAccounts() {
    return db.prepare(`
        SELECT g.id, g.name, g.current_version 
        FROM games g 
        LEFT JOIN accounts a ON a.game_id = g.id 
        WHERE a.id IS NULL
    `).all();
}

export function insertAccounts(game_list) {
    const insertAccountStmt = db.prepare(`
        INSERT INTO accounts (game_id, label, server) 
        VALUES (?, ?, ?)
    `);
    const countStmt = db.prepare(`
        SELECT count(*) AS count FROM accounts WHERE game_id = ?
    `);

    db.transaction((list) => {
        for (const { game_id, server } of list) {
            const row = countStmt.get(game_id);
            const custom_label = `Account ${row.count + 1}`;
            insertAccountStmt.run(game_id, custom_label, server);
        }
    })(game_list);
}

export function updateAccount(account_id, server, uid, label) {
    const result = db.prepare(`UPDATE accounts SET server = ?, game_uid = ?, label = ? WHERE id = ?`).run(server, uid, label, account_id)

    if (result.changes === 0) throw new Error('No rows updated');
}

export function deleteAccount(account_id) {
    db.prepare(`DELETE FROM accounts WHERE id = ?`).run(account_id);
}

export function insertTaskLog(task_id, account_id) {
    db.prepare(`INSERT INTO task_logs (account_id, task_id) VALUES (?, ?)`).run(account_id, task_id);
}

export function deleteLastTaskLog(task_id, account_id) {
    const info = db.prepare(`
        DELETE FROM task_logs 
        WHERE id = (
            SELECT id FROM task_logs 
            WHERE account_id = ? AND task_id = ? 
            ORDER BY completed_at DESC 
            LIMIT 1
        )
    `).run(account_id, task_id);

    return info.changes;
}

export function fetchTasksForAccount(account_id) {
    return db.prepare(`
        SELECT
            t.id as id,
            t.label,
            t.type_id,
            tt.name as type,
            MAX(tl.completed_at) as last_completed
        FROM tasks t
        JOIN task_types tt ON t.type_id = tt.id
        JOIN games g ON t.game_id = g.id
        JOIN accounts a ON g.id = a.game_id
        LEFT JOIN task_logs tl ON t.id = tl.task_id AND tl.account_id = a.id
        WHERE a.id = ?
        GROUP BY t.id
        ORDER BY t.type_id, t.id
    `).all(account_id);
}