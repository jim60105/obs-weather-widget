# OBS Weather Widget - Copilot Instructions

## Project Overview

This is a **static website** project that displays weather forecasts as a transparent widget for OBS Studio browser sources. The project consists of two main pages:

1. **Setup Page** (`index.html`): Configuration interface for building widget parameters
2. **Widget Page** (`widget.html`): Display page with transparent background for OBS

The widget cycles through multiple locations, showing tomorrow's weather forecast including SVG icons, temperature, and place name.

## Tech Stack

- **HTML5**: Semantic markup
- **Tailwind CSS**: Utility-first styling (via CDN)
- **Vanilla JavaScript (ES6+)**: No frameworks or build tools
- **SVG**: Weather icons
- **No build step**: Pure static files served directly

## Project Structure

```text
obs-weather-widget/
├── index.html              # Setup page (entry point)
├── widget.html             # Widget display page
├── css/
│   └── styles.css          # Custom styles (Tailwind via CDN)
├── js/
│   ├── setup.js            # Setup page logic
│   ├── widget.js           # Widget display and cycling logic
│   └── api.js              # Open-Meteo API wrapper
├── icons/
│   └── weather/            # SVG weather icons by WMO code
├── .github/
│   └── instructions/
│       └── web-design-guideline.instructions.md
├── AGENTS.md               # This file
├── LICENSE                 # AGPL-3.0
├── art-style-reference.png  # Design reference image
└── README.md
```

## API Integration

### Weather Forecast API

- **Endpoint**: `https://api.open-meteo.com/v1/forecast`
- **Required Parameters**:
  - `latitude`, `longitude`: Location coordinates
  - `daily`: `weather_code,temperature_2m_max,temperature_2m_min`
  - `timezone`: `auto`
  - `forecast_days`: `2` (today + tomorrow)
- **Response**: JSON with daily arrays for weather data

### Geocoding API

- **Endpoint**: `https://geocoding-api.open-meteo.com/v1/search`
- **Required Parameters**:
  - `name`: Search string (location name)
  - `count`: Number of results (default: 10)
  - `language`: `en` or locale code
- **Response**: JSON with `results` array containing location data

### WMO Weather Codes

Map these codes to appropriate SVG icons:

| Code Range | Condition     | Icon Suggestion   |
| ---------- | ------------- | ----------------- |
| 0          | Clear sky     | sun.svg           |
| 1-3        | Partly cloudy | partly-cloudy.svg |
| 45, 48     | Fog           | fog.svg           |
| 51-57      | Drizzle       | drizzle.svg       |
| 61-67      | Rain          | rain.svg          |
| 71-77      | Snow          | snow.svg          |
| 80-82      | Rain showers  | showers.svg       |
| 85-86      | Snow showers  | snow-showers.svg  |
| 95-99      | Thunderstorm  | thunderstorm.svg  |

## Coding Guidelines

### JavaScript

- Use ES6+ features: `const`/`let`, arrow functions, template literals, async/await
- Write modular functions with single responsibility
- Use `fetch()` for API calls with proper error handling
- Implement debouncing for search input
- Use event delegation where appropriate
- All comments in English

### HTML

- Use semantic HTML5 elements (`<main>`, `<section>`, `<article>`, etc.)
- Ensure accessibility with proper ARIA attributes
- Keep DOM structure minimal and clean

### CSS / Tailwind

- Use Tailwind utility classes via CDN
- Follow mobile-first responsive approach
- For widget page: ensure `background: transparent` for OBS compatibility
- Use CSS custom properties for theme values if needed

### Error Handling

- Handle API failures gracefully with user feedback
- Validate user input before API calls
- Show loading states during async operations
- Provide fallback content when data unavailable

## Key Implementation Details

### Setup Page (`index.html`)

1. **Location Input**: Text input with autocomplete from Geocoding API
2. **Coordinate Display**: Show lat/lon after geocoding
3. **Custom Name Input**: User-defined display name for location
4. **Location List**: Manage multiple locations with add/remove
5. **Preview iframe**: Live preview of widget with current settings
6. **URL Generator**: Build and display widget URL with encoded parameters

### Widget Page (`widget.html`)

1. **URL Parameter Parsing**: Parse `locations` JSON from URL
2. **Weather Fetching**: Fetch forecast for all locations
3. **Cycling Display**: Rotate through locations every 5 seconds
4. **Tomorrow's Data**: Always display index 1 from daily arrays
5. **Transparent Background**: No background color/image for OBS

### URL Parameter Format

```javascript
const params = {
  locations: [
    { name: "台北", lat: 25.033, lon: 121.565 },
    { name: "東京", lat: 35.676, lon: 139.650 }
  ],
  interval: 5000,  // optional, default 5000ms
  unit: "celsius"  // optional, "celsius" or "fahrenheit"
};
```

Encode as: `?locations=${encodeURIComponent(JSON.stringify(locations))}`

## Commands

### Local Development

```bash
# Using npx serve
npx serve .

# Using Python
python -m http.server 8000

# Using PHP
php -S localhost:8000
```

No build, compile, or install steps required.

## Testing Checklist

- [ ] Setup page loads without errors
- [ ] Geocoding search returns results
- [ ] Locations can be added/removed from list
- [ ] Preview iframe updates with changes
- [ ] Generated URL is correct and copyable
- [ ] Widget page loads with URL parameters
- [ ] Weather data displays correctly
- [ ] Location cycling works at specified interval
- [ ] Widget has transparent background in OBS
- [ ] Error states display appropriate messages

## License

AGPL-3.0 - See [LICENSE](LICENSE) file.

## Notes for Agents

- Always test API calls work before implementing UI
- Ensure all async operations have loading and error states
- Keep the widget page lightweight for OBS performance
- SVG icons should be simple and clear at small sizes
- Temperature should show both max and min for tomorrow
- Place names may contain non-ASCII characters (CJK support required)
