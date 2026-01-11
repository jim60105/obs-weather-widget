# OBS Weather Widget

A transparent weather widget for OBS Studio browser sources, displaying weather forecasts with cycling location support.

[![License: AGPL v3](https://img.shields.io/badge/License-AGPL%20v3-blue.svg)](https://www.gnu.org/licenses/agpl-3.0)
[![Tests](https://img.shields.io/badge/tests-23%2F23%20passing-brightgreen.svg)](INTEGRATION_TEST_REPORT.md)

## Features

- 🌤️ Display tomorrow's weather forecast with intuitive SVG icons
- 🌡️ Show temperature (溫度) and location name
- 🔄 Cycle through multiple locations every 5 seconds
- 🎨 Transparent background designed for OBS browser sources
- 🔧 User-friendly setup page with live preview
- 🌍 Global location support via geocoding

## Demo

<!-- TODO: Add demo GIF or screenshot here -->

## Pages

### Setup Page (`/`)

The configuration interface where users can:

- Enter location by **latitude/longitude** or **place name** (geocoded automatically)
- Define custom display names for each location
- Add multiple locations to a cycling list
- Preview the widget in an embedded iframe
- Generate the widget URL with all parameters

### Widget Page (`/widget.html`)

The display page designed for OBS browser sources:

- Transparent background for seamless stream overlay
- Shows tomorrow's weather forecast
- Displays weather icon (SVG), temperature, and place name
- Automatically cycles through configured locations every 5 seconds

## Usage

### 1. Configure Your Widget

1. Open the setup page in your browser
2. Search for a location by name or enter coordinates manually
3. Define a display name for the location
4. Click "Add" to add the location to your list
5. Repeat for additional locations
6. Copy the generated widget URL

### 2. Add to OBS

1. In OBS Studio, add a new **Browser Source**
2. Paste the widget URL into the URL field
3. Set appropriate width and height (recommended: 300×150)
4. The widget will display with a transparent background

## API Integration

This project uses [Open-Meteo](https://open-meteo.com/) APIs:

| API              | Endpoint                                           | Purpose                            |
| ---------------- | -------------------------------------------------- | ---------------------------------- |
| Weather Forecast | `https://api.open-meteo.com/v1/forecast`           | Retrieve daily weather data        |
| Geocoding        | `https://geocoding-api.open-meteo.com/v1/search`   | Convert place names to coordinates |

### Weather Data Retrieved

- `weather_code`: WMO weather interpretation code for icon selection
- `temperature_2m_max` / `temperature_2m_min`: Daily temperature range
- Daily forecast for tomorrow

### WMO Weather Codes

| Code       | Condition                               |
| ---------- | --------------------------------------- |
| 0          | Clear sky                               |
| 1, 2, 3    | Mainly clear, partly cloudy, overcast   |
| 45, 48     | Fog                                     |
| 51, 53, 55 | Drizzle                                 |
| 61, 63, 65 | Rain                                    |
| 71, 73, 75 | Snow                                    |
| 80, 81, 82 | Rain showers                            |
| 85, 86     | Snow showers                            |
| 95, 96, 99 | Thunderstorm                            |

## URL Parameters

The widget page accepts the following URL parameters:

| Parameter   | Type        | Description                                                      |
| ----------- | ----------- | ---------------------------------------------------------------- |
| `locations` | JSON string | Array of location objects with `name`, `lat`, `lon`              |
| `interval`  | number      | Cycling interval in milliseconds (default: 5000)                 |
| `unit`      | string      | Temperature unit: `celsius` or `fahrenheit` (default: `celsius`) |

Example:

```text
/widget.html?locations=[{"name":"台北","lat":25.0531,"lon":121.5264},{"name":"東京","lat":35.68952,"lon":139.6917}]
```

## Tech Stack

- **HTML5** with semantic elements
- **Tailwind CSS** for styling
- **Vanilla JavaScript (ES6+)** for functionality
- **SVG** for weather icons
- No build step required - pure static files

## Project Structure

```text
obs-weather-widget/
├── index.html          # Setup page
├── widget.html         # Widget display page
├── css/
│   └── styles.css      # Tailwind CSS and custom styles
├── js/
│   ├── setup.js        # Setup page logic
│   ├── widget.js       # Widget display logic
│   └── api.js          # Open-Meteo API integration
├── icons/
│   └── weather/        # SVG weather icons
├── AGENTS.md           # Copilot instructions
├── LICENSE             # AGPL-3.0
└── README.md
```

## Development

### Prerequisites

- A modern web browser
- A local web server (e.g., `npx serve`, VS Code Live Server, or Python's `http.server`)

### Running Locally

```bash
# Using npx serve
npx serve .

# Or using Python
python -m http.server 8000
```

Then open `http://localhost:8000` in your browser.

## License

<img src="https://github.com/user-attachments/assets/38374bb8-9e65-482d-97d9-045a8d95b51b" alt="agplv3" width="300" />

[GNU AFFERO GENERAL PUBLIC LICENSE Version 3](./LICENSE)

Copyright (C) 2026 Jim Chen <Jim@ChenJ.im>.

This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.

## Acknowledgments

- Weather data provided by [Open-Meteo](https://open-meteo.com/)
