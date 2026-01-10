/**
 * Open-Meteo API Integration Module
 * 
 * This module provides a wrapper for interacting with Open-Meteo APIs:
 * - Weather Forecast API: Fetch daily weather data
 * - Geocoding API: Search for locations by name
 * 
 * All functions use modern ES6+ syntax with async/await for API calls.
 */

/**
 * Search for locations by name using Open-Meteo Geocoding API
 * @param {string} query - Search query (place name or postal code)
 * @param {number} count - Number of results to return (default: 10, max: 100)
 * @param {string} language - Language code for results (default: 'en')
 * @returns {Promise<Array>} Array of location objects with id, name, latitude, longitude, country, admin1
 * @throws {Error} If API request fails
 */
async function searchLocation(query, count = 10, language = 'en') {
    // Input validation: require at least 2 characters
    if (!query || query.trim().length < 2) {
        return [];
    }

    try {
        const params = new URLSearchParams({
            name: query.trim(),
            count: count,
            language: language,
            format: 'json'
        });

        const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`);

        if (!response.ok) {
            throw new Error(`Geocoding API error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        
        // Handle case where no results are found
        return data.results || [];
    } catch (error) {
        console.error('Failed to search location:', error);
        throw new Error(`Location search failed: ${error.message}`);
    }
}

/**
 * Fetch weather forecast for a specific location using Open-Meteo Weather API
 * @param {number} lat - Latitude coordinate
 * @param {number} lon - Longitude coordinate
 * @param {string} unit - Temperature unit: 'celsius' or 'fahrenheit' (default: 'celsius')
 * @returns {Promise<Object>} Weather data object with daily forecasts
 * @throws {Error} If API request fails
 */
async function fetchWeather(lat, lon, unit = 'celsius') {
    try {
        const params = new URLSearchParams({
            latitude: lat,
            longitude: lon,
            daily: 'weather_code,temperature_2m_max,temperature_2m_min',
            timezone: 'auto',
            forecast_days: '2'
        });

        // Add temperature unit parameter for fahrenheit
        if (unit === 'fahrenheit') {
            params.append('temperature_unit', 'fahrenheit');
        }

        const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`);

        if (!response.ok) {
            throw new Error(`Weather API error: ${response.status} ${response.statusText}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Failed to fetch weather:', error);
        throw new Error(`Weather fetch failed: ${error.message}`);
    }
}

/**
 * Fetch weather forecast for multiple locations in parallel
 * @param {Array} locations - Array of location objects with {name, lat, lon} properties
 * @param {string} unit - Temperature unit: 'celsius' or 'fahrenheit' (default: 'celsius')
 * @returns {Promise<Array>} Array of location objects enhanced with weather data
 * @throws {Error} If any API request fails
 */
async function fetchWeatherForLocations(locations, unit = 'celsius') {
    try {
        // Create an array of promises for parallel fetching
        const promises = locations.map(async (loc) => {
            const weather = await fetchWeather(loc.lat, loc.lon, unit);
            return {
                ...loc,
                weather: weather.daily
            };
        });

        // Wait for all requests to complete
        return await Promise.all(promises);
    } catch (error) {
        console.error('Failed to fetch weather for locations:', error);
        throw new Error(`Batch weather fetch failed: ${error.message}`);
    }
}

/**
 * Get weather icon filename based on WMO weather code
 * @param {number} code - WMO weather interpretation code
 * @returns {string} Icon filename
 */
function getWeatherIcon(code) {
    const iconMap = {
        0: 'clear.svg',
        1: 'partly-cloudy.svg',
        2: 'partly-cloudy.svg',
        3: 'partly-cloudy.svg',
        45: 'fog.svg',
        48: 'fog.svg',
        51: 'drizzle.svg',
        53: 'drizzle.svg',
        55: 'drizzle.svg',
        56: 'drizzle.svg',
        57: 'drizzle.svg',
        61: 'rain.svg',
        63: 'rain.svg',
        65: 'rain.svg',
        66: 'rain.svg',
        67: 'rain.svg',
        71: 'snow.svg',
        73: 'snow.svg',
        75: 'snow.svg',
        77: 'snow.svg',
        80: 'showers.svg',
        81: 'showers.svg',
        82: 'showers.svg',
        85: 'snow-showers.svg',
        86: 'snow-showers.svg',
        95: 'thunderstorm.svg',
        96: 'thunderstorm.svg',
        99: 'thunderstorm.svg'
    };
    
    return iconMap[code] || 'unknown.svg';
}

/**
 * Get full path to weather icon
 * @param {number} code - WMO weather interpretation code
 * @returns {string} Full icon path
 */
function getWeatherIconPath(code) {
    return `icons/weather/${getWeatherIcon(code)}`;
}

// Export functions for use in other modules
// Using ES6 module syntax or global scope depending on project setup
if (typeof module !== 'undefined' && module.exports) {
    // Node.js/CommonJS environment
    module.exports = {
        searchLocation,
        fetchWeather,
        fetchWeatherForLocations,
        getWeatherIcon,
        getWeatherIconPath
    };
} else {
    // Browser environment - expose to global scope
    window.WeatherAPI = {
        searchLocation,
        fetchWeather,
        fetchWeatherForLocations,
        getWeatherIcon,
        getWeatherIconPath
    };
}
