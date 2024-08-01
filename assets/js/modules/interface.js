import { getDate, getTimestamp, timestampToTime, msToTime } from '/assets/js/modules/date.js';
import { storage } from '/assets/js/script.js';

class Interface {
  constructor() {
    this.cronometerElm = document.getElementById('cronometer');
    this.dateElm = document.getElementById('date');
    this.playBtn = document.getElementById('play');
    this.stopBtn = document.getElementById('stop');
    this.historyElm = document.querySelector('.cronometer__history');

    // play event
    this.playBtn.addEventListener('click', this.play);

    // load ui
    this.loadCronometer();
  }

  loadCronometer() {
    this.setDate(this.dateElm, getDate());
    this.setTime(this.cronometerElm, msToTime(storage.getDurations()));

    for (const [date, records] of Object.entries(storage.getRecords())) {
      // event: history toggle item
      this.historyListElm = this.getHistoryList(date);

      for (const record of records) {
        const item = this.getHistoryListItem(record);
        this.historyListElm.children[0].insertAdjacentHTML('afterend', item);
      }

      // set total durations and records
      this.setHistoryTitle(date);
    }

    this.historyListElm = this.getHistoryList(getDate());

    this.historyListElm.parentNode.parentNode.addEventListener('click', (e) => {
      const parent = e.target.closest('.history__item');
      if (parent) {
        parent.querySelector('.history__list').classList.toggle('active');
      }
    });

    // start cronometer if running
    if (storage.isRunning()) {
      this.interval = setInterval(() => {
        this.setTime(this.cronometerElm, storage.getCurrentTime());
      }, 100);

      // toggle to running
      this.playBtn.classList.add('fa-pause');
      this.cronometerElm.classList.add('fa-play');
      this.playBtn.classList.remove('fa-play');
      this.cronometerElm.classList.remove('fa-pause');
    }
  }

  play = () => {
    if (!storage.isRunning()) {
      storage.setCurrentRecord(getTimestamp());

      this.interval = setInterval(() => {
        this.setTime(this.cronometerElm, storage.getCurrentTime());
      }, 100);
    } else {
      // stop cronometer
      clearInterval(this.interval);

      // add record
      const record = storage.saveCurrentRecord(getTimestamp());
      const item = this.getHistoryListItem(record);
      this.historyListElm.children[0].insertAdjacentHTML('afterend', item);

      // set total durations and records
      this.setHistoryTitle();
    }

    // toggle play/pause
    this.playBtn.classList.toggle('fa-play');
    this.playBtn.classList.toggle('fa-pause');
    // toggle color of cronometer
    this.cronometerElm.classList.toggle('fa-play');
    this.cronometerElm.classList.toggle('fa-pause');
  };

  setHistoryTitle(date) {
    // set total durations and records
    const [dh, dm, ds, dms] = msToTime(storage.getDurations(date)).split(':');
    const records = storage.getNumberOfRecords(date);

    const title = this.historyListElm.parentNode.querySelector('.item__title');
    const time = title.querySelector('.time');
    const record = title.querySelector('.records');

    // total durations
    time.dataset.hour = dh;
    time.dataset.minute = dm;
    time.dataset.seconds = ds;
    time.dataset.milliseconds = dms;

    // number of records
    record.dataset.records = records;
  }

  setTime(elm, time) {
    const [hour, minute, seconds, milliseconds] = time.split(':');
    elm.dataset.hour = hour;
    elm.dataset.minute = minute;
    elm.dataset.seconds = seconds;
    elm.dataset.milliseconds = milliseconds;
  }

  setDate(elm, date) {
    const [year, month, day] = date.split('/');
    elm.dataset.year = year;
    elm.dataset.month = month;
    elm.dataset.day = day;
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

  getHistoryListItem(record) {
    const [sh, sm, ss, sms] = timestampToTime(record.start).split(':');
    const [eh, em, es, ems] = timestampToTime(record.end).split(':');
    const [dh, dm, ds, dms] = msToTime(record.duration).split(':');

    const historyItem = `
    <!-- item -->
    <div class="list__item">
      <span class="time start" data-hour="${sh}" data-minute="${sm}" data-seconds="${ss}" data-milliseconds="${sms}"></span>
      <span class="time duration" data-hour="${dh}" data-minute="${dm}" data-seconds="${ds}" data-milliseconds="${dms}"></span>
      <span class="time end" data-hour="${eh}" data-minute="${em}" data-seconds="${es}" data-milliseconds="${ems}"></span>
    </div>`;

    return historyItem;
  }

  // // group list
  // updateGroupsList() {
  //   this.groupsList.replaceChildren(...this.getGroupElements());
  // }

  // // items list
  // updateItemsList() {
  //   this.itemsList.replaceChildren(...this.getItemElements());
  //   this.itemText.innerText = '';
  //   this.itemText.focus();
  // }

  // // types list
  // updateTypesList() {
  //   this.itemTypeList.replaceChildren(...this.getTypeElements());
  // }

  // // group input
  // hideGroupName() {
  //   // change btn to close
  //   this.groupBtn.classList.remove('button-active');

  //   // hide group name
  //   this.groupName.classList.remove('input-show');
  //   this.groupName.innerText = '';
  //   this.itemText.focus();
  // }

  // showGroupName() {
  //   // change btn to open
  //   this.groupBtn.classList.add('button-active');

  //   // show group name
  //   this.groupName.classList.add('input-show');
  //   setTimeout(() => this.groupName.focus(), 50);
  // }

  // // active group
  // changeActiveGroup = (e) => {
  //   const target = e.target;

  //   if (target.classList.contains('list__group')) {
  //     // remove old active-group
  //     document.getElementById('group-active')?.removeAttribute('id');

  //     // active clicked group
  //     target.id = 'group-active';

  //     // save active group
  //     storage.setActiveGroup(target.dataset.id);

  //     // reload items from new active group
  //     this.updateGroupsList();
  //     this.updateItemsList();
  //   }
  // };

  // // item type
  // toggleTypeList = () => {
  //   this.itemTypeList.classList.toggle('list__show');
  // };

  // changeItemType = (e) => {
  //   const target = e.target.tagName.toLowerCase() === 'li' ? e.target : e.target.parentNode;

  //   if (target.classList.contains('list__item')) {
  //     const classList = Array.from(target.classList);
  //     // remove list__item
  //     classList.shift();

  //     // change theme to item type
  //     this.itemType.className = '';
  //     this.itemType.classList.add(...classList);
  //     this.itemType.innerText = target.innerText.trim();

  //     this.itemText.className = 'input-default';
  //     this.itemText.classList.add(...classList);

  //     this.itemBtn.className = 'button-default';
  //     this.itemBtn.classList.add(...classList);

  //     // hide list for a short time
  //     this.itemTypeList.classList.remove('list__show');

  //     // set selected type
  //     storage.setSelectedType(target.dataset.id);

  //     // update types list
  //     this.updateTypesList();

  //     // focus on item text
  //     this.itemText.focus();
  //   }
  // };

  // // new group
  // newGroup = (event) => {
  //   let target = event.target;
  //   if (target.tagName.toLowerCase() === 'span') target = target.parentNode;

  //   // runs when close btn clicked
  //   if (target.classList.contains('button-active')) {
  //     this.hideGroupName();
  //     return;
  //   }

  //   // get userinput
  //   this.showGroupName();

  //   this.groupName.addEventListener('keydown', (e) => {
  //     const name = this.groupName.innerText.trim();

  //     // if pressed key is 'Enter' and groupName is not empty
  //     if (e.key === 'Enter' && name !== '') {
  //       // prevent key
  //       e.preventDefault();

  //       // hide input
  //       this.hideGroupName();

  //       // add new group
  //       const group = {
  //         id: storage.getGroupId(),
  //         name: name,
  //         active: true,
  //       };

  //       storage.newGroup(group);

  //       // reload groups and it's items after adding new group
  //       this.updateGroupsList();
  //       this.updateItemsList();
  //     } else if (e.key === 'Enter') e.preventDefault();
  //   });
  // };

  // // new item
  // newItem = () => {
  //   const date = getDate();
  //   const groupId = storage.getActiveGroupId();
  //   const text = this.itemText.innerText.trim();
  //   const type = this.itemType.className.match(/type__(\w+)/)[1];
  //   let status = this.itemType.className.match(/status--(\w+)/);
  //   status = status ? status[1] : '';

  //   // focus text input
  //   this.itemText.focus();

  //   // if input or group-id is empty dont add new item
  //   if (!text || !groupId) return;

  //   // new item
  //   const item = {
  //     id: storage.getItemId(),
  //     type: type,
  //     text: text,
  //     status: status,
  //     created: date,
  //   };

  //   // save item
  //   storage.newItem(item);

  //   // add item to items list
  //   const element = this.getItemElement(item);
  //   this.itemsList.appendChild(element);

  //   // scroll to new item
  //   element.scrollIntoView({ behavior: 'smooth', block: 'end', inline: 'nearest' });

  //   // clear text input
  //   this.itemText.innerText = '';
  // };

  // // templates
  // getGroupElement(group) {
  //   const element = document.createElement('li');
  //   element.classList.add('list__group');
  //   element.dataset.id = group.id;
  //   element.innerText = group.name;
  //   if (group.active) element.id = 'group-active';

  //   return element;
  // }

  // getItemElement(item) {
  //   const element = document.createElement('li');
  //   const symbol = document.createElement('span');
  //   const text = document.createElement('span');
  //   const time = document.createElement('span');
  //   const date = document.createElement('span');

  //   // classes
  //   // item
  //   element.classList.add('list__item');
  //   element.classList.add(`type__${item.type}`);
  //   if (item.status) element.classList.add(`status--${item.status}`);

  //   // infos
  //   symbol.classList.add('item__symbol');
  //   text.classList.add('item__text');
  //   time.classList.add('item__time');
  //   date.classList.add('item__date');

  //   // add to dom
  //   element.append(symbol, text, time, date);

  //   // item infos
  //   element.dataset.id = item.id;
  //   symbol.innerText = storage.config.types[item.status || item.type]?.symbol ?? '?';
  //   symbol.title = (item.type + ' ' + item.status).trim();
  //   text.innerText = item.text;
  //   time.innerText = item.created.time;
  //   date.innerText = item.created.date;

  //   return element;
  // }

  // getTypeElement = (item) => {
  //   const element = document.createElement('li');
  //   const type = item.type;
  //   const status = item.status;

  //   const text = status ? type + ' ' + status : type;

  //   // classes
  //   element.classList.add('list__item');
  //   element.classList.add(`type__${type}`);
  //   if (status) element.classList.add(`status--${status}`);

  //   // data-id
  //   element.dataset.id = item.id;

  //   // selected
  //   if (item.selected) {
  //     element.classList.add('type--active');
  //     const classList = Array.from(element.classList);

  //     // remove list__item
  //     classList.shift();

  //     // change theme to item type
  //     this.itemType.className = '';
  //     this.itemType.classList.add(...classList);
  //     this.itemType.innerText = text.trim();

  //     this.itemText.className = 'input-default';
  //     this.itemText.classList.add(...classList);

  //     this.itemBtn.className = 'button-default';
  //     this.itemBtn.classList.add(...classList);
  //   }

  //   // text
  //   element.innerText = text.trim();

  //   return element;
  // };

  // getGroupElements() {
  //   const groups = storage.getGroups();
  //   return groups.map(this.getGroupElement);
  // }

  // getItemElements() {
  //   const items = storage.getGroupItems();
  //   return items.map(this.getItemElement);
  // }

  // getTypeElements() {
  //   const types = storage.getTypes();
  //   return types.map(this.getTypeElement);
  // }
}

export default Interface;
