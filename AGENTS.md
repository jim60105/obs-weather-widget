# OBS Weather Widget - Copilot Instructions

## Project Overview

This is a cute-style weather widget for OBS Studio browser sources, built as a pure static website without any build tools or server-side processing. The project consists of two main pages:

1. **Setup Page** (`index.html`): Provides a user interface for configuring locations, options, and generating the widget URL
2. **Widget Page** (`widget.html`): Transparent background weather display page for use as an OBS browser source

### Core Features

- Display tomorrow's weather forecast (temperature range, weather conditions, cute icons)
- Support multiple location cycling with customizable intervals
- Transparent background design suitable for stream overlay
- Support Celsius/Fahrenheit temperature switching
- Use Open-Meteo's free API to fetch weather data

## Tech Stack

- **HTML5**: Semantic markup, ensuring accessibility
- **Tailwind CSS**: Loaded via CDN, using utility-first styling approach
- **Vanilla JavaScript (ES6+)**: No frameworks, pure JavaScript implementation
- **Google Fonts**: Uses `UoqMunThenKhung` font to create a cute aesthetic
- **No Build Process**: Serves static files directly, can be deployed to CDN or static hosting

## Project Structure

```text
obs-weather-widget/
├── index.html              # Setup page (main entry point)
├── widget.html             # Widget display page
├── site.webmanifest        # PWA manifest
├── _headers                # Cloudflare Pages header configuration
├── favicon.svg             # Website icon
├── apple-touch-icon.png    # iOS icon
├── css/
│   └── styles.css          # Widget-specific CSS (includes CSS variables and animations)
├── js/
│   ├── api.js              # Open-Meteo API integration module
│   ├── setup.js            # Setup page logic (search, add, preview, URL generation)
│   └── widget.js           # Widget page logic (parse params, fetch weather, cycling)
├── icons/
│   └── weather/            # Weather icons (WebP format, named by WMO code)
├── docs/
│   └── API_USAGE.md        # API module usage examples and documentation
├── .github/
│   └── instructions/
│       └── web-design-guideline.instructions.md
├── AGENTS.md               # This file (Copilot instructions)
├── LICENSE                 # AGPL-3.0 license
└── README.md               # Project documentation (Traditional Chinese)
```

## Architecture

### API Module (`js/api.js`)

Provides API integration functions, accessible via `window.WeatherAPI` in browser environment:

- `searchLocation(query, count, language)`: Geocoding search using OpenStreetMap Nominatim
- `fetchWeather(lat, lon, unit)`: Fetch weather for a single location using Open-Meteo
- `fetchWeatherForLocations(locations, unit)`: Fetch weather for multiple locations in parallel
- `getWeatherIcon(code)`: Convert WMO code to filename
- `getWeatherIconPath(code)`: Get full icon path
- `getWeatherDescription(code)`: Get weather description in Traditional Chinese

All functions use `async/await` and include error handling mechanisms.

### Setup Page (`index.html` + `js/setup.js`)

State management and interaction logic for the setup page:

1. **Location Search**: Uses Nominatim Geocoding API. Search is triggered by button click or Enter key only (no auto-complete to comply with Nominatim usage policy)
2. **Location Management**: Maintains `setupState.locations` array, supports add/remove operations
3. **Live Preview**: Uses `<iframe>` to display widget preview, automatically updates when parameters change
4. **URL Generator**: Encodes `locations`, `interval`, `unit` parameters into URL query string
5. **Event Delegation**: Uses event delegation to handle dynamically generated button clicks

### Widget Page (`widget.html` + `js/widget.js`)

Core functionality of the widget page:

1. **Parameter Parsing**: Parses `locations`, `interval`, `unit` parameters from URL
2. **Weather Data Fetching**: Uses `fetchWeatherForLocations()` to fetch weather for all locations in parallel
3. **Display Logic**: Always displays index 1 from `daily` arrays (tomorrow's forecast)
4. **Cycling Mechanism**: Uses `setInterval()` to switch locations at specified intervals (default 5000ms)
5. **State Management**: Maintains `state` object containing locations, weatherData, currentIndex, timer
6. **Loading/Error States**: Provides three display states: loading, error, weather

### Styling Approach

- **Setup Page**: Uses Tailwind utility classes + inline styles to create cute aesthetic
- **Widget Page**: `css/styles.css` contains dedicated styles, uses CSS variables to define color scheme
- **Transparent Background**: `body { background: transparent !important; }` ensures OBS transparency
- **Animation Effects**: Uses CSS transitions for smooth cycling and hover effects
- **Responsive Design**: Uses Tailwind responsive prefixes (`md:`, `lg:`)

## API Integration Details

### Weather Forecast API

```javascript
// Endpoint
https://api.open-meteo.com/v1/forecast

// Parameters
{
  latitude: number,
  longitude: number,
  daily: "weather_code,temperature_2m_max,temperature_2m_min",
  timezone: "auto",
  forecast_days: 2,
  temperature_unit: "celsius" | "fahrenheit"  // optional
}

// Response
{
  daily: {
    time: ["2026-01-11", "2026-01-12"],
    weather_code: [3, 61],
    temperature_2m_max: [18.5, 15.2],
    temperature_2m_min: [12.3, 10.1]
  }
}
```

### Geocoding API (OpenStreetMap Nominatim)

```javascript
// Endpoint
https://nominatim.openstreetmap.org/search

// Parameters
{
  q: string,           // search query
  format: "jsonv2",    // response format
  limit: number,       // max results (default: 10, max: 40)
  "accept-language": string,  // e.g., "en", "zh"
  addressdetails: "1", // include address breakdown
  layer: "address"     // filter to address-type results
}

// Response (jsonv2 format)
[
  {
    place_id: number,
    lat: string,       // latitude as string
    lon: string,       // longitude as string
    name: string,      // place name
    display_name: string,  // full display name
    address: {
      country: string,
      state: string,
      ...
    }
  }
]
```

**Important Requirements (Nominatim Usage Policy):**
- Must provide valid User-Agent header identifying the application
- Maximum 1 request per second
- No auto-complete search allowed (use button trigger or Enter key only)
- Must display proper attribution to OpenStreetMap

### WMO Weather Codes Mapping

Implemented in `getWeatherIcon()` function in `js/api.js`:

| Code Range | Condition          | WebP File           | Chinese Description |
| ---------- | ------------------ | ------------------- | ------------------- |
| 0          | Clear sky          | clear.webp          | 晴朗溫暖            |
| 1-3        | Partly cloudy      | partly-cloudy.webp  | 多雲時晴            |
| 45, 48     | Fog                | fog.webp            | 霧氣朦朧            |
| 51-57      | Drizzle            | drizzle.webp        | 細雨綿綿            |
| 61-67      | Rain               | rain.webp           | 輕柔降雨            |
| 71-77      | Snow               | snow.webp           | 浪漫飄雪            |
| 80-82      | Rain showers       | showers.webp        | 陣雨來訪            |
| 85-86      | Snow showers       | snow-showers.webp   | 陣雪飄落            |
| 95-99      | Thunderstorm       | thunderstorm.webp   | 雷雨活力            |
| fallback   | Unknown            | unknown.webp        | 天氣更新中          |

## URL Parameter Format

The widget page receives parameters via URL query string:

```javascript
// Parameter structure
const params = {
  locations: [
    { name: "台北", lat: 25.033, lon: 121.565 },
    { name: "東京", lat: 35.6895, lon: 139.6917 }
  ],
  interval: 5000,  // cycling interval in milliseconds (default: 5000)
  unit: "celsius"  // "celsius" or "fahrenheit" (default: "celsius")
};

// URL generation
const url = `widget.html?locations=${encodeURIComponent(JSON.stringify(params.locations))}&interval=${params.interval}&unit=${params.unit}`;
```

## Coding Standards

### JavaScript Guidelines

- **ES6+ Syntax**: Use `const`/`let`, arrow functions, template literals, async/await
- **Modular Functions**: Each function should have single responsibility (Single Responsibility Principle)
- **Error Handling**: All API calls must include try-catch and display user-friendly error messages
- **Loading States**: Async operations must provide loading states
- **Event Delegation**: Use event delegation for dynamically generated elements
- **Debouncing**: Implement debounce (300ms) for search inputs
- **Comment Language**: All code comments must be in English

### HTML Guidelines

- **Semantic HTML5**: Use `<main>`, `<section>`, `<article>`, `<header>`, `<footer>`
- **Accessibility**: Add ARIA attributes when necessary (`aria-label`, `aria-live`, `role`)
- **Minimal DOM**: Keep DOM structure clean and avoid excessive nesting
- **Heading Hierarchy**: Use h1-h6 hierarchy correctly

### CSS / Tailwind Guidelines

- **Utility-first**: Prefer Tailwind utility classes
- **Custom Styles**: Write complex or repeated styles in `css/styles.css`
- **CSS Variables**: Use `:root` to define colors and theme values
- **Mobile-first**: Use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`, `xl:`)
- **Transitions**: Add `transition-*` classes to interactive elements
- **OBS Compatibility**: Widget page must ensure `background: transparent`

### Error Handling Patterns

```javascript
// API call with error handling
try {
    const data = await fetchWeather(lat, lon);
    displayWeather(data);
} catch (error) {
    console.error('Failed to fetch weather:', error);
    showError('無法取得天氣資料');
}

// Input validation
if (!name || name.trim().length === 0) {
    alert('請輸入顯示名稱');
    return;
}

// Loading state management
showLoading();
try {
    const result = await apiCall();
    showContent(result);
} catch (error) {
    showError(error.message);
}
```

## Development Workflow

### Local Testing

No dependencies need to be installed. Simply start a local server:

```bash
# Method 1: npx serve (recommended)
npx serve .

# Method 2: Python http.server
python -m http.server 8000

# Method 3: PHP built-in server
php -S localhost:8000
```

Then open `http://localhost:8000/` to see the setup page.

### Testing Checklist

During development, verify the following:

#### Setup Page

- [ ] Location search works correctly, debounce is effective
- [ ] Search results correctly display place name, country, coordinates
- [ ] Selecting search result correctly fills the form
- [ ] Added locations appear in the list
- [ ] Delete location functionality works
- [ ] URL updates correctly when adjusting interval/temperature unit
- [ ] Preview iframe correctly displays widget
- [ ] Copy URL functionality works, shows success feedback

#### Widget Page

- [ ] Shows error message when no parameters provided
- [ ] Correctly parses URL parameters
- [ ] Loading state displays correctly
- [ ] Weather data displays correctly (icon, temperature, location name, description)
- [ ] Cycling functionality works, interval timing is correct
- [ ] Background is completely transparent in OBS
- [ ] Error state displays correctly
- [ ] Supports CJK characters in location names

#### API Integration

- [ ] Geocoding API calls succeed
- [ ] Weather API calls succeed
- [ ] Parallel fetching of multiple locations works
- [ ] Celsius/Fahrenheit conversion is correct
- [ ] API errors are handled appropriately

### Performance Considerations

- Widget page must remain lightweight as it runs continuously in OBS
- Avoid excessive DOM manipulation
- Use `Promise.all()` for parallel API calls
- WebP icons are optimized for smaller file size and better performance
- Use `loading="lazy"` for images
- CSS animations should use `transform` and `opacity` for best performance

## Deployment

The project can be deployed directly to any static hosting service:

- **Cloudflare Pages**: Includes `_headers` configuration file
- **GitHub Pages**: Supported
- **Netlify**: Supported
- **Vercel**: Supported

No build commands or environment variables need to be configured.

## License & Attribution

- **License**: AGPL-3.0 (see LICENSE file)
- **Copyright**: Copyright (C) 2026 Jim Chen
- **Weather Data**: [Open-Meteo](https://open-meteo.com/)
- **Geocoding**: [OpenStreetMap](https://www.openstreetmap.org/copyright) (Nominatim)
- **Font**: UoqMunThenKhung (Google Fonts)

## Important Notes for AI Agents

1. **Language Usage**:
   - All code comments and function documentation must be in **English**
   - README.md and user interface text should be in **正體中文 Traditional Chinese zh-Hant**
   - Communicate with users in **Traditional Chinese**

2. **API Limitations**:
   - Open-Meteo Weather API limit: 10,000 calls/day
   - Nominatim Geocoding: max 1 request/second, no auto-complete allowed
   - No API key required for either service
   - Must provide User-Agent header for Nominatim
   - Implement appropriate error handling for API failures

3. **OBS Compatibility**:
   - Widget page must use `background: transparent`
   - Avoid complex animations that affect performance
   - Test in OBS Browser Source to ensure proper display

4. **CJK Character Support**:
   - Location names may contain Chinese, Japanese, Korean characters
   - Ensure font loads correctly (`UoqMunThenKhung` supports Chinese)
   - URL encoding must handle non-ASCII characters properly

5. **No Build Process**:
   - Do not use npm, webpack, vite or other build tools
   - All code runs directly in browser
   - Tailwind CSS loaded via CDN
   - Do not use TypeScript or JSX

6. **Icons**:
   - Weather icons use WebP format for better compression and performance
   - Icons should be clean and clear, recognizable even at small sizes
   - Use `loading="lazy"` attribute
   - Provide appropriate `alt` text for accessibility

7. **Temperature Display**:
   - Widget displays tomorrow's max and min temperatures
   - Main display shows max temperature (`temperature_2m_max[1]`)
   - Subtitle shows temperature range

8. **State Management**:
   - Do not use React/Vue framework state management
   - Use simple JavaScript objects to manage state
   - UI updates through direct DOM manipulation

If you have any questions or need to add features, review existing implementations first to ensure consistency.
