import { getDate } from '/assets/js/modules/functions.js';

class Storage {
  constructor() {
    const config = {
      groups: [],
      items: {},
      types: {
        task: { id: 1, symbol: '-', type: 'task', selected: true },
        done: { id: 2, symbol: '+', type: 'task', status: 'done' },
        failed: { id: 3, symbol: 'x', type: 'task', status: 'failed' },
        note: { id: 4, symbol: '!', type: 'note' },
        goal: { id: 5, symbol: '#', type: 'goal' },
        habit: { id: 6, symbol: '*', type: 'habit' },
        routine: { id: 7, symbol: '=', type: 'routine' },
      },
      counters: {
        groups: 1,
        items: 1,
        types: 7,
      },
    };

    const data = localStorage.getItem('config');
    this.config = data ? JSON.parse(data) : config;
  }

  saveConfig() {
    localStorage.setItem('config', JSON.stringify(this.config));
  }

  getGroupId() {
    return this.config.counters.groups++;
  }

  getItemId() {
    return this.config.counters.items++;
  }

  getGroups() {
    return this.config.groups;
  }

  getGroupItems() {
    return this.config.items[this.getActiveGroupId()] || [];
  }

  getTypes() {
    return Object.values(this.config.types);
  }

  setGroupItems(items) {
    this.config.items[this.getActiveGroupId()] = items;
  }

  getActiveGroupId() {
    for (const group of this.config.groups) {
      if (group.active) return group.id;
    }
  }

  setActiveGroup(id) {
    for (const group of this.config.groups) {
      if (group.active) delete group.active;
      if (group.id === +id) group.active = true;
    }

    this.saveConfig();
  }

  setSelectedType(id) {
    for (const key in this.config.types) {
      const type = this.config.types[key];

      if (type.selected) delete this.config.types[key].selected;
      if (type.id === +id) this.config.types[key].selected = true;
    }

    this.saveConfig();
  }

  newGroup(group) {
    if (group.active) {
      // remove active group
      for (const group of this.config.groups) {
        if (group.active) delete group.active;
      }
    }

    // add new group
    this.config.groups.push(group);
    this.saveConfig();
  }

  newItem(item) {
    let groupItems = this.getGroupItems();
    groupItems.push(item);

    this.setGroupItems(groupItems);
    this.saveConfig();
  }
}

export default Storage;
