# 解約日リマインダー機能 設計書

## 機能概要
携帯回線の解約可能日を見逃さないためのリマインダー機能を実装する。
ダッシュボード型アラートとカレンダービューの2つの表示方式を提供。

## UI/UXデザイン

### 1. ダッシュボードアラート
- ページ上部に常時表示
- 期限が近い順に表示
- 色分け表示
  - 7日以内: 赤（#ff6b6b）
  - 30日以内: 黄（#ffd43b）
  - それ以外: 緑（#51cf66）

### 2. カレンダービュー
- 月表示カレンダー
- 解約可能日にマーカー表示
- クリックで詳細情報をポップアップ
- 前後の月への移動ボタン

## 実装詳細

### HTMLの変更
1. ダッシュボードアラートのコンテナ追加
2. カレンダービューのコンテナ追加
3. 表示切り替えタブの追加

### CSSの追加
```css
/* アラートスタイル */
.reminder-dashboard {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.alert-urgent {
  border-left: 4px solid #ff6b6b;
}

.alert-warning {
  border-left: 4px solid #ffd43b;
}

/* カレンダースタイル */
.calendar-container {
  background: white;
  border-radius: 8px;
  padding: 20px;
}

.calendar-day.has-reminder {
  background: #ff6b6b;
  color: white;
  font-weight: bold;
}
```

### JavaScriptの実装
1. 期限計算関数
   - 解約可能日までの日数を計算
   - 期限に応じた分類（7日以内、30日以内、それ以外）

2. ダッシュボード表示関数
   - 期限が近い順にソート
   - HTMLを動的生成

3. カレンダー表示関数
   - 現在の月のカレンダーを生成
   - 解約可能日にマーカーを配置

4. データ連携
   - 既存のデータと連携
   - リアルタイム更新

## テスト項目
1. 期限計算の正確性
2. 表示の更新タイミング
3. UI操作の応答性
4. データの整合性