// キーワードベースのクライアントサイドRAG
// Responses API接続後は search() の結果をシステムプロンプトのcontextとして渡す
var ManualRAG = (function () {
  var chunks = [];
  var ready = false;

  function init() {
    // manual_data.js が読み込まれていればそちらを優先（file://対応）
    if (typeof MANUAL_DATA !== 'undefined' && MANUAL_DATA.chunks) {
      chunks = MANUAL_DATA.chunks;
      ready = true;
      return Promise.resolve();
    }
    // フォールバック：HTTP経由でfetch
    return fetch('data/manual.json')
      .then(function (r) { return r.json(); })
      .then(function (data) {
        chunks = data.chunks;
        ready = true;
      })
      .catch(function (e) {
        console.warn('防災マニュアルの読み込みに失敗しました', e);
      });
  }

  // query に関連するチャンクを最大 topK 件返す
  function search(query, topK) {
    topK = topK || 3;
    if (!ready || chunks.length === 0) return [];
    var tokens = tokenize(query);
    var scored = chunks.map(function (c) {
      return { chunk: c, score: scoreChunk(c, tokens) };
    });
    scored.sort(function (a, b) { return b.score - a.score; });
    return scored
      .filter(function (s) { return s.score > 0; })
      .slice(0, topK)
      .map(function (s) { return s.chunk; });
  }

  // チャンクをチャット返答に埋め込める文字列に変換
  function format(results) {
    if (results.length === 0) return '';
    return results.map(function (c) {
      return '【' + c.category + '】' + c.title + '\n' + c.content;
    }).join('\n\n---\n\n');
  }

  // Responses API に渡すシステムコンテキスト文字列を返す
  function buildContext(results) {
    if (results.length === 0) return '';
    var body = results.map(function (c) {
      return '[' + c.category + ': ' + c.title + ']\n' + c.content;
    }).join('\n\n');
    return '以下は防災マニュアルの関連情報です。この内容を根拠として回答してください。\n\n' + body;
  }

  // --- 内部ユーティリティ ---

  function tokenize(text) {
    return text
      .replace(/[。、！？「」【】『』・\n\r]/g, ' ')
      .split(/\s+/)
      .filter(function (t) { return t.length >= 2; });
  }

  function scoreChunk(chunk, tokens) {
    var score = 0;
    tokens.forEach(function (token) {
      // キーワード完全一致：3点
      var kwHit = chunk.keywords.some(function (k) {
        return k.includes(token) || token.includes(k);
      });
      if (kwHit) { score += 3; return; }
      // タイトル部分一致：2点
      if (chunk.title.includes(token)) { score += 2; return; }
      // 本文部分一致：1点
      if (chunk.content.includes(token)) { score += 1; }
    });
    return score;
  }

  return {
    init: init,
    search: search,
    format: format,
    buildContext: buildContext,
    isReady: function () { return ready; }
  };
})();
