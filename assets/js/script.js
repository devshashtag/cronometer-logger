import Storage from '/cronometer-logger/assets/js/modules/storage.js';
import Interface from '/cronometer-logger/assets/js/modules/interface.js';

export const storage = new Storage('cronometer');
const ui = new Interface();

ui.init();
