/**
 * Widget state management
 */
const state = {
    locations: [],
    weatherData: [],
    currentIndex: 0,
    interval: 5000,
    unit: 'celsius',
    timer: null,
    lastFetchTime: null  // Track last weather data fetch time
};

/**
 * Weather data refresh interval (12 hours in milliseconds)
 */
const WEATHER_REFRESH_INTERVAL = 12 * 60 * 60 * 1000; // 12 hours = 43200000 ms

/**
 * Parse URL parameters
 * @returns {Object} Parsed parameters
 */
function parseUrlParams() {
    const params = new URLSearchParams(window.location.search);
    
    let locations = [];
    try {
        const locationsParam = params.get('locations');
        if (locationsParam) {
            locations = JSON.parse(decodeURIComponent(locationsParam));
        }
    } catch (e) {
        console.error('Failed to parse locations:', e);
    }
    
    return {
        locations,
        interval: parseInt(params.get('interval')) || 5000,
        unit: params.get('unit') || 'celsius'
    };
}

/**
 * Show loading state
 */
function showLoading() {
    document.getElementById('loading').classList.remove('hidden');
    document.getElementById('error').classList.add('hidden');
    document.getElementById('weather-display').classList.add('hidden');
}

/**
 * Show error state
 * @param {string} message - Error message to display
 */
function showError(message) {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('error').classList.remove('hidden');
    document.getElementById('error-message').textContent = message;
    document.getElementById('weather-display').classList.add('hidden');
}

/**
 * Show weather display
 */
function showWeather() {
    document.getElementById('loading').classList.add('hidden');
    document.getElementById('error').classList.add('hidden');
    document.getElementById('weather-display').classList.remove('hidden');
}

/**
 * Update weather display for current location
 */
function updateDisplay() {
    const data = state.weatherData[state.currentIndex];
    if (!data) return;
    
    // Get tomorrow's data (index 1)
    const tomorrow = {
        weatherCode: data.weather.weather_code[1],
        tempMax: data.weather.temperature_2m_max[1],
        tempMin: data.weather.temperature_2m_min[1]
    };

    const unitSymbol = state.unit === 'fahrenheit' ? '°F' : '°C';
    const description = getWeatherDescription(tomorrow.weatherCode);

    // Update DOM elements
    document.getElementById('place-name').textContent = data.name;
    document.getElementById('description').textContent = description;
    document.getElementById('temp-main').textContent = `${Math.round(tomorrow.tempMax)}${unitSymbol}`;
    document.getElementById('temp-max').textContent = `${Math.round(tomorrow.tempMax)}${unitSymbol}`;
    document.getElementById('temp-min').textContent = `${Math.round(tomorrow.tempMin)}${unitSymbol}`;
    
    // Update weather icon
    const iconPath = getWeatherIconPath(tomorrow.weatherCode);
    document.querySelector('#weather-icon img').src = iconPath;
    document.querySelector('#weather-icon img').alt = description;
}

/**
 * Check if weather data needs to be refreshed
 * @returns {boolean} True if data should be refreshed
 */
function shouldRefreshWeather() {
    // If never fetched before, don't refresh here (handled in init)
    if (!state.lastFetchTime) {
        return false;
    }
    
    const now = Date.now();
    const timeSinceLastFetch = now - state.lastFetchTime;
    
    return timeSinceLastFetch >= WEATHER_REFRESH_INTERVAL;
}

/**
 * Refresh weather data for all locations
 * @returns {Promise<boolean>} True if refresh succeeded
 */
async function refreshWeatherData() {
    try {
        console.log('Refreshing weather data...');
        
        // Fetch new weather data
        const newWeatherData = await fetchWeatherForLocations(state.locations, state.unit);
        
        // Update state
        state.weatherData = newWeatherData;
        state.lastFetchTime = Date.now();
        
        // Update display immediately
        updateDisplay();
        
        console.log('Weather data refreshed successfully');
        return true;
    } catch (error) {
        console.error('Failed to refresh weather data:', error);
        // Keep using old data if refresh fails
        return false;
    }
}

/**
 * Cycle to next location
 * Also checks if weather data needs refresh
 */
async function cycleLocation() {
    // Check if weather data needs refresh before cycling
    if (shouldRefreshWeather()) {
        await refreshWeatherData();
        // After refresh, reset to first location
        state.currentIndex = 0;
    } else {
        // Normal cycling
        state.currentIndex = (state.currentIndex + 1) % state.weatherData.length;
    }
    
    updateDisplay();
}

/**
 * Start cycling through locations
 */
function startCycling() {
    if (state.weatherData.length <= 1) return;
    
    state.timer = setInterval(cycleLocation, state.interval);
}

/**
 * Initialize widget
 */
async function initWidget() {
    showLoading();
    
    // Parse URL parameters
    const params = parseUrlParams();
    state.locations = params.locations;
    state.interval = params.interval;
    state.unit = params.unit;
    
    // Validate locations
    if (!state.locations || state.locations.length === 0) {
        showError('未設定任何地點');
        return;
    }
    
    try {
        // Fetch weather data for all locations
        state.weatherData = await fetchWeatherForLocations(state.locations, state.unit);
        state.lastFetchTime = Date.now();  // Record initial fetch time
        
        // Show weather display
        showWeather();
        updateDisplay();
        
        // Start cycling if multiple locations
        startCycling();
        
    } catch (error) {
        console.error('Failed to fetch weather:', error);
        showError('無法取得天氣資料');
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initWidget);
