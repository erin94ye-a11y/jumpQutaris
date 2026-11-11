const { DatabaseSync } = require('node:sqlite');
const { mkdirSync } = require('node:fs');
const path = require('node:path');

const RECORDS = { QutaraSignal: 'signals', QutaraDecision: 'decisions', VirtualOrder: 'orders', VirtualTrade: 'trades', RiskRejection: 'rejections' };

class Store {
  constructor(filename) {
    if (filename !== ':memory:') mkdirSync(path.dirname(filename), { recursive: true });
    this.db = new DatabaseSync(filename);
    this.db.exec(`PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;
      CREATE TABLE IF NOT EXISTS QutaraSession (id TEXT PRIMARY KEY, owner_hash TEXT NOT NULL UNIQUE, state TEXT NOT NULL, updated_at INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS QutaraConfig (session_id TEXT PRIMARY KEY REFERENCES QutaraSession(id), parameters TEXT NOT NULL);
    `);
    for (const table of Object.keys(RECORDS)) {
      this.db.exec(`CREATE TABLE IF NOT EXISTS ${table} (id TEXT PRIMARY KEY, session_id TEXT NOT NULL REFERENCES QutaraSession(id), record TEXT NOT NULL);
        CREATE INDEX IF NOT EXISTS ${table}_session ON ${table}(session_id);`);
    }
  }

  get(ownerHash) {
    const row = this.db.prepare('SELECT state FROM QutaraSession WHERE owner_hash = ?').get(ownerHash);
    return row ? JSON.parse(row.state) : null;
  }

  all() {
    return this.db.prepare('SELECT owner_hash, state FROM QutaraSession').all().map(row => ({ ownerHash: row.owner_hash, session: JSON.parse(row.state) }));
  }

  save(ownerHash, session) {
    this.db.exec('BEGIN IMMEDIATE');
    try {
      const existing = this.db.prepare('SELECT owner_hash FROM QutaraSession WHERE id = ?').get(session.id);
      if (existing && existing.owner_hash !== ownerHash) throw new Error('Session owner mismatch');
      this.db.prepare(`INSERT INTO QutaraSession (id, owner_hash, state, updated_at) VALUES (?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET state=excluded.state, updated_at=excluded.updated_at`).run(session.id, ownerHash, JSON.stringify(session), Date.now());
      this.db.prepare(`INSERT INTO QutaraConfig (session_id, parameters) VALUES (?, ?)
        ON CONFLICT(session_id) DO UPDATE SET parameters=excluded.parameters`).run(session.id, JSON.stringify(session.config));
      for (const [table, key] of Object.entries(RECORDS)) {
        const statement = this.db.prepare(`INSERT OR IGNORE INTO ${table} (id, session_id, record) VALUES (?, ?, ?)`);
        for (const record of session[key] || []) statement.run(record.id, session.id, JSON.stringify(record));
      }
      this.db.exec('COMMIT');
    } catch (error) {
      this.db.exec('ROLLBACK');
      throw error;
    }
  }

  records(ownerHash, type) {
    if (!Object.hasOwn(RECORDS, type)) throw new Error('Unknown record type');
    return this.db.prepare(`SELECT r.record FROM ${type} r JOIN QutaraSession s ON s.id=r.session_id WHERE s.owner_hash=? ORDER BY r.rowid`).all(ownerHash).map(row => JSON.parse(row.record));
  }

  close() { this.db.close(); }
}

module.exports = { Store };
