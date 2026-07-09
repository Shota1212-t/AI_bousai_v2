// ===== その他の機能（避難先のポイント／災害時の連絡先／災害情報／ハザードマップ）=====

// ----------------------------------------
// 汎用モーダル
// ----------------------------------------
function openModal(title, html, skipAutoTranslate) {
  var titleEl = document.getElementById('modalTitle');
  var bodyEl = document.getElementById('modalBody');

  titleEl.textContent = title;
  bodyEl.innerHTML = html;
  document.getElementById('modalOverlay').classList.remove('hidden');

  // 日本語以外なら、モーダルの中身を現在言語へ自動翻訳
  // （呼び出し元で既に翻訳済みのときは skipAutoTranslate=true で二重翻訳を防ぐ）
  if (!skipAutoTranslate) {
    translateModalContentIfNeeded(titleEl, bodyEl);
  }
}
function closeModal() {
  document.getElementById('modalOverlay').classList.add('hidden');
}
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeModal();
});

function _esc(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/////////////////////////////////////
var FEATURE_TRANSLATION_CACHE = {};

function getFeatureLang() {
  return (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ja';
}

function translateFeatureText(text, targetLang) {
  text = String(text || '').trim();

  if (!text) return Promise.resolve('');
  if (!targetLang || targetLang === 'ja') return Promise.resolve(text);

  var cacheKey = targetLang + '::' + text;
  if (FEATURE_TRANSLATION_CACHE[cacheKey]) {
    return Promise.resolve(FEATURE_TRANSLATION_CACHE[cacheKey]);
  }

  if (typeof BACKEND_URL === 'undefined' || !BACKEND_URL) {
    return Promise.resolve(text);
  }

  return fetch(BACKEND_URL.replace(/\/$/, '') + '/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: text,
      targetLang: targetLang,
      mode: 'general'
    })
  })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      var translated = data && data.translated ? data.translated : text;
      FEATURE_TRANSLATION_CACHE[cacheKey] = translated;
      return translated;
    })
    .catch(function() {
      return text;
    });
}

function translateFeatureTextBatch(texts, targetLang) {
  texts = (texts || []).map(function(t) { return String(t || '').trim(); });
  if (!texts.length) return Promise.resolve([]);
  if (!targetLang || targetLang === 'ja') return Promise.resolve(texts.slice());

  var uncached = [];
  var uncachedIdx = [];
  var result = texts.map(function(text, i) {
    var cacheKey = targetLang + '::' + text;
    if (FEATURE_TRANSLATION_CACHE[cacheKey]) return FEATURE_TRANSLATION_CACHE[cacheKey];
    if (!text) return '';
    uncached.push(text);
    uncachedIdx.push(i);
    return null;
  });

  if (!uncached.length) return Promise.resolve(result);

  if (typeof BACKEND_URL === 'undefined' || !BACKEND_URL) {
    uncachedIdx.forEach(function(idx, i) { result[idx] = uncached[i]; });
    return Promise.resolve(result);
  }

  return fetch(BACKEND_URL.replace(/\/$/, '') + '/api/translate-batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texts: uncached, targetLang: targetLang })
  })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      var arr = (data && Array.isArray(data.translated)) ? data.translated : uncached;
      uncachedIdx.forEach(function(idx, i) {
        var translated = arr[i] || uncached[i];
        result[idx] = translated;
        FEATURE_TRANSLATION_CACHE[targetLang + '::' + uncached[i]] = translated;
      });
      return result;
    })
    .catch(function() {
      uncachedIdx.forEach(function(idx, i) { result[idx] = uncached[i]; });
      return result;
    });
}

function translateElementTextNodes(root) {
  var lang = getFeatureLang();
  if (lang === 'ja') return;
  if (!root) return;

  var walker = document.createTreeWalker(
    root,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: function(node) {
        var text = node.nodeValue.trim();

        if (!text) return NodeFilter.FILTER_REJECT;
        if (/^[\s\n\r\t]+$/.test(text)) return NodeFilter.FILTER_REJECT;

        // 数字だけ・記号だけは翻訳しない
        if (/^[0-9０-９\s\-:：/()（）]+$/.test(text)) {
          return NodeFilter.FILTER_REJECT;
        }

        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  var nodes = [];
  var node;
  while ((node = walker.nextNode())) {
    nodes.push(node);
  }
  if (!nodes.length) return;

  var originals = nodes.map(function(n) { return n.nodeValue.trim(); });

  // 1件ずつではなく、まとめて1回のリクエストで翻訳する（高速化）
  translateFeatureTextBatch(originals, lang).then(function(translatedArr) {
    nodes.forEach(function(textNode, i) {
      var original = originals[i];
      var translated = translatedArr[i];
      if (translated) {
        textNode.nodeValue = textNode.nodeValue.replace(original, translated);
      }
    });
  });
}

function translateModalContentIfNeeded(titleEl, bodyEl) {
  var lang = getFeatureLang();
  if (lang === 'ja') return;

  if (titleEl && titleEl.textContent) {
    translateFeatureText(titleEl.textContent, lang).then(function(translated) {
      titleEl.textContent = translated || titleEl.textContent;
    });
  }

  translateElementTextNodes(bodyEl);
}
///////////////////////////////////////////

function _tr(key, fallback) {
  var lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ja';

  if (typeof I18N !== 'undefined') {
    if (I18N[lang] && I18N[lang][key]) {
      return I18N[lang][key];
    }

    if (I18N.ja && I18N.ja[key]) {
      return I18N.ja[key];
    }
  }

  return fallback || key;
}
// ========================================
// ハザードマップ（2種類）
// ========================================

function _getLatLng() {
  var lat = (typeof myLat !== 'undefined' && myLat != null) ? myLat
          : (typeof currentLat !== 'undefined' && currentLat != null) ? currentLat : null;
  var lng = (typeof myLng !== 'undefined' && myLng != null) ? myLng
          : (typeof currentLng !== 'undefined' && currentLng != null) ? currentLng : null;
  return { lat: lat, lng: lng };
}

// わがまちハザードマップ：各市区町村が公開している公式PDFへのリンク集（国土地理院）
function openWagamachiMap() {
  var pos = _getLatLng();
  if (pos.lat == null) {
    window.open('https://disaportal.gsi.go.jp/hazardmap/', '_blank');
    showToast('わがまちハザードマップを開きました');
    return;
  }
  showToast('市区町村コードを取得中...');
  fetch('https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress?lat=' + pos.lat + '&lon=' + pos.lng)
    .then(function(r) { return r.json(); })
    .then(function(d) {
      var muniCd = (d.results && d.results.muniCd) ? String(d.results.muniCd).padStart(5, '0') : null;
      var url = muniCd
        ? 'https://disaportal.gsi.go.jp/hazardmapportal/hazardmap/bousaimap/index.html?citycode=' + muniCd
        : 'https://disaportal.gsi.go.jp/hazardmap/';
      window.open(url, '_blank');
      showToast('わがまちハザードマップを開きました');
    })
    .catch(function() {
      window.open('https://disaportal.gsi.go.jp/hazardmap/', '_blank');
      showToast('わがまちハザードマップを開きました');
    });
}

// 重ねるハザードマップ：浸水・土砂・津波などのリスク情報を地図に重ねて表示（国土地理院）
function openKasaneruMap() {
  var pos = _getLatLng();
  var url = (pos.lat != null)
    ? 'https://disaportal.gsi.go.jp/maps/?ll=' + pos.lat + ',' + pos.lng + '&z=14&base=pale&vs=c1j0l0u0'
    : 'https://disaportal.gsi.go.jp/maps/';
  window.open(url, '_blank');
  showToast('重ねるハザードマップを開きました');
}

// 後方互換（古い呼び出し元のため残す）
function openHazardMap() { openWagamachiMap(); }

// ========================================
// 防災マニュアル（アコーディオン表示）
// ========================================

var _MANUAL_ICONS = {
  '警戒レベル': '⚠', '地震': '🏠', '大雨・洪水': '🌊', '土砂災害': '⛰',
  '台風': '🌀', '火災': '🔥', '避難行動': '🏃', '避難所': '🏢',
  '安否確認': '📞', '応急手当': '🩹', 'ライフライン': '💡'
};

function showManual() {
  if (typeof MANUAL_DATA === 'undefined' || !MANUAL_DATA.chunks) {
    openModal('防災マニュアル', '<p class="info-none">データを読み込めませんでした。</p>');
    openModal(title, html, true);
    return;
  }

  var categories = {};
  var catOrder = [];
  MANUAL_DATA.chunks.forEach(function(chunk) {
    if (!categories[chunk.category]) {
      categories[chunk.category] = [];
      catOrder.push(chunk.category);
    }
    categories[chunk.category].push(chunk);
  });

  var html = '<div class="manual-cats">';
  catOrder.forEach(function(cat, idx) {
    var icon = _MANUAL_ICONS[cat] || '📄';
    var open = (idx === 0);
    html += '<div class="manual-cat">' +
      '<button class="manual-cat-btn" onclick="toggleManualCat(this)">' +
        '<span>' + icon + ' ' + _esc(cat) + '</span>' +
        '<span class="manual-arrow">' + (open ? '▲' : '▼') + '</span>' +
      '</button>' +
      '<div class="manual-cat-body"' + (open ? '' : ' style="display:none"') + '>';
    categories[cat].forEach(function(chunk) {
      html += '<div class="manual-item">' +
        '<div class="manual-item-title">' + _esc(chunk.title) + '</div>' +
        '<div class="manual-item-content">' + _esc(chunk.content).replace(/\n/g, '<br>') + '</div>' +
        '</div>';
    });
    html += '</div></div>';
  });
  html += '</div><p class="info-src" style="padding:8px 16px;">出典：' + _esc(MANUAL_DATA.source || '') + '</p>';

  openModal('防災マニュアル', html);
}

function toggleManualCat(btn) {
  var body = btn.nextElementSibling;
  var arrow = btn.querySelector('.manual-arrow');
  var opening = body.style.display === 'none';
  body.style.display = opening ? 'block' : 'none';
  if (arrow) arrow.textContent = opening ? '▲' : '▼';
}

// ========================================
// 避難先のポイント
// ========================================
function showEvacTips() {
  var tips = _tr('evacTips', null);
  var items = _tr('evacItems', null);

  var html =
    '<h3 class="feat-sec">' + _tr('evacSectionTips', '避難するときの心得') + '</h3>' +
    '<ul class="tip-list">' + tips.map(function(t) { return '<li>' + _esc(t) + '</li>'; }).join('') + '</ul>' +
    '<h3 class="feat-sec">' + _tr('evacSectionItems', '非常持ち出し品（例）') + '</h3>' +
    '<div class="tip-tags">' + items.map(function(x) { return '<span class="tip-tag">' + _esc(x) + '</span>'; }).join('') + '</div>' +
    '<p class="info-note">' + _tr('evacNote', '※ 一例です。乳幼児・高齢者・持病など、各家庭に合わせて準備しましょう。') + '</p>';

  openModal(_tr('modalEvacTitle', '避難先のポイント'), html, true);
}

// ========================================
// 災害時の連絡先
// ========================================

function getContacts() {
  try { return JSON.parse(localStorage.getItem('emergencyContacts') || '[]'); }
  catch (e) { return []; }
}
function saveContacts(arr) {
  try { localStorage.setItem('emergencyContacts', JSON.stringify(arr)); } catch (e) {}
}

function showContacts() {
  var pub = _tr('publicContacts', [
    { n: '消防・救急',        t: '119', c: '#DC2626' },
    { n: '警察',             t: '110', c: '#1E5BC0' },
    { n: '海上保安庁',        t: '118', c: '#0891B2' },
    { n: '災害用伝言ダイヤル', t: '171', c: '#16A34A' }
  ]);

  var html = '<h3 class="feat-sec">' + _tr('contactSectionPublic', '公式の連絡先') + '</h3><div class="contact-grid">';
  pub.forEach(function(p) {
    html += '<a class="contact-card" href="tel:' + p.t + '">' +
            '<span class="contact-num" style="color:' + p.c + '">' + p.t + '</span>' +
            '<span class="contact-name">' + _esc(p.n) + '</span></a>';
  });
  html += '</div>';
  html += '<p class="info-note">' + _tr('contactNote', '番号をタップすると発信します（スマホ）。171は災害時の安否確認用です。') + '</p>';

  html += '<h3 class="feat-sec">' + _tr('contactSectionPersonal', '家族・知人の連絡先') + '</h3>';
  html += '<div id="contactList"></div>';
  html += '<div class="contact-add">' +
          '<input id="cName" placeholder="' + _tr('contactNamePlaceholder', '名前（例：父）') + '">' +
          '<input id="cTel" placeholder="' + _tr('contactTelPlaceholder', '電話番号') + '" inputmode="tel">' +
          '<button onclick="addContact()">' + _tr('contactAddBtn', '追加') + '</button></div>';

  openModal(_tr('modalContactsTitle', '災害時の連絡先'), html, true);
  renderContactList();
}

function renderContactList() {
  var el = document.getElementById('contactList');
  if (!el) return;
  var list = getContacts();
  if (!list.length) {
    el.innerHTML = '<p class="info-none">' + _tr('contactNoEntry', 'まだ登録がありません。下の欄から追加できます。') + '</p>';
    return;
  }
  el.innerHTML = list.map(function(c, i) {
    return '<div class="contact-row">' +
             '<div class="contact-info"><b>' + _esc(c.name) + '</b><span>' + _esc(c.tel) + '</span></div>' +
             '<a class="contact-call" href="tel:' + _esc(c.tel) + '">' + _tr('contactCallBtn', '発信') + '</a>' +
             '<button class="contact-del" onclick="deleteContact(' + i + ')">' + _tr('contactDelBtn', '削除') + '</button>' +
           '</div>';
  }).join('');
}

function addContact() {
  var n = document.getElementById('cName').value.trim();
  var t = document.getElementById('cTel').value.trim();
  if (!n || !t) { showToast(_tr('toastContactRequired', '名前と電話番号を入力してください')); return; }
  var list = getContacts();
  list.push({ name: n, tel: t });
  saveContacts(list);
  document.getElementById('cName').value = '';
  document.getElementById('cTel').value = '';
  renderContactList();
  showToast(_tr('toastContactAdd', '連絡先を追加しました'));
}

function deleteContact(i) {
  var list = getContacts();
  list.splice(i, 1);
  saveContacts(list);
  renderContactList();
}

// ========================================
// 災害情報（気象庁JSON）
// ========================================

function fmtDateTime(value) {
  if (!value) return '';

  var d = new Date(value);
  if (isNaN(d.getTime())) return String(value);

  return d.getFullYear() + '/' +
    String(d.getMonth() + 1).padStart(2, '0') + '/' +
    String(d.getDate()).padStart(2, '0') + ' ' +
    String(d.getHours()).padStart(2, '0') + ':' +
    String(d.getMinutes()).padStart(2, '0');
}

var WARN_CODES = {
  '02': '暴風雪警報', '03': '大雨警報', '04': '洪水警報', '05': '暴風警報',
  '06': '大雪警報', '07': '波浪警報', '08': '高潮警報',
  '10': '大雨注意報', '12': '大雪注意報', '13': '風雪注意報', '14': '雷注意報',
  '15': '強風注意報', '16': '波浪注意報', '17': '融雪注意報', '18': '洪水注意報',
  '19': '高潮注意報', '20': '濃霧注意報', '21': '乾燥注意報', '22': 'なだれ注意報',
  '23': '低温注意報', '24': '霜注意報', '25': '着氷注意報', '26': '着雪注意報'
};

function showDisasterInfo() {
  openModal(_tr('modalDisasterTitle', '災害情報（気象庁）'), '<p class="info-none">' + _tr('modalDisasterLoading', '読み込み中...') + '</p>', true);

  var lat = (typeof myLat !== 'undefined' && myLat != null) ? myLat
          : (typeof currentLat !== 'undefined' && currentLat != null) ? currentLat : 35.985;
  var lng = (typeof myLng !== 'undefined' && myLng != null) ? myLng
          : (typeof currentLng !== 'undefined' && currentLng != null) ? currentLng : 139.330;

  fetch('https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress?lat=' + lat + '&lon=' + lng)
    .then(function(r) { return r.json(); })
    .then(function(d) {
      var muni = (d.results && d.results.muniCd) ? String(d.results.muniCd) : '11000';
      var pref = muni.padStart(5, '0').substring(0, 2) + '0000';
      loadJmaInfo(pref);
    })
    .catch(function() { loadJmaInfo('110000'); });
}

function loadJmaInfo(pref) {
  var ovUrl = 'https://www.jma.go.jp/bosai/forecast/data/overview_forecast/' + pref + '.json';
  var wnUrl = 'https://www.jma.go.jp/bosai/warning/data/warning/' + pref + '.json';
  var lang = getFeatureLang();

  Promise.all([
    fetch(ovUrl).then(function(r) { return r.json(); }).catch(function() { return null; }),
    fetch(wnUrl).then(function(r) { return r.json(); }).catch(function() { return null; })
  ]).then(function(res) {
    var ov = res[0], wn = res[1];
    var warns = wn ? parseWarnings(wn) : [];

    // JMAの生テキスト（動的な部分）だけを、まとめて1回で翻訳する
    var dynamicTexts = ov ? [ov.targetArea || '', ov.headlineText || '', ov.text || ''] : [];
    var translateDynamic = (lang === 'ja' || !dynamicTexts.length)
      ? Promise.resolve(dynamicTexts)
      : translateFeatureTextBatch(dynamicTexts, lang);

    translateDynamic.then(function(translated) {
      var tArea     = ov ? (translated[0] || ov.targetArea || '') : '';
      var tHeadline = ov ? (translated[1] || '') : '';
      var tText     = ov ? (translated[2] || ov.text || '') : '';

      var html = '';
      html += '<h3 class="feat-sec">' + _tr('disasterSectionWarnings', '発表中の警報・注意報') + '</h3>';
      if (warns.length) {
        html += '<div class="warn-list">' +
                warns.map(function(w) { return '<span class="warn-chip">⚠ ' + _esc(w) + '</span>'; }).join('') +
                '</div>';
      } else {
        html += '<p class="info-none">' + _tr('disasterNoWarnings', '現在、発表中の警報・注意報はありません。') + '</p>';
      }

      if (ov) {
        html += '<h3 class="feat-sec">' + _tr('disasterSectionOverview', '気象概況（{area}）').replace('{area}', _esc(tArea)) + '</h3>';
        if (tHeadline) html += '<p class="info-headline">' + _esc(tHeadline) + '</p>';
        html += '<p class="info-text">' + _esc(tText).replace(/\n/g, '<br>') + '</p>';
        html += '<p class="info-src">' + _esc(ov.publishingOffice || _tr('disasterSourceJma', '気象庁')) + '　' + fmtDateTime(ov.reportDatetime) + '</p>';
      }

      html += '<p class="info-src">' + _tr('disasterSource', '出典：気象庁') + '</p>';

      if (!ov && !warns.length) {
        html = '<p class="info-none">' + _tr('disasterFetchFail', '情報を取得できませんでした。通信環境を確認して、もう一度お試しください。') + '</p>';
      }
      var modalBody = document.getElementById('modalBody');
      if (modalBody) {
        modalBody.innerHTML = html;
        translateElementTextNodes(modalBody);
      }
    });

  }).catch(function(e) {
    console.error('災害情報取得エラー:', e);

    var body = document.getElementById('modalBody');
    if (body) {
      body.innerHTML = '<p class="info-none">' + _tr('disasterFetchFail', '情報を取得できませんでした。通信環境を確認して、もう一度お試しください。') + '</p>';
    }
  });
}

function parseWarnings(json) {
  var active = {};
  (json.areaTypes || []).forEach(function(at) {
    (at.areas || []).forEach(function(area) {
      (area.warnings || []).forEach(function(w) {
        if (w.code && w.status !== '解除') active[w.code] = true;
      });
    });
  });
  var lang = getFeatureLang();
  var dict = (typeof I18N !== 'undefined' && I18N[lang] && I18N[lang].warnCodes) ? I18N[lang].warnCodes
           : (typeof I18N !== 'undefined' && I18N.ja && I18N.ja.warnCodes) ? I18N.ja.warnCodes : WARN_CODES;
  return Object.keys(active).map(function(c) {
    return dict[c] || WARN_CODES[c] || ('警報・注意報(コード' + c + ')');
  });
}

// ========================================
// 警報バナー（画面上部に常時表示）
// ========================================

function checkWarningsForBanner() {
  var lat = (typeof myLat !== 'undefined' && myLat != null) ? myLat : null;
  var lng = (typeof myLng !== 'undefined' && myLng != null) ? myLng : null;
  if (lat == null) return;

  fetch('https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress?lat=' + lat + '&lon=' + lng)
    .then(function(r) { return r.json(); })
    .then(function(d) {
      var muni = (d.results && d.results.muniCd) ? String(d.results.muniCd) : null;
      if (!muni) return;
      var pref = muni.padStart(5, '0').substring(0, 2) + '0000';
      return fetch('https://www.jma.go.jp/bosai/warning/data/warning/' + pref + '.json')
        .then(function(r) { return r.json(); })
        .then(function(wn) { _applyWarningBanner(parseWarnings(wn)); });
    })
    .catch(function() {});
}

function _applyWarningBanner(warns) {
  var banner = document.getElementById('warningBanner');
  if (!banner) return;
  if (!warns || warns.length === 0) {
    banner.classList.add('hidden');
    return;
  }
  var label = warns.slice(0, 2).join('・') + (warns.length > 2 ? ' ほか' + (warns.length - 2) + '件' : '');
  document.getElementById('wbTitle').textContent = label + ' が発令中';
  banner.classList.remove('hidden');
}

// ========================================
// 地震情報バナー＆ブラウザ通知（気象庁 地震情報フィード）
// ========================================

var QUAKE_FEED_URL              = 'https://www.jma.go.jp/bosai/quake/data/list.json';
var QUAKE_LOCAL_BANNER_MIN_RANK = 1;   // 現在地の都道府県で震度1以上ならバナー
var QUAKE_LOCAL_NOTIFY_MIN_RANK = 3;   // 現在地で震度3以上ならブラウザ通知
var QUAKE_AREA_BANNER_MIN_RANK  = 4;   // 位置不明時：全国で震度4以上ならバナー
var QUAKE_AREA_NOTIFY_MIN_RANK  = 5;   // 位置不明時：全国で震度5弱以上なら通知
var QUAKE_BANNER_MAX_AGE_MIN    = 120; // 発生から2時間以内のみバナー表示
var QUAKE_NOTIFY_MAX_AGE_MIN    = 60;  // 発生から1時間以内の新着のみ通知
var QUAKE_SEEN_KEY              = 'bosai_quake_notified_eid';
var QUAKE_DISMISS_KEY           = 'bosai_quake_dismissed_eid';

var _INTENSITY_RANK = { '1':1, '2':2, '3':3, '4':4, '5-':5, '5+':6, '6-':7, '6+':8, '7':9 };
function _quakeRank(maxi) { return _INTENSITY_RANK[String(maxi || '')] || 0; }

function _qGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function _qSet(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }

function _quakeIntensityText(maxi) {
  var s = String(maxi || '');
  if (s.indexOf('-') !== -1) return s.replace('-', '') + _tr('quakeIntWeak', '弱');
  if (s.indexOf('+') !== -1) return s.replace('+', '') + _tr('quakeIntStrong', '強');
  return s;
}
function _quakePlace(q) {
  var lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ja';
  if (lang === 'en' && q.en_anm) return q.en_anm;
  return q.anm || '';
}
function _quakeAgeMin(q) {
  var at = q.at ? new Date(q.at).getTime() : 0;
  if (!at) return Infinity;
  return (Date.now() - at) / 60000;
}

// 現在地のエリア（都道府県2桁＋市区町村5桁）を逆ジオコーディングで解決してキャッシュ
// 手動入力位置も window.myLat/myLng に入るため、GPS・手動の区別なく追従する
var _userArea = null;      // { pref: '07', muni: '07202' }
var _userAreaKey = null;
function _resolveUserArea(cb) {
  var lat = (typeof myLat !== 'undefined' && myLat != null) ? myLat : null;
  var lng = (typeof myLng !== 'undefined' && myLng != null) ? myLng : null;
  if (lat == null) { cb(null); return; }
  var key = lat.toFixed(3) + ',' + lng.toFixed(3);
  if (_userArea && _userAreaKey === key) { cb(_userArea); return; }
  fetch('https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress?lat=' + lat + '&lon=' + lng)
    .then(function (r) { return r.json(); })
    .then(function (d) {
      var muni = (d.results && d.results.muniCd) ? String(d.results.muniCd).padStart(5, '0') : null;
      _userArea = muni ? { pref: muni.substring(0, 2), muni: muni } : null;
      _userAreaKey = key;
      cb(_userArea);
    })
    .catch(function () { cb(null); });
}

// 地震の int 配列から現在地で観測された震度を返す。
// 市区町村（気象庁cityコード先頭5桁 = 地理院muniCd）で照合し、無ければ都道府県で照合。
// 戻り値: { maxi, gran: 'city' | 'pref' } または null
function _localIntensity(q, area) {
  if (!area || !Array.isArray(q.int)) return null;
  var prefEntry = null;
  for (var i = 0; i < q.int.length; i++) {
    var entry = q.int[i];
    if (String(entry.code) === area.pref) prefEntry = entry;
    if (Array.isArray(entry.city)) {
      for (var j = 0; j < entry.city.length; j++) {
        if (String(entry.city[j].code).substring(0, 5) === area.muni) {
          return { maxi: entry.city[j].maxi, gran: 'city' };
        }
      }
    }
  }
  if (prefEntry) return { maxi: prefEntry.maxi, gran: 'pref' };
  return null;
}

// 表示すべき地震を1件選ぶ。現在地で揺れた地震を優先し、位置不明なら全国の大きな地震
// 戻り値: { q, localMaxi, gran: 'city' | 'pref' | 'area' } または null
function _pickRelevantQuake(list, area) {
  for (var i = 0; i < list.length; i++) {
    var q = list[i];
    if (area) {
      var li = _localIntensity(q, area);
      if (li && _quakeRank(li.maxi) >= QUAKE_LOCAL_BANNER_MIN_RANK) {
        return { q: q, localMaxi: li.maxi, gran: li.gran };
      }
    } else if (_quakeRank(q.maxi) >= QUAKE_AREA_BANNER_MIN_RANK) {
      return { q: q, localMaxi: q.maxi, gran: 'area' };
    }
  }
  return null;
}

var _lastQuake = null;  // { q, localMaxi, gran }
var _lastQuakeCheckTs = 0;

// 最新の地震情報を取得し、現在地（GPS・手動入力）に連動させてバナー・通知を更新
function checkEarthquake(force) {
  var now = Date.now();
  if (!force && now - _lastQuakeCheckTs < 10 * 1000) return;  // 過剰な連続呼び出しを抑制
  _lastQuakeCheckTs = now;

  _resolveUserArea(function (area) {
    fetch(QUAKE_FEED_URL, { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .then(function (list) {
        if (!Array.isArray(list) || !list.length) return;
        var picked = _pickRelevantQuake(list, area);
        if (!picked) { _hideQuakeBanner(); return; }
        _lastQuake = picked;

        var dismissed = _qGet(QUAKE_DISMISS_KEY);
        if (_quakeAgeMin(picked.q) <= QUAKE_BANNER_MAX_AGE_MIN && dismissed !== picked.q.eid) {
          _applyQuakeBanner(picked);
        } else {
          _hideQuakeBanner();
        }
        _maybeNotifyQuake(picked);
      })
      .catch(function () {});
  });
}

// 現在地が変わったとき（手動入力・GPS更新）に災害情報を即時更新する共通入口
function refreshDisasterInfoForLocation() {
  checkEarthquake(true);
  if (typeof checkWarningsForBanner === 'function') checkWarningsForBanner();
}

// ---- リアルタイム化 ----
// P2P地震情報の WebSocket（公開・認証不要）を新着トリガーにして、
// 地震発生の数秒後に気象庁フィードを即時取得する。失敗時は30秒ポーリングが継続。
var _quakeWs = null;
var _quakeWsRetryMs = 5000;
function startQuakeRealtime() {
  if (!('WebSocket' in window)) return;
  try {
    _quakeWs = new WebSocket('wss://api.p2pquake.net/v2/ws');
    _quakeWs.onmessage = function (ev) {
      try {
        var msg = JSON.parse(ev.data);
        // 551 = 地震情報（震度速報・震源・震度）
        if (msg && msg.code === 551) checkEarthquake(true);
      } catch (e) {}
    };
    _quakeWs.onopen = function () { _quakeWsRetryMs = 5000; };
    _quakeWs.onclose = function () {
      setTimeout(startQuakeRealtime, _quakeWsRetryMs);
      _quakeWsRetryMs = Math.min(_quakeWsRetryMs * 2, 60000);  // 5秒→最大60秒でバックオフ
    };
    _quakeWs.onerror = function () { try { _quakeWs.close(); } catch (e) {} };
  } catch (e) {}
}

// タブが再表示されたら即時更新（スマホでアプリに戻った瞬間に最新化）
document.addEventListener('visibilitychange', function () {
  if (document.visibilityState === 'visible') refreshDisasterInfoForLocation();
});

function _applyQuakeBanner(picked) {
  var banner = document.getElementById('quakeBanner');
  if (!banner) return;
  var q = picked.q;
  var intensity = _quakeIntensityText(picked.localMaxi);
  // 市区町村一致=「現在地の震度」／県のみ一致=「県内最大震度」／位置不明=「最大震度」
  var intKey = picked.gran === 'city' ? ['quakeLocalIntensity', '現在地の震度{intensity}']
             : picked.gran === 'pref' ? ['quakePrefIntensity', '県内最大震度{intensity}']
             : ['quakeMaxIntensity', '最大震度{intensity}'];
  var intLabel = _tr(intKey[0], intKey[1]).replace('{intensity}', intensity);
  var parts = [_tr('quakeLabel', '地震情報') + '：' + _quakePlace(q), intLabel];
  if (q.mag) parts.push('M' + q.mag);

  var titleEl = document.getElementById('qbTitle');
  var subEl = document.getElementById('qbSub');
  var linkEl = document.getElementById('qbLink');
  if (titleEl) titleEl.textContent = parts.join('　');
  if (subEl) subEl.textContent = _tr('quakeBannerSub', '強い揺れのときはまず身の安全を確保してください');
  if (linkEl) linkEl.textContent = _tr('quakeJmaLink', '気象庁で詳細 →');
  banner.classList.remove('hidden');
}
function _hideQuakeBanner() {
  var banner = document.getElementById('quakeBanner');
  if (banner) banner.classList.add('hidden');
}
function dismissQuakeBanner() {
  if (_lastQuake && _lastQuake.q) _qSet(QUAKE_DISMISS_KEY, _lastQuake.q.eid);
  _hideQuakeBanner();
}
// 言語切替時にバナー内テキストを再描画（i18n patch から呼ぶ）
function refreshQuakeBanner() {
  var banner = document.getElementById('quakeBanner');
  if (_lastQuake && banner && !banner.classList.contains('hidden')) _applyQuakeBanner(_lastQuake);
}

// 新着・高震度・直近の地震のみブラウザ通知を出す（震度は現在地の値で判定）
function _maybeNotifyQuake(picked) {
  if (!('Notification' in window)) return;
  if (Notification.permission !== 'granted') return;
  if (_qGet('bosai_notif_enabled') === '0') return;          // 設定トグルOFF
  var q = picked.q;
  var minRank = (picked.gran === 'area') ? QUAKE_AREA_NOTIFY_MIN_RANK : QUAKE_LOCAL_NOTIFY_MIN_RANK;
  if (_quakeRank(picked.localMaxi) < minRank) return;
  if (_quakeAgeMin(q) > QUAKE_NOTIFY_MAX_AGE_MIN) return;
  if (_qGet(QUAKE_SEEN_KEY) === q.eid) return;                // 既に通知済み
  _qSet(QUAKE_SEEN_KEY, q.eid);

  var intensity = _quakeIntensityText(picked.localMaxi);
  var body = _tr('notifQuakeBody', '{place}／震度{intensity}／M{mag}')
    .replace('{place}', _quakePlace(q))
    .replace('{intensity}', intensity)
    .replace('{mag}', q.mag || '');
  try {
    var n = new Notification(_tr('quakeLabel', '地震情報'), { body: body, tag: 'bosai-quake' });
    n.onclick = function () { window.focus(); n.close(); };
  } catch (e) {}
}

// ========================================
// 現在地ハザードリスク自動判定
// ========================================

// サーバ経由でハザードタイルのピクセル色を解析し、AIコンテキストに注入する
window.locationHazardContext = null;

function fetchLocationHazard(overrideLat, overrideLng) {
  var lat = (overrideLat != null) ? overrideLat
          : (typeof myLat !== 'undefined' && myLat != null) ? myLat : null;
  var lng = (overrideLng != null) ? overrideLng
          : (typeof myLng !== 'undefined' && myLng != null) ? myLng : null;
  if (lat == null) return;

  var backendUrl = (typeof BACKEND_URL !== 'undefined' && BACKEND_URL) ? BACKEND_URL : '';
  if (!backendUrl) return;

  console.log('[hazard] 判定開始 lat=' + lat + ' lng=' + lng);
  fetch(backendUrl + '/api/hazard-risk?lat=' + lat + '&lng=' + lng)
    .then(function(r) { return r.ok ? r.json() : null; })
    .then(function(data) {
      if (!data) { console.warn('[hazard] サーバ応答なし'); return; }
      console.log('[hazard] 結果:', data.summary);
      window.locationHazardContext = data.summary || null;
      _applyHazardBadge(data.risks || []);
    })
    .catch(function(e) { console.error('[hazard] 通信エラー:', e); });
}

function _applyHazardBadge(risks) {
  var el = document.getElementById('hazardBadge');
  if (!el) return;
  if (!risks || risks.length === 0) {
    el.textContent = '';
    el.classList.add('hidden');
    return;
  }
  var high = risks.find(function(r) { return r.level === '最危険' || r.level === '危険'; });
  el.textContent = high
    ? '⚠ ' + high.label + '（' + high.detail + '）'
    : '⚠ ' + risks[0].label + 'に該当';
  el.classList.remove('hidden');
}


// ===== SAME_FILE_MANUAL_ENGLISH_PATCH =====
// ===== SAME_FILE_MANUAL_MULTILINGUAL_PATCH =====
// 防災マニュアルはAIで毎回翻訳せず、固定翻訳データを言語ごとに表示する。
// これにより、防災マニュアルの表示が即時化される。

var MANUAL_TRANSLATIONS = {
  en: {
    categories: {
      '警戒レベル': 'Alert Levels',
      '地震': 'Earthquake',
      '大雨・洪水': 'Heavy Rain / Flood',
      '土砂災害': 'Landslide Disaster',
      '台風': 'Typhoon',
      '火災': 'Fire',
      '避難行動': 'Evacuation Actions',
      '避難所': 'Shelter',
      '安否確認': 'Safety Confirmation',
      '応急手当': 'First Aid',
      'ライフライン': 'Utilities'
    },
    source: 'Source: Based on Cabinet Office disaster prevention information and disaster prevention guidelines',
    chunks: {
      alert_001: [
        'Alert levels for evacuation information (1–5)',
        'Level 1: Be prepared and check the latest information.\nLevel 2: Review hazard maps and evacuation routes.\nLevel 3: Older adults, people with disabilities, infants, and others who need time should start evacuating. Others should prepare.\nLevel 4: Evacuation Order. Everyone in dangerous areas should evacuate immediately.\nLevel 5: Emergency Safety Measures. A disaster has occurred or is imminent. Take the best possible action to protect life. If evacuation is impossible, move to an upper floor and a room away from cliffs.'
      ],
      eq_001: [
        'During an earthquake',
        'Protect yourself first. Get under a table and protect your head and neck. If possible, open a door to secure an exit. Stay away from windows, shelves, TVs, and objects that may fall. Do not rush outside and do not use elevators. Stay still until the shaking stops.'
      ],
      eq_002: [
        'Immediately after an earthquake',
        'After shaking stops, turn off flames, close the gas valve, and secure exits. If you smell gas, ventilate and do not touch electrical switches. Get information from TV, radio, official apps, or disaster radio. Check for injuries nearby and call 119 if emergency help is needed. Watch for aftershocks.'
      ],
      eq_003: [
        'Building check and evacuation decision after an earthquake',
        'Evacuate if walls or columns are cracked or leaning, doors or windows cannot open, the first floor is badly damaged, or liquefaction is visible. If a tsunami warning or major tsunami warning is issued, move immediately to high ground or a tsunami evacuation building. Walk whenever possible because cars can cause congestion.'
      ],
      flood_001: [
        'Initial actions during heavy rain and flooding',
        'Check rainfall, river levels, hazard maps, and evacuation information. If your home is in a flood or landslide risk area, prepare early. When Alert Level 3 or higher is issued, people who need time should evacuate. Do not wait until water rises. Complete evacuation while it is still light.'
      ],
      flood_002: [
        'Vertical evacuation during flooding',
        'If going outside is already dangerous, such as during deep flooding, nighttime, or strong winds, move to the second floor or higher. Do not climb onto the roof unless absolutely necessary. Bring water, food, hygiene items, flashlights, and a charged phone upstairs. If water reaches the first floor, turn off the breaker to prevent electric shock.'
      ],
      flood_003: [
        'Danger near rivers, channels, and underpasses',
        'Do not approach rivers, levees, irrigation channels, underpasses, underground malls, or underground parking areas during heavy rain. Water levels can rise suddenly, and roads may become hidden under water. Cars may become trapped in 30 cm or more of water. If trapped in a car, escape through a window if the door cannot open.'
      ],
      landslide_001: [
        'Warning signs of landslides',
        'Evacuate immediately if muddy water flows from a slope, cracks or steps appear on the ground, rumbling sounds occur, river water suddenly increases or stops, trees tilt, or the ground rises. If your home is in a landslide warning area, evacuate early when a heavy rain warning is issued. Even after rain stops, the ground may remain unstable for several hours.'
      ],
      typhoon_001: [
        'Preparation before a typhoon arrives',
        'Before a typhoon arrives, check its path, strength, and expected arrival time. Secure windows and shutters, bring outdoor objects inside, and check flashlights, batteries, drinking water, emergency food, and mobile batteries. Confirm evacuation destinations with a hazard map and clean drains before the typhoon approaches.'
      ],
      typhoon_002: [
        'Staying indoors during a typhoon',
        'Do not go outside during the strongest winds. Stay away from windows because flying objects may break glass. Charge your phone, collect information from TV or radio, and store water in the bathtub in case of water outage. Do not go outside during the calm eye of the typhoon because strong winds may return.'
      ],
      fire_001: [
        'Initial actions during a fire',
        'Warn people nearby loudly, call 119, and tell the address, building name, and what is burning. Try to extinguish the fire only if flames have not reached the ceiling. When escaping, stay low under smoke, cover your mouth and nose, do not use elevators, close doors behind you, and never go back inside.'
      ],
      fire_002: [
        'Gas leak and explosion risk',
        'If you smell gas, do not use fire, lighters, cigarettes, stoves, ventilation fans, or electrical switches. Open windows to ventilate. Close the gas valve only if safe. Go outside, warn neighbors, and contact the gas company or fire department from a safe place.'
      ],
      evac_001: [
        'When to evacuate',
        'Evacuation is never too early. At Alert Level 3, older adults, people with disabilities, infants, and people who need time should evacuate. At Alert Level 4, everyone in dangerous areas should evacuate immediately. Avoid nighttime evacuation and act before conditions worsen.'
      ],
      evac_002: [
        'Emergency bag items',
        'Take only what you can carry quickly: valuables, ID, cash, smartphone, charger, mobile battery, drinking water, compact food, medicine, medication record, first aid kit, masks, wet wipes, toilet paper, radio, flashlight, rain gear, glasses, hearing aids, and baby supplies if needed.'
      ],
      evac_003: [
        'Choosing horizontal or vertical evacuation',
        'Horizontal evacuation means moving to a safe shelter or other safe place. Choose it when your building is unsafe or there is tsunami or landslide risk. Vertical evacuation means moving to an upper floor when outside movement is dangerous. Avoid flooded roads, riverside routes, underpasses, and driving through water.'
      ],
      shelter_001: [
        'After arriving at a shelter',
        'Register your name, address, and family information at reception. Report medical conditions, allergies, or special needs. Use the assigned space, check toilets and supply rules, confirm charging rules, and follow staff announcements. If family members are elsewhere, use 171 or other safety confirmation services.'
      ],
      shelter_002: [
        'Shelter life and health management',
        'Help keep toilets and shared spaces clean, respect privacy, share food and water fairly, and rely on official announcements to avoid spreading rumors. Prevent economy class syndrome by moving your legs and drinking water regularly. Watch for heat illness and infections.'
      ],
      safety_001: [
        'How to confirm safety',
        'Use multiple methods because phone lines may be congested. Use Disaster Message Dial 171, Web171, LINE or social media, Google Person Finder during large disasters, and local news. Decide family meeting places and contact methods in advance.'
      ],
      firstaid_001: [
        'First aid for bleeding',
        'Press the wound firmly with a clean towel, handkerchief, or bandage for 5 to 10 minutes. If blood soaks through, place another cloth on top without removing the first one. If bleeding is heavy or does not stop, call 119. Do not remove glass or objects stuck in the wound.'
      ],
      outage_001: [
        'Power and water outages',
        'During a power outage, turn off breakers to prevent electrical fire when power returns. Avoid candles and use flashlights or LED lanterns. During a water outage, use stored drinking water, bathtub water for daily use, wet wipes, and official water supply information.'
      ]
    }
  },

  zh: {
    categories: {
      '警戒レベル': '警戒等级',
      '地震': '地震',
      '大雨・洪水': '暴雨・洪水',
      '土砂災害': '山体滑坡灾害',
      '台風': '台风',
      '火災': '火灾',
      '避難行動': '避难行动',
      '避難所': '避难所',
      '安否確認': '安否确认',
      '応急手当': '急救处理',
      'ライフライン': '生命线设施'
    },
    source: '来源：基于日本内阁府防灾信息及各类防灾指南',
    chunks: {
      alert_001: [
        '避难信息的警戒等级（1～5）',
        '警戒等级1：提高防灾意识，注意最新信息。\n警戒等级2：确认灾害地图和避难路线。\n警戒等级3：老年人、残障人士、婴幼儿等需要较长时间避难的人应开始避难，其他人也要做好准备。\n警戒等级4：避难指示。危险地区的所有人员应立即避难。\n警戒等级5：紧急确保安全。灾害已经发生或迫近，应采取保护生命的最佳行动。无法外出避难时，移动到二楼以上或远离山崖的一侧房间。'
      ],
      eq_001: [
        '地震发生时的行动',
        '感觉到摇晃时，首先保护自己。躲到桌子下面，保护头部和颈部。可以的话打开门，确保出口。远离窗户、架子、电视等可能倒下或掉落的物品。不要慌忙冲到室外，也不要使用电梯。摇晃停止前不要移动。'
      ],
      eq_002: [
        '地震停止后立即要做的事',
        '摇晃停止后，先关闭火源和煤气总阀，并确保出口。闻到煤气味时要通风，不要触碰电器开关。通过电视、广播、防灾无线等获取信息。确认周围是否有人受伤，必要时拨打119。注意余震。'
      ],
      eq_003: [
        '地震后的建筑确认与避难判断',
        '如果墙壁或柱子出现裂缝、倾斜，门窗变形无法开关，一楼严重受损，或出现液状化现象，应离开建筑物避难。即使家中看似安全，若发布海啸警报或大海啸警报，也要立即前往高地或海啸避难建筑。移动时原则上优先步行。'
      ],
      flood_001: [
        '暴雨・洪水发生时的初步行动',
        '确认降雨量、河流水位、灾害地图和避难信息。如果住所位于浸水预测区域或山体滑坡警戒区域，应尽早准备。市区町村发布警戒等级3以上信息时，应尽早行动。不要等到水位上涨后再避难，尽量在天亮时完成避难。'
      ],
      flood_002: [
        '洪水时的垂直避难',
        '如果外出已经危险，例如积水较深、夜间或暴风时，应移动到二楼以上。不要随意爬到屋顶。将水、食物、卫生用品、手电筒和已充电的手机带到楼上。若浸水达到一楼地板以上，应关闭电闸以防触电。'
      ],
      flood_003: [
        '河川、水渠和地下通道的危险',
        '暴雨时不要靠近河川、堤防、水渠、地下通道、地下街或地下停车场。水位可能突然上升，道路和沟渠可能被水覆盖。车辆在30厘米以上积水中可能无法行驶，车门也可能打不开。必要时从窗户逃生。'
      ],
      landslide_001: [
        '山体滑坡的前兆与应对',
        '如果斜坡流出浑水、出现裂缝或台阶、听到地鸣或山鸣、河流水量突然变化、树木倾斜或地面隆起，应立即远离并避难。如果家在山体滑坡警戒区域内，发布大雨警报时应尽早避难。雨停后数小时内也要继续注意。'
      ],
      typhoon_001: [
        '台风接近前的准备',
        '台风到来前，应持续确认路径、强度和预计登陆时间。固定窗户和雨户，将花盆、自行车、晾衣杆等容易被吹走的物品移入室内。检查手电筒、电池、饮用水、应急食品和移动电源。提前确认避难地点并清理排水口。'
      ],
      typhoon_002: [
        '台风和暴风时的室内待机',
        '台风最接近时不要外出。远离窗户，防止飞来物击碎玻璃。给手机充满电，通过电视和广播收集信息。为防断水，可在浴缸中储水。即使台风眼经过时暂时平静，也不要外出，因为后方强风可能再次袭来。'
      ],
      fire_001: [
        '火灾发生时的初步行动',
        '发现火灾时，要大声通知周围人员，并拨打119说明地址、建筑名称和燃烧物。只有在火焰未到达天花板时才尝试使用灭火器。逃生时姿势放低，用毛巾遮住口鼻，不要使用电梯，离开时关门，逃出后不要返回。'
      ],
      fire_002: [
        '煤气泄漏和爆炸风险应对',
        '闻到煤气味时，禁止使用打火机、火柴、香烟、炉具、换气扇和电器开关。打开窗户通风。安全时关闭煤气总阀。到室外后通知邻居，并在远离建筑物的地方联系煤气公司或消防。'
      ],
      evac_001: [
        '避难时机和判断标准',
        '避难没有“太早”。警戒等级3时，老年人、残障人士、婴幼儿等需要时间的人应开始避难。警戒等级4时，危险地区所有人员应立即避难。夜间避难危险，应在情况恶化前尽早行动。'
      ],
      evac_002: [
        '避难时携带物品',
        '只携带能够快速带走的最低限度物品：贵重物品、身份证件、现金、手机、充电器、移动电源、饮用水、简易食品、常用药、用药记录、急救用品、口罩、湿巾、卫生纸、收音机、手电筒、雨具、眼镜、助听器和婴幼儿用品等。'
      ],
      evac_003: [
        '水平避难和垂直避难的选择',
        '水平避难是前往安全避难所或其他安全地点。建筑不安全、存在海啸或山体滑坡风险时应选择水平避难。垂直避难是在外出危险时移动到建筑物上层。避难时避免积水道路、河边道路、地下通道和驾车穿越积水。'
      ],
      shelter_001: [
        '到达避难所后的行动',
        '到达避难所后，在受付处登记姓名、地址和家庭情况。如有慢性病、过敏或需要照顾事项，应主动申报。按指定位置放置行李，确认厕所、水和食物分配规则、手机充电规则，并听从工作人员和公告指示。家人分散时，使用171等安否确认服务。'
      ],
      shelter_002: [
        '避难所生活规则和健康管理',
        '积极参与厕所和公共空间清洁，尊重他人隐私，公平分配食物和水。信息应以正式公告为准，不传播谣言。为预防经济舱综合征，应活动脚踝并定期补水。注意中暑和感染症。'
      ],
      safety_001: [
        '安否确认方法',
        '灾害时通信容易拥堵，应使用多种方式确认安否。可使用灾害留言电话171、Web171、LINE或社交媒体、大规模灾害时的Google Person Finder以及地方新闻。家庭应提前决定集合地点和联系方法。'
      ],
      firstaid_001: [
        '出血时的急救处理',
        '有出血时，用干净的毛巾、手帕或绷带直接压迫伤口5到10分钟。血渗出时不要拿掉原来的布，而是在上面继续加布。出血量大或无法止血时拨打119。玻璃等异物刺入伤口时不要拔出。'
      ],
      outage_001: [
        '停电和断水时的应对',
        '停电时关闭电闸，防止恢复供电时发生电气火灾。避免使用蜡烛，使用手电筒或LED灯。断水时使用储备饮用水，生活用水可使用浴缸预存水。用湿巾和消毒液代替洗手，并确认官方供水点信息。'
      ]
    }
  },

  ko: {
    categories: {
      '警戒レベル': '경계 레벨',
      '地震': '지진',
      '大雨・洪水': '폭우・홍수',
      '土砂災害': '산사태 재해',
      '台風': '태풍',
      '火災': '화재',
      '避難行動': '대피 행동',
      '避難所': '대피소',
      '安否確認': '안부 확인',
      '応急手当': '응급처치',
      'ライフライン': '라이프라인'
    },
    source: '출처: 일본 내각부 방재 정보 및 각종 방재 가이드라인 기반',
    chunks: {
      alert_001: [
        '대피 정보의 경계 레벨（1～5）',
        '경계 레벨 1: 마음의 준비를 하고 최신 정보를 확인합니다.\n경계 레벨 2: 해저드맵과 대피 경로를 확인합니다.\n경계 레벨 3: 고령자, 장애인, 영유아 등 대피에 시간이 필요한 사람은 대피를 시작하고, 그 외 사람도 준비합니다.\n경계 레벨 4: 대피 지시. 위험한 장소에 있는 모든 사람은 즉시 대피합니다.\n경계 레벨 5: 긴급 안전 확보. 재해가 이미 발생했거나 임박한 상황입니다. 생명을 지키는 최선의 행동을 하며, 대피가 불가능하면 2층 이상이나 절벽 반대쪽 방으로 이동합니다.'
      ],
      eq_001: [
        '지진 발생 중의 행동',
        '흔들림을 느끼면 먼저 자신의 몸을 보호합니다. 책상 아래로 들어가 머리와 목을 보호하세요. 가능하면 문을 열어 출구를 확보합니다. 창문, 선반, TV 등 넘어지거나 떨어질 수 있는 물건에서 떨어지세요. 급하게 밖으로 뛰어나가지 말고 엘리베이터를 사용하지 마세요. 흔들림이 멈출 때까지 움직이지 않습니다.'
      ],
      eq_002: [
        '지진 직후의 행동',
        '흔들림이 멈추면 불을 끄고 가스 밸브를 잠그며 출구를 확보합니다. 가스 냄새가 나면 환기하고 전기 스위치를 만지지 마세요. TV, 라디오, 방재 무선 등으로 정보를 확인합니다. 주변에 부상자가 있는지 확인하고 필요하면 119에 신고하세요. 여진에 계속 주의합니다.'
      ],
      eq_003: [
        '지진 후 건물 확인과 대피 판단',
        '벽이나 기둥에 균열·기울어짐이 있거나, 문과 창문이 열리지 않거나, 1층이 심하게 손상되었거나, 액상화가 보이면 건물에서 나와 대피합니다. 자택이 안전해 보여도 쓰나미 경보나 대형 쓰나미 경보가 발령되면 즉시 고지대나 쓰나미 대피 건물로 이동합니다. 이동은 원칙적으로 도보를 우선합니다.'
      ],
      flood_001: [
        '폭우・홍수 시 초기 행동',
        '강수량, 하천 수위, 해저드맵, 대피 정보를 확인합니다. 자택이 침수 예상 구역이나 산사태 경계 구역에 있으면 일찍 준비하세요. 경계 레벨 3 이상 정보가 나오면 신속히 행동합니다. 물이 차오를 때까지 기다리지 말고 밝을 때 대피를 완료하세요.'
      ],
      flood_002: [
        '홍수 시 수직 대피',
        '밖으로 나가는 것이 이미 위험한 경우, 예를 들어 깊은 침수, 야간, 강풍 상황에서는 2층 이상으로 이동합니다. 함부로 지붕에 올라가지 마세요. 물, 식량, 위생용품, 손전등, 충전된 휴대폰을 위층으로 가져갑니다. 침수가 1층 바닥 위까지 이르면 감전 방지를 위해 차단기를 내립니다.'
      ],
      flood_003: [
        '하천・수로・언더패스의 위험',
        '폭우 시 하천, 제방, 농수로, 지하차도, 지하상가, 지하주차장에 접근하지 마세요. 물이 갑자기 불어나고 도로와 맨홀이 물에 가려질 수 있습니다. 자동차는 30cm 이상의 물에서 움직이지 못할 수 있으며 문이 열리지 않을 수 있습니다. 필요하면 창문으로 탈출합니다.'
      ],
      landslide_001: [
        '산사태 전조와 대응',
        '비탈면에서 탁한 물이 나오거나, 균열이나 단차가 생기거나, 지울림·산울림이 들리거나, 하천 수량이 갑자기 변하거나, 나무가 기울고 지면이 솟는 경우 즉시 떨어져 대피합니다. 자택이 산사태 경계 구역이면 폭우 경보가 나온 시점에 일찍 대피하세요. 비가 그친 뒤에도 몇 시간은 주의가 필요합니다.'
      ],
      typhoon_001: [
        '태풍 접근 전 준비',
        '태풍이 오기 전 진로, 강도, 예상 상륙 시간을 계속 확인합니다. 창문과 덧문을 고정하고 화분, 자전거, 빨래봉 등 날아가기 쉬운 물건을 실내로 옮깁니다. 손전등, 건전지, 식수, 비상식, 보조배터리를 확인합니다. 대피 장소를 확인하고 배수구를 청소하세요.'
      ],
      typhoon_002: [
        '태풍・강풍 시 실내 대기',
        '태풍이 가장 가까울 때는 밖에 나가지 마세요. 날아온 물체로 유리가 깨질 수 있으므로 창문 가까이에 가지 않습니다. 휴대폰을 충전하고 TV나 라디오로 정보를 확인합니다. 단수에 대비해 욕조에 물을 받아 둡니다. 태풍의 눈으로 잠시 조용해져도 다시 강풍이 올 수 있으므로 밖에 나가지 마세요.'
      ],
      fire_001: [
        '화재 발생 시 초기 행동',
        '화재를 발견하면 큰소리로 주변에 알리고 119에 신고해 주소, 건물명, 무엇이 타는지 말합니다. 불이 천장에 닿기 전이라면 소화기로 초기 진화를 시도할 수 있습니다. 대피할 때는 자세를 낮추고 입과 코를 가리며, 엘리베이터를 쓰지 않고, 문을 닫고 나가며, 밖으로 나온 뒤에는 돌아가지 않습니다.'
      ],
      fire_002: [
        '가스 누출과 폭발 위험 대응',
        '가스 냄새가 나면 라이터, 성냥, 담배, 가스레인지, 환풍기, 전기 스위치를 사용하지 마세요. 창문을 열어 환기합니다. 안전하면 가스 밸브를 잠그고 밖으로 나가 이웃에게 알린 뒤, 건물에서 떨어진 곳에서 가스회사나 소방에 연락합니다.'
      ],
      evac_001: [
        '대피 시기와 판단 기준',
        '대피는 너무 빠른 것이 아닙니다. 경계 레벨 3에서는 고령자, 장애인, 영유아 등 시간이 필요한 사람이 대피를 시작합니다. 경계 레벨 4에서는 위험한 장소의 모든 사람이 즉시 대피합니다. 야간 대피는 위험하므로 상황이 악화되기 전에 행동하세요.'
      ],
      evac_002: [
        '대피 시 휴대품',
        '빠르게 들고 나갈 수 있는 최소한의 물품만 챙기세요. 귀중품, 신분증, 현금, 스마트폰, 충전기, 보조배터리, 식수, 간단한 식품, 상비약, 약 수첩, 구급용품, 마스크, 물티슈, 휴지, 라디오, 손전등, 우비, 안경, 보청기, 영유아 용품 등이 필요합니다.'
      ],
      evac_003: [
        '수평 대피와 수직 대피 선택',
        '수평 대피는 안전한 대피소나 장소로 이동하는 것입니다. 건물이 안전하지 않거나 쓰나미·산사태 위험이 있으면 선택합니다. 수직 대피는 밖이 위험할 때 건물 위층으로 이동하는 것입니다. 침수된 도로, 하천변 길, 지하차도, 차량 이동은 피하세요.'
      ],
      shelter_001: [
        '대피소 도착 후 행동',
        '대피소에 도착하면 접수에서 이름, 주소, 가족 구성을 기록합니다. 지병, 알레르기, 배려가 필요한 사항이 있으면 신고하세요. 지정된 장소에 짐을 두고, 화장실과 물·식량 배분 규칙, 충전 규칙을 확인합니다. 안내 방송과 직원 지시에 따르고, 가족이 다른 장소에 있으면 171 등을 사용합니다.'
      ],
      shelter_002: [
        '대피소 생활 규칙과 건강 관리',
        '화장실과 공용 공간 청소에 협력하고, 다른 사람의 사생활을 존중하며, 식량과 물을 공평하게 나눕니다. 정보는 공식 안내로 확인하고 유언비어를 퍼뜨리지 마세요. 이코노미 클래스 증후군 예방을 위해 다리를 움직이고 물을 마십니다. 열사병과 감염증에도 주의합니다.'
      ],
      safety_001: [
        '안부 확인 방법',
        '재해 시 통신이 혼잡할 수 있으므로 여러 수단을 사용합니다. 재해용 전언 다이얼 171, Web171, LINE이나 SNS, 대규모 재해 시 Google Person Finder, 지역 뉴스 등을 활용하세요. 가족의 집합 장소와 연락 방법을 미리 정해 두는 것이 중요합니다.'
      ],
      firstaid_001: [
        '출혈 시 응급처치',
        '출혈이 있으면 깨끗한 수건, 손수건, 붕대를 상처에 대고 5～10분 이상 강하게 누릅니다. 피가 배어 나오면 처음 천을 떼지 말고 그 위에 덧댑니다. 출혈이 많거나 멈추지 않으면 119에 신고하세요. 유리 등 이물질이 박혀 있으면 빼지 마세요.'
      ],
      outage_001: [
        '정전・단수 시 대응',
        '정전 시 복전 후 전기 화재를 막기 위해 차단기를 내립니다. 촛불은 화재 위험이 있으므로 피하고 손전등이나 LED 랜턴을 사용하세요. 단수 시에는 비축한 식수를 사용하고, 생활용수는 욕조에 받아 둔 물을 활용합니다. 물티슈와 손 소독제로 위생을 유지하고 급수소 정보를 확인하세요.'
      ]
    }
  },

  pt: {
    categories: {
      '警戒レベル': 'Níveis de Alerta',
      '地震': 'Terremoto',
      '大雨・洪水': 'Chuva Forte / Inundação',
      '土砂災害': 'Deslizamento de Terra',
      '台風': 'Tufão',
      '火災': 'Incêndio',
      '避難行動': 'Ações de Evacuação',
      '避難所': 'Abrigo',
      '安否確認': 'Confirmação de Segurança',
      '応急手当': 'Primeiros Socorros',
      'ライフライン': 'Serviços Essenciais'
    },
    source: 'Fonte: baseado em informações de prevenção de desastres do Gabinete do Governo do Japão e diretrizes de prevenção',
    chunks: {
      alert_001: [
        'Níveis de alerta para informações de evacuação (1–5)',
        'Nível 1: Prepare-se e acompanhe as informações mais recentes.\nNível 2: Revise mapas de risco e rotas de evacuação.\nNível 3: Idosos, pessoas com deficiência, bebês e pessoas que precisam de mais tempo devem começar a evacuar. Os demais devem se preparar.\nNível 4: Ordem de evacuação. Todas as pessoas em áreas perigosas devem evacuar imediatamente.\nNível 5: Medidas urgentes de segurança. O desastre já ocorreu ou é iminente. Tome a melhor ação para proteger a vida. Se não puder sair, vá para um andar superior ou para um cômodo longe de encostas.'
      ],
      eq_001: [
        'Durante um terremoto',
        'Ao sentir o tremor, proteja-se primeiro. Entre debaixo de uma mesa e proteja a cabeça e o pescoço. Se possível, abra uma porta para garantir a saída. Afaste-se de janelas, estantes, televisores e objetos que possam cair. Não saia correndo e não use elevadores. Fique parado até o tremor parar.'
      ],
      eq_002: [
        'Logo após um terremoto',
        'Depois que o tremor parar, apague chamas, feche o registro de gás e garanta uma saída. Se sentir cheiro de gás, ventile o ambiente e não toque em interruptores. Obtenha informações pela TV, rádio ou canais oficiais. Verifique se há feridos ao redor e ligue para 119 se necessário. Cuidado com réplicas.'
      ],
      eq_003: [
        'Verificação do prédio e decisão de evacuar',
        'Evacue se houver rachaduras ou inclinação em paredes e pilares, portas ou janelas deformadas, primeiro andar muito danificado ou sinais de liquefação. Mesmo que sua casa pareça segura, se houver alerta de tsunami ou grande tsunami, vá imediatamente para um local alto ou prédio de evacuação para tsunami. Prefira caminhar.'
      ],
      flood_001: [
        'Primeiras ações durante chuva forte e inundação',
        'Verifique chuva, nível dos rios, mapas de risco e informações de evacuação. Se sua casa estiver em área prevista de inundação ou deslizamento, prepare-se cedo. Quando houver Nível de Alerta 3 ou superior, aja rapidamente. Não espere a água subir; tente concluir a evacuação ainda com luz do dia.'
      ],
      flood_002: [
        'Evacuação vertical durante inundação',
        'Se sair já for perigoso, como em inundação profunda, à noite ou com vento forte, vá para o segundo andar ou superior. Não suba no telhado sem necessidade. Leve água, comida, itens de higiene, lanterna e celular carregado para cima. Se a água atingir o primeiro andar, desligue o disjuntor para evitar choque elétrico.'
      ],
      flood_003: [
        'Riscos de rios, canais e passagens subterrâneas',
        'Durante chuva forte, não se aproxime de rios, diques, canais, passagens subterrâneas, áreas comerciais subterrâneas ou estacionamentos subterrâneos. A água pode subir rapidamente e esconder buracos ou bueiros. Carros podem parar em 30 cm ou mais de água, e as portas podem não abrir. Se necessário, saia pela janela.'
      ],
      landslide_001: [
        'Sinais de deslizamento de terra',
        'Evacue imediatamente se sair água barrenta de encostas, surgirem rachaduras ou desníveis, houver ruídos no solo ou na montanha, o volume do rio mudar subitamente, árvores inclinarem ou o chão se elevar. Se sua casa estiver em área de alerta de deslizamento, evacue cedo quando houver alerta de chuva forte. Mesmo após a chuva, continue atento por várias horas.'
      ],
      typhoon_001: [
        'Preparação antes da chegada de um tufão',
        'Antes da chegada do tufão, acompanhe a rota, intensidade e horário previsto. Prenda janelas e venezianas, leve para dentro vasos, bicicletas e varais, e confira lanternas, pilhas, água potável, alimentos de emergência e baterias portáteis. Confirme o local de evacuação e limpe ralos antes da aproximação.'
      ],
      typhoon_002: [
        'Permanecer dentro de casa durante tufão',
        'Não saia durante os ventos mais fortes. Afaste-se das janelas, pois objetos podem quebrar o vidro. Carregue o celular, acompanhe TV ou rádio e armazene água na banheira em caso de falta d’água. Mesmo que o olho do tufão traga calma temporária, não saia, pois ventos fortes podem voltar.'
      ],
      fire_001: [
        'Primeiras ações durante incêndio',
        'Ao notar um incêndio, avise as pessoas em voz alta e ligue para 119 informando endereço, nome do prédio e o que está queimando. Use extintor apenas se as chamas ainda não alcançaram o teto. Ao fugir, mantenha-se baixo por causa da fumaça, cubra boca e nariz, não use elevador, feche portas e não volte para dentro.'
      ],
      fire_002: [
        'Vazamento de gás e risco de explosão',
        'Se sentir cheiro de gás, não use isqueiros, fósforos, cigarros, fogão, ventilador/exaustor ou interruptores. Abra janelas para ventilar. Feche o registro de gás apenas se for seguro. Saia, avise vizinhos e contate a companhia de gás ou os bombeiros de um local seguro.'
      ],
      evac_001: [
        'Quando evacuar',
        'Evacuar cedo nunca é cedo demais. No Nível de Alerta 3, idosos, pessoas com deficiência, bebês e pessoas que precisam de tempo devem evacuar. No Nível 4, todos em áreas perigosas devem evacuar imediatamente. Evacuar à noite é perigoso; aja antes que a situação piore.'
      ],
      evac_002: [
        'Itens para levar na evacuação',
        'Leve apenas o mínimo que conseguir carregar rapidamente: objetos de valor, documento, dinheiro, smartphone, carregador, bateria portátil, água, alimentos compactos, remédios, caderneta de medicação, kit de primeiros socorros, máscaras, lenços umedecidos, papel higiênico, rádio, lanterna, capa de chuva, óculos, aparelho auditivo e itens para bebês se necessário.'
      ],
      evac_003: [
        'Escolha entre evacuação horizontal e vertical',
        'Evacuação horizontal é mover-se para um abrigo ou local seguro. Escolha quando o prédio não for seguro ou houver risco de tsunami ou deslizamento. Evacuação vertical é ir para andares superiores quando sair for perigoso. Evite ruas alagadas, rotas próximas a rios, passagens subterrâneas e dirigir por áreas inundadas.'
      ],
      shelter_001: [
        'Após chegar ao abrigo',
        'Ao chegar ao abrigo, registre nome, endereço e composição familiar. Informe doenças, alergias ou necessidades especiais. Coloque seus pertences no local designado, confirme regras de banheiro, água, comida e carregamento de celular, e siga orientações da equipe. Se familiares estiverem em outro local, use 171 ou serviços de confirmação de segurança.'
      ],
      shelter_002: [
        'Regras de convivência e saúde no abrigo',
        'Ajude na limpeza de banheiros e áreas comuns, respeite a privacidade, compartilhe água e comida de forma justa e confirme informações por anúncios oficiais. Evite espalhar boatos. Para prevenir trombose, mova as pernas e beba água regularmente. Cuidado com calor e infecções.'
      ],
      safety_001: [
        'Como confirmar segurança',
        'Use vários meios porque as comunicações podem ficar congestionadas: Disque Mensagem de Desastre 171, Web171, LINE ou redes sociais, Google Person Finder em grandes desastres e notícias locais. Combine previamente locais de encontro e formas de contato com a família.'
      ],
      firstaid_001: [
        'Primeiros socorros para sangramento',
        'Se houver sangramento, pressione o ferimento com toalha, lenço ou bandagem limpa por 5 a 10 minutos. Se o sangue atravessar, coloque outro pano por cima sem retirar o primeiro. Se o sangramento for intenso ou não parar, ligue para 119. Não retire vidro ou objeto preso no ferimento.'
      ],
      outage_001: [
        'Falta de energia e água',
        'Durante falta de energia, desligue o disjuntor para evitar incêndio elétrico quando a energia voltar. Evite velas e use lanternas ou lâmpadas LED. Durante falta d’água, use água potável armazenada e água da banheira para uso diário. Use lenços umedecidos e álcool para higiene e confirme informações oficiais sobre pontos de abastecimento.'
      ]
    }
  }
};

function _manualTranslatedChunk(original) {
  var lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ja';
  var pack = MANUAL_TRANSLATIONS[lang];

  if (!pack || !pack.chunks || !pack.chunks[original.id]) {
    return {
      id: original.id,
      category: original.category,
      originalCategory: original.category,
      title: original.title,
      content: original.content
    };
  }

  return {
    id: original.id,
    category: (pack.categories && pack.categories[original.category]) ? pack.categories[original.category] : original.category,
    originalCategory: original.category,
    title: pack.chunks[original.id][0],
    content: pack.chunks[original.id][1]
  };
}

function _manualSourceText() {
  var lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ja';
  var pack = MANUAL_TRANSLATIONS[lang];

  if (pack && pack.source) return pack.source;

  return (typeof MANUAL_DATA !== 'undefined' && MANUAL_DATA.source)
    ? _tr('modalManualSource', '出典：') + MANUAL_DATA.source
    : '';
}

function _buildManualHtml(displayChunks, sourceText) {
  var categories = {};
  var catOrder = [];

  displayChunks.forEach(function(chunk) {
    if (!categories[chunk.category]) {
      categories[chunk.category] = [];
      catOrder.push(chunk.category);
    }
    categories[chunk.category].push(chunk);
  });

  var html = '<div class="manual-cats">';

  catOrder.forEach(function(cat, idx) {
    var first = categories[cat][0];
    var originalCat = first.originalCategory || cat;
    var icon = _MANUAL_ICONS[originalCat] || _MANUAL_ICONS[cat] || '📄';
    var open = (idx === 0);

    html += '<div class="manual-cat">' +
      '<button class="manual-cat-btn" onclick="toggleManualCat(this)">' +
        '<span>' + icon + ' ' + _esc(cat) + '</span>' +
        '<span class="manual-arrow">' + (open ? '▲' : '▼') + '</span>' +
      '</button>' +
      '<div class="manual-cat-body"' + (open ? '' : ' style="display:none"') + '>';

    categories[cat].forEach(function(chunk) {
      html += '<div class="manual-item">' +
        '<div class="manual-item-title">' + _esc(chunk.title) + '</div>' +
        '<div class="manual-item-content">' + _esc(chunk.content).replace(/\n/g, '<br>') + '</div>' +
      '</div>';
    });

    html += '</div></div>';
  });

  html += '</div>';

  if (sourceText) {
    html += '<p class="info-src" style="padding:8px 16px;">' + _esc(sourceText) + '</p>';
  }

  return html;
}

showManual = function() {
  if (typeof MANUAL_DATA === 'undefined' || !MANUAL_DATA.chunks) {
    openModal(
      _tr('modalManualTitle', _tr('featManual', '防災マニュアル')),
      '<p class="info-none">' + _tr('modalManualError', 'データを読み込めませんでした。') + '</p>',
      true
    );
    return;
  }

  var chunks = MANUAL_DATA.chunks.map(function(original) {
    return _manualTranslatedChunk(original);
  });

  var html = _buildManualHtml(chunks, _manualSourceText());

  openModal(
    _tr('modalManualTitle', _tr('featManual', '防災マニュアル')),
    html,
    true
  );
};