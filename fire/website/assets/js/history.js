/* history.js - keeps a short list of past results on THIS device only (localStorage).
   It stores the result word, score and time. It never stores the picture. Uses textContent only.
   Load after results.js and before app.js. On pages/history.html it also draws the list. */
(function () {
  var FSR = (window.FSR = window.FSR || {});
  var KEY = 'fsr-history-v1', MAX = 50;
  var LABELS = { fire: 'Fire', smoke: 'Smoke', neither: 'Neither', uncertain: 'Uncertain' };

  function read() {
    try {
      var list = JSON.parse(localStorage.getItem(KEY) || '[]');
      return Array.isArray(list) ? list : [];
    } catch (e) { return []; }
  }
  function write(list) {
    try { localStorage.setItem(KEY, JSON.stringify(list)); return true; }
    catch (e) { console.error(e); return false; }
  }

  // Shows any feedback already saved on an Uncertain item (display only).
  function addFeedback(li, it) {
    if (!it.comment) return;
    var c = document.createElement('p'); c.className = 'history-comment'; c.textContent = 'Feedback: ' + it.comment; li.appendChild(c);
  }

  FSR.history = {
    all: read,
    add: function (r) {
      if (!r || !LABELS[r.predictedClass]) return;
      var list = read();
      var rec = { time: new Date().toISOString(), result: r.predictedClass, top: r.topClass, score: Number(r.confidence) };
      list.unshift(rec);
      return write(list.slice(0, MAX)) ? rec.time : null;   // the time identifies the record (used to attach feedback)
    },
    // Saves feedback on an Uncertain record. Returns true when saved.
    setComment: function (time, text) {
      var list = read(), hit = null;
      list.forEach(function (it) { if (it.time === time && it.result === 'uncertain') hit = it; });
      if (!hit) return false;
      text = String(text || '').trim().slice(0, 500);
      if (text) hit.comment = text; else delete hit.comment;
      return write(list);
    },
    clear: function () { try { localStorage.removeItem(KEY); } catch (e) { console.error(e); } },
    render: function () {
      var box = document.getElementById('history-list'), empty = document.getElementById('history-empty'), clr = document.getElementById('btn-clear-history');
      if (!box) return;
      var all = read(), q = ((document.getElementById('history-search') || {}).value || '').trim().toLowerCase(), fl = (document.getElementById('history-filter') || {}).value || 'all';
      var list = all.filter(function (it) {
        if (fl !== 'all' && it.result !== fl) return false;
        if (!q) return true;
        var d = new Date(it.time);
        return ((LABELS[it.result] || '') + ' ' + (isFinite(it.score) ? it.score.toFixed(3) : '') + ' ' + (isNaN(d) ? '' : d.toLocaleString()) + ' ' + (it.comment || '')).toLowerCase().indexOf(q) > -1;
      });
      box.textContent = '';
      empty.hidden = list.length > 0;
      clr.disabled = all.length === 0;
      list.forEach(function (it) {
        if (!LABELS[it.result]) return;
        var li = document.createElement('li'); li.className = 'history-item is-' + it.result;
        var word = document.createElement('strong'); word.textContent = LABELS[it.result];
        var score = document.createElement('span');
        var s = isFinite(it.score) ? it.score.toFixed(3) : '-';
        score.textContent = it.result === 'uncertain' && LABELS[it.top] ? 'Highest score: ' + LABELS[it.top] + ' ' + s : 'Score: ' + s;
        var when = document.createElement('time'); when.dateTime = it.time;
        var d = new Date(it.time); when.textContent = isNaN(d) ? '' : d.toLocaleString();
        li.appendChild(word); li.appendChild(score); li.appendChild(when);
        if (it.result === 'uncertain') addFeedback(li, it);
        box.appendChild(li);
      });
    }
  };

  document.addEventListener('DOMContentLoaded', function () {
    var clr = document.getElementById('btn-clear-history');
    if (!clr) return;
    clr.addEventListener('click', function () {
      if (!window.confirm('Delete all saved results on this device?')) return;
      FSR.history.clear(); FSR.history.render();
    });
    ['history-search', 'history-filter'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) { el.addEventListener('input', FSR.history.render); el.addEventListener('change', FSR.history.render); }
    });
    FSR.history.render();
  });
})();
