// ===== 地図ロジック（Leaflet.js）=====

// GPSが取れなかったときのデフォルト座標（鳩山町）
var DEMO_LAT = 35.9845;
var DEMO_LNG = 139.3230;

// --- 状態を覚えておく変数 ---
var leafletMap     = null;
var userMarker     = null;
var shelterMarkers = [];
var watchId        = null;

var hazardLayers = {};
var activeHazards = {};
var hazardPageMap = null;
var hazardPageUserMarker = null;
var hazardPageLayers = {};
var hazardPageLayerControl = null;


var searchRadius   = 3000;
var disasterFilter = 'all';

var allShelters    = [];
var shownShelters  = [];

var myLat = null;
var myLng = null;
var lastSearchLat = null;
var lastSearchLng = null;
var lastListLat   = null;
var lastListLng   = null;
var manualLocationOverride = false;

var DISASTER_KEYS = [
  { key: '洪水',     type: '洪水' },
  { key: '内水',     type: '洪水' },
  { key: '土石流',   type: '土砂災害' },
  { key: '崖',       type: '土砂災害' },
  { key: '地滑り',   type: '土砂災害' },
  { key: '地すべり', type: '土砂災害' },
  { key: '土砂',     type: '土砂災害' },
  { key: '高潮',     type: '高潮' },
  { key: '地震',     type: '地震' },
  { key: '津波',     type: '津波' },
  { key: '火事',     type: '大規模火災' },
  { key: '火災',     type: '大規模火災' }
];

// ========================================
// HAZARD_LAYER_DEFS — label は i18n キーで管理
// ========================================
var HAZARD_LAYER_DEFS = {
  flood: {
    labelKey: 'hazardLabelFlood',
    emoji: '🌊',
    url: 'https://disaportaldata.gsi.go.jp/raster/01_flood_l2_shinsuishin_data/{z}/{x}/{y}.png',
    opacity: 0.55
  },
  floodDuration: {
    labelKey: 'hazardLabelFloodDuration',
    emoji: '⏱',
    url: 'https://disaportaldata.gsi.go.jp/raster/01_flood_l2_keizoku_data/{z}/{x}/{y}.png',
    opacity: 0.45
  },
  stormSurge: {
    labelKey: 'hazardLabelStormSurge',
    emoji: '🌪',
    url: 'https://disaportaldata.gsi.go.jp/raster/03_hightide_l2_shinsuishin_data/{z}/{x}/{y}.png',
    opacity: 0.55
  },
  tsunami: {
    labelKey: 'hazardLabelTsunami',
    emoji: '🌊',
    url: 'https://disaportaldata.gsi.go.jp/raster/04_tsunami_newlegend_data/{z}/{x}/{y}.png',
    opacity: 0.55
  },
  landslideDebris: {
    labelKey: 'hazardLabelDebris',
    emoji: '⛰',
    url: 'https://disaportaldata.gsi.go.jp/raster/05_dosekiryukeikaikuiki/{z}/{x}/{y}.png',
    opacity: 0.6
  },
  landslideSteep: {
    labelKey: 'hazardLabelSteep',
    emoji: '⛰',
    url: 'https://disaportaldata.gsi.go.jp/raster/05_kyukeishakeikaikuiki/{z}/{x}/{y}.png',
    opacity: 0.6
  },
  landslideSlide: {
    labelKey: 'hazardLabelSlide',
    emoji: '⛰',
    url: 'https://disaportaldata.gsi.go.jp/raster/05_jisuberikeikaikuiki/{z}/{x}/{y}.png',
    opacity: 0.6
  }
};

// ========================================
// ハザードページ地図
// ========================================

function drawHazardPageMap() {
  var container = document.getElementById('hazardMapCanvas');
  if (!container) return;

  var lat = (myLat != null) ? myLat : DEMO_LAT;
  var lng = (myLng != null) ? myLng : DEMO_LNG;

  if (hazardPageMap) {
    hazardPageMap.invalidateSize();
    hazardPageMap.setView([lat, lng], 14);
    updateHazardPageUserMarker(lat, lng);
    return;
  }

  hazardPageMap = L.map('hazardMapCanvas', { zoomControl: true }).setView([lat, lng], 14);

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(hazardPageMap);

  hazardPageLayers = {};

  Object.keys(HAZARD_LAYER_DEFS).forEach(function(key) {
    var def = HAZARD_LAYER_DEFS[key];

    hazardPageLayers[key] = L.tileLayer(def.url, {
      attribution: t('hazardLabelFlood'),
      opacity: def.opacity || 0.55,
      maxNativeZoom: 17,
      maxZoom: 19
    });
  });

  updateHazardPageUserMarker(lat, lng);

  // 初期表示は洪水だけONにする
  hazardPageLayers.flood.addTo(hazardPageMap);
  markHazardPageButtonActive('flood', true);
}

function updateHazardPageUserMarker(lat, lng) {
  if (!hazardPageMap) return;

  if (!hazardPageUserMarker) {
    var myIcon = L.divIcon({
      className: '',
      html: '<div style="background:#DC2626;color:#fff;border-radius:50%;' +
            'width:34px;height:34px;display:flex;align-items:center;' +
            'justify-content:center;font-size:12px;font-weight:700;' +
            'border:3px solid #fff;box-shadow:0 2px 8px rgba(220,38,38,.5);">' +
            t('currentLocMarker') + '</div>',
      iconSize: [34, 34],
      iconAnchor: [17, 17]
    });

    hazardPageUserMarker = L.marker([lat, lng], { icon: myIcon })
      .addTo(hazardPageMap)
      .bindPopup(t('currentLocLabel'));
  } else {
    hazardPageUserMarker.setLatLng([lat, lng]);
  }
}

function toggleHazardPageLayer(type, btn) {
  if (!hazardPageMap || !hazardPageLayers[type]) return;

  var layer = hazardPageLayers[type];
  var label = t(HAZARD_LAYER_DEFS[type].labelKey);

  if (hazardPageMap.hasLayer(layer)) {
    hazardPageMap.removeLayer(layer);
    markHazardPageButtonActive(type, false);
    showToast(t('toastHazardHide').replace('{label}', label));
  } else {
    layer.addTo(hazardPageMap);
    markHazardPageButtonActive(type, true);
    showToast(t('toastHazardShow').replace('{label}', label));
  }
}

function toggleHazardPageAll() {
  if (!hazardPageMap) return;

  var keys = Object.keys(hazardPageLayers);
  var hasHidden = keys.some(function(key) {
    return !hazardPageMap.hasLayer(hazardPageLayers[key]);
  });

  keys.forEach(function(key) {
    var layer = hazardPageLayers[key];

    if (hasHidden) {
      if (!hazardPageMap.hasLayer(layer)) layer.addTo(hazardPageMap);
      markHazardPageButtonActive(key, true);
    } else {
      if (hazardPageMap.hasLayer(layer)) hazardPageMap.removeLayer(layer);
      markHazardPageButtonActive(key, false);
    }
  });

  showToast(hasHidden ? t('toastHazardShowAll') : t('toastHazardHideAll'));
}

function recenterHazardPageMap() {
  var lat = (myLat != null) ? myLat : DEMO_LAT;
  var lng = (myLng != null) ? myLng : DEMO_LNG;

  if (!hazardPageMap) {
    drawHazardPageMap();
    return;
  }

  hazardPageMap.setView([lat, lng], 15);
  updateHazardPageUserMarker(lat, lng);
  showToast(t('toastRecenter'));
}

function markHazardPageButtonActive(type, active) {
  var buttons = document.querySelectorAll('.hazard-page-btn');
  buttons.forEach(function(btn) {
    var onclick = btn.getAttribute('onclick') || '';
    if (onclick.indexOf("'" + type + "'") !== -1 || onclick.indexOf('"' + type + '"') !== -1) {
      btn.classList.toggle('active', active);
    }
  });
}

// ========================================
// 距離の計算
// ========================================

function calcDistance(lat1, lng1, lat2, lng2) {
  var R = 6371000;
  var toRad = function(d) { return d * Math.PI / 180; };
  var dLat = toRad(lat2 - lat1);
  var dLng = toRad(lng2 - lng1);
  var a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
          Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function formatDist(meters) {
  var km = (meters / 1000).toFixed(1);
  var minutes = Math.max(1, Math.round(meters / 80));
  return t('walkFormat').replace('{min}', minutes).replace('{km}', km);
}

// ========================================
// 地図の初期化
// ========================================

function drawMap() {
  var container = document.getElementById('mapCanvas');
  if (!container) return;

  if (leafletMap) {
    leafletMap.invalidateSize();
    return;
  }

  leafletMap = L.map('mapCanvas', { zoomControl: true }).setView([DEMO_LAT, DEMO_LNG], 14);

  // ベースレイヤー（OpenStreetMap）
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(leafletMap);

  createHazardLayersForMainMap();

  addLocateButton();
  addHazardToggleButton();

  if (myLat != null) setUserLocation(myLat, myLng);
  if (allShelters.length > 0) applyFilterAndRender(true);
}

function initApp() {
  startLocationWatch();
}

// ========================================
// ① 現在地に戻るボタン
// ========================================

function createHazardLayersForMainMap() {
  hazardLayers = {};
  activeHazards = {};

  Object.keys(HAZARD_LAYER_DEFS).forEach(function(key) {
    var def = HAZARD_LAYER_DEFS[key];

    hazardLayers[key] = L.tileLayer(def.url, {
      attribution: 'Hazard Map Portal',
      opacity: def.opacity || 0.55,
      maxNativeZoom: 17,
      maxZoom: 19
    });

    activeHazards[key] = false;
  });
}


function addLocateButton() {
  var LocateControl = L.Control.extend({
    options: { position: 'topright' },
    onAdd: function() {
      var btn = L.DomUtil.create('button', 'locate-btn');
      btn.innerHTML = '📍';
      btn.title = t('tooltipLocateBtn');
      L.DomEvent.on(btn, 'click', function(e) {
        L.DomEvent.stop(e);
        recenterToUser();
      });
      return btn;
    }
  });
  leafletMap.addControl(new LocateControl());
}

// ハザードレイヤー切り替えボタン（地図上）
function addHazardToggleButton() {
  var HazardControl = L.Control.extend({
    options: { position: 'topright' },
    onAdd: function() {
      var box = L.DomUtil.create('div', 'hazard-control-box');

      var allBtn = L.DomUtil.create('button', 'locate-btn', box);
      allBtn.innerHTML = '⚠';
      allBtn.title = t('tooltipHazardToggle');

      L.DomEvent.on(allBtn, 'click', function(e) {
        L.DomEvent.stop(e);
        toggleAllHazards();
      });

      return box;
    }
  });

  leafletMap.addControl(new HazardControl());
}

// ハザードレイヤーの表示/非表示を切り替える
function toggleHazardLayer(type) {
  if (!leafletMap || !hazardLayers) return;

  type = type || 'flood';

  var layer = hazardLayers[type];
  if (!layer) {
    showToast(t('toastHazardUnset'));
    return;
  }

  var def = HAZARD_LAYER_DEFS[type];
  var label = t(def.labelKey);

  activeHazards[type] = !activeHazards[type];

  if (activeHazards[type]) {
    layer.addTo(leafletMap);
    showToast(t('toastHazardShowMain').replace('{emoji}', def.emoji).replace('{label}', label));
  } else {
    leafletMap.removeLayer(layer);
    showToast(t('toastHazardHide').replace('{label}', label));
  }
}

function toggleAllHazards() {
  if (!leafletMap) return;

  var keys = Object.keys(HAZARD_LAYER_DEFS);
  var hasHidden = keys.some(function(key) {
    return !activeHazards[key];
  });

  keys.forEach(function(key) {
    var layer = hazardLayers[key];
    if (!layer) return;

    if (hasHidden) {
      if (!activeHazards[key]) {
        layer.addTo(leafletMap);
        activeHazards[key] = true;
      }
    } else {
      if (activeHazards[key]) {
        leafletMap.removeLayer(layer);
        activeHazards[key] = false;
      }
    }
  });

  showToast(hasHidden ? t('toastHazardShowAll') : t('toastHazardHideAll'));
}

function recenterToUser() {
  if (myLat != null && myLng != null) {
    leafletMap.setView([myLat, myLng], 15);
  } else {
    showToast(t('toastNoGps'));
  }
}

// ========================================
// ⑤ リアルタイム位置追跡（安定版）
// ========================================

function startLocationWatch() {
  if (!navigator.geolocation) {
    _useDemo(t('toastNoGpsDemo'));
    return;
  }

  // まず getCurrentPosition で即座に1回取得（watchPosition より速い）
  navigator.geolocation.getCurrentPosition(
    function(pos) {
      onLocationUpdate(pos.coords.latitude, pos.coords.longitude);
    },
    function(err) {
      // 初回取得に失敗したらデモ座標
      if (myLat == null) _useDemo(t('toastNoGpsFail'));
    },
    { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
  );

  // watchPosition で継続追跡（キャッシュなし）
  watchId = navigator.geolocation.watchPosition(
    function(pos) {
      onLocationUpdate(pos.coords.latitude, pos.coords.longitude);
    },
    function(err) {
      console.warn('位置追跡エラー:', err.code, err.message);
    },
    { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
  );
}

function _useDemo(msg) {
  myLat = DEMO_LAT;
  myLng = DEMO_LNG;
  setUserLocation(myLat, myLng);
  if (typeof showAddress === 'function') showAddress(myLat, myLng);
  loadShelters(myLat, myLng);
  showToast(msg);
}

function onLocationUpdate(lat, lng) {
  if (manualLocationOverride) return;
  var firstTime = (myLat == null);
  myLat = lat;
  myLng = lng;

  setUserLocation(lat, lng);

  if (hazardPageMap) {
    updateHazardPageUserMarker(lat, lng);
  }

  if (firstTime) {
    if (leafletMap) {
      // 共有された位置ピンがある場合は、自分と相手の両方が入る画角にする
      if (typeof sharedLocMarker !== 'undefined' && sharedLocMarker && userMarker) {
        leafletMap.fitBounds(L.featureGroup([userMarker, sharedLocMarker]).getBounds().pad(0.25));
      } else {
        leafletMap.setView([lat, lng], 15);
      }
    }
    if (typeof showAddress === 'function') showAddress(lat, lng);
    loadShelters(lat, lng);
    // 位置確定時（起動直後・GPS復帰時）は災害情報も即時更新
    if (typeof refreshDisasterInfoForLocation === 'function') refreshDisasterInfoForLocation();
  } else if (allShelters.length > 0) {
    var moved = calcDistance(lat, lng, lastListLat || lat, lastListLng || lng);
    if (moved > 30) {
      if (typeof showAddress === 'function') showAddress(lat, lng);
      recalcDistances();
      applyFilterAndRender(false);
      // 移動に追従して地震情報も更新（10秒スロットルつき）
      if (typeof checkEarthquake === 'function') checkEarthquake();
    }
  }
}

function setUserLocation(lat, lng) {
  if (!leafletMap) return;

  if (!userMarker) {
    var myIcon = L.divIcon({
      className: '',
      html: '<div style="background:#DC2626;color:#fff;border-radius:50%;' +
            'width:32px;height:32px;display:flex;align-items:center;' +
            'justify-content:center;font-size:12px;font-weight:700;' +
            'border:3px solid #fff;box-shadow:0 2px 8px rgba(220,38,38,.5);">' +
            t('currentLocMarker') + '</div>',
      iconSize: [32, 32],
      iconAnchor: [16, 16]
    });
    userMarker = L.marker([lat, lng], { icon: myIcon })
      .addTo(leafletMap)
      .bindPopup(t('currentLocLabel'));
  } else {
    userMarker.setLatLng([lat, lng]);
  }
}

// ========================================
// 避難所の取得（バックエンド → ローカル → Overpass → デモ）
// ========================================

function loadShelters(lat, lng) {
  lastSearchLat = lat;
  lastSearchLng = lng;
  setShelterCount(t('shelterCountSearching'));

  if (hasBackend()) {
    fetchBackendShelters(lat, lng);
  } else {
    fetchOverpassShelters(lat, lng);
  }
}

function hasBackend() {
  return (typeof BACKEND_URL !== 'undefined' && BACKEND_URL !== '');
}

function fetchBackendShelters(lat, lng) {
  var url = BACKEND_URL.replace(/\/$/, '') +
            '/api/shelters?lat=' + lat + '&lng=' + lng + '&radius=' + searchRadius;

  fetch(url)
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (data.shelters && data.shelters.length > 0) {
        processShelters(data.shelters);
      } else {
        setShelterCount('0' + t('shelterCountSuffix'));
        showToast(t('toastNoShelterRegion'));
        processShelters([]);
      }
    })
    .catch(function(err) {
      console.warn('バックエンド接続失敗、Overpass APIにフォールバック:', err);
      fetchOverpassShelters(lat, lng);
    });
}

function fetchOverpassShelters(lat, lng) {
  var r = searchRadius;
  var query =
    '[out:json][timeout:15];(' +
    'node["emergency"="assembly_point"](around:' + r + ',' + lat + ',' + lng + ');' +
    'node["amenity"="shelter"](around:' + r + ',' + lat + ',' + lng + ');' +
    'way["emergency"="assembly_point"](around:' + r + ',' + lat + ',' + lng + ');' +
    ');out center;';

  fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: query })
    .then(function(res) { return res.json(); })
    .then(function(data) {
      if (!data.elements || data.elements.length === 0) {
        showToast(t('toastNoShelterArea'));
        processShelters([]);
        return;
      }
      var shelters = data.elements.map(function(el, i) {
        var elat = el.lat || (el.center && el.center.lat);
        var elng = el.lon || (el.center && el.center.lon);
        return {
          name:      (el.tags && el.tags.name) || (t('shelterLabel') + (i + 1)),
          lat:       elat,
          lng:       elng,
          disasters: []
        };
      }).filter(function(s) { return s.lat && s.lng; });
      processShelters(shelters);
    })
    .catch(function(err) {
      console.warn('Overpass API失敗:', err);
      showToast(t('toastShelterFail'));
      processShelters([]);
    });
}

function pickName(props) {
  if (!props) return null;
  var candidates = ['name', '名称', '施設名', '施設・場所名', '場所名', 'common_name'];
  for (var i = 0; i < candidates.length; i++) {
    if (props[candidates[i]]) return props[candidates[i]];
  }
  return null;
}

function parseDisasters(props) {
  var result = [];
  if (!props) return result;
  Object.keys(props).forEach(function(k) {
    var v = props[k];
    var ok = (v === true || v === 1 || v === '1' ||
              v === '○' || v === '◯' || v === '対応' || v === 'true');
    if (!ok) return;
    DISASTER_KEYS.forEach(function(d) {
      if (k.indexOf(d.key) !== -1 && result.indexOf(d.type) === -1) {
        result.push(d.type);
      }
    });
  });
  return result;
}

// ========================================
// 距離の計算と並び替え
// ========================================

function processShelters(shelters) {
  var lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ja';

  // 元の名前を保持する
  shelters.forEach(function(s) {
    if (!s.originalName) {
      s.originalName = s.name;
    }
  });

  // 日本語以外なら、まとめて1回のリクエストで翻訳する（高速化）
  if (lang !== 'ja' && typeof translatePlaceNames === 'function') {
    var names = shelters.map(function(s) { return s.originalName || s.name || ''; });

    translatePlaceNames(names, lang).then(function(translatedNames) {
      shelters.forEach(function(s, i) {
        s.name = translatedNames[i] || s.originalName || s.name;
      });
      allShelters = shelters.slice();
      recalcDistances();
      applyFilterAndRender(true);
    }).catch(function() {
      allShelters = shelters.slice();
      recalcDistances();
      applyFilterAndRender(true);
    });

    return;
  }

  // 日本語に戻したときは元名へ戻す
  shelters.forEach(function(s) {
    if (s.originalName) {
      s.name = s.originalName;
    }
  });

  allShelters = shelters.slice();
  recalcDistances();
  applyFilterAndRender(true);
}

function recalcDistances() {
  var baseLat = (myLat != null) ? myLat : lastSearchLat;
  var baseLng = (myLng != null) ? myLng : lastSearchLng;
  lastListLat = baseLat;
  lastListLng = baseLng;

  allShelters.forEach(function(s) {
    s.meters = calcDistance(baseLat, baseLng, s.lat, s.lng);
    s.dist   = formatDist(s.meters);
  });
  allShelters.sort(function(a, b) { return a.meters - b.meters; });
  allShelters.forEach(function(s, i) { s.nearest = (i === 0); });
}

// ========================================
// フィルター + 地図 + リストの更新
// ========================================

function applyFilterAndRender(fit) {
  var filtered = allShelters.filter(function(s) {
    if (disasterFilter === 'all') return true;
    if (!s.disasters || s.disasters.length === 0) return true;
    return s.disasters.indexOf(disasterFilter) !== -1;
  });

  shownShelters = filtered;
  showShelterMarkers(filtered, fit);
  renderShelterList(filtered);
  renderHomeShelters();
  setShelterCount(filtered.length + t('shelterCountSuffix'));
}

function showShelterMarkers(shelters, fit) {
  if (!leafletMap) return;

  shelterMarkers.forEach(function(m) { leafletMap.removeLayer(m); });
  shelterMarkers = [];

  shelters.forEach(function(s, i) {
    var color = s.nearest ? '#1E5BC0' : '#5F6B7C';
    var label = s.nearest ? t('nearestMarkerLabel') : String(i + 1);

    var icon = L.divIcon({
      className: '',
      html: '<div style="background:' + color + ';color:#fff;border-radius:50%;' +
            'width:28px;height:28px;display:flex;align-items:center;' +
            'justify-content:center;font-size:11px;font-weight:700;' +
            'border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,.3);">' +
            label + '</div>',
      iconSize: [28, 28],
      iconAnchor: [14, 14]
    });

    var marker = L.marker([s.lat, s.lng], { icon: icon }).addTo(leafletMap);
    shelterMarkers.push(marker);
    s._marker = marker;

    // 名前が「避難所N」形式（デフォルト）の場合は逆ジオコーディングで解決する
    var shelterPattern = new RegExp('^' + t('shelterLabel') + '\\d+$');
    if (shelterPattern.test(s.name)) {
      getPlaceName(s.lat, s.lng, i, function(resolvedName) {
        s.name = resolvedName;
        setPopup(marker, resolvedName, s.lat, s.lng, (typeof s.meters === 'number' ? formatDist(s.meters) : s.dist));
        updateListName(i, resolvedName);
        renderHomeShelters();
      });
    } else {
      setPopup(marker, s.name, s.lat, s.lng, (typeof s.meters === 'number' ? formatDist(s.meters) : s.dist));
    }
  });

  if (fit && userMarker && shelterMarkers.length > 0) {
    var group = L.featureGroup([userMarker].concat(shelterMarkers));
    leafletMap.fitBounds(group.getBounds().pad(0.2));
  }
}

// ========================================
// 避難所リストパネル
// ========================================

function renderShelterList(shelters) {
  var list = document.getElementById('shelterList');
  if (!list) return;

  if (shelters.length === 0) {
    list.innerHTML = '<div class="sh-empty">' + t('shelterEmpty') + '</div>';
    return;
  }

  var html = '';
  shelters.forEach(function(s, i) {
    var badge = s.nearest
      ? '<span class="sh-nearest">' + t('nearestBadge') + '</span>'
      : '';
    var tags = (s.disasters && s.disasters.length > 0)
      ? '<div class="sh-tags">' + s.disasters.map(function(d) {
          return '<span class="sh-tag">' + d + '</span>';
        }).join('') + '</div>'
      : '';

    html +=
      '<div class="sh-item" id="shItem' + i + '" onclick="focusShelter(' + i + ')">' +
        '<div class="sh-ic">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1E5BC0" stroke-width="2">' +
          '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>' +
          '<polyline points="9 22 9 12 15 12 15 22"/></svg>' +
        '</div>' +
        '<div class="sh-info">' +
          '<div class="sh-nm">' + s.name + '</div>' +
          '<div class="sh-dist">' + ((typeof s.meters === 'number') ? formatDist(s.meters) : (s.dist || '')) + '</div>' +
          tags +
        '</div>' +
        badge +
      '</div>';
  });
  list.innerHTML = html;
}

function updateListName(index, name) {
  var item = document.getElementById('shItem' + index);
  if (item) {
    var nm = item.querySelector('.sh-nm');
    if (nm) nm.textContent = name;
  }
}

function setShelterCount(text) {
  var el = document.getElementById('shelterCount');
  if (el) el.textContent = text;
}

function focusShelter(index) {
  var s = shownShelters[index];
  if (!s || !s._marker) return;

  leafletMap.setView([s.lat, s.lng], 16);
  s._marker.openPopup();

  document.querySelectorAll('.sh-item').forEach(function(el) {
    el.classList.remove('active');
  });
  var item = document.getElementById('shItem' + index);
  if (item) item.classList.add('active');
}

function renderHomeShelters() {
  var nearestEl = document.getElementById('homeNearest');
  var list      = document.getElementById('homeShelterList');

  if (allShelters.length === 0) {
    if (list) list.innerHTML = '<div class="sh-empty">' + t('shelterSearching') + '</div>';
    return;
  }

  if (nearestEl) nearestEl.textContent = allShelters[0].name;

  if (!list) return;
  var top    = allShelters.slice(0, 3);
  var colors = ['#1E5BC0', '#185FA5', '#854F0B'];
  var html   = '';
  top.forEach(function(s, i) {
    var badge = s.nearest ? '<div class="sh-badge">' + t('nearestBadge') + '</div>' : '';
    html +=
      '<div class="sh-row" onclick="showShelterOnMap(' + s.lat + ',' + s.lng + ')">' +
        '<div class="sh-dot" style="background:' + colors[i] + '">' + (i + 1) + '</div>' +
        '<div style="flex:1">' +
          '<div class="sh-name">' + s.name + '</div>' +
          '<div class="sh-sub">' + (typeof s.meters === 'number' ? formatDist(s.meters) : (s.dist || '')) + '</div>' +
        '</div>' + badge +
      '</div>';
  });
  list.innerHTML = html;
}

function showShelterOnMap(lat, lng) {
  navGo('chat');
  setTimeout(function() {
    if (!leafletMap) return;
    leafletMap.setView([lat, lng], 16);
    shownShelters.forEach(function(s, i) {
      if (s.lat === lat && s.lng === lng) focusShelter(i);
    });
  }, 250);
}

function openNearestShelterRoute() {
  if (!shownShelters || shownShelters.length === 0) {
    showToast(t('shelterWaiting'));
    return;
  }
  var s = shownShelters[0];
  var url = 'https://www.google.com/maps/dir/?api=1' +
            '&destination=' + s.lat + ',' + s.lng +
            '&travelmode=walking';
  window.open(url, '_blank');
}

// ========================================
// 検索範囲 / 災害種別 ボタン
// ========================================

function setSearchRadius(radius, btn) {
  searchRadius = radius;

  if (btn) {
    btn.parentNode.querySelectorAll('.radius-btn').forEach(function(b) {
      b.classList.remove('active');
    });
    btn.classList.add('active');
  }

  var lat = (myLat != null) ? myLat : lastSearchLat;
  var lng = (myLng != null) ? myLng : lastSearchLng;
  if (lat != null) {
    showToast(t('toastRadiusChange').replace('{km}', (radius / 1000)));
    loadShelters(lat, lng);
  }
}

function setDisasterFilter(type, btn) {
  disasterFilter = type;

  if (btn) {
    btn.parentNode.querySelectorAll('.filter-btn').forEach(function(b) {
      b.classList.remove('active');
    });
    btn.classList.add('active');
  }

  applyFilterAndRender(true);
}

// ========================================
// ポップアップ・場所名の取得
// ========================================

function setPopup(marker, name, lat, lng, dist) {
  var mapsUrl = 'https://www.google.com/maps/dir/?api=1' +
                '&destination=' + lat + ',' + lng +
                '&travelmode=walking';
  var html =
    '<b style="font-size:13px;">' + name + '</b>' +
    (dist ? '<br><span style="font-size:11px;color:#5F6B7C;">' + dist + '</span>' : '') +
    '<br><a href="' + mapsUrl + '" target="_blank" ' +
    'style="display:inline-block;margin-top:8px;padding:5px 12px;background:#1E5BC0;color:#fff;border-radius:6px;font-size:11px;font-weight:600;text-decoration:none;">' +
    t('routeBtn') + '</a>';
  marker.bindPopup(html);
}

function getPlaceName(lat, lng, index, callback) {
  var lang = t('nominatimLang');
  setTimeout(function() {
    fetch(
      'https://nominatim.openstreetmap.org/reverse' +
      '?lat=' + lat + '&lon=' + lng +
      '&format=json&zoom=18&accept-language=' + lang
    )
    .then(function(res) { return res.json(); })
    .then(function(data) {
      var name = data.name ||
                 (data.address && (
                   data.address.building ||
                   data.address.amenity ||
                   data.address.leisure ||
                   data.address.school ||
                   data.address.community_centre
                 )) ||
                 (data.display_name ? data.display_name.split(',')[0] : '');
      var resolved = name || (t('shelterLabel') + (index + 1));
      var currentLang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ja';
      if (currentLang !== 'ja' && typeof translatePlaceName === 'function') {
        translatePlaceName(resolved, currentLang)
          .then(function(translated) {
            callback(translated || resolved);
          })
          .catch(function() {
            callback(resolved);
          });
      } else {
        callback(resolved);
      }
    })
    .catch(function() {
      var fallbackName = t('shelterLabel') + (index + 1);
      var currentLang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ja';
      if (currentLang !== 'ja' && typeof translatePlaceName === 'function') {
        translatePlaceName(fallbackName, currentLang)
          .then(function(translated) {
            callback(translated || fallbackName);
          })
          .catch(function() {
            callback(fallbackName);
          });
      } else {
        callback(fallbackName);
      }
    });
  }, index * 1100);
}


// ===== SAME_FILE_SHELTER_TAG_TRANSLATION_PATCH =====
function translateDisasterLabelForDisplay(value) {
  var keyMap = {
    '洪水': 'filterFlood',
    '地震': 'filterQuake',
    '土砂災害': 'filterSand',
    '土砂': 'filterSand',
    '津波': 'filterTsunami',
    '高潮': 'filterStorm'
  };
  var extra = {
    '大規模火災': { ja: '大規模火災', en: 'Large Fire', zh: '大规模火灾', ko: '대형 화재', pt: 'Grande Incêndio' },
    '火災': { ja: '火災', en: 'Fire', zh: '火灾', ko: '화재', pt: 'Incêndio' },
    '火山現象': { ja: '火山現象', en: 'Volcanic Activity', zh: '火山现象', ko: '화산 현상', pt: 'Atividade Vulcânica' }
  };
  if (keyMap[value] && typeof t === 'function') return t(keyMap[value]);
  if (extra[value]) {
    var lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ja';
    return extra[value][lang] || extra[value].en;
  }
  return value;
}

renderShelterList = function(shelters) {
  var list = document.getElementById('shelterList');
  if (!list) return;
  if (shelters.length === 0) {
    list.innerHTML = '<div class="sh-empty">' + t('shelterEmpty') + '</div>';
    return;
  }
  var html = '';
  shelters.forEach(function(s, i) {
    var badge = s.nearest ? '<span class="sh-nearest">' + t('nearestBadge') + '</span>' : '';
    var tags = (s.disasters && s.disasters.length > 0)
      ? '<div class="sh-tags">' + s.disasters.map(function(d) {
          return '<span class="sh-tag">' + translateDisasterLabelForDisplay(d) + '</span>';
        }).join('') + '</div>'
      : '';
    html +=
      '<div class="sh-item" id="shItem' + i + '" onclick="focusShelter(' + i + ')">' +
        '<div class="sh-ic">' +
          '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1E5BC0" stroke-width="2">' +
          '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>' +
          '<polyline points="9 22 9 12 15 12 15 22"/></svg>' +
        '</div>' +
        '<div class="sh-info">' +
          '<div class="sh-nm">' + s.name + '</div>' +
          '<div class="sh-dist">' + (typeof s.meters === 'number' ? formatDist(s.meters) : (s.dist || '')) + '</div>' +
          tags +
        '</div>' +
        badge +
      '</div>';
  });
  list.innerHTML = html;
};
