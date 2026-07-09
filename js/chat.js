// ===== チャットロジック（OpenAI API / バックエンド対応）===== 
// 推奨: ブラウザから直接APIキーを使わず、BACKEND_URL 経由で /api/chat を呼び出す。

// チャット履歴（SafetyMsg・音声読み上げ用テキスト）
var chatHistory = [];
// API に渡すマルチターン会話履歴 {role, content}
var messages = [];

var CHAT_I18N = {
  ja: {
    speechLang: 'ja-JP',
    systemPrompt: 'あなたは防災支援AIです。災害発生中・直後の状況を前提に答えてください。\n絶対に使わないフレーズ：「まず今すぐ」「それと確認ですが」「質問1つ」「まず最初に」「次に」「質問です」。文頭は行動をそのまま書く。記号(* # - >)不使用。\nけが・応急手当：2〜3文以内。行動1つ＋状況確認1つ。例：「清潔なタオルで傷口を強く押さえ、5分手を離さないでください。出血は止まりそうですか？」\n避難所・避難経路：近い順に名称・徒歩時間・距離・住所を1件1文で列挙。最後は「今いる場所は○○のどのあたりですか？」のように自然に締める。「質問1つ」などのラベルは絶対につけない。\n命の危険→119を案内。防災無関係→「防災専用アプリです」とだけ答える。',
    properNounRule: '',
    currentInfo: '【アプリが取得した現在の情報】',
    currentLocation: '【現在地】',
    gettingLocation: '取得中...',
    latLng: '北緯{lat}° 東経{lng}°',
    nearbySheltersHeader: '【近くの避難所（近い順・全{count}件）】',
    supported: '対応：',
    others: '  ほか{count}件',
    backendFallback: 'バックエンド通信失敗、直接APIへフォールバック:',
    openaiError: 'OpenAI API error:',
    openaiCommError: 'OpenAI API通信エラー:',
    ragReplyPrefix: '📖 防災マニュアルより【{category}：{title}】\n\n{content}\n\nさらに詳しい質問があればお気軽にどうぞ。',
    mockShelter: '近くの避難所はリストに表示しています。地図のピンをタップすると経路を確認できます。',
    mockHazard: '下のボタンから現在地の公式ハザードマップを開けます。\n①公式ハザードマップを確認 → 市区町村が公開しているPDF\n②リスクを地図で見る → 浸水・土砂を地図で重ねて確認',
    mockFamily: '「安否連絡」ボタンから連絡文を自動生成できます。LINEやSMSで家族に送ってください。',
    mockGas: '火気を使わず、すぐ窓を開けて換気してください。\nブレーカーは触らず、屋外へ出て119番か都市ガス会社へ連絡してください。',
    mockInjury: 'まず出血している場所を清潔な布で強く押さえてください。',
    mockRain: '警戒レベル4「避難指示」が出たらすぐ避難してください。\n①河川・用水路に近づかない ②夜間の徒歩避難は危険 ③「まだ大丈夫」と思わず早めに動く',
    mockEarthquake: '揺れている間はテーブルの下で頭を守ってください。\n揺れが収まったら ①ガスの元栓を閉める ②余震に注意して安全な場所へ ③海沿いなら高台へ',
    mockDefault: 'まず身の安全を確保してください。\n具体的に何が起きているか教えてもらえると、より的確に案内できます。',
    nearestRoute: '最寄り避難所への経路を表示',
    routeTo: '{name}への経路を表示',
    voiceUnsupported: 'このブラウザは音声入力に未対応です（Chrome / Edge 推奨）',
    speakNow: '🎙 お話しください...',
    voiceError: '音声入力エラー: {error}'
  },
  en: {
    speechLang: 'en-US',
    systemPrompt: 'You are an AI disaster support assistant. Assume every question involves an ongoing or just-occurred disaster.\nNever use filler phrases like "First of all", "Just to confirm", or "Question 1". Start replies with the action directly. No Markdown.\nInjury/first aid: max 2-3 sentences. One action + one follow-up question. Example: "Press the wound firmly with a clean cloth for 5 minutes. Is the bleeding slowing down?"\nShelter/evacuation: include name, distance, walking time, and route details. Max 5 sentences.\nLife danger→advise 119. Off-topic→reply only "This app is for disaster support only."',
    properNounRule: 'When you mention a Japanese shelter name, facility name, campus name, or address, write it in English (use the official name or a readable transliteration) and add the original Japanese in parentheses right after, e.g. "Tokyo Denki University Saitama Hatoyama Campus (学校法人東京電機大学 埼玉鳩山キャンパス)". Never output a Japanese proper noun on its own without the English rendering.',
    currentInfo: '[Current information collected by the app]',
    currentLocation: '[Current location]',
    gettingLocation: 'Loading...',
    latLng: 'Lat {lat}° / Lng {lng}°',
    nearbySheltersHeader: '[Nearby shelters, closest first: {count} total]',
    supported: 'Supports: ',
    others: '  +{count} more',
    backendFallback: 'Backend request failed; falling back to direct API:',
    openaiError: 'OpenAI API error:',
    openaiCommError: 'OpenAI API communication error:',
    ragReplyPrefix: '📖 From the disaster manual [{category}: {title}]\n\n{content}\n\nFeel free to ask a follow-up question.',
    mockShelter: 'Nearby shelters are shown in the list. Tap a map pin to check directions.',
    mockHazard: 'You can open the official hazard map using the buttons below.\n① Official hazard map → municipal PDF/info\n② Risk map → overlay flood and landslide risks on the map',
    mockFamily: 'Use the “Safety Message” button to generate a message and send it to family via LINE or SMS.',
    mockGas: 'Do not use fire. Open windows immediately for ventilation.\nDo not touch breakers; go outside and call 119 or the gas company.',
    mockInjury: 'First, press the bleeding area firmly with a clean cloth.',
    mockRain: 'Evacuate immediately if Evacuation Order Level 4 is issued.\n① Stay away from rivers ② Night evacuation is dangerous ③ Act early, do not wait.',
    mockEarthquake: 'Protect your head under a table while shaking continues.\nAfter it stops: ① close the gas valve ② watch for aftershocks ③ near the coast, move to high ground.',
    mockDefault: 'First, secure your own safety.\nTell me what is happening, and I can guide you more accurately.',
    nearestRoute: 'Show Route to Nearest Shelter',
    routeTo: 'Show route to {name}',
    voiceUnsupported: 'Voice input is not supported in this browser. Chrome / Edge is recommended.',
    speakNow: '🎙 Please speak...',
    voiceError: 'Voice input error: {error}'
  },
  zh: {
    speechLang: 'zh-CN',
    systemPrompt: '你是防灾支援AI。假设所有问题均发生在灾害中或刚发生后。\n不要使用”首先””确认一下”等前置词。直接写行动。不使用Markdown。\n受伤/急救：最多2～3句。一个行动+一个询问。例：”用干净布料用力按压伤口5分钟。出血有没有减少？”\n避难所/避难路线：告知名称、距离、步行时间、路线特点。最多5句。\n有生命危险→告知119。与防灾无关→只回答”本应用仅用于防灾支援”。',
    properNounRule: '提及日本的避难所名称、设施名称、校区名称或地址时，请用中文书写（使用官方名称或可读的音译），并在其后用括号附上日语原名，例如“东京电机大学 埼玉鸠山校区（学校法人東京電機大学 埼玉鳩山キャンパス）”。不要单独输出未翻译的日语专有名词。',
    currentInfo: '【应用获取的当前信息】', currentLocation: '【当前位置】', gettingLocation: '获取中...',
    latLng: '纬度{lat}° / 经度{lng}°', nearbySheltersHeader: '【附近避难所（按距离排序，共{count}处）】',
    supported: '对应：', others: '  另有{count}处', backendFallback: '后端通信失败，改为直接API:',
    openaiError: 'OpenAI API错误:', openaiCommError: 'OpenAI API通信错误:',
    ragReplyPrefix: '📖 防灾手册【{category}：{title}】\n\n{content}\n\n如需更多信息，请继续提问。',
    mockShelter: '附近避难所显示在列表中。点击地图图钉可查看路线。',
    mockHazard: '可通过下方按钮打开当前位置的官方灾害地图。\n①查看官方灾害地图\n②在地图上查看风险',
    mockFamily: '可通过“安否联系”按钮自动生成联系信息，并通过LINE或短信发送给家人。',
    mockGas: '不要使用明火，立即开窗通风。\n不要触碰断路器，到室外后联系119或燃气公司。',
    mockInjury: '首先，用干净的布料用力按压出血部位。',
    mockRain: '发布警戒等级4“避难指示”时请立即避难。\n①远离河流 ②夜间避难危险 ③尽早行动。',
    mockEarthquake: '摇晃时请躲到桌下保护头部。\n摇晃停止后：①关闭煤气 ②注意余震 ③沿海地区前往高处。',
    mockDefault: '请先确保自身安全。\n告诉我现在发生了什么，我可以更准确地引导你。',
    nearestRoute: '显示最近避难所的路线', routeTo: '显示前往{name}的路线',
    voiceUnsupported: '此浏览器不支持语音输入（推荐 Chrome / Edge）', speakNow: '🎙 请讲话...', voiceError: '语音输入错误: {error}'
  },
  ko: {
    speechLang: 'ko-KR',
    systemPrompt: '방재 지원 AI입니다. 모든 질문은 재해 발생 중·직후 상황을 전제로 답하세요.\n”우선””확인차 말씨드리면” 접속사 금지. 행동을 바로 쓰세요. Markdown 금지.\n부상/응급처치： 2～3문장 이내. 행동 하나+상황 확인 하나. 예：”깨끗한 수건으로 상처를 5분 강하게 눌러 주세요. 지혈이 줄어들고 있나요?”\n대피소/대피로연： 이름·거리·도보 시간·경로 특징을 말할 것. 5문장 이내.\n생명 위험→119 안내. 방재 무관→”방재 전용 앱입니다”라고만 답할 것.',
    properNounRule: '일본의 대피소 이름, 시설명, 캠퍼스명, 주소를 언급할 때는 한국어로 적고(공식 명칭 또는 읽기 쉬운 음역 사용) 바로 뒤 괄호 안에 일본어 원래 이름을 함께 표기하세요. 예: “도쿄전기대학 사이타마 하토야마 캠퍼스 (学校法人東京電機大学 埼玉鳩山キャンパス)”. 일본어 고유명사를 번역 없이 단독으로 출력하지 마세요.',
    currentInfo: '【앱이 수집한 현재 정보】', currentLocation: '【현재 위치】', gettingLocation: '가져오는 중...',
    latLng: '위도 {lat}° / 경도 {lng}°', nearbySheltersHeader: '【가까운 대피소（가까운 순・총 {count}개）】',
    supported: '대응：', others: '  외 {count}개', backendFallback: '백엔드 통신 실패, 직접 API로 전환:',
    openaiError: 'OpenAI API 오류:', openaiCommError: 'OpenAI API 통신 오류:',
    ragReplyPrefix: '📖 방재 매뉴얼【{category}：{title}】\n\n{content}\n\n더 궁금한 점이 있으면 질문해 주세요.',
    mockShelter: '가까운 대피소는 목록에 표시됩니다. 지도 핀을 누르면 경로를 확인할 수 있습니다.',
    mockHazard: '아래 버튼에서 현재 위치의 공식 재해 지도를 열 수 있습니다.\n①공식 재해 지도 확인\n②지도에서 위험 확인',
    mockFamily: '“안부 연락” 버튼으로 연락문을 자동 생성해 LINE이나 문자로 가족에게 보내세요.',
    mockGas: '불을 사용하지 말고 즉시 창문을 열어 환기하세요.\n차단기는 만지지 말고 밖으로 나가 119 또는 가스회사에 연락하세요.',
    mockInjury: '먼저 출혈 부위를 깨끗한 천으로 강하게 눌러 주세요.',
    mockRain: '경계 레벨 4 “대피 지시”가 나오면 즉시 대피하세요.\n①강·수로에 접근 금지 ②야간 대피는 위험 ③일찍 행동하세요.',
    mockEarthquake: '흔들리는 동안 책상 아래에서 머리를 보호하세요.\n멈춘 뒤 ①가스 밸브 잠그기 ②여진 주의 ③해안가라면 고지대로 이동하세요.',
    mockDefault: '먼저 자신의 안전을 확보하세요.\n무슨 일이 일어나고 있는지 알려주면 더 정확히 안내할 수 있습니다.',
    nearestRoute: '가장 가까운 대피소 경로 표시', routeTo: '{name} 경로 표시',
    voiceUnsupported: '이 브라우저는 음성 입력을 지원하지 않습니다（Chrome / Edge 권장）', speakNow: '🎙 말씀해 주세요...', voiceError: '음성 입력 오류: {error}'
  },
  pt: {
    speechLang: 'pt-BR',
    systemPrompt: 'Você é uma IA de suporte a desastres. Assuma que toda pergunta ocorre durante ou logo após um desastre.\nSem expressões como "Primeiro de tudo" ou "Só para confirmar". Comece direto com a ação. Sem Markdown.\nFerimento/primeiros socorros: máx. 2-3 frases. Uma ação + uma pergunta. Ex: "Pressione o ferimento com um pano limpo por 5 minutos. O sangramento está diminuindo?"\nAbrigo/rota de fuga: informe nome, distância, tempo a pé e detalhes do trajeto. Máx. 5 frases.\nRisco de vida→oriente 119. Fora do tema→responda só "Este app é exclusivo para desastres".',
    properNounRule: 'Ao mencionar nomes de abrigos, instalações, campus ou endereços japoneses, escreva-os em português (use o nome oficial ou uma transliteração legível) e adicione o nome original em japonês entre parênteses logo em seguida, por exemplo "Universidade Tokyo Denki, Campus Saitama Hatoyama (学校法人東京電機大学 埼玉鳩山キャンパス)". Nunca escreva um nome próprio japonês sozinho, sem a versão em português.',
    currentInfo: '[Informações atuais obtidas pelo app]', currentLocation: '[Localização atual]', gettingLocation: 'Carregando...',
    latLng: 'Lat {lat}° / Lng {lng}°', nearbySheltersHeader: '[Abrigos próximos, por distância: {count} no total]',
    supported: 'Atende: ', others: '  +{count} mais', backendFallback: 'Falha no backend; usando API direta:',
    openaiError: 'Erro da API OpenAI:', openaiCommError: 'Erro de comunicação com OpenAI:',
    ragReplyPrefix: '📖 Manual de desastres [{category}: {title}]\n\n{content}\n\nSe quiser, faça outra pergunta.',
    mockShelter: 'Os abrigos próximos aparecem na lista. Toque no pin do mapa para ver a rota.',
    mockHazard: 'Você pode abrir o mapa oficial de riscos pelos botões abaixo.\n①Mapa oficial\n②Mapa de riscos com camadas',
    mockFamily: 'Use o botão “Mensagem de Segurança” para gerar uma mensagem e enviar para a família via LINE ou SMS.',
    mockGas: 'Não use fogo. Abra as janelas para ventilar.\nNão toque no disjuntor; saia e ligue para 119 ou para a companhia de gás.',
    mockInjury: 'Primeiro, pressione firmemente o local do sangramento com um pano limpo.',
    mockRain: 'Evacue imediatamente se houver Ordem de Evacuação nível 4.\n①Fique longe de rios ②Evacuar à noite é perigoso ③Aja cedo.',
    mockEarthquake: 'Durante o tremor, proteja a cabeça embaixo de uma mesa.\nDepois: ①feche o gás ②cuidado com réplicas ③perto da costa, vá para local alto.',
    mockDefault: 'Primeiro garanta sua segurança.\nDiga o que está acontecendo para eu orientar melhor.',
    nearestRoute: 'Mostrar rota para o abrigo mais próximo', routeTo: 'Mostrar rota para {name}',
    voiceUnsupported: 'Entrada de voz não suportada neste navegador. Chrome / Edge recomendado.', speakNow: '🎙 Fale agora...', voiceError: 'Erro de entrada de voz: {error}'
  }
};

var HAZARD_TRIGGER_WORDS = [
  'ハザード', '浸水', '洪水', '津波', '土砂', '高潮', '液状化', 'リスク',
  'hazard', 'flood', 'tsunami', 'landslide', 'risk',
  '灾害地图', '洪水', '海啸', '风险',
  '재해', '홍수', '해일', '위험',
  'risco', 'inundação', 'tsunami'
];
var SHELTER_TRIGGER_WORDS = [
  '避難所', '避難場所', '逃げ場', 'シェルター',
  'shelter', 'evacuation', 'refuge',
  '避难', '避難', '庇护',
  '대피소', '피난처',
  'abrigo', 'refúgio'
];

function chatLang() {
  if (typeof getCurrentLang === 'function') return getCurrentLang();
  try { return localStorage.getItem('bosai_lang') || 'ja'; }
  catch (e) { return 'ja'; }
}
function chatDict() {
  var lang = chatLang();
  return CHAT_I18N[lang] || CHAT_I18N.ja;
}
function fmt(template, vars) {
  return String(template).replace(/\{(\w+)\}/g, function(_, k) {
    return vars[k] !== undefined ? vars[k] : '';
  });
}
function getI18nValue(key, fallback) {
  if (typeof t === 'function') return t(key);
  var lang = chatLang();
  if (typeof I18N !== 'undefined' && I18N[lang] && I18N[lang][key] !== undefined) return I18N[lang][key];
  if (typeof I18N !== 'undefined' && I18N.ja && I18N.ja[key] !== undefined) return I18N.ja[key];
  return fallback || key;
}
function getSystemPrompt() {
  var d = chatDict();
  var langInstruction = getI18nValue('langInstruction', '');
  var properNounRule = d.properNounRule || '';
  return d.systemPrompt +
    (langInstruction ? '\n' + langInstruction : '') +
    (properNounRule ? '\n' + properNounRule : '');
}

// ========================================
// AI返答（バックエンド → OpenAI直接 → RAGフォールバック）
// ========================================
function buildLocationContext() {
  var d = chatDict();
  var lines = [];
  var locEl = document.querySelector('.loc-name');
  var locText = locEl ? locEl.textContent.trim() : '';
  if (locText && locText !== d.gettingLocation && locText !== '取得中...') {
    lines.push(d.currentLocation + locText);
  } else if (typeof myLat !== 'undefined' && myLat != null) {
    lines.push(d.currentLocation + fmt(d.latLng, { lat: myLat.toFixed(4), lng: myLng.toFixed(4) }));
  }
  if (window.locationHazardContext) lines.push(window.locationHazardContext);
  if (typeof shownShelters !== 'undefined' && shownShelters.length > 0) {
    lines.push(fmt(d.nearbySheltersHeader, { count: shownShelters.length }));
    shownShelters.slice(0, 5).forEach(function(s, i) {
      // 翻訳済みの名前に日本語原名を併記してAIへ渡す（原名を残すと現地の看板と照合できる）
      var nameText = s.name;
      if (s.originalName && s.originalName !== s.name) {
        nameText = s.name + '（' + s.originalName + '）';
      }
      var line = (i + 1) + '. ' + nameText;
      if (s.dist) line += '（' + s.dist + '）';
      if (s.address) line += ' ' + s.address;
      if (s.disasters && s.disasters.length) line += ' ' + d.supported + s.disasters.join('・');
      lines.push(line);
    });
    if (shownShelters.length > 5) lines.push(fmt(d.others, { count: shownShelters.length - 5 }));
  }
  return lines.join('\n');
}

function stripMarkdown(text) {
  return String(text || '')
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/^#{1,6}\s*/gm, '')
    .replace(/^>\s*/gm, '')
    .replace(/^[-*+]\s+/gm, '・')
    .replace(/`(.+?)`/g, '$1')
    .replace(/\[(.+?)\]\(.+?\)/g, '$1')
    .trim();
}

async function aiReply(userText, ragResults) {
  var d = chatDict();
  var context = '';
  if (ragResults && ragResults.length > 0 && typeof ManualRAG !== 'undefined') {
    context = ManualRAG.buildContext(ragResults);
  }
  var locationCtx = buildLocationContext();
  var effectiveSystemPrompt = getSystemPrompt() +
    (locationCtx ? '\n\n' + d.currentInfo + '\n' + locationCtx : '');

  var apiKey = (typeof OPENAI_API_KEY !== 'undefined') ? OPENAI_API_KEY : '';
  var model  = (typeof OPENAI_MODEL  !== 'undefined') ? OPENAI_MODEL  : 'gpt-4o-mini';

  // ① バックエンドサーバ経由
  if (typeof BACKEND_URL !== 'undefined' && BACKEND_URL) {
    try {
      var res = await fetch(BACKEND_URL.replace(/\/$/, '') + '/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system: effectiveSystemPrompt,
          context: context,
          messages: messages.slice(-20)
        })
      });
      if (res.ok) {
        var bd = await res.json();
        if (bd.reply) return bd.reply;
      } else {
        var errText = await res.text();
        console.warn('/api/chat error:', res.status, errText);
      }
    } catch (e) {
      console.warn(d.backendFallback, e);
    }
  }

  // ② ブラウザから直接 OpenAI API を呼ぶ（フォールバック）
  if (apiKey) {
    try {
      var inputMsgs = [
        { role: 'system', content: effectiveSystemPrompt + (context ? '\n\n' + context : '') }
      ].concat(messages.slice(-20));
      var response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + apiKey
        },
        body: JSON.stringify({
          model: model,
          messages: inputMsgs,
          max_completion_tokens: 900
        })
      });
      if (!response.ok) {
        console.warn(d.openaiError, response.status, await response.text());
        return mockReply(userText, ragResults);
      }
      var data = await response.json();
      var reply = (data.choices && data.choices[0] && data.choices[0].message)
        ? data.choices[0].message.content : '';
      return reply || mockReply(userText, ragResults);
    } catch (e) {
      console.warn(d.openaiCommError, e);
      return mockReply(userText, ragResults);
    }
  }

  // ③ APIキー未設定ならキーワードマッチで返答
  return mockReply(userText, ragResults);
}

function mockReply(userText, ragResults) {
  var d = chatDict();
  if (ragResults && ragResults.length > 0) {
    var top = ragResults[0];
    return fmt(d.ragReplyPrefix, {
      category: top.category,
      title: top.title,
      content: top.content
    });
  }
  var q = String(userText || '').toLowerCase();
  if (q.includes('避難所') || q.includes('どこ') || q.includes('shelter') || q.includes('避难') || q.includes('대피소') || q.includes('abrigo')) return d.mockShelter;
  if (q.includes('ハザード') || q.includes('マップ') || q.includes('浸水') || q.includes('hazard') || q.includes('risk') || q.includes('风险') || q.includes('위험') || q.includes('risco')) return d.mockHazard;
  if (q.includes('家族') || q.includes('連絡') || q.includes('安否') || q.includes('family') || q.includes('contact') || q.includes('家人') || q.includes('가족') || q.includes('família')) return d.mockFamily;
  if (q.includes('ガス') || q.includes('臭') || q.includes('gas')) return d.mockGas;
  if (q.includes('けが') || q.includes('怪我') || q.includes('injur') || q.includes('受伤') || q.includes('부상')) return d.mockInjury;
  if (q.includes('雨') || q.includes('洪水') || q.includes('台風') || q.includes('rain') || q.includes('flood') || q.includes('typhoon') || q.includes('暴雨') || q.includes('홍수')) return d.mockRain;
  if (q.includes('地震') || q.includes('earthquake') || q.includes('terremoto') || q.includes('지진')) return d.mockEarthquake;
  return d.mockDefault;
}

// ========================================
// チャット履歴（複数会話の保存・一覧・閲覧）localStorage
// ========================================
var CHAT_HISTORY_KEY = 'bosai_chat_messages';   // 旧バージョンの単一会話キー（移行用）
var CONV_KEY         = 'bosai_conversations';   // 会話の配列
var CUR_CONV_KEY     = 'bosai_current_conv_id';  // 現在開いている会話ID

// 履歴UI・トーストの多言語文言（CHAT_I18N と独立した軽量辞書）
var HISTORY_I18N = {
  ja: { restored: '前回の会話を復元しました', cleared: '会話履歴をすべて削除しました',
        welcome: '防災に関するご相談をお受けします。気になることを入力するか、下のボタンからお選びください。',
        historyTitle: '会話履歴', newConversation: '新しい会話', noHistory: 'まだ会話履歴はありません',
        untitled: '（無題の会話）', deleteLabel: '削除', confirmDeleteOne: 'この会話を削除しますか？',
        confirmClearAll: 'すべての会話履歴を削除しますか？',
        justNow: 'たった今', minutesAgo: '{n}分前', hoursAgo: '{n}時間前', daysAgo: '{n}日前' },
  en: { restored: 'Restored your previous conversation', cleared: 'All conversation history deleted',
        welcome: 'I can help with disaster preparedness and emergency actions. Type your concern or choose a button below.',
        historyTitle: 'Chat History', newConversation: 'New conversation', noHistory: 'No conversation history yet',
        untitled: '(Untitled conversation)', deleteLabel: 'Delete', confirmDeleteOne: 'Delete this conversation?',
        confirmClearAll: 'Delete all conversation history?',
        justNow: 'Just now', minutesAgo: '{n} min ago', hoursAgo: '{n} h ago', daysAgo: '{n} d ago' },
  zh: { restored: '已恢复上次的对话', cleared: '已删除全部对话历史',
        welcome: '我可以协助防灾和紧急行动。请输入您关心的问题，或从下方按钮中选择。',
        historyTitle: '对话历史', newConversation: '新对话', noHistory: '暂无对话历史',
        untitled: '（无标题对话）', deleteLabel: '删除', confirmDeleteOne: '要删除此对话吗？',
        confirmClearAll: '要删除全部对话历史吗？',
        justNow: '刚刚', minutesAgo: '{n}分钟前', hoursAgo: '{n}小时前', daysAgo: '{n}天前' },
  ko: { restored: '이전 대화를 복원했습니다', cleared: '모든 대화 기록을 삭제했습니다',
        welcome: '방재와 긴급 행동을 도와드립니다. 궁금한 내용을 입력하거나 아래 버튼을 선택하세요.',
        historyTitle: '대화 기록', newConversation: '새 대화', noHistory: '아직 대화 기록이 없습니다',
        untitled: '(제목 없는 대화)', deleteLabel: '삭제', confirmDeleteOne: '이 대화를 삭제할까요?',
        confirmClearAll: '모든 대화 기록을 삭제할까요?',
        justNow: '방금', minutesAgo: '{n}분 전', hoursAgo: '{n}시간 전', daysAgo: '{n}일 전' },
  pt: { restored: 'Conversa anterior restaurada', cleared: 'Todo o histórico de conversas foi apagado',
        welcome: 'Posso ajudar com prevenção de desastres e ações de emergência. Digite sua dúvida ou escolha um botão abaixo.',
        historyTitle: 'Histórico de conversas', newConversation: 'Nova conversa', noHistory: 'Nenhum histórico de conversa ainda',
        untitled: '(Conversa sem título)', deleteLabel: 'Excluir', confirmDeleteOne: 'Excluir esta conversa?',
        confirmClearAll: 'Excluir todo o histórico de conversas?',
        justNow: 'Agora mesmo', minutesAgo: 'há {n} min', hoursAgo: 'há {n} h', daysAgo: 'há {n} d' }
};
function historyDict() {
  var lang = chatLang();
  return HISTORY_I18N[lang] || HISTORY_I18N.ja;
}

// --- localStorage 入出力ヘルパ ---
function _histSet(key, value) {
  if (typeof _saveSetting === 'function') { _saveSetting(key, value); return; }
  try { localStorage.setItem(key, value); } catch (e) {}
}
function _histGet(key) {
  if (typeof _loadSetting === 'function') return _loadSetting(key);
  try { return localStorage.getItem(key); } catch (e) { return null; }
}
function _loadConversations() {
  try {
    var raw = _histGet(CONV_KEY);
    var arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch (e) { return []; }
}
function _saveConversations(arr) { _histSet(CONV_KEY, JSON.stringify(arr)); }
function getCurrentConvId() { return _histGet(CUR_CONV_KEY) || ''; }
function setCurrentConvId(id) { _histSet(CUR_CONV_KEY, id || ''); }
function _genId() { return 'c' + Date.now() + Math.random().toString(36).slice(2, 7); }
function _findConv(arr, id) {
  for (var i = 0; i < arr.length; i++) if (arr[i].id === id) return arr[i];
  return null;
}
function _sortByRecent(arr) {
  return arr.slice().sort(function (a, b) { return (b.updatedAt || 0) - (a.updatedAt || 0); });
}
function _titleFromMessages(msgs) {
  for (var i = 0; i < msgs.length; i++) {
    if (msgs[i].role === 'user') {
      var s = String(msgs[i].content || '').replace(/\s+/g, ' ').trim();
      if (s) return s.length > 30 ? s.slice(0, 30) + '…' : s;
    }
  }
  return historyDict().untitled;
}
function _relTime(ts) {
  var d = historyDict();
  var diff = Date.now() - (ts || 0);
  var min = Math.floor(diff / 60000);
  if (min < 1) return d.justNow;
  if (min < 60) return fmt(d.minutesAgo, { n: min });
  var hr = Math.floor(min / 60);
  if (hr < 24) return fmt(d.hoursAgo, { n: hr });
  var day = Math.floor(hr / 24);
  if (day < 7) return fmt(d.daysAgo, { n: day });
  var dt = new Date(ts);
  return dt.getFullYear() + '/' + (dt.getMonth() + 1) + '/' + dt.getDate();
}

// 旧バージョンの単一会話キーを、新しい会話リストへ一度だけ移行
function _migrateOldHistory() {
  var old = _histGet(CHAT_HISTORY_KEY);
  if (!old) return;
  try {
    var msgs = JSON.parse(old);
    if (Array.isArray(msgs) && msgs.length) {
      var convs = _loadConversations();
      var id = _genId();
      convs.push({ id: id, title: _titleFromMessages(msgs), updatedAt: Date.now(), messages: msgs });
      _saveConversations(convs);
      setCurrentConvId(id);
    }
  } catch (e) {}
  _histSet(CHAT_HISTORY_KEY, '');  // 旧キーは消す
}

// 現在の会話を localStorage に保存（新規なら作成・既存なら更新）
function saveChatHistory() {
  if (!messages || messages.length === 0) return;  // 空の会話は保存しない
  var convs = _loadConversations();
  var id = getCurrentConvId();
  var conv = id ? _findConv(convs, id) : null;
  var now = Date.now();
  var title = _titleFromMessages(messages);
  if (conv) {
    conv.messages = messages.slice();
    conv.title = title;
    conv.updatedAt = now;
  } else {
    id = _genId();
    setCurrentConvId(id);
    convs.push({ id: id, title: title, updatedAt: now, messages: messages.slice() });
  }
  _saveConversations(convs);
}

// 指定メッセージ配列をチャット欄に描画（先頭に初期メッセージ）
function _renderConversation(msgs) {
  var box = document.getElementById('chatMsgs');
  if (!box) return;
  box.innerHTML = '<div class="msg ai"><div class="ai-av">AI</div><div>' +
    '<div class="bubble">' + historyDict().welcome + '</div></div></div>';
  var prevSpeech = speechEnabled;
  speechEnabled = false;             // 復元・切替中は読み上げしない
  (msgs || []).forEach(function (m) {
    addMsg(m.role === 'assistant' ? 'ai' : 'user', m.content);
  });
  speechEnabled = prevSpeech;
  messages = (msgs || []).slice();
  chatHistory = (msgs || []).map(function (m) { return m.content; });
  if (typeof SafetyMsg !== 'undefined') SafetyMsg.setChatHistory(chatHistory);
  box.scrollTop = box.scrollHeight;
}

// アプリ起動時：直近の会話を復元
function loadChatHistory() {
  _migrateOldHistory();
  var convs = _loadConversations();
  if (!convs.length) return;
  var id = getCurrentConvId();
  var conv = id ? _findConv(convs, id) : null;
  if (!conv) { conv = _sortByRecent(convs)[0]; setCurrentConvId(conv.id); }
  if (!conv.messages || !conv.messages.length) return;
  _renderConversation(conv.messages);
  if (typeof showToast === 'function') showToast(historyDict().restored);
}

// 会話履歴モーダルを表示（openModal は自動翻訳が走るので枠だけ再利用）
function _showHistoryModal(title, html) {
  var titleEl = document.getElementById('modalTitle');
  var bodyEl = document.getElementById('modalBody');
  var overlay = document.getElementById('modalOverlay');
  if (!titleEl || !bodyEl || !overlay) return;
  titleEl.textContent = title;
  bodyEl.innerHTML = html;
  overlay.classList.remove('hidden');
}

// 「≡ 会話履歴」リンク → 過去の会話一覧を表示
function openHistory() {
  var d = historyDict();
  var convs = _sortByRecent(_loadConversations());
  var curId = getCurrentConvId();
  var html = '<button onclick="newConversation()" style="width:100%;padding:12px;margin-bottom:14px;' +
    'background:#1E5BC0;color:#fff;border:none;border-radius:8px;font-size:14px;font-weight:600;' +
    'cursor:pointer;font-family:inherit">＋ ' + esc(d.newConversation) + '</button>';

  if (!convs.length) {
    html += '<p style="text-align:center;color:#9CA5B5;font-size:13px;padding:24px 0">' + esc(d.noHistory) + '</p>';
  } else {
    convs.forEach(function (c) {
      var isCur = (c.id === curId);
      var title = c.title || d.untitled;
      html += '<div onclick="openConversation(\'' + c.id + '\')" style="display:flex;align-items:center;gap:10px;' +
        'padding:12px 14px;margin-bottom:8px;background:' + (isCur ? '#E8F0FC' : '#F8FAFC') + ';' +
        'border:1px solid ' + (isCur ? '#1E5BC0' : '#E2E8F0') + ';border-radius:8px;cursor:pointer">' +
          '<div style="flex:1;min-width:0">' +
            '<div style="font-size:13px;font-weight:600;color:#1a2332;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">' + esc(title) + '</div>' +
            '<div style="font-size:11px;color:#5F6B7C;margin-top:2px">' + esc(_relTime(c.updatedAt)) + '</div>' +
          '</div>' +
          '<button onclick="event.stopPropagation();deleteConversation(\'' + c.id + '\')" title="' + esc(d.deleteLabel) + '" ' +
            'style="background:none;border:none;color:#DC2626;cursor:pointer;font-size:16px;padding:4px 8px;line-height:1">✕</button>' +
        '</div>';
    });
  }
  _showHistoryModal(d.historyTitle, html);
}

// 過去の会話を開く
function openConversation(id) {
  var conv = _findConv(_loadConversations(), id);
  if (!conv) return;
  setCurrentConvId(id);
  _renderConversation(conv.messages);
  if (typeof closeModal === 'function') closeModal();
}

// 新しい会話を開始（今の会話は保存してから空にする）
function newConversation() {
  saveChatHistory();
  setCurrentConvId('');
  messages = [];
  chatHistory = [];
  if (typeof SafetyMsg !== 'undefined') SafetyMsg.setChatHistory(chatHistory);
  _renderConversation([]);
  if (typeof closeModal === 'function') closeModal();
}

// 1件の会話を削除
function deleteConversation(id) {
  if (!confirm(historyDict().confirmDeleteOne)) return;
  var convs = _loadConversations().filter(function (c) { return c.id !== id; });
  _saveConversations(convs);
  if (getCurrentConvId() === id) {
    if (convs.length) {
      var recent = _sortByRecent(convs)[0];
      setCurrentConvId(recent.id);
      _renderConversation(recent.messages);
    } else {
      setCurrentConvId('');
      messages = []; chatHistory = [];
      if (typeof SafetyMsg !== 'undefined') SafetyMsg.setChatHistory(chatHistory);
      _renderConversation([]);
    }
  }
  openHistory();  // 一覧を再描画
}

// すべての会話履歴を削除（設定画面から）
function clearAllHistory() {
  if (!confirm(historyDict().confirmClearAll)) return;
  _saveConversations([]);
  setCurrentConvId('');
  messages = [];
  chatHistory = [];
  if (typeof SafetyMsg !== 'undefined') SafetyMsg.setChatHistory(chatHistory);
  _renderConversation([]);
  if (typeof showToast === 'function') showToast(historyDict().cleared);
}

// 旧名の後方互換（設定UI等が参照していた場合に備える）
function clearChatHistory() { clearAllHistory(); }

// ========================================
// メッセージ送受信
// ========================================
async function sendMessage() {
  var input = document.getElementById('chatInput');
  var userText = input.value.trim();
  if (!userText) return;
  input.value = '';
  addMsg('user', userText);

  messages.push({ role: 'user', content: userText });
  chatHistory.push(userText);
  if (typeof SafetyMsg !== 'undefined') SafetyMsg.setChatHistory(chatHistory);

  var msgBox = document.getElementById('chatMsgs');
  var typing = document.createElement('div');
  typing.className = 'msg ai';
  typing.id = 'typing';
  typing.innerHTML = '<div class="ai-av">AI</div><div class="bubble">' +
    '<div class="typing-dots"><span></span><span></span><span></span></div></div>';
  msgBox.appendChild(typing);
  msgBox.scrollTop = msgBox.scrollHeight;

  var ragResults = (typeof ManualRAG !== 'undefined') ? ManualRAG.search(userText) : [];
  var reply = stripMarkdown(await aiReply(userText, ragResults));
  var el = document.getElementById('typing');
  if (el) el.remove();

  var actions = buildMessageActions(userText, reply);
  addMsg('ai', reply, actions);

  messages.push({ role: 'assistant', content: reply });
  chatHistory.push(reply);
  if (typeof SafetyMsg !== 'undefined') SafetyMsg.setChatHistory(chatHistory);
  if (messages.length > 40) messages = messages.slice(-40);

  // 会話を localStorage に保存（リロードしても復元できる）
  saveChatHistory();
}

function buildMessageActions(userText, reply) {
  var mapSvg = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
    '<polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/>' +
    '<line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>';
  var navSvg = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">' +
    '<polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>';
  var lowerUser = String(userText || '').toLowerCase();
  var lowerReply = String(reply || '').toLowerCase();
  var d = chatDict();
  var html = '';

  var isShelterMsg = SHELTER_TRIGGER_WORDS.some(function(w) {
    return lowerUser.indexOf(w.toLowerCase()) !== -1;
  });
  if (isShelterMsg) {
    var nearest = (typeof shownShelters !== 'undefined' && shownShelters.length > 0) ? shownShelters[0] : null;
    var label = nearest ? fmt(d.routeTo, { name: nearest.name }) : d.nearestRoute;
    html += '<button class="msg-action-btn" onclick="openNearestShelterRoute()">' + navSvg + esc(label) + '</button>';
  }

  var isHazardMsg = HAZARD_TRIGGER_WORDS.some(function(w) {
    var key = w.toLowerCase();
    return lowerUser.indexOf(key) !== -1 || lowerReply.indexOf(key) !== -1;
  });
  if (isHazardMsg) {
    html += '<button class="msg-action-btn" onclick="openWagamachiMap()">' +
      mapSvg + esc(getI18nValue('msgBtnOfficialMap', '公式ハザードマップを確認')) + '</button>';
    html += '<button class="msg-action-btn" onclick="openKasaneruMap()" style="background:#4B5563;">' +
      mapSvg + esc(getI18nValue('msgBtnRiskMap', 'リスクを地図で見る')) + '</button>';
  }
  return html;
}

function addMsg(role, text, actionsHtml) {
  var msgBox = document.getElementById('chatMsgs');
  var div = document.createElement('div');
  div.className = 'msg ' + role;
  var n = new Date();
  var tm = String(n.getHours()).padStart(2, '0') + ':' + String(n.getMinutes()).padStart(2, '0');
  if (role === 'user') {
    div.innerHTML = '<div class="bubble">' + esc(text) + '</div><div class="msg-time">' + tm + '</div>';
  } else {
    div.innerHTML = '<div class="ai-av">AI</div><div>' +
      '<div class="bubble">' + esc(text) + '</div>' +
      (actionsHtml ? '<div class="msg-actions">' + actionsHtml + '</div>' : '') +
      '<div class="msg-time">' + tm + '</div>' +
      '</div>';
  }
  msgBox.appendChild(div);
  msgBox.scrollTop = msgBox.scrollHeight;
  if (role === 'ai' && speechEnabled) speak(text);
}

function esc(s) {
  return String(s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/\n/g, '<br>');
}

function quickMsg(text) {
  document.getElementById('chatInput').value = text;
  sendMessage();
}

// ========================================
// 音声入力（Web Speech API）
// ========================================
var recognition = null;
var micActive = false;
function toggleMic() {
  var d = chatDict();
  var SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) {
    showToast(d.voiceUnsupported);
    return;
  }
  if (micActive) {
    if (recognition) recognition.stop();
    return;
  }
  recognition = new SR();
  recognition.lang = d.speechLang;
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;
  recognition.onstart = function () {
    micActive = true;
    document.getElementById('micBtn').classList.add('active');
    showToast(d.speakNow);
  };
  recognition.onresult = function (e) {
    var text = e.results[0][0].transcript;
    document.getElementById('chatInput').value = text;
    sendMessage();
  };
  recognition.onerror = function (e) {
    showToast(fmt(chatDict().voiceError, { error: e.error }));
  };
  recognition.onend = function () {
    micActive = false;
    document.getElementById('micBtn').classList.remove('active');
  };
  recognition.start();
}

// ========================================
// 音声読み上げ（Web Speech API）
// ========================================
var speechEnabled = true;
function updateSpeechReadButtonUI() {
  var btn = document.getElementById('speechReadBtn');
  if (!btn) return;

  btn.classList.toggle('active', speechEnabled);
  btn.classList.toggle('speech-off', !speechEnabled);

  var label = speechEnabled
    ? (typeof t === 'function' ? t('btnVoiceRead') + ' ON' : '音声読み上げ ON')
    : (typeof t === 'function' ? t('btnVoiceRead') + ' OFF' : '音声読み上げ OFF');

  // SVGを残して最後のテキストノードだけ更新
  for (var i = btn.childNodes.length - 1; i >= 0; i--) {
    if (btn.childNodes[i].nodeType === 3) {
      btn.childNodes[i].textContent = label;
      return;
    }
  }
  btn.appendChild(document.createTextNode(label));
}

function setSpeechEnabled(on) {
  speechEnabled = !!on;
  if (!speechEnabled && 'speechSynthesis' in window) window.speechSynthesis.cancel();
  updateSpeechReadButtonUI();
}

// 利用可能な音声をキャッシュ（getVoices() は初回呼び出しでは空のことがある）
var _voiceCache = [];
function _loadVoices() {
  if (!('speechSynthesis' in window)) return;
  var vs = window.speechSynthesis.getVoices();
  if (vs && vs.length) _voiceCache = vs;
}
if ('speechSynthesis' in window) {
  _loadVoices();
  window.speechSynthesis.addEventListener('voiceschanged', _loadVoices);
}

// 言語コード（例 'ja-JP'）に最適な音声を選ぶ。
// 1) 高品質音声（Natural / Neural / Online / Google）を優先
// 2) 必ず言語が一致する音声を割り当てて「カタコト（別言語の声が日本語を読む）」を防ぐ
function pickVoice(langCode) {
  if (!_voiceCache.length) _loadVoices();
  if (!_voiceCache.length) return null;

  var prefix = String(langCode || 'ja').toLowerCase().split('-')[0];
  var matches = _voiceCache.filter(function (v) {
    return String(v.lang).toLowerCase().indexOf(prefix) === 0;
  });
  if (!matches.length) return null;

  var PREFERRED = ['natural', 'neural', 'online', 'google', 'multilingual'];
  for (var i = 0; i < PREFERRED.length; i++) {
    for (var j = 0; j < matches.length; j++) {
      if (matches[j].name.toLowerCase().indexOf(PREFERRED[i]) !== -1) return matches[j];
    }
  }
  for (var k = 0; k < matches.length; k++) {
    if (matches[k].default) return matches[k];
  }
  return matches[0];
}

// Chrome は長文の途中で読み上げが止まるバグがあるため、定期的に resume して回避する
var _speakKeepAlive = null;
function _stopKeepAlive() {
  if (_speakKeepAlive) { clearInterval(_speakKeepAlive); _speakKeepAlive = null; }
}
function _startKeepAlive() {
  _stopKeepAlive();
  _speakKeepAlive = setInterval(function () {
    if (window.speechSynthesis.speaking) {
      window.speechSynthesis.pause();
      window.speechSynthesis.resume();
    } else {
      _stopKeepAlive();
    }
  }, 9000);
}

function speak(text) {
  if (!('speechSynthesis' in window)) return;
  text = String(text || '').trim();
  if (!text) return;

  window.speechSynthesis.cancel();
  var lang = chatDict().speechLang || 'ja-JP';

  function doSpeak() {
    var u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    var v = pickVoice(lang);
    if (v) u.voice = v;        // 言語に合う音声を明示指定（カタコト防止）
    u.rate   = 1.0;
    u.pitch  = 1.0;
    u.volume = 1.0;
    u.onend = function () {
      _stopKeepAlive();
    };

    u.onerror = _stopKeepAlive;
    window.speechSynthesis.speak(u);
    _startKeepAlive();
  }

  // 音声リストが未ロードなら少し待ってから読み上げる
  if (!_voiceCache.length) {
    _loadVoices();
    if (!_voiceCache.length) {
      setTimeout(function () { _loadVoices(); doSpeak(); }, 250);
      return;
    }
  }
  doSpeak();
}

// 音声読み上げボタン用（ON/OFF切替）
function toggleSpeechRead() {
  if (!('speechSynthesis' in window)) return;

  var next = !speechEnabled;

  setSpeechEnabled(next);

  var sw = document.getElementById("toggleSpeech");
  if (sw) {
    sw.classList.toggle("on", next);
    sw.classList.toggle("off", !next);
  }

  if (typeof _saveSetting === "function") {
    _saveSetting("speechEnabled", next ? "1" : "0");
  }

  if (typeof showToast === "function" && typeof t === "function") {
    showToast(t(next ? "toastSpeechOn" : "toastSpeechOff"));
  } else if (typeof showToast === "function") {
    showToast(next ? "音声読み上げをONにしました" : "音声読み上げをOFFにしました");
  }

  // ONにしたときだけ、最新AIメッセージを読む
  if (next) {
    var text =
      document.querySelector("#chatMsgs .msg.ai:last-child .bubble")
        ?.innerText || "";
    if (text) speak(text);
  }
}