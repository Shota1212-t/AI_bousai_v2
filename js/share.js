// ===== 現在地共有（リンク方式・サーバ保存なし）=====
// 送信側：現在地を URL に埋め込んだ共有リンクを生成し、Web Share API / コピーで送る。
// 受信側：?share=lat,lng&t=... 付きで開くと、地図に「共有された位置」ピンを表示する。
// 位置情報はリンクの中にのみ存在し、サーバには保存されない。

var sharedLocMarker = null;

function _shareT(key, fallback) {
  if (typeof t === 'function') {
    var v = t(key);
    if (v !== key) return v;
  }
  return fallback;
}
function _shareFmt(template, vars) {
  return String(template).replace(/\{(\w+)\}/g, function (_, k) {
    return vars[k] !== undefined ? vars[k] : '';
  });
}
function _shareTimeStr(ts) {
  var d = ts ? new Date(ts) : new Date();
  if (isNaN(d.getTime())) d = new Date();
  return (d.getMonth() + 1) + '/' + d.getDate() + ' ' +
    String(d.getHours()).padStart(2, '0') + ':' + String(d.getMinutes()).padStart(2, '0');
}

// 共有テキストを組み立てる（Google Mapsリンク＋アプリリンク）
function buildShareLocationText(lat, lng, ts) {
  var gmaps = 'https://maps.google.com/?q=' + lat.toFixed(6) + ',' + lng.toFixed(6);
  var lines = [
    _shareFmt(_shareT('shareMsgHeader', '【現在地共有】{time}時点'), { time: _shareTimeStr(ts) }),
    _shareT('shareMsgMap', '地図で見る：') + gmaps
  ];
  // http(s) 配信時のみ、アプリで開くリンクも付ける（file:// では共有先で開けないため省略）
  if (location.protocol === 'http:' || location.protocol === 'https:') {
    var appUrl = location.origin + location.pathname +
      '?share=' + lat.toFixed(6) + ',' + lng.toFixed(6) + '&t=' + (ts || Date.now());
    lines.push(_shareT('shareMsgApp', 'アプリで見る：') + appUrl);
  }
  return lines.join('\n');
}

// 「現在地を共有」ボタン：Web Share API（スマホ）→ 失敗時はクリップボードにコピー
function shareLocation() {
  var lat = (typeof myLat !== 'undefined' && myLat != null) ? myLat : null;
  var lng = (typeof myLng !== 'undefined' && myLng != null) ? myLng : null;
  if (lat == null) {
    if (typeof showToast === 'function') showToast(_shareT('toastShareNoLoc', '現在地がまだ取得できていません'));
    return;
  }
  var text = buildShareLocationText(lat, lng, Date.now());

  if (navigator.share) {
    navigator.share({ text: text }).catch(function (e) {
      // ユーザーが共有シートを閉じただけの場合（AbortError）は何もしない
      if (e && e.name !== 'AbortError') _copyShareText(text);
    });
  } else {
    _copyShareText(text);
  }
}

function _copyShareText(text) {
  function done() {
    if (typeof showToast === 'function') showToast(_shareT('toastShareCopied', '位置共有リンクをコピーしました。LINEやSMSに貼り付けて送ってください'));
  }
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(done).catch(function () { _copyShareFallback(text); done(); });
  } else {
    _copyShareFallback(text);
    done();
  }
}
function _copyShareFallback(text) {
  var ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  try { document.execCommand('copy'); } catch (e) {}
  document.body.removeChild(ta);
}

// ===== 受信側：URLの ?share= を解析して地図にピンを表示 =====

function parseSharedLocation() {
  var params;
  try { params = new URLSearchParams(location.search); } catch (e) { return null; }
  var share = params.get('share');
  if (!share) return null;
  var parts = share.split(',');
  if (parts.length !== 2) return null;
  var lat = parseFloat(parts[0]), lng = parseFloat(parts[1]);
  if (isNaN(lat) || isNaN(lng)) return null;
  if (lat < -90 || lat > 90 || lng < -180 || lng > 180) return null;
  var ts = parseInt(params.get('t'), 10);
  return { lat: lat, lng: lng, ts: isNaN(ts) ? null : ts };
}

// 地図の準備を待って共有ピンを表示（leafletMap は drawMap() 後に生成される）
function showSharedLocationIfAny() {
  var shared = parseSharedLocation();
  if (!shared) return;

  var tries = 0;
  (function waitMap() {
    if (typeof leafletMap !== 'undefined' && leafletMap) {
      _placeSharedMarker(shared);
    } else if (tries++ < 30) {
      setTimeout(waitMap, 500);
    }
  })();
}

function _placeSharedMarker(shared) {
  if (sharedLocMarker) { leafletMap.removeLayer(sharedLocMarker); sharedLocMarker = null; }

  var icon = L.divIcon({
    className: '',
    html: '<div style="background:#7C3AED;color:#fff;border-radius:50%;' +
          'width:32px;height:32px;display:flex;align-items:center;' +
          'justify-content:center;font-size:15px;' +
          'border:3px solid #fff;box-shadow:0 2px 8px rgba(124,58,237,.5);">👤</div>',
    iconSize: [32, 32],
    iconAnchor: [16, 16]
  });

  var label = _shareT('sharedPinLabel', '共有された位置');
  var timeLine = shared.ts
    ? _shareFmt(_shareT('sharedPinTime', '{time}時点'), { time: _shareTimeStr(shared.ts) })
    : '';
  var routeUrl = 'https://www.google.com/maps/dir/?api=1&destination=' + shared.lat + ',' + shared.lng;
  var popupHtml =
    '<div style="min-width:150px">' +
      '<div style="font-weight:700;margin-bottom:2px">👤 ' + label + '</div>' +
      (timeLine ? '<div style="font-size:11px;color:#6B7280;margin-bottom:6px">' + timeLine + '</div>' : '') +
      '<a href="' + routeUrl + '" target="_blank" rel="noopener" ' +
        'style="display:inline-block;padding:5px 10px;background:#7C3AED;color:#fff;' +
        'border-radius:6px;font-size:12px;text-decoration:none;font-weight:600">' +
        _shareT('routeBtn', '🗺 経路を表示') + '</a>' +
    '</div>';

  sharedLocMarker = L.marker([shared.lat, shared.lng], { icon: icon })
    .addTo(leafletMap)
    .bindPopup(popupHtml);

  // 自分の位置が分かっていれば両方入る画角、無ければ共有位置へ移動
  if (typeof userMarker !== 'undefined' && userMarker) {
    var group = L.featureGroup([userMarker, sharedLocMarker]);
    leafletMap.fitBounds(group.getBounds().pad(0.25));
  } else {
    leafletMap.setView([shared.lat, shared.lng], 14);
  }
  sharedLocMarker.openPopup();

  if (typeof showToast === 'function') showToast(_shareT('toastSharedLocShown', '共有された位置を地図に表示しました'));
}
