# API Module Usage Examples

This document provides usage examples for the Open-Meteo API integration module (`js/api.js`).

## Loading the Module

### In Browser
```html
<script src="js/api.js"></script>
<script>
    // Functions are available via WeatherAPI object
    const locations = await WeatherAPI.searchLocation('Taipei');
</script>
```

### In Node.js
```javascript
const { searchLocation, fetchWeather, fetchWeatherForLocations } = require('./js/api.js');
```

## Function Examples

### 1. searchLocation(query, count, language)

Search for locations by name or postal code.

```javascript
// Basic search (returns up to 10 results by default)
const locations = await WeatherAPI.searchLocation('Taipei');
console.log(locations);
// [
//   {
//     id: 1668341,
//     name: "Taipei",
//     latitude: 25.04776,
//     longitude: 121.53185,
//     country: "Taiwan",
//     admin1: "Taiwan Province"
//   },
//   ...
// ]

// Limit results to 5
const limitedResults = await WeatherAPI.searchLocation('Tokyo', 5);

// Search in specific language
const resultsFr = await WeatherAPI.searchLocation('Paris', 10, 'fr');

// Input validation - returns empty array for short queries
const empty = await WeatherAPI.searchLocation('T'); // []
```

### 2. fetchWeather(lat, lon, unit)

Fetch weather forecast for a specific location.

```javascript
// Fetch weather in Celsius (default)
const weatherC = await WeatherAPI.fetchWeather(25.033, 121.565);
console.log(weatherC);
// {
//   latitude: 25.03,
//   longitude: 121.56,
//   daily: {
//     time: ["2026-01-11", "2026-01-12"],
//     weather_code: [3, 61],
//     temperature_2m_max: [18.5, 15.2],
//     temperature_2m_min: [12.3, 10.1]
//   }
// }

// Fetch weather in Fahrenheit
const weatherF = await WeatherAPI.fetchWeather(35.6895, 139.6917, 'fahrenheit');
console.log(weatherF.daily.temperature_2m_max); // [65.3, 59.4]
```

### 3. fetchWeatherForLocations(locations, unit)

Fetch weather for multiple locations in parallel.

```javascript
// Define multiple locations
const myLocations = [
    { name: '台北', lat: 25.033, lon: 121.565 },
    { name: '東京', lat: 35.6895, lon: 139.6917 },
    { name: 'Paris', lat: 48.8534, lon: 2.3488 }
];

// Fetch all weather data in parallel
const allWeather = await WeatherAPI.fetchWeatherForLocations(myLocations);
console.log(allWeather);
// [
//   {
//     name: '台北',
//     lat: 25.033,
//     lon: 121.565,
//     weather: {
//       time: ["2026-01-11", "2026-01-12"],
//       weather_code: [3, 61],
//       temperature_2m_max: [18.5, 15.2],
//       temperature_2m_min: [12.3, 10.1]
//     }
//   },
//   { /* 東京 weather data */ },
//   { /* Paris weather data */ }
// ]

// With Fahrenheit
const allWeatherF = await WeatherAPI.fetchWeatherForLocations(myLocations, 'fahrenheit');
```

## Error Handling

All functions throw errors that should be caught:

```javascript
try {
    const weather = await WeatherAPI.fetchWeather(25.033, 121.565);
    console.log('Success:', weather);
} catch (error) {
    console.error('Failed to fetch weather:', error.message);
    // Handle error appropriately
}
```

## Weather Codes

The `weather_code` field uses WMO codes:

| Code | Condition |
|------|-----------|
| 0 | Clear sky |
| 1-3 | Mainly clear, partly cloudy, overcast |
| 45, 48 | Fog |
| 51-57 | Drizzle |
| 61-67 | Rain |
| 71-77 | Snow |
| 80-82 | Rain showers |
| 85-86 | Snow showers |
| 95-99 | Thunderstorm |

## Data Structure

### Location Object (from searchLocation)
```javascript
{
    id: number,           // Unique location ID
    name: string,         // Location name
    latitude: number,     // Latitude coordinate
    longitude: number,    // Longitude coordinate
    country: string,      // Country name
    admin1: string        // Administrative division
}
```

### Weather Object (from fetchWeather)
```javascript
{
    latitude: number,
    longitude: number,
    daily: {
        time: string[],              // ISO 8601 dates
        weather_code: number[],      // WMO weather codes
        temperature_2m_max: number[], // Max temperatures
        temperature_2m_min: number[]  // Min temperatures
    }
}
```

## API Rate Limits

Open-Meteo API is free and allows:
- 10,000 API calls per day
- No API key required
- Attribution is appreciated

For more information, visit: https://open-meteo.com/
