import { getTimestamp, timestampToTime, msToTime, getDate, getTime } from '/assets/js/modules/date.js';
import { storage } from '/assets/js/script.js';

class Interface {
  constructor() {
    this.date = document.getElementById('date');
    this.time = document.getElementById('time');
    this.total = document.getElementById('total');
    this.today = document.getElementById('today');
    this.current = document.getElementById('current');

    this.history = document.getElementById('history');
    this.record = this.history.querySelector('.history__record:nth-child(1)');
    this.recordBtn = this.record.querySelector('.record__button');
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

  updateOnRunning() {
    if (storage.isRunning()) {
      this.interval = setInterval(() => {
        this.updateDurations();
      }, 100);

      // toggle to pause
      this.recordBtn.classList.toggle('play');
      this.recordBtn.classList.toggle('pause');
    }
  }

  totalDuration() {
    // recordItems
    // for (const [date, records] of Object.entries(storage.getRecords())) {
    //   // event: history toggle item
    //   this.historyListElm = this.getHistoryList(date);
    //   for (const [index, record] of Object.entries(records)) {
    //     const item = this.getHistoryListItem(index, record);
    //     this.historyListElm.children[0].insertAdjacentHTML('afterend', item);
    //   }
    //   // set total durations and records
    //   this.setHistoryTitle(date);
    // }
    //
    // this.historyListElm = this.getHistoryList(getDate());
    //
    // this.historyListElm.parentNode.parentNode.addEventListener('click', (e) => {
    //   const parent = e.target.closest('.history__item');
    //   if (parent) {
    //     parent.querySelector('.history__list').classList.toggle('active');
    //   }
    // });
    //
  }

  // initialize ui
  init() {
    this.updateDateTime();
    this.updateDurations();
    this.updateOnRunning();

    this.recordBtn.addEventListener('click', () => {
      this.play();
    });
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
      const [index, record] = storage.saveCurrentRecord(getTimestamp());
      // const item = this.getHistoryListItem(index, record);
      // this.historyListElm.children[0].insertAdjacentHTML('afterend', item);

      // set total durations and records
      // this.setHistoryTitle();
    }

    // toggle play/pause
    this.recordBtn.classList.toggle('play');
    this.recordBtn.classList.toggle('pause');
  }

  setHistoryTitle(date) {
    // set total durations and records

    // const records = storage.getNumberOfRecords(date);
    const title = this.historyListElm.parentNode.querySelector('.item__title');
    const time = title.querySelector('.time');
    const record = title.querySelector('.records');

    // total durations
    time.dataset.hour = dh;
    time.dataset.minute = dm;
    time.dataset.seconds = ds;

    // number of records
    record.dataset.records = records;
  }

  getHistoryList(date) {
    const [year, month, day] = date.split('/');
    let historyList = document.querySelector(`.item__title[data-date="${date}"] + .history__list`);

    if (!historyList) {
      this.historyElm.insertAdjacentHTML(
        'afterbegin',
        `<!-- item -->
        <div class="history__item">
          <!-- display -->
          <div class="item__title" data-date="${date}">
            <span class="date" data-year="${year}" data-month="${month}" data-day="${day}"></span>
            <span class="time" data-hour="00" data-minute="00" data-seconds="00" data-milliseconds="00"></span>
            <span class="records" data-records="0"></span>
          </div>


          <!-- list -->
          <div class="history__list">
            <!-- columns -->
            <div class="list__columns">
              <span>start</span>
              <span>duration</span>
              <span>end</span>
            </div>

          </div>
        </div>`
      );

      historyList = document.querySelector(`.item__title[data-date="${date}"] + .history__list`);
    }

    return historyList;
  }

  getHistoryListItem(index, record) {
    const [sh, sm, ss, sms] = timestampToTime(record.start).split(':');
    const [eh, em, es, ems] = timestampToTime(record.end).split(':');
    const [dh, dm, ds, dms] = msToTime(record.duration).split(':');

    const historyItem = `
    <!-- item -->
    <div class="list__item" data-index="${index}">
      <span class="time start" data-hour="${sh}" data-minute="${sm}" data-seconds="${ss}" data-milliseconds="${sms}"></span>
      <span class="time duration" data-hour="${dh}" data-minute="${dm}" data-seconds="${ds}" data-milliseconds="${dms}"></span>
      <span class="time end" data-hour="${eh}" data-minute="${em}" data-seconds="${es}" data-milliseconds="${ems}"></span>
      <svg class="item--remove"><use href="assets/icons/remove.svg#remove"></use>
    </div>`;

    return historyItem;
  }
}

export default Interface;
