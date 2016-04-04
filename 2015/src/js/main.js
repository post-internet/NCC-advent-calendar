import 'babel-polyfill';
import 'webcomponents.js';
import $ from 'jquery';
import moment from 'moment';
import { Calendar } from 'fullcalendar';
import fetch from './fetch.js';

const NO_THUMB = 'img/no_thumb.png';
const EMPTY_THUMB = 'img/empty.png';
const $ENTRIES_LIST = $('ul.entries');

const CAL_TEMPLATE = $('#calTemplate')[0].content;
const LIST_TEMPLATE = $('#listTemplate')[0].content;

let parseSpreadSheetEntry = (entry) => {
  let obj = {};
  for (let key in entry) {
    if (!key.match(/^gsx\$/)) continue;
    let newKey = key.replace(/^gsx\$/, '');
    obj[newKey] = entry[key].$t;
  }
  return obj;
};

let fetchThumbnail = async (username, type) => {
  username = encodeURIComponent(username.replace(/^@/, ''));
  switch(type) {
    case 'twitter': {
      return `https://twitter.com/${username}/profile_image`;
    }
    case 'gravatar': {
      let res = await fetch(`https://gravatar.com/${username}.json`, { jsonp: true });
      if (!res.ok) return NO_THUMB;
      return (await res.json()).entry[0].thumbnailUrl;
    }
    case 'hatena': {
      let head = username.substr(0, 2);
      return `http://cdn1.www.st-hatena.com/users/${head}/${username}/profile.gif`;
    }
    case 'qiita': {
      let res = await fetch(`https://qiita.com/api/v2/users/${username}`);
      if (!res.ok) return NO_THUMB;
      return (await res.json()).profile_image_url;
    }
    case 'github': {
      let res = await fetch(`https://api.github.com/users/${username}`);
      if (!res.ok) return NO_THUMB;
      return (await res.json()).avatar_url;
    }
    case 'facebook': {
      return `https://graph.facebook.com/${username}/picture?width=48&height=48`;
    }
    case 'url': {
      return decodeURIComponent(username);
    }
    case 'none':
    default: {
      return NO_THUMB;
    }
  }
};

let loadCalendar = async () => {
  let sheetId = $('meta[name=spreadsheet]').attr('content');
  let url = `https://spreadsheets.google.com/feeds/list/${sheetId}/od6/public/values?alt=json`;
  let res = await fetch(url);
  let sheetData = (await res.json()).feed.entry;
  let entries =
    sheetData
    .map(parseSpreadSheetEntry)
    .map((i) => {
      i.date = moment(Date.parse(i.date));
      return i;
    })
    .filter((i) => i.date.isValid())
    .sort((a, b) => a.date - b.date);

  return entries;
};

let makeCal = (entry) => {
  let dateStr = entry.date.format('YYYY-MM-DD');
  let $calCell = $(`.fc-day-number[data-date="${dateStr}"]`);

  let $calCellInner = $(CAL_TEMPLATE).clone();
  $calCellInner.find('.account').text(entry.accountname);
  let $link = $calCellInner.find('a');
  addArticleLink($link, entry);

  $calCell.append($calCellInner);
};

let makeList = (entry) => {
  let $list = $(LIST_TEMPLATE).clone();
  let dateStr = entry.date.format('YYYY-MM-DD');
  $list.find('li').attr('data-date', dateStr);
  $list.find('time').text(entry.date.format('MM/DD'));
  $list.find('.account > .name').text(entry.accountname || 'Empty');

  let $link = $list.find('.article-title > a');
  $link.text(entry.title || '(TBD)');
  addArticleLink($link, entry);

  $ENTRIES_LIST.append($list);
};

let addArticleLink = ($link, entry) => {
  if (!entry.articleurl || moment() < entry.date) {
    $link.on('click', (ev) => {
      ev.preventDefault();
      return false;
    });
    $link.attr('href', '#');
  } else {
    $link.attr('href', entry.articleurl || '#');
  }
}

let setThumbnail = async (entry) => {
  let dateStr = entry.date.format('YYYY-MM-DD');
  let $thumb = $(`[data-date="${dateStr}"] img`);
  let accountId = entry.thumbnailid || entry.accountname;

  if (!entry.accountname) {
    entry.thumbUrl = EMPTY_THUMB;
  } else {
    entry.thumbUrl =
      await fetchThumbnail(accountId, entry.thumbnailtype);
  }
  $thumb.attr('src', entry.thumbUrl);
  $thumb.on('error', (ev) => {
    let $el = $(ev.target);
    $el.off('error');
    $el.attr('src', NO_THUMB);
  });
  $thumb.on('load', (ev) => {
    let $el = $(ev.target);
    $el.animate({ opacity: 1 }, 250);
  });
};

let main = async () => {
  let entries = await loadCalendar();
  let startDate = entries.sort((a, b) => a.date - b.date)[0].date;
  let endDate = entries.sort((a, b) => a.date - b.date).reverse()[0].date;

  let $calWrap = $('#calendar');
  let cal = new Calendar($calWrap, {
    header: { left: '', center: '', right: '' },
    defaultView: 'month', theme: false, firstDay: 0,
    fixedWeekCount: false, defaultDate: startDate.format('YYYY-MM-DD'),
    eventColor: 'transparent', eventTextColor: '#212121'
  });
  $calWrap.data('fullCalendar', cal);
  cal.render();
  $calWrap.animate({ opacity: 1.0 }, 500);

  $('.fc-day-number:not(.fc-other-month)').each(function() {
    let $el = $(this);
    let date = moment(Date.parse($el.data('date')));
    if (endDate.date() < date.date()) {
      $el.addClass('fc-other-month');
    }
  });

  entries.sort((a, b) => a.date - b.date);
  for (let entry of entries) {
    makeCal(entry);
    makeList(entry);
    setThumbnail(entry).catch((err) => { throw err; });
  }
};

$(() => {
  main()
  .catch((err) => console.error(err.stack || err));
});
