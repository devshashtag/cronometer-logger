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

function getDate(splited = false, timeZone = 'Asia/tehran') {
  const options = {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  };

  let date = new Date().toLocaleDateString('fa-IR', options);

  date = persianToEnglishNumbers(date);

  if (splited) date = date.split('/').map((num) => +num);

  return date;
}

function getTime(splited = false, timeZone = 'Asia/tehran') {
  const options = {
    timeZone,
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  };

  let time = new Date().toLocaleTimeString('fa-IR', options);

  time = persianToEnglishNumbers(time);

  if (splited) time = time.split(':').map((num) => +num);

  return time;
}

function timeToSeconds(time) {
  const [hour, minute, seconds] = time.split(':').map((num) => +num);
  return hour * 3600 + minute * 60 + seconds;
}

function secondsToTime(seconds) {
  return [parseInt(seconds / 60 / 60), parseInt((seconds / 60) % 60), parseInt(seconds % 60)].join(':').replace(/\b(\d)\b/g, '0$1');
}

export { getDate, getTime, timeToSeconds, secondsToTime };
