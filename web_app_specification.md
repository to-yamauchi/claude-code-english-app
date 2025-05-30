# 英語学習Webアプリケーション 設計仕様書

## 1. アーキテクチャ比較・移行分析

### 1.1 デスクトップ版からWebアプリ版への変更点

| 項目 | デスクトップ版 | Webアプリ版 |
|------|---------------|-------------|
| **GUI フレームワーク** | Tkinter | HTML/CSS/JavaScript |
| **音声処理** | PyAudio | WebRTC + AudioWorkletNode |
| **リアルタイム通信** | 直接API呼び出し | WebSocket (Flask-SocketIO) |
| **セキュリティ** | ローカル実行 | HTTPS必須 |
| **デプロイメント** | 単体実行ファイル | Webサーバー + 証明書管理 |
| **ブラウザ対応** | N/A | Chrome/Firefox/Safari対応 |

### 1.2 技術スタック変更

#### 移行前（デスクトップ）
- Python 3.13 + Tkinter + PyAudio + asyncio

#### 移行後（Web）
- **バックエンド**: Flask + Flask-SocketIO 5.3.x (threading mode)
- **フロントエンド**: HTML5 + CSS3 + JavaScript (ES6+)
- **音声処理**: WebRTC + AudioWorkletNode
- **リアルタイム通信**: WebSocket (/ws/socket.io)
- **セキュリティ**: HTTPS + 自動証明書生成

## 2. 技術スタック詳細仕様

### 2.1 バックエンドフレームワーク

```python
# Flask-SocketIO設定
app = Flask(__name__)
socketio = SocketIO(
    app,
    cors_allowed_origins="*",
    allow_unsafe_werkzeug=True,  # Python 3.13対応
    async_mode='threading',      # eventletではなくthreading使用
    path='/ws/socket.io'         # 明示的WebSocketパス
)
```

### 2.2 音声処理技術

#### WebRTC音声キャプチャ
```javascript
// 連続音声キャプチャ（録音ボタン不要）
navigator.mediaDevices.getUserMedia({
    audio: {
        sampleRate: 16000,
        channelCount: 1,
        echoCancellation: true,
        noiseSuppression: true
    }
})
```

#### AudioWorkletNode実装
```javascript
// 非推奨ScriptProcessorNodeの代替
class AudioProcessor extends AudioWorkletProcessor {
    process(inputs, outputs, parameters) {
        // リアルタイム音声処理
        // 音量レベル計算
        // WebSocketでサーバーに送信
    }
}
```

### 2.3 Google Gemini Live API統合

#### セッション設定
```python
session_config = {
    "model": "models/gemini-2.0-flash-live-001",
    "generation_config": {
        "response_modalities": ["AUDIO", "TEXT"],
        "speech_config": {
            "voice_config": {"prebuilt_voice_config": {"voice_name": "Leda"}}
        }
    },
    "system_instruction": {
        "parts": [{"text": dynamic_system_instruction}]
    },
    "tools": [],
    "tool_config": {"function_calling_config": {"mode": "NONE"}},
    "turn_detection": {"input_audio_config": {"model": "default", "start_timeout": "10s", "end_timeout": "2s"}},
    "output_audio_transcription": True  # 音声転写有効化
}
```

## 3. API設計

### 3.1 WebSocket イベント

#### クライアント → サーバー
```javascript
// 音声データ送信
socket.emit('audio_data', {
    audio: base64AudioData,
    timestamp: Date.now()
});

// シーン・ロール選択
socket.emit('select_scene_role', {
    scene: 'restaurant',
    user_role: 'customer',
    ai_role: 'waiter'
});

// セッション制御
socket.emit('start_session');
socket.emit('stop_session');
```

#### サーバー → クライアント
```python
# AI音声応答
socketio.emit('ai_audio_response', {
    'audio_data': base64_audio,
    'transcription': response_text,
    'translation': japanese_translation
})

# 音声転写結果
socketio.emit('transcription_update', {
    'type': 'user_input',  # or 'ai_output'
    'text': transcribed_text,
    'timestamp': timestamp
})

# セッション状態更新
socketio.emit('session_status', {
    'status': 'active',  # 'inactive', 'connecting'
    'scene': current_scene,
    'roles': current_roles
})
```

### 3.2 REST API エンドポイント

```python
# シーン・ロール情報取得
@app.route('/api/scenes', methods=['GET'])
def get_scenes():
    return jsonify(SCENE_ROLE_DATA)

# アプリケーション設定
@app.route('/api/config', methods=['GET'])
def get_config():
    return jsonify({
        'audio_settings': AUDIO_CONFIG,
        'supported_languages': ['ja', 'en']
    })
```

## 4. フロントエンド コンポーネント設計

### 4.1 メインアプリケーション構造

```html
<!DOCTYPE html>
<html>
<head>
    <title>英語学習 Voice Assistant</title>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body>
    <div id="app">
        <!-- シーン・ロール選択エリア -->
        <div id="scene-selection"></div>

        <!-- メイン会話エリア -->
        <div id="conversation-area">
            <div id="status-display"></div>
            <div id="volume-meter"></div>
            <div id="conversation-history"></div>
            <div id="control-buttons"></div>
        </div>

        <!-- 学習支援エリア -->
        <div id="learning-support">
            <div id="conversation-suggestions"></div>
        </div>
    </div>
</body>
</html>
```

### 4.2 JavaScript モジュール構成

```javascript
// app.js - メインアプリケーション
class VoiceAssistantApp {
    constructor() {
        this.socket = io('/ws/socket.io');
        this.audioManager = new AudioManager();
        this.sceneManager = new SceneManager();
        this.conversationManager = new ConversationManager();
    }
}

// audio-manager.js - 音声処理
class AudioManager {
    async initializeAudio() {
        // WebRTC音声キャプチャ初期化
        // AudioWorkletNode設定
        // 音量メーター実装
    }
}

// scene-manager.js - シーン・ロール管理
class SceneManager {
    displaySceneSelection() {
        // シーン選択UI表示
        // ロール選択UI表示
        // カスタムシーン入力
    }
}

// conversation-manager.js - 会話管理
class ConversationManager {
    displayMessage(type, text, translation) {
        // ユーザー発話表示（青色、太字）
        // AI応答表示（緑色、太字）
        // 日本語翻訳表示（紫色）
    }
}
```

## 5. 音声処理・リアルタイム通信

### 5.1 音声キャプチャフロー

```javascript
// 連続音声キャプチャ実装
class ContinuousAudioCapture {
    async start() {
        const stream = await navigator.mediaDevices.getUserMedia({audio: true});
        const audioContext = new AudioContext({sampleRate: 16000});

        // AudioWorkletNode使用（ScriptProcessorNode非推奨対応）
        await audioContext.audioWorklet.addModule('audio-processor.js');
        const processor = new AudioWorkletNode(audioContext, 'audio-processor');

        // リアルタイム音量レベル表示
        processor.port.onmessage = (event) => {
            if (event.data.type === 'volume') {
                this.updateVolumeDisplay(event.data.level);
            }
            if (event.data.type === 'audio') {
                this.sendAudioToServer(event.data.buffer);
            }
        };
    }
}
```

### 5.2 フィードバック防止機能

```javascript
class FeedbackPrevention {
    constructor() {
        this.isAIPlaying = false;
        this.silenceTimeout = null;
    }

    onAIAudioStart() {
        this.isAIPlaying = true;
        this.pauseMicrophoneInput();
    }

    onAIAudioEnd() {
        this.isAIPlaying = false;
        // 1.5秒の無音期間後にマイク再開
        this.silenceTimeout = setTimeout(() => {
            this.resumeMicrophoneInput();
        }, 1500);
    }
}
```

## 6. ファイル構造

```
web/
├── app.py                          # Flask メインアプリケーション
├── requirements.txt                # Python依存関係
├── static/
│   ├── css/
│   │   ├── main.css               # メインスタイル
│   │   └── components.css         # コンポーネントスタイル
│   ├── js/
│   │   ├── app.js                 # メインアプリケーション
│   │   ├── audio-manager.js       # 音声処理
│   │   ├── scene-manager.js       # シーン・ロール管理
│   │   ├── conversation-manager.js # 会話管理
│   │   └── audio-processor.js     # AudioWorklet処理
│   └── assets/
│       ├── icons/                 # シーンアイコン
│       └── sounds/                # 効果音
├── templates/
│   └── index.html                 # メインHTML
├── modules/
│   ├── gemini_client.py          # Gemini API クライアント
│   ├── scene_manager.py          # シーン・ロール管理
│   └── audio_processor.py        # 音声処理
└── config/
    ├── scenes.json               # シーン・ロールデータ
    └── app_config.py            # アプリケーション設定

## 7. 移行計画・実装手順

### 7.1 段階的移行アプローチ

#### Phase 1: 基盤構築
1. **Flask-SocketIO基盤セットアップ**
   - Flask + Flask-SocketIO 5.3.x (threading mode)
   - HTTPS自動証明書生成
   - WebSocket通信 (/ws/socket.io)

2. **基本UI実装**
   - HTML/CSS/JavaScript基盤
   - シーン・ロール選択インターフェース
   - 会話履歴表示エリア

#### Phase 2: 音声機能実装
1. **WebRTC音声キャプチャ**
   - 連続音声キャプチャ（録音ボタン不要）
   - AudioWorkletNode実装
   - リアルタイム音量メーター

2. **Gemini Live API統合**
   - WebSocket経由でのAPI通信
   - 音声転写機能 (output_audio_transcription)
   - フィードバック防止機能

#### Phase 3: 高度機能実装
1. **学習支援機能**
   - 会話提案表示
   - 日本語翻訳表示
   - 学習進捗追跡

2. **UI/UX最適化**
   - レスポンシブデザイン
   - アクセシビリティ対応
   - パフォーマンス最適化

### 7.2 技術的課題と対策

#### 音声処理の課題
- **課題**: ブラウザ音声API制限
- **対策**: WebRTC + AudioWorkletNode使用、HTTPS必須対応

#### リアルタイム通信の課題
- **課題**: WebSocket接続安定性
- **対策**: 自動再接続機能、エラーハンドリング強化

#### セキュリティの課題
- **課題**: HTTPS証明書管理
- **対策**: Let's Encrypt自動証明書生成

## 8. 依存関係・パッケージ管理

### 8.1 Python依存関係 (requirements.txt)

```txt
Flask==3.0.0
Flask-SocketIO==5.3.6
google-genai==0.3.0
python-socketio==5.10.0
eventlet==0.33.3
gunicorn==21.2.0
certbot==2.7.4
python-dotenv==1.0.0
```

### 8.2 JavaScript依存関係

```json
{
  "dependencies": {
    "socket.io-client": "^4.7.4"
  },
  "devDependencies": {
    "@types/socket.io-client": "^3.0.0"
  }
}
```

### 8.3 パッケージ管理方針

- **Python**: pip + requirements.txt
- **JavaScript**: CDN配信（socket.io-client）
- **自動インストール**: setup.sh スクリプト提供

## 9. デプロイメント・運用

### 9.1 HTTPS対応

#### 自動証明書生成
```bash
# Let's Encrypt証明書自動取得
certbot certonly --standalone -d yourdomain.com
```

#### Flask HTTPS設定
```python
if __name__ == '__main__':
    context = ssl.SSLContext(ssl.PROTOCOL_TLSv1_2)
    context.load_cert_chain('cert.pem', 'key.pem')
    socketio.run(app, host='0.0.0.0', port=443, ssl_context=context)
```

### 9.2 本番環境構成

#### 推奨構成
- **Webサーバー**: Flask単体（Nginx不要）
- **プロセス管理**: Gunicorn + systemd
- **SSL/TLS**: Let's Encrypt自動更新
- **ログ管理**: Python logging + logrotate

#### 環境変数設定
```bash
export GEMINI_API_KEY="your_api_key_here"
export FLASK_ENV="production"
export SSL_CERT_PATH="/etc/letsencrypt/live/yourdomain.com/"
```

## 10. テスト戦略

### 10.1 WebSocket テスト

#### 代替テストライブラリ使用
```python
# pytest-socketio の代替として python-socketio-client 使用
import socketio

def test_websocket_connection():
    sio = socketio.SimpleClient()
    sio.connect('https://localhost:443/ws/socket.io')

    # 音声データ送信テスト
    sio.emit('audio_data', test_audio_data)
    response = sio.receive()
    assert response[0] == 'ai_audio_response'
```

### 10.2 音声機能テスト

#### ブラウザ自動化テスト
```javascript
// Selenium WebDriver + Chrome DevTools Protocol
const { Builder, By, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

async function testAudioCapture() {
    const options = new chrome.Options();
    options.addArguments('--use-fake-ui-for-media-stream');
    options.addArguments('--use-fake-device-for-media-stream');

    const driver = await new Builder()
        .forBrowser('chrome')
        .setChromeOptions(options)
        .build();

    // 音声キャプチャ許可テスト
    await driver.get('https://localhost:443');
    // テスト実行...
}
```

## 11. パフォーマンス・最適化

### 11.1 音声処理最適化

#### バッファリング戦略
```javascript
class AudioBuffer {
    constructor() {
        this.bufferSize = 1024;
        this.sendInterval = 100; // 100ms間隔
        this.compressionLevel = 0.8;
    }

    optimizeForLatency() {
        // 低遅延モード: バッファサイズ削減
        this.bufferSize = 512;
        this.sendInterval = 50;
    }
}
```

### 11.2 WebSocket最適化

#### 接続プール管理
```python
class WebSocketManager:
    def __init__(self):
        self.connection_pool = {}
        self.max_connections = 100

    def optimize_connection(self, sid):
        # 接続最適化ロジック
        # バッファサイズ調整
        # 圧縮設定
```

## 12. セキュリティ考慮事項

### 12.1 HTTPS強制

```python
@app.before_request
def force_https():
    if not request.is_secure and app.env != 'development':
        return redirect(request.url.replace('http://', 'https://'))
```

### 12.2 API キー保護

```python
import os
from dotenv import load_dotenv

load_dotenv()
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')

if not GEMINI_API_KEY:
    raise ValueError("GEMINI_API_KEY environment variable is required")
```

## 13. 今後の拡張計画

### 13.1 機能拡張
- **PWA対応**: オフライン機能、アプリインストール
- **多言語UI**: 英語・日本語UI切り替え
- **学習分析**: 発話分析、進捗レポート
- **ソーシャル機能**: 学習グループ、ランキング

### 13.2 技術改善
- **WebAssembly**: 音声処理高速化
- **WebCodecs API**: 音声圧縮最適化
- **Service Worker**: キャッシュ戦略
- **WebGPU**: AI処理アクセラレーション
