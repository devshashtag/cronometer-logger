import { getDate, getTimestamp, msToTime } from '/assets/js/modules/date.js';

class Storage {
  constructor(configName = 'config') {
    this.configName = configName;
    this.loadConfig();
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

  saveConfig() {
    localStorage.setItem('cronometer-logger', JSON.stringify(this.config));
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
