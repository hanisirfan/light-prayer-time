// js/main.js

// Constants for IndexedDB
const DB_NAME = 'PrayerTimesDB';
const DB_VERSION = 1;
const STORE_NAME = 'prayerTimesStore'; // Stores data for each location + year
const SETTINGS_KEY = 'prayerTimeSettings'; // Key for saving settings in localStorage

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

// DOM Elements
const locationSelect = document.getElementById('locationSelect');
const syncButton = document.getElementById('syncButton');
const prayerTimesTableBody = document.getElementById('prayerTimesTableBody');
const prayerTimesTable = document.getElementById('prayerTimesTable'); // Get the table element
const iqamaTimesTableBody = document.getElementById('iqamaTimesTableBody'); // Get the iqama table footer
const messageModal = new bootstrap.Modal(document.getElementById('messageModal'));
const modalMessageContent = document.getElementById('modalMessageContent');
const syncButtonSpinner = syncButton.querySelector('.spinner-border');

// Main display elements
const currentTimeDisplay = document.getElementById('currentTime');
const currentMiladiDateDisplay = document.getElementById('currentMiladiDate');
const currentHijriDateDisplay = document.getElementById('currentHijriDate');
const selectedLocationDisplay = document.getElementById('selectedLocationDisplay');
const nextPrayerNameDisplay = document.getElementById('nextPrayerName');
const nextPrayerTimeDisplay = document.getElementById('nextPrayerTime');
const countdownToNextPrayerDisplay = document.getElementById('countdownToNextPrayer');
const darkModeSwitch = document.getElementById('darkModeSwitch');
const timeFormatSwitch = document.getElementById('timeFormatSwitch'); // NEW: Time format switch
const body = document.body;

// Iqama input fields
const iqamaFajrInput = document.getElementById('iqamaFajr');
const iqamaDhuhrInput = document.getElementById('iqamaDhuhr');
const iqamaAsrInput = document.getElementById('iqamaAsr');
const iqamaMaghribInput = document.getElementById('iqamaMaghrib');
const iqamaIshaInput = document.getElementById('iqamaIsha');

let db; // IndexedDB instance
let todayPrayerDataGlobal = null; // Store today's prayer data globally for clock updates
let nextPrayerTimeout; // To clear previous countdown timeouts

// Default Iqama offsets in minutes
let iqamaOffsets = {
    fajr: 10,
    dhuhr: 10,
    asr: 10,
    maghrib: 5,
    isha: 10
};

// Default time format (false = 12-hour, true = 24-hour)
let use24HourFormat = true; // Default to 24-hour as requested by implicit removal of seconds

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
    const [hours, minutes, seconds] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, seconds || 0, 0); // Use 0 for seconds if not present

    const options = {
        hour: '2-digit',
        minute: '2-digit',
        hour12: !use24HourFormat // Set hour12 based on user preference
    };
    if (includeSeconds) {
        options.second = '2-digit';
    }

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
        syncButton.innerHTML = `Sync`;
    }
}

/**
 * Sets the theme (dark or light mode).
 * @param {string} mode - 'dark' or 'light'.
 */
function setTheme(mode) {
    if (mode === 'dark') {
        body.classList.add('dark-mode');
        prayerTimesTable.classList.add('table-dark'); // Add table-dark class
        localStorage.setItem('theme', 'dark');
        darkModeSwitch.checked = true;
    } else {
        body.classList.remove('dark-mode');
        prayerTimesTable.classList.remove('table-dark'); // Remove table-dark class
        localStorage.setItem('theme', 'light');
        darkModeSwitch.checked = false;
    }
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
            // Create an object store to hold prayer times data.
            // The key path is 'id' which will be 'locationCode_year'
            db.createObjectStore(STORE_NAME, { keyPath: 'id' });
            console.log('IndexedDB upgraded: object store created.');
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
        showMessage('Error', 'Failed to retrieve prayer times from local database.');
        return null;
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
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Check if data.prayerTime exists and is an array, and if it has actual data
        if (data.status === 'OK!' && Array.isArray(data.prayerTime) && data.prayerTime.length > 0) {
            console.log(`Successfully fetched prayer data for ${zone} - ${year}/${month}`);
            return data.prayerTime;
        } else {
            console.warn(`No prayer data found for ${zone} - ${year}/${month}: API returned status '${data.status}' or empty prayerTime array. This might indicate an issue with the API data for this period.`);
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
 */
async function fetchAndStoreAllPrayerTimes(locationCode) {
    showLoading(true);
    const currentYear = new Date().getFullYear();
    let allPrayerTimes = [];
    let failedMonths = [];

    // Clear existing data for the selected location and year before syncing
    try {
        const transaction = db.transaction([STORE_NAME], 'readwrite');
        const store = transaction.objectStore(STORE_NAME);
        const idToDelete = `${locationCode}_${currentYear}`;
        await new Promise((resolve, reject) => {
            const request = store.delete(idToDelete);
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
        console.log(`Cleared existing data for ${locationCode} (${currentYear}) from IndexedDB.`);
    } catch (error) {
        console.error('Error clearing old data from IndexedDB:', error);
    }

    try {
        for (let month = 1; month <= 12; month++) {
            const monthlyData = await fetchPrayerTimesForMonth(locationCode, currentYear, month);
            if (monthlyData.length > 0) {
                allPrayerTimes = allPrayerTimes.concat(monthlyData);
            } else {
                failedMonths.push(month);
            }
        }

        if (allPrayerTimes.length > 0) {
            // Sort by date to ensure correct order
            allPrayerTimes.sort((a, b) => {
                const parseDate = (dateStr) => {
                    const parts = dateStr.split('-');
                    const monthMap = {
                        'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
                        'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
                    };
                    return new Date(parts[2], monthMap[parts[1]], parts[0]);
                };
                return parseDate(a.date) - parseDate(b.date);
            });

            await savePrayerTimes(locationCode, currentYear, allPrayerTimes);

            let message = `Prayer times for ${JAKIM_ZONES.find(z => z.code === locationCode).name} for ${currentYear} have been synchronized successfully.`;
            if (failedMonths.length > 0) {
                message += `<br> <span class="text-warning">Warning: Could not fetch data for month(s): ${failedMonths.join(', ')}. The API might not have data for these months yet.</span>`;
            }
            showMessage('Sync Complete', message);
            displayPrayerTimes(locationCode, currentYear); // Re-display after sync
        } else {
            showMessage('Sync Failed', 'Could not fetch any prayer times for the selected location and year. The API might not have data available for the current year yet, or there was an issue with the fetch. Please try again later.');
        }

    } catch (error) {
        console.error('Error during full year sync:', error);
        showMessage('Error', `An error occurred during synchronization: ${error.message}. Please check your internet connection and try again.`);
    } finally {
        showLoading(false);
    }
}

/**
 * Populates the location select dropdown with JAKIM zones and loads last selected.
 */
function populateLocationSelect() {
    locationSelect.innerHTML = ''; // Clear existing options
    JAKIM_ZONES.forEach(zone => {
        const option = document.createElement('option');
        option.value = zone.code;
        option.textContent = zone.name;
        locationSelect.appendChild(option);
    });

    // Load last selected location
    const savedLocation = localStorage.getItem('lastSelectedLocation');
    if (savedLocation && JAKIM_ZONES.some(zone => zone.code === savedLocation)) {
        locationSelect.value = savedLocation;
    } else {
        locationSelect.value = JAKIM_ZONES[0].code; // Default to the first zone
    }

    // Set initial selected location display
    selectedLocationDisplay.textContent = JAKIM_ZONES.find(z => z.code === locationSelect.value)?.name || 'Select Location...';
}

/**
 * Formats a Miladi date into "DD Mon YYYY Miladi" format.
 * @param {Date} date - The Miladi date object.
 * @returns {string} Formatted date string.
 */
function formatMiladiDate(date) {
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return date.toLocaleDateString('en-GB', options) + ' Miladi';
}

/**
 * Formats a Hijri date string from "YYYY-MM-DD" to "DD MonthName YYYY Hijri".
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
    return formatTime(`${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:00`);
}

/**
 * Displays prayer times in the table, focusing only on today's data.
 * Also updates current date, time, next prayer and countdown.
 * @param {string} locationCode - The JAKIM zone code.
 * @param {number} year - The year to display.
 */
async function displayPrayerTimes(locationCode, year) {
    prayerTimesTableBody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-4">Loading today\'s prayer times...</td></tr>';
    iqamaTimesTableBody.innerHTML = '<tr><td colspan="8" class="text-center">Loading Iqama times...</td></tr>';
    
    // Clear previous countdown if any
    if (nextPrayerTimeout) {
        clearTimeout(nextPrayerTimeout);
    }

    const data = await getPrayerTimesForYear(locationCode, year);

    // Update current location display regardless of data availability
    selectedLocationDisplay.textContent = JAKIM_ZONES.find(z => z.code === locationCode)?.name || locationCode;

    const today = new Date();
    const todayFormattedForComparison = today.toISOString().slice(0, 10); // YYYY-MM-DD

    let todayData = null;
    if (data && data.length > 0) {
        todayData = data.find(dayData => {
            const parts = dayData.date.split('-'); // e.g., "01-Jan-2025"
            const monthMap = {
                'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
                'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
            };
            const apiDateFormatted = `${parts[2]}-${monthMap[parts[1]]}-${parts[0]}`; // Convert to YYYY-MM-DD
            return apiDateFormatted === todayFormattedForComparison;
        });
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

        // Immediately update clock and prayer times after displaying data
        updateClockAndPrayerStatus();

    } else {
        prayerTimesTableBody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">Today's prayer times are not available for this location or year. Please sync or try again later.</td></tr>`;
        iqamaTimesTableBody.innerHTML = '<tr><td colspan="8" class="text-center text-muted">Iqama times not available.</td></tr>';
        currentMiladiDateDisplay.textContent = formatMiladiDate(today);
        currentHijriDateDisplay.textContent = '---';
        nextPrayerNameDisplay.textContent = 'N/A';
        nextPrayerTimeDisplay.textContent = '---';
        countdownToNextPrayerDisplay.textContent = '---';
        todayPrayerDataGlobal = null;
    }
}

/**
 * Updates the current time, and determines/displays the next prayer time and its countdown.
 */
function updateClockAndPrayerStatus() {
    const now = new Date();
    // Current time display always includes seconds
    currentTimeDisplay.textContent = formatTime(`${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`, true);

    if (!todayPrayerDataGlobal) {
        nextPrayerNameDisplay.textContent = 'No Data';
        nextPrayerTimeDisplay.textContent = '---';
        countdownToNextPrayerDisplay.textContent = '---';
        nextPrayerTimeout = setTimeout(updateClockAndPrayerStatus, 1000);
        return;
    }

    // Define prayer keys and names for both standard prayers and Iqama
    const standardPrayerKeys = ['imsak', 'fajr', 'syuruk', 'dhuha', 'dhuhr', 'asr', 'maghrib', 'isha'];
    const mainPrayerKeysForIqama = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha']; // Only these have Iqama
    const prayerNamesMap = {
        'imsak': 'Imsak', 'fajr': 'Fajr', 'syuruk': 'Syuruk', 'dhuha': 'Dhuha',
        'dhuhr': 'Dhuhr', 'asr': 'Asr', 'maghrib': 'Maghrib', 'isha': 'Isha'
    };

    let allEventsForToday = [];

    // Add standard prayer times
    for (const key of standardPrayerKeys) {
        const timeStr = todayPrayerDataGlobal[key];
        if (timeStr && timeStr.trim() !== '--:--') {
            const [pHours, pMinutes] = timeStr.split(':').map(Number);
            allEventsForToday.push({
                name: prayerNamesMap[key],
                timeStr: formatTime(timeStr), // Format to user's preference (HH:MM)
                dateTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), pHours, pMinutes, 0)
            });
        }
    }

    // Add Iqama times for main prayers
    for (const key of mainPrayerKeysForIqama) {
        const prayerTimeStr = todayPrayerDataGlobal[key];
        const offset = iqamaOffsets[key];
        if (prayerTimeStr && prayerTimeStr.trim() !== '--:--' && offset !== undefined) {
            const iqamaTimeStrRaw = calculateIqamaTime(prayerTimeStr, offset); // This returns HH:MM string from previous logic
            const [iHours, iMinutes] = iqamaTimeStrRaw.split(':').map(Number);
            allEventsForToday.push({
                name: `Iqama ${prayerNamesMap[key]}`, // Name for Iqama
                timeStr: formatTime(iqamaTimeStrRaw), // Format to user's preference (HH:MM)
                dateTime: new Date(now.getFullYear(), now.getMonth(), now.getDate(), iHours, iMinutes, 0)
            });
        }
    }

    // Sort all events chronologically
    allEventsForToday.sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());

    let nextEventFound = false;
    let nextEventName = '';
    let nextEventTime = '';
    let nextEventDateTime = null;

    // Find the next upcoming event (prayer or iqama) from today's events
    for (const event of allEventsForToday) {
        if (event.dateTime > now) {
            nextEventName = event.name;
            nextEventTime = event.timeStr;
            nextEventDateTime = event.dateTime;
            nextEventFound = true;
            break;
        }
    }

    // If no event found for today (all passed), check Fajr for tomorrow
    if (!nextEventFound) {
        const tomorrow = new Date(now);
        tomorrow.setDate(now.getDate() + 1);
        const tomorrowFormattedForComparison = tomorrow.toISOString().slice(0, 10);

        getPrayerTimesForYear(locationSelect.value, tomorrow.getFullYear()).then(tomorrowDataAll => {
            let tomorrowFajrData = null;
            if (tomorrowDataAll && tomorrowDataAll.length > 0) {
                 tomorrowFajrData = tomorrowDataAll.find(d => {
                    const parts = d.date.split('-');
                    const monthMap = {
                        'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
                        'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
                    };
                    const apiDateFormatted = `${parts[2]}-${monthMap[parts[1]]}-${parts[0]}`;
                    return apiDateFormatted === tomorrowFormattedForComparison;
                });
            }

            if (tomorrowFajrData && tomorrowFajrData.fajr && tomorrowFajrData.fajr.trim() !== '--:--') {
                const [fHours, fMinutes] = tomorrowFajrData.fajr.split(':').map(Number);
                nextEventName = 'Fajr (Tomorrow)';
                nextEventTime = formatTime(tomorrowFajrData.fajr); // Format to user's preference (HH:MM)
                nextEventDateTime = new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), fHours, fMinutes, 0);
                updateNextPrayerDisplay(nextEventName, nextEventTime, nextEventDateTime, now);
            } else {
                nextPrayerNameDisplay.textContent = 'No Next Prayer Data';
                nextPrayerTimeDisplay.textContent = '---';
                countdownToNextPrayerDisplay.textContent = '---';
            }
            nextPrayerTimeout = setTimeout(updateClockAndPrayerStatus, 1000);
        }).catch(error => {
            console.error("Error fetching tomorrow's data:", error);
            nextPrayerNameDisplay.textContent = 'Error Loading Next Prayer';
            nextPrayerTimeDisplay.textContent = '---';
            countdownToNextPrayerDisplay.textContent = '---';
            nextPrayerTimeout = setTimeout(updateClockAndPrayerStatus, 1000);
        });
    } else {
        updateNextPrayerDisplay(nextEventName, nextEventTime, nextEventDateTime, now);
        nextPrayerTimeout = setTimeout(updateClockAndPrayerStatus, 1000);
    }
}

/**
 * Updates the display for the next prayer time and countdown.
 * @param {string} name
 * @param {string} time
 * @param {Date} dateTimeObj
 * @param {Date} currentTimeObj
 */
function updateNextPrayerDisplay(name, time, dateTimeObj, currentTimeObj) {
    nextPrayerNameDisplay.textContent = `Next: ${name}`;
    nextPrayerTimeDisplay.textContent = time; // This 'time' is already formatted HH:MM

    const diffMs = dateTimeObj.getTime() - currentTimeObj.getTime();
    if (diffMs < 0) {
        countdownToNextPrayerDisplay.textContent = 'Passed';
        clearTimeout(nextPrayerTimeout);
        nextPrayerTimeout = setTimeout(updateClockAndPrayerStatus, 100);
    } else {
        const totalSeconds = Math.floor(diffMs / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;

        countdownToNextPrayerDisplay.textContent =
            `${hours.toString().padStart(2, '0')}:` +
            `${minutes.toString().padStart(2, '0')}:` +
            `${seconds.toString().padStart(2, '0')}`;
    }
}

/**
 * Loads settings (Iqama offsets, time format) from localStorage.
 */
function loadSettings() {
    const savedSettings = localStorage.getItem(SETTINGS_KEY);
    if (savedSettings) {
        try {
            const parsedSettings = JSON.parse(savedSettings);
            if (parsedSettings.iqamaOffsets) {
                iqamaOffsets = { ...iqamaOffsets, ...parsedSettings.iqamaOffsets };
            }
            // Load time format preference, default to true (24H) if not set
            use24HourFormat = parsedSettings.use24HourFormat !== undefined ? parsedSettings.use24HourFormat : true;
            timeFormatSwitch.checked = use24HourFormat; // Update the UI switch
        } catch (e) {
            console.error("Error parsing saved settings from localStorage", e);
        }
    } else {
        // If no settings saved, ensure switch matches the default
        timeFormatSwitch.checked = use24HourFormat;
    }
}

/**
 * Saves settings (Iqama offsets, time format) to localStorage.
 */
function saveSettings() {
    const settingsToSave = {
        iqamaOffsets: iqamaOffsets,
        use24HourFormat: use24HourFormat
    };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settingsToSave));
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
        saveSettings(); // Save all settings
        // Re-display prayer times to update Iqama row and next prayer countdown
        displayPrayerTimes(locationSelect.value, new Date().getFullYear());
    } else {
        // Revert to last valid value or show error
        input.value = iqamaOffsets[prayerKey];
        showMessage('Invalid Input', 'Please enter a number between 0 and 60 for Iqama offset.');
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
    // Open IndexedDB first
    await openDatabase();

    // Load all saved settings (theme, time format, iqama offsets)
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'light') {
        setTheme('light');
    } else {
        setTheme('dark'); // Default to dark mode or if 'dark' was saved
    }
    loadSettings(); // This will load iqamaOffsets and use24HourFormat

    // Populate locations dropdown and set last selected
    populateLocationSelect();

    // Populate Iqama input fields with loaded/default offsets
    populateIqamaInputs();

    // Initial display based on loaded location and current year
    const initialLocationCode = locationSelect.value;
    const currentYear = new Date().getFullYear();
    await displayPrayerTimes(initialLocationCode, currentYear); // This call will use the loaded time format

    // Theme switch listener
    darkModeSwitch.addEventListener('change', (event) => {
        if (event.target.checked) {
            setTheme('dark');
        } else {
            setTheme('light');
        }
    });

    // NEW: Time format switch listener
    timeFormatSwitch.addEventListener('change', (event) => {
        use24HourFormat = event.target.checked;
        saveSettings(); // Save all settings
        // Re-display prayer times to update all time formats
        displayPrayerTimes(locationSelect.value, new Date().getFullYear());
        updateClockAndPrayerStatus(); // Ensure current time updates immediately
    });

    // Add change listener for location select (inside Offcanvas)
    locationSelect.addEventListener('change', async (event) => {
        const selectedLocation = event.target.value;
        localStorage.setItem('lastSelectedLocation', selectedLocation); // Save selected location
        const currentYear = new Date().getFullYear();
        await displayPrayerTimes(selectedLocation, currentYear);
    });

    // Add click listener for sync button (inside Offcanvas)
    syncButton.addEventListener('click', async () => {
        const selectedLocation = locationSelect.value;
        await fetchAndStoreAllPrayerTimes(selectedLocation);
    });

    // Add input listeners for Iqama offset fields
    iqamaFajrInput.addEventListener('input', handleIqamaInputChange);
    iqamaDhuhrInput.addEventListener('input', handleIqamaInputChange);
    iqamaAsrInput.addEventListener('input', handleIqamaInputChange);
    iqamaMaghribInput.addEventListener('input', handleIqamaInputChange);
    iqamaIshaInput.addEventListener('input', handleIqamaInputChange);

    // Start clock and prayer status updates (this will also trigger the initial countdown display)
    updateClockAndPrayerStatus();
});
