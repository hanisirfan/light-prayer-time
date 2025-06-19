// js/main.js

// Constants for IndexedDB
const DB_NAME = 'PrayerTimesDB';
const DB_VERSION = 4; // Incremented DB version for new syncHistoryStore schema and settings
const STORE_NAME = 'prayerTimesStore'; // Stores data for each location + year
const SYNC_HISTORY_STORE_NAME = 'syncHistoryStore'; // Store for sync records
const SETTINGS_STORE_STORE_NAME = 'appSettingsStore'; // Store for general app settings

// JAKIM API Base URL
// Note: The API is undocumented and its behavior might change.
const API_BASE_URL = 'https://www.e-solat.gov.my/index.php?r=esolatApi/TakwimSolat';

// All JAKIM Prayer Zones provided by the user
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
    { code: 'KTN03', name: 'Kelantan: Gua Musang (Daerah Galas And Bertam), Jeli' },
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

// Global Maps and Constants
const PRAYER_NAMES_MAP = {
    'imsak': 'Imsak', 'fajr': 'Fajr', 'syuruk': 'Syuruk', 'dhuha': 'Dhuha',
    'dhuhr': 'Dhuhr', 'asr': 'Asr', 'maghrib': 'Maghrib', 'isha': 'Isha'
};

const API_MONTH_MAP = {
    'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
    'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
};

// The 5 obligatory prayers that trigger announcements
const OBLIGATORY_PRAYERS = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];


// DOM Elements (Centralized)
const body = document.body; // Correctly reference the body element
const locationSelect = document.getElementById('locationSelect');
const syncButton = document.getElementById('syncButton');
const prayerTimesTableBody = document.getElementById('prayerTimesTableBody');
const prayerTimesTable = document.getElementById('prayerTimesTable');
const iqamaTimesTableBody = document.getElementById('iqamaTimesTableBody');
const messageModal = new bootstrap.Modal(document.getElementById('messageModal'));
const modalMessageContent = document.getElementById('modalMessageContent');
const syncButtonSpinner = syncButton.querySelector('.spinner-border');
const syncHistoryModal = new bootstrap.Modal(document.getElementById('syncHistoryModal'));
const syncHistoryList = document.getElementById('syncHistoryList');
const syncHistorySortSelect = document.getElementById('syncHistorySortSelect'); // NEW

// Main Display Elements
const mainDisplayContent = document.getElementById('mainDisplayContent');
const currentTimeDisplay = document.getElementById('currentTime');
const currentMiladiDateDisplay = document.getElementById('currentMiladiDate');
const currentHijriDateDisplay = document.getElementById('currentHijriDate');
const selectedLocationDisplay = document.getElementById('selectedLocationDisplay');
const nextPrayerNameDisplay = document.getElementById('nextPrayerName');
const nextPrayerTimeDisplay = document.getElementById('nextPrayerTime');
const countdownToNextPrayerDisplay = document.getElementById('countdownToNextPrayer');
const darkModeSwitch = document.getElementById('darkModeSwitch');
const timeFormatSwitch = document.getElementById('timeFormatSwitch');

// Prayer Announcement Display Elements
const prayerAnnouncementDisplay = document.getElementById('prayerAnnouncementDisplay');
const announcementPrayerName = document.getElementById('announcementPrayerName');
const announcementPrayerTime = document.getElementById('announcementPrayerTime');
const announcementZoneName = document.getElementById('announcementZoneName');

// Iqama Countdown Display Elements
const iqamaCountdownDisplay = document.getElementById('iqamaCountdownDisplay');
const iqamaPrayerName = document.getElementById('iqamaPrayerName'); // Now h2, bold
const iqamaPrayerTime = document.getElementById('iqamaPrayerTime'); // Now h3, muted
const iqamaCountdown = document.getElementById('iqamaCountdown');
const iqamaZoneName = document.getElementById('iqamaZoneName'); // Now h4, secondary

// Post-Iqama Message Display Elements
const postIqamaMessageDisplay = document.getElementById('postIqamaMessageDisplay');

// Iqama input fields
const iqamaFajrInput = document.getElementById('iqamaFajr');
const iqamaDhuhrInput = document.getElementById('iqamaDhuhr');
const iqamaAsrInput = document.getElementById('iqamaAsr');
const iqamaMaghribInput = document.getElementById('iqamaMaghrib');
const iqamaIshaInput = document.getElementById('iqamaIsha');

// Auto Sync Elements
const autoSyncMasterSwitch = document.getElementById('autoSyncMasterSwitch');
const autoSyncScheduleDetails = document.getElementById('autoSyncScheduleDetails');
const autoSyncFrequencyRadios = document.querySelectorAll('input[name="autoSyncFrequency"]');
const autoSyncDaySelect = document.getElementById('autoSyncDay');
const autoSyncTimeInput = document.getElementById('autoSyncTime');

// Debug UI Elements (NEW)
const debugModeSwitch = document.getElementById('debugModeSwitch');
const debugButtonsContainer = document.getElementById('debugButtonsContainer');
const simPrayerAnnounceBtn = document.getElementById('simPrayerAnnounceBtn');
const simPrayerSelect = document.getElementById('simPrayerSelect');
const simIqamaCountdownBtn = document.getElementById('simIqamaCountdownBtn');
const simIqamaDurationInput = document.getElementById('simIqamaDuration');
const simPostIqamaBtn = document.getElementById('simPostIqamaBtn');
const simApiSyncSuccessBtn = document.getElementById('simApiSyncSuccessBtn'); // NEW
const simApiSyncFailBtn = document.getElementById('simApiSyncFailBtn');       // NEW
const returnToMainBtn = document.getElementById('returnToMainBtn');
const resetAnnouncedPrayersBtn = document.getElementById('resetAnnouncedPrayersBtn');

// New DOM elements for Mosque Name
const mosqueNameInput = document.getElementById('mosqueNameInput');
const mosqueNameDisplay = document.getElementById('mosqueNameDisplay');


let db; // IndexedDB instance
let todayPrayerDataGlobal = null; // Store today's prayer data globally for clock updates
let nextPrayerTimeout; // To clear previous countdown timeouts for main display
let iqamaCountdownInterval; // To clear iqama countdown interval

// Default Iqama offsets in minutes (All now 10 by default)
let iqamaOffsets = {
    fajr: 10,
    dhuhr: 10,
    asr: 10,
    maghrib: 10,
    isha: 10
};

// Default time format (false = 12-hour, true = 24-hour)
let use24HourFormat = true; // Default to 24-hour

// Auto sync settings
let autoSyncSettings = {
    enabled: false, // Master switch for auto sync (default to OFF)
    frequency: 'weekly', // 'weekly', 'bi-weekly', 'monthly'
    day: 0, // Day of week (0-6, Sunday-Saturday)
    time: '03:00', // HH:MM
    lastAutoSync: null, // Timestamp of last successful auto sync
    lastNextYearSyncAttempt: null // Timestamp of last attempt to sync next year's data
};

// Display State Management (NEW)
let currentDisplayState = 'main'; // 'main', 'announcement', 'iqamaCountdown', 'postIqamaMessage'
// To prevent repeated announcements on the same day
let announcedPrayersToday = {
    date: null, //YYYY-MM-DD
    fajr: false,
    dhuhr: false,
    asr: false,
    maghrib: false,
    isha: false
};
let activePrayerDetails = null; // Stores details for the prayer currently in announcement/iqama phase

// Debug Mode State (NEW, managed by UI switch and stored in IndexedDB)
let debugModeEnabled = false;

// Mosque Name setting
let mosqueName = '';


/**
 * Helper function to format a time string (HH:MM:SS or HH:MM) to the user's preferred format.
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

    // Explicitly format for 24-hour without AM/PM if use24HourFormat is true
    if (use24HourFormat) {
        let h = String(date.getHours()).padStart(2, '0');
        let m = String(date.getMinutes()).padStart(2, '0');
        let s = String(date.getSeconds()).padStart(2, '0');
        return includeSeconds ? `${h}:${m}:${s}` : `${h}:${m}`;
    }
    
    // Otherwise, use browser's locale-sensitive formatting for 12-hour
    return date.toLocaleTimeString([], options);
}

/**
 * Shows a Bootstrap modal with a given title and message.
 * @param {string} title - The title of the modal.
 * @param {string} message - The content message of the modal.
 */
function showMessage(title, message) {
    document.getElementById('messageModalLabel').textContent = title;
    modalMessageContent.innerHTML = message; // Use innerHTML to allow for basic formatting if needed
    messageModal.show();
}

/**
 * Toggles the loading spinner and button text.
 * @param {boolean} isLoading - True to show loading, false to hide.
 */
function showLoading(isLoading) {
    if (isLoading) {
        syncButtonSpinner.classList.remove('d-none');
        syncButton.disabled = true;
        syncButton.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Syncing...`;
    } else {
        syncButtonSpinner.classList.add('d-none');
        syncButton.disabled = false;
        syncButton.innerHTML = `Sync Now`;
    }
}

/**
 * Sets the theme (dark or light mode).
 * @param {string} mode - 'dark' or 'light'.
 */
function setTheme(mode) {
    if (mode === 'dark') {
        body.classList.add('dark-mode');
        // Add table-dark class only if it's not already there and we are in dark mode
        if (prayerTimesTable && !prayerTimesTable.classList.contains('table-dark')) {
            prayerTimesTable.classList.add('table-dark');
        }
        darkModeSwitch.checked = true;
    } else {
        body.classList.remove('dark-mode');
        if (prayerTimesTable) {
            prayerTimesTable.classList.remove('table-dark'); // Always remove in light mode
        }
        darkModeSwitch.checked = false;
    }
    // Note: Saving to IndexedDB is handled by the darkModeSwitch event listener
    // calling saveAllSettings, not directly by this function.
}

/**
 * Opens and initializes the IndexedDB database.
 * @returns {Promise<IDBDatabase>} A promise that resolves with the DB instance.
 */
function openDatabase() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            db = event.target.result;
            // Create object store for prayer times
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: 'id' });
                console.log('IndexedDB upgrade: prayerTimesStore created.');
            } else {
                console.log('IndexedDB: prayerTimesStore already exists.');
            }

            // Create or upgrade object store for sync history
            let syncHistoryObjectStore;
            if (db.objectStoreNames.contains(SYNC_HISTORY_STORE_NAME)) {
                // If it exists but we are upgrading to a version that changes its schema, delete and recreate
                // This will clear existing sync history, but ensures new fields are available.
                console.log(`IndexedDB upgrade: Deleting and recreating ${SYNC_HISTORY_STORE_NAME} for schema update.`);
                db.deleteObjectStore(SYNC_HISTORY_STORE_NAME);
                syncHistoryObjectStore = db.createObjectStore(SYNC_HISTORY_STORE_NAME, { keyPath: 'id', autoIncrement: true });
            } else {
                console.log('IndexedDB upgrade: syncHistoryStore created.');
                syncHistoryObjectStore = db.createObjectStore(SYNC_HISTORY_STORE_NAME, { keyPath: 'id', autoIncrement: true });
            }
            // Ensure any new indexes for sorting are added here if needed, but not required for current sorting
            
            // Create object store for app settings
            if (!db.objectStoreNames.contains(SETTINGS_STORE_STORE_NAME)) {
                db.createObjectStore(SETTINGS_STORE_STORE_NAME, { keyPath: 'name' });
                console.log('IndexedDB upgrade: appSettingsStore created.');

                // --- Migration Logic from localStorage to IndexedDB (One-time on upgrade) ---
                console.log("Attempting migration from localStorage to IndexedDB...");
                const transaction = event.target.transaction; // Use transaction from upgradeneeded event
                const settingsStore = transaction.objectStore(SETTINGS_STORE_STORE_NAME);

                // Migrate existing settings object from localStorage
                const oldSettingsString = localStorage.getItem('prayerTimeSettings');
                if (oldSettingsString) {
                    try {
                        const oldSettings = JSON.parse(oldSettingsString);
                        if (oldSettings.iqamaOffsets) {
                            settingsStore.put({ name: 'iqamaOffsets', value: oldSettings.iqamaOffsets });
                            console.log('Migrated iqamaOffsets from localStorage.');
                        }
                        if (oldSettings.use24HourFormat !== undefined) {
                            settingsStore.put({ name: 'use24HourFormat', value: oldSettings.use24HourFormat });
                            console.log('Migrated use24HourFormat from localStorage.');
                        }
                        if (oldSettings.autoSync) {
                            settingsStore.put({ name: 'autoSync', value: oldSettings.autoSync });
                            console.log('Migrated autoSync from localStorage.');
                        }
                        if (oldSettings.debugModeEnabled !== undefined) {
                            settingsStore.put({ name: 'debugModeEnabled', value: oldSettings.debugModeEnabled });
                            console.log('Migrated debugModeEnabled from localStorage.');
                        }
                        localStorage.removeItem('prayerTimeSettings'); // Clean up old localStorage entry
                        console.log('Removed old prayerTimeSettings from localStorage.');
                    } catch (e) {
                        console.error("Error migrating old settings from localStorage:", e);
                    }
                }
                
                // Migrate last selected location from localStorage
                const oldLastLocation = localStorage.getItem('lastSelectedLocation');
                if (oldLastLocation) {
                    settingsStore.put({ name: 'lastSelectedLocation', value: oldLastLocation });
                    console.log('Migrated lastSelectedLocation from localStorage.');
                    localStorage.removeItem('lastSelectedLocation'); // Clean up old localStorage entry
                    console.log('Removed old lastSelectedLocation from localStorage.');
                }

                // Migrate theme from localStorage
                const oldTheme = localStorage.getItem('theme');
                if (oldTheme) {
                    settingsStore.put({ name: 'theme', value: oldTheme });
                    console.log('Migrated theme from localStorage.');
                    localStorage.removeItem('theme'); // Clean up old localStorage entry
                    console.log('Removed old theme from localStorage.');
                }
                // ------------------------------------------------------------------------
            }
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            console.log('IndexedDB opened successfully.');
            resolve(db);
        };

        request.onerror = (event) => {
            console.error('IndexedDB error:', event.target.errorCode);
            showMessage('Error', 'Failed to open local database.');
            reject(event.target.error);
        };
    });
}

/**
 * Saves a single setting to IndexedDB.
 * @param {string} name - The name of the setting.
 * @param {*} value - The value of the setting.
 */
async function saveSetting(name, value) {
    try {
        const transaction = db.transaction([SETTINGS_STORE_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(SETTINGS_STORE_STORE_NAME);
        await new Promise((resolve, reject) => {
            const request = store.put({ name: name, value: value });
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
        // console.log(`Setting '${name}' saved to IndexedDB.`);
    } catch (error) {
        console.error(`Error saving setting '${name}' to IndexedDB:`, error);
    }
}

/**
 * Loads a single setting from IndexedDB.
 * @param {string} name - The name of the setting.
 * @returns {Promise<*|undefined>} The value of the setting or undefined if not found.
 */
async function loadSetting(name) {
    try {
        const transaction = db.transaction([SETTINGS_STORE_STORE_NAME], 'readonly');
        const store = transaction.objectStore(SETTINGS_STORE_STORE_NAME);
        const data = await new Promise((resolve, reject) => {
            const request = store.get(name);
            request.onsuccess = () => resolve(request.result ? request.result.value : undefined);
            request.onerror = () => reject(request.error);
        });
        return data;
    } catch (error) {
        console.error(`Error loading setting '${name}' from IndexedDB:`, error);
        return undefined;
    }
}


/**
 * Saves prayer times data for a specific location and year to IndexedDB.
 * @param {string} locationCode - The JAKIM zone code.
 * @param {number} year - The year for which the data is.
 * @param {Array<Object>} data - The array of prayer time objects.
 * @returns {Promise<void>}
 */
async function savePrayerTimes(locationCode, year, data) {
    try {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const id = `${locationCode}_${year}`; // Unique key for the entry

        await new Promise((resolve, reject) => {
            const request = store.put({ id: id, data: data, timestamp: Date.now() });
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
        console.log(`Prayer times for ${locationCode} (${year}) saved to IndexedDB.`);
    } catch (error) {
        console.error('Error saving prayer times to IndexedDB:', error);
        showMessage('Error', 'Failed to save prayer times to local database.');
    }
}

/**
 * Retrieves prayer times data for a specific location and year from IndexedDB.
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
        console.error('Error retrieving prayer times from IndexedDB:', error);
        // Do not show message for simple retrieval failure, just return null
        return null;
    }
}

/**
 * Retrieves all stored prayer time data.
 * @returns {Promise<Array<Object>>} An array of all stored prayer time objects (id, data, timestamp).
 */
async function getAllStoredPrayerTimesData() {
    try {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const data = await new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
        return data;
    } catch (error) {
        console.error('Error retrieving all prayer times from IndexedDB:', error);
        return [];
    }
}


/**
 * Saves a sync record to IndexedDB. (UPDATED)
 * @param {string} locationCode - The JAKIM zone code.
 * @param {string} syncMethod - 'MANUAL' or 'AUTO'.
 * @param {string} status - "Successful" or "Failed".
 * @param {string|object|null} apiResult - The API response or error message for failed syncs.
 * @returns {Promise<void>}
 */
async function addSyncRecord(locationCode, syncMethod, status, apiResult = null) {
    try {
        const transaction = db.transaction([SYNC_HISTORY_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(SYNC_HISTORY_STORE_NAME);
        const syncTime = new Date();
        const record = {
            zoneCode: locationCode,
            zoneName: JAKIM_ZONES.find(z => z.code === locationCode)?.name || locationCode,
            syncTime: syncTime.toISOString(), // Store as ISO string for easy sorting
            method: syncMethod,
            status: status, // "Successful" or "Failed"
            apiResult: apiResult // API response or error string for failed syncs
        };

        await new Promise((resolve, reject) => {
            const request = store.add(record);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
        console.log(`Sync record added: ${record.zoneName} (${record.method}) - Status: ${status}`);
        await cleanupSyncHistory(); // Keep only latest 15 records (updated limit)
    } catch (error) {
        console.error('Error adding sync record:', error);
    }
}

/**
 * Retrieves and displays sync history. (UPDATED)
 */
async function displaySyncHistory() {
    syncHistoryList.innerHTML = ''; // Clear existing list
    try {
        const transaction = db.transaction([SYNC_HISTORY_STORE_NAME], 'readonly');
        const store = transaction.objectStore(SYNC_HISTORY_STORE_NAME);
        const allRecords = await new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });

        if (allRecords.length === 0) {
            syncHistoryList.innerHTML = '<li class="list-group-item text-muted text-center">No sync history available.</li>';
            return;
        }

        // Apply sorting based on selected option
        const sortBy = syncHistorySortSelect.value;
        if (sortBy === 'latest') {
            allRecords.sort((a, b) => new Date(b.syncTime).getTime() - new Date(a.syncTime).getTime());
        } else if (sortBy === 'status') {
            allRecords.sort((a, b) => {
                // Sort "Failed" status first, then "Successful"
                if (a.status === 'Failed' && b.status === 'Successful') return -1;
                if (a.status === 'Successful' && b.status === 'Failed') return 1;
                // For same status, sort by latest time
                return new Date(b.syncTime).getTime() - new Date(b.syncTime).getTime();
            });
        }

        allRecords.forEach((record, index) => {
            const listItem = document.createElement('li');
            // Add Bootstrap classes for list items and dynamic text color
            listItem.className = `list-group-item d-flex flex-column ${record.status === 'Successful' ? 'text-success' : 'text-danger'}`;

            const syncDate = new Date(record.syncTime);
            const formattedDate = syncDate.toLocaleString();
            const collapseId = `syncDetailCollapse${index}`; // Unique ID for each collapsible element

            let detailHtml = '';
            if (record.status === 'Failed' && record.apiResult) {
                // Ensure apiResult is a string for pre tag
                const apiResultStr = typeof record.apiResult === 'object' ? JSON.stringify(record.apiResult, null, 2) : String(record.apiResult);
                detailHtml = `
                    <div class="d-flex align-items-center mt-2">
                        <button class="btn btn-sm collapse-toggle-btn" type="button" data-bs-toggle="collapse" data-bs-target="#${collapseId}" aria-expanded="false" aria-controls="${collapseId}">
                            Details <i class="bi bi-chevron-down"></i>
                        </button>
                    </div>
                    <div class="collapse sync-detail-content" id="${collapseId}">
                        <pre>${apiResultStr}</pre>
                    </div>
                `;
            }

            listItem.innerHTML = `
                <div>
                    <strong>Zone:</strong> ${record.zoneName}<br>
                    <strong>Last Sync:</strong> ${formattedDate}<br>
                    <strong>Method:</strong> ${record.method}<br>
                    <strong>Status:</strong> <span class="fw-bold">${record.status}</span>
                </div>
                ${detailHtml}
            `;
            syncHistoryList.appendChild(listItem);
        });
    } catch (error) {
        console.error('Error displaying sync history:', error);
        syncHistoryList.innerHTML = '<li class="list-group-item text-danger text-center">Error loading sync history.</li>';
    }
}

/**
 * Cleans up old sync history records, keeping only the latest 15. (UPDATED)
 */
async function cleanupSyncHistory() {
    try {
        const transaction = db.transaction([SYNC_HISTORY_STORE_NAME], 'readwrite');
        const store = transaction.objectStore(SYNC_HISTORY_STORE_NAME);

        const allRecords = await new Promise((resolve, reject) => {
            const request = store.getAll();
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });

        // Current limit is 15
        const historyLimit = 15;

        if (allRecords.length > historyLimit) {
            // Sort by syncTime in ascending order (oldest first)
            allRecords.sort((a, b) => new Date(a.syncTime).getTime() - new Date(b.syncTime).getTime());
            
            // Delete oldest records until only 'historyLimit' remain
            for (let i = 0; i < allRecords.length - historyLimit; i++) {
                // Delete by id (keyPath)
                await new Promise((resolve, reject) => {
                    const deleteRequest = store.delete(allRecords[i].id);
                    deleteRequest.onsuccess = () => resolve();
                    deleteRequest.onerror = () => reject(deleteRequest.error);
                });
            }
            console.log(`Cleaned up sync history, now keeping ${historyLimit} records.`);
        }
    } catch (error) {
        console.error('Error cleaning up sync history:', error);
    }
}


/**
 * Fetches prayer times for a given zone, year, and month from the JAKIM API.
 * This function handles cases where the API returns OK status but with empty data.
 * @param {string} zone - The JAKIM zone code (e.g., 'WLY01').
 * @param {number} year - The year (1-12).
 * @param {number} month - The month (1-12).
 * @returns {Promise<Array<Object>>} A promise that resolves with an array of daily prayer time objects.
 */
async function fetchPrayerTimesForMonth(zone, year, month) {
    const url = `${API_BASE_URL}&zone=${zone}&period=month&year=${year}&month=${month}`;
    try {
        console.log(`API URL: ${url}`); // Debugging API URL
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        console.log("Full API Response: ", data); // Log full response

        // Check if data.prayerTime exists and is an array, and if it has actual data
        if (data.status === 'OK!' && Array.isArray(data.prayerTime) && data.prayerTime.length > 0) {
            console.log(`Successfully fetched prayer data for ${zone} - ${year}/${month}`);
            return data.prayerTime;
        } else {
            console.warn(`No prayer data found for ${zone} - ${year}/${month}: API returned status '${data.status}' or empty prayerTime array.`);
            return []; // Return empty array if no valid data is found
        }
    } catch (error) {
        console.error(`Error fetching prayer times for ${zone} - ${year}/${month}:`, error);
        return [];
    }
}

/**
 * Fetches and stores all prayer times for the current year for a selected location.
 * @param {string} locationCode - The JAKIM zone code.
 * @param {string} syncMethod - 'MANUAL' or 'AUTO'.
 * @param {number|null} targetYear - The year to sync for. If null, uses current year.
 * @returns {Promise<boolean>} True if sync was successful, false otherwise.
 */
async function fetchAndStoreAllPrayerTimes(locationCode, syncMethod, targetYear = null) {
    showLoading(true);
    const yearToSync = targetYear || new Date().getFullYear();
    let allPrayerTimes = [];
    let fetchStatus = "Failed"; // Default status
    let apiResultForHistory = null;

    // Clear existing data for the selected location and year before syncing
    try {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const idToDelete = `${locationCode}_${yearToSync}`;
        await new Promise((resolve, reject) => {
            const request = store.delete(idToDelete);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
        console.log(`Cleared existing data for ${locationCode} (${yearToSync}) from IndexedDB.`);
    } catch (error) {
        console.error('Error clearing old data from IndexedDB:', error);
    }

    try {
        let successfulMonthsCount = 0;
        let failedMonths = [];

        for (let month = 1; month <= 12; month++) {
            const monthlyData = await fetchPrayerTimesForMonth(locationCode, yearToSync, month);
            if (monthlyData.length > 0) {
                allPrayerTimes = allPrayerTimes.concat(monthlyData);
                successfulMonthsCount++;
            } else {
                failedMonths.push(month);
            }
        }

        if (allPrayerTimes.length > 0) {
            // Sort by date to ensure correct order
            allPrayerTimes.sort((a, b) => {
                const parseDate = (dateStr) => {
                    const parts = dateStr.split('-'); // e.g., "01-Jan-2025"
                    const monthNum = API_MONTH_MAP[parts[1]]; // Use global map for month
                    return new Date(parts[2], parseInt(monthNum, 10) - 1, parts[0]); // Month is 0-indexed in JS Date
                };
                return parseDate(a.date) - parseDate(b.date);
            });

            await savePrayerTimes(locationCode, yearToSync, allPrayerTimes);
            
            fetchStatus = "Successful"; // At least some data was retrieved and saved
            if (failedMonths.length > 0) {
                 apiResultForHistory = `Warning: Data for month(s) ${failedMonths.join(', ')} could not be fetched or was empty.`;
            }

            let message = `Prayer times for ${JAKIM_ZONES.find(z => z.code === locationCode).name} for ${yearToSync} have been synchronized successfully.`;
            if (failedMonths.length > 0) {
                message += `<br> <span class="text-warning">Warning: Could not fetch data for month(s): ${failedMonths.join(', ')}. The API might not have data for these months yet.</span>`;
            }
            if (syncMethod !== 'AUTO_INITIAL') { // Don't show message for silent initial auto sync
                showMessage('Sync Complete', message);
            }
            return true; // Indicate success
        } else {
            fetchStatus = "Failed"; // No data at all
            apiResultForHistory = `Could not fetch any prayer times for ${JAKIM_ZONES.find(z => z.code === locationCode).name} for ${yearToSync}. The API might not have data available for the current year yet, or there was an issue with the fetch. Please try again later.`;
            if (syncMethod !== 'AUTO_INITIAL') { // Don't show message for silent initial auto sync
                showMessage('Sync Failed', apiResultForHistory);
            }
            return false; // Indicate failure
        }

    } catch (error) {
        fetchStatus = "Failed";
        apiResultForHistory = `An error occurred during synchronization: ${error.message}. Please check your internet connection and try again.`;
        console.error('Error during full year sync:', error);
        if (syncMethod !== 'AUTO_INITIAL') { // Don't show message for silent initial auto sync
            showMessage('Error', apiResultForHistory);
        }
        return false; // Indicate failure
    } finally {
        await addSyncRecord(locationCode, syncMethod, fetchStatus, apiResultForHistory); // Add record at the end
        showLoading(false);
    }
}

/**
 * Populates the location select dropdown with JAKIM zones and loads last selected.
 */
async function populateLocationSelect() {
    // Ensure locationSelect is available before manipulating
    if (!locationSelect) {
        console.error("Location select element not found!");
        return;
    }
    locationSelect.innerHTML = ''; // Clear existing options
    JAKIM_ZONES.forEach(zone => {
        const option = document.createElement('option');
        option.value = zone.code;
        option.textContent = zone.name;
        locationSelect.appendChild(option);
    });

    // Load last selected location from IndexedDB
    const savedLocation = await loadSetting('lastSelectedLocation');
    if (savedLocation && JAKIM_ZONES.some(zone => zone.code === savedLocation)) {
        locationSelect.value = savedLocation;
    } else {
        // Set 'WLY01' as default if no saved location or invalid saved location
        const defaultZone = 'WLY01';
        if (JAKIM_ZONES.some(zone => zone.code === defaultZone)) {
            locationSelect.value = defaultZone;
        } else {
            locationSelect.value = JAKIM_ZONES[0].code; // Fallback to the very first zone
        }
    }

    // Set initial selected location display
    selectedLocationDisplay.textContent = JAKIM_ZONES.find(z => z.code === locationSelect.value)?.name || 'Select Location...';
}

/**
 * Formats a Miladi date into "DD Mon.്യാപ Miladi" format.
 * @param {Date} date - The Miladi date object.
 * @returns {string} Formatted date string.
 */
function formatMiladiDate(date) {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options) + ' Miladi';
}

/**
 * Formats a Hijri date string from "YYYY-MM-DD" to "DD MonthNameব্যাপ Hijri".
 * @param {string} hijriDateStr - The Hijri date string from API (e.g., "1446-07-01").
 * @returns {string} Formatted Hijri date string.
 */
function formatHijriDate(hijriDateStr) {
    if (!hijriDateStr) return '---';
    const parts = hijriDateStr.split('-');
    const year = parts[0];
    const monthNum = parseInt(parts[1], 10);
    const day = parseInt(parts[2], 10);

    const hijriMonthNames = [
        'Muharram', 'Safar', 'Rabi\' al-Awwal', 'Rabi\' al-Thani', 'Jumada al-Ula', 'Jumada al-Thani',
        'Rajab', 'Sha\'ban', 'Ramadan', 'Shawwal', 'Dhul-Qa\'dah', 'Dhul-Hijjah'
    ];
    
    // Adjust monthNum to be 0-indexed for array lookup
    const monthName = hijriMonthNames[monthNum - 1] || '';

    return `${day} ${monthName} ${year} Hijri`;
}

/**
 * Calculates Iqama time by adding offset minutes to a prayer time.
 * @param {string} prayerTimeStr - Prayer time in "HH:MM:SS" or "HH:MM" format.
 * @param {number} offsetMinutes - Minutes to add for Iqama.
 * @returns {string} Iqama time formatted using formatTime function.
 */
function calculateIqamaTime(prayerTimeStr, offsetMinutes) {
    if (!prayerTimeStr || prayerTimeStr.trim() === '--:--' || offsetMinutes === undefined) {
        return '--:--';
    }
    // Parse the HH:MM part and convert to a Date object
    const [hours, minutes] = prayerTimeStr.substring(0,5).split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0); // Set to prayer time, seconds to 0
    date.setMinutes(date.getMinutes() + offsetMinutes); // Add offset

    // Format the resulting time using the global formatTime function
    // Pass '00' for seconds as calculateIqamaTime always produces HH:MM
    return formatTime(`${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:00`);
}

/**
 * Displays prayer times in the table, focusing only on today's data.
 * Also updates current date, time, next prayer and countdown.
 * Handles fallback to other synced zones if data for selected zone is missing.
 * @param {string} locationCode - The JAKIM zone code (initially requested).
 * @param {number} year - The year to display.
 */
async function displayPrayerTimes(locationCode, year) {
    prayerTimesTableBody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-4">Loading today\'s prayer times...</td></tr>';
    iqamaTimesTableBody.innerHTML = '<tr><td colspan="8" class="text-center">Loading Iqama times...</td></tr>';
    mosqueNameDisplay.textContent = mosqueName; // Update mosque name display

    // Clear previous countdown if any
    if (nextPrayerTimeout) {
        clearTimeout(nextPrayerTimeout);
    }
    if (iqamaCountdownInterval) { // Clear Iqama interval if active
        clearInterval(iqamaCountdownInterval);
    }

    const today = new Date();
    const todayFormattedForComparison = today.toISOString().slice(0, 10); //YYYY-MM-DD
    const originalZoneName = JAKIM_ZONES.find(z => z.code === locationCode)?.name || locationCode;

    // Reset announced prayers for a new day if date has changed
    if (announcedPrayersToday.date !== todayFormattedForComparison) {
        announcedPrayersToday = {
            date: todayFormattedForComparison,
            fajr: false,
            dhuhr: false,
            asr: false,
            maghrib: false,
            isha: false
        };
        // Reset lastAutoSync if it's a new day and auto sync is off (to re-trigger if needed)
        // This part needs careful consideration if it's causing unwanted syncs.
        // It should ONLY reset if auto sync is OFF and the day has truly changed and it was NOT a manual sync.
        // For now, removing this condition from here as checkAndRunAutoSync handles its own lastAutoSync state.
        /*
        if (!autoSyncSettings.enabled && autoSyncSettings.lastAutoSync) {
            const lastSyncDate = new Date(autoSyncSettings.lastAutoSync).toISOString().slice(0,10);
            if (lastSyncDate !== todayFormattedForComparison) {
                autoSyncSettings.lastAutoSync = null; // Forces a check next time auto sync is enabled/app loads
                await saveSetting('autoSync', autoSyncSettings);
            }
        }
        */
    }


    let todayData = null;
    let usedZoneCode = locationCode;
    let usedZoneName = originalZoneName;
    let fallbackUsed = false;

    // 1. Try to get data for the selected zone
    let dataForSelectedZone = await getPrayerTimesForYear(locationCode, year);
    if (dataForSelectedZone && dataForSelectedZone.length > 0) {
        todayData = dataForSelectedZone.find(dayData => {
            const parts = dayData.date.split('-');
            const monthNum = API_MONTH_MAP[parts[1]];
            const apiDateFormatted = `${parts[2]}-${monthNum}-${parts[0]}`;
            return apiDateFormatted === todayFormattedForComparison;
        });
    }

    // 2. If data for selected zone is missing, try to find a fallback zone
    if (!todayData) {
        console.warn(`Prayer data missing for selected zone (${locationCode}). Searching for fallback...`);
        
        const allStoredPrayerTimes = await getAllStoredPrayerTimesData();

        // Find a fallback from *any* stored zone data
        for (const storedData of allStoredPrayerTimes) {
            // Check if the stored data is for the current year
            if (storedData.id.endsWith(`_${year}`)) {
                const foundDailyData = storedData.data.find(dayData => {
                    const parts = dayData.date.split('-');
                    const monthNum = API_MONTH_MAP[parts[1]];
                    const apiDateFormatted = `${parts[2]}-${monthNum}-${parts[0]}`;
                    return apiDateFormatted === tomorrowFormattedForComparison;
                });

                if (foundDailyData) {
                    todayData = foundDailyData;
                    usedZoneCode = storedData.id.split('_')[0]; // Extract zone code from ID
                    usedZoneName = JAKIM_ZONES.find(z => z.code === usedZoneCode)?.name || usedZoneCode;
                    fallbackUsed = true;
                    break; // Found a fallback, stop searching
                }
            }
        }
    }

    todayPrayerDataGlobal = todayData; // Store for clock updates

    prayerTimesTableBody.innerHTML = ''; // Clear existing rows
    iqamaTimesTableBody.innerHTML = ''; // Clear existing iqama rows

    if (todayData) {
        // Display Prayer Times - use formatTime without seconds
        const prayerRow = document.createElement('tr');
        prayerRow.innerHTML = `
            <td>${formatTime(todayData.imsak)}</td>
            <td>${formatTime(todayData.fajr)}</td>
            <td>${formatTime(todayData.syuruk)}</td>
            <td>${formatTime(todayData.dhuha || '--:--')}</td>
            <td>${formatTime(todayData.dhuhr)}</td>
            <td>${formatTime(todayData.asr)}</td>
            <td>${formatTime(todayData.maghrib)}</td>
            <td>${formatTime(todayData.isha)}</td>
        `;
        prayerTimesTableBody.appendChild(prayerRow);

        // Display Iqama Times - calculate and format
        const iqamaRow = document.createElement('tr');
        iqamaRow.innerHTML = `
            <td>Iqama</td>
            <td>${calculateIqamaTime(todayData.fajr, iqamaOffsets.fajr)}</td>
            <td>---</td> <!-- Syuruk doesn't typically have iqama -->
            <td>---</td> <!-- Dhuha doesn't typically have iqama -->
            <td>${calculateIqamaTime(todayData.dhuhr, iqamaOffsets.dhuhr)}</td>
            <td>${calculateIqamaTime(todayData.asr, iqamaOffsets.asr)}</td>
            <td>${calculateIqamaTime(todayData.maghrib, iqamaOffsets.maghrib)}</td>
            <td>${calculateIqamaTime(todayData.isha, iqamaOffsets.isha)}</td>
        `;
        iqamaTimesTableBody.appendChild(iqamaRow);


        // Update main display dates
        currentMiladiDateDisplay.textContent = formatMiladiDate(today);
        currentHijriDateDisplay.textContent = formatHijriDate(todayData.hijri);
        // Update selected location display with the *actually used* zone name
        selectedLocationDisplay.textContent = usedZoneName;

        // Show fallback message if applicable
        if (fallbackUsed) {
            showMessage(
                'Prayer Times Missing',
                `Prayer time for <strong>${originalZoneName}</strong> is not available. Using prayer time from <strong>${usedZoneName}</strong>. Please try to sync manually again later.`
            );
        }

        // Immediately update clock and prayer times after displaying data
        updateClockAndPrayerStatus();

    } else {
        // No data found for selected zone and no fallback available
        prayerTimesTableBody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">Today's prayer times are not available. Please sync or try again later.</td></tr>`;
        iqamaTimesTableBody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">Iqama times not available.</td></tr>';
        currentMiladiDateDisplay.textContent = formatMiladiDate(today);
        currentHijriDateDisplay.textContent = '---';
        nextPrayerNameDisplay.textContent = 'N/A';
        nextPrayerTimeDisplay.textContent = '---';
        countdownToNextPrayerDisplay.textContent = '---';
        selectedLocationDisplay.textContent = originalZoneName; // Still show originally selected zone
        todayPrayerDataGlobal = null;
        currentDisplayState = 'main'; // Ensure we are on main display if no data
        showDisplay('main');

        // This modal is only for when NO data at all could be found (initial state or persistent sync issues)
        // If there was a fallback, the message above covers it.
        if (!fallbackUsed) {
            showMessage('Data Unavailable', 'Cannot display prayer times. Please ensure you have synced data for your selected zone, or try to synchronize manually.');
        }
    }
}

/**
 * Hides all dynamic display containers and shows only the specified one.
 * @param {string} mode - 'main', 'announcement', 'iqamaCountdown', 'postIqamaMessage'
 */
function showDisplay(mode) {
    const displays = document.querySelectorAll('.display-mode-content');
    displays.forEach(display => {
        display.classList.remove('active-display');
    });

    let targetDisplay;
    switch (mode) {
        case 'main':
            targetDisplay = mainDisplayContent;
            break;
        case 'announcement':
            targetDisplay = prayerAnnouncementDisplay;
            break;
        case 'iqamaCountdown':
            targetDisplay = iqamaCountdownDisplay;
            break;
        case 'postIqamaMessage':
            targetDisplay = postIqamaMessageDisplay;
            break;
        default:
            targetDisplay = mainDisplayContent; // Fallback to main
            mode = 'main';
    }
    targetDisplay.classList.add('active-display');
    currentDisplayState = mode;
    console.log(`Switched to display: ${mode}`);
}

/**
 * Triggers the Prayer Announcement display.
 * @param {string} prayerNameKey - The key of the prayer (e.g., 'fajr').
 * @param {string} prayerTimeStr - Formatted prayer time (e.g., "05:30 AM").
 * @param {string} zoneName - The full zone name.
 */
function startPrayerAnnouncement(prayerNameKey, prayerTimeStr, zoneName) {
    if (currentDisplayState === 'announcement' || currentDisplayState === 'iqamaCountdown' || currentDisplayState === 'postIqamaMessage') {
        console.log("Already in an announcement sequence. Skipping new announcement.");
        return; // Already in an announcement sequence
    }

    // Check if this prayer has already been announced today
    if (announcedPrayersToday[prayerNameKey]) {
        console.log(`${PRAYER_NAMES_MAP[prayerNameKey]} already announced today.`);
        return;
    }

    // Clear any existing timers/intervals before starting new sequence
    if (nextPrayerTimeout) clearTimeout(nextPrayerTimeout);
    if (iqamaCountdownInterval) clearInterval(iqamaCountdownInterval);

    activePrayerDetails = {
        nameKey: prayerNameKey,
        name: PRAYER_NAMES_MAP[prayerNameKey],
        time: prayerTimeStr,
        zone: zoneName,
        // Ensure todayPrayerDataGlobal is not null before accessing its properties
        iqamaTime: todayPrayerDataGlobal ? calculateIqamaTime(todayPrayerDataGlobal[prayerNameKey], iqamaOffsets[prayerNameKey]) : '--:--'
    };

    announcementPrayerName.textContent = activePrayerDetails.name.toUpperCase();
    announcementPrayerTime.textContent = activePrayerDetails.time;
    announcementZoneName.textContent = activePrayerDetails.zone;

    showDisplay('announcement');
    announcedPrayersToday[prayerNameKey] = true; // Mark as announced for today

    // After 30 seconds, transition to Iqama Countdown
    nextPrayerTimeout = setTimeout(() => {
        if (activePrayerDetails) {
            // Pass a simulated duration for Iqama Countdown (30 seconds) if debug mode is enabled
            if (debugModeEnabled) {
                startIqamaCountdown(30);
            } else {
                startIqamaCountdown(); // Normal flow: use actual Iqama time
            }
        } else {
            console.warn("Active prayer details missing, returning to main display after announcement.");
            returnToMainDisplay();
        }
    }, 30000); // 30 seconds for announcement
    console.log(`Prayer Announcement for ${activePrayerDetails.name} started. Next: Iqama Countdown in 30s.`);
}

/**
 * Triggers the Iqama Countdown display.
 * @param {number|null} [simulatedDurationSeconds=null] - Optional. If provided, sets a simulated countdown duration. Default is 45s for simulation.
 */
function startIqamaCountdown(simulatedDurationSeconds = null) {
    if (!activePrayerDetails) {
        console.error("No active prayer details for Iqama countdown. Returning to main display.");
        returnToMainDisplay();
        return;
    }

    // Populate the new elements based on activePrayerDetails
    iqamaPrayerName.textContent = activePrayerDetails.name.toUpperCase();
    iqamaPrayerTime.textContent = activePrayerDetails.time;
    iqamaZoneName.textContent = activePrayerDetails.zone;

    showDisplay('iqamaCountdown');

    // Determine the target time for the countdown
    let iqamaTargetDateTime;
    if (simulatedDurationSeconds !== null) {
        // For simulation, calculate target time from now
        iqamaTargetDateTime = new Date(Date.now() + simulatedDurationSeconds * 1000);
        console.log(`Simulating Iqama Countdown for ${simulatedDurationSeconds} seconds.`);
    } else {
        // For actual prayer, use the calculated Iqama time
        // Need to parse activePrayerDetails.iqamaTime (which is already formatted HH:MM)
        const [iqamaHours, iqamaMinutes] = activePrayerDetails.iqamaTime.split(':').map(Number);
        iqamaTargetDateTime = new Date();
        iqamaTargetDateTime.setHours(iqamaHours, iqamaMinutes, 0, 0);
        console.log(`Actual Iqama Countdown started for ${activePrayerDetails.name}.`);
    }

    // Clear any existing countdown interval
    if (iqamaCountdownInterval) clearInterval(iqamaCountdownInterval);

    // Initial setting of color to green
    iqamaCountdown.classList.remove('text-danger-custom', 'text-warning-custom');
    iqamaCountdown.classList.add('text-success');

    // Update countdown every second
    iqamaCountdownInterval = setInterval(() => {
        const now = new Date();
        const diffMs = iqamaTargetDateTime.getTime() - now.getTime();

        if (diffMs < 0) {
            iqamaCountdown.textContent = '00:00:00';
            clearInterval(iqamaCountdownInterval);
            console.log(`Iqama for ${activePrayerDetails.name} reached. Transitioning to Post-Iqama Message.`);
            startPostIqamaMessage();
        } else {
            const totalSeconds = Math.floor(diffMs / 1000);
            
            // Apply colors based on remaining time
            iqamaCountdown.classList.remove('text-success', 'text-warning-custom', 'text-danger-custom'); // Clear all first
            if (totalSeconds <= 15) {
                iqamaCountdown.classList.add('text-danger-custom'); // Red for <= 15s
            } else if (totalSeconds <= 30) {
                iqamaCountdown.classList.add('text-warning-custom'); // Orange for > 15s and <= 30s
            } else {
                iqamaCountdown.classList.add('text-success'); // Green for > 30s
            }

            const hours = Math.floor(totalSeconds / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            iqamaCountdown.textContent =
                `${String(hours).padStart(2, '0')}:` +
                `${String(minutes).padStart(2, '0')}:` +
                `${String(seconds).padStart(2, '0')}`;
        }
    }, 1000); // Update every second
}

/**
 * Triggers the Post-Iqama Message display.
 */
function startPostIqamaMessage() {
    if (nextPrayerTimeout) clearTimeout(nextPrayerTimeout); // Clear any previous general timer
    if (iqamaCountdownInterval) clearInterval(iqamaCountdownInterval); // Ensure Iqama interval is cleared

    showDisplay('postIqamaMessage');
    
    // After 30 seconds, return to Main Display
    nextPrayerTimeout = setTimeout(() => {
        returnToMainDisplay();
    }, 30000); // 30 seconds for message display
    console.log(`Post-Iqama message started. Returning to Main Display in 30s.`);
}

/**
 * Returns the display to the Main Display.
 * This function also refreshes `todayPrayerDataGlobal` based on the current actual date.
 */
async function returnToMainDisplay() {
    if (nextPrayerTimeout) clearTimeout(nextPrayerTimeout);
    if (iqamaCountdownInterval) clearInterval(iqamaCountdownInterval);
    activePrayerDetails = null; // Clear active prayer details

    showDisplay('main');
    
    // Crucially, re-call displayPrayerTimes to refresh data for the *current actual day*
    // This will fetch updated todayPrayerDataGlobal if the day has changed
    const currentCode = locationSelect.value;
    const currentYear = new Date().getFullYear();
    await displayPrayerTimes(currentCode, currentYear);
    // The main clock update loop will be re-established by displayPrayerTimes
    console.log('Returned to Main Display and refreshed.');
}


/**
 * Updates the current time, and determines/displays the next prayer time and its countdown.
 * This function also handles transitions to announcement displays.
 * It now ensures todayPrayerDataGlobal is always fresh for the current date.
 */
async function updateClockAndPrayerStatus() {
    const now = new Date();
    currentTimeDisplay.textContent = formatTime(`${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`, true);

    const todayFormattedForComparison = now.toISOString().slice(0, 10);

    // If the global prayer data is for a different day, refresh it first
    if (!todayPrayerDataGlobal || announcedPrayersToday.date !== todayFormattedForComparison) {
        const currentCode = locationSelect.value;
        const currentYear = now.getFullYear();
        await displayPrayerTimes(currentCode, currentYear); // This will update todayPrayerDataGlobal
        // If displayPrayerTimes handles a data refresh, it will also call updateClockAndPrayerStatus again.
        return; // Exit current execution to avoid stale data issues.
    }

    // If currently not on main display, just update current time and maintain sequence
    // Or if debug mode is enabled, skip auto announcements
    if (currentDisplayState !== 'main' || debugModeEnabled) {
        if (currentDisplayState === 'main' && debugModeEnabled) {
            console.log("Debug mode is ON. Automatic prayer announcements are suppressed.");
        }
        nextPrayerTimeout = setTimeout(updateClockAndPrayerStatus, 1000);
        return;
    }

    // Only proceed with prayer time detection and next prayer calculation if on main display
    if (!todayPrayerDataGlobal) {
        nextPrayerNameDisplay.textContent = 'No Data';
        nextPrayerTimeDisplay.textContent = '---';
        countdownToNextPrayerDisplay.textContent = '---';
        nextPrayerTimeout = setTimeout(updateClockAndPrayerStatus, 1000);
        return;
    }

    const currentZoneName = JAKIM_ZONES.find(z => z.code === locationSelect.value)?.name || 'N/A';
    
    let allEventsForToday = [];

    // Combine all standard prayer times for general next prayer calculation
    const standardPrayerKeys = ['imsak', 'fajr', 'syuruk', 'dhuha', 'dhuhr', 'asr', 'maghrib', 'isha'];
    for (const key of standardPrayerKeys) {
        const timeStr = todayPrayerDataGlobal[key];
        if (timeStr && timeStr.trim() !== '--:--') {
            const [pHours, pMinutes] = timeStr.split(':').map(Number);
            allEventsForToday.push({
                name: PRAYER_NAMES_MAP[key],
                nameKey: key, // Store key for announcement check
                timeStr: formatTime(timeStr, false), // Use formatTime here for next prayer time display
                dateTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), pHours, pMinutes, 0)
            });
        }
    }

    // Sort all events chronologically
    allEventsForToday.sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());

    let nextEventForMainDisplay = null;

    // Check for *Prayer Announcement* trigger for obligatory prayers (ONLY if debug mode is OFF)
    for (const key of OBLIGATORY_PRAYERS) {
        const prayerTimeStr = todayPrayerDataGlobal[key];
        if (prayerTimeStr && prayerTimeStr.trim() !== '--:--') {
            const [pHours, pMinutes] = prayerTimeStr.split(':').map(Number);
            const prayerDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), pHours, pMinutes, 0, 0);
            
            // Allow a small window (e.g., first 59 seconds) to trigger the announcement
            const announcementWindowEnd = new Date(prayerDateTime.getTime() + 59 * 1000); // 59 seconds after prayer time

            if (now >= prayerDateTime && now < announcementWindowEnd && !announcedPrayersToday[key]) {
                startPrayerAnnouncement(key, formatTime(prayerTimeStr, false), currentZoneName);
                return; // Exit and let the announcement sequence manage the timers
            }
        }
    }


    // If no announcement triggered, find the next prayer for the Main Display
    for (const event of allEventsForToday) {
        if (event.dateTime > now) {
            nextEventForMainDisplay = event;
            break;
        }
    }

    // If no event found for today, find Fajr for tomorrow
    if (!nextEventForMainDisplay) {
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        // Ensure tomorrow's year is correct if it's Dec 31st
        const tomorrowYear = tomorrow.getFullYear();
        const tomorrowFormattedForComparison = tomorrow.toISOString().slice(0, 10);

        const tomorrowDataAll = await getPrayerTimesForYear(locationSelect.value, tomorrowYear);
        let tomorrowFajrData = null;

        if (tomorrowDataAll && tomorrowDataAll.length > 0) {
            tomorrowFajrData = tomorrowDataAll.find(d => {
                const parts = d.date.split('-');
                const monthNum = API_MONTH_MAP[parts[1]]; // Use global map for month
                const apiDateFormatted = `${parts[2]}-${monthNum}-${parts[0]}`;
                return apiDateFormatted === tomorrowFormattedForComparison;
            });
        }

        if (tomorrowFajrData && tomorrowFajrData.fajr && tomorrowFajrData.fajr.trim() !== '--:--') {
            const [fHours, fMinutes] = tomorrowFajrData.fajr.split(':').map(Number);
            const tomorrowFajrDateTime = new Date(tomorrowYear, tomorrow.getMonth(), tomorrow.getDate(), fHours, fMinutes, 0);
            
            nextPrayerNameDisplay.textContent = `Next: Fajr (Tomorrow)`;
            nextPrayerTimeDisplay.textContent = formatTime(tomorrowFajrData.fajr, false); // Format using formatTime
            const diffMsTomorrow = tomorrowFajrDateTime.getTime() - now.getTime();
            const totalSecondsTomorrow = Math.floor(diffMsTomorrow / 1000);
            countdownToNextPrayerDisplay.textContent = formatCountdown(totalSecondsTomorrow);
        } else {
            nextPrayerNameDisplay.textContent = 'No Next Prayer Data';
            nextPrayerTimeDisplay.textContent = '---';
            countdownToNextPrayerDisplay.textContent = '---';
        }
        nextPrayerTimeout = setTimeout(updateClockAndPrayerStatus, 1000); // Schedule next update
    } else {
        // Update main display with next upcoming prayer
        nextPrayerNameDisplay.textContent = `Next: ${nextEventForMainDisplay.name}`;
        nextPrayerTimeDisplay.textContent = nextEventForMainDisplay.timeStr; // Already formatted by formatTime

        const diffMs = nextEventForMainDisplay.dateTime.getTime() - now.getTime();
        const totalSeconds = Math.floor(diffMs / 1000);
        countdownToNextPrayerDisplay.textContent = formatCountdown(totalSeconds);
        nextPrayerTimeout = setTimeout(updateClockAndPrayerStatus, 1000); // Schedule next update
    }
}

/**
 * Formats seconds into HH:MM:SS countdown string.
 * @param {number} totalSeconds
 * @returns {string}
 */
function formatCountdown(totalSeconds) {
    if (totalSeconds < 0) return 'Passed';
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:` +
           `${String(minutes).padStart(2, '0')}:` +
           `${String(seconds).padStart(2, '0')}`;
}


/**
 * Loads all settings from IndexedDB.
 */
async function loadSettings() {
    const loadedIqamaOffsets = await loadSetting('iqamaOffsets');
    if (loadedIqamaOffsets) {
        Object.assign(iqamaOffsets, loadedIqamaOffsets);
    } else {
        // If no settings in IndexedDB, try migrating from localStorage (for older versions)
        const oldSettingsString = localStorage.getItem('prayerTimeSettings');
        if (oldSettingsString) {
            try {
                const oldSettings = JSON.parse(oldSettingsString);
                if (oldSettings.iqamaOffsets) {
                    Object.assign(iqamaOffsets, oldSettings.iqamaOffsets);
                    // This data will be saved to IndexedDB by the migration logic in onupgradeneeded.
                }
            } catch (e) {
                console.warn("Could not parse old localStorage settings for Iqama offsets during initial load.", e);
            }
        }
    }
    
    // Load time format preference
    const loadedTimeFormat = await loadSetting('use24HourFormat');
    if (loadedTimeFormat !== undefined) {
        use24HourFormat = loadedTimeFormat;
    }
    timeFormatSwitch.checked = use24HourFormat;

    // Load auto sync settings
    const loadedAutoSync = await loadSetting('autoSync');
    if (loadedAutoSync) {
        Object.assign(autoSyncSettings, loadedAutoSync);
    }
    autoSyncMasterSwitch.checked = autoSyncSettings.enabled;
    const selectedFrequencyRadio = document.querySelector(`input[name="autoSyncFrequency"][value="${autoSyncSettings.frequency}"]`);
    if (selectedFrequencyRadio) {
        selectedFrequencyRadio.checked = true;
    }
    autoSyncDaySelect.value = autoSyncSettings.day;
    autoSyncTimeInput.value = autoSyncSettings.time;
    toggleAutoSyncScheduleOptions();

    // Load debug mode setting
    const loadedDebugMode = await loadSetting('debugModeEnabled');
    if (loadedDebugMode !== undefined) {
        debugModeEnabled = loadedDebugMode;
    }
    debugModeSwitch.checked = debugModeEnabled;
    toggleDebugButtonsVisibility();

    // Load theme setting from IndexedDB (new)
    const loadedTheme = await loadSetting('theme');
    if (loadedTheme !== undefined) {
        setTheme(loadedTheme); // Apply the loaded theme
    } else {
        // If theme not in IndexedDB, try localStorage for migration (if DB was not upgraded from v3)
        const initialLocalStorageTheme = localStorage.getItem('theme');
        if (initialLocalStorageTheme) {
            setTheme(initialLocalStorageTheme);
            // This will be saved to IndexedDB on the first theme switch after load.
        } else {
            setTheme('dark'); // Default theme if nothing is found anywhere
        }
    }

    // Load Mosque Name (NEW)
    const loadedMosqueName = await loadSetting('mosqueName');
    if (loadedMosqueName !== undefined) {
        mosqueName = loadedMosqueName;
        mosqueNameInput.value = mosqueName; // Populate input field
        mosqueNameDisplay.textContent = mosqueName; // Display it immediately
    } else {
        mosqueName = ''; // Default empty
        mosqueNameInput.value = '';
        mosqueNameDisplay.textContent = '';
    }
}


/**
 * Saves current settings to IndexedDB.
 */
async function saveAllSettings() {
    await saveSetting('iqamaOffsets', iqamaOffsets);
    await saveSetting('use24HourFormat', use24HourFormat);
    await saveSetting('autoSync', autoSyncSettings);
    await saveSetting('debugModeEnabled', debugModeEnabled);
    await saveSetting('lastSelectedLocation', locationSelect.value);
    await saveSetting('theme', darkModeSwitch.checked ? 'dark' : 'light'); 
    await saveSetting('mosqueName', mosqueName); // Save Mosque Name (NEW)
    console.log("All settings saved to IndexedDB.");
}

/**
 * Populates Iqama input fields with current offsets.
 */
function populateIqamaInputs() {
    iqamaFajrInput.value = iqamaOffsets.fajr;
    iqamaDhuhrInput.value = iqamaOffsets.dhuhr;
    iqamaAsrInput.value = iqamaOffsets.asr;
    iqamaMaghribInput.value = iqamaOffsets.maghrib;
    iqamaIshaInput.value = iqamaOffsets.isha;
}

/**
 * Handles input change for Iqama offset fields.
 * @param {Event} event - The input event.
 */
function handleIqamaInputChange(event) {
    const input = event.target;
    const prayerKey = input.dataset.prayer;
    const value = parseInt(input.value, 10);

    if (!isNaN(value) && value >= 0 && value <= 60) {
        iqamaOffsets[prayerKey] = value;
        saveAllSettings(); // Save all settings
        // Re-display prayer times to update Iqama row and next prayer countdown
        displayPrayerTimes(locationSelect.value, new Date().getFullYear());
    } else {
        // Revert to last valid value or show error
        input.value = iqamaOffsets[prayerKey];
        showMessage('Invalid Input', 'Please enter a number between 0 and 60 for Iqama offset.');
    }
}

/**
 * Toggles the visibility of auto-sync schedule options based on master switch and frequency selection. (NEW)
 */
function toggleAutoSyncScheduleOptions() {
    if (autoSyncMasterSwitch.checked) {
        autoSyncScheduleDetails.style.display = 'block';
    } else {
        autoSyncScheduleDetails.style.display = 'none';
    }
}

/**
 * Checks if an auto sync is due and triggers it. (NEW)
 */
async function checkAndRunAutoSync() {
    const now = new Date();
    const lastSyncTime = autoSyncSettings.lastAutoSync ? new Date(autoSyncSettings.lastAutoSync) : null;
    let syncDue = false;

    if (!autoSyncSettings.enabled) {
        console.log('Auto sync is disabled. Skipping check.');
        return;
    }

    const [scheduledHours, scheduledMinutes] = autoSyncSettings.time.split(':').map(Number);
    
    // Calculate the most recent scheduled sync time that has passed or is current
    let lastScheduledSyncPoint = new Date(now.getFullYear(), now.getMonth(), now.getDate(), scheduledHours, scheduledMinutes, 0, 0);
    if (lastScheduledSyncPoint > now) { // If today's scheduled time is in the future, consider yesterday's
        lastScheduledSyncPoint.setDate(lastScheduledSyncPoint.getDate() - 1);
    }

    // Adjust to the specific day of the week for weekly/bi-weekly (target the most recent past or current day)
    if (autoSyncSettings.frequency === 'weekly' || autoSyncSettings.frequency === 'bi-weekly') {
        // Go back in time until we hit the last occurrence of the scheduled dayOfWeek
        while (lastScheduledSyncPoint.getDay() !== autoSyncSettings.day) {
            lastScheduledSyncPoint.setDate(lastScheduledSyncPoint.getDate() - 1);
        }
        // If bi-weekly, ensure we are on the correct bi-weekly interval
        if (autoSyncSettings.frequency === 'bi-weekly') {
            // This is tricky. A simple approach is to check if enough time passed since last sync.
            // For robust bi-weekly, you'd need a reference start date for the cycle.
            // For simplicity, we'll primarily rely on `lastSyncTime` and `intervalMs`.
        }
    } else if (autoSyncSettings.frequency === 'monthly') {
        // For monthly, adjust to the start of the current month if past, or previous month if current time is before schedule.
        // This makes sure lastScheduledSyncPoint points to the *last possible trigger point*
        if (now.getDate() < lastScheduledSyncPoint.getDate()) { // If current day is before scheduled day of month
            lastScheduledSyncPoint.setMonth(lastScheduledSyncPoint.getMonth() - 1);
        }
        lastScheduledSyncPoint.setDate(lastScheduledSyncPoint.getDate()); // Keep original date, just change month
    }

    // Now, `lastScheduledSyncPoint` is the timestamp of the last *scheduled* trigger.

    if (!lastSyncTime) {
        // If never synced before and current time is past the calculated lastScheduledSyncPoint, then sync
        if (now >= lastScheduledSyncPoint) {
            syncDue = true;
        }
    } else {
        let intervalMs = 0;
        if (autoSyncSettings.frequency === 'weekly') {
            intervalMs = 7 * 24 * 60 * 60 * 1000;
        } else if (autoSyncSettings.frequency === 'bi-weekly') {
            intervalMs = 14 * 24 * 60 * 60 * 1000;
        } else if (autoSyncSettings.frequency === 'monthly') {
            // For monthly, calculate the timestamp for the *next expected monthly sync* based on the last sync time
            let nextExpectedMonthlySync = new Date(lastSyncTime);
            nextExpectedMonthlySync.setMonth(nextExpectedMonthlySync.getMonth() + 1);
            nextExpectedMonthlySync.setHours(scheduledHours, scheduledMinutes, 0, 0);

            // If the current time is past this `nextExpectedMonthlySync` and the last sync was before it
            if (now >= nextExpectedMonthlySync && lastSyncTime < nextExpectedMonthlySync) {
                syncDue = true;
            }
        }
        
        // For weekly/bi-weekly, check if the interval has passed AND current time is past the *last* scheduled point
        if ((autoSyncSettings.frequency === 'weekly' || autoSyncSettings.frequency === 'bi-weekly') && intervalMs > 0) {
            // Sync is due if enough time has passed since last sync AND current time is past the last scheduled point
            if (now.getTime() - lastSyncTime.getTime() >= intervalMs && now >= lastScheduledSyncPoint) {
                syncDue = true;
            }
        }
    }


    if (syncDue) {
        console.log('Auto sync is due. Initiating...');
        await fetchAndStoreAllPrayerTimes(locationSelect.value, 'AUTO');
        // After auto sync, refresh display to ensure latest data is shown
        await displayPrayerTimes(locationSelect.value, new Date().getFullYear());
        // Update lastAutoSync only AFTER successful sync
        autoSyncSettings.lastAutoSync = now.toISOString();
        await saveSetting('autoSync', autoSyncSettings);
    } else {
        console.log('Auto sync not due yet. Last sync:', lastSyncTime ? lastSyncTime.toLocaleString() : 'Never');
        console.log('Next scheduled sync point to consider:', lastScheduledSyncPoint.toLocaleString());
    }
}


/**
 * Handles the annual sync logic for the next year's prayer times.
 * This should run on Dec 31st or during the first week of Jan.
 */
async function handleAnnualSync() {
    const now = new Date();
    const currentMonth = now.getMonth(); // 0-indexed
    const currentDay = now.getDate();
    const currentYear = now.getFullYear();
    const nextYear = currentYear + 1;

    const lastAttempt = autoSyncSettings.lastNextYearSyncAttempt ? new Date(autoSyncSettings.lastNextYearSyncAttempt) : null;
    let shouldAttemptSync = false;

    // Condition 1: It's December 31st and no attempt has been made today for the *current* year
    if (currentMonth === 11 && currentDay === 31) { // December is month 11
        if (!lastAttempt || lastAttempt.getFullYear() !== currentYear || lastAttempt.getMonth() !== 11 || lastAttempt.getDate() !== 31) {
            shouldAttemptSync = true;
            console.log("It's December 31st. Initiating next year's prayer time sync.");
        }
    } 
    // Condition 2: It's January 1st to 7th of the next year, and the last attempt was before this year or failed within this year.
    else if (currentMonth === 0 && currentDay >= 1 && currentDay <= 7) { // January is month 0
        if (!lastAttempt || lastAttempt.getFullYear() < currentYear) {
            // If no attempt last year, or last attempt was for a previous year
            shouldAttemptSync = true;
            console.log(`It's Jan ${currentDay}. Attempting next year's prayer time sync (retry logic).`);
        } else if (lastAttempt.getFullYear() === currentYear && lastAttempt.getMonth() === 0 && lastAttempt.getDate() < currentDay) {
            // If attempt was already made this Jan, but on an earlier day (retry logic within first week)
            shouldAttemptSync = true;
            console.log(`It's Jan ${currentDay}. Attempting next year's prayer time sync (daily retry within first week).`);
        }
    }

    if (shouldAttemptSync) {
        autoSyncSettings.lastNextYearSyncAttempt = now.toISOString(); // Record attempt time
        await saveSetting('autoSync', autoSyncSettings); // Save updated autoSync settings

        console.log(`Attempting to sync prayer times for year ${nextYear} for zone ${locationSelect.value}.`);
        const success = await fetchAndStoreAllPrayerTimes(locationSelect.value, 'AUTO_ANNUAL', nextYear);
        
        if (success) {
            console.log(`Successfully synced prayer times for ${nextYear}.`);
        } else {
            console.warn(`Failed to sync prayer times for ${nextYear}. Will retry later.`);
            // No explicit modal here, as fetchAndStoreAllPrayerTimes already displays it if it was not 'AUTO_INITIAL'
        }
    } else {
        console.log("No annual sync due yet.");
    }
}


/**
 * Toggles the visibility of the debug buttons. (NEW)
 */
function toggleDebugButtonsVisibility() {
    if (debugModeEnabled) {
        debugButtonsContainer.style.display = 'grid'; // Use 'grid' for d-grid gap-2
    } else {
        debugButtonsContainer.style.display = 'none';
    }
}

/**
 * Simulates a Prayer Announcement. (NEW, used by UI)
 * @param {string} prayerKey - The key of the prayer to simulate (e.g., 'fajr').
 */
function simulatePrayerAnnouncementAction(prayerKey) {
    if (!debugModeEnabled) {
        showMessage("Debug Mode Off", "Please enable Debug Mode in settings to use simulation functions.");
        return;
    }
    if (!todayPrayerDataGlobal) {
        showMessage("Debug Warning", "No prayer data loaded. Please sync prayer times first.");
        return;
    }
    if (!OBLIGATORY_PRAYERS.includes(prayerKey)) {
        showMessage("Debug Warning", `'${prayerKey}' is not an obligatory prayer for announcements.`);
        return;
    }

    // Temporarily reset the announced status for this prayer for testing
    announcedPrayersToday[prayerKey] = false; 

    const prayerTimeStr = todayPrayerDataGlobal[prayerKey];
    const currentZoneName = JAKIM_ZONES.find(z => z.code === locationSelect.value)?.name || 'N/A';
    
    console.log(`Simulating announcement for ${prayerKey}...`);
    startPrayerAnnouncement(prayerKey, formatTime(prayerTimeStr, false), currentZoneName);
}

/**
 * Simulates an Iqama Countdown. (NEW, used by UI)
 * @param {string} prayerKey - The key of the prayer to simulate (e.g., 'fajr').
 * @param {number} [durationSeconds=45] - The duration of the simulation in seconds.
 */
function simulateIqamaCountdownAction(prayerKey, durationSeconds = 45) {
    if (!debugModeEnabled) {
        showMessage("Debug Mode Off", "Please enable Debug Mode in settings to use simulation functions.");
        return;
    }
    if (!todayPrayerDataGlobal) {
        showMessage("Debug Warning", "No prayer data loaded. Please sync prayer times first.");
        return;
    }
    if (!OBLIGATORY_PRAYERS.includes(prayerKey)) {
        showMessage("Debug Warning", `'${prayerKey}' is not an obligatory prayer key for Iqama countdown.`);
        return;
    }
    if (isNaN(durationSeconds) || durationSeconds < 1) {
        showMessage("Invalid Input", "Please enter a valid positive number for Iqama countdown duration.");
        return;
    }


    // Set activePrayerDetails based on the specified prayerKey
    const prayerTimeStr = todayPrayerDataGlobal[prayerKey];
    const currentZoneName = JAKIM_ZONES.find(z => z.code === locationSelect.value)?.name || 'N/A';

    activePrayerDetails = {
        nameKey: prayerKey,
        name: PRAYER_NAMES_MAP[prayerKey],
        time: formatTime(prayerTimeStr, false),
        zone: currentZoneName,
        // The iqamaTime property is primarily for startPrayerAnnouncement to know the *actual* iqama time.
        // For simulation, startIqamaCountdown uses `simulatedDurationSeconds`.
        iqamaTime: calculateIqamaTime(todayPrayerDataGlobal[prayerKey], iqamaOffsets[prayerKey])
    };
    
    console.log(`Simulating Iqama Countdown for ${prayerKey} for ${durationSeconds} seconds...`);
    startIqamaCountdown(durationSeconds); // Pass the duration for simulation
}

/**
 * Simulates the Post-Iqama Message. (NEW, used by UI)
 */
function simulatePostIqamaMessageAction() {
    if (!debugModeEnabled) {
        showMessage("Debug Mode Off", "Please enable Debug Mode in settings to use simulation functions.");
        return;
    }
    console.log("Simulating Post-Iqama Message...");
    startPostIqamaMessage();
}

/**
 * Simulates an API Sync event and adds it to history. (NEW)
 * @param {boolean} isSuccess - True for a successful sync, false for a failed one.
 */
async function simulateApiSyncAction(isSuccess) {
    if (!debugModeEnabled) {
        showMessage("Debug Mode Off", "Please enable Debug Mode in settings to use simulation functions.");
        return;
    }
    const currentZoneCode = locationSelect.value;
    const currentZoneName = JAKIM_ZONES.find(z => z.code === currentZoneCode)?.name || 'Unknown Zone';
    const syncMethod = 'MANUAL (Simulated)';
    let status;
    let apiResult = null;

    if (isSuccess) {
        status = 'Successful';
        showMessage('Simulated Sync', `Simulated successful API sync for ${currentZoneName}.`);
    } else {
        status = 'Failed';
        // Mock a detailed error message for simulation
        apiResult = {
            error: "Simulated API Error",
            message: "The simulated API call encountered an issue. Possible causes: network problem, invalid zone code, or API server is down.",
            details: {
                statusCode: 500,
                errorCode: "SIM_ERR_001",
                timestamp: new Date().toISOString()
            },
            requestUrl: `${API_BASE_URL}&zone=${currentZoneCode}&period=month&year=${new Date().getFullYear()}&month=1`
        };
        showMessage('Simulated Sync', `Simulated failed API sync for ${currentZoneName}. Check sync history for details.`);
    }

    await addSyncRecord(currentZoneCode, syncMethod, status, apiResult);
    displaySyncHistory(); // Refresh the sync history modal if open
}


/**
 * Returns the display to the Main Display. (NEW, used by UI)
 */
function returnToMainAction() {
    if (!debugModeEnabled) {
        showMessage("Debug Mode Off", "Please enable Debug Mode in settings to use simulation functions.");
        return;
    }
    console.log("Returning to Main Display...");
    returnToMainDisplay();
}

/**
 * Resets the announced prayer flags for the current day. (NEW, used by UI)
 */
function resetAnnouncedPrayersAction() {
    if (!debugModeEnabled) {
        showMessage("Debug Mode Off", "Please enable Debug Mode in settings to use simulation functions.");
        return;
    }
    const today = new Date().toISOString().slice(0, 10);
    announcedPrayersToday = {
        date: today,
        fajr: false,
        dhuhr: false,
        asr: false,
        maghrib: false,
        isha: false
    };
    console.log("Announced prayers for today have been reset.");
    showMessage("Debug Action", "Announced prayers for today have been reset.<br>You can now re-trigger prayer announcements.");
}


// Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
    // Attempt to apply theme from localStorage immediately for quick visual load
    // This is temporary until IndexedDB is fully loaded.
    const initialLocalStorageTheme = localStorage.getItem('theme');
    if (initialLocalStorageTheme === 'light') { // Check for 'light' explicitly
        setTheme('light');
    } else {
        setTheme('dark'); // Default to dark mode or if 'dark' was saved
    }

    // Open IndexedDB first
    await openDatabase();

    // Load all other settings from IndexedDB (this will override initial localStorage theme if different)
    await loadSettings(); // This will load iqamaOffsets, use24HourFormat, autoSyncSettings, debugModeEnabled, and mosqueName

    // Populate locations dropdown and set last selected
    await populateLocationSelect();

    // Populate Iqama input fields with loaded/default offsets
    populateIqamaInputs();

    const initialLocationCode = locationSelect.value;
    const currentYear = new Date().getFullYear();
    
    // Check if prayer data exists for the initial/default zone for the current year
    const existingDataForCurrentYear = await getPrayerTimesForYear(initialLocationCode, currentYear);
    const todayFormattedForComparison = new Date().toISOString().slice(0, 10);
    const todayDataExistsInCurrentYear = existingDataForCurrentYear && existingDataForCurrentYear.find(dayData => {
        const parts = dayData.date.split('-');
        const monthNum = API_MONTH_MAP[parts[1]];
        const apiDateFormatted = `${parts[2]}-${monthNum}-${parts[0]}`;
        return apiDateFormatted === todayFormattedForComparison;
    });

    if (!todayDataExistsInCurrentYear) {
        console.log(`No prayer data for ${initialLocationCode} (${currentYear}) found. Attempting initial sync.`);
        // Proactively sync data if missing on first load
        try {
            await fetchAndStoreAllPrayerTimes(initialLocationCode, 'AUTO_INITIAL', currentYear); 
        } catch (error) {
            console.error("Initial sync failed:", error);
            // fetchAndStoreAllPrayerTimes already shows a message on failure.
            // displayPrayerTimes will also handle showing the "Data Unavailable" modal if still no data.
        }
    }

    // Always attempt to display prayer times after initial setup/sync attempt
    await displayPrayerTimes(initialLocationCode, currentYear);

    // Check and run auto sync for current year after initial display (NEW)
    checkAndRunAutoSync();

    // Handle annual sync for next year (NEW)
    handleAnnualSync();


    // Theme switch listener
    darkModeSwitch.addEventListener('change', async (event) => {
        const newTheme = event.target.checked ? 'dark' : 'light';
        setTheme(newTheme);
        await saveAllSettings(); // Save all settings, including the new theme
    });

    // Time format switch listener
    timeFormatSwitch.addEventListener('change', async (event) => {
        use24HourFormat = event.target.checked;
        await saveAllSettings(); // Save all settings
        // Re-display prayer times to update all time formats
        displayPrayerTimes(locationSelect.value, new Date().getFullYear());
    });

    // Add change listener for location select (inside Offcanvas)
    locationSelect.addEventListener('change', async (event) => {
        const selectedLocation = event.target.value;
        await saveAllSettings(); // Save selected location
        const currentYear = new Date().getFullYear();
        await displayPrayerTimes(selectedLocation, currentYear);
    });

    // Add click listener for sync button (inside Offcanvas)
    syncButton.addEventListener('click', async () => {
        const selectedLocation = locationSelect.value;
        const syncSuccess = await fetchAndStoreAllPrayerTimes(selectedLocation, 'MANUAL', new Date().getFullYear()); // Pass 'MANUAL' sync method
        if (syncSuccess) {
            await displayPrayerTimes(selectedLocation, new Date().getFullYear()); // Re-display after manual sync
        }
    });

    // Add input listeners for Iqama offset fields
    iqamaFajrInput.addEventListener('input', handleIqamaInputChange);
    iqamaDhuhrInput.addEventListener('input', handleIqamaInputChange);
    iqamaAsrInput.addEventListener('input', handleIqamaInputChange);
    iqamaMaghribInput.addEventListener('input', handleIqamaInputChange);
    iqamaIshaInput.addEventListener('input', handleIqamaInputChange);

    // Mosque Name Input Listener (NEW)
    mosqueNameInput.addEventListener('input', async (event) => {
        mosqueName = event.target.value.trim();
        await saveAllSettings(); // Save the new mosque name
        mosqueNameDisplay.textContent = mosqueName; // Update display immediately
    });

    // Auto Sync Master Switch Listener (NEW)
    autoSyncMasterSwitch.addEventListener('change', async (event) => {
        autoSyncSettings.enabled = event.target.checked;
        toggleAutoSyncScheduleOptions(); // Show/hide details based on master switch
        await saveAllSettings();
        // If enabled, immediately check if a sync is due
        if (autoSyncSettings.enabled) {
            checkAndRunAutoSync();
        }
    });

    // Auto Sync Radio and Select listeners (NEW)
    autoSyncFrequencyRadios.forEach(radio => {
        radio.addEventListener('change', async (event) => {
            autoSyncSettings.frequency = event.target.value;
            await saveAllSettings();
        });
    });
    autoSyncDaySelect.addEventListener('change', async (event) => {
        autoSyncSettings.day = parseInt(event.target.value, 10);
        await saveAllSettings();
    });
    autoSyncTimeInput.addEventListener('change', async (event) => {
        autoSyncSettings.time = event.target.value;
        await saveAllSettings();
    });

    // Event listener for showing Sync History modal (NEW)
    document.getElementById('syncHistoryModal').addEventListener('show.bs.modal', displaySyncHistory);
    syncHistorySortSelect.addEventListener('change', displaySyncHistory); // Re-display history when sort changes


    // Debug Mode Switch Listener (NEW)
    debugModeSwitch.addEventListener('change', async (event) => {
        debugModeEnabled = event.target.checked;
        await saveAllSettings();
        toggleDebugButtonsVisibility();
        // If debug mode is enabled, ensure main display updates its next prayer logic without triggering real announcements
        updateClockAndPrayerStatus(); 
    });

    // Debug Button Listeners (NEW)
    simPrayerAnnounceBtn.addEventListener('click', () => simulatePrayerAnnouncementAction(simPrayerSelect.value));
    simIqamaCountdownBtn.addEventListener('click', () => simulateIqamaCountdownAction(simPrayerSelect.value, parseInt(simIqamaDurationInput.value, 10)));
    simPostIqamaBtn.addEventListener('click', simulatePostIqamaMessageAction);
    simApiSyncSuccessBtn.addEventListener('click', () => simulateApiSyncAction(true)); // Simulate success
    simApiSyncFailBtn.addEventListener('click', () => simulateApiSyncAction(false));   // Simulate failure
    returnToMainBtn.addEventListener('click', returnToMainAction);
    resetAnnouncedPrayersBtn.addEventListener('click', resetAnnouncedPrayersAction);


    // Initial setup of display to 'main'
    showDisplay('main');
    // The main clock update loop will be started by displayPrayerTimes() after initial data fetch.
});
