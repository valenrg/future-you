const DB_NAME = 'future-you-db';
const DB_VERSION = 1;

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains('kv')) db.createObjectStore('kv');
      if (!db.objectStoreNames.contains('workouts')) db.createObjectStore('workouts', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('daily')) db.createObjectStore('daily', { keyPath: 'date' });
      if (!db.objectStoreNames.contains('checkins')) db.createObjectStore('checkins', { keyPath: 'id' });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function transact(store, mode, fn) {
  return openDB().then(db => new Promise((resolve, reject) => {
    const tx = db.transaction(store, mode);
    const os = tx.objectStore(store);
    const request = fn(os);
    tx.oncomplete = () => resolve(request?.result);
    tx.onerror = () => reject(tx.error);
  }));
}

export const db = {
  async get(key) {
    return transact('kv', 'readonly', os => os.get(key));
  },
  async set(key, value) {
    return transact('kv', 'readwrite', os => os.put(value, key));
  },
  async addWorkout(workout) {
    return transact('workouts', 'readwrite', os => os.put(workout));
  },
  async getWorkouts() {
    return transact('workouts', 'readonly', os => os.getAll()).then(x => x || []);
  },
  async setDaily(entry) {
    return transact('daily', 'readwrite', os => os.put(entry));
  },
  async getDaily(date) {
    return transact('daily', 'readonly', os => os.get(date));
  },
  async getAllDaily() {
    return transact('daily', 'readonly', os => os.getAll()).then(x => x || []);
  },
  async addCheckin(entry) {
    return transact('checkins', 'readwrite', os => os.put(entry));
  },
  async getCheckins() {
    return transact('checkins', 'readonly', os => os.getAll()).then(x => x || []);
  },
  async clearAll() {
    const dbi = await openDB();
    const stores = ['kv', 'workouts', 'daily', 'checkins'];
    await Promise.all(stores.map(store => new Promise((resolve, reject) => {
      const tx = dbi.transaction(store, 'readwrite');
      tx.objectStore(store).clear();
      tx.oncomplete = resolve;
      tx.onerror = () => reject(tx.error);
    })));
  }
};
