import { getTimestamp, timestampToTime, msToTime, getTime } from '/cronometer-logger/assets/js/modules/date.js';
import { storage } from '/cronometer-logger/assets/js/script.js';

class Interface {
  constructor() {
    this.date = document.getElementById('date');
    this.time = document.getElementById('time');
    this.total = document.getElementById('total');
    this.today = document.getElementById('today');
    this.current = document.getElementById('current');

    this.history = document.getElementById('history');
  }

  // set date and time
  setDate(elm, date) {
    const [year, month, day] = date.split('/');
    elm.dataset.year = year;
    elm.dataset.month = month;
    elm.dataset.day = day;
  }

  setTime(elm, time) {
    const [hour, minute, seconds] = time.split(':');
    elm.dataset.hour = hour;
    elm.dataset.minute = minute;
    elm.dataset.seconds = seconds;
  }

  // update date and time
  updateDateTime(interval = 500) {
    // initialize update
    this.setDate(this.date, storage.currentDate);
    this.setTime(this.time, getTime());

    // interval update
    setInterval(() => {
      this.setDate(this.date, storage.currentDate);
      this.setTime(this.time, getTime());
    }, interval);
  }

  updateDurations() {
    this.setTime(this.current, storage.getCurrentDuration());
    this.setTime(this.today, storage.getTodayDuration());
    this.setTime(this.total, storage.getTotalDuration());
  }

  generateHistoryRecords() {
    let historyRecords = '';

    const storageRecords = storage.getRecords();
    const sortedRecords = Object.entries(storageRecords).sort(([currentDate], [nextDate]) => {
      const currentNum = parseInt(currentDate.replace(/\//g, ''));
      const nextNum = parseInt(nextDate.replace(/\//g, ''));
      return nextNum - currentNum;
    });

    for (const [date, records] of sortedRecords) {
      const recordItems = records
        .sort((currentRecord, nextRecord) => nextRecord.start - currentRecord.start)
        .map(({ duration, start, end }) => {
          return this.getRecordItem(duration, start, end);
        })
        .join('\n');

      const historyRecord = this.getHistoryRecord(date, recordItems);
      historyRecords += historyRecord;
    }

    // add today history record if not exist
    if (!storageRecords[storage.currentDate]) {
      historyRecords = this.getHistoryRecord(storage.currentDate) + historyRecords;
    }

    this.history.insertAdjacentHTML('afterbegin', historyRecords);
    this.record = this.history.querySelector('.history__record:nth-child(1)');
    this.recordItems = this.record.querySelector('.record__items');
    this.recordBtn = this.record.querySelector('.record__button');
  }

  setHistoryEvents() {
    // record button
    this.recordBtn.addEventListener('click', () => {
      this.play();
    });

    // toggle history-records button
    this.history.addEventListener('click', (e) => {
      const target = e.target;
      const recordHistory = target.closest('.record__history');
      const removeButton = target.closest('.option__remove');

      if (recordHistory) {
        const historyRecord = recordHistory.closest('.history__record');
        const recordItems = historyRecord.querySelector('.record__items');

        recordItems.classList.toggle('show');
      } else if (removeButton) {
        const historyRecord = removeButton.closest('.history__record');
        const recordItem = removeButton.closest('.record__item');
        const recordItems = removeButton.closest('.record__items');
        // dataset
        const dateData = historyRecord.querySelector('.record__date').dataset;
        const durationData = recordItem.querySelector('.duration').dataset;
        const startData = recordItem.querySelector('.start').dataset;
        const endData = recordItem.querySelector('.end').dataset;

        // record values
        const date = Object.values(dateData).join('/');
        const duration = Object.values(durationData).join(':');
        const start = Object.values(startData).join(':');
        const end = Object.values(endData).join(':');
        const isRemoved = storage.removeRecord(date, { duration, start, end });
        if (isRemoved) recordItems.removeChild(recordItem);
        this.updateDurations();
      }
    });
  }

  updateOnRunning() {
    if (storage.isRunning()) {
      this.interval = setInterval(() => {
        this.updateDurations();
      }, 100);

      // toggle to stop
      this.recordBtn.classList.toggle('play');
      this.recordBtn.classList.toggle('stop');
    }
  }

  removeRecord() {}

  // initialize ui
  init() {
    this.generateHistoryRecords();
    this.setHistoryEvents();
    this.updateDateTime();
    this.updateDurations();
    this.updateOnRunning();
  }

  play() {
    if (!storage.isRunning()) {
      storage.setCurrentRecord(getTimestamp());

      this.interval = setInterval(() => {
        this.updateDurations();
      }, 100);
    } else {
      // stop cronometer
      clearInterval(this.interval);

      // add record
      const { duration, start, end } = storage.saveCurrentRecord(getTimestamp());
      const item = this.getRecordItem(duration, start, end);
      this.recordItems.insertAdjacentHTML('afterbegin', item);
    }

    // toggle play/stop
    this.recordBtn.classList.toggle('play');
    this.recordBtn.classList.toggle('stop');
  }

  getHistoryRecord(date, recordItems = '') {
    const [year, month, day] = date.split('/');

    const historyRecord = `
      <!-- record -->
      <li class="history__record">
        <!-- header -->
        <div class="record__header">
          <!-- record button -->
          <svg class="record__button play">
            <title>start recording</title>
            <use href="/cronometer-logger/assets/icons/play.svg#play"></use>
            <use href="/cronometer-logger/assets/icons/stop.svg#stop"></use>
          </svg>
          <!-- indicator -->
          <ul class="record__indicator">
          </ul>
          <!-- date -->
          <div class="record__date" data-year="${year}" data-month="${month}" data-day="${day}"></div>
          <!-- show history -->
          <svg class="record__history">
            <title>show history</title>
            <use href="assets/icons/history.svg#history"></use>
          </svg>
        </div>
        <!-- items -->
        <ul class="record__items">
          ${recordItems}
        </ul>
      </li>
    `;

    return historyRecord;
  }

  getRecordItem(duration, start, end) {
    const [durationHour, durationMinute, durationSeconds] = msToTime(duration).split(':');
    const [startHour, startMinute, startSeconds] = timestampToTime(start).split(':');
    const [endHour, endMinute, endSeconds] = timestampToTime(end).split(':');

    const recordItem = `
      <!-- record -->
      <li class="record__item">
        <span class="record__time duration" title="duration" data-hour="${durationHour}" data-minute="${durationMinute}" data-seconds="${durationSeconds}"></span>
        <span class="record__time start" title="start" data-hour="${startHour}" data-minute="${startMinute}" data-seconds="${startSeconds}"></span>
        <span class="record__time end" title="end" data-hour="${endHour}" data-minute="${endMinute}" data-seconds="${endSeconds}"></span>

        <span class="record__options">
          <!-- remove -->
          <svg class="option__remove">
            <title>remove record</title>
            <use href="assets/icons/remove.svg#remove"></use>
          </svg>
        </span>
      </li>
    `;

    return recordItem;
  }
}

export default Interface;
