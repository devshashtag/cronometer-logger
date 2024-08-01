import { getDate, getTimestamp, msToTime } from '/cronometer-plus/assets/js/modules/date.js';

class Storage {
  constructor() {
    // load config
    this.config = this.loadConfig();
  }

  loadConfig() {
    // default config
    let config = {
      running: false,
      current: {},
      records: {},
    };

    // local config
    const localConfig = localStorage.getItem('cronometer-plus');
    if (localConfig && !JSON.parse(localConfig).history) {
      config = JSON.parse(localConfig);
    }

    return config;
  }

  saveConfig() {
    localStorage.setItem('cronometer-plus', JSON.stringify(this.config));
  }

  // running
  isRunning() {
    return this.config.running;
  }

  // set current record
  setCurrentRecord(start, date = getDate()) {
    const current = { start, date };

    this.config.current = current;
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

    return record;
  }

  // records
  getRecords() {
    return this.config.records ?? {};
  }

  // records by date
  getRecordsByDate(date = getDate()) {
    return this.config.records[date] ?? [];
  }

  // number of records
  getNumberOfRecords(date = getDate()) {
    return this.getRecordsByDate(date).length;
  }

  // sum of durations
  getDurations(date = getDate()) {
    let durations = 0;

    for (const duration of this.getRecordsByDate(date).map((record) => record.duration)) {
      durations += duration;
    }

    return durations;
  }

  // get current Time
  getCurrentTime(date = getDate()) {
    return msToTime(getTimestamp() - this.config.current.start + this.getDurations(date));
  }
}

export default Storage;
