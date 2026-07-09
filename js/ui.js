function navGo(p) {
  document.querySelectorAll('[id^="page-"]').forEach(function(e) {
    e.classList.add('hidden');
  });

  var pageEl = document.getElementById('page-' + p);
  if (pageEl) pageEl.classList.remove('hidden');

  document.querySelectorAll('.navitem').forEach(function(n) {
    n.classList.remove('active');
  });

  var navEl = document.getElementById('nav-' + p);
  if (navEl) navEl.classList.add('active');

  window.scrollTo(0, 0);

  if (p === 'chat') setTimeout(drawMap, 50);
  if (p === 'hazard') setTimeout(drawHazardPageMap, 50);
}

function showToast(m) {
  var toastEl = document.getElementById('toast');
  if (!toastEl) return;
  toastEl.textContent = m;
  toastEl.classList.add('show');
  clearTimeout(window._tt);
  window._tt = setTimeout(function() {
    toastEl.classList.remove('show');
  }, 1800);
}

function toggleSwitch(el) {
  el.classList.toggle('on');
  el.classList.toggle('off');
}

function _saveSetting(key, value) {
  try { localStorage.setItem(key, value); } catch (e) {}
}

function _loadSetting(key) {
  try { return localStorage.getItem(key); } catch (e) { return null; }
}

function toggleDarkMode(el) {
  toggleSwitch(el);
  var on = el.classList.contains('on');
  document.body.classList.toggle('dark', on);
  _saveSetting('darkMode', on ? '1' : '0');
  showToast(t(on ? 'toastDarkOn' : 'toastDarkOff'));
}

function setFontSize(scale) {
  scale = parseFloat(scale) || 1;
  document.documentElement.style.setProperty('--fs', scale);
  _saveSetting('fontScale', scale);

  var slider = document.getElementById('fontSlider');
  if (slider) slider.value = scale;

  showToast(t('toastFontSize').replace('{size}', Math.round(scale * 100)));
}

function toggleSpeech(el) {
  toggleSwitch(el);
  var on = el.classList.contains('on');

  if (typeof setSpeechEnabled === 'function') {
    setSpeechEnabled(on);
  }

  _saveSetting('speechEnabled', on ? '1' : '0');
  showToast(t(on ? 'toastSpeechOn' : 'toastSpeechOff'));
}

// 通知トグル：ブラウザの通知許可を取得し、地震などの通知ON/OFFを保存
function toggleNotif(el) {
  if (!('Notification' in window)) {
    showToast(t('toastNotifUnsupported'));
    return;
  }
  var turningOn = el.classList.contains('off');
  if (turningOn) {
    Notification.requestPermission().then(function (perm) {
      if (perm === 'granted') {
        _setToggle('toggleNotif', true);
        _saveSetting('bosai_notif_enabled', '1');
        showToast(t('toastNotifOn'));
      } else {
        _setToggle('toggleNotif', false);        // 許可されなければ OFF のまま
        _saveSetting('bosai_notif_enabled', '0');
        showToast(t('toastNotifDenied'));
      }
    });
  } else {
    _setToggle('toggleNotif', false);
    _saveSetting('bosai_notif_enabled', '0');
    showToast(t('toastNotifOff'));
  }
}

function applySavedSettings() {
  if (_loadSetting('darkMode') === '1') {
    document.body.classList.add('dark');
    _setToggle('toggleDark', true);
  }

  var savedScale = parseFloat(_loadSetting('fontScale')) ||
    (_loadSetting('fontLevel') === 'xl' ? 1.3 :
     _loadSetting('fontLevel') === 'lg' ? 1.15 :
     _loadSetting('largeText') === '1' ? 1.15 : 1);

  if (savedScale !== 1) {
    document.documentElement.style.setProperty('--fs', savedScale);
  }

  var fontSlider = document.getElementById('fontSlider');
  if (fontSlider) fontSlider.value = savedScale;

  if (_loadSetting('speechEnabled') === '0') {
    if (typeof setSpeechEnabled === 'function') setSpeechEnabled(false);
    _setToggle('toggleSpeech', false);
  }

  if (typeof updateSpeechReadButtonUI === 'function') {
    updateSpeechReadButtonUI();
  }
  // 通知トグル：保存値＋実際の許可状態を反映（許可が無ければ OFF 表示）
  var supported = ('Notification' in window);
  var notifOn = supported &&
    Notification.permission === 'granted' &&
    _loadSetting('bosai_notif_enabled') !== '0';
  _setToggle('toggleNotif', notifOn);

  var savedLang = _loadSetting('bosai_lang');
  if (savedLang && savedLang !== 'ja' && typeof applyLang === 'function') {
    applyLang(savedLang);

    var reverseMap = { ja: '日本語', en: 'English', zh: '中文', ko: '한국어', pt: 'Português' };
    var targetName = reverseMap[savedLang];

    document.querySelectorAll('.lang-row').forEach(function(r) {
      var name = r.querySelector('.lang-name');
      if (!name) return;

      var isTarget = name.textContent === targetName;
      r.classList.toggle('sel', isTarget);

      var check = r.querySelector('.lang-check');
      if (!check) return;

      check.classList.toggle('checked', isTarget);
      check.innerHTML = isTarget
        ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>'
        : '';
    });
  }
}

function _setToggle(id, on) {
  var el = document.getElementById(id);
  if (!el) return;
  el.classList.toggle('on', on);
  el.classList.toggle('off', !on);
}

var LANG_CODE_MAP = {
  '日本語': 'ja',
  'English': 'en',
  '中文': 'zh',
  '한국어': 'ko',
  'Português': 'pt'
};

function selectLang(el) {
  document.querySelectorAll('.lang-row').forEach(function(r) {
    r.classList.remove('sel');
    var check = r.querySelector('.lang-check');
    if (!check) return;
    check.classList.remove('checked');
    check.innerHTML = '';
  });

  el.classList.add('sel');
  var selectedCheck = el.querySelector('.lang-check');
  if (selectedCheck) {
    selectedCheck.classList.add('checked');
    selectedCheck.innerHTML =
      '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="3"><polyline points="20 6 9 17 4 12"/></svg>';
  }

  var langName = el.querySelector('.lang-name').textContent;
  var code = LANG_CODE_MAP[langName] || 'ja';
  _saveSetting('bosai_lang', code);
  if (typeof applyLang === 'function') applyLang(code);

  refreshDynamicLanguageContent();

  showToast(langName + t('toastLangSwitch'));
}

// ===== ヘッダー言語ドロップダウン =====
function toggleLangDropdown(event) {
  event.stopPropagation();
  var dd = document.getElementById('langDropdown');
  if (!dd) return;
  var isHidden = dd.classList.contains('hidden');
  dd.classList.toggle('hidden', !isHidden);
  if (isHidden) {
    var code = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ja';
    dd.querySelectorAll('.lang-drop-item').forEach(function(item) {
      item.classList.toggle('active', item.dataset.code === code);
    });
  }
}

function _closeLangDropdown() {
  var dd = document.getElementById('langDropdown');
  if (dd) dd.classList.add('hidden');
}

function selectLangByCode(code) {
  var reverseMap = { ja: '日本語', en: 'English', zh: '中文', ko: '한국어', pt: 'Português' };
  var targetName = reverseMap[code] || '日本語';
  var row = null;
  document.querySelectorAll('.lang-row').forEach(function(r) {
    var n = r.querySelector('.lang-name');
    if (n && n.textContent === targetName) row = r;
  });
  if (row) selectLang(row);
  _closeLangDropdown();
}

document.addEventListener('click', function(e) {
  if (e.target && e.target.closest && e.target.closest('.lang-sel-wrap')) return;
  _closeLangDropdown();
});

var currentLat = null;
var currentLng = null;
var PLACE_TRANSLATION_CACHE = {};

function refreshDynamicLanguageContent() {
  var lat = null;
  var lng = null;

  // ui.js 側で保持している現在地を優先
  if (currentLat != null && currentLng != null) {
    lat = currentLat;
    lng = currentLng;
  }

  // map.js 側の現在地も使う
  if ((lat == null || lng == null) && typeof myLat !== 'undefined' && typeof myLng !== 'undefined') {
    if (myLat != null && myLng != null) {
      lat = myLat;
      lng = myLng;
    }
  }

  if (lat != null && lng != null) {
    // 現在地名を言語変更後に即再取得・再翻訳
    if (typeof showAddress === 'function') {
      showAddress(lat, lng);
    }

    // 避難所名も言語変更後に即再取得・再翻訳
    if (typeof loadShelters === 'function') {
      loadShelters(lat, lng);
    }
  } else {
    // 位置がまだ取れていない場合でも、既存リストの徒歩表記だけは再描画
    if (typeof shownShelters !== 'undefined' && typeof renderShelterList === 'function') {
      renderShelterList(shownShelters || []);
    }

    if (typeof renderHomeShelters === 'function') {
      renderHomeShelters();
    }
  }

  if (typeof setShelterCount === 'function' && typeof shownShelters !== 'undefined') {
    setShelterCount(String((shownShelters || []).length) + (t('shelterCountSuffix') || ''));
  }
}

function translatePlaceName(text, targetLang) {
  if (!text) return Promise.resolve('');
  if (!targetLang || targetLang === 'ja') return Promise.resolve(text);

  var cacheKey = targetLang + '::' + text;
  if (PLACE_TRANSLATION_CACHE[cacheKey]) {
    return Promise.resolve(PLACE_TRANSLATION_CACHE[cacheKey]);
  }

  if (typeof BACKEND_URL === 'undefined' || !BACKEND_URL) {
    return Promise.resolve(text);
  }

  return fetch(BACKEND_URL.replace(/\/$/, '') + '/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: text, targetLang: targetLang })
  })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      var translated = (data && data.translated) ? data.translated : text;
      PLACE_TRANSLATION_CACHE[cacheKey] = translated;
      return translated;
    })
    .catch(function() {
      return text;
    });
}

function translatePlaceNames(texts, targetLang) {
  texts = (texts || []).map(function(t) { return String(t || ''); });
  if (!texts.length) return Promise.resolve([]);
  if (!targetLang || targetLang === 'ja') return Promise.resolve(texts.slice());

  var uncachedTexts = [];
  var uncachedIdx = [];
  var result = texts.map(function(text, i) {
    var cacheKey = targetLang + '::' + text;
    if (PLACE_TRANSLATION_CACHE[cacheKey]) return PLACE_TRANSLATION_CACHE[cacheKey];
    if (!text) return '';
    uncachedTexts.push(text);
    uncachedIdx.push(i);
    return null;
  });

  if (!uncachedTexts.length) return Promise.resolve(result);

  if (typeof BACKEND_URL === 'undefined' || !BACKEND_URL) {
    uncachedIdx.forEach(function(idx, i) { result[idx] = uncachedTexts[i]; });
    return Promise.resolve(result);
  }

  return fetch(BACKEND_URL.replace(/\/$/, '') + '/api/translate-batch', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ texts: uncachedTexts, targetLang: targetLang })
  })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      var arr = (data && Array.isArray(data.translated)) ? data.translated : uncachedTexts;
      uncachedIdx.forEach(function(idx, i) {
        var translated = arr[i] || uncachedTexts[i];
        result[idx] = translated;
        PLACE_TRANSLATION_CACHE[targetLang + '::' + uncachedTexts[i]] = translated;
      });
      return result;
    })
    .catch(function() {
      uncachedIdx.forEach(function(idx, i) { result[idx] = uncachedTexts[i]; });
      return result;
    });
}

function _applyLocDisplay(address) {
  var svgPin = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1E5BC0" stroke-width="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg> ';

  document.querySelectorAll('.loc-name').forEach(function(el) {
    el.innerHTML = svgPin + address;
  });

  var homeVal = document.querySelector('.home-status .status-val');
  if (homeVal) homeVal.textContent = address;

  var n = new Date();
  var timeStr = String(n.getHours()).padStart(2, '0') + ':' + String(n.getMinutes()).padStart(2, '0');
  var updateEl = document.getElementById('updateTime');
  if (updateEl) updateEl.textContent = t('labelUpdatedAt') + timeStr;
}

function showAddress(lat, lng) {
  currentLat = lat;
  currentLng = lng;

  var lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ja';
  var nominatimLang = (typeof t === 'function') ? t('nominatimLang') : lang;

  var fallback =
    (t('labelLat') || '緯度 ') +
    lat.toFixed(4) +
    (t('labelLng') || ' / 経度 ') +
    lng.toFixed(4);

  if (lang === 'ja') {
    fetch('https://mreversegeocoder.gsi.go.jp/reverse-geocoder/LonLatToAddress?lat=' + lat + '&lon=' + lng)
      .then(function(res) { return res.json(); })
      .then(function(data) {
        var muniName = data.results ? data.results.lv01Nm : null;
        _applyLocDisplay(muniName || fallback);
      })
      .catch(function() {
        _applyLocDisplay(fallback);
      });
    return;
  }

  fetch(
    'https://nominatim.openstreetmap.org/reverse?lat=' +
    lat +
    '&lon=' +
    lng +
    '&format=json&zoom=18&accept-language=' +
    encodeURIComponent(nominatimLang)
  )
    .then(function(res) { return res.json(); })
    .then(function(data) {
      var address = '';
      if (data.address && data.address.road) {
        address = data.address.road;
      }
      if (!address && data.address) {
        address =
          data.address.suburb ||
          data.address.neighbourhood ||
          data.address.town ||
          data.address.city ||
          data.address.village ||
          '';
      }
      if (!address && data.name) {
        address = data.name;
      }
      if (!address && data.display_name) {
        address = data.display_name.split(',').slice(0, 2).join(', ');
      }
      address = address || fallback;

      translatePlaceName(address, lang).then(function(translated) {
        _applyLocDisplay(translated || address);
      });
    })
    .catch(function() {
      _applyLocDisplay(fallback);
    });
}

function updateLoc() {
  var lat = window.myLat;
  var lng = window.myLng;
  if (lat == null) {
    showToast(t('toastLocating'));
    return;
  }
  showAddress(lat, lng);
  if (typeof loadShelters === 'function') loadShelters(lat, lng);
  if (typeof recenterToUser === 'function') recenterToUser();
  showToast(t('toastLocUpdated'));
}
