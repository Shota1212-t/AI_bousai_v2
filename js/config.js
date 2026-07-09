// ===== 設定ファイル =====
// APIキーはソースコードに書かない
// サーバ起動時: .env のキーをサーバが使う（ブラウザには渡らない）
// サーバなし時: localStorage のキーをブラウザが直接使う（フォールバック）

var OPENAI_MODEL = 'gpt-5.4-nano';
var BACKEND_URL = window.location.origin;
// APIキーはlocalStorageから読み込む（サーバなしのフォールバック用）
var OPENAI_API_KEY = (function () {
  try { return localStorage.getItem('bosai_api_key') || ''; }
  catch (e) { return ''; }
})();
