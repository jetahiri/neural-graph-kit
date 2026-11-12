/* Neural graph kit: renders a relationship diagram as glass node cards joined by curved edges that carry
   travelling light beams (the "animated beam" recipe: a gradient window sliding along each path, with a blurred glow under it).
   Usage: NeuralGraph.render(containerElement, data, options). Data shape: docs/DATA-SCHEMA.md. Look rules: docs/DESIGN-SPEC.md.
   No dependencies, no network calls. */
(function (root) {
  'use strict';
  var NS = 'http://www.w3.org/2000/svg';
  var DIR = { r: [1, 0], l: [-1, 0], t: [0, -1], b: [0, 1] };
  var WORD = { ok: 'Healthy', warn: 'Needs a look', error: 'Broken', idle: 'Off or not run yet' };
  var DEFAULTS = { nodeW: 232, nodeH: 104, colGap: 120, rowGap: 36, groupPad: 30, ambient: true, theme: 'auto', beamMs: 2800 };

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function el(tag, cls, parent, html) { var e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; if (parent) parent.appendChild(e); return e; }
  function svg(tag, cls, parent) { var e = document.createElementNS(NS, tag); if (cls) e.setAttribute('class', cls); if (parent) parent.appendChild(e); return e; }
  function easeOutExpo(x) { return x >= 1 ? 1 : 1 - Math.pow(2, -10 * x); }

  /* Columns by longest path from the sources, so data flows left to right. Oversight edges do not count toward depth.
     Cycles are capped by stopping after one pass per node. Nodes that already carry x and y keep them. */
  function autoLayout(nodes, edges, o) {
    var byId = {}, depth = {};
    nodes.forEach(function (n) { byId[n.id] = n; depth[n.id] = 0; });
    for (var i = 0; i < nodes.length; i++) {
      var changed = false;
      edges.forEach(function (e) {
        if (e.type === 'oversee' || !byId[e.from] || !byId[e.to]) return;
        var d = depth[e.from] + 1;
        if (d > depth[e.to] && d < nodes.length) { depth[e.to] = d; changed = true; }
      });
      if (!changed) break;
    }
    /* a node that only watches (no flow in or out) sits one column before the first thing it watches */
    nodes.forEach(function (n) {
      var flows = edges.some(function (e) { return e.type !== 'oversee' && (e.from === n.id || e.to === n.id); });
      var watched = edges.filter(function (e) { return e.type === 'oversee' && e.from === n.id && byId[e.to]; });
      if (!flows && watched.length) depth[n.id] = Math.max(0, Math.min.apply(null, watched.map(function (e) { return depth[e.to]; })) - 1);
    });
    var cols = [], groupOrder = {};
    nodes.forEach(function (n, k) { if (!(n.group in groupOrder)) groupOrder[n.group] = k; (cols[depth[n.id]] = cols[depth[n.id]] || []).push(n); });
    var tallest = 0;
    cols.forEach(function (c) { if (c) tallest = Math.max(tallest, c.length); });
    var fullH = tallest * (o.nodeH + o.rowGap);
    cols.forEach(function (c, ci) {
      if (!c) return;
      c.sort(function (a, b) { return (groupOrder[a.group] || 0) - (groupOrder[b.group] || 0); });
      var top = (fullH - c.length * (o.nodeH + o.rowGap)) / 2;
      c.forEach(function (n, ri) {
        if (n.x == null || n.y == null) { n.x = ci * (o.nodeW + o.colGap); n.y = top + ri * (o.nodeH + o.rowGap); }
      });
    });
  }

  function sides(a, b, o) {
    var dx = (b.x - a.x), dy = (b.y - a.y);
    if (Math.abs(dx) >= o.nodeW * 0.6) return dx >= 0 ? ['r', 'l'] : ['l', 'r'];
    return dy >= 0 ? ['b', 't'] : ['t', 'b'];
  }
  function anchor(n, side, o) {
    return side === 'r' ? { x: n.x + o.nodeW, y: n.y + o.nodeH / 2 } : side === 'l' ? { x: n.x, y: n.y + o.nodeH / 2 } :
      side === 't' ? { x: n.x + o.nodeW / 2, y: n.y } : { x: n.x + o.nodeW / 2, y: n.y + o.nodeH };
  }
  function geometry(a, b, o) {
    var s = sides(a, b, o), p0 = anchor(a, s[0], o), p1 = anchor(b, s[1], o);
    var len = Math.max(44, Math.min(160, Math.hypot(p1.x - p0.x, p1.y - p0.y) * 0.42)), d0 = DIR[s[0]], d1 = DIR[s[1]];
    return { p0: p0, p1: p1, c0: { x: p0.x + d0[0] * len, y: p0.y + d0[1] * len }, c1: { x: p1.x + d1[0] * len, y: p1.y + d1[1] * len } };
  }
  function pathD(g) { return 'M' + g.p0.x + ',' + g.p0.y + ' C' + g.c0.x + ',' + g.c0.y + ' ' + g.c1.x + ',' + g.c1.y + ' ' + g.p1.x + ',' + g.p1.y; }
  function midOf(g) { return { x: (g.p0.x + 3 * g.c0.x + 3 * g.c1.x + g.p1.x) / 8, y: (g.p0.y + 3 * g.c0.y + 3 * g.c1.y + g.p1.y) / 8 }; }

  function render(container, data, options) {
    var o = Object.assign({}, DEFAULTS, options || {});
    var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var nodes = (data.nodes || []).map(function (n) { return Object.assign({ status: 'idle' }, n); });
    var byId = {};
    nodes.forEach(function (n) { byId[n.id] = n; });
    var edges = (data.edges || []).filter(function (e) { return byId[e.from] && byId[e.to]; });
    var groups = data.groups || [];
    autoLayout(nodes, edges, o);

    container.innerHTML = '';
    container.classList.add('ng');
    var darkQuery = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
    function applyTheme(t) { container.setAttribute('data-theme', t === 'auto' ? (darkQuery && darkQuery.matches ? 'dark' : 'light') : t); }
    applyTheme(o.theme);

    var world = el('div', 'ng-world', container);
    var gLayer = el('div', '', world);
    var edgeSvg = svg('svg', 'ng-edges', world), defs = svg('defs', '', edgeSvg);
    var mk = svg('marker', '', defs);
    mk.setAttribute('id', 'ng-arrow'); mk.setAttribute('viewBox', '0 0 10 10'); mk.setAttribute('refX', '9'); mk.setAttribute('refY', '5');
    mk.setAttribute('markerWidth', '7'); mk.setAttribute('markerHeight', '7'); mk.setAttribute('orient', 'auto-start-reverse');
    svg('path', 'ng-arrow', mk).setAttribute('d', 'M0,0 L10,5 L0,10 z');
    var baseG = svg('g', '', edgeSvg), beamG = svg('g', '', edgeSvg), labelG = svg('g', '', edgeSvg);
    var nodeLayer = el('div', '', world);

    /* bounds of the whole drawing, used for the svg size and for fit */
    var minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    nodes.forEach(function (n) { minX = Math.min(minX, n.x); minY = Math.min(minY, n.y); maxX = Math.max(maxX, n.x + o.nodeW); maxY = Math.max(maxY, n.y + o.nodeH); });
    var pad = o.groupPad + 40;
    edgeSvg.setAttribute('width', maxX + pad); edgeSvg.setAttribute('height', maxY + pad);

    groups.forEach(function (g) {
      var m = nodes.filter(function (n) { return n.group === g.id; });
      if (!m.length) return;
      var x0 = Math.min.apply(null, m.map(function (n) { return n.x; })) - o.groupPad, y0 = Math.min.apply(null, m.map(function (n) { return n.y; })) - o.groupPad - 26;
      var x1 = Math.max.apply(null, m.map(function (n) { return n.x + o.nodeW; })) + o.groupPad, y1 = Math.max.apply(null, m.map(function (n) { return n.y + o.nodeH; })) + o.groupPad;
      var d = el('div', 'ng-group', gLayer, '<b>' + esc(g.label) + '</b>');
      d.style.cssText = 'left:' + x0 + 'px;top:' + y0 + 'px;width:' + (x1 - x0) + 'px;height:' + (y1 - y0) + 'px';
      minX = Math.min(minX, x0); minY = Math.min(minY, y0); maxX = Math.max(maxX, x1); maxY = Math.max(maxY, y1);
    });

    /* edges, each with its own beam gradient */
    var uid = 0;
    edges.forEach(function (e) {
      e.g = geometry(byId[e.from], byId[e.to], o);
      e.base = svg('path', 'ng-edge' + (e.type === 'oversee' ? ' oversee' : ''), baseG);
      e.base.setAttribute('d', pathD(e.g)); e.base.setAttribute('marker-end', 'url(#ng-arrow)');
      var id = 'ng-bg' + (++uid), lg = svg('linearGradient', '', defs);
      lg.setAttribute('id', id); lg.setAttribute('gradientUnits', 'userSpaceOnUse');
      [['0', 'var(--sky)', 0], ['.4', 'var(--sky)', 1], ['.72', 'var(--azure)', 1], ['1', 'var(--azure)', 0]].forEach(function (s) {
        var st = svg('stop', '', lg); st.setAttribute('offset', s[0]); st.setAttribute('style', 'stop-color:' + s[1] + ';stop-opacity:' + s[2]);
      });
      var glow = svg('path', 'ng-glow', beamG), core = svg('path', 'ng-beam', beamG);
      [glow, core].forEach(function (p) { p.setAttribute('d', pathD(e.g)); p.setAttribute('stroke', 'url(#' + id + ')'); p.style.opacity = 0; });
      e.beam = { e: e, lg: lg, core: core, glow: glow, on: false, t0: 0, rest: 900 };
      if (e.label) {
        var m = midOf(e.g), t = svg('text', 'ng-elabel', labelG);
        t.setAttribute('x', m.x); t.setAttribute('y', m.y - 6); t.setAttribute('text-anchor', 'middle'); t.textContent = e.label;
        e.labelEl = t;
      }
    });

    /* nodes */
    nodes.forEach(function (n) {
      var d = el('div', 'ng-node', nodeLayer,
        '<div class="ng-name">' + esc(n.label || n.id) + '</div>' +
        (n.kind ? '<div class="ng-kind">' + esc(n.kind) + '</div>' : '') +
        '<div class="ng-status"><i class="ng-dot"></i>' + esc(n.statusText || WORD[n.status] || n.status) + '</div>');
      d.setAttribute('data-status', WORD[n.status] ? n.status : 'idle');
      d.setAttribute('tabindex', '0'); d.setAttribute('role', 'button');
      d.style.cssText = 'left:' + n.x + 'px;top:' + n.y + 'px;width:' + o.nodeW + 'px;min-height:' + o.nodeH + 'px';
      d.addEventListener('mouseenter', function () { light(n.id, true); });
      d.addEventListener('mouseleave', function () { light(sel, false); });
      d.addEventListener('click', function (ev) { ev.stopPropagation(); select(n.id); });
      d.addEventListener('keydown', function (ev) { if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); select(n.id); } });
      n.el = d;
    });

    /* chrome */
    var bar = el('div', 'ng-bar ng-glass', container, '<h1>' + esc(data.title || 'Relationship map') + '</h1>');
    var bFit = el('button', 'ng-btn', bar, 'Fit'), bIn = el('button', 'ng-btn', bar, '+'), bOut = el('button', 'ng-btn', bar, '&minus;');
    var bTheme = el('button', 'ng-btn', bar, 'Light / dark');
    bIn.setAttribute('aria-label', 'Zoom in'); bOut.setAttribute('aria-label', 'Zoom out');
    el('div', 'ng-legend ng-glass', container,
      '<div><i></i>Sends work to</div><div><i class="d"></i>Oversees</div>' +
      Object.keys(WORD).map(function (k) { return '<div data-status="' + k + '"><span class="ng-dot"></span>' + WORD[k] + '</div>'; }).join(''));
    var panel = el('aside', 'ng-panel ng-glass', container);
    panel.hidden = true;

    /* beams: one animation loop for every lit edge */
    var raf = 0, active = [];
    function startBeam(b, loop, delay, rest) {
      if (reduce) { b.core.style.opacity = loop ? 0.85 : 0; b.core.setAttribute('stroke', 'var(--azure)'); return; }
      b.on = true; b.loop = loop; b.t0 = performance.now() + (delay || 0); b.rest = rest || 900;
      if (active.indexOf(b) < 0) active.push(b);
      if (!raf) raf = requestAnimationFrame(tick);
    }
    function stopBeam(b) { b.on = false; b.core.style.opacity = 0; b.glow.style.opacity = 0; }
    function tick(now) {
      raf = 0;
      active.forEach(function (b) {
        if (!b.on) return;
        var tt = now - b.t0;
        if (tt < 0) return;
        var x = (tt % (o.beamMs + b.rest)) / o.beamMs;
        if (!b.loop && tt > o.beamMs) { stopBeam(b); return; }
        if (x > 1) { b.core.style.opacity = 0; b.glow.style.opacity = 0; return; }
        var p = easeOutExpo(x), a = -0.4 + 1.5 * p, g = b.e.g, dx = g.p1.x - g.p0.x, dy = g.p1.y - g.p0.y;
        b.lg.setAttribute('x1', g.p0.x + dx * a); b.lg.setAttribute('y1', g.p0.y + dy * a);
        b.lg.setAttribute('x2', g.p0.x + dx * (a + 0.4)); b.lg.setAttribute('y2', g.p0.y + dy * (a + 0.4));
        b.core.style.opacity = 1; b.glow.style.opacity = 0.55;
      });
      active = active.filter(function (b) { return b.on; });
      if (active.length && !document.hidden) raf = requestAnimationFrame(tick);
    }
    /* ambient firing: every edge pulses on its own slow, uneven rhythm, the neural look */
    function ambient() {
      if (!o.ambient) return;
      edges.forEach(function (e) { startBeam(e.beam, true, Math.random() * 4000, 1800 + Math.random() * 4200); });
    }
    function quiet() { edges.forEach(function (e) { stopBeam(e.beam); }); }

    /* hover and selection: the node's own edges light and loop, the rest dim */
    var sel = null;
    function light(id, on) {
      var touch = {};
      if (id && on !== false) touch[id] = 1;
      edges.forEach(function (e) {
        var hit = id && (e.from === id || e.to === id);
        if (hit) { touch[e.from] = 1; touch[e.to] = 1; }
        e.base.classList.toggle('hot', !!hit);
        e.base.classList.toggle('dim', !!id && !hit);
        if (e.labelEl) e.labelEl.classList.toggle('show', !!hit);
      });
      nodes.forEach(function (n) { n.el.classList.toggle('dim', !!id && !touch[n.id]); n.el.classList.toggle('hot', n.id === id); });
      if (!id) { ambient(); return; }
      quiet();
      edges.forEach(function (e) { if (e.from === id || e.to === id) startBeam(e.beam, true, 0, 700); });
    }
    function chips(list) {
      return list.length ? list.map(function (n) { return '<button class="ng-chip" data-go="' + esc(n.id) + '">' + esc(n.label || n.id) + '</button>'; }).join('') : '<span class="ng-kind">None</span>';
    }
    function select(id) {
      sel = id;
      nodes.forEach(function (n) { n.el.classList.toggle('sel', n.id === id); });
      if (!id) { panel.hidden = true; light(null); return; }
      var n = byId[id];
      var from = edges.filter(function (e) { return e.to === id; }).map(function (e) { return byId[e.from]; });
      var to = edges.filter(function (e) { return e.from === id; }).map(function (e) { return byId[e.to]; });
      panel.innerHTML = '<button class="ng-btn ng-close" aria-label="Close">Close</button>' +
        '<h2>' + esc(n.label || n.id) + '</h2>' + (n.kind ? '<div class="ng-kind">' + esc(n.kind) + '</div>' : '') +
        '<div class="ng-status" data-status="' + esc(n.status) + '"><i class="ng-dot"></i>' + esc(n.statusText || WORD[n.status] || n.status) + '</div>' +
        (n.description ? '<p>' + esc(n.description) + '</p>' : '') +
        '<h3>Gets input from</h3><div class="ng-chips">' + chips(from) + '</div>' +
        '<h3>Sends output to</h3><div class="ng-chips">' + chips(to) + '</div>';
      panel.hidden = false;
      light(id, true);
    }
    panel.addEventListener('click', function (ev) {
      var go = ev.target.closest('[data-go]');
      if (go) { select(go.getAttribute('data-go')); return; }
      if (ev.target.closest('.ng-close')) select(null);
    });

    /* camera: wheel zoom at the cursor, drag to pan, pinch on touch, buttons and keys */
    var cam = { x: 0, y: 0, k: 1 };
    function apply() { world.style.transform = 'translate(' + cam.x + 'px,' + cam.y + 'px) scale(' + cam.k + ')'; }
    function zoomAt(f, cx, cy) {
      var k = Math.max(0.25, Math.min(2.5, cam.k * f));
      cam.x = cx - (cx - cam.x) * (k / cam.k); cam.y = cy - (cy - cam.y) * (k / cam.k); cam.k = k; apply();
    }
    function fit() {
      var W = container.clientWidth, H = container.clientHeight, top = 84, bottom = 24, side = 24;
      var w = maxX - minX, h = maxY - minY;
      cam.k = Math.max(0.25, Math.min(1.2, Math.min((W - side * 2) / w, (H - top - bottom) / h)));
      cam.x = (W - w * cam.k) / 2 - minX * cam.k; cam.y = top + (H - top - bottom - h * cam.k) / 2 - minY * cam.k; apply();
    }
    container.addEventListener('wheel', function (ev) {
      ev.preventDefault();
      var r = container.getBoundingClientRect();
      zoomAt(Math.exp(-ev.deltaY * 0.0015), ev.clientX - r.left, ev.clientY - r.top);
    }, { passive: false });
    var pts = {}, drag = null, pinch = null;
    container.addEventListener('pointerdown', function (ev) {
      if (ev.target.closest('.ng-node,.ng-bar,.ng-panel,.ng-legend')) return;
      container.setPointerCapture(ev.pointerId);
      pts[ev.pointerId] = { x: ev.clientX, y: ev.clientY };
      var ids = Object.keys(pts);
      if (ids.length === 1) drag = { x: ev.clientX - cam.x, y: ev.clientY - cam.y, moved: false };
      if (ids.length === 2) { var a = pts[ids[0]], b = pts[ids[1]]; pinch = Math.hypot(a.x - b.x, a.y - b.y); drag = null; }
    });
    container.addEventListener('pointermove', function (ev) {
      if (!pts[ev.pointerId]) return;
      pts[ev.pointerId] = { x: ev.clientX, y: ev.clientY };
      var ids = Object.keys(pts);
      if (pinch && ids.length === 2) {
        var a = pts[ids[0]], b = pts[ids[1]], d = Math.hypot(a.x - b.x, a.y - b.y), r = container.getBoundingClientRect();
        zoomAt(d / pinch, (a.x + b.x) / 2 - r.left, (a.y + b.y) / 2 - r.top); pinch = d;
      } else if (drag) { drag.moved = true; cam.x = ev.clientX - drag.x; cam.y = ev.clientY - drag.y; apply(); }
    });
    function up(ev) {
      var wasDrag = drag && drag.moved;
      delete pts[ev.pointerId];
      if (Object.keys(pts).length < 2) pinch = null;
      if (!Object.keys(pts).length) { if (drag && !wasDrag && sel) select(null); drag = null; }
    }
    container.addEventListener('pointerup', up);
    container.addEventListener('pointercancel', up);
    container.tabIndex = 0;
    container.addEventListener('keydown', function (ev) {
      var cx = container.clientWidth / 2, cy = container.clientHeight / 2;
      if (ev.key === '+' || ev.key === '=') zoomAt(1.2, cx, cy);
      else if (ev.key === '-') zoomAt(1 / 1.2, cx, cy);
      else if (ev.key === '0') fit();
      else if (ev.key === 'Escape') select(null);
    });
    bFit.onclick = fit;
    bIn.onclick = function () { zoomAt(1.2, container.clientWidth / 2, container.clientHeight / 2); };
    bOut.onclick = function () { zoomAt(1 / 1.2, container.clientWidth / 2, container.clientHeight / 2); };
    bTheme.onclick = function () { applyTheme(container.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'); };
    if (darkQuery && darkQuery.addEventListener) darkQuery.addEventListener('change', function () { if (o.theme === 'auto') applyTheme('auto'); });
    window.addEventListener('resize', fit);
    document.addEventListener('visibilitychange', function () { if (!document.hidden && active.length && !raf) raf = requestAnimationFrame(tick); });

    fit();
    ambient();
    return {
      select: select,
      fit: fit,
      setTheme: applyTheme,
      destroy: function () { quiet(); window.removeEventListener('resize', fit); container.innerHTML = ''; container.classList.remove('ng'); }
    };
  }

  root.NeuralGraph = { render: render };
})(window);
