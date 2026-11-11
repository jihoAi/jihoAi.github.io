// 데이터 파일(JSON)을 읽어 사이트 색에 맞춘 선 그래프를 그립니다.
// 형식은 README의 "차트 넣기"를 참고하세요.
(function () {
  var COLORS = ['--c1', '--c2', '--c3', '--c4', '--c5'];
  var FONT = '11px "JetBrains Mono", ui-monospace, monospace';

  function ticks(min, max, n) {
    var span = (max - min) || 1, step = Math.pow(10, Math.floor(Math.log10(span / n))), r = span / n / step;
    if (r >= 7.5) step *= 10; else if (r >= 3.5) step *= 5; else if (r >= 1.5) step *= 2;
    var out = [];
    for (var v = Math.ceil(min / step - 1e-9) * step; v <= max + step * 1e-9; v += step) out.push(+v.toFixed(10));
    return out;
  }
  function fmt(v) {
    var a = Math.abs(v);
    if (a >= 1e6) return +(v / 1e6).toFixed(2) + 'M';
    if (a >= 1e3) return +(v / 1e3).toFixed(1) + 'k';
    return String(+v.toFixed(2));
  }
  function nearest(xs, x) {
    var best = 0;
    for (var i = 1; i < xs.length; i++) if (Math.abs(xs[i] - x) < Math.abs(xs[best] - x)) best = i;
    return best;
  }

  function setup(fig, data) {
    var canvas = fig.querySelector('canvas'), legend = fig.querySelector('.chart-legend');
    var series = (data.series || []).filter(function (s) { return s.x && s.y && s.x.length === s.y.length && s.x.length; });
    if (!series.length) throw new Error('series가 비어 있습니다');
    var hoverX = null, valueEls = [], xEl;

    // 범례
    legend.textContent = '';
    if (data.title) { var t = document.createElement('strong'); t.textContent = data.title; legend.appendChild(t); }
    series.forEach(function (s, i) {
      var item = document.createElement('span'); item.className = 'chart-item';
      var sw = document.createElement('i'); sw.style.background = 'var(' + COLORS[i % COLORS.length] + ')';
      var val = document.createElement('b');
      item.appendChild(sw); item.appendChild(document.createTextNode(s.name || ('series ' + (i + 1)))); item.appendChild(val);
      legend.appendChild(item); valueEls.push(val);
    });
    xEl = document.createElement('span'); xEl.className = 'chart-x'; legend.appendChild(xEl);

    // 축 범위
    var xs = [], ys = [];
    series.forEach(function (s) { xs = xs.concat(s.x); ys = ys.concat(s.y, s.lower || [], s.upper || []); });
    if (data.threshold != null) ys.push(data.threshold);
    var xmin = Math.min.apply(null, xs), xmax = Math.max.apply(null, xs);
    var ymin = data.ymin != null ? data.ymin : Math.min(0, Math.min.apply(null, ys));
    var ymax = data.ymax != null ? data.ymax : Math.max.apply(null, ys);
    if (data.ymax == null) ymax += (ymax - ymin) * 0.05;
    var m, pw, ph;

    function draw() {
      var W = canvas.clientWidth, H = canvas.clientHeight; if (!W || !H) return;
      var dpr = window.devicePixelRatio || 1; canvas.width = W * dpr; canvas.height = H * dpr;
      var g = canvas.getContext('2d'); g.scale(dpr, dpr);
      var css = getComputedStyle(document.documentElement), tok = function (n) { return css.getPropertyValue(n).trim(); };
      m = { l: data.ylabel ? 58 : 42, r: 24, t: 10, b: data.xlabel ? 40 : 24 }; pw = W - m.l - m.r; ph = H - m.t - m.b;
      var X = function (v) { return m.l + (v - xmin) / ((xmax - xmin) || 1) * pw; };
      var Y = function (v) { return m.t + ph - (Math.max(ymin, Math.min(ymax, v)) - ymin) / ((ymax - ymin) || 1) * ph; };
      g.font = FONT; g.lineWidth = 1;

      g.textAlign = 'right'; g.textBaseline = 'middle';
      ticks(ymin, ymax, H < 260 ? 4 : 5).forEach(function (v) {
        g.strokeStyle = tok('--line'); g.beginPath(); g.moveTo(m.l, Math.round(Y(v)) + .5); g.lineTo(m.l + pw, Math.round(Y(v)) + .5); g.stroke();
        g.fillStyle = tok('--muted'); g.fillText(fmt(v), m.l - 8, Y(v));
      });
      g.textAlign = 'center'; g.textBaseline = 'top'; g.fillStyle = tok('--muted');
      ticks(xmin, xmax, W < 420 ? 3 : 7).forEach(function (v) { g.fillText(fmt(v), X(v), m.t + ph + 6); });
      if (data.xlabel) g.fillText(data.xlabel, m.l + pw / 2, m.t + ph + 22);
      if (data.ylabel) { g.save(); g.translate(12, m.t + ph / 2); g.rotate(-Math.PI / 2); g.textBaseline = 'middle'; g.fillText(data.ylabel, 0, 0); g.restore(); }

      if (data.threshold != null) {
        g.save(); g.setLineDash([4, 4]); g.strokeStyle = tok('--muted'); g.beginPath();
        g.moveTo(m.l, Y(data.threshold)); g.lineTo(m.l + pw, Y(data.threshold)); g.stroke(); g.restore();
      }

      series.forEach(function (s, i) {
        var col = tok(COLORS[i % COLORS.length]), k;
        if (s.lower && s.upper && s.lower.length === s.x.length && s.upper.length === s.x.length) {
          g.beginPath();
          for (k = 0; k < s.x.length; k++) g.lineTo(X(s.x[k]), Y(s.upper[k]));
          for (k = s.x.length - 1; k >= 0; k--) g.lineTo(X(s.x[k]), Y(s.lower[k]));
          g.closePath(); g.globalAlpha = 0.16; g.fillStyle = col; g.fill(); g.globalAlpha = 1;
        }
        g.beginPath(); for (k = 0; k < s.x.length; k++) g.lineTo(X(s.x[k]), Y(s.y[k]));
        g.strokeStyle = col; g.lineWidth = 2; g.lineJoin = 'round'; g.stroke(); g.lineWidth = 1;
      });

      // 마우스를 올린 지점의 값
      if (hoverX != null) {
        var j0 = nearest(series[0].x, hoverX), hx = series[0].x[j0];
        g.strokeStyle = tok('--muted'); g.beginPath(); g.moveTo(Math.round(X(hx)) + .5, m.t); g.lineTo(Math.round(X(hx)) + .5, m.t + ph); g.stroke();
        series.forEach(function (s, i) {
          var j = nearest(s.x, hx);
          g.fillStyle = tok(COLORS[i % COLORS.length]); g.beginPath(); g.arc(X(s.x[j]), Y(s.y[j]), 3.5, 0, Math.PI * 2); g.fill();
          valueEls[i].textContent = ' ' + fmt(s.y[j]);
        });
        xEl.textContent = 'x = ' + fmt(hx);
      } else {
        valueEls.forEach(function (el) { el.textContent = ''; }); xEl.textContent = '';
      }
    }

    canvas.addEventListener('pointermove', function (e) {
      var r = canvas.getBoundingClientRect(), px = e.clientX - r.left;
      hoverX = xmin + Math.max(0, Math.min(1, (px - m.l) / pw)) * (xmax - xmin); draw();
    });
    canvas.addEventListener('pointerleave', function () { hoverX = null; draw(); });
    window.addEventListener('resize', draw);
    if (window.matchMedia) window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', draw);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(draw);
    draw();
  }

  document.querySelectorAll('figure.chart[data-chart]').forEach(function (fig) {
    fetch(fig.dataset.chart)
      .then(function (r) { if (!r.ok) throw new Error('파일을 찾을 수 없습니다 (' + r.status + ')'); return r.json(); })
      .then(function (data) { setup(fig, data); })
      .catch(function (err) {
        fig.querySelector('canvas').hidden = true;
        fig.querySelector('.chart-legend').textContent = '차트를 불러오지 못했습니다: ' + fig.dataset.chart + ' · ' + err.message;
      });
  });
})();
