/* results.js - shows the result word, score, warning, loading message and errors. Uses textContent only. */
(function () {
  var FSR = (window.FSR = window.FSR || {});
  function $(id) { return document.getElementById(id); }
  function f(n) { return Number(n).toFixed(3); }
  FSR.results = {
    setModelStatus: function (t) { var e = $('model-status'); e.textContent = t; e.setAttribute('data-tone', /ready/i.test(t) ? 'ok' : /loading/i.test(t) ? 'busy' : 'bad'); },
    showLoading: function (on) { $('loading').hidden = !on; },
    clear: function () {
      $('result-word').textContent = 'No prediction yet';
      $('result-word').className = 'result-word';
      $('result-score').textContent = '';
      $('result-banner').hidden = true;
      $('result-feedback').hidden = true; $('result-feedback-text').textContent = '';
      $('score-bars').textContent = '';
      this.hideSuccess();
    },
    showResult: function (r) {
      var C = FSR.config, label = C.LABELS[r.predictedClass], topLabel = C.LABELS[r.topClass];
      var w = $('result-word'); w.textContent = label; w.className = 'result-word is-' + r.predictedClass;
      var first = r.predictedClass === 'uncertain' ? 'Highest score: ' + topLabel + ' ' + f(r.confidence) : label + ' score: ' + f(r.confidence);
            $('result-score').textContent = first + '\nScores are not guarantees. Predictions can be wrong.';
      this.showBars(r);
      var fb = $('result-feedback'); $('result-feedback-text').textContent = this.feedbackFor(r); fb.hidden = false;
      var b = $('result-banner'); b.textContent = r.message; b.className = 'banner banner-' + r.predictedClass; b.hidden = false;
    },
    // Feedback text that depends on the result, built from the scores shown in the result panel (display only).
    feedbackFor: function (r) {
      var C = FSR.config, top = C.LABELS[r.topClass], s = f(r.confidence);
      var all = C.CLASS_ORDER.map(function (n) { return C.LABELS[n] + ' ' + f(r.classScores[n]); }).join(', ');
      switch (r.predictedClass) {
        case 'fire': return 'Fire has the highest score (' + s + '). Scores: ' + all + '. Check the area yourself. If there may be real danger, follow your local safety steps.';
        case 'smoke': return 'Smoke has the highest score (' + s + '). Scores: ' + all + '. Look for where the smoke comes from and confirm it yourself. A second picture from another angle can help.';
        case 'neither': return 'Neither has the highest score (' + s + '). Scores: ' + all + '. This does not prove the place is safe. If you still suspect fire or smoke, try a clearer picture.';
        default: return 'No score stands out. The highest score is ' + top + ' (' + s + '). Scores: ' + all + '. Try a closer, brighter and steadier picture, then analyze again.';
      }
    },
    showBars: function (r) {
      var C = FSR.config, box = $('score-bars'); box.textContent = '';
      box.style.setProperty('--thr', (C.THRESHOLD * 100) + '%');
      C.CLASS_ORDER.forEach(function (n) {
        var row = document.createElement('div'); row.className = 'bar' + (n === r.topClass ? ' is-top' : ''); row.setAttribute('data-class', n);
        var name = document.createElement('span'); name.className = 'bar-name'; name.textContent = C.LABELS[n];
        var track = document.createElement('span'); track.className = 'bar-track';
        var fill = document.createElement('i'); fill.style.setProperty('--w', (Math.max(0, Math.min(1, r.classScores[n])) * 100) + '%'); track.appendChild(fill);
        var val = document.createElement('span'); val.className = 'bar-val'; val.textContent = f(r.classScores[n]);
        row.appendChild(name); row.appendChild(track); row.appendChild(val); box.appendChild(row);
      });
      var note = document.createElement('p'); note.className = 'bar-note';
      note.textContent = 'The dark line is the threshold (' + C.THRESHOLD.toFixed(2) + '). If the highest score is below it, the result is Uncertain. Scores are not probabilities.';
      box.appendChild(note);
    },
    showSuccess: function (msg) { var e = $('success-box'); e.textContent = msg; e.hidden = false; },
    hideSuccess: function () { $('success-box').hidden = true; $('success-box').textContent = ''; },
    // Smoothly brings the result panel into view, only if it is not already fully visible
    // (on wide screens the panel is sticky and usually already on screen, so nothing moves).
    reveal: function () {
      var el = $('results'); if (!el || !el.scrollIntoView) return;
      var head = document.querySelector('.site-header'), nav = document.querySelector('nav');
      var top = head ? head.getBoundingClientRect().bottom : 0, bottom = window.innerHeight;
      if (nav && getComputedStyle(nav).position === 'fixed') bottom = nav.getBoundingClientRect().top;
      var r = el.getBoundingClientRect();
      if (r.top >= top && r.bottom <= bottom) return;
      var calm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      el.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
    },
    showError: function (msg) { var e = $('error-box'); e.textContent = msg; e.hidden = false; },
    hideError: function () { $('error-box').hidden = true; $('error-box').textContent = ''; }
  };
})();
