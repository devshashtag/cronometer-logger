import { getDate, getTimestamp, msToTime, timestampToTime } from '/assets/js/modules/date.js';

class Storage {
  constructor(configName = 'config') {
    this.configName = configName;
    this.currentDate = getDate();
    this.updateOldConfig();
    this.loadConfig();
  }

  loadConfig() {
    this.config = {
      running: false,
      current: {},
      records: {},
      version: '0.1',
    };

    // load local config if exist
    const localConfig = localStorage.getItem(this.configName);

    if (localConfig) {
      this.config = JSON.parse(localConfig);
    }

    this.saveConfig();
  }

  updateOldConfig(oldConfigName = 'config') {
    if (oldConfigName === this.configName) return;

    // migrate to new config
    const oldConfig = localStorage.getItem(oldConfigName);
    const newConfig = localStorage.getItem(this.configName);

    if (oldConfig && !newConfig) {
      localStorage.setItem(this.configName, oldConfig);
    }
  }

  saveConfig() {
    localStorage.setItem(this.configName, JSON.stringify(this.config));
  }

  // running
  isRunning() {
    return this.config.running;
  }

  // set current record
  setCurrentRecord(start, date = this.currentDate) {
    this.config.current = { start, date };
    this.config.running = true;
    this.saveConfig();
  }

  // save current record
  saveCurrentRecord(end) {
    const { start, date } = this.config.current;
    const duration = end - start;
    const record = { duration, start, end };

    this.config.current = {};
    this.config.records[date] ??= [];
    this.config.records[date].push(record);
    this.config.running = false;
    this.saveConfig();

    return record;
  }

  // records
  getRecords() {
    return this.config.records ?? {};
  }

  removeRecord(date, { duration, start, end }) {
    if (!this.config.records[date]) {
      console.warn(`No records found for date: ${date}`);
      return false;
    }

    const recordIndex = this.config.records[date].findIndex((record) => {
      return (
        msToTime(record.duration) === duration &&
        timestampToTime(record.start) === start &&
        timestampToTime(record.end) === end
      );
    });

    if (recordIndex !== -1) {
      this.config.records[date].splice(recordIndex, 1);

      if (this.config.records[date].length === 0) {
        delete this.config.records[date];
      }

      this.saveConfig();
      return true;
    }

    console.warn('No matching record found to remove');
    return false;
  }

  // records by date
  getRecordsByDate(date = this.currentDate) {
    return this.config.records[date] ?? [];
  }

  // number of records
  getNumberOfRecords(date = this.currentDate) {
    return this.getRecordsByDate(date).length;
  }

  // sum of durations
  getDurations(date = this.currentDate) {
    let durations = 0;

    for (const duration of this.getRecordsByDate(date).map((record) => record.duration)) {
      durations += duration;
    }

    return durations;
  }

  getTotalDuration() {
    const records = Object.values(this.getRecords()).flat();
    const durations = records.map((record) => record.duration);
    const total = durations.reduce((a, b) => a + b, 0);

    // current record
    let current = this.config?.current?.start ?? 0;

    if (current !== 0) {
      current = getTimestamp() - current;
    }

    return msToTime(total + current);
  }

  getCurrentDuration() {
    const current = this.config?.current?.start ?? 0;

    if (current === 0) {
      return msToTime(0);
    } else {
      return msToTime(getTimestamp() - current);
    }
  }

  getTodayDuration(date = this.currentDate) {
    const current = this.config?.current?.start ?? 0;
    const today = this.getDurations(date);

    if (current === 0) {
      return msToTime(today);
    } else {
      return msToTime(getTimestamp() - current + today);
    }
  }

  downloadConfig(filename = 'cronometer.json') {
    const data = JSON.stringify(this.config, null, 2);
    const blob = new Blob([data], { type: 'application/json' });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;

    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }

  async uploadConfig() {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';

      input.onchange = (e) => {
        const file = e.target.files[0];
        if (!file) {
          reject(new Error('No file selected'));
          return;
        }

        const reader = new FileReader();

        reader.onload = (event) => {
          try {
            const config = JSON.parse(event.target.result);

            // Basic validation
            if (!config || typeof config !== 'object') {
              throw new Error('Invalid config file');
            }

            // Merge with existing config (preserve current records)
            this.config = config;

            this.saveConfig();
            resolve(true);
          } catch (error) {
            reject(error);
          }
        };

        reader.onerror = () => {
          reject(new Error('Error reading file'));
        };

        reader.readAsText(file);
      };

      input.click();
    });
  }
}

export default Storage;
