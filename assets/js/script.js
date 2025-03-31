import Storage from '/assets/js/modules/storage.js';
import Interface from '/assets/js/modules/interface.js';

export const storage = new Storage('cronometer');
const ui = new Interface();

ui.init();
