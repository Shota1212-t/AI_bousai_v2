// ===== グループ位置共有（6桁コード・リアルタイム・ログイン不要）=====
// 同じコードを入力した人同士が、お互いの現在地を地図上で数秒間隔で確認できる。
// サーバ（server.js）のメモリ内に位置を保持し、10分更新が無いメンバーは自動離脱。

var GROUP_I18N = {
  ja: {
    modalTitle: 'グループ位置共有',
    desc: '同じコードを入力した人同士で、お互いの位置を地図上でリアルタイムに確認できます。',
    namePlaceholder: 'ニックネーム（例：父）',
    createBtn: '新しいグループを作る',
    orJoin: 'または、共有されたコードで参加',
    codePlaceholder: '6桁のコード',
    joinBtn: '参加する',
    yourCode: 'グループコード',
    codeHint: 'このコードを家族・友人に伝えてください',
    copyCode: 'コードをコピー',
    members: 'メンバー（{n}人）',
    you: '自分',
    noPos: '位置未取得',
    stale: '更新が途絶えています',
    leaveBtn: 'グループから退出',
    toastCreated: 'グループを作成しました。コードを家族に伝えてください',
    toastJoined: 'グループに参加しました',
    toastLeft: 'グループから退出しました',
    toastNotFound: 'グループが見つかりません。コードを確認してください',
    toastNameRequired: 'ニックネームを入力してください',
    toastCodeRequired: '6桁のコードを入力してください',
    toastError: 'サーバに接続できません（サーバ起動時のみ使えます）',
    toastCodeCopied: 'コードをコピーしました'
  },
  en: {
    modalTitle: 'Group Location Sharing',
    desc: 'People who enter the same code can see each other\'s locations on the map in real time.',
    namePlaceholder: 'Nickname (e.g. Dad)',
    createBtn: 'Create a New Group',
    orJoin: 'Or join with a shared code',
    codePlaceholder: '6-digit code',
    joinBtn: 'Join',
    yourCode: 'Group Code',
    codeHint: 'Share this code with your family and friends',
    copyCode: 'Copy Code',
    members: 'Members ({n})',
    you: 'You',
    noPos: 'No location yet',
    stale: 'Not updating',
    leaveBtn: 'Leave Group',
    toastCreated: 'Group created. Share the code with your family',
    toastJoined: 'Joined the group',
    toastLeft: 'Left the group',
    toastNotFound: 'Group not found. Please check the code',
    toastNameRequired: 'Please enter a nickname',
    toastCodeRequired: 'Please enter the 6-digit code',
    toastError: 'Cannot reach the server (available only with the server running)',
    toastCodeCopied: 'Code copied'
  },
  zh: {
    modalTitle: '群组位置共享',
    desc: '输入相同代码的人可以在地图上实时查看彼此的位置。',
    namePlaceholder: '昵称（例：爸爸）',
    createBtn: '创建新群组',
    orJoin: '或使用共享的代码加入',
    codePlaceholder: '6位代码',
    joinBtn: '加入',
    yourCode: '群组代码',
    codeHint: '请将此代码告诉家人和朋友',
    copyCode: '复制代码',
    members: '成员（{n}人）',
    you: '自己',
    noPos: '尚未获取位置',
    stale: '更新中断',
    leaveBtn: '退出群组',
    toastCreated: '群组已创建。请将代码告诉家人',
    toastJoined: '已加入群组',
    toastLeft: '已退出群组',
    toastNotFound: '未找到群组。请确认代码',
    toastNameRequired: '请输入昵称',
    toastCodeRequired: '请输入6位代码',
    toastError: '无法连接服务器（仅在服务器运行时可用）',
    toastCodeCopied: '代码已复制'
  },
  ko: {
    modalTitle: '그룹 위치 공유',
    desc: '같은 코드를 입력한 사람끼리 지도에서 서로의 위치를 실시간으로 확인할 수 있습니다.',
    namePlaceholder: '닉네임（예：아버지）',
    createBtn: '새 그룹 만들기',
    orJoin: '또는 공유받은 코드로 참가',
    codePlaceholder: '6자리 코드',
    joinBtn: '참가하기',
    yourCode: '그룹 코드',
    codeHint: '이 코드를 가족·친구에게 알려주세요',
    copyCode: '코드 복사',
    members: '멤버（{n}명）',
    you: '나',
    noPos: '위치 미취득',
    stale: '업데이트 중단됨',
    leaveBtn: '그룹에서 나가기',
    toastCreated: '그룹을 만들었습니다. 코드를 가족에게 알려주세요',
    toastJoined: '그룹에 참가했습니다',
    toastLeft: '그룹에서 나왔습니다',
    toastNotFound: '그룹을 찾을 수 없습니다. 코드를 확인해 주세요',
    toastNameRequired: '닉네임을 입력해 주세요',
    toastCodeRequired: '6자리 코드를 입력해 주세요',
    toastError: '서버에 연결할 수 없습니다（서버 실행 시에만 사용 가능）',
    toastCodeCopied: '코드를 복사했습니다'
  },
  pt: {
    modalTitle: 'Compartilhamento em Grupo',
    desc: 'Pessoas com o mesmo código podem ver a localização umas das outras no mapa em tempo real.',
    namePlaceholder: 'Apelido (ex.: Pai)',
    createBtn: 'Criar Novo Grupo',
    orJoin: 'Ou entre com um código compartilhado',
    codePlaceholder: 'Código de 6 dígitos',
    joinBtn: 'Entrar',
    yourCode: 'Código do Grupo',
    codeHint: 'Compartilhe este código com família e amigos',
    copyCode: 'Copiar Código',
    members: 'Membros ({n})',
    you: 'Você',
    noPos: 'Sem localização',
    stale: 'Sem atualização',
    leaveBtn: 'Sair do Grupo',
    toastCreated: 'Grupo criado. Compartilhe o código com sua família',
    toastJoined: 'Entrou no grupo',
    toastLeft: 'Saiu do grupo',
    toastNotFound: 'Grupo não encontrado. Verifique o código',
    toastNameRequired: 'Digite um apelido',
    toastCodeRequired: 'Digite o código de 6 dígitos',
    toastError: 'Não foi possível conectar ao servidor (disponível apenas com o servidor ativo)',
    toastCodeCopied: 'Código copiado'
  }
};

var GroupShare = (function () {
  var POLL_MS = 5000;              // 位置送信＋メンバー取得の間隔
  var STALE_MS = 2 * 60 * 1000;    // 2分更新が無いメンバーはグレー表示
  var MEMBER_COLORS = ['E97316', '0891B2', '16A34A', 'DB2777', '7C3AED', 'CA8A04', '0EA5E9', '65A30D'];

  var _pollTimer = null;
  var _markers = {};   // deviceId -> Leaflet marker

  function dict() {
    var lang = (typeof getCurrentLang === 'function') ? getCurrentLang() : 'ja';
    return GROUP_I18N[lang] || GROUP_I18N.ja;
  }
  function fmtStr(template, vars) {
    return String(template).replace(/\{(\w+)\}/g, function (_, k) {
      return vars[k] !== undefined ? vars[k] : '';
    });
  }
  function _get(key) { try { return localStorage.getItem(key); } catch (e) { return null; } }
  function _set(key, v) { try { localStorage.setItem(key, v); } catch (e) {} }
  function _del(key) { try { localStorage.removeItem(key); } catch (e) {} }

  function deviceId() {
    var id = _get('bosai_device_id');
    if (!id) {
      id = 'd' + Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
      _set('bosai_device_id', id);
    }
    return id;
  }
  function currentCode() { return _get('bosai_group_code') || ''; }
  function shareName() { return _get('bosai_share_name') || ''; }

  function _api(path, body) {
    if (typeof BACKEND_URL === 'undefined' || !BACKEND_URL) {
      return Promise.reject(new Error('no backend'));
    }
    return fetch(BACKEND_URL.replace(/\/$/, '') + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body || {})
    }).then(function (res) {
      return res.json().then(function (data) { return { ok: res.ok, status: res.status, data: data }; });
    });
  }

  // ---- グループ操作 ----
  function create() {
    var d = dict();
    var name = (document.getElementById('groupNameInput') || {}).value || '';
    name = name.trim();
    if (!name) { showToast(d.toastNameRequired); return; }
    _api('/api/group/create', {}).then(function (r) {
      if (!r.ok || !r.data.code) { showToast(d.toastError); return; }
      _set('bosai_share_name', name);
      _set('bosai_group_code', r.data.code);
      showToast(d.toastCreated);
      startSharing();
      renderModal();
    }).catch(function () { showToast(d.toastError); });
  }

  function join() {
    var d = dict();
    var name = (document.getElementById('groupNameInput') || {}).value || '';
    var code = (document.getElementById('groupCodeInput') || {}).value || '';
    name = name.trim(); code = code.trim();
    if (!name) { showToast(d.toastNameRequired); return; }
    if (!/^\d{6}$/.test(code)) { showToast(d.toastCodeRequired); return; }
    _api('/api/group/join', { code: code }).then(function (r) {
      if (r.status === 404) { showToast(d.toastNotFound); return; }
      if (!r.ok) { showToast(d.toastError); return; }
      _set('bosai_share_name', name);
      _set('bosai_group_code', code);
      showToast(d.toastJoined);
      startSharing();
      renderModal();
    }).catch(function () { showToast(d.toastError); });
  }

  function leave() {
    var d = dict();
    var code = currentCode();
    if (code) _api('/api/group/leave', { code: code, deviceId: deviceId() }).catch(function () {});
    _del('bosai_group_code');
    stopSharing();
    _clearMarkers();
    showToast(d.toastLeft);
    renderModal();
  }

  function copyCode() {
    var code = currentCode();
    if (!code) return;
    var done = function () { showToast(dict().toastCodeCopied); };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(code).then(done).catch(done);
    } else { done(); }
  }

  // ---- 位置送信ループ ----
  function startSharing() {
    stopSharing();
    _tick();
    _pollTimer = setInterval(_tick, POLL_MS);
  }
  function stopSharing() {
    if (_pollTimer) { clearInterval(_pollTimer); _pollTimer = null; }
  }
  function _tick() {
    var code = currentCode();
    if (!code) { stopSharing(); return; }
    var lat = (typeof myLat !== 'undefined' && myLat != null) ? myLat : null;
    var lng = (typeof myLng !== 'undefined' && myLng != null) ? myLng : null;
    _api('/api/group/update', {
      code: code, deviceId: deviceId(), name: shareName(), lat: lat, lng: lng
    }).then(function (r) {
      if (r.status === 404) {  // サーバ再起動などでグループ消滅
        _del('bosai_group_code');
        stopSharing();
        _clearMarkers();
        renderModal();
        return;
      }
      if (r.ok && r.data.members) {
        _renderMarkers(r.data.members);
        _renderMemberList(r.data.members);
      }
    }).catch(function () {});
  }

  // ---- 地図マーカー ----
  function _colorFor(id) {
    var h = 0;
    for (var i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
    return MEMBER_COLORS[h % MEMBER_COLORS.length];
  }
  function _clearMarkers() {
    Object.keys(_markers).forEach(function (id) {
      if (typeof leafletMap !== 'undefined' && leafletMap) leafletMap.removeLayer(_markers[id]);
    });
    _markers = {};
  }
  function _renderMarkers(members) {
    if (typeof leafletMap === 'undefined' || !leafletMap) return;
    var d = dict();
    var me = deviceId();
    var now = Date.now();
    var seen = {};

    members.forEach(function (m) {
      if (m.id === me || m.lat == null) return;
      seen[m.id] = true;
      var stale = (now - m.ts) > STALE_MS;
      var color = stale ? '9CA3AF' : _colorFor(m.id);
      var initial = String(m.name || '?').charAt(0);
      var icon = L.divIcon({
        className: '',
        html: '<div style="background:#' + color + ';color:#fff;border-radius:50%;' +
              'width:30px;height:30px;display:flex;align-items:center;justify-content:center;' +
              'font-size:13px;font-weight:700;border:3px solid #fff;' +
              'box-shadow:0 2px 8px rgba(0,0,0,.35);">' + initial + '</div>',
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });
      var tm = new Date(m.ts);
      var tmStr = String(tm.getHours()).padStart(2, '0') + ':' + String(tm.getMinutes()).padStart(2, '0');
      var popup = '<b>' + _esc(m.name) + '</b><br><span style="font-size:11px;color:#6B7280">' +
        tmStr + (stale ? ' ⚠ ' + d.stale : '') + '</span>';

      if (_markers[m.id]) {
        _markers[m.id].setLatLng([m.lat, m.lng]);
        _markers[m.id].setIcon(icon);
        _markers[m.id].getPopup().setContent(popup);
      } else {
        _markers[m.id] = L.marker([m.lat, m.lng], { icon: icon }).addTo(leafletMap).bindPopup(popup);
      }
    });

    // いなくなったメンバーのマーカーを消す
    Object.keys(_markers).forEach(function (id) {
      if (!seen[id]) { leafletMap.removeLayer(_markers[id]); delete _markers[id]; }
    });
  }

  function _esc(s) {
    return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // ---- モーダルUI ----
  function openModal() {
    var el = document.getElementById('groupModal');
    if (!el) return;
    renderModal();
    el.style.display = 'flex';
  }
  function closeModal() {
    var el = document.getElementById('groupModal');
    if (el) el.style.display = 'none';
  }

  function renderModal() {
    var d = dict();
    var titleEl = document.getElementById('groupModalTitle');
    var bodyEl = document.getElementById('groupModalBody');
    if (!titleEl || !bodyEl) return;
    titleEl.textContent = d.modalTitle;

    var code = currentCode();
    if (!code) {
      // 未参加：作成 or コードで参加
      bodyEl.innerHTML =
        '<p style="font-size:13px;color:#374151;margin-bottom:14px;">' + d.desc + '</p>' +
        '<input id="groupNameInput" type="text" maxlength="20" placeholder="' + _esc(d.namePlaceholder) + '" value="' + _esc(shareName()) + '" ' +
          'style="width:100%;padding:10px 12px;border:1.5px solid #D1D5DB;border-radius:8px;font-size:13px;outline:none;box-sizing:border-box;margin-bottom:10px;">' +
        '<button onclick="GroupShare.create()" style="width:100%;padding:11px;background:#1E5BC0;color:#fff;border:none;border-radius:8px;' +
          'font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;">' + _esc(d.createBtn) + '</button>' +
        '<p style="font-size:12px;color:#6B7280;margin:14px 0 8px;text-align:center;">' + _esc(d.orJoin) + '</p>' +
        '<div style="display:flex;gap:8px;">' +
          '<input id="groupCodeInput" type="text" inputmode="numeric" maxlength="6" placeholder="' + _esc(d.codePlaceholder) + '" ' +
            'style="flex:1;padding:10px 12px;border:1.5px solid #D1D5DB;border-radius:8px;font-size:15px;letter-spacing:3px;outline:none;text-align:center;">' +
          '<button onclick="GroupShare.join()" style="padding:10px 16px;background:#16A34A;color:#fff;border:none;border-radius:8px;' +
            'font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;white-space:nowrap;">' + _esc(d.joinBtn) + '</button>' +
        '</div>';
    } else {
      // 参加中：コード表示＋メンバー一覧＋退出
      bodyEl.innerHTML =
        '<div style="text-align:center;margin-bottom:4px;font-size:12px;color:#6B7280;">' + _esc(d.yourCode) + '</div>' +
        '<div style="text-align:center;font-size:34px;font-weight:800;letter-spacing:6px;color:#1E5BC0;margin-bottom:4px;">' + _esc(code) + '</div>' +
        '<div style="text-align:center;font-size:11px;color:#6B7280;margin-bottom:10px;">' + _esc(d.codeHint) + '</div>' +
        '<button onclick="GroupShare.copyCode()" style="width:100%;padding:9px;background:#EDF3FC;color:#1E5BC0;border:none;border-radius:8px;' +
          'font-size:12px;font-weight:600;cursor:pointer;font-family:inherit;margin-bottom:14px;">' + _esc(d.copyCode) + '</button>' +
        '<div id="groupMemberList" style="font-size:13px;color:#374151;"></div>' +
        '<button onclick="GroupShare.leave()" style="width:100%;padding:10px;background:#FEE2E2;color:#DC2626;border:none;border-radius:8px;' +
          'font-size:13px;font-weight:600;cursor:pointer;font-family:inherit;margin-top:14px;">' + _esc(d.leaveBtn) + '</button>';
      _tick();  // 開いた瞬間に最新化
    }
  }

  function _renderMemberList(members) {
    var d = dict();
    var el = document.getElementById('groupMemberList');
    if (!el) return;
    var me = deviceId();
    var now = Date.now();
    var html = '<div style="font-weight:700;margin-bottom:8px;">' +
      fmtStr(d.members, { n: members.length }) + '</div>';
    members.forEach(function (m) {
      var isMe = (m.id === me);
      var stale = (now - m.ts) > STALE_MS;
      var color = stale ? '9CA3AF' : _colorFor(m.id);
      var status = m.lat == null ? d.noPos : (stale ? d.stale : '');
      var tm = new Date(m.ts);
      var tmStr = String(tm.getHours()).padStart(2, '0') + ':' + String(tm.getMinutes()).padStart(2, '0');
      html +=
        '<div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #F1F5F9;">' +
          '<div style="width:24px;height:24px;border-radius:50%;background:#' + color + ';color:#fff;' +
            'display:flex;align-items:center;justify-content:center;font-size:11px;font-weight:700;flex-shrink:0;">' +
            _esc(String(m.name || '?').charAt(0)) + '</div>' +
          '<div style="flex:1;min-width:0;">' + _esc(m.name) + (isMe ? ' <span style="font-size:10px;color:#1E5BC0;">(' + _esc(d.you) + ')</span>' : '') + '</div>' +
          '<div style="font-size:11px;color:#9CA3AF;">' + tmStr + (status ? '・' + _esc(status) : '') + '</div>' +
        '</div>';
    });
    el.innerHTML = html;
  }

  // アプリ起動時：参加中のグループがあれば自動で共有再開
  function init() {
    if (currentCode()) startSharing();
  }

  return {
    openModal: openModal,
    closeModal: closeModal,
    create: create,
    join: join,
    leave: leave,
    copyCode: copyCode,
    init: init
  };
})();
