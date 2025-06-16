// js/monthly-view.js

// Constants for IndexedDB - duplicated from main.js for self-containment
const DB_NAME = 'PrayerTimesDB';
const DB_VERSION = 4;
const STORE_NAME = 'prayerTimesStore'; // Stores data for each location + year
const SETTINGS_STORE_NAME = 'appSettingsStore'; // Re-using for settings like use24HourFormat

// JAKIM Prayer Zones (full list, duplicated for self-containment)
const JAKIM_ZONES = [
    { code: 'JHR01', name: 'Johor: Pulau Aur dan Pulau Pemanggil' },
    { code: 'JHR02', name: 'Johor: Johor Bharu, Kota Tinggi, Mersing' },
    { code: 'JHR03', name: 'Johor: Kluang, Pontian' },
    { code: 'JHR04', name: 'Johor: Batu Pahat, Muar, Segamat, Gemas Johor' },
    { code: 'KDH01', name: 'Kedah: Kota Setar, Kubang Pasu, Pokok Sena (Daerah Kecil)' },
    { code: 'KDH02', name: 'Kedah: Kuala Muda, Yan, Pendang' },
    { code: 'KDH03', name: 'Kedah: Padang Terap, Sik' },
    { code: 'KDH04', name: 'Kedah: Baling' },
    { code: 'KDH05', name: 'Kedah: Bandar Baharu, Kulim' },
    { code: 'KDH06', name: 'Kedah: Langkawi' },
    { code: 'KDH07', name: 'Kedah: Gunung Jerai' },
    { code: 'KTN01', name: 'Kelantan: Bachok, Kota Bharu, Machang, Pasir Mas, Pasir Puteh, Tanah Merah, Tumpat, Kuala Krai, Mukim Chiku' },
    { code: 'KTN03', name: 'Kelantan: Gua Musang (Daerah Galas Dan Bertam), Jeli' },
    { code: 'MLK01', name: 'Melaka: SELURUH NEGERI MELAKA' },
    { code: 'NGS01', name: 'Negeri Sembilan: Tampin, Jempol' },
    { code: 'NGS02', name: 'Negeri Sembilan: Jelebu, Kuala Pilah, Port Dickson, Rembau, Seremban' },
    { code: 'PHG01', name: 'Pahang: Pulau Tioman' },
    { code: 'PHG02', name: 'Pahang: Kuantan, Pekan, Rompin, Muadzam Shah' },
    { code: 'PHG03', name: 'Pahang: Jerantut, Temerloh, Maran, Bera, Chenor, Jengka' },
    { code: 'PHG04', name: 'Pahang: Bentong, Lipis, Raub' },
    { code: 'PHG05', name: 'Pahang: Genting Sempah, Janda Baik, Bukit Tinggi' },
    { code: 'PHG06', name: 'Pahang: Cameron Highlands, Genting Higlands, Bukit Fraser' },
    { code: 'PLS01', name: 'Perlis: Kangar, Padang Besar, Arau' },
    { code: 'PNG01', name: 'Pulau Pinang: Seluruh Negeri Pulau Pinang' },
    { code: 'PRK01', name: 'Perak: Tapah, Slim River, Tanjung Malim' },
    { code: 'PRK02', name: 'Perak: Kuala Kangsar, Sg. Siput (Daerah Kecil), Ipoh, Batu Gajah, Kampar' },
    { code: 'PRK03', name: 'Perak: Lenggong, Pengkalan Hulu, Grik' },
    { code: 'PRK04', name: 'Perak: Temengor, Belum' },
    { code: 'PRK05', name: 'Perak: Kg Gajah, Teluk Intan, Bagan Datuk, Seri Iskandar, Beruas, Parit, Lumut, Sitiawan, Pulau Pangkor' },
    { code: 'PRK06', name: 'Perak: Selama, Taiping, Bagan Serai, Parit Buntar' },
    { code: 'PRK07', name: 'Perak: Bukit Larut' },
    { code: 'SBH01', name: 'Sabah: Bahagian Sandakan (Timur), Bukit Garam, Semawang, Temanggong, Tambisan, Bandar Sandakan' },
    { code: 'SBH02', name: 'Sabah: Beluran, Telupid, Pinangah, Terusan, Kuamut, Bahagian Sandakan (Barat)' },
    { code: 'SBH03', name: 'Sabah: Lahad Datu, Silabukan, Kunak, Sahabat, Semporna, Tungku, Bahagian Tawau (Timur)' },
    { code: 'SBH04', name: 'Sabah: Bandar Tawau, Balong, Merotai, Kalabakan, Bahagian Tawau (L/B)' },
    { code: 'SBH05', name: 'Sabah: Kudat, Kota Marudu, Pitas, Pulau Banggi, Bahagian Kudat' },
    { code: 'SBH06', name: 'Sabah: Gunung Kinabalu' },
    { code: 'SBH07', name: 'Sabah: Kota Kinabalu, Ranau, Kota Belud, Tuaran, Penampang, Papar, Putatan, Bahagian Pantai Barat' },
    { code: 'SBH08', name: 'Sabah: Pensiangan, Keningau, Tambunan, Nabawan, Bahagian Pendalaman (Atas)' },
    { code: 'SBH09', name: 'Sabah: Beaufort, Kuala Penyu, Sipitang, Tenom, Long Pa Sia, Membakut, Weston, Bahagian Pendalaman (Bawah)' },
    { code: 'SGR01', name: 'Selangor: Gombak, Petaling, Sepang, Hulu Langat, Hulu Selangor, Rawang, S.Alam' },
    { code: 'SGR02', name: 'Selangor: Kuala Selangor, Sabak Bernam' },
    { code: 'SGR03', name: 'Selangor: Klang, Kuala Langat' },
    { code: 'SWK01', name: 'Sarawak: Limbang, Lawas, Sundar, Trusan' },
    { code: 'SWK02', name: 'Sarawak: Miri, Niah, Bekenu, Sibuti, Marudi' },
    { code: 'SWK03', name: 'Sarawak: Pandan, Belaga, Suai, Tatau, Sebauh, Bintulu' },
    { code: 'SWK04', name: 'Sarawak: Sibu, Mukah, Dalat, Song, Igan, Oya, Balingian, Kanowit, Kapit' },
    { code: 'SWK05', name: 'Sarawak: Sarikei, Matu, Julau, Rajang, Daro, Bintangor, Belawai' },
    { code: 'SWK06', name: 'Sarawak: Lubok Antu, Sri Aman, Roban, Debak, Kabong, Lingga, Engkelili, Betong, Spaoh, Pusa, Saratok' },
    { code: 'SWK07', name: 'Sarawak: Serian, Simunjan, Samarahan, Sebuyau, Meludam' },
    { code: 'SWK08', name: 'Sarawak: Kuching, Bau, Lundu, Sematan' },
    { code: 'SWK09', name: 'Sarawak: Zon Khas (Kampung Patarikan)' },
    { code: 'TRG01', name: 'Terengganu: Kuala Terengganu, Marang, Kuala Nerus' },
    { code: 'TRG02', name: 'Terengganu: Besut, Setiu' },
    { code: 'TRG03', name: 'Terengganu: Hulu Terengganu' },
    { code: 'TRG04', name: 'Terengganu: Dungun, Kemaman' },
    { code: 'WLY01', name: 'Wilayah Persekutuan: Kuala Lumpur, Putrajaya' },
    { code: 'WLY02', name: 'Wilayah Persekutuan: Labuan' }
];

const API_MONTH_MAP = {
    'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
    'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
};

const PRAYER_NAMES_MAP = {
    'imsak': 'Imsak', 'fajr': 'Fajr', 'syuruk': 'Syuruk', 'dhuha': 'Dhuha',
    'dhuhr': 'Dhuhr', 'asr': 'Asr', 'maghrib': 'Maghrib', 'isha': 'Isha'
};

// DOM Elements
const body = document.body; // Reference to the body element for theme
const zoneSelect = document.getElementById('zoneSelect');
const prevMonthBtn = document.getElementById('prevMonthBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');
const currentMonthYearDisplay = document.getElementById('currentMonthYear');
const monthlyPrayerTimesTableBody = document.getElementById('monthlyPrayerTimesTableBody');
const monthlyPrayerTimesTable = document.querySelector('.table'); // Get the table element

let db; // IndexedDB instance
let currentDisplayDate = new Date(); // Tracks the month being displayed
let use24HourFormat = true; // Default, will be loaded from settings

/**
 * Opens and initializes the IndexedDB database (replicated from main.js).
 * @returns {Promise<IDBDatabase>} A promise that resolves with the DB instance.
 */
function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            db = event.target.result;
            // Note: This monthly-view.js won't create stores if they don't exist
            // It relies on main.js having created them during the app's first load.
            console.warn("monthly-view.js: Database upgrade detected. Ensure main.js handles full schema creation.");
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            console.log('monthly-view.js: IndexedDB opened successfully.');
            resolve(db);
        };

        request.onerror = (event) => {
            console.error('monthly-view.js: IndexedDB error:', event.target.errorCode);
            alert('Failed to open local database for monthly view.'); // Using alert for simplicity here
            reject(event.target.error);
        };
    });
}

/**
 * Loads a single setting from IndexedDB (replicated from main.js).
 * @param {string} name - The name of the setting.
 * @returns {Promise<*|undefined>} The value of the setting or undefined if not found.
 */
async function loadSetting(name) {
    try {
        const transaction = db.transaction([SETTINGS_STORE_NAME], 'readonly');
        const store = transaction.objectStore(SETTINGS_STORE_NAME);
        const data = await new Promise((resolve, reject) => {
            const request = store.get(name);
            request.onsuccess = () => resolve(request.result ? request.result.value : undefined);
            request.onerror = () => reject(request.error);
        });
        return data;
    } catch (error) {
        console.error(`monthly-view.js: Error loading setting '${name}' from IndexedDB:`, error);
        return undefined;
    }
}

/**
 * Retrieves prayer times data for a specific location and year from IndexedDB (replicated from main.js).
 * @param {string} locationCode - The JAKIM zone code.
 * @param {number} year - The year to retrieve.
 * @returns {Promise<Array<Object>|null>} A promise that resolves with the prayer times data or null if not found.
 */
async function getPrayerTimesForYear(locationCode, year) {
    try {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const id = `${locationCode}_${year}`;

        const data = await new Promise((resolve, reject) => {
            const request = store.get(id);
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });

        return data ? data.data : null;
    } catch (error) {
        console.error('monthly-view.js: Error retrieving prayer times from IndexedDB:', error);
        return null;
    }
}

/**
 * Retrieves all stored prayer time data IDs from IndexedDB.
 * @returns {Promise<Array<string>>} A promise that resolves with an array of all stored prayer time IDs.
 */
async function getAllStoredPrayerTimeIds() {
    try {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const ids = await new Promise((resolve, reject) => {
            const request = store.getAllKeys();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
        return ids;
    } catch (error) {
        console.error('monthly-view.js: Error retrieving all prayer time IDs from IndexedDB:', error);
        return [];
    }
}

/**
 * Helper function to format a time string (HH:MM:SS or HH:MM) to the user's preferred format.
 * Replicated from main.js.
 * @param {string} timeStr - The time string from API (e.g., "05:48:00").
 * @param {boolean} includeSeconds - Whether to include seconds (only for current time).
 * @returns {string} Formatted time string (e.g., "05:48" or "05:48:00 AM/PM").
 */
function formatTime(timeStr, includeSeconds = false) {
    if (!timeStr || timeStr.trim() === '--:--') {
        return includeSeconds ? '--:--:--' : '--:--';
    }
    const parts = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(parts[0], parts[1], parts[2] || 0, 0); // Use 0 for seconds if not present

    const options = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: !use24HourFormat // Set hour12 based on user preference
    };
    if (includeSeconds) {
        options.second = '2-digit';
    }

    if (use24HourFormat) {
        let h = String(date.getHours()).padStart(2, '0');
        let m = String(date.getMinutes()).padStart(2, '0');
        // s is not used in the formatTime logic unless includeSeconds is true
        // For monthly view, we don't need seconds, so 's' variable won't be used
        return `${h}:${m}`;
    }
    
    return date.toLocaleTimeString([], options);
}

/**
 * Sets the theme (dark or light mode) for the monthly view page.
 * @param {string} mode - 'dark' or 'light'.
 */
function setThemeOnMonthlyPage(mode) {
    if (mode === 'dark') {
        body.classList.add('dark-mode');
        if (monthlyPrayerTimesTable) {
            monthlyPrayerTimesTable.classList.add('table-dark');
        }
    } else {
        body.classList.remove('dark-mode');
        if (monthlyPrayerTimesTable) {
            monthlyPrayerTimesTable.classList.remove('table-dark');
        }
    }
}


/**
 * Populates the zone select dropdown with only synced JAKIM zones.
 * Adds a placeholder option to prompt syncing new zones.
 */
async function populateZoneSelect() {
    if (!zoneSelect) return;

    zoneSelect.innerHTML = ''; // Clear existing options

    const currentYear = new Date().getFullYear();
    const storedIds = await getAllStoredPrayerTimeIds();
    const syncedZoneCodes = new Set();

    storedIds.forEach(id => {
        const [zoneCode, year] = id.split('_');
        if (parseInt(year, 10) === currentYear) { // Only show zones with data for current year
            syncedZoneCodes.add(zoneCode);
        }
    });

    const availableZones = JAKIM_ZONES.filter(zone => syncedZoneCodes.has(zone.code));

    if (availableZones.length > 0) {
        // Add a default introductory option, or select the first available if no last selected
        const defaultOption = document.createElement('option');
        defaultOption.value = '';
        defaultOption.textContent = '--- Select a Synced Zone ---';
        defaultOption.disabled = true;
        // Do not set selected=true here, let logic below determine initial selection
        zoneSelect.appendChild(defaultOption);

        availableZones.forEach(zone => {
            const option = document.createElement('option');
            option.value = zone.code;
            option.textContent = zone.name;
            zoneSelect.appendChild(option);
        });
    }

    // Add option to sync new zones
    const syncNewZoneOption = document.createElement('option');
    syncNewZoneOption.value = 'sync_new_zone';
    syncNewZoneOption.textContent = '➡️ Sync New Zone in Main App';
    zoneSelect.appendChild(syncNewZoneOption);

    // Try to load last selected location from main app settings
    const savedLocation = await loadSetting('lastSelectedLocation');
    if (savedLocation && syncedZoneCodes.has(savedLocation)) {
        zoneSelect.value = savedLocation;
    } else if (availableZones.length > 0) {
        zoneSelect.value = availableZones[0].code; // Select the first available synced zone
    } else {
        zoneSelect.value = 'sync_new_zone'; // Default to sync prompt if no zones synced
        // If there are no synced zones, explicitly select the 'sync_new_zone' option
        syncNewZoneOption.selected = true;
    }
}


/**
 * Displays prayer times for the current month and selected zone.
 */
async function displayMonthlyPrayerTimes() {
    monthlyPrayerTimesTableBody.innerHTML = '<tr><td colspan="10" class="text-center text-muted py-4">Loading monthly prayer times...</td></tr>';
    
    const selectedZoneCode = zoneSelect.value;

    if (!selectedZoneCode || selectedZoneCode === 'sync_new_zone') {
        monthlyPrayerTimesTableBody.innerHTML = `<tr><td colspan="10" class="text-center text-muted py-4">Please select a synced zone or synchronize new zones from the main app.</td></tr>`;
        currentMonthYearDisplay.textContent = 'No Zone Selected';
        return;
    }

    currentMonthYearDisplay.textContent = currentDisplayDate.toLocaleString('en-US', { month: 'long', year: 'numeric' });

    const year = currentDisplayDate.getFullYear();
    const month = currentDisplayDate.getMonth(); // 0-indexed month

    const allYearData = await getPrayerTimesForYear(selectedZoneCode, year);

    if (!allYearData || allYearData.length === 0) {
        monthlyPrayerTimesTableBody.innerHTML = `<tr><td colspan="10" class="text-center text-muted py-4">No prayer data available for ${JAKIM_ZONES.find(z => z.code === selectedZoneCode)?.name || selectedZoneCode} for ${year}. Please sync in the main app.</td></tr>`;
        return;
    }

    const today = new Date();
    // Format today's date to match API's 'DD-Mon-YYYY' format for comparison
    const todayDay = String(today.getDate()).padStart(2, '0');
    const todayMonthAbbr = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][today.getMonth()];
    const todayYear = today.getFullYear();
    const todayFormattedForHighlight = `${todayDay}-${todayMonthAbbr}-${todayYear}`;

    let monthData = [];
    // Convert 0-indexed month to 1-indexed for comparison with API's month number
    const targetMonthNum = month + 1; 

    for (const dayData of allYearData) {
        const parts = dayData.date.split('-'); // e.g., ["01", "Jan", "2025"]
        const apiMonthNum = parseInt(API_MONTH_MAP[parts[1]], 10); // Get numeric month from map

        if (apiMonthNum === targetMonthNum && parseInt(parts[2], 10) === year) {
            monthData.push(dayData);
        }
    }

    // Sort monthData by day to ensure correct order
    monthData.sort((a, b) => {
        const dayA = parseInt(a.date.split('-')[0], 10);
        const dayB = parseInt(b.date.split('-')[0], 10);
        return dayA - dayB;
    });

    monthlyPrayerTimesTableBody.innerHTML = ''; // Clear loading message

    if (monthData.length === 0) {
        monthlyPrayerTimesTableBody.innerHTML = `<tr><td colspan="10" class="text-center text-muted py-4">No prayer data for ${currentDisplayDate.toLocaleString('en-US', { month: 'long', year: 'numeric' })}. This might mean the data is not yet available from the API or not synced.</td></tr>`;
        return;
    }

    monthData.forEach(dayData => {
        const row = document.createElement('tr');
        
        // Construct date string from dayData for comparison
        const apiDateDay = dayData.date.split('-')[0];
        const apiDateMonthStr = dayData.date.split('-')[1];
        const apiDateYear = dayData.date.split('-')[2];
        const apiDateForHighlight = `${apiDateDay}-${apiDateMonthStr}-${apiDateYear}`;

        if (apiDateForHighlight === todayFormattedForHighlight) {
            row.classList.add('highlight-today');
        }

        // Create a Date object from the API date string to get the weekday name
        const dateForWeekday = new Date(`${apiDateMonthStr} ${apiDateDay}, ${apiDateYear}`);
        const weekday = dateForWeekday.toLocaleString('en-US', { weekday: 'short' });

        row.innerHTML = `
            <td>${weekday}</td>
            <td>${dayData.date.split('-')[0]}</td>
            <td>${formatTime(dayData.imsak)}</td>
            <td>${formatTime(dayData.fajr)}</td>
            <td>${formatTime(dayData.syuruk)}</td>
            <td>${formatTime(dayData.dhuha || '--:--')}</td>
            <td>${formatTime(dayData.dhuhr)}</td>
            <td>${formatTime(dayData.asr)}</td>
            <td>${formatTime(dayData.maghrib)}</td>
            <td>${formatTime(dayData.isha)}</td>
        `;
        monthlyPrayerTimesTableBody.appendChild(row);
    });
}

// Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
    // Open DB first to load settings
    await openDatabase();

    // Load theme setting FIRST and apply it
    const loadedTheme = await loadSetting('theme');
    if (loadedTheme !== undefined) {
        setThemeOnMonthlyPage(loadedTheme); // Apply the loaded theme
    } else {
        setThemeOnMonthlyPage('dark'); // Default to dark mode on first visit if no setting
    }

    // Load time format preference for this page
    const loadedTimeFormat = await loadSetting('use24HourFormat');
    if (loadedTimeFormat !== undefined) {
        use24HourFormat = loadedTimeFormat;
    }

    await populateZoneSelect();
    await displayMonthlyPrayerTimes();

    zoneSelect.addEventListener('change', (event) => {
        if (event.target.value === 'sync_new_zone') {
            alert('Please sync new zones from the main application page (Settings > Sync Now).');
            // Optionally, redirect: window.location.href = 'index.html';
            // After alert, attempt to re-select the previously selected *valid* zone
            populateZoneSelect(); // Re-populate to reset dropdown and select best option
        } else {
            displayMonthlyPrayerTimes();
        }
    });

    prevMonthBtn.addEventListener('click', () => {
        currentDisplayDate.setMonth(currentDisplayDate.getMonth() - 1);
        displayMonthlyPrayerTimes();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDisplayDate.setMonth(currentDisplayDate.getMonth() + 1);
        displayMonthlyPrayerTimes();
    });
});
