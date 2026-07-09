// 安否連絡文生成モジュール
// Responses API接続後は generate() をAPI呼び出しに差し替える
var SafetyMsg = (function () {
  var _chatHistory = [];

  // safety.js 専用の軽量辞書。
  // i18n.js にキー追加しなくても、現在の bosai_lang に合わせて安否連絡文を生成する。
  var SAFETY_I18N = {
    ja: {
      unknownLocation: '現在地不明',
      unknownDisaster: '災害',
      checkingSafety: '安全を確認中です',
      checkingShelter: '確認中',
      copied: '連絡文をコピーしました',
      timestamp: '{month}月{day}日 {hour}時{minute}分',
      header: '【安否連絡】{time}',
      locationLine: '現在、{location}にいます。',
      mapLine: '位置：{url}',
      disasterLine: '{disaster}が発生しています。',
      statusLine: '私は{status}。',
      shelterLine: '避難先：{shelter}',
      closingLine: '引き続き状況を確認します。連絡をください。',
      disasters: {
        tsunami: '津波', landslide: '土砂災害', fire: '火災', flood: '大雨・洪水',
        typhoon: '台風', earthquake: '地震', heavyRain: '大雨', outage: '停電'
      },
      statuses: {
        serious: '負傷者がいます。救護が必要な状況です',
        minor: '軽傷がありますが自力で行動できます',
        safe: '無事です'
      }
    },
    en: {
      unknownLocation: 'Location unknown',
      unknownDisaster: 'a disaster',
      checkingSafety: 'I am checking my safety',
      checkingShelter: 'Checking',
      copied: 'Safety message copied',
      timestamp: '{month}/{day} {hour}:{minute}',
      header: '[Safety Message] {time}',
      locationLine: 'I am currently at {location}.',
      mapLine: 'Location: {url}',
      disasterLine: '{disaster} is occurring.',
      statusLine: '{status}.',
      shelterLine: 'Evacuation destination: {shelter}',
      closingLine: 'I will keep checking the situation. Please contact me.',
      disasters: {
        tsunami: 'A tsunami', landslide: 'A landslide disaster', fire: 'A fire', flood: 'Heavy rain/flooding',
        typhoon: 'A typhoon', earthquake: 'An earthquake', heavyRain: 'Heavy rain', outage: 'A power outage'
      },
      statuses: {
        serious: 'There are injured people. Rescue/medical support is needed',
        minor: 'I have minor injuries but can move on my own',
        safe: 'I am safe'
      }
    },
    zh: {
      unknownLocation: '当前位置不明',
      unknownDisaster: '灾害',
      checkingSafety: '正在确认安全',
      checkingShelter: '确认中',
      copied: '已复制安否信息',
      timestamp: '{month}月{day}日 {hour}:{minute}',
      header: '【安否联系】{time}',
      locationLine: '我现在在{location}。',
      mapLine: '位置：{url}',
      disasterLine: '当前发生了{disaster}。',
      statusLine: '我的情况：{status}。',
      shelterLine: '避难地点：{shelter}',
      closingLine: '我会继续确认情况。请联系我。',
      disasters: {
        tsunami: '海啸', landslide: '山体滑坡灾害', fire: '火灾', flood: '暴雨・洪水',
        typhoon: '台风', earthquake: '地震', heavyRain: '暴雨', outage: '停电'
      },
      statuses: {
        serious: '有伤者，需要救护支援',
        minor: '有轻伤，但可以自行行动',
        safe: '我平安无事'
      }
    },
    ko: {
      unknownLocation: '현재 위치 불명',
      unknownDisaster: '재해',
      checkingSafety: '안전을 확인 중입니다',
      checkingShelter: '확인 중',
      copied: '안부 연락문을 복사했습니다',
      timestamp: '{month}월 {day}일 {hour}:{minute}',
      header: '【안부 연락】{time}',
      locationLine: '현재 {location}에 있습니다.',
      mapLine: '위치: {url}',
      disasterLine: '{disaster}이/가 발생했습니다.',
      statusLine: '저는 {status}.',
      shelterLine: '대피처: {shelter}',
      closingLine: '계속 상황을 확인하겠습니다. 연락 주세요.',
      disasters: {
        tsunami: '해일', landslide: '산사태 재해', fire: '화재', flood: '폭우·홍수',
        typhoon: '태풍', earthquake: '지진', heavyRain: '폭우', outage: '정전'
      },
      statuses: {
        serious: '부상자가 있으며 구조·구호가 필요한 상황입니다',
        minor: '가벼운 부상이 있지만 스스로 이동할 수 있습니다',
        safe: '무사합니다'
      }
    },
    pt: {
      unknownLocation: 'Localização desconhecida',
      unknownDisaster: 'um desastre',
      checkingSafety: 'Estou verificando minha segurança',
      checkingShelter: 'Verificando',
      copied: 'Mensagem de segurança copiada',
      timestamp: '{day}/{month} {hour}:{minute}',
      header: '[Mensagem de Segurança] {time}',
      locationLine: 'No momento estou em {location}.',
      mapLine: 'Localização: {url}',
      disasterLine: '{disaster} está ocorrendo.',
      statusLine: 'Minha situação: {status}.',
      shelterLine: 'Destino de evacuação: {shelter}',
      closingLine: 'Continuarei verificando a situação. Por favor, entre em contato comigo.',
      disasters: {
        tsunami: 'Um tsunami', landslide: 'Um deslizamento', fire: 'Um incêndio', flood: 'Chuva forte/inundação',
        typhoon: 'Um tufão', earthquake: 'Um terremoto', heavyRain: 'Chuva forte', outage: 'Uma queda de energia'
      },
      statuses: {
        serious: 'Há feridos. É necessário apoio de resgate/atendimento',
        minor: 'Tenho ferimentos leves, mas consigo me mover sozinho(a)',
        safe: 'Estou em segurança'
      }
    }
  };

  var DISASTER_MAP = [
    { keys: ['津波', 'tsunami', '海啸', '해일'], code: 'tsunami' },
    { keys: ['土砂', '土石流', 'がけ崩れ', 'landslide', 'mudslide', '山体滑坡', '산사태'], code: 'landslide' },
    { keys: ['火事', '火災', '煙', 'fire', 'smoke', '火灾', '화재'], code: 'fire' },
    { keys: ['洪水', '浸水', '氾濫', 'flood', 'inundation', '洪水', '침수', '홍수'], code: 'flood' },
    { keys: ['台風', 'typhoon', 'tufão', '台风', '태풍'], code: 'typhoon' },
    { keys: ['地震', '揺れ', '震度', 'earthquake', 'quake', 'terremoto', '地震', '지진'], code: 'earthquake' },
    { keys: ['大雨', '豪雨', 'heavy rain', '暴雨', '폭우'], code: 'heavyRain' },
    { keys: ['停電', 'power outage', 'blackout', '停电', '정전'], code: 'outage' }
  ];
  var STATUS_MAP = [
    { keys: ['重傷', '骨折', '意識がない', '動けない', 'serious', 'unconscious', 'cannot move', '重伤', '无法移动', '중상', '움직일 수 없'], code: 'serious' },
    { keys: ['軽傷', 'けが', '怪我', '打撲', 'minor injury', 'injured', '轻伤', '受伤', '경상', '부상'], code: 'minor' },
    { keys: ['無事', '安全', '大丈夫', '問題ない', 'safe', 'okay', '平安', '安全', '무사', '괜찮'], code: 'safe' }
  ];

  function currentLang() {
    if (typeof getCurrentLang === 'function') return getCurrentLang();
    try { return localStorage.getItem('bosai_lang') || 'ja'; }
    catch (e) { return 'ja'; }
  }
  function dict() {
    var lang = currentLang();
    return SAFETY_I18N[lang] || SAFETY_I18N.ja;
  }
  function fmt(template, vars) {
    return String(template).replace(/\{(\w+)\}/g, function(_, k) {
      return vars[k] !== undefined ? vars[k] : '';
    });
  }

  // チャット履歴を外部から更新する
  function setChatHistory(msgs) {
    _chatHistory = msgs || [];
  }

  // チャット履歴テキストから災害種別・状況を自動検出
  function detect(map, text, fallbackCode) {
    var lower = String(text || '').toLowerCase();
    for (var i = 0; i < map.length; i++) {
      var entry = map[i];
      for (var j = 0; j < entry.keys.length; j++) {
        if (lower.indexOf(String(entry.keys[j]).toLowerCase()) !== -1) return entry.code;
      }
    }
    return fallbackCode;
  }

  // 現在地テキストをDOMから取得（ui.jsと共有）
  function getCurrentLocation() {
    var el = document.querySelector('#page-chat .loc-name');
    if (el) {
      return el.textContent.replace(/^\s*📍?\s*/, '').trim();
    }
    var el2 = document.querySelector('.status-val');
    return el2 ? el2.textContent.trim() : dict().unknownLocation;
  }

  function formatTimestamp(now) {
    var d = dict();
    return fmt(d.timestamp, {
      month: now.getMonth() + 1,
      day: now.getDate(),
      hour: String(now.getHours()).padStart(2, '0'),
      minute: String(now.getMinutes()).padStart(2, '0')
    });
  }

  // 安否連絡文を生成して返す
  function generate(opts) {
    opts = opts || {};
    var d = dict();
    var contextText = _chatHistory.join(' ');
    var now = new Date();
    var timestamp = opts.timestamp || formatTimestamp(now);
    var location = opts.location || getCurrentLocation();

    var disasterCode = opts.disasterCode || detect(DISASTER_MAP, contextText, null);
    var statusCode = opts.statusCode || detect(STATUS_MAP, contextText, null);

    var disaster = opts.disaster || (disasterCode ? d.disasters[disasterCode] : d.unknownDisaster);
    var status = opts.status || (statusCode ? d.statuses[statusCode] : d.checkingSafety);
    var shelter = opts.shelter || d.checkingShelter;

    var lines = [
      fmt(d.header, { time: timestamp }),
      fmt(d.locationLine, { location: location })
    ];
    // 現在地の座標が分かっていれば地図リンクを添える（受け取った家族が場所を特定できる）
    var lat = (typeof myLat !== 'undefined' && myLat != null) ? myLat : null;
    var lng = (typeof myLng !== 'undefined' && myLng != null) ? myLng : null;
    if (lat != null && d.mapLine) {
      lines.push(fmt(d.mapLine, { url: 'https://maps.google.com/?q=' + lat.toFixed(6) + ',' + lng.toFixed(6) }));
    }
    lines.push(
      fmt(d.disasterLine, { disaster: disaster }),
      fmt(d.statusLine, { status: status }),
      fmt(d.shelterLine, { shelter: shelter }),
      d.closingLine
    );
    return lines.join('\n');
  }

  // モーダルを開いて連絡文を表示
  function showModal() {
    var msg = generate();
    document.getElementById('safetyMsgText').value = msg;
    document.getElementById('safetyModal').classList.remove('hidden');
  }
  function closeModal() {
    document.getElementById('safetyModal').classList.add('hidden');
  }
  function copyMsg() {
    var el = document.getElementById('safetyMsgText');
    el.select();
    document.execCommand('copy');
    if (typeof showToast === 'function') showToast(dict().copied);
    closeModal();
  }

  return {
    setChatHistory: setChatHistory,
    generate: generate,
    showModal: showModal,
    closeModal: closeModal,
    copyMsg: copyMsg
  };
})();
