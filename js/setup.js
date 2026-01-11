/**
 * localStorage key for persisting setup state
 */
const STORAGE_KEY = 'obs-weather-widget-setup';

/**
 * Setup page state management
 */
const setupState = {
    locations: [],
    interval: 5000,
    unit: 'celsius'
};

// DOM Elements
const elements = {
    searchInput: null,
    searchBtn: null,
    searchResults: null,
    resultsList: null,
    locationName: null,
    locationLat: null,
    locationLon: null,
    addLocationBtn: null,
    locationList: null,
    locationListEmpty: null,
    intervalInput: null,
    unitRadios: null,
    previewIframe: null,
    refreshPreviewBtn: null,
    widgetUrl: null,
    copyUrlBtn: null,
    copyFeedback: null
};

/**
 * Initialize DOM element references
 */
function initElements() {
    elements.searchInput = document.getElementById('search-input');
    elements.searchBtn = document.getElementById('search-btn');
    elements.searchResults = document.getElementById('search-results');
    elements.resultsList = document.getElementById('results-list');
    elements.locationName = document.getElementById('location-name');
    elements.locationLat = document.getElementById('location-lat');
    elements.locationLon = document.getElementById('location-lon');
    elements.addLocationBtn = document.getElementById('add-location-btn');
    elements.locationList = document.getElementById('location-list');
    elements.locationListEmpty = document.getElementById('location-list-empty');
    elements.intervalInput = document.getElementById('interval');
    elements.unitRadios = document.querySelectorAll('input[name="unit"]');
    elements.previewIframe = document.getElementById('preview-iframe');
    elements.refreshPreviewBtn = document.getElementById('refresh-preview-btn');
    elements.widgetUrl = document.getElementById('widget-url');
    elements.copyUrlBtn = document.getElementById('copy-url-btn');
    elements.copyFeedback = document.getElementById('copy-feedback');
}

/**
 * Debounce function for search input
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

/**
 * Handle location search
 */
async function handleSearch() {
    const query = elements.searchInput.value.trim();
    if (query.length < 2) {
        elements.searchResults.classList.add('hidden');
        return;
    }

    try {
        const results = await searchLocation(query, 5, 'zh');
        displaySearchResults(results);
    } catch (error) {
        console.error('Search failed:', error);
        elements.resultsList.innerHTML = '<li class="text-[#c0392b]">搜尋失敗，請稍後再試</li>';
        elements.searchResults.classList.remove('hidden');
    }
}

/**
 * Display search results
 */
function displaySearchResults(results) {
    if (!results || results.length === 0) {
        elements.resultsList.innerHTML = '<li class="text-[#8a7a68]">找不到符合的地點</li>';
        elements.searchResults.classList.remove('hidden');
        return;
    }

    elements.resultsList.innerHTML = results.map((loc, index) => `
        <li class="flex justify-between items-center bg-[#f1f8ff] border border-[#d2ecfa] rounded-2xl px-4 py-3 shadow-sm">
            <div class="text-[#4b3828]">
                <span>${loc.name}</span>
                <span class="text-[#7a6b5c] text-sm">, ${loc.country || ''}</span>
                <span class="text-[#9aa8b2] text-xs ml-2">(${loc.latitude.toFixed(4)}, ${loc.longitude.toFixed(4)})</span>
            </div>
            <button class="select-location-btn px-3 py-2 bg-[#8ed1ff] hover:bg-[#a7ddff] rounded-full text-sm text-[#2f3c4a] shadow-md transition-colors"
                    data-index="${index}">
                選擇
            </button>
        </li>
    `).join('');

    // Store results for selection
    elements.resultsList.dataset.results = JSON.stringify(results);
    elements.searchResults.classList.remove('hidden');
}

/**
 * Handle location selection from search results
 */
function handleLocationSelect(index) {
    const results = JSON.parse(elements.resultsList.dataset.results || '[]');
    const location = results[index];
    if (!location) return;

    // Fill in the add location form
    elements.locationName.value = location.name;
    elements.locationLat.value = location.latitude.toFixed(4);
    elements.locationLon.value = location.longitude.toFixed(4);

    // Hide search results
    elements.searchResults.classList.add('hidden');
    elements.searchInput.value = '';
}

/**
 * Add location to list
 */
function addLocation() {
    const name = elements.locationName.value.trim();
    const lat = parseFloat(elements.locationLat.value);
    const lon = parseFloat(elements.locationLon.value);

    // Validation
    if (!name) {
        alert('請輸入顯示名稱');
        return;
    }
    if (isNaN(lat) || lat < -90 || lat > 90) {
        alert('請輸入有效的緯度 (-90 到 90)');
        return;
    }
    if (isNaN(lon) || lon < -180 || lon > 180) {
        alert('請輸入有效的經度 (-180 到 180)');
        return;
    }

    // Add to state
    setupState.locations.push({ name, lat, lon });

    // Clear form
    elements.locationName.value = '';
    elements.locationLat.value = '';
    elements.locationLon.value = '';

    // Update UI
    updateLocationList();
    updateWidgetUrl();
    updatePreview();
    saveState();
}

/**
 * Remove location from list
 */
function removeLocation(index) {
    setupState.locations.splice(index, 1);
    updateLocationList();
    updateWidgetUrl();
    updatePreview();
    saveState();
}

/**
 * Update location list display
 */
function updateLocationList() {
    if (setupState.locations.length === 0) {
        elements.locationList.classList.add('hidden');
        elements.locationListEmpty.classList.remove('hidden');
        return;
    }

    elements.locationListEmpty.classList.add('hidden');
    elements.locationList.classList.remove('hidden');

    elements.locationList.innerHTML = setupState.locations.map((loc, index) => `
        <li class="flex justify-between items-center bg-[#fefaf1] border border-[#f6e2b8] rounded-2xl px-4 py-3 shadow-sm">
            <div class="text-[#4b3828]">
                <span>${index + 1}. ${loc.name}</span>
                <span class="text-[#9b8b78] text-sm ml-2">(${loc.lat}, ${loc.lon})</span>
            </div>
            <button class="remove-location-btn px-3 py-2 bg-[#ffb3b3] hover:bg-[#ffc7c7] rounded-full text-sm text-[#6b2b2b] shadow-md transition-colors"
                    data-index="${index}">
                刪除
            </button>
        </li>
    `).join('');
}

/**
 * Generate widget URL
 */
function generateWidgetUrl() {
    if (setupState.locations.length === 0) {
        return '';
    }

    const baseUrl = new URL('widget', window.location.href);
    const params = new URLSearchParams();
    
    params.set('locations', JSON.stringify(setupState.locations));
    params.set('interval', setupState.interval.toString());
    params.set('unit', setupState.unit);

    return `${baseUrl.origin}${baseUrl.pathname}?${params.toString()}`;
}

/**
 * Update widget URL display
 */
function updateWidgetUrl() {
    const url = generateWidgetUrl();
    elements.widgetUrl.value = url;
}

/**
 * Update preview iframe
 */
function updatePreview() {
    const url = generateWidgetUrl();
    if (url) {
        elements.previewIframe.src = url;
    } else {
        elements.previewIframe.src = 'about:blank';
    }
}

/**
 * Copy URL to clipboard
 */
async function copyUrl() {
    const url = elements.widgetUrl.value;
    if (!url) {
        alert('請先新增地點');
        return;
    }

    try {
        await navigator.clipboard.writeText(url);
        elements.copyFeedback.classList.remove('hidden');
        setTimeout(() => {
            elements.copyFeedback.classList.add('hidden');
        }, 2000);
    } catch (error) {
        console.error('Copy failed:', error);
        alert('複製失敗，請手動複製');
    }
}

/**
 * Handle settings change
 */
function handleSettingsChange() {
    setupState.interval = parseInt(elements.intervalInput.value) || 5000;
    setupState.unit = document.querySelector('input[name="unit"]:checked').value;
    updateWidgetUrl();
    updatePreview();
    saveState();
}

/**
 * Save current state to localStorage
 */
function saveState() {
    try {
        const stateToSave = {
            locations: setupState.locations,
            interval: setupState.interval,
            unit: setupState.unit
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
        console.error('Failed to save state to localStorage:', error);
    }
}

/**
 * Load state from localStorage
 * @returns {boolean} Whether state was successfully loaded
 */
function loadState() {
    try {
        const savedState = localStorage.getItem(STORAGE_KEY);
        if (!savedState) {
            return false;
        }

        const parsedState = JSON.parse(savedState);

        // Validate and restore locations
        if (Array.isArray(parsedState.locations)) {
            setupState.locations = parsedState.locations.filter(loc =>
                loc &&
                typeof loc.name === 'string' &&
                typeof loc.lat === 'number' &&
                typeof loc.lon === 'number' &&
                loc.lat >= -90 && loc.lat <= 90 &&
                loc.lon >= -180 && loc.lon <= 180
            );
        }

        // Validate and restore interval
        if (typeof parsedState.interval === 'number' && parsedState.interval >= 1000) {
            setupState.interval = parsedState.interval;
        }

        // Validate and restore unit
        if (parsedState.unit === 'celsius' || parsedState.unit === 'fahrenheit') {
            setupState.unit = parsedState.unit;
        }

        return true;
    } catch (error) {
        console.error('Failed to load state from localStorage:', error);
        return false;
    }
}

/**
 * Sync loaded state to UI elements
 */
function syncStateToUI() {
    // Sync interval input
    elements.intervalInput.value = setupState.interval;

    // Sync unit radio buttons
    elements.unitRadios.forEach(radio => {
        radio.checked = radio.value === setupState.unit;
    });
}

/**
 * Initialize event listeners
 */
function initEventListeners() {
    // Search
    elements.searchBtn.addEventListener('click', handleSearch);
    elements.searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    elements.searchInput.addEventListener('input', debounce(handleSearch, 300));

    // Search result selection (event delegation)
    elements.resultsList.addEventListener('click', (e) => {
        if (e.target.classList.contains('select-location-btn')) {
            const index = parseInt(e.target.dataset.index);
            handleLocationSelect(index);
        }
    });

    // Add location
    elements.addLocationBtn.addEventListener('click', addLocation);

    // Remove location (event delegation)
    elements.locationList.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-location-btn')) {
            const index = parseInt(e.target.dataset.index);
            removeLocation(index);
        }
    });

    // Settings change
    elements.intervalInput.addEventListener('change', handleSettingsChange);
    elements.unitRadios.forEach(radio => {
        radio.addEventListener('change', handleSettingsChange);
    });

    // Preview refresh
    elements.refreshPreviewBtn.addEventListener('click', updatePreview);

    // Copy URL
    elements.copyUrlBtn.addEventListener('click', copyUrl);
}

/**
 * Initialize setup page
 */
function initSetup() {
    initElements();
    loadState();
    syncStateToUI();
    initEventListeners();
    updateLocationList();
    updateWidgetUrl();
    updatePreview();
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', initSetup);
