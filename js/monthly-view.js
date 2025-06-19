// js/monthly-view.js

// Constants for IndexedDB - duplicated from main.js for self-containment
const DB_NAME = 'PrayerTimesDB';
const DB_VERSION = 4;
const STORE_NAME = 'prayerTimesStore'; // Stores data for each location + year
const SETTINGS_STORE_NAME = 'appSettingsStore'; // Re-using for settings like use24HourFormat

let db; // IndexedDB instance
let use24HourFormat = true; // Default to 24-hour, will be loaded from settings

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

const API_MONTH_MAP = {
    'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
    'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
};

// DOM Elements
const zoneSelect = document.getElementById('zoneSelect');
const monthlyPrayerTimesTableBody = document.getElementById('monthlyPrayerTimesTableBody');
const currentMonthYearDisplay = document.getElementById('currentMonthYear');
const prevMonthBtn = document.getElementById('prevMonthBtn');
const nextMonthBtn = document.getElementById('nextMonthBtn');
const messageModal = new bootstrap.Modal(document.getElementById('messageModal')); // Get message modal
const modalMessageContent = document.getElementById('modalMessageContent'); // Get modal message content

// Current date being displayed (defaults to today's month/year)
let currentDisplayDate = new Date();


/**
 * Helper function to format a time string (HH:MM:SS or HH:MM) to the user's preferred format.
 * Duplicated from main.js for self-containment.
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
 * Duplicated from main.js for self-containment.
 * @param {string} title - The title of the modal.
 * @param {string} message - The content message of the modal.
 */
function showMessage(title, message) {
    document.getElementById('messageModalLabel').textContent = title;
    modalMessageContent.innerHTML = message; // Use innerHTML to allow for basic formatting if needed
    messageModal.show();
}

/**
 * Opens and initializes the IndexedDB database.
 * Duplicated from main.js for self-containment.
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
            }
            // Create object store for app settings if it doesn't exist
            if (!db.objectStoreNames.contains(SETTINGS_STORE_NAME)) {
                db.createObjectStore(SETTINGS_STORE_NAME, { keyPath: 'name' });
            }
            // Note: Migration logic from localStorage is in main.js, no need to duplicate here
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(db);
        };

        request.onerror = (event) => {
            console.error('IndexedDB error:', event.target.errorCode);
            reject(event.target.error);
        };
    });
}

/**
 * Loads a single setting from IndexedDB.
 * Duplicated from main.js for self-containment.
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
        console.error(`Error loading setting '${name}' from IndexedDB:`, error);
        return undefined;
    }
}

/**
 * Retrieves prayer times data for a specific location and year from IndexedDB.
 * Duplicated from main.js for self-containment.
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
        return null;
    }
}

/**
 * Retrieves all unique zone codes that have synced data for the current year in IndexedDB.
 * @returns {Promise<Set<string>>} A Set of synced zone codes.
 */
async function getSyncedZoneCodesForCurrentYear() {
    const currentYear = new Date().getFullYear();
    const syncedZoneCodes = new Set();
    try {
        const transaction = db.transaction([STORE_NAME], 'readonly');
        const store = transaction.objectStore(STORE_NAME);
        const request = store.openCursor();

        await new Promise((resolve, reject) => {
            request.onsuccess = (event) => {
                const cursor = event.target.result;
                if (cursor) {
                    const [zoneCode, year] = cursor.key.split('_');
                    if (parseInt(year, 10) === currentYear) {
                        syncedZoneCodes.add(zoneCode);
                    }
                    cursor.continue();
                } else {
                    resolve();
                }
            };
            request.onerror = (event) => reject(event.target.error);
        });
    } catch (error) {
        console.error('Error getting synced zone codes:', error);
    }
    return syncedZoneCodes;
}


/**
 * Populates the zone select dropdown with JAKIM zones that have synced data.
 */
async function populateZoneSelect() {
    zoneSelect.innerHTML = ''; // Clear existing options
    
    const syncedZoneCodes = await getSyncedZoneCodesForCurrentYear();
    const availableZones = JAKIM_ZONES.filter(zone => syncedZoneCodes.has(zone.code));

    // If there are no synced zones, add a disabled default option
    if (availableZones.length === 0) {
        const noSyncedZonesOption = document.createElement('option');
        noSyncedZonesOption.value = '';
        noSyncedZonesOption.textContent = 'No zones synced. Please sync from main page.';
        noSyncedZonesOption.disabled = true;
        noSyncedZonesOption.selected = true;
        zoneSelect.appendChild(noSyncedZonesOption);
    } else {
        // Add available synced zones
        availableZones.forEach(zone => {
            const option = document.createElement('option');
            option.value = zone.code;
            option.textContent = zone.name;
            zoneSelect.appendChild(option);
        });

        // Load last selected location from settings
        const savedLocation = await loadSetting('lastSelectedLocation');
        if (savedLocation && syncedZoneCodes.has(savedLocation)) {
            zoneSelect.value = savedLocation;
        } else {
            // Default to the first available synced zone
            zoneSelect.value = availableZones[0].code;
        }
    }

    // Add a special option for "Sync New Zone" always at the end
    const syncNewZoneOption = document.createElement('option');
    syncNewZoneOption.value = 'sync_new_zone';
    syncNewZoneOption.textContent = 'Sync New Zone (from Main Page)';
    zoneSelect.appendChild(syncNewZoneOption);
}

/**
 * Formats a Miladi date into "DD/MM" format.
 * @param {Date} date - The Miladi date object.
 * @returns {string} Formatted date string (e.g., "19/06").
 */
function formatMiladiDateMonthly(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    return `${day}/${month}`;
}

/**
 * Displays monthly prayer times for the selected zone and current display month/year.
 */
async function displayMonthlyPrayerTimes() {
    monthlyPrayerTimesTableBody.innerHTML = '<tr><td colspan="10" class="text-center text-muted py-4">Loading monthly prayer times...</td></tr>';
    
    const selectedZoneCode = zoneSelect.value;
    const year = currentDisplayDate.getFullYear();
    const month = currentDisplayDate.getMonth() + 1; // getMonth() is 0-indexed

    currentMonthYearDisplay.textContent = `${currentDisplayDate.toLocaleString('en-GB', { month: 'long', year: 'numeric' })}`;

    // If "Sync New Zone" or no valid zone selected, show appropriate message
    if (!selectedZoneCode || selectedZoneCode === 'sync_new_zone') {
        monthlyPrayerTimesTableBody.innerHTML = `<tr><td colspan="10" class="text-center text-info py-4">Please select a synced zone or sync a new one from the main page.</td></tr>`;
        return;
    }


    const allPrayerTimesForYear = await getPrayerTimesForYear(selectedZoneCode, year);

    if (!allPrayerTimesForYear || allPrayerTimesForYear.length === 0) {
        monthlyPrayerTimesTableBody.innerHTML = `<tr><td colspan="10" class="text-center text-danger py-4">No prayer times found for this zone and year. Please sync data from the main page.</td></tr>`;
        return;
    }

    const monthlyData = allPrayerTimesForYear.filter(dayData => {
        const parts = dayData.date.split('-'); // "DD-Mon-YYYY"
        const apiMonthNum = API_MONTH_MAP[parts[1]]; // Convert 'Mon' to 'MM'
        return parseInt(apiMonthNum, 10) === month; // Filter by the current month
    });

    if (monthlyData.length === 0) {
         monthlyPrayerTimesTableBody.innerHTML = `<tr><td colspan="10" class="text-center text-warning py-4">No data available for ${currentMonthYearDisplay.textContent}. The API might not have provided data for this month yet.</td></tr>`;
         return;
    }

    monthlyPrayerTimesTableBody.innerHTML = ''; // Clear loading message

    monthlyData.forEach(dayData => {
        const row = document.createElement('tr');

        // Convert API date "DD-Mon-YYYY" to a Date object for formatting
        const parts = dayData.date.split('-');
        const apiDateAsDateObject = new Date(parts[2], parseInt(API_MONTH_MAP[parts[1]], 10) - 1, parts[0]);
        
        // Removed .table-primary highlighting logic as per user request.

        row.innerHTML = `
            <td>${apiDateAsDateObject.toLocaleString('en-GB', { weekday: 'short' })}</td>
            <td>${formatMiladiDateMonthly(apiDateAsDateObject)}</td>
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
    // Open IndexedDB first
    await openDatabase();

    // Load time format preference for this page
    const loadedTimeFormat = await loadSetting('use24HourFormat');
    if (loadedTimeFormat !== undefined) {
        use24HourFormat = loadedTimeFormat;
    }

    // Load theme setting from IndexedDB and apply it
    const loadedTheme = await loadSetting('theme');
    const bodyElement = document.body;
    const tableElement = document.querySelector('.table');

    if (loadedTheme === 'dark') {
        bodyElement.classList.add('dark-mode');
        if (tableElement) {
            tableElement.classList.add('table-dark');
        }
    } else {
        bodyElement.classList.remove('dark-mode');
        if (tableElement) {
            tableElement.classList.remove('table-dark');
        }
    }

    await populateZoneSelect();
    await displayMonthlyPrayerTimes();

    zoneSelect.addEventListener('change', (event) => {
        if (event.target.value === 'sync_new_zone') {
            showMessage(
                'Sync New Zone',
                'Please sync new zones from the main application page (Settings > Sync Now).<br><br>Returning to main page.'
            );
            // After message, redirect:
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 3000); // Redirect after 3 seconds
            
            // To prevent the dropdown from permanently showing "Sync New Zone",
            // we re-populate the select and attempt to re-select the previously selected *valid* zone.
            // This is handled better by simply redirecting and letting the main page handle itself.
            // populateZoneSelect(); // No longer needed here if redirecting
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
