// Shared SQLite connection used across the app.
// If app.js already created a connection, reuse it.

if (globalThis.__postalDb) {
  module.exports = globalThis.__postalDb;
  return;
}

const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const dbPath = path.join(__dirname, 'postal.db');

const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('[db] Failed to open database:', err.message);
  }
});

db.serialize(() => {
  db.run('PRAGMA foreign_keys = ON');

  // Minimal schema to keep the app usable even on a fresh DB file.
  db.exec(`
    CREATE TABLE IF NOT EXISTS Customers (
      customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      phone TEXT,
      address TEXT,
      role TEXT DEFAULT 'customer',
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS Parcels (
      parcel_id INTEGER PRIMARY KEY AUTOINCREMENT,
      tracking_number TEXT NOT NULL UNIQUE,
      sender_id INTEGER NOT NULL,
      receiver_name TEXT NOT NULL,
      receiver_phone TEXT,
      receiver_address TEXT,
      weight REAL DEFAULT 0,
      size TEXT,
      shipping_cost REAL DEFAULT 0,
      status TEXT DEFAULT 'Pending',
      created_at TEXT DEFAULT (datetime('now')),
      FOREIGN KEY (sender_id) REFERENCES Customers(customer_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Payments (
      payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
      amount REAL NOT NULL,
      payment_method TEXT,
      payment_status TEXT DEFAULT 'Pending',
      payment_date TEXT DEFAULT (datetime('now')),
      parcel_id INTEGER NOT NULL,
      FOREIGN KEY (parcel_id) REFERENCES Parcels(parcel_id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS Tracking (
      tracking_id INTEGER PRIMARY KEY AUTOINCREMENT,
      parcel_id INTEGER NOT NULL,
      update_time TEXT DEFAULT (datetime('now')),
      location TEXT,
      description TEXT,
      FOREIGN KEY (parcel_id) REFERENCES Parcels(parcel_id) ON DELETE CASCADE
    );
  `);
});

globalThis.__postalDb = db;
module.exports = db;
if (globalThis.__postalDb) {
  module.exports = globalThis.__postalDb;
} else {
  const path = require('path');
  const sqlite3 = require('sqlite3').verbose();

  const dbPath = path.join(__dirname, 'postal.db');

  const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
      console.error('[db] Failed to open database:', err.message);
    }
  });

  db.serialize(() => {
    db.run('PRAGMA foreign_keys = ON');

    // Minimal schema to keep the app usable even on a fresh DB file.
    db.exec(`
      CREATE TABLE IF NOT EXISTS Customers (
        customer_id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_name TEXT NOT NULL,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        phone TEXT,
        address TEXT,
        role TEXT DEFAULT 'customer',
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS Parcels (
        parcel_id INTEGER PRIMARY KEY AUTOINCREMENT,
        tracking_number TEXT NOT NULL UNIQUE,
        sender_id INTEGER NOT NULL,
        receiver_name TEXT NOT NULL,
        receiver_phone TEXT,
        receiver_address TEXT,
        weight REAL DEFAULT 0,
        size TEXT,
        shipping_cost REAL DEFAULT 0,
        status TEXT DEFAULT 'Pending',
        created_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (sender_id) REFERENCES Customers(customer_id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS Payments (
        payment_id INTEGER PRIMARY KEY AUTOINCREMENT,
        amount REAL NOT NULL,
        payment_method TEXT,
        payment_status TEXT DEFAULT 'Pending',
        payment_date TEXT DEFAULT (datetime('now')),
        parcel_id INTEGER NOT NULL,
        FOREIGN KEY (parcel_id) REFERENCES Parcels(parcel_id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS Tracking (
        tracking_id INTEGER PRIMARY KEY AUTOINCREMENT,
        parcel_id INTEGER NOT NULL,
        update_time TEXT DEFAULT (datetime('now')),
        location TEXT,
        description TEXT,
        FOREIGN KEY (parcel_id) REFERENCES Parcels(parcel_id) ON DELETE CASCADE
      );
    `);
  });

  globalThis.__postalDb = db;
  module.exports = db;
}
