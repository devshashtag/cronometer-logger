import { getDate, getTimestamp, msToTime } from '/assets/js/modules/date.js';

class Storage {
  constructor(configName = 'config') {
    this.configName = configName;
    this.updateOldConfig();
    this.loadConfig();
    this.currentDate = getDate();
  }

  loadConfig() {
    this.config = {
      running: false,
      current: {},
      records: {},
      version: '0.1',
    };

    // load config if exist
    const config = localStorage.getItem(this.configName);

    if (config && JSON.parse(config).version == this.config.version) {
      this.config = JSON.parse(config);
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
    const record = { start, end, duration };

    this.config.current = {};
    this.config.records[date] ??= [];
    this.config.records[date].push(record);
    this.config.running = false;
    this.saveConfig();

    const index = this.config.records[date].length;

    return [index, record];
  }

  // records
  getRecords() {
    return this.config.records ?? {};
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

  removeRecord() {}
}

export default Storage;
