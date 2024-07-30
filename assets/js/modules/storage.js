import { getDate, getTime, timeToSeconds, secondsToTime } from '/cronometer-plus/assets/js/modules/functions.js';

class Storage {
  constructor() {
    // load config
    const config = {
      running: false,
      startTime: 0,
      date: getDate(),
      history: {},
    };

    const data = localStorage.getItem('cronometer-plus');
    this.config = data ? JSON.parse(data) : config;

    // set current day
    const date = getDate();

    if (this.config.date != date || !this.config.history[this.getDate()]) {
      this.config.date = date;
      this.config.history[date] ??= [];
    }
  }

  saveConfig() {
    localStorage.setItem('cronometer-plus', JSON.stringify(this.config));
  }

  // running
  isRunning() {
    return this.config.running;
  }

  toggleRunning() {
    this.config.running = !this.config.running;
    this.saveConfig();
  }

  // get date
  getDate() {
    return this.config.date;
  }

  // history
  getHistory() {
    return this.config.history;
  }

  // add record
  addRecord(start, end, date = this.getDate()) {
    const duration = end - start;
    const record = { start, end, duration };

    this.getRecords().push(record);
    this.saveConfig();
  }

  // records
  getRecords(date = this.getDate()) {
    return this.config.history[date];
  }

  // number of records
  getNumberOfRecords(date) {
    return this.getRecords(date).length;
  }

  // sum of durations
  getDurations(date) {
    let durations = 0;

    for (const duration of this.getRecords(date).map((record) => record.duration)) {
      durations += duration;
    }

    return durations;
  }

  // start time
  setStartTime(time) {
    this.config.startTime = timeToSeconds(time);
    this.saveConfig();
  }

  getStartTime(seconds = true) {
    if (!seconds) return secondsToTime(this.config.startTime);

    return this.config.startTime;
  }

  // end time
  getEndTime(seconds = true) {
    if (!seconds) return getTime();

    return timeToSeconds(getTime());
  }

  getCurrentTime() {
    return secondsToTime(this.getEndTime() - this.getStartTime() + this.getDurations());
  }
}

export default Storage;
