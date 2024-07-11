import Database from 'better-sqlite3';

const db = new Database('demo_bot.db');

db.pragma('journal_mode = WAL');

const initialQuery = `
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY,
    isAdmin INTEGER
  )
`;

db.exec(initialQuery);

export const saveUser = ({ id, isAdmin }) => {
  db.prepare('INSERT OR IGNORE INTO users (id, isAdmin) VALUES(?, ?)').run(id, isAdmin ? 1 : 0);
};

export const toggleUserAdmin = (id) => {
  const user = db.prepare('UPDATE users SET isAdmin = IIF(isAdmin=1, 0, 1) WHERE id = ? RETURNING *').get(id)

  return user?.isAdmin === 1;
};

export const isUserAdmin = (id) => {
  const user = db.prepare('SELECT isAdmin FROM users WHERE id = ?').get(id);

  return user?.isAdmin === 1;
};

export default db;