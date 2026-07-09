// ===== 避難所API 中継サーバ（Node.js・追加ライブラリ不要）=====
//
// 役割:
//   ブラウザ(フロント)から呼ばれ、国土交通省「不動産情報ライブラリ」の
//   XGT001（指定緊急避難場所）APIを "サーバ側" で取得して返す中継役。
//   → APIキーをブラウザに出さずに済む（CORSも回避できる）。
//
// 起動方法（PowerShell）:
//   $env:REINFOLIB_API_KEY="（自分のAPIキー）"
//   node server.js
//
// そのうえでフロントの js/config.js に
//   var BACKEND_URL = 'http://localhost:3001';
// を設定すると、全国の避難所がAPI経由で使えるようになる。
//
// ※ APIキーは必ず環境変数で渡すこと。コードやGitHubには絶対に書かない。

var http = require('http');
var fs   = require('fs');
var path = require('path');
var zlib = require('zlib');

var STATIC_ROOT = __dirname; // index.html と同じディレクトリを公開

var MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png':  'image/png',
  '.ico':  'image/x-icon'
};

var PORT     = process.env.PORT || 3001;
var API_KEY  = process.env.REINFOLIB_API_KEY || '';
var ENDPOINT = 'https://www.reinfolib.mlit.go.jp/ex-api/external/XGT001';

var OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
var OPENAI_MODEL   = process.env.OPENAI_MODEL || 'gpt-5.4-nano';

var loggedSample = false; // 初回だけ実データの項目名をログするためのフラグ

var TRANSLATE_CACHE = {};
function normalizeTargetLang(lang) {
  var map = {
    ja: 'Japanese',
    en: 'English',
    zh: 'Simplified Chinese',
    ko: 'Korean',
    pt: 'Portuguese (Brazil)'
  };
  return map[lang] || 'English';
}

async function translatePlaceNameWithOpenAI(text, targetLang) {
  if (!text) return '';
  if (!targetLang || targetLang === 'ja') return text;
  if (!OPENAI_API_KEY) return text;

  var cacheKey = targetLang + '::' + text;
  if (TRANSLATE_CACHE[cacheKey]) return TRANSLATE_CACHE[cacheKey];

  var targetLabel = normalizeTargetLang(targetLang);

  var systemPrompt = [
  'You are a translation engine for a disaster-prevention web app.',
  'Translate the given text into the target language.',
  'Return only the translated text.',
  'Do not add explanations, bullets, quotes, or extra comments.',
  'Preserve line breaks when possible.',
  'For place names, facility names, shelter names, street names, public facility names, and campus/building names, use a natural official-style rendering if possible.',
  'If a proper noun has no natural translated form, use readable transliteration rather than inventing a false name.'
  ].join(' ');

  var userPrompt =
    'Target language: ' + targetLabel + '\n' +
    'Source text: ' + text;

  var aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + OPENAI_API_KEY
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_completion_tokens: 120
    })
  });

  var aiText = await aiRes.text();
  if (!aiRes.ok) {
    throw new Error('translate batch api error: ' + aiRes.status + ' ' + aiText);
  }

  var data = JSON.parse(aiText);
  var result = (data.choices && data.choices[0] && data.choices[0].message)
    ? String(data.choices[0].message.content || '').trim()
    : text;

  result = result.replace(/^["'""'']+|["'""'']+$/g, '').trim();
  if (!result) result = text;

  TRANSLATE_CACHE[cacheKey] = result;
  return result;
}

async function translateBatchWithOpenAI(texts, targetLang) {
  if (!texts || !texts.length) return [];
  if (!targetLang || targetLang === 'ja') return texts.slice();
  if (!OPENAI_API_KEY) return texts.slice();

  var targetLabel = normalizeTargetLang(targetLang);

  // キャッシュ済みのものは除いて、未翻訳分だけAPIに送る
  var toTranslate = [];
  var toTranslateIdx = [];
  var result = texts.map(function(text, i) {
    var cacheKey = targetLang + '::' + text;
    if (TRANSLATE_CACHE[cacheKey] !== undefined) return TRANSLATE_CACHE[cacheKey];
    toTranslate.push(text);
    toTranslateIdx.push(i);
    return null;
  });

  if (!toTranslate.length) return result;

  var systemPrompt = [
    'You are a translation engine for a disaster-prevention web app.',
    'You will receive a JSON array of strings.',
    'Translate every string into the target language, in the same order.',
    'Return ONLY a valid JSON array of strings, same length as input, no extra text, no code fences.',
    'Preserve line breaks inside each string using \\n.',
    'For place names, facility names, shelter names, street names, public facility names, and campus/building names, use a natural official-style rendering if possible.',
    'If a proper noun has no natural translated form, use readable transliteration rather than inventing a false name.'
  ].join(' ');

  var userPrompt =
    'Target language: ' + targetLabel + '\n' +
    'Source JSON array: ' + JSON.stringify(toTranslate);

  var aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + OPENAI_API_KEY
    },
    body: JSON.stringify({
      model: OPENAI_MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      max_completion_tokens: 4000
    })
  });

  var aiText = await aiRes.text();
  if (!aiRes.ok) {
    throw new Error('translate batch api error: ' + aiRes.status + ' ' + aiText);
  }

  var data = JSON.parse(aiText);
  var raw = (data.choices && data.choices[0] && data.choices[0].message)
    ? String(data.choices[0].message.content || '').trim()
    : '';
  raw = raw.replace(/^```json\s*|^```\s*|```$/g, '').trim();

  var arr;
  try { arr = JSON.parse(raw); } catch (e) { arr = null; }

  if (!Array.isArray(arr) || arr.length !== toTranslate.length) {
    // パース失敗時は元テキストのまま返す（フォールバック）
    toTranslate.forEach(function(text, i) { result[toTranslateIdx[i]] = text; });
    return result;
  }

  toTranslate.forEach(function(text, i) {
    var idx = toTranslateIdx[i];
    var translated = String(arr[i] || text).trim();
    TRANSLATE_CACHE[targetLang + '::' + text] = translated;
    result[idx] = translated;
  });

  return result;
}

// 半径に応じてズームレベルを選択（タイルが多くなりすぎないように）
// zoom15: ~1.2km/tile、zoom14: ~2.4km/tile、zoom13: ~4.8km/tile
function chooseZoom(radius) {
  if (radius <= 1500) return 15;
  if (radius <= 4000) return 14;
  return 13;
}

// ---- タイル計算（緯度経度 → XYZタイル番号）----
function lng2tileX(lng, z) { return Math.floor((lng + 180) / 360 * Math.pow(2, z)); }
function lat2tileY(lat, z) {
  var r = lat * Math.PI / 180;
  return Math.floor((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2 * Math.pow(2, z));
}

// ---- 2地点間の距離(m)（ハバーサインの公式）----
function haversine(lat1, lng1, lat2, lng2) {
  var R = 6371000, toRad = function(d){ return d * Math.PI / 180; };
  var dLat = toRad(lat2 - lat1), dLng = toRad(lng2 - lng1);
  var a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ---- XGT001 APIの実際のプロパティキー（英語スネークケース）から値を読み取る ----
function pickName(p) {
  if (!p) return '避難所';
  // XGT001 の正式キー
  if (p['facility_name_ja']) return String(p['facility_name_ja']);
  if (p['facility_name_en']) return String(p['facility_name_en']);
  // 旧形式・他形式への後方互換
  var fallback = ['施設・場所名', '名称', '施設名', '場所名', 'name'];
  for (var i = 0; i < fallback.length; i++) if (p[fallback[i]]) return String(p[fallback[i]]);
  return '避難所';
}
function pickAddr(p) {
  if (!p) return '';
  if (p['address_ja']) return String(p['address_ja']);
  var fallback = ['住所', '所在地', 'address'];
  for (var i = 0; i < fallback.length; i++) if (p[fallback[i]]) return String(p[fallback[i]]);
  return '';
}
// XGT001 のフラグ列 → 表示用の災害種別名
var FLAG_MAP = [
  ['flood_flag',              '洪水'],
  ['inland_flooding_flag',    '洪水'],
  ['tsunami_flag',            '津波'],
  ['earthquake_flag',         '地震'],
  ['large_fire_flag',         '大規模火災'],
  ['landslide_flag',          '土砂災害'],
  ['high_tide_flag',          '高潮'],
  ['volcanic_phenomenon_flag','火山現象']
];
function parseDisasters(p) {
  var r = [];
  if (!p) return r;
  FLAG_MAP.forEach(function(pair) {
    if (p[pair[0]] === true && r.indexOf(pair[1]) === -1) r.push(pair[1]);
  });
  // 旧形式（○/1 フラグ）への後方互換
  if (r.length === 0) {
    var OLD = [
      ['洪水','洪水'],['内水','洪水'],['津波','津波'],['地震','地震'],
      ['高潮','高潮'],['土砂','土砂災害'],['火災','大規模火災']
    ];
    for (var k in p) {
      var v = p[k];
      if (v === 1 || v === '1' || v === '○' || v === '◯' || v === true) {
        OLD.forEach(function(d){ if (k.indexOf(d[0]) !== -1 && r.indexOf(d[1]) === -1) r.push(d[1]); });
      }
    }
  }
  return r;
}

// ---- XGT001 タイルを1枚取得 ----
async function fetchTile(z, x, y) {
  var url = ENDPOINT + '?response_format=geojson&z=' + z + '&x=' + x + '&y=' + y;
  try {
    var r = await fetch(url, { headers: { 'Ocp-Apim-Subscription-Key': API_KEY } });
    if (!r.ok) { console.warn('  XGT001 取得失敗 z' + z + '/' + x + '/' + y + ' status=' + r.status); return { features: [] }; }
    return await r.json();
  } catch (e) {
    console.warn('  XGT001 通信エラー:', e.message);
    return { features: [] };
  }
}

// ---- 指定地点周辺の避難所を取得 ----
async function getShelters(lat, lng, radius) {
  var ZOOM = chooseZoom(radius);

  // 検索半径をカバーするタイルの範囲を求める
  var dLat = radius / 111000;
  var dLng = radius / (111000 * Math.cos(lat * Math.PI / 180));
  var xMin = lng2tileX(lng - dLng, ZOOM), xMax = lng2tileX(lng + dLng, ZOOM);
  var yMin = lat2tileY(lat + dLat, ZOOM), yMax = lat2tileY(lat - dLat, ZOOM);

  var tiles = [];
  for (var x = xMin; x <= xMax; x++)
    for (var y = yMin; y <= yMax; y++)
      tiles.push([x, y]);

  console.log('検索: lat=' + lat + ' lng=' + lng + ' radius=' + radius + 'm zoom=' + ZOOM + ' → タイル' + tiles.length + '枚取得');

  var results = await Promise.all(tiles.map(function(t){ return fetchTile(ZOOM, t[0], t[1]); }));

  var feats = [];
  results.forEach(function(g){ if (g && g.features) feats = feats.concat(g.features); });

  // 初回だけ、実際のプロパティ項目名をログ（項目名の確認・デバッグ用）
  if (feats.length && !loggedSample) {
    loggedSample = true;
    console.log('XGT001 サンプル properties:', JSON.stringify(feats[0].properties));
  }

  // 形式変換＋半径フィルタ＋重複除去
  var seen = {}, out = [];
  feats.forEach(function(f){
    if (!f.geometry || !f.geometry.coordinates) return;
    var clng = f.geometry.coordinates[0], clat = f.geometry.coordinates[1];
    var d = haversine(lat, lng, clat, clng);
    if (d > radius) return;
    var key = clat.toFixed(5) + ',' + clng.toFixed(5);
    if (seen[key]) return;
    seen[key] = true;
    out.push({
      name:      pickName(f.properties),
      lat:       clat,
      lng:       clng,
      disasters: parseDisasters(f.properties),
      address:   pickAddr(f.properties),
      _d:        d
    });
  });
  out.sort(function(a, b){ return a._d - b._d; });          // 近い順
  out = out.slice(0, 50).map(function(s){ delete s._d; return s; }); // 最大50件
  return out;
}

function readJsonBody(req) {
  return new Promise(function(resolve, reject) {
    var body = '';

    req.on('data', function(chunk) {
      body += chunk;
      if (body.length > 1000000) {
        reject(new Error('Request body too large'));
      }
    });

    req.on('end', function() {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });

    req.on('error', reject);
  });
}


// ===== ハザードタイル解析（PNG デコーダ + リスク判定）=====

// PNG の1ピクセルを取得（Node 標準 zlib のみ使用、外部ライブラリ不要）
function readPngPixel(buf, targetPx, targetPy) {
  if (!buf || buf.length < 8) return null;
  if (buf[0] !== 0x89 || buf[1] !== 0x50 || buf[2] !== 0x4E || buf[3] !== 0x47) return null;

  var pos = 8, width = 0, height = 0, bpp = 4, idatBufs = [];
  while (pos + 12 <= buf.length) {
    var chunkLen  = buf.readUInt32BE(pos);     pos += 4;
    var chunkType = buf.toString('ascii', pos, pos + 4); pos += 4;
    var chunkData = buf.slice(pos, pos + chunkLen); pos += chunkLen + 4; // +4 = CRC
    if (chunkType === 'IHDR') {
      width  = chunkData.readUInt32BE(0);
      height = chunkData.readUInt32BE(4);
      var ct = chunkData[9]; // 2=RGB, 6=RGBA
      bpp = ct === 6 ? 4 : ct === 2 ? 3 : 1;
    } else if (chunkType === 'IDAT') {
      idatBufs.push(chunkData);
    } else if (chunkType === 'IEND') { break; }
  }
  if (!width || !height || !idatBufs.length) return null;
  if (targetPx < 0 || targetPx >= width || targetPy < 0 || targetPy >= height) return null;

  var rawData;
  try { rawData = zlib.inflateSync(Buffer.concat(idatBufs)); } catch (e) { return null; }

  var stride = width * bpp;
  var prevRow = Buffer.alloc(stride, 0);
  var curRow  = Buffer.alloc(stride, 0);

  for (var y = 0; y <= targetPy; y++) {
    var rowBase = y * (stride + 1);
    var fType   = rawData[rowBase];
    for (var x = 0; x < stride; x++) {
      var f = rawData[rowBase + 1 + x];
      var a = x >= bpp ? curRow[x - bpp] : 0;
      var b = prevRow[x];
      var c = x >= bpp ? prevRow[x - bpp] : 0;
      switch (fType) {
        case 1: curRow[x] = (f + a) & 0xFF; break;
        case 2: curRow[x] = (f + b) & 0xFF; break;
        case 3: curRow[x] = (f + Math.floor((a + b) / 2)) & 0xFF; break;
        case 4: {
          var p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
          curRow[x] = (f + (pa <= pb && pa <= pc ? a : pb <= pc ? b : c)) & 0xFF; break;
        }
        default: curRow[x] = f;
      }
    }
    if (y < targetPy) { curRow.copy(prevRow); curRow.fill(0); }
  }

  var o = targetPx * bpp;
  return { r: curRow[o], g: curRow[o + 1], b: curRow[o + 2], a: bpp >= 4 ? curRow[o + 3] : 255 };
}

// 洪水タイルの色 → 浸水深度クラス（国土交通省ハザードマップポータル準拠色）
function classifyFloodColor(r, g, b, a) {
  if (a < 30) return null;
  if (r > 80 && b > 80 && g < 60)  return { level: '最危険', detail: '浸水深度 10m以上想定' };
  if (r > 150 && g < 80 && b < 80) return { level: '危険',   detail: '浸水深度 3〜10m想定' };
  if (r > 180 && g > 80 && g < 180 && b < 80) return { level: '警戒', detail: '浸水深度 0.5〜3m想定' };
  if (r > 180 && g > 180 && b < 80) return { level: '注意',  detail: '浸水深度 0〜0.5m想定' };
  return { level: '注意', detail: '浸水リスクあり' };
}

// 緯度経度 → タイル座標 + タイル内ピクセル座標
function latLngToTilePixel(lat, lng, z) {
  var n = Math.pow(2, z);
  var latRad = lat * Math.PI / 180;
  var tx = (lng + 180) / 360 * n;
  var ty = (1 - Math.log(Math.tan(latRad) + 1 / Math.cos(latRad)) / Math.PI) / 2 * n;
  return {
    x:  Math.floor(tx),
    y:  Math.floor(ty),
    px: Math.floor((tx - Math.floor(tx)) * 256),
    py: Math.floor((ty - Math.floor(ty)) * 256)
  };
}

// ハザードタイルを1枚取得してピクセル色を返す
async function fetchHazardPixel(urlTemplate, lat, lng, z) {
  var t = latLngToTilePixel(lat, lng, z);
  var url = urlTemplate.replace('{z}', z).replace('{x}', t.x).replace('{y}', t.y);
  try {
    var res = await fetch(url, { headers: { 'User-Agent': 'AI-Bosai-Assistant/1.0' } });
    if (!res.ok) return null;
    var ab = await res.arrayBuffer();
    return readPngPixel(Buffer.from(ab), t.px, t.py);
  } catch (e) { return null; }
}

var HAZARD_TILE_DEFS = [
  { type: 'flood',   label: '洪水浸水想定区域',     url: 'https://disaportaldata.gsi.go.jp/raster/01_flood_l2_shinsuishin_data/{z}/{x}/{y}.png' },
  { type: 'tsunami', label: '津波浸水想定区域',     url: 'https://disaportaldata.gsi.go.jp/raster/04_tsunami_newlegend_data/{z}/{x}/{y}.png'   },
  { type: 'debris',  label: '土石流危険渓流',       url: 'https://disaportaldata.gsi.go.jp/raster/05_dosekiryukeikaikuiki/{z}/{x}/{y}.png'     },
  { type: 'steep',   label: '急傾斜地崩壊危険区域', url: 'https://disaportaldata.gsi.go.jp/raster/05_kyukeishakeikaikuiki/{z}/{x}/{y}.png'     }
];

// ---- グループ位置共有ストア（メモリ内。サーバ再起動で消える）----
var GROUPS = {};  // { code: { members: { deviceId: { name, lat, lng, ts } }, updatedAt } }
var GROUP_MEMBER_TTL = 10 * 60 * 1000;   // 10分更新のないメンバーは離脱扱い
var GROUP_TTL        = 24 * 60 * 60 * 1000;  // 24時間動きのないグループは削除

function genGroupCode() {
  for (var i = 0; i < 50; i++) {
    var code = String(Math.floor(100000 + Math.random() * 900000));  // 6桁
    if (!GROUPS[code]) return code;
  }
  throw new Error('failed to generate group code');
}

setInterval(function cleanupGroups() {
  var now = Date.now();
  Object.keys(GROUPS).forEach(function(code) {
    var g = GROUPS[code];
    Object.keys(g.members).forEach(function(id) {
      if (now - g.members[id].ts > GROUP_MEMBER_TTL) delete g.members[id];
    });
    if (now - g.updatedAt > GROUP_TTL) delete GROUPS[code];
  });
}, 60 * 1000);

// ---- HTTPサーバ ----
var server = http.createServer(async function(req, res) {
  // フロント（別ポート/ファイル）から呼べるようCORSを許可
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  var u = new URL(req.url, 'http://localhost');
  //
  if (u.pathname === '/api/chat') {
    if (req.method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'POST only' }));
      return;
    }

    if (!OPENAI_API_KEY) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'OPENAI_API_KEY が未設定です。' }));
      return;
  }

  try {
    var body = await readJsonBody(req);

    var system = body.system || 'あなたは防災支援AIアシスタントです。';
    var context = body.context || '';
    var messages = body.messages || [];

    var input = [];

    input.push({
      role: 'system',
      content: system + (context ? '\n\n' + context : '')
    });

    messages.forEach(function(m) {
      if (m && m.role && m.content) {
        input.push({
          role: m.role,
          content: m.content
        });
      }
    });

    var aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + OPENAI_API_KEY
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        messages: input,
        max_completion_tokens: 900
      })
    });

    var aiText = await aiRes.text();

    if (!aiRes.ok) {
      console.warn('OpenAI API error:', aiRes.status, aiText);
      res.writeHead(aiRes.status, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        error: 'OpenAI API error',
        detail: aiText
      }));
      return;
    }

    var data = JSON.parse(aiText);
    var reply = (data.choices && data.choices[0] && data.choices[0].message)
      ? data.choices[0].message.content
      : '';

    res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
    res.end(JSON.stringify({ reply: reply }));
    } catch (e) {
      console.error('chat error:', e);
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({
        error: String(e.message || e)
      }));
    }

    return;
  }

  if (u.pathname === '/api/translate') {
    if (req.method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'POST only' }));
      return;
    }

    if (!OPENAI_API_KEY) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'OPENAI_API_KEY が未設定です。' }));
      return;
    }

    try {
      var reqBody = await readJsonBody(req);
      var text = String(reqBody.text || '').trim();
      var targetLang = String(reqBody.targetLang || 'en').trim();

      if (!text) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'text is required' }));
        return;
      }

      var translated = await translatePlaceNameWithOpenAI(text, targetLang);

      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ translated: translated }));
    } catch (e) {
      console.error('translate error:', e);
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: String(e.message || e) }));
    }
    return;
  }

  if (u.pathname === '/api/translate-batch') {
    if (req.method !== 'POST') {
      res.writeHead(405, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'POST only' }));
      return;
    }
    if (!OPENAI_API_KEY) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'OPENAI_API_KEY が未設定です。' }));
      return;
    }
    try {
      var reqBody2 = await readJsonBody(req);
      var texts = Array.isArray(reqBody2.texts) ? reqBody2.texts.map(function(t){ return String(t || ''); }) : [];
      var targetLang2 = String(reqBody2.targetLang || 'en').trim();

      if (!texts.length) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'texts is required' }));
        return;
      }

      var translatedArr = await translateBatchWithOpenAI(texts, targetLang2);

      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ translated: translatedArr }));
    } catch (e) {
      console.error('translate-batch error:', e);
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: String(e.message || e) }));
    }
    return;
  }

  if (u.pathname === '/api/shelters') {
    if (!API_KEY) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'APIキー未設定。環境変数 REINFOLIB_API_KEY を設定して起動してください。' }));
      return;
    }
    var lat = parseFloat(u.searchParams.get('lat'));
    var lng = parseFloat(u.searchParams.get('lng'));
    var radius = parseInt(u.searchParams.get('radius') || '3000', 10);
    if (isNaN(lat) || isNaN(lng)) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'lat と lng が必要です' }));
      return;
    }
    try {
      var shelters = await getShelters(lat, lng, radius);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ shelters: shelters }));
      console.log('  → ' + shelters.length + '件 返却');
    } catch (e) {
      console.error('エラー:', e);
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: String(e.message || e) }));
    }
    return;
  }

  // ハザードリスク判定（現在地のタイルピクセル色を解析）
  if (u.pathname === '/api/hazard-risk') {
    var hLat = parseFloat(u.searchParams.get('lat'));
    var hLng = parseFloat(u.searchParams.get('lng'));
    if (isNaN(hLat) || isNaN(hLng)) {
      res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: 'lat と lng が必要です' }));
      return;
    }
    var ZOOM = 14;
    try {
      var pixels = await Promise.all(HAZARD_TILE_DEFS.map(function(h) {
        return fetchHazardPixel(h.url, hLat, hLng, ZOOM);
      }));
      var activeRisks = [];
      HAZARD_TILE_DEFS.forEach(function(h, i) {
        var px = pixels[i];
        if (!px || px.a < 30) return;
        var risk = h.type === 'flood'
          ? classifyFloodColor(px.r, px.g, px.b, px.a)
          : { level: '該当', detail: 'リスクあり' };
        if (risk) activeRisks.push({ type: h.type, label: h.label, level: risk.level, detail: risk.detail });
      });
      var summary;
      if (activeRisks.length === 0) {
        summary = '【現在地のハザード情報】洪水・津波・土砂災害のハザード区域には該当しません。';
      } else {
        var parts = activeRisks.map(function(r) { return r.label + '（' + r.detail + '）'; });
        summary = '【現在地のハザード情報】' + parts.join('、') + 'に該当します。直ちに安全な場所への移動を検討してください。';
      }
      console.log('hazard-risk lat=' + hLat + ' lng=' + hLng + ' → ' + activeRisks.length + '件リスク検出');
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ risks: activeRisks, summary: summary }));
    } catch (e) {
      console.error('hazard-risk error:', e);
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: String(e.message || e) }));
    }
    return;
  }

  // ---- グループ位置共有 API（メモリ内・6桁コード・ログイン不要）----
  if (u.pathname === '/api/group/create' && req.method === 'POST') {
    try {
      var code = genGroupCode();
      GROUPS[code] = { members: {}, updatedAt: Date.now() };
      console.log('group created: ' + code);
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ code: code }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: String(e.message || e) }));
    }
    return;
  }

  if (u.pathname === '/api/group/join' && req.method === 'POST') {
    try {
      var jBody = await readJsonBody(req);
      var jCode = String(jBody.code || '').trim();
      if (!GROUPS[jCode]) {
        res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'group not found' }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: true, code: jCode }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: String(e.message || e) }));
    }
    return;
  }

  // 自分の位置を登録し、グループ全員の最新位置を返す（書き込み＋読み出しを1往復で）
  if (u.pathname === '/api/group/update' && req.method === 'POST') {
    try {
      var gBody = await readJsonBody(req);
      var gCode = String(gBody.code || '').trim();
      var g = GROUPS[gCode];
      if (!g) {
        res.writeHead(404, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'group not found' }));
        return;
      }
      var devId = String(gBody.deviceId || '').slice(0, 64);
      if (!devId) {
        res.writeHead(400, { 'Content-Type': 'application/json; charset=utf-8' });
        res.end(JSON.stringify({ error: 'deviceId is required' }));
        return;
      }
      var gLat = parseFloat(gBody.lat), gLng = parseFloat(gBody.lng);
      var hasPos = !isNaN(gLat) && !isNaN(gLng) &&
                   gLat >= -90 && gLat <= 90 && gLng >= -180 && gLng <= 180;
      g.members[devId] = {
        name: String(gBody.name || '').slice(0, 20) || '?',
        lat: hasPos ? gLat : null,
        lng: hasPos ? gLng : null,
        ts: Date.now()
      };
      g.updatedAt = Date.now();
      var roster = Object.keys(g.members).map(function(id) {
        var m = g.members[id];
        return { id: id, name: m.name, lat: m.lat, lng: m.lng, ts: m.ts };
      });
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ members: roster }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: String(e.message || e) }));
    }
    return;
  }

  if (u.pathname === '/api/group/leave' && req.method === 'POST') {
    try {
      var lBody = await readJsonBody(req);
      var lCode = String(lBody.code || '').trim();
      var lDev = String(lBody.deviceId || '').slice(0, 64);
      if (GROUPS[lCode] && GROUPS[lCode].members[lDev]) {
        delete GROUPS[lCode].members[lDev];
        GROUPS[lCode].updatedAt = Date.now();
      }
      res.writeHead(200, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ ok: true }));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json; charset=utf-8' });
      res.end(JSON.stringify({ error: String(e.message || e) }));
    }
    return;
  }

  // 静的ファイル配信（/ → index.html、それ以外はファイルパスにマップ）
  var filePath = u.pathname === '/' ? '/index.html' : u.pathname;
  var absPath  = path.join(STATIC_ROOT, filePath.replace(/\.\./g, '')); // パストラバーサル対策
  var ext      = path.extname(absPath);
  var mime     = MIME[ext] || 'application/octet-stream';

  fs.readFile(absPath, function(err, data) {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': mime });
    res.end(data);
  });
});

server.listen(PORT, function() {
  console.log('==============================================');
  console.log(' AI防災アシスタント サーバ起動');
  console.log(' アプリURL: http://localhost:' + PORT);
  console.log(' OpenAI key: ' + (OPENAI_API_KEY ? 'set OK' : 'NOT set'));
  console.log(' OpenAI key prefix: ' + (OPENAI_API_KEY ? OPENAI_API_KEY.slice(0, 7) + '...' : 'none'));
  console.log(' OpenAI model: ' + OPENAI_MODEL);
  console.log(' Reinfolib key: ' + (API_KEY ? 'set OK' : 'NOT set (ローカルデータで動作)'));
  console.log('==============================================');
});
