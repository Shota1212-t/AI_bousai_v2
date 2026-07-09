// ===== 多言語対応 =====
var I18N = {
  ja: {
    // ヘッダー・ホーム
    appTitle:     'AI防災アシスタント',
    heroTitle:    'あなたの安全をAIがサポート',
    heroDesc:     '現在地周辺の防災情報をリアルタイムで取得し、最適な行動をAIが提案します。',
    btnChat:      'AIに相談する',
    btnEmergency: '緊急通報',
    labelLoc:     '現在地',
    labelShelter: '最寄り避難所',
    nearShelters: '近くの避難所',
    cardChatT:    'AIチャット',
    cardChatD:    '状況を伝えると、AIが最適な行動を提案します。避難所の案内や安否連絡文の生成も可能です。',
    cardHazardT:  'ハザードマップ',
    cardHazardD:  '現在地周辺の洪水・土砂災害・液状化リスクを地図上で確認できます。',
    cardSafetyT:  '安否連絡',
    cardSafetyD:  'AIが状況に応じた安否連絡文を自動生成。LINEやSMSで家族・知人に送信できます。',
    cardManualT:  '防災マニュアル',
    cardManualD:  '地震・大雨・火災など、災害ごとの対応手順を確認できます。',
    // チャット
    chatTitle:    'AIチャット',
    chatDesc:     '困っていることを何でも相談ください',
    chatPlaceholder: 'メッセージを入力してください...',
    quickShelter: '避難所はどこ?',
    quickHazard:  'ハザードマップを見たい',
    quickFamily:  '家族に連絡したい',
    panelTitle:   '現在地の防災情報',
    // 現在地カードボタン
    btnGpsUpdate:   'GPS更新',
    btnManualInput: '手動で入力',
    btnBackGps:     'GPS に戻す',
    btnShareLoc:    '📤 現在地を共有',
    btnGroupShare:  '👥 グループ共有',
    shareMsgHeader: '【現在地共有】{time}時点',
    shareMsgMap:    '地図で見る：',
    shareMsgApp:    'アプリで見る：',
    toastShareNoLoc:   '現在地がまだ取得できていません',
    toastShareCopied:  '位置共有リンクをコピーしました。LINEやSMSに貼り付けて送ってください',
    sharedPinLabel:    '共有された位置',
    sharedPinTime:     '{time}時点',
    toastSharedLocShown: '共有された位置を地図に表示しました',
    // ホームステータス中央カード
    labelHomeHazard: 'ハザードレベル',
    // ハザードカード
    labelHazardLevel: 'ハザードレベル（浸水）',
    hazardCheckLink:  'ハザードマップで確認 →',
    // 検索コントロール
    searchRange:  '検索範囲',
    disasterType: '災害種別',
    filterAll:    'すべて',
    filterFlood:  '洪水',
    filterQuake:  '地震',
    filterSand:   '土砂',
    filterTsunami:'津波',
    filterStorm:  '高潮',
    // ビッグボタン（3つ）
    btnOfficialMap: '公式マップを確認',
    btnRiskMap:     'リスクを地図で見る',
    btnSafetyShort: '安否連絡',
    // ハザードページ
    hazardTitle:      '現在地のハザードマップ',
    hazardDesc:       '現在地周辺に、洪水・高潮・津波・土砂災害などのリスク情報を重ねて表示します。',
    hazardBtnCenter:  '📍 現在地へ移動',
    hazardBtnAll:     '⚠ 全ハザード表示',
    hazardBtnOfficial:'📋 公式ハザードマップを確認',
    hazardBtnRisk:    '🗺 リスクを地図で見る',
    hazardNote:       '※ この地図はハザードマップポータルサイトの配信タイルを重ねて表示しています。災害時は自治体・気象庁・国土交通省などの公式情報を必ず確認してください。',
    // ボトムナビ
    navHome:     'ホーム',
    navChat:     'チャット',
    navHazard:   'ハザード',
    navSettings: '設定',
    // 設定ページ
    settingsTitle:          '設定',
    settingsDisplay:        '表示・アクセシビリティ',
    settingsSpeech:         '音声読み上げ',
    settingsFont:           '文字サイズ',
    fontSizeMd:             '標準',
    fontSizeLg:             '大',
    fontSizeXl:             '特大',
    settingsDark:           'ダークモード',
    settingsNotif:          '通知を受け取る',
    settingsEmergency:      '緊急連絡先',
    settingsManageContacts: '緊急連絡先の管理',
    settingsContactGroup:   '連絡先グループ',
    settingsApiKey:         'AIキー設定',
    settingsChangeKey:      'APIキーを変更',
    settingsData:           'データ',
    settingsClearHistory:   '会話履歴をクリア',
    // 音声ボタン
    btnVoiceInput: '音声入力',
    btnVoiceRead:  '音声読み上げ',
    chatHistoryLink: '≡ 会話履歴',
    // その他の機能
    othFeatTitle:    'その他の機能',
    featManual:      '防災マニュアル',
    featDisasterInfo:'災害情報',
    featEvacTips:    '避難先のポイント',
    featContacts:    '災害時の連絡先',
    // ハザードページ レイヤーボタン
    hazardLayerLabel:      '表示',
    layerFlood:            '洪水',
    layerFloodDuration:    '浸水継続',
    layerStormSurge:       '高潮',
    layerTsunami:          '津波',
    layerDebris:           '土石流',
    layerSteep:            '急傾斜地',
    layerSlide:            '地すべり',
    // チャット動的生成ボタン
    msgBtnOfficialMap: '公式ハザードマップを確認',
    msgBtnRiskMap:     'リスクを地図で見る',
    // AI応答言語指示
    langInstruction: '',

    // ===== 動的UI・トースト（map.js / ui.js / features.js で使用）=====
    // 避難所
    shelterLabel:        '避難所',
    nearestMarkerLabel:  '最',
    nearestBadge:        '最寄り',
    shelterEmpty:        'この条件の避難所は見つかりませんでした',
    shelterSearching:    '周辺の避難所を検索中...',
    shelterWaiting:      '避難所データをまだ取得中です。しばらくお待ちください。',
    shelterCountSuffix:  '件',
    shelterCountSearching: '検索中...',
    // 距離
    walkFormat:          '徒歩{min}分・{km}km',
    // 地図ポップアップ
    routeBtn:            '🗺 経路を表示',
    currentLocLabel:     '📍 現在地',
    currentLocMarker:    '現',
    // ハザードレイヤー（HAZARD_LAYER_DEFS の label）
    hazardLabelFlood:         '洪水浸水想定',
    hazardLabelFloodDuration: '浸水継続時間',
    hazardLabelStormSurge:    '高潮浸水想定',
    hazardLabelTsunami:       '津波浸水想定',
    hazardLabelDebris:        '土砂災害：土石流',
    hazardLabelSteep:         '土砂災害：急傾斜地',
    hazardLabelSlide:         '土砂災害：地すべり',
    // ハザードトースト
    toastHazardShow:     '{label}を表示しました',
    toastHazardHide:     '{label}を非表示にしました',
    toastHazardShowAll:  '全ハザードを表示しました',
    toastHazardHideAll:  '全ハザードを非表示にしました',
    toastHazardShowMain: '{emoji} {label}を表示中',
    toastHazardUnset:    'このハザードレイヤーは未設定です',
    toastRecenter:       '現在地へ移動しました',
    toastNoGps:          '現在地をまだ取得できていません',
    // 避難所トースト
    toastNoShelterRegion:'この地域の避難所データが見つかりませんでした',
    toastNoShelterArea:  '周辺の避難所データが見つかりませんでした',
    toastShelterFail:    '避難所データの取得に失敗しました',
    toastRadiusChange:   '検索範囲を {km}km に変更しました',
    toastNoGpsDemo:      '位置情報が使えないためデモ位置を使用中',
    toastNoGpsFail:      '現在地が取得できないためデモ位置を使用中',
    // UI トースト
    toastDarkOn:         'ダークモードをオンにしました',
    toastDarkOff:        'ダークモードをオフにしました',
    toastFontSize:        '文字サイズ: {size}%',
    toastSpeechOn:       'AIの返答を読み上げます',
    toastSpeechOff:      '読み上げをオフにしました',
    toastLangSwitch:     ' に切り替えました',
    toastLocating:       '現在地を取得しています...',
    toastLocUpdated:     '現在地を更新しました',
    // 座標フォールバック表示
    labelLat:            '緯度 ',
    labelLng:            ' / 経度 ',
    labelUpdatedAt:      '更新時刻 ',
    // features.js トースト
    toastOpenedWagamachi:  'わがまちハザードマップを開きました',
    toastFetchingMuni:     '市区町村コードを取得中...',
    toastOpenedKasaneru:   '重ねるハザードマップを開きました',
    toastContactAdd:       '連絡先を追加しました',
    toastContactRequired:  '名前と電話番号を入力してください',
    // features.js モーダルタイトル
    modalManualTitle:    '防災マニュアル',
    modalManualError:    'データを読み込めませんでした。',
    modalManualSource:   '出典：',
    modalEvacTitle:      '避難先のポイント',
    modalContactsTitle:  '災害時の連絡先',
    modalDisasterTitle:  '災害情報（気象庁）',
    modalDisasterLoading:'読み込み中...',
    // features.js 避難のポイント
    evacSectionTips:     '避難するときの心得',
    evacSectionItems:    '非常持ち出し品（例）',
    evacNote:            '※ 一例です。乳幼児・高齢者・持病など、各家庭に合わせて準備しましょう。',
    evacTips: [
      'ブレーカーを落とし、ガスの元栓を閉める',
      '動きやすい服装・底の厚い靴で避難する',
      'ヘルメットや防災ずきんで頭を守る',
      'エレベーターは使わず階段で避難する',
      '徒歩で避難し、車は原則使わない',
      '近所に声をかけ、できれば複数人で行動する',
      '冠水した道路・川・用水路には近づかない'
    ],
    evacItems: [
      '飲料水', '非常食', '携帯トイレ', '常備薬・お薬手帳', '現金',
      'スマホ・充電器', 'モバイルバッテリー', '懐中電灯', '救急用品',
      '軍手', 'タオル', 'レインコート', '身分証のコピー', 'マスク・消毒'
    ],
    // features.js 緊急連絡先
    contactSectionPublic:   '公式の連絡先',
    contactSectionPersonal: '家族・知人の連絡先',
    contactNote:            '番号をタップすると発信します（スマホ）。171は災害時の安否確認用です。',
    contactNoEntry:         'まだ登録がありません。下の欄から追加できます。',
    contactCallBtn:         '発信',
    contactDelBtn:          '削除',
    contactNamePlaceholder: '名前（例：父）',
    contactTelPlaceholder:  '電話番号',
    contactAddBtn:          '追加',
    publicContacts: [
      { n: '消防・救急',        t: '119', c: '#DC2626' },
      { n: '警察',             t: '110', c: '#1E5BC0' },
      { n: '海上保安庁',        t: '118', c: '#0891B2' },
      { n: '災害用伝言ダイヤル', t: '171', c: '#16A34A' }
    ],
    // features.js 気象情報
    disasterSectionWarnings:  '発表中の警報・注意報',
    disasterNoWarnings:       '現在、発表中の警報・注意報はありません。',
    disasterSectionOverview:  '気象概況（{area}）',
    disasterSourceJma:        '気象庁',
    disasterFetchFail:        '情報を取得できませんでした。通信環境を確認して、もう一度お試しください。',
    disasterSource:           '出典：気象庁',
    disasterMoreWarnings:     ' ほか{n}件',
    disasterBannerSuffix:     ' が発令中',
    // 警報コード（WARN_CODES）
    warnCodes: {
      '02': '暴風雪警報', '03': '大雨警報', '04': '洪水警報', '05': '暴風警報',
      '06': '大雪警報', '07': '波浪警報', '08': '高潮警報',
      '10': '大雨注意報', '12': '大雪注意報', '13': '風雪注意報', '14': '雷注意報',
      '15': '強風注意報', '16': '波浪注意報', '17': '融雪注意報', '18': '洪水注意報',
      '19': '高潮注意報', '20': '濃霧注意報', '21': '乾燥注意報', '22': 'なだれ注意報',
      '23': '低温注意報', '24': '霜注意報', '25': '着氷注意報', '26': '着雪注意報'
    },
    // Nominatim の言語指定
    nominatimLang: 'ja',
    // 地震情報バナー・通知
    quakeLabel:          '地震情報',
    quakeMaxIntensity:   '最大震度{intensity}',
    quakeLocalIntensity: '現在地の震度{intensity}',
    quakePrefIntensity:  '県内最大震度{intensity}',
    quakeBannerSub:      '強い揺れのときはまず身の安全を確保してください',
    quakeJmaLink:        '気象庁で詳細 →',
    quakeIntWeak:        '弱',
    quakeIntStrong:      '強',
    notifQuakeBody:      '{place}／震度{intensity}／M{mag}',
    toastNotifOn:        '地震などの通知をオンにしました',
    toastNotifOff:       '通知をオフにしました',
    toastNotifDenied:    'ブラウザで通知がブロックされています。ブラウザの設定から許可してください',
    toastNotifUnsupported:'このブラウザは通知に対応していません',
    // 地図ボタンツールチップ
    tooltipLocateBtn:    '現在地に戻る',
    tooltipHazardToggle: '全ハザード表示切替'
  },

  en: {
    appTitle:     'AI Disaster Assistant',
    heroTitle:    'AI supports your safety',
    heroDesc:     'Get real-time disaster information around your location, and receive the best action guidance from AI.',
    btnChat:      'Consult AI',
    btnEmergency: 'Emergency Call',
    labelLoc:     'Current Location',
    labelShelter: 'Nearest Shelter',
    nearShelters: 'Nearby Shelters',
    cardChatT:    'AI Chat',
    cardChatD:    'Describe your situation and AI will suggest the best actions, including shelter guidance and safety messages.',
    cardHazardT:  'Hazard Map',
    cardHazardD:  'Check flood, landslide, and liquefaction risks around your location on the map.',
    cardSafetyT:  'Safety Message',
    cardSafetyD:  'AI auto-generates safety messages based on your situation. Send via LINE or SMS.',
    cardManualT:  'Disaster Manual',
    cardManualD:  'Check response procedures for earthquakes, heavy rain, fire, and more.',
    chatTitle:    'AI Chat',
    chatDesc:     'Feel free to ask about anything',
    chatPlaceholder: 'Type your message...',
    quickShelter: 'Where is the nearest shelter?',
    quickHazard:  'Show hazard map',
    quickFamily:  'Contact my family',
    panelTitle:   'Disaster Info Near You',
    btnGpsUpdate:   'GPS Update',
    btnManualInput: 'Manual Input',
    btnBackGps:     'Back to GPS',
    btnShareLoc:    '📤 Share My Location',
    btnGroupShare:  '👥 Group Sharing',
    shareMsgHeader: '[Location Share] as of {time}',
    shareMsgMap:    'View on map: ',
    shareMsgApp:    'Open in app: ',
    toastShareNoLoc:   'Current location is not available yet',
    toastShareCopied:  'Location link copied. Paste it into LINE or SMS to send',
    sharedPinLabel:    'Shared Location',
    sharedPinTime:     'as of {time}',
    toastSharedLocShown: 'Shared location is shown on the map',
    labelHomeHazard: 'Hazard Level',
    labelHazardLevel: 'Hazard Level (Flood)',
    hazardCheckLink:  'Check Hazard Map →',
    searchRange:  'Search Range',
    disasterType: 'Disaster Type',
    filterAll:    'All',
    filterFlood:  'Flood',
    filterQuake:  'Quake',
    filterSand:   'Landslide',
    filterTsunami:'Tsunami',
    filterStorm:  'Surge',
    btnOfficialMap: 'Official Map',
    btnRiskMap:     'Risk Map',
    btnSafetyShort: 'Safety Msg',
    hazardTitle:      'Hazard Map Near You',
    hazardDesc:       'Overlay flood, storm surge, tsunami, and landslide risk information on the map for your area.',
    hazardBtnCenter:  '📍 Go to My Location',
    hazardBtnAll:     '⚠ Toggle All Hazards',
    hazardBtnOfficial:'📋 View Official Hazard Map',
    hazardBtnRisk:    '🗺 View Risk on Map',
    hazardNote:       '※ This map overlays hazard portal tiles. During disasters, always refer to official information from your municipality, JMA, or MLIT.',
    navHome:     'Home',
    navChat:     'Chat',
    navHazard:   'Hazard',
    navSettings: 'Settings',
    settingsTitle:          'Settings',
    settingsDisplay:        'Display & Accessibility',
    settingsSpeech:         'Text-to-Speech',
    settingsFont:           'Font Size',
    fontSizeMd:             'Default',
    fontSizeLg:             'Large',
    fontSizeXl:             'X-Large',
    settingsDark:           'Dark Mode',
    settingsNotif:          'Receive Notifications',
    settingsEmergency:      'Emergency Contacts',
    settingsManageContacts: 'Manage Emergency Contacts',
    settingsContactGroup:   'Contact Groups',
    settingsApiKey:         'AI Key Settings',
    settingsChangeKey:      'Change API Key',
    settingsData:           'Data',
    settingsClearHistory:   'Clear Chat History',
    btnVoiceInput: 'Voice Input',
    btnVoiceRead:  'Read Aloud',
    chatHistoryLink: '≡ History',
    othFeatTitle:    'More Features',
    featManual:      'Disaster Manual',
    featDisasterInfo:'Disaster Info',
    featEvacTips:    'Evacuation Tips',
    featContacts:    'Emergency Contacts',
    hazardLayerLabel:      'Layers',
    layerFlood:            'Flood',
    layerFloodDuration:    'Flood Duration',
    layerStormSurge:       'Storm Surge',
    layerTsunami:          'Tsunami',
    layerDebris:           'Debris Flow',
    layerSteep:            'Steep Slope',
    layerSlide:            'Landslide',
    msgBtnOfficialMap: 'View Official Hazard Map',
    msgBtnRiskMap:     'View Risk on Map',
    langInstruction: 'Please respond in English.',

    shelterLabel:        'Shelter',
    nearestMarkerLabel:  '★',
    nearestBadge:        'Nearest',
    shelterEmpty:        'No shelters found for this filter',
    shelterSearching:    'Searching for nearby shelters...',
    shelterWaiting:      'Shelter data is still loading. Please wait.',
    shelterCountSuffix:  '',
    shelterCountSearching: 'Searching...',
    walkFormat:          '{min} min walk ({km} km)',
    routeBtn:            '🗺 Get Directions',
    currentLocLabel:     '📍 My Location',
    currentLocMarker:    'ME',
    hazardLabelFlood:         'Flood Inundation',
    hazardLabelFloodDuration: 'Flood Duration',
    hazardLabelStormSurge:    'Storm Surge Inundation',
    hazardLabelTsunami:       'Tsunami Inundation',
    hazardLabelDebris:        'Landslide: Debris Flow',
    hazardLabelSteep:         'Landslide: Steep Slope',
    hazardLabelSlide:         'Landslide: Slide',
    toastHazardShow:     '{label} shown',
    toastHazardHide:     '{label} hidden',
    toastHazardShowAll:  'All hazards shown',
    toastHazardHideAll:  'All hazards hidden',
    toastHazardShowMain: '{emoji} Showing {label}',
    toastHazardUnset:    'This hazard layer is not configured',
    toastRecenter:       'Moved to current location',
    toastNoGps:          'Current location not yet available',
    toastNoShelterRegion:'No shelter data found for this area',
    toastNoShelterArea:  'No shelter data found nearby',
    toastShelterFail:    'Failed to load shelter data',
    toastRadiusChange:   'Search radius changed to {km} km',
    toastNoGpsDemo:      'Location unavailable — using demo location',
    toastNoGpsFail:      'Location failed — using demo location',
    toastDarkOn:         'Dark mode enabled',
    toastDarkOff:        'Dark mode disabled',
    toastFontSize:        'Font size: {size}%',
    toastSpeechOn:       'AI responses will be read aloud',
    toastSpeechOff:      'Read aloud disabled',
    toastLangSwitch:     ' selected',
    toastLocating:       'Getting your location...',
    toastLocUpdated:     'Location updated',
    labelLat:            'Lat ',
    labelLng:            ' / Lng ',
    labelUpdatedAt:      'Updated: ',
    toastOpenedWagamachi:  'Opened official hazard map',
    toastFetchingMuni:     'Looking up municipality code...',
    toastOpenedKasaneru:   'Opened overlay hazard map',
    toastContactAdd:       'Contact added',
    toastContactRequired:  'Please enter a name and phone number',
    modalManualTitle:    'Disaster Manual',
    modalManualError:    'Failed to load data.',
    modalManualSource:   'Source: ',
    modalEvacTitle:      'Evacuation Tips',
    modalContactsTitle:  'Emergency Contacts',
    modalDisasterTitle:  'Disaster Info (JMA)',
    modalDisasterLoading:'Loading...',
    evacSectionTips:     'Evacuation Checklist',
    evacSectionItems:    'Emergency Kit (examples)',
    evacNote:            '※ These are general examples. Prepare according to your household\'s needs.',
    evacTips: [
      'Turn off the circuit breaker and close the gas valve',
      'Wear comfortable clothes and thick-soled shoes',
      'Protect your head with a helmet or disaster hood',
      'Use the stairs, not the elevator',
      'Evacuate on foot — avoid driving if possible',
      'Alert neighbors and act in groups if you can',
      'Stay away from flooded roads, rivers, and irrigation canals'
    ],
    evacItems: [
      'Drinking water', 'Emergency food', 'Portable toilet', 'Medication & medical record', 'Cash',
      'Smartphone & charger', 'Mobile battery', 'Flashlight', 'First aid kit',
      'Work gloves', 'Towel', 'Rain gear', 'ID copy', 'Mask & sanitizer'
    ],
    contactSectionPublic:   'Official Numbers',
    contactSectionPersonal: 'Family & Friends',
    contactNote:            'Tap a number to call (smartphone). 171 is for disaster safety check.',
    contactNoEntry:         'No contacts registered yet. Add one below.',
    contactCallBtn:         'Call',
    contactDelBtn:          'Delete',
    contactNamePlaceholder: 'Name (e.g. Dad)',
    contactTelPlaceholder:  'Phone number',
    contactAddBtn:          'Add',
    publicContacts: [
      { n: 'Fire & Ambulance', t: '119', c: '#DC2626' },
      { n: 'Police',           t: '110', c: '#1E5BC0' },
      { n: 'Coast Guard',      t: '118', c: '#0891B2' },
      { n: 'Disaster Message', t: '171', c: '#16A34A' }
    ],
    disasterSectionWarnings:  'Active Warnings & Advisories',
    disasterNoWarnings:       'No active warnings or advisories at this time.',
    disasterSectionOverview:  'Weather Overview ({area})',
    disasterSourceJma:        'JMA',
    disasterFetchFail:        'Failed to load information. Please check your connection and try again.',
    disasterSource:           'Source: JMA',
    disasterMoreWarnings:     ' +{n} more',
    disasterBannerSuffix:     ' in effect',
    warnCodes: {
      '02': 'Blizzard Warning', '03': 'Heavy Rain Warning', '04': 'Flood Warning', '05': 'Strong Wind Warning',
      '06': 'Heavy Snow Warning', '07': 'High Wave Warning', '08': 'Storm Surge Warning',
      '10': 'Heavy Rain Advisory', '12': 'Heavy Snow Advisory', '13': 'Snow & Wind Advisory', '14': 'Thunder Advisory',
      '15': 'Strong Wind Advisory', '16': 'High Wave Advisory', '17': 'Snowmelt Advisory', '18': 'Flood Advisory',
      '19': 'Storm Surge Advisory', '20': 'Dense Fog Advisory', '21': 'Dry Advisory', '22': 'Avalanche Advisory',
      '23': 'Low Temp Advisory', '24': 'Frost Advisory', '25': 'Ice Advisory', '26': 'Snow Adhesion Advisory'
    },
    nominatimLang: 'en',
    quakeLabel:          'Earthquake Info',
    quakeMaxIntensity:   'Max intensity {intensity}',
    quakeLocalIntensity: 'Intensity here {intensity}',
    quakePrefIntensity:  'Prefecture max {intensity}',
    quakeBannerSub:      'If shaking is strong, protect yourself first.',
    quakeJmaLink:        'Details on JMA →',
    quakeIntWeak:        ' Lower',
    quakeIntStrong:      ' Upper',
    notifQuakeBody:      '{place} / Intensity {intensity} / M{mag}',
    toastNotifOn:        'Notifications for earthquakes are on',
    toastNotifOff:       'Notifications turned off',
    toastNotifDenied:    'Notifications are blocked. Please allow them in your browser settings.',
    toastNotifUnsupported:'This browser does not support notifications',
    tooltipLocateBtn:    'Return to my location',
    tooltipHazardToggle: 'Toggle all hazard layers'
  },

  zh: {
    appTitle:     'AI防灾助手',
    heroTitle:    'AI守护您的安全',
    heroDesc:     '实时获取您周边的防灾信息，AI为您提供最佳行动建议。',
    btnChat:      '咨询AI',
    btnEmergency: '紧急报警',
    labelLoc:     '当前位置',
    labelShelter: '最近避难所',
    nearShelters: '附近避难所',
    cardChatT:    'AI聊天',
    cardChatD:    '告诉AI您的情况，获取最佳行动建议，包括避难所引导和安全信息生成。',
    cardHazardT:  '灾害地图',
    cardHazardD:  '在地图上查看您周边的洪水、山体滑坡等灾害风险。',
    cardSafetyT:  '安全信息',
    cardSafetyD:  'AI自动生成安全信息，可通过LINE或短信发送给家人。',
    cardManualT:  '防灾手册',
    cardManualD:  '查看地震、暴雨、火灾等灾害应对程序。',
    chatTitle:    'AI聊天',
    chatDesc:     '请随时咨询任何问题',
    chatPlaceholder: '请输入消息...',
    quickShelter: '最近的避难所在哪里？',
    quickHazard:  '查看灾害地图',
    quickFamily:  '联系家人',
    panelTitle:   '您周边的防灾信息',
    btnGpsUpdate:   'GPS更新',
    btnManualInput: '手动输入',
    btnBackGps:     '返回GPS',
    btnShareLoc:    '📤 分享当前位置',
    btnGroupShare:  '👥 群组共享',
    shareMsgHeader: '【位置分享】{time}时',
    shareMsgMap:    '在地图查看：',
    shareMsgApp:    '在应用中打开：',
    toastShareNoLoc:   '尚未获取当前位置',
    toastShareCopied:  '位置链接已复制，请粘贴到LINE或短信发送',
    sharedPinLabel:    '共享的位置',
    sharedPinTime:     '{time}时',
    toastSharedLocShown: '已在地图上显示共享的位置',
    labelHomeHazard: '灾害级别',
    labelHazardLevel: '灾害级别（洪水）',
    hazardCheckLink:  '查看灾害地图 →',
    searchRange:  '搜索范围',
    disasterType: '灾害种类',
    filterAll:    '全部',
    filterFlood:  '洪水',
    filterQuake:  '地震',
    filterSand:   '山体滑坡',
    filterTsunami:'海啸',
    filterStorm:  '高潮',
    btnOfficialMap: '官方地图',
    btnRiskMap:     '风险地图',
    btnSafetyShort: '安全信息',
    hazardTitle:      '当前位置的灾害地图',
    hazardDesc:       '在地图上叠加显示洪水、高潮、海啸、山体滑坡等灾害风险信息。',
    hazardBtnCenter:  '📍 移至当前位置',
    hazardBtnAll:     '⚠ 全部灾害切换',
    hazardBtnOfficial:'📋 查看官方灾害地图',
    hazardBtnRisk:    '🗺 在地图上查看风险',
    hazardNote:       '※ 本地图叠加了灾害地图门户网站的图层。灾害时请务必确认政府和气象厅等官方信息。',
    navHome:     '首页',
    navChat:     '聊天',
    navHazard:   '灾害图',
    navSettings: '设置',
    settingsTitle:          '设置',
    settingsDisplay:        '显示与无障碍',
    settingsSpeech:         '语音播报',
    settingsFont:           '字体大小',
    fontSizeMd:             '标准',
    fontSizeLg:             '大',
    fontSizeXl:             '特大',
    settingsDark:           '深色模式',
    settingsNotif:          '接收通知',
    settingsEmergency:      '紧急联系人',
    settingsManageContacts: '管理紧急联系人',
    settingsContactGroup:   '联系人群组',
    settingsApiKey:         'AI密钥设置',
    settingsChangeKey:      '更改API密钥',
    settingsData:           '数据',
    settingsClearHistory:   '清除对话记录',
    btnVoiceInput: '语音输入',
    btnVoiceRead:  '语音朗读',
    chatHistoryLink: '≡ 历史记录',
    othFeatTitle:    '更多功能',
    featManual:      '防灾手册',
    featDisasterInfo:'灾害信息',
    featEvacTips:    '避难要点',
    featContacts:    '紧急联系人',
    hazardLayerLabel:      '图层',
    layerFlood:            '洪水',
    layerFloodDuration:    '洪水持续',
    layerStormSurge:       '高潮',
    layerTsunami:          '海啸',
    layerDebris:           '泥石流',
    layerSteep:            '陡坡',
    layerSlide:            '滑坡',
    msgBtnOfficialMap: '查看官方灾害地图',
    msgBtnRiskMap:     '在地图上查看风险',
    langInstruction: '请用中文回答。',

    shelterLabel:        '避难所',
    nearestMarkerLabel:  '近',
    nearestBadge:        '最近',
    shelterEmpty:        '未找到符合条件的避难所',
    shelterSearching:    '正在搜索附近避难所...',
    shelterWaiting:      '避难所数据加载中，请稍候。',
    shelterCountSuffix:  '处',
    shelterCountSearching: '搜索中...',
    walkFormat:          '步行{min}分钟·{km}公里',
    routeBtn:            '🗺 查看路线',
    currentLocLabel:     '📍 当前位置',
    currentLocMarker:    '我',
    hazardLabelFlood:         '洪水浸水预测',
    hazardLabelFloodDuration: '浸水持续时间',
    hazardLabelStormSurge:    '高潮浸水预测',
    hazardLabelTsunami:       '海啸浸水预测',
    hazardLabelDebris:        '山体滑坡：泥石流',
    hazardLabelSteep:         '山体滑坡：陡坡',
    hazardLabelSlide:         '山体滑坡：滑坡',
    toastHazardShow:     '已显示{label}',
    toastHazardHide:     '已隐藏{label}',
    toastHazardShowAll:  '已显示全部灾害图层',
    toastHazardHideAll:  '已隐藏全部灾害图层',
    toastHazardShowMain: '{emoji} 正在显示{label}',
    toastHazardUnset:    '此灾害图层未配置',
    toastRecenter:       '已移至当前位置',
    toastNoGps:          '当前位置尚未获取',
    toastNoShelterRegion:'未找到该地区的避难所数据',
    toastNoShelterArea:  '附近未找到避难所数据',
    toastShelterFail:    '避难所数据加载失败',
    toastRadiusChange:   '搜索范围已更改为{km}公里',
    toastNoGpsDemo:      '无法获取位置，使用演示位置',
    toastNoGpsFail:      '位置获取失败，使用演示位置',
    toastDarkOn:         '已开启深色模式',
    toastDarkOff:        '已关闭深色模式',
    toastFontSize:        '字体大小：{size}%',
    toastSpeechOn:       '将朗读AI回复',
    toastSpeechOff:      '已关闭朗读',
    toastLangSwitch:     ' 已切换',
    toastLocating:       '正在获取当前位置...',
    toastLocUpdated:     '位置已更新',
    labelLat:            '纬度 ',
    labelLng:            ' / 经度 ',
    labelUpdatedAt:      '更新时间：',
    toastOpenedWagamachi:  '已打开官方灾害地图',
    toastFetchingMuni:     '正在获取市区町村代码...',
    toastOpenedKasaneru:   '已打开叠加灾害地图',
    toastContactAdd:       '联系人已添加',
    toastContactRequired:  '请输入姓名和电话号码',
    modalManualTitle:    '防灾手册',
    modalManualError:    '数据加载失败。',
    modalManualSource:   '来源：',
    modalEvacTitle:      '避难要点',
    modalContactsTitle:  '紧急联系人',
    modalDisasterTitle:  '灾害信息（气象厅）',
    modalDisasterLoading:'加载中...',
    evacSectionTips:     '避难注意事项',
    evacSectionItems:    '应急物品清单（例）',
    evacNote:            '※ 仅供参考。请根据家庭成员情况（婴幼儿、老人、慢性病等）做好准备。',
    evacTips: [
      '关闭断路器和煤气阀',
      '穿着便于行动的衣服和厚底鞋',
      '用头盔或防灾头巾保护头部',
      '不要乘电梯，走楼梯撤离',
      '步行撤离，原则上不开车',
      '与邻居打招呼，尽量多人行动',
      '远离积水道路、河流和水渠'
    ],
    evacItems: [
      '饮用水', '应急食品', '便携厕所', '常用药品及病历本', '现金',
      '手机及充电器', '移动电源', '手电筒', '急救用品',
      '手套', '毛巾', '雨具', '身份证复印件', '口罩及消毒液'
    ],
    contactSectionPublic:   '官方联系方式',
    contactSectionPersonal: '家人・朋友联系方式',
    contactNote:            '点击号码即可拨打（智能手机）。171为灾时安否确认专线。',
    contactNoEntry:         '尚未添加联系人，请在下方添加。',
    contactCallBtn:         '拨打',
    contactDelBtn:          '删除',
    contactNamePlaceholder: '姓名（例：爸爸）',
    contactTelPlaceholder:  '电话号码',
    contactAddBtn:          '添加',
    publicContacts: [
      { n: '消防・急救',   t: '119', c: '#DC2626' },
      { n: '警察',        t: '110', c: '#1E5BC0' },
      { n: '海上保安厅',  t: '118', c: '#0891B2' },
      { n: '灾害留言电话', t: '171', c: '#16A34A' }
    ],
    disasterSectionWarnings:  '当前警报・注意报',
    disasterNoWarnings:       '目前没有发布警报或注意报。',
    disasterSectionOverview:  '气象概况（{area}）',
    disasterSourceJma:        '气象厅',
    disasterFetchFail:        '信息获取失败，请检查网络连接后重试。',
    disasterSource:           '来源：气象厅',
    disasterMoreWarnings:     ' 等共{n}项',
    disasterBannerSuffix:     ' 发布中',
    warnCodes: {
      '02': '暴风雪警报', '03': '大雨警报', '04': '洪水警报', '05': '暴风警报',
      '06': '大雪警报', '07': '大浪警报', '08': '高潮警报',
      '10': '大雨注意报', '12': '大雪注意报', '13': '风雪注意报', '14': '雷注意报',
      '15': '强风注意报', '16': '大浪注意报', '17': '融雪注意报', '18': '洪水注意报',
      '19': '高潮注意报', '20': '大雾注意报', '21': '干燥注意报', '22': '雪崩注意报',
      '23': '低温注意报', '24': '霜冻注意报', '25': '结冰注意报', '26': '积雪注意报'
    },
    nominatimLang: 'zh',
    quakeLabel:          '地震信息',
    quakeMaxIntensity:   '最大震度{intensity}',
    quakeLocalIntensity: '当前位置震度{intensity}',
    quakePrefIntensity:  '县内最大震度{intensity}',
    quakeBannerSub:      '如震动强烈，请优先确保自身安全。',
    quakeJmaLink:        '在气象厅查看详情 →',
    quakeIntWeak:        '弱',
    quakeIntStrong:      '强',
    notifQuakeBody:      '{place}／震度{intensity}／M{mag}',
    toastNotifOn:        '已开启地震等通知',
    toastNotifOff:       '已关闭通知',
    toastNotifDenied:    '浏览器已屏蔽通知，请在浏览器设置中允许。',
    toastNotifUnsupported:'此浏览器不支持通知',
    tooltipLocateBtn:    '返回当前位置',
    tooltipHazardToggle: '切换全部灾害图层'
  },

  ko: {
    appTitle:     'AI 방재 어시스턴트',
    heroTitle:    'AI가 당신의 안전을 지원합니다',
    heroDesc:     '현재 위치 주변의 방재 정보를 실시간으로 취득하여 AI가 최적의 행동을 제안합니다.',
    btnChat:      'AI에 상담하기',
    btnEmergency: '긴급 신고',
    labelLoc:     '현재 위치',
    labelShelter: '가장 가까운 대피소',
    nearShelters: '근처 대피소',
    cardChatT:    'AI 채팅',
    cardChatD:    '상황을 알려주면 AI가 최적의 행동을 제안합니다. 대피소 안내 및 안부 연락문 생성도 가능합니다.',
    cardHazardT:  '재해 지도',
    cardHazardD:  '현재 위치 주변의 홍수, 산사태 위험을 지도에서 확인할 수 있습니다.',
    cardSafetyT:  '안부 연락',
    cardSafetyD:  'AI가 상황에 맞는 안부 연락문을 자동 생성합니다. LINE이나 문자로 전송하세요.',
    cardManualT:  '방재 매뉴얼',
    cardManualD:  '지진, 폭우, 화재 등 재해별 대응 절차를 확인할 수 있습니다.',
    chatTitle:    'AI 채팅',
    chatDesc:     '무엇이든 상담해 주세요',
    chatPlaceholder: '메시지를 입력하세요...',
    quickShelter: '가까운 대피소는 어디?',
    quickHazard:  '재해 지도 보기',
    quickFamily:  '가족에게 연락하기',
    panelTitle:   '현재 위치의 방재 정보',
    btnGpsUpdate:   'GPS 갱신',
    btnManualInput: '직접 입력',
    btnBackGps:     'GPS로 돌아가기',
    btnShareLoc:    '📤 현재 위치 공유',
    btnGroupShare:  '👥 그룹 공유',
    shareMsgHeader: '【위치 공유】{time} 기준',
    shareMsgMap:    '지도에서 보기: ',
    shareMsgApp:    '앱에서 열기: ',
    toastShareNoLoc:   '현재 위치를 아직 가져오지 못했습니다',
    toastShareCopied:  '위치 공유 링크를 복사했습니다. LINE이나 문자에 붙여넣어 보내세요',
    sharedPinLabel:    '공유된 위치',
    sharedPinTime:     '{time} 기준',
    toastSharedLocShown: '공유된 위치를 지도에 표시했습니다',
    labelHomeHazard: '재해 수준',
    labelHazardLevel: '재해 수준（침수）',
    hazardCheckLink:  '재해 지도 확인 →',
    searchRange:  '검색 범위',
    disasterType: '재해 종류',
    filterAll:    '전체',
    filterFlood:  '홍수',
    filterQuake:  '지진',
    filterSand:   '산사태',
    filterTsunami:'해일',
    filterStorm:  '고조',
    btnOfficialMap: '공식 지도',
    btnRiskMap:     '위험 지도',
    btnSafetyShort: '안부 연락',
    hazardTitle:      '현재 위치의 재해 지도',
    hazardDesc:       '현재 위치 주변의 홍수, 고조, 해일, 산사태 등의 위험 정보를 지도에 중첩 표시합니다.',
    hazardBtnCenter:  '📍 현재 위치로 이동',
    hazardBtnAll:     '⚠ 전체 재해 표시',
    hazardBtnOfficial:'📋 공식 재해 지도 확인',
    hazardBtnRisk:    '🗺 지도로 위험 확인',
    hazardNote:       '※ 이 지도는 재해 지도 포털 사이트의 타일을 중첩 표시합니다. 재해 시에는 지자체 등의 공식 정보를 반드시 확인하세요.',
    navHome:     '홈',
    navChat:     '채팅',
    navHazard:   '재해도',
    navSettings: '설정',
    settingsTitle:          '설정',
    settingsDisplay:        '표시 및 접근성',
    settingsSpeech:         '음성 읽기',
    settingsFont:           '글자 크기',
    fontSizeMd:             '보통',
    fontSizeLg:             '크게',
    fontSizeXl:             '매우 크게',
    settingsDark:           '다크 모드',
    settingsNotif:          '알림 받기',
    settingsEmergency:      '긴급 연락처',
    settingsManageContacts: '긴급 연락처 관리',
    settingsContactGroup:   '연락처 그룹',
    settingsApiKey:         'AI 키 설정',
    settingsChangeKey:      'API 키 변경',
    settingsData:           '데이터',
    settingsClearHistory:   '대화 기록 삭제',
    btnVoiceInput: '음성 입력',
    btnVoiceRead:  '음성 읽기',
    chatHistoryLink: '≡ 대화 기록',
    othFeatTitle:    '기타 기능',
    featManual:      '방재 매뉴얼',
    featDisasterInfo:'재해 정보',
    featEvacTips:    '대피 요령',
    featContacts:    '긴급 연락처',
    hazardLayerLabel:      '레이어',
    layerFlood:            '홍수',
    layerFloodDuration:    '홍수 지속',
    layerStormSurge:       '고조',
    layerTsunami:          '해일',
    layerDebris:           '토석류',
    layerSteep:            '급경사지',
    layerSlide:            '산사태',
    msgBtnOfficialMap: '공식 재해 지도 확인',
    msgBtnRiskMap:     '지도로 위험 확인',
    langInstruction: '한국어로 답변해 주세요.',

    shelterLabel:        '대피소',
    nearestMarkerLabel:  '★',
    nearestBadge:        '가장 가까움',
    shelterEmpty:        '이 조건에 맞는 대피소가 없습니다',
    shelterSearching:    '주변 대피소를 검색 중...',
    shelterWaiting:      '대피소 데이터를 불러오는 중입니다. 잠시 기다려 주세요.',
    shelterCountSuffix:  '개',
    shelterCountSearching: '검색 중...',
    walkFormat:          '도보 {min}분·{km}km',
    routeBtn:            '🗺 경로 보기',
    currentLocLabel:     '📍 현재 위치',
    currentLocMarker:    '현',
    hazardLabelFlood:         '홍수 침수 예측',
    hazardLabelFloodDuration: '침수 지속 시간',
    hazardLabelStormSurge:    '고조 침수 예측',
    hazardLabelTsunami:       '해일 침수 예측',
    hazardLabelDebris:        '산사태：토석류',
    hazardLabelSteep:         '산사태：급경사지',
    hazardLabelSlide:         '산사태：지활동',
    toastHazardShow:     '{label} 표시됨',
    toastHazardHide:     '{label} 숨겨짐',
    toastHazardShowAll:  '모든 재해 레이어 표시됨',
    toastHazardHideAll:  '모든 재해 레이어 숨겨짐',
    toastHazardShowMain: '{emoji} {label} 표시 중',
    toastHazardUnset:    '이 재해 레이어는 설정되지 않았습니다',
    toastRecenter:       '현재 위치로 이동했습니다',
    toastNoGps:          '현재 위치를 아직 가져오지 못했습니다',
    toastNoShelterRegion:'이 지역의 대피소 데이터가 없습니다',
    toastNoShelterArea:  '주변 대피소 데이터를 찾을 수 없습니다',
    toastShelterFail:    '대피소 데이터 로드에 실패했습니다',
    toastRadiusChange:   '검색 범위를 {km}km로 변경했습니다',
    toastNoGpsDemo:      '위치 정보를 사용할 수 없어 데모 위치를 사용합니다',
    toastNoGpsFail:      '위치 취득 실패 — 데모 위치를 사용합니다',
    toastDarkOn:         '다크 모드를 켰습니다',
    toastDarkOff:        '다크 모드를 껐습니다',
    toastFontSize:        '글자 크기: {size}%',
    toastSpeechOn:       'AI 답변을 읽어드립니다',
    toastSpeechOff:      '읽기 기능을 껐습니다',
    toastLangSwitch:     ' 으로 전환했습니다',
    toastLocating:       '현재 위치를 가져오는 중...',
    toastLocUpdated:     '현재 위치가 업데이트되었습니다',
    labelLat:            '위도 ',
    labelLng:            ' / 경도 ',
    labelUpdatedAt:      '업데이트: ',
    toastOpenedWagamachi:  '공식 재해 지도를 열었습니다',
    toastFetchingMuni:     '시구정촌 코드를 가져오는 중...',
    toastOpenedKasaneru:   '중첩 재해 지도를 열었습니다',
    toastContactAdd:       '연락처가 추가되었습니다',
    toastContactRequired:  '이름과 전화번호를 입력하세요',
    modalManualTitle:    '방재 매뉴얼',
    modalManualError:    '데이터를 불러올 수 없습니다.',
    modalManualSource:   '출처：',
    modalEvacTitle:      '대피 요령',
    modalContactsTitle:  '긴급 연락처',
    modalDisasterTitle:  '재해 정보（기상청）',
    modalDisasterLoading:'불러오는 중...',
    evacSectionTips:     '대피 시 주의사항',
    evacSectionItems:    '비상용품（예시）',
    evacNote:            '※ 일반적인 예시입니다. 가정 상황(영유아, 노인, 지병 등)에 맞게 준비하세요.',
    evacTips: [
      '차단기를 내리고 가스 밸브를 잠그세요',
      '행동하기 편한 복장과 두꺼운 밑창 신발을 착용하세요',
      '헬멧이나 방재 두건으로 머리를 보호하세요',
      '엘리베이터 대신 계단을 이용하세요',
      '도보로 대피하고, 원칙적으로 차는 사용하지 마세요',
      '이웃에 알리고 가능하면 여럿이 함께 행동하세요',
      '침수된 도로·강·수로에 가까이 가지 마세요'
    ],
    evacItems: [
      '식수', '비상식량', '간이 화장실', '상비약·의료기록', '현금',
      '스마트폰·충전기', '보조 배터리', '손전등', '구급용품',
      '작업장갑', '수건', '우비', '신분증 사본', '마스크·소독제'
    ],
    contactSectionPublic:   '공식 연락처',
    contactSectionPersonal: '가족·지인 연락처',
    contactNote:            '번호를 탭하면 전화가 연결됩니다（스마트폰）. 171은 재해 시 안부 확인 전용입니다.',
    contactNoEntry:         '아직 등록된 연락처가 없습니다. 아래 칸에서 추가하세요.',
    contactCallBtn:         '전화',
    contactDelBtn:          '삭제',
    contactNamePlaceholder: '이름（예：아버지）',
    contactTelPlaceholder:  '전화번호',
    contactAddBtn:          '추가',
    publicContacts: [
      { n: '소방·구급',   t: '119', c: '#DC2626' },
      { n: '경찰',        t: '110', c: '#1E5BC0' },
      { n: '해상보안청',  t: '118', c: '#0891B2' },
      { n: '재해 안부 확인', t: '171', c: '#16A34A' }
    ],
    disasterSectionWarnings:  '현재 발령 중인 경보·주의보',
    disasterNoWarnings:       '현재 발령 중인 경보·주의보가 없습니다.',
    disasterSectionOverview:  '기상 개황（{area}）',
    disasterSourceJma:        '기상청',
    disasterFetchFail:        '정보를 불러올 수 없습니다. 통신 환경을 확인하고 다시 시도해 주세요.',
    disasterSource:           '출처：기상청',
    disasterMoreWarnings:     ' 외 {n}건',
    disasterBannerSuffix:     ' 발령 중',
    warnCodes: {
      '02': '폭풍설 경보', '03': '폭우 경보', '04': '홍수 경보', '05': '강풍 경보',
      '06': '폭설 경보', '07': '높은파도 경보', '08': '고조 경보',
      '10': '폭우 주의보', '12': '폭설 주의보', '13': '눈바람 주의보', '14': '뇌우 주의보',
      '15': '강풍 주의보', '16': '높은파도 주의보', '17': '눈녹음 주의보', '18': '홍수 주의보',
      '19': '고조 주의보', '20': '짙은안개 주의보', '21': '건조 주의보', '22': '눈사태 주의보',
      '23': '저온 주의보', '24': '서리 주의보', '25': '착빙 주의보', '26': '착설 주의보'
    },
    nominatimLang: 'ko',
    quakeLabel:          '지진 정보',
    quakeMaxIntensity:   '최대 진도 {intensity}',
    quakeLocalIntensity: '현재 위치 진도 {intensity}',
    quakePrefIntensity:  '현내 최대 진도 {intensity}',
    quakeBannerSub:      '흔들림이 강할 때는 먼저 몸의 안전을 확보하세요.',
    quakeJmaLink:        '기상청에서 자세히 →',
    quakeIntWeak:        '약',
    quakeIntStrong:      '강',
    notifQuakeBody:      '{place} / 진도 {intensity} / M{mag}',
    toastNotifOn:        '지진 등 알림을 켰습니다',
    toastNotifOff:       '알림을 껐습니다',
    toastNotifDenied:    '브라우저에서 알림이 차단되어 있습니다. 브라우저 설정에서 허용해 주세요.',
    toastNotifUnsupported:'이 브라우저는 알림을 지원하지 않습니다',
    tooltipLocateBtn:    '현재 위치로 돌아가기',
    tooltipHazardToggle: '전체 재해 레이어 전환'
  },

  pt: {
    appTitle:     'Assistente IA de Desastres',
    heroTitle:    'IA apoia sua segurança',
    heroDesc:     'Obtenha informações de desastres em tempo real ao redor da sua localização, com IA sugerindo as melhores ações.',
    btnChat:      'Consultar IA',
    btnEmergency: 'Ligação de Emergência',
    labelLoc:     'Localização Atual',
    labelShelter: 'Abrigo Mais Próximo',
    nearShelters: 'Abrigos Próximos',
    cardChatT:    'Chat IA',
    cardChatD:    'Informe sua situação e receba sugestões de ações da IA, incluindo guia de abrigos e mensagens de segurança.',
    cardHazardT:  'Mapa de Riscos',
    cardHazardD:  'Verifique riscos de inundação e deslizamentos ao redor da sua localização.',
    cardSafetyT:  'Mensagem de Segurança',
    cardSafetyD:  'IA gera automaticamente mensagens de segurança. Envie via LINE ou SMS.',
    cardManualT:  'Manual de Desastres',
    cardManualD:  'Verifique procedimentos para terremotos, chuvas fortes, incêndios e mais.',
    chatTitle:    'Chat IA',
    chatDesc:     'Pergunte qualquer coisa',
    chatPlaceholder: 'Digite sua mensagem...',
    quickShelter: 'Onde fica o abrigo mais próximo?',
    quickHazard:  'Ver mapa de riscos',
    quickFamily:  'Contatar família',
    panelTitle:   'Informações de Desastres Próximas',
    btnGpsUpdate:   'Atualizar GPS',
    btnManualInput: 'Entrada Manual',
    btnBackGps:     'Voltar ao GPS',
    btnShareLoc:    '📤 Compartilhar Localização',
    btnGroupShare:  '👥 Compartilhar em Grupo',
    shareMsgHeader: '[Localização] em {time}',
    shareMsgMap:    'Ver no mapa: ',
    shareMsgApp:    'Abrir no app: ',
    toastShareNoLoc:   'Localização atual ainda não disponível',
    toastShareCopied:  'Link de localização copiado. Cole no LINE ou SMS para enviar',
    sharedPinLabel:    'Localização Compartilhada',
    sharedPinTime:     'em {time}',
    toastSharedLocShown: 'Localização compartilhada exibida no mapa',
    labelHomeHazard: 'Nível de Risco',
    labelHazardLevel: 'Nível de Risco (Inundação)',
    hazardCheckLink:  'Ver Mapa de Riscos →',
    searchRange:  'Raio de Busca',
    disasterType: 'Tipo de Desastre',
    filterAll:    'Todos',
    filterFlood:  'Inundação',
    filterQuake:  'Terremoto',
    filterSand:   'Deslizamento',
    filterTsunami:'Tsunami',
    filterStorm:  'Ressaca',
    btnOfficialMap: 'Mapa Oficial',
    btnRiskMap:     'Mapa de Riscos',
    btnSafetyShort: 'Msg Segurança',
    hazardTitle:      'Mapa de Riscos Próximo',
    hazardDesc:       'Sobreponha informações de risco de inundação, ressaca, tsunami e deslizamentos de terra ao mapa.',
    hazardBtnCenter:  '📍 Ir para Minha Localização',
    hazardBtnAll:     '⚠ Alternar Todos os Riscos',
    hazardBtnOfficial:'📋 Ver Mapa de Riscos Oficial',
    hazardBtnRisk:    '🗺 Ver Riscos no Mapa',
    hazardNote:       '※ Este mapa sobrepõe camadas do portal de mapas de risco. Em desastres, sempre consulte informações oficiais do município.',
    navHome:     'Início',
    navChat:     'Chat',
    navHazard:   'Riscos',
    navSettings: 'Config',
    settingsTitle:          'Configurações',
    settingsDisplay:        'Exibição e Acessibilidade',
    settingsSpeech:         'Leitura de Voz',
    settingsFont:           'Tamanho da Fonte',
    fontSizeMd:             'Padrão',
    fontSizeLg:             'Grande',
    fontSizeXl:             'Extra Grande',
    settingsDark:           'Modo Escuro',
    settingsNotif:          'Receber Notificações',
    settingsEmergency:      'Contatos de Emergência',
    settingsManageContacts: 'Gerenciar Contatos',
    settingsContactGroup:   'Grupos de Contato',
    settingsApiKey:         'Configuração de Chave AI',
    settingsChangeKey:      'Alterar Chave API',
    settingsData:           'Dados',
    settingsClearHistory:   'Limpar Histórico',
    btnVoiceInput: 'Entrada de Voz',
    btnVoiceRead:  'Leitura em Voz',
    chatHistoryLink: '≡ Histórico',
    othFeatTitle:    'Mais Funções',
    featManual:      'Manual de Desastres',
    featDisasterInfo:'Info de Desastres',
    featEvacTips:    'Dicas de Evacuação',
    featContacts:    'Contatos de Emergência',
    hazardLayerLabel:      'Camadas',
    layerFlood:            'Inundação',
    layerFloodDuration:    'Inundação Cont.',
    layerStormSurge:       'Ressaca',
    layerTsunami:          'Tsunami',
    layerDebris:           'Corrida de Lama',
    layerSteep:            'Encosta Íngreme',
    layerSlide:            'Deslizamento',
    msgBtnOfficialMap: 'Ver Mapa Oficial',
    msgBtnRiskMap:     'Ver Riscos no Mapa',
    langInstruction: 'Por favor, responda em português.',

    shelterLabel:        'Abrigo',
    nearestMarkerLabel:  '★',
    nearestBadge:        'Mais Próximo',
    shelterEmpty:        'Nenhum abrigo encontrado para este filtro',
    shelterSearching:    'Buscando abrigos próximos...',
    shelterWaiting:      'Dados de abrigos ainda carregando. Aguarde.',
    shelterCountSuffix:  '',
    shelterCountSearching: 'Buscando...',
    walkFormat:          '{min} min a pé ({km} km)',
    routeBtn:            '🗺 Ver Rota',
    currentLocLabel:     '📍 Minha Localização',
    currentLocMarker:    'EU',
    hazardLabelFlood:         'Inundação Prevista',
    hazardLabelFloodDuration: 'Duração da Inundação',
    hazardLabelStormSurge:    'Ressaca Prevista',
    hazardLabelTsunami:       'Tsunami Previsto',
    hazardLabelDebris:        'Deslizamento: Corrida de Lama',
    hazardLabelSteep:         'Deslizamento: Encosta Íngreme',
    hazardLabelSlide:         'Deslizamento: Rastejo',
    toastHazardShow:     '{label} exibido',
    toastHazardHide:     '{label} ocultado',
    toastHazardShowAll:  'Todos os riscos exibidos',
    toastHazardHideAll:  'Todos os riscos ocultados',
    toastHazardShowMain: '{emoji} Exibindo {label}',
    toastHazardUnset:    'Esta camada de risco não está configurada',
    toastRecenter:       'Movido para localização atual',
    toastNoGps:          'Localização atual ainda não disponível',
    toastNoShelterRegion:'Nenhum dado de abrigo encontrado nesta área',
    toastNoShelterArea:  'Nenhum dado de abrigo encontrado próximo',
    toastShelterFail:    'Falha ao carregar dados de abrigos',
    toastRadiusChange:   'Raio de busca alterado para {km} km',
    toastNoGpsDemo:      'Localização indisponível — usando localização demo',
    toastNoGpsFail:      'Falha na localização — usando localização demo',
    toastDarkOn:         'Modo escuro ativado',
    toastDarkOff:        'Modo escuro desativado',
    toastFontSize:        'Tamanho da fonte: {size}%',
    toastSpeechOn:       'Respostas da IA serão lidas em voz alta',
    toastSpeechOff:      'Leitura em voz alta desativada',
    toastLangSwitch:     ' selecionado',
    toastLocating:       'Obtendo sua localização...',
    toastLocUpdated:     'Localização atualizada',
    labelLat:            'Lat ',
    labelLng:            ' / Lng ',
    labelUpdatedAt:      'Atualizado: ',
    toastOpenedWagamachi:  'Mapa oficial de riscos aberto',
    toastFetchingMuni:     'Obtendo código do município...',
    toastOpenedKasaneru:   'Mapa de riscos sobrepostos aberto',
    toastContactAdd:       'Contato adicionado',
    toastContactRequired:  'Por favor, insira nome e número de telefone',
    modalManualTitle:    'Manual de Desastres',
    modalManualError:    'Falha ao carregar dados.',
    modalManualSource:   'Fonte: ',
    modalEvacTitle:      'Dicas de Evacuação',
    modalContactsTitle:  'Contatos de Emergência',
    modalDisasterTitle:  'Info de Desastres (JMA)',
    modalDisasterLoading:'Carregando...',
    evacSectionTips:     'Lista de Verificação para Evacuação',
    evacSectionItems:    'Kit de Emergência (exemplos)',
    evacNote:            '※ São exemplos gerais. Prepare de acordo com as necessidades da sua família.',
    evacTips: [
      'Desligue o disjuntor e feche a válvula de gás',
      'Vista roupas confortáveis e calçados de sola grossa',
      'Proteja a cabeça com capacete ou touca de proteção',
      'Use as escadas, não o elevador',
      'Evacue a pé — evite dirigir se possível',
      'Avise os vizinhos e aja em grupo se puder',
      'Fique longe de estradas inundadas, rios e canais'
    ],
    evacItems: [
      'Água potável', 'Alimentos de emergência', 'Banheiro portátil', 'Medicamentos e prontuário', 'Dinheiro',
      'Smartphone e carregador', 'Bateria portátil', 'Lanterna', 'Kit de primeiros socorros',
      'Luvas de trabalho', 'Toalha', 'Capa de chuva', 'Cópia de documentos', 'Máscara e desinfetante'
    ],
    contactSectionPublic:   'Números Oficiais',
    contactSectionPersonal: 'Família e Amigos',
    contactNote:            'Toque no número para ligar (smartphone). 171 é para verificação de segurança em desastres.',
    contactNoEntry:         'Nenhum contato registrado. Adicione um abaixo.',
    contactCallBtn:         'Ligar',
    contactDelBtn:          'Excluir',
    contactNamePlaceholder: 'Nome (ex: Pai)',
    contactTelPlaceholder:  'Número de telefone',
    contactAddBtn:          'Adicionar',
    publicContacts: [
      { n: 'Bombeiros/Ambulância', t: '119', c: '#DC2626' },
      { n: 'Polícia',              t: '110', c: '#1E5BC0' },
      { n: 'Guarda Costeira',      t: '118', c: '#0891B2' },
      { n: 'Msg Desastre',         t: '171', c: '#16A34A' }
    ],
    disasterSectionWarnings:  'Alertas e Avisos Ativos',
    disasterNoWarnings:       'Nenhum alerta ou aviso ativo no momento.',
    disasterSectionOverview:  'Visão Geral do Tempo ({area})',
    disasterSourceJma:        'JMA',
    disasterFetchFail:        'Falha ao carregar informações. Verifique a conexão e tente novamente.',
    disasterSource:           'Fonte: JMA',
    disasterMoreWarnings:     ' +{n} mais',
    disasterBannerSuffix:     ' em vigor',
    warnCodes: {
      '02': 'Alerta Nevasca', '03': 'Alerta Chuva Forte', '04': 'Alerta Inundação', '05': 'Alerta Vento Forte',
      '06': 'Alerta Neve Pesada', '07': 'Alerta Mar Agitado', '08': 'Alerta Ressaca',
      '10': 'Aviso Chuva Forte', '12': 'Aviso Neve Pesada', '13': 'Aviso Neve e Vento', '14': 'Aviso Trovoada',
      '15': 'Aviso Vento Forte', '16': 'Aviso Mar Agitado', '17': 'Aviso Degelo', '18': 'Aviso Inundação',
      '19': 'Aviso Ressaca', '20': 'Aviso Neblina', '21': 'Aviso Seca', '22': 'Aviso Avalanche',
      '23': 'Aviso Frio', '24': 'Aviso Geada', '25': 'Aviso Gelo', '26': 'Aviso Neve Aderente'
    },
    nominatimLang: 'pt',
    quakeLabel:          'Informação de Terremoto',
    quakeMaxIntensity:   'Intensidade máx. {intensity}',
    quakeLocalIntensity: 'Intensidade aqui {intensity}',
    quakePrefIntensity:  'Máx. na província {intensity}',
    quakeBannerSub:      'Se o tremor for forte, proteja-se primeiro.',
    quakeJmaLink:        'Detalhes na JMA →',
    quakeIntWeak:        ' inferior',
    quakeIntStrong:      ' superior',
    notifQuakeBody:      '{place} / Intensidade {intensity} / M{mag}',
    toastNotifOn:        'Notificações de terremoto ativadas',
    toastNotifOff:       'Notificações desativadas',
    toastNotifDenied:    'As notificações estão bloqueadas. Permita-as nas configurações do navegador.',
    toastNotifUnsupported:'Este navegador não suporta notificações',
    tooltipLocateBtn:    'Voltar à minha localização',
    tooltipHazardToggle: 'Alternar todas as camadas de risco'
  }
};

// ========================================
// t() — 翻訳キーを現在の言語で返すヘルパー
// ========================================
function t(key) {
  var lang = getCurrentLang();
  var dict = I18N[lang] || I18N['ja'];
  // キーが存在しない場合は日本語フォールバック
  return (dict[key] !== undefined) ? dict[key] : (I18N['ja'][key] !== undefined ? I18N['ja'][key] : key);
}

// 選択中の言語コードを返す
function getCurrentLang() {
  try { return localStorage.getItem('bosai_lang') || 'ja'; }
  catch (e) { return 'ja'; }
}

// 言語をUIに反映する
function applyLang(lang) {
  var d = I18N[lang] || I18N['ja'];

  // ---- ヘッダー ----
  var h1 = document.querySelector('header h1');
  if (h1) h1.textContent = d.appTitle;
  document.title = d.appTitle;

  // ---- ホーム：ヒーロー（page-home に限定）----
  var homeEl = document.getElementById('page-home');
  if (homeEl) {
    var heroH2 = homeEl.querySelector('.home-hero .hero-text h2');
    if (heroH2) heroH2.textContent = d.heroTitle;
    var heroP = homeEl.querySelector('.home-hero .hero-text p');
    if (heroP) heroP.textContent = d.heroDesc;
  }

  // ヒーローボタン（SVGを残してテキストノードだけ更新）
  var heroChips = document.querySelectorAll('#page-home .hero-chip');
  if (heroChips[0]) _setLastTextNode(heroChips[0], d.btnChat);
  if (heroChips[1]) _setLastTextNode(heroChips[1], d.btnEmergency);

  // ---- ホーム：ステータスカード ----
  var statusLabels = document.querySelectorAll('.status-label');
  if (statusLabels[0]) statusLabels[0].textContent = d.labelLoc;
  if (statusLabels[1]) statusLabels[1].textContent = d.labelHomeHazard;
  if (statusLabels[2]) statusLabels[2].textContent = d.labelShelter;

  // ---- ホーム：グリッドカード ----
  var hgCards = document.querySelectorAll('#page-home .hg-card');
  var cardKeys = [
    { t: d.cardChatT,   desc: d.cardChatD },
    { t: d.cardHazardT, desc: d.cardHazardD },
    { t: d.cardSafetyT, desc: d.cardSafetyD },
    { t: d.cardManualT, desc: d.cardManualD }
  ];
  hgCards.forEach(function(card, i) {
    if (!cardKeys[i]) return;
    var h3 = card.querySelector('h3');
    var p  = card.querySelector('p');
    if (h3) _setLastTextNode(h3, cardKeys[i].t);
    if (p)  p.textContent = cardKeys[i].desc;
  });

  // ---- ホーム：近くの避難所 ----
  var nearH3 = document.querySelector('.home-shelters h3');
  if (nearH3) nearH3.textContent = d.nearShelters;

  // ---- チャット：タイトル・プレースホルダー ----
  var chatH2 = document.querySelector('.chat-title h2');
  if (chatH2) chatH2.textContent = d.chatTitle;
  var chatDesc = document.querySelector('.chat-title p');
  if (chatDesc) chatDesc.textContent = d.chatDesc;
  var chatInput = document.getElementById('chatInput');
  if (chatInput) chatInput.placeholder = d.chatPlaceholder;

  // ---- チャット：会話履歴リンク・音声ボタン ----
  var histLink = document.querySelector('.hist-link');
  if (histLink) histLink.textContent = d.chatHistoryLink;
  var vBtns = document.querySelectorAll('.v-btn');
  if (vBtns[0]) _setLastTextNode(vBtns[0], d.btnVoiceInput);
  if (vBtns[1]) _setLastTextNode(vBtns[1], d.btnVoiceRead);

  // ---- チャット：クイックボタン ----
  var qBtns = document.querySelectorAll('.q-btn');
  var qKeys = [d.quickShelter, d.quickHazard, d.quickFamily];
  qBtns.forEach(function(btn, i) { if (qKeys[i]) btn.textContent = qKeys[i]; });

  // ---- チャット：情報パネルタイトル ----
  var infoH2 = document.querySelector('.info-head h2');
  if (infoH2) infoH2.textContent = d.panelTitle;

  // ---- チャット：現在地ラベル・GPSボタン ----
  var locLabel = document.querySelector('.loc-label');
  if (locLabel) locLabel.textContent = d.labelLoc;
  var locBtnsDiv = document.querySelector('.loc-card div[style*="flex"]');
  if (locBtnsDiv) {
    var locBtns = locBtnsDiv.querySelectorAll('button');
    if (locBtns[0]) locBtns[0].textContent = d.btnGpsUpdate;
  }
  var btnManualLoc = document.getElementById('btnManualLoc');
  if (btnManualLoc) btnManualLoc.textContent = d.btnManualInput;
  var btnResetGps = document.getElementById('btnResetGps');
  if (btnResetGps) btnResetGps.textContent = d.btnBackGps;
  var btnShareLoc = document.getElementById('btnShareLoc');
  if (btnShareLoc) btnShareLoc.textContent = d.btnShareLoc;
  var btnGroupShare = document.getElementById('btnGroupShare');
  if (btnGroupShare) btnGroupShare.textContent = d.btnGroupShare;

  // ---- チャット：ハザードカード ----
  var hzLabel = document.querySelector('.hz-label');
  if (hzLabel) hzLabel.textContent = d.labelHazardLevel;
  var hzLink = document.querySelector('.hz-link');
  if (hzLink) hzLink.textContent = d.hazardCheckLink;

  // ---- チャット：検索コントロール ----
  var ctrlLabels = document.querySelectorAll('.ctrl-label');
  if (ctrlLabels[0]) ctrlLabels[0].textContent = d.searchRange;
  if (ctrlLabels[1]) ctrlLabels[1].textContent = d.disasterType;
  var filterBtns = document.querySelectorAll('.filter-btn');
  var filterKeys = [d.filterAll, d.filterFlood, d.filterQuake, d.filterSand, d.filterTsunami, d.filterStorm];
  filterBtns.forEach(function(btn, i) { if (filterKeys[i]) btn.textContent = filterKeys[i]; });

  // ---- チャット：その他の機能 ----
  var othH3 = document.querySelector('.oth-feat h3');
  if (othH3) othH3.textContent = d.othFeatTitle;
  var feats = document.querySelectorAll('.oth-feat .feat');
  var featKeys = [d.featManual, d.featDisasterInfo, d.featEvacTips, d.featContacts];
  feats.forEach(function(feat, i) { if (featKeys[i]) _setLastTextNode(feat, featKeys[i]); });

  // ---- チャット：ビッグボタン（3つ）----
  var bigBtns = document.querySelectorAll('.big-b');
  if (bigBtns[0]) _setLastTextNode(bigBtns[0], d.btnOfficialMap);
  if (bigBtns[1]) _setLastTextNode(bigBtns[1], d.btnRiskMap);
  if (bigBtns[2]) _setLastTextNode(bigBtns[2], d.btnSafetyShort);

  // ---- 避難所セクション heading ----
  var shSecH3 = document.querySelector('.sh-sec h3');
  if (shSecH3) _setFirstTextNode(shSecH3, d.nearShelters + ' ');

  // ---- ハザードページ ----
  var hazPage = document.getElementById('page-hazard');
  if (hazPage) {
    var hazH2 = hazPage.querySelector('.hero-text h2');
    if (hazH2) hazH2.textContent = d.hazardTitle;
    var hazP = hazPage.querySelector('.hero-text p');
    if (hazP) hazP.textContent = d.hazardDesc;
    var hazChips = hazPage.querySelectorAll('.hero-chip');
    if (hazChips[0]) hazChips[0].textContent = d.hazardBtnCenter;
    if (hazChips[1]) hazChips[1].textContent = d.hazardBtnAll;
    if (hazChips[2]) hazChips[2].textContent = d.hazardBtnOfficial;
    if (hazChips[3]) hazChips[3].textContent = d.hazardBtnRisk;
    var hazNote = hazPage.querySelector('.info-note');
    if (hazNote) hazNote.textContent = d.hazardNote;
    var hazLayerLabel = hazPage.querySelector('.ctrl-label');
    if (hazLayerLabel) hazLayerLabel.textContent = d.hazardLayerLabel;
    var hazLayerBtns = hazPage.querySelectorAll('.hazard-page-btn');
    var layerKeys = [d.layerFlood, d.layerFloodDuration, d.layerStormSurge, d.layerTsunami,
                     d.layerDebris, d.layerSteep, d.layerSlide];
    hazLayerBtns.forEach(function(btn, i) { if (layerKeys[i]) btn.textContent = layerKeys[i]; });
  }

  // ---- ボトムナビ ----
  var navIds = ['nav-home', 'nav-chat', 'nav-hazard', 'nav-settings'];
  var navKeys = [d.navHome, d.navChat, d.navHazard, d.navSettings];
  navIds.forEach(function(id, i) {
    var el = document.getElementById(id);
    if (el) _setLastTextNode(el, navKeys[i]);
  });

  // ---- 設定ページ ----
  var setPage = document.getElementById('page-settings');
  if (setPage) {
    var setH2 = setPage.querySelector('h2');
    if (setH2) setH2.textContent = d.settingsTitle;

    var secs = setPage.querySelectorAll('.set-section');

    if (secs[0]) {
      var t0 = secs[0].querySelector('.set-section-title');
      if (t0) t0.textContent = d.settingsDisplay;
      var rows0 = secs[0].querySelectorAll('.set-row > span:not(.detail)');
      var labels0 = [d.settingsSpeech, d.settingsFont, d.settingsDark, d.settingsNotif];
      rows0.forEach(function(sp, i) { if (labels0[i]) sp.textContent = labels0[i]; });
    }

    // secs[1] = 言語 / Language（バイリンガル表記のため翻訳不要）

    // secs[2] = データ（緊急連絡先・AIキー設定セクションは削除済み）
    if (secs[2]) {
      var t2 = secs[2].querySelector('.set-section-title');
      if (t2) t2.textContent = d.settingsData;
      var row2 = secs[2].querySelector('.set-row > span');
      if (row2) row2.textContent = d.settingsClearHistory;
    }
  }
}

// SVGを含む要素の末尾テキストノードだけ更新する
function _setLastTextNode(el, text) {
  for (var i = el.childNodes.length - 1; i >= 0; i--) {
    if (el.childNodes[i].nodeType === 3) {
      el.childNodes[i].textContent = text;
      return;
    }
  }
  el.appendChild(document.createTextNode(text));
}

// 先頭テキストノードだけ更新する（カウントspanを含む要素向け）
function _setFirstTextNode(el, text) {
  for (var i = 0; i < el.childNodes.length; i++) {
    if (el.childNodes[i].nodeType === 3) {
      el.childNodes[i].textContent = text;
      return;
    }
  }
}


// ===== SAME_FILE_DYNAMIC_I18N_PATCH =====
// index.html / map.js / features.js が動的に生成した表示も、言語切替時に再翻訳する補正。
(function () {
  var originalApplyLang = (typeof applyLang === 'function') ? applyLang : null;

  function setText(id, text) {
    var el = document.getElementById(id);
    if (el) el.textContent = text;
  }
  function langDict(code) {
    return (typeof I18N !== 'undefined' && I18N[code]) ? I18N[code] : I18N.ja;
  }

  window.applyLang = function(code) {
    if (originalApplyLang) originalApplyLang(code);
    var d = langDict(code || 'ja');

    // html lang / header language button
    document.documentElement.lang = code || 'ja';
    var langBtn = document.querySelector('.lang-sel');
    if (langBtn) {
      var names = { ja: '日本語', en: 'English', zh: '中文', ko: '한국어', pt: 'Português' };
      langBtn.textContent = '🌐 ' + (names[code] || names.ja) + ' ▾';
    }

    // Warning banner static text in index.html
    var wbSub = document.querySelector('.wb-sub');
    if (wbSub) {
      var wbSubMap = {
        ja: '市区町村の避難情報を確認し、早めに行動してください',
        en: 'Check municipal evacuation information and act early.',
        zh: '请确认市区町村的避难信息，并尽早行动。',
        ko: '시구정촌의 대피 정보를 확인하고 일찍 행동하세요.',
        pt: 'Verifique as informações municipais de evacuação e aja cedo.'
      };
      wbSub.textContent = wbSubMap[code] || wbSubMap.ja;
    }
    var wbLink = document.getElementById('wbLink');
    if (wbLink) {
      var wbLinkMap = { ja: '気象庁で確認 →', en: 'Check JMA →', zh: '在气象厅确认 →', ko: '기상청에서 확인 →', pt: 'Ver na JMA →' };
      wbLink.textContent = wbLinkMap[code] || wbLinkMap.ja;
    }

    // Initial AI message already in DOM
    var firstAi = document.querySelector('#chatMsgs .msg.ai .bubble');
    if (firstAi && firstAi.textContent.indexOf('防災に関する') !== -1) {
      var msgMap = {
        ja: '防災に関するご相談をお受けします。気になることを入力するか、下のボタンからお選びください。',
        en: 'I can help with disaster preparedness and emergency actions. Type your concern or choose a button below.',
        zh: '我可以协助防灾和紧急行动。请输入您关心的问题，或从下方按钮中选择。',
        ko: '방재와 긴급 행동을 도와드립니다. 궁금한 내용을 입력하거나 아래 버튼을 선택하세요.',
        pt: 'Posso ajudar com prevenção de desastres e ações de emergência. Digite sua dúvida ou escolha um botão abaixo.'
      };
      firstAi.textContent = msgMap[code] || msgMap.ja;
    }

    // Hazard page structure in index.html is not .hero-text, so translate it here too.
    var hazPage = document.getElementById('page-hazard');
    if (hazPage) {
      var h2 = hazPage.querySelector('.info-head h2');
      if (h2) h2.textContent = d.hazardTitle;
      var desc = hazPage.querySelector('.hazard-desc');
      if (desc) desc.textContent = d.hazardDesc;
      var note = hazPage.querySelector('.info-note');
      if (note) note.textContent = d.hazardNote;
      hazPage.querySelectorAll('button').forEach(function(btn) {
        var on = btn.getAttribute('onclick') || '';
        if (on.indexOf('recenterHazardPageMap') !== -1) btn.textContent = d.hazardBtnCenter;
        if (on.indexOf('toggleHazardPageAll') !== -1) btn.textContent = d.hazardBtnAll;
        if (on.indexOf('openWagamachiMap') !== -1) btn.textContent = d.hazardBtnOfficial;
        if (on.indexOf('openKasaneruMap') !== -1) btn.textContent = d.hazardBtnRisk;
      });
      var layerNames = [d.layerFlood, d.layerFloodDuration, d.layerStormSurge, d.layerTsunami, d.layerDebris, d.layerSteep, d.layerSlide];
      hazPage.querySelectorAll('.hazard-page-btn').forEach(function(btn, i) {
        if (layerNames[i]) btn.textContent = layerNames[i];
      });
    }

    // Safety message modal static text
    var safetyTitle = document.querySelector('#safetyModal .modal-head h3');
    var safetyP = document.querySelector('#safetyModal .modal-body p');
    var copyBtn = document.querySelector('#safetyModal .btn-copy');
    var closeBtn = document.querySelector('#safetyModal .btn-cancel');
    var safetyMap = {
      ja: ['安否連絡文', '以下の文をコピーして、LINEやSMSで家族・知人に送信してください。', '📋 コピーする', '閉じる'],
      en: ['Safety Message', 'Copy the message below and send it to family or acquaintances via LINE or SMS.', '📋 Copy', 'Close'],
      zh: ['安否联系信息', '请复制以下内容，并通过LINE或短信发送给家人或熟人。', '📋 复制', '关闭'],
      ko: ['안부 연락문', '아래 문장을 복사하여 LINE이나 문자로 가족·지인에게 보내세요.', '📋 복사', '닫기'],
      pt: ['Mensagem de Segurança', 'Copie a mensagem abaixo e envie para familiares ou conhecidos via LINE ou SMS.', '📋 Copiar', 'Fechar']
    };
    var sm = safetyMap[code] || safetyMap.ja;
    if (safetyTitle) safetyTitle.textContent = sm[0];
    if (safetyP) safetyP.textContent = sm[1];
    if (copyBtn) copyBtn.textContent = sm[2];
    if (closeBtn) closeBtn.textContent = sm[3];

    // Already-rendered shelter list/count must be re-rendered after language switch.
    if (typeof shownShelters !== 'undefined' && typeof setShelterCount === 'function') {
      setShelterCount(String((shownShelters || []).length) + (d.shelterCountSuffix || ''));
    }
    if (typeof renderShelterList === 'function' && typeof shownShelters !== 'undefined') {
      renderShelterList(shownShelters || []);
    }
    if (typeof renderHomeShelters === 'function') renderHomeShelters();

    // 地震情報バナーの言語切替
    if (typeof refreshQuakeBanner === 'function') refreshQuakeBanner();
  };
})();
