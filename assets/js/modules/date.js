function persianToEnglishNumbers(text) {
  const persianToEnglishMap = {
    '۰': '0',
    '۱': '1',
    '۲': '2',
    '۳': '3',
    '۴': '4',
    '۵': '5',
    '۶': '6',
    '۷': '7',
    '۸': '8',
    '۹': '9',
  };

  return text.replace(/[۰-۹]/g, (match) => persianToEnglishMap[match]);
}

function getDate(timeZone = 'Asia/tehran') {
  const options = {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };

  let date = new Date().toLocaleDateString('fa-IR', options);

  date = persianToEnglishNumbers(date);

  return date;
}

function getTimestamp() {
  return +new Date();
}

function timestampToTime(timestamp, timeZone = 'Asia/tehran') {
  const options = {
    timeZone,
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  };

  let time = new Date(timestamp);

  time = time.toLocaleTimeString('fa-IR', options) + ':' + time.getMilliseconds().toString().padStart(3, '0');
  time = persianToEnglishNumbers(time);

  return time;
}

function msToTime(milliseconds) {
  const seconds = +milliseconds.toString().slice(0, -3);
  milliseconds = milliseconds.toString().padStart(3, '0').slice(-3);
  return (
    [parseInt(seconds / 60 / 60), parseInt((seconds / 60) % 60), parseInt(seconds % 60)].join(':').replace(/\b(\d)\b/g, '0$1') + ':' + milliseconds
  );
}

export { getDate, getTimestamp, timestampToTime, msToTime };
