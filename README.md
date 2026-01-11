# OBS 天氣小工具

一個適用於 `OBS Studio` 瀏覽器來源的可愛風格天氣小工具，顯示明日天氣預報並支援多個地點輪播。

## 功能

- 🌤️ 顯示明日天氣預報，並搭配可愛風格圖示
- 🌡️ 顯示溫度與地點名稱
- 🔄 每數秒輪播多個地點
- 🎨 為 `OBS` 瀏覽器來源設計的透明背景
- 🔧 使用者友善的設定頁面，具備即時預覽
- 🌍 支援全球地點搜尋（使用地理編碼）

## 展示

<!-- TODO: 在此加入展示 GIF 或截圖 -->

## 頁面說明

### 設定頁（`/`）

設定介面包含：

- 可透過 **緯度/經度** 或 **地名** 輸入地點（將自動以地理編碼解析）
- 為每個地點定義自訂顯示名稱
- 新增多個地點至輪播清單
- 在內嵌 `iframe` 中即時預覽小工具
- 產生包含所有參數的 Widget URL

### 小工具頁（`/widget.html`）

為 `OBS` 瀏覽器來源設計的顯示頁：

- 透明背景以便於串流覆蓋顯示
- 顯示明日的天氣預報
- 顯示天氣圖示、溫度與地名
- 自動以預設或指定間隔（預設 5 秒）輪播已設定的地點

## 使用方式

### 1. 設定您的小工具

1. 在瀏覽器中開啟設定頁面: <https://obs-weather-widget.pages.dev/>
2. 以名稱搜尋地點或手動輸入座標
3. 設定該地點的顯示名稱
4. 點選「新增」將地點加入清單
5. 重複上述步驟以加入更多地點
6. 複製產生後的 Widget URL

### 2. 加入 OBS

1. 在 `OBS Studio` 中新增一個 **Browser Source**
2. 將 Widget URL 貼入 URL 欄位
3. 設定寬度與高度 450 x 250
4. 小工具即會以透明背景顯示

## API 整合

本專案使用 [Open-Meteo](https://open-meteo.com/) 的 API：

| API      | Endpoint                                         | 用途             |
| -------- | ------------------------------------------------ | ---------------- |
| 天氣預報 | `https://api.open-meteo.com/v1/forecast`         | 取得每日天氣資料 |
| 地理編碼 | `https://geocoding-api.open-meteo.com/v1/search` | 將地名轉換為座標 |

### 取得的天氣資料

- `weather_code`：WMO 天氣判讀代碼，用於選取圖示
- `temperature_2m_max` / `temperature_2m_min`：每日溫度範圍
- 取用明日的每日預報資料

### WMO 天氣代碼對照

| 代碼       | 狀態說明               |
| ---------- | ---------------------- |
| 0          | 晴朗                   |
| 1, 2, 3    | 大致晴、部分多雲、陰天 |
| 45, 48     | 濃霧                   |
| 51, 53, 55 | 毛毛雨（細雨）         |
| 61, 63, 65 | 雨                     |
| 71, 73, 75 | 雪                     |
| 80, 81, 82 | 陣雨                   |
| 85, 86     | 雪陣                   |
| 95, 96, 99 | 雷暴                   |

## URL 參數

小工具頁接受以下 URL 參數：

| 參數        | 類型      | 說明                                                   |
| ----------- | --------- | ------------------------------------------------------ |
| `locations` | JSON 字串 | 包含 `name`、`lat`、`lon` 的地點物件陣列               |
| `interval`  | number    | 輪播間隔，單位為毫秒（預設：5000）                     |
| `unit`      | string    | 溫度單位：`celsius` 或 `fahrenheit`（預設：`celsius`） |

範例：

```text
/widget?locations=[{"name":"台北","lat":25.0531,"lon":121.5264},{"name":"東京","lat":35.68952,"lon":139.6917}]
```

## 技術棧

- **HTML5**（語意化標記）
- **Tailwind CSS**（樣式）
- **Vanilla JavaScript（ES6+）**（功能實作）
- 無需建構步驟，純靜態檔案

## 專案結構

```text
obs-weather-widget/
├── index.html              # 設定頁面 (主入口)
├── widget.html             # 小工具顯示頁
├── site.webmanifest        # PWA manifest
├── _headers                # Cloudflare Pages 標頭設定
├── favicon.svg             # 網站圖示
├── apple-touch-icon.png    # iOS 圖示
├── css/
│   └── styles.css          # 小工具專用 CSS (含 CSS variables 與動畫)
├── js/
│   ├── api.js              # Open-Meteo API 整合模組
│   ├── setup.js            # 設定頁邏輯 (搜尋、新增、預覽、URL 產生)
│   └── widget.js           # 小工具顯示與輪播邏輯
├── icons/
│   └── weather/            # WMO 天氣圖示
├── docs/
│   └── API_USAGE.md        # API 模組使用範例與文件
├── .github/
│   └── instructions/
│       └── web-design-guideline.instructions.md
├── AGENTS.md               # Copilot 使用說明
├── LICENSE                 # AGPL-3.0 授權條款
└── README.md               # 本檔案
```

## 開發

### 先決條件

- 現代的網頁瀏覽器
- 本機網頁伺服器（例如：`npx serve`、VS Code Live Server、或 Python 的 `http.server`）

### 在本機執行

```bash
# 使用 npx serve
npx serve .

# 或使用 Python
python -m http.server 8000
```

## 授權

<img src="https://github.com/user-attachments/assets/38374bb8-9e65-482d-97d9-045a8d95b51b" alt="agplv3" width="300" />

[GNU AFFERO GENERAL PUBLIC LICENSE Version 3](./LICENSE)

Copyright (C) 2026 Jim Chen <Jim@ChenJ.im>。

本程式為自由軟體：您可以依據由自由軟體基金會發布的 GNU Affero 通用公共授權條款（第 3 版，或您選擇的任何後續版本）重新發佈及/或修改本程式。

本程式以期望其有用而發佈，但不提供任何保證；甚至不包含對適銷性或特定用途適用性的默示保證。詳情請參閱 GNU Affero 通用公共授權條款。

您應已隨本程式收到一份 GNU Affero 通用公共授權條款副本。如果沒有，請參見 <https://www.gnu.org/licenses/> 。

## 致謝

- 天氣資料由 [Open-Meteo](https://open-meteo.com/) 提供
