import { getDate, getTime, timeToSeconds, secondsToTime } from '/assets/js/modules/functions.js';
import { storage } from '/assets/js/script.js';

class Interface {
  constructor() {
    this.cronometerElm = document.getElementById('cronometer');
    this.dateElm = document.getElementById('date');
    this.playBtn = document.getElementById('play');
    this.stopBtn = document.getElementById('stop');
    this.historyElm = document.querySelector('.cronometer__history');

    // load ui
    this.loadCronometer();

    // play event
    this.playBtn.addEventListener('click', this.play);
  }

  loadCronometer() {
    this.setDate(this.dateElm, storage.getDate());
    this.setTime(this.cronometerElm, secondsToTime(storage.getDurations()));

    for (const date in storage.getHistory()) {
      // event: history toggle item
      this.historyListElm = this.getHistoryList(date);
      this.historyListElm.parentNode.parentNode.addEventListener('click', this.toggleHistoryItems);

      for (const record of storage.getRecords(date)) {
        const item = this.getHistoryListItem(record.start, record.end);
        this.historyListElm.insertAdjacentHTML('afterbegin', item);
      }

      // set total durations and records
      this.setHistoryTitle(date);
    }

    this.historyListElm = this.getHistoryList(storage.getDate());

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

  toggleHistoryItems = (e) => {
    if (e.target.classList.contains('history__item')) {
      e.target.querySelector('.history__list').classList.toggle('active');
    }
  };

  play = () => {
    if (!storage.isRunning()) {
      storage.toggleRunning();

      const time = getTime();
      storage.setStartTime(time);

      this.interval = setInterval(() => {
        this.setTime(this.cronometerElm, storage.getCurrentTime());
      }, 100);
    } else {
      // stop cronometer
      storage.toggleRunning();
      clearInterval(this.interval);

      // add record
      this.addRecord();
    }

    // toggle play/pause
    this.playBtn.classList.toggle('fa-play');
    this.playBtn.classList.toggle('fa-pause');
    // toggle color of cronometer
    this.cronometerElm.classList.toggle('fa-play');
    this.cronometerElm.classList.toggle('fa-pause');
  };

  addRecord() {
    // add record
    const historyListItem = this.getHistoryListItem(storage.getStartTime(), storage.getEndTime(), true);
    this.historyListElm.insertAdjacentHTML('afterbegin', historyListItem);

    // set total durations and records
    this.setHistoryTitle();
  }

  setHistoryTitle(date) {
    // set total durations and records
    const [dh, dm, ds] = secondsToTime(storage.getDurations(date)).split(':');
    const records = storage.getNumberOfRecords(date);

    // total durations
    this.historyListElm.parentNode.dataset.hour = dh;
    this.historyListElm.parentNode.dataset.minute = dm;
    this.historyListElm.parentNode.dataset.seconds = ds;

    // number of records
    this.historyListElm.parentNode.dataset.records = records;
  }

  setTime(elm, time) {
    const [hour, minute, seconds] = time.split(':');
    elm.dataset.hour = hour;
    elm.dataset.minute = minute;
    elm.dataset.seconds = seconds;
  }

  setDate(elm, date) {
    const [year, month, day] = date.split('/');
    elm.dataset.year = year;
    elm.dataset.month = month;
    elm.dataset.day = day;
  }

  getHistoryList(date) {
    const [year, month, day] = date.split('/');
    let historyList = document.querySelector(`.history[data-year="${year}"][data-month="${month}"][data-day="${day}"] .history__list`);

    if (!historyList) {
      this.historyElm.insertAdjacentHTML(
        'afterbegin',
        `<!-- item -->
        <div class="history history__item"
        data-year="${year}" data-month="${month}" data-day="${day}"
        data-hour="00" data-minute="00" data-seconds="00"
        data-records="0">
          <!-- list -->
          <div class="history__list"></div>
        </div>`
      );

      historyList = document.querySelector(`.history[data-year="${year}"][data-month="${month}"][data-day="${day}"] .history__list`);
    }

    return historyList;
  }

  getHistoryListItem(start, end, saveItem = false) {
    const [sh, sm, ss] = secondsToTime(start).split(':');
    const [eh, em, es] = secondsToTime(end).split(':');
    const [dh, dm, ds] = secondsToTime(end - start).split(':');

    const historyItem = `
    <!-- item -->
    <div class="list__item">
      <span class="time start" data-hour="${sh}" data-minute="${sm}" data-seconds="${ss}"></span>
      <span class="time end" data-hour="${eh}" data-minute="${em}" data-seconds="${es}"></span>
      <span class="time duration" data-hour="${dh}" data-minute="${dm}" data-seconds="${ds}"></span>
    </div>`;

    // add record
    if (saveItem) storage.addRecord(start, end);

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
