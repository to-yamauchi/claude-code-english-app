これは、Claude Code Actionsを利用するためのひな型です。これをimport(コピー)して開発を始められます。

## English Learning Voice Assistant

フェーズ１：Flask-SocketIOベースのWebアプリケーション

### 使い方

#### ポート番号の指定

アプリケーションを起動する際、以下の方法でポート番号を指定できます：

1. **コマンドライン引数を使用**:
   ```bash
   python web/app.py --port 8080
   # または
   python web/app.py -p 8080
   ```

2. **環境変数を使用**:
   ```bash
   PORT=8080 python web/app.py
   ```

3. **デフォルトポート**:
   - 開発モード: 5000
   - 本番モード: 443

#### その他のオプション

- `--host`: バインドするホストアドレス (デフォルト: 0.0.0.0)
   ```bash
   python web/app.py --host localhost --port 8080
   ```
