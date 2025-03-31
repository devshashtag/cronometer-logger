import Storage from '/assets/js/modules/storage.js';
import Interface from '/assets/js/modules/interface.js';

export const storage = new Storage('cronometer');
const ui = new Interface();

ui.init();

window.addEventListener('DOMContentLoaded', () => {
  const history = document.getElementById('history');
  history.addEventListener('click', (e) => {
    const target = e.target;
    const showHistory = target.closest('.record__history');

    if (showHistory) {
      const recordItem = showHistory.closest('.history__record');
      const recordItems = recordItem.querySelector('.record__items');

      recordItems.classList.toggle('show');
    }
  });
});
