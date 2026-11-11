/* Digraph naar SVG
 * Zet Graphviz DOT-code om naar SVG, volledig in de browser (Viz.js / WebAssembly).
 */
$(function () {
  'use strict';

  var STORAGE_KEY = 'digraph-svg.saved';
  var DRAFT_KEY = 'digraph-svg.draft';

  var EXAMPLES = {
    'Eenvoudig': 'digraph G {\n    rankdir=LR;\n    node [shape=box, style="rounded,filled", fillcolor="#e8f0fe", fontname="Helvetica"];\n\n    Start -> Invoer -> Verwerking -> Uitvoer -> Einde;\n    Verwerking -> Invoer [label="fout", color=red, fontcolor=red];\n}\n',
    'Beslisboom': 'digraph Beslissing {\n    node [fontname="Helvetica"];\n    vraag [label="Regent het?", shape=diamond, style=filled, fillcolor="#fff3c4"];\n    paraplu [label="Neem een paraplu", shape=box];\n    zon [label="Zonnebril op", shape=box];\n    weg [label="Vertrekken", shape=ellipse, style=filled, fillcolor="#d7f5dd"];\n\n    vraag -> paraplu [label="ja"];\n    vraag -> zon [label="nee"];\n    paraplu -> weg;\n    zon -> weg;\n}\n',
    'Clusters': 'digraph Systeem {\n    compound=true;\n    node [shape=box, fontname="Helvetica"];\n\n    subgraph cluster_web {\n        label="Webserver"; style=filled; color="#eef2f7";\n        html [label="HTML / CSS"]; js [label="JavaScript"]; php [label="PHP"];\n    }\n    subgraph cluster_db {\n        label="Database"; style=filled; color="#f7efe6";\n        mysql [label="MySQL", shape=cylinder];\n    }\n\n    browser [label="Browser", shape=component];\n    browser -> html -> js;\n    js -> php [label="AJAX"];\n    php -> mysql [label="SQL"];\n}\n',
    'Toestanden (circo)': 'digraph Toestanden {\n    // Kies de engine "circo" voor een cirkelvormige layout\n    node [shape=circle, fontname="Helvetica", width=1];\n    Nieuw -> Open -> Bezig -> Klaar -> Gesloten;\n    Bezig -> Open [label="terug"];\n    Klaar -> Bezig [label="heropend"];\n    Gesloten -> Nieuw [style=dashed];\n}\n'
  };

  var $code = $('#code'), $preview = $('#preview'), $error = $('#error'),
      $status = $('#status'), $engine = $('#engine'), $info = $('#info'),
      $fileName = $('#fileName');

  var viz = null;          // Viz-instantie
  var svgText = '';        // laatst gelukte SVG (string)
  var baseSize = null;     // {w, h, unit} van de SVG op 100%
  var zoom = 1;
  var timer = null;

  /* ---------- Opslag (localStorage, veilig ingepakt) ---------- */
  function store(key, value) {
    try {
      if (value === undefined) return localStorage.getItem(key);
      localStorage.setItem(key, value);
    } catch (e) { /* private modus e.d.: gewoon negeren */ }
    return null;
  }
  function getSaved() {
    try { return JSON.parse(store(STORAGE_KEY) || '[]'); } catch (e) { return []; }
  }
  function setSaved(list) { store(STORAGE_KEY, JSON.stringify(list)); }

  /* ---------- Status & fouten ---------- */
  function setStatus(text, cls) {
    $status.text(text).removeClass('ok bad').addClass(cls || '');
  }
  function showError(msg) {
    $error.text(msg).prop('hidden', !msg);
  }

  /* ---------- Tekenen ---------- */
  function render() {
    if (!viz) return;
    var src = $code.val();
    store(DRAFT_KEY, src);

    if (!$.trim(src)) {
      svgText = '';
      showError('');
      $preview.removeClass('stale').html('<div class="placeholder">Hier verschijnt je graaf.</div>');
      setButtons(false);
      $info.text('');
      return;
    }

    var result = viz.render(src, { format: 'svg', engine: $engine.val() });

    if (result.status === 'success') {
      var warnings = $.grep(result.errors, function (e) {
        // breedte-waarschuwing voor é, ε, … is onschuldig: niet tonen
        return e.level === 'warning' && !/non-ASCII character/.test(e.message);
      });
      showError(warnings.length ? 'Waarschuwing:\n' + $.map(warnings, function (e) { return e.message; }).join('\n') : '');
      svgText = result.output;
      showSvg(svgText);
      setButtons(true);
      setStatus('Getekend met ' + $engine.val(), 'ok');
    } else {
      var msgs = $.map(result.errors, function (e) { return e.message; }).join('\n');
      showError(msgs || 'Onbekende fout bij het tekenen.');
      $preview.addClass('stale');   // vorige graaf blijft zichtbaar, maar vager
      setStatus('Fout in de code', 'bad');
    }
  }

  function scheduleRender() {
    if (!$('#autoRender').is(':checked')) return;
    clearTimeout(timer);
    timer = setTimeout(render, 350);
  }

  function showSvg(text) {
    var $stage = $('<div class="stage"></div>').html(text);
    var svg = $stage.find('svg')[0];
    $preview.removeClass('stale').empty().append($stage);
    if (!svg) return;

    var w = parseSize(svg.getAttribute('width')), h = parseSize(svg.getAttribute('height'));
    baseSize = (w && h) ? { w: w.n, h: h.n, unit: w.unit } : null;
    applyZoom();

    var nodes = $(svg).find('g.node').length, edges = $(svg).find('g.edge').length;
    $info.text(nodes + ' knopen, ' + edges + ' verbindingen');
  }

  function parseSize(v) {
    var m = /^([\d.]+)\s*([a-z%]*)$/i.exec(v || '');
    return m ? { n: parseFloat(m[1]), unit: m[2] || 'px' } : null;
  }

  /* ---------- Zoom & pannen ---------- */
  function applyZoom() {
    var svg = $preview.find('svg')[0];
    if (!svg || !baseSize) return;
    svg.style.width = (baseSize.w * zoom) + baseSize.unit;
    svg.style.height = (baseSize.h * zoom) + baseSize.unit;
    if (svgText) setStatus('Zoom ' + Math.round(zoom * 100) + '%', 'ok');
  }
  function setZoom(z) { zoom = Math.min(8, Math.max(0.1, z)); applyZoom(); }

  function zoomFit() {
    var svg = $preview.find('svg')[0];
    if (!svg || !baseSize) return;
    zoom = 1; applyZoom();
    var r = svg.getBoundingClientRect();
    var availW = $preview[0].clientWidth - 40, availH = $preview[0].clientHeight - 40;
    setZoom(Math.min(availW / r.width, availH / r.height, 2));
  }

  $('#zoomIn').on('click', function () { setZoom(zoom * 1.25); });
  $('#zoomOut').on('click', function () { setZoom(zoom / 1.25); });
  $('#zoomFit').on('click', zoomFit);

  $preview.on('wheel', function (e) {
    var ev = e.originalEvent;
    if (!(ev.ctrlKey || ev.metaKey)) return;  // gewoon scrollen, tenzij Ctrl/Cmd
    e.preventDefault();
    setZoom(zoom * (ev.deltaY < 0 ? 1.1 : 1 / 1.1));
  });

  (function enablePan() {
    var start = null;
    $preview.on('mousedown', function (e) {
      if (e.button !== 0) return;
      start = { x: e.pageX, y: e.pageY, l: this.scrollLeft, t: this.scrollTop };
      $preview.addClass('dragging');
      e.preventDefault();
    });
    $(document).on('mousemove', function (e) {
      if (!start) return;
      $preview[0].scrollLeft = start.l - (e.pageX - start.x);
      $preview[0].scrollTop = start.t - (e.pageY - start.y);
    }).on('mouseup', function () {
      start = null; $preview.removeClass('dragging');
    });
  })();

  /* ---------- Downloaden & kopiëren ---------- */
  function baseName() {
    var n = $.trim($fileName.val()).replace(/[\\/:*?"<>|]+/g, '_').replace(/\.(svg|png|dot|gv)$/i, '');
    return n || 'graaf';
  }

  function downloadBlob(blob, name) {
    var url = URL.createObjectURL(blob);
    var a = $('<a>').attr({ href: url, download: name }).appendTo('body');
    a[0].click();
    a.remove();
    setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
  }

  function setButtons(on) {
    $('#btnDownload, #btnPng, #btnCopy').prop('disabled', !on);
  }

  $('#btnDownload').on('click', function () {
    if (!svgText) return;
    downloadBlob(new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' }), baseName() + '.svg');
  });

  $('#btnPng').on('click', function () {
    if (!svgText || !baseSize) return;
    // Graphviz werkt in pt; 1pt = 4/3 px. Tekenen op 2x voor scherpte.
    var factor = (baseSize.unit === 'pt' ? 4 / 3 : 1) * 2;
    var w = Math.ceil(baseSize.w * factor), h = Math.ceil(baseSize.h * factor);
    var img = new Image();
    var url = URL.createObjectURL(new Blob([svgText], { type: 'image/svg+xml;charset=utf-8' }));
    img.onload = function () {
      var c = document.createElement('canvas');
      c.width = w; c.height = h;
      var ctx = c.getContext('2d');
      ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, w, h);
      ctx.drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      c.toBlob(function (blob) { downloadBlob(blob, baseName() + '.png'); }, 'image/png');
    };
    img.onerror = function () { URL.revokeObjectURL(url); showError('PNG maken is mislukt.'); };
    img.src = url;
  });

  $('#btnCopy').on('click', function () {
    if (!svgText) return;
    var done = function () { setStatus('SVG-code gekopieerd', 'ok'); };
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(svgText).then(done, fallbackCopy);
    } else { fallbackCopy(); }
    function fallbackCopy() {
      var $t = $('<textarea>').val(svgText).css({ position: 'fixed', opacity: 0 }).appendTo('body');
      $t[0].select(); document.execCommand('copy'); $t.remove(); done();
    }
  });

  /* ---------- Uploaden (knop + slepen) ---------- */
  function readFile(file) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { showError('Bestand is groter dan 5 MB.'); return; }
    var reader = new FileReader();
    reader.onload = function () {
      $code.val(String(reader.result));
      $fileName.val(file.name.replace(/\.[^.]+$/, ''));
      render();
    };
    reader.onerror = function () { showError('Kon het bestand niet lezen.'); };
    reader.readAsText(file);
  }

  $('#fileInput').on('change', function () { readFile(this.files[0]); this.value = ''; });

  /* ---------- Bestand-menu ---------- */
  // Algemene dropdown-menu's (Bestand, Export)
  function closeMenus($except) {
    $('.menu-pop').not($except || []).prop('hidden', true)
      .closest('.menu-wrap').children('.btn').attr('aria-expanded', 'false');
  }
  $('.menu-wrap > .btn').on('click', function (e) {
    e.stopPropagation();
    var $menu = $(this).siblings('.menu-pop'), open = $menu.prop('hidden');
    closeMenus($menu);
    if (this.id === 'btnFileMenu') $('#btnDownloadDot').prop('disabled', !$.trim($code.val()));
    $menu.prop('hidden', !open);
    $(this).attr('aria-expanded', open ? 'true' : 'false');
  });
  $('.menu-pop').on('click', '.menu-item', function () { closeMenus(); })
    .on('keydown', function (e) {
      if (e.key === 'Escape') { closeMenus(); $(this).siblings('.btn').trigger('focus'); }
    });
  $(document).on('mousedown', function (e) {
    if (!$(e.target).closest('.menu-wrap').length) closeMenus();
  });

  function downloadDot() {
    var src = $code.val();
    if (!$.trim(src)) { setStatus('Er is geen code om te downloaden', 'bad'); return; }
    downloadBlob(new Blob([src], { type: 'text/vnd.graphviz;charset=utf-8' }), baseName() + '.dot');
    setStatus(baseName() + '.dot gedownload', 'ok');
  }
  $('#btnDownloadDot').on('click', downloadDot);
  $(document).on('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && (e.key === 's' || e.key === 'S')) { e.preventDefault(); downloadDot(); }
  });

  var $drop = $('#dropzone'), dragDepth = 0;
  $drop.on('dragenter', function (e) { e.preventDefault(); dragDepth++; $drop.addClass('over'); })
       .on('dragover', function (e) { e.preventDefault(); })
       .on('dragleave', function () { if (--dragDepth <= 0) { dragDepth = 0; $drop.removeClass('over'); } })
       .on('drop', function (e) {
         e.preventDefault(); dragDepth = 0; $drop.removeClass('over');
         var dt = e.originalEvent.dataTransfer;
         if (dt.files && dt.files.length) readFile(dt.files[0]);
         else if (dt.getData('text')) { $code.val(dt.getData('text')); render(); }
       });

  /* ---------- Editor ---------- */
  $code.on('input', scheduleRender);
  $code.on('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); render(); return; }
    if (e.key === 'Tab' && !e.shiftKey) {     // Tab voegt 4 spaties in
      e.preventDefault();
      var el = this, s = el.selectionStart, end = el.selectionEnd;
      el.value = el.value.slice(0, s) + '    ' + el.value.slice(end);
      el.selectionStart = el.selectionEnd = s + 4;
      scheduleRender();
    }
  });
  $engine.on('change', render);
  $('#btnRender').on('click', render);
  $('#btnClear').on('click', function () {
    if ($.trim($code.val()) && !confirm('De code in de editor wissen?')) return;
    $code.val('').trigger('focus'); render();
  });

  $.each(EXAMPLES, function (name) { $('#example').append($('<option>').val(name).text(name)); });
  $('#example').on('change', function () {
    var name = this.value;
    if (!name) return;
    $code.val(EXAMPLES[name]);
    if (/circo/.test(name)) $engine.val('circo');
    $fileName.val(name.toLowerCase().replace(/\W+/g, '-').replace(/^-|-$/g, ''));
    this.value = '';
    render();
  });

  /* ---------- Bewaren in de browser ---------- */
  function renderSavedList() {
    var list = getSaved(), $ul = $('#savedList').empty();
    if (!list.length) { $ul.append('<li class="empty">Nog niets bewaard.</li>'); return; }
    $.each(list, function (i, item) {
      var d = new Date(item.date);
      $('<li>')
        .append($('<span class="name">').text(item.name).attr('title', 'Openen').data('i', i))
        .append($('<span class="date">').text(d.toLocaleDateString('nl-BE') + ' ' + d.toLocaleTimeString('nl-BE', { hour: '2-digit', minute: '2-digit' })))
        .append($('<button type="button" class="btn small del">').text('Verwijderen').data('i', i))
        .appendTo($ul);
    });
  }

  $('#btnSave').on('click', function () {
    var src = $code.val();
    if (!$.trim(src)) { showError('Er is geen code om te bewaren.'); return; }
    var name = $.trim($('#saveName').val()) || baseName();
    var list = getSaved();
    var existing = -1;
    $.each(list, function (i, it) { if (it.name === name) existing = i; });
    var item = { name: name, code: src, engine: $engine.val(), date: Date.now() };
    if (existing > -1) {
      if (!confirm('"' + name + '" bestaat al. Overschrijven?')) return;
      list.splice(existing, 1);
    }
    list.unshift(item);
    setSaved(list);
    $('#saveName').val('');
    renderSavedList();
    setStatus('"' + name + '" bewaard', 'ok');
  });

  $('#savedList')
    .on('click', '.name', function () {
      var item = getSaved()[$(this).data('i')];
      if (!item) return;
      $code.val(item.code);
      $engine.val(item.engine || 'dot');
      $fileName.val(item.name);
      render();
    })
    .on('click', '.del', function () {
      var list = getSaved(), i = $(this).data('i');
      if (!list[i] || !confirm('"' + list[i].name + '" verwijderen?')) return;
      list.splice(i, 1);
      setSaved(list);
      renderSavedList();
    });

  /* ---------- Snippet-menu ---------- */
  var $pop = $('#snipPop'), $snipList = $('#snipList'), $snipSearch = $('#snipSearch');
  var snippets = [];   // platte lijst {group, t, d, c, whole}

  // losse snippets eerst, volledige sjablonen achteraan
  var groups = (window.DOT_SNIPPETS || []).slice().sort(function (a, b) {
    return (a.items[0].whole ? 1 : 0) - (b.items[0].whole ? 1 : 0);
  });
  $.each(groups, function (_, g) {
    $.each(g.items, function (_, it) { snippets.push($.extend({ group: g.group }, it)); });
  });
  $.each(window.DOT_MANUAL_LINKS || [], function (_, l) {
    $('#snipLinks').append($('<a target="_blank" rel="noopener">').attr('href', l.u).text(l.t));
  });

  function buildSnippetList(filter) {
    var q = $.trim(filter || '').toLowerCase(), lastGroup = null, count = 0;
    $snipList.empty();
    $.each(snippets, function (i, s) {
      var hay = (s.group + ' ' + s.t + ' ' + (s.d || '') + ' ' + s.c).toLowerCase();
      if (q && hay.indexOf(q) === -1) return;
      if (s.group !== lastGroup) { $snipList.append($('<div class="snip-group">').text(s.group)); lastGroup = s.group; }
      var $b = $('<button type="button" class="snip-item">').data('i', i)
        .append($('<span class="st">').text(s.t));
      if (s.whole) $b.append($('<span class="tag">').text('vervangt code'));
      if (s.d) $b.append($('<span class="sd">').text(s.d));
      $b.append($('<code>').text(s.c));
      $snipList.append($b);
      count++;
    });
    if (!count) $snipList.append('<div class="snip-empty">Niets gevonden.</div>');
    $snipList.find('.snip-item').first().addClass('active');
  }

  function openSnippets() {
    $snipSearch.val('');
    buildSnippetList('');
    $pop.prop('hidden', false);
    $('#btnSnippets').attr('aria-expanded', 'true');
    $snipList.scrollTop(0);
    $snipSearch.trigger('focus');
  }
  function closeSnippets(refocus) {
    if ($pop.prop('hidden')) return;
    $pop.prop('hidden', true);
    $('#btnSnippets').attr('aria-expanded', 'false');
    if (refocus) $code.trigger('focus');
  }

  // Code invoegen op de cursorpositie, met de inspringing van de huidige regel
  function insertSnippet(s) {
    var el = $code[0];
    if (s.whole) {
      if ($.trim(el.value) && !confirm('Dit sjabloon vervangt je huidige code. Doorgaan?')) return;
      el.value = s.c;
      el.focus();
      el.selectionStart = el.selectionEnd = 0;
      render();
      return;
    }
    var v = el.value, pos = el.selectionStart, end = el.selectionEnd;
    var lineStart = v.lastIndexOf('\n', pos - 1) + 1;
    var before = v.slice(lineStart, pos);
    var indent = (/^[ \t]*/.exec(before) || [''])[0];
    var text;

    if ($.trim(before)) {
      // cursor staat in code: snippet op een nieuwe regel eronder, zelfde inspringing
      pos = end = (v.indexOf('\n', pos) === -1) ? v.length : v.indexOf('\n', pos);
      text = '\n' + indent + s.c.replace(/\n/g, '\n' + indent);
    } else {
      if (!indent) {
        // lege regel: inspringing van de vorige niet-lege regel (+4 na een '{')
        var prev = v.slice(0, lineStart).replace(/\s+$/, '');
        var prevLine = prev.slice(prev.lastIndexOf('\n') + 1);
        indent = (/^[ \t]*/.exec(prevLine) || [''])[0];
        if (/\{\s*$/.test(prevLine)) indent += '    ';
      }
      pos = lineStart;
      if (end < pos) end = pos;
      text = indent + s.c.replace(/\n/g, '\n' + indent);
      var lineEnd = v.indexOf('\n', end); if (lineEnd === -1) lineEnd = v.length;
      if ($.trim(v.slice(end, lineEnd))) text += '\n' + indent;   // rest van de regel naar onder
    }
    el.value = v.slice(0, pos) + text + v.slice(end);

    // Tekst van het eerste label selecteren zodat je die meteen kan overtypen
    var m = /label="([^"]*)"/.exec(text), caret = pos + text.length - (/\n[ \t]*$/.test(text) ? text.match(/\n[ \t]*$/)[0].length : 0);
    el.focus();
    if (m && m[1]) {
      el.selectionStart = pos + m.index + 7;
      el.selectionEnd = el.selectionStart + m[1].length;
    } else {
      el.selectionStart = el.selectionEnd = caret;
    }
    scheduleRender();
  }

  $('#btnSnippets').on('click', function (e) {
    e.stopPropagation();
    if ($pop.prop('hidden')) openSnippets(); else closeSnippets(true);
  });
  $snipSearch.on('input', function () { buildSnippetList(this.value); });
  $snipList.on('click', '.snip-item', function () {
    var s = snippets[$(this).data('i')];
    closeSnippets(false);
    insertSnippet(s);
  }).on('mousemove', '.snip-item', function () {
    $snipList.find('.active').removeClass('active'); $(this).addClass('active');
  });
  $pop.on('keydown', function (e) {
    var $items = $snipList.find('.snip-item'), idx = $items.index($items.filter('.active'));
    if (e.key === 'Escape') { e.preventDefault(); closeSnippets(true); }
    else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      idx = Math.max(0, Math.min($items.length - 1, idx + (e.key === 'ArrowDown' ? 1 : -1)));
      $items.removeClass('active').eq(idx).addClass('active')[0].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter' && idx > -1) {
      e.preventDefault(); $items.eq(idx).trigger('click');
    }
  });
  $(document).on('mousedown', function (e) {
    if (!$(e.target).closest('.snip-wrap').length) closeSnippets(false);
  }).on('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && (e.key === 'j' || e.key === 'J')) {
      e.preventDefault();
      if ($pop.prop('hidden')) openSnippets(); else closeSnippets(true);
    }
  });

  /* ---------- Start ---------- */
  renderSavedList();
  $code.val(store(DRAFT_KEY) || EXAMPLES['Eenvoudig']);

  Viz.instance().then(function (instance) {
    viz = instance;
    var engines = $.grep(viz.engines || ['dot', 'neato', 'circo', 'fdp', 'twopi', 'osage', 'patchwork'], function (en) { return !/^nop/.test(en); });
    $engine.empty();
    $.each(engines, function (_, en) { $engine.append($('<option>').val(en).text(en)); });
    $engine.val('dot');
    setStatus('Graphviz ' + (viz.graphvizVersion || '') + ' klaar', 'ok');
    render();
  }).catch(function (err) {
    setStatus('Graphviz kon niet laden', 'bad');
    showError(String(err));
  });
});
