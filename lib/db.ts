import path from 'path';
import { sql } from '@vercel/postgres';

// If POSTGRES_URL or VERCEL is provided, we use Vercel Postgres (Cloud).
// Otherwise, we fallback to SQLite (Local).
const isCloud = !!process.env.POSTGRES_URL || !!process.env.VERCEL;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let db: any = null;

if (!isCloud) {
  try {
    // Dynamic require prevents Vercel from loading the native sqlite3 module during build
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const sqlite3 = require('sqlite3');
    const dbPath = path.resolve(process.cwd(), 'bookings.sqlite');
    db = new sqlite3.Database(dbPath, (err: any) => {
      if (err) {
        console.error('Error opening database', err);
      } else {
        db?.run(`
          CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            department TEXT NOT NULL,
            date TEXT NOT NULL,
            time_slot TEXT NOT NULL,
            status TEXT DEFAULT 'Pendiente',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(date, time_slot)
          )
        `);
      }
    });
  } catch (err) {
    console.warn('sqlite3 is not available in this environment');
  }
}

let initialized = false;

const initDb = async () => {
  if (initialized) return;
  
  if (isCloud) {
    try {
      await sql`
        CREATE TABLE IF NOT EXISTS bookings (
          id SERIAL PRIMARY KEY,
          name VARCHAR(255) NOT NULL,
          department VARCHAR(255) NOT NULL,
          date VARCHAR(255) NOT NULL,
          time_slot VARCHAR(255) NOT NULL,
          status VARCHAR(255) DEFAULT 'Pendiente',
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          UNIQUE(date, time_slot)
        )
      `;
      initialized = true;
    } catch (err) {
      console.error('Failed to initialize Postgres DB:', err);
    }
  } else {
    initialized = true;
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const run = async (query: string, params: any[] = []): Promise<{ id?: number; changes?: number }> => {
  await initDb();
  
  if (isCloud) {
    // Convert SQLite query '?' to Postgres '$1, $2'
    let pgQuery = query;
    let i = 1;
    while (pgQuery.includes('?')) {
      pgQuery = pgQuery.replace('?', `$${i}`);
      i++;
    }
    const result = await sql.query(pgQuery, params);
    return { changes: result.rowCount || 0 };
  } else {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      db!.run(query, params, function (this: any, err: any) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const get = async (query: string, params: any[] = []): Promise<any> => {
  await initDb();
  if (isCloud) {
    let pgQuery = query;
    let i = 1;
    while (pgQuery.includes('?')) {
      pgQuery = pgQuery.replace('?', `$${i}`);
      i++;
    }
    const result = await sql.query(pgQuery, params);
    return result.rows[0];
  } else {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      db!.get(query, params, (err: any, row: any) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const all = async (query: string, params: any[] = []): Promise<any[]> => {
  await initDb();
  if (isCloud) {
    let pgQuery = query;
    let i = 1;
    while (pgQuery.includes('?')) {
      pgQuery = pgQuery.replace('?', `$${i}`);
      i++;
    }
    const result = await sql.query(pgQuery, params);
    return result.rows;
  } else {
    return new Promise((resolve, reject) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      db!.all(query, params, (err: any, rows: any) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  }
};
