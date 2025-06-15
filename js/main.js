// js/main.js

// Constants for IndexedDB
const DB_NAME = 'PrayerTimesDB';
const DB_VERSION = 1;
const STORE_NAME = 'prayerTimesStore'; // Stores data for each location + year

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
    { code: 'SBH04', name: 'Sabah: Bandar Tawau, Balong, Merotai, Kalabakan, Bahagian Tawau (Barat)' },
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
const messageModal = new bootstrap.Modal(document.getElementById('messageModal'));
const modalMessageContent = document.getElementById('modalMessageContent');
const syncButtonSpinner = syncButton.querySelector('.spinner-border');

// New elements for display
const currentTimeDisplay = document.getElementById('currentTime');
const currentMiladiDateDisplay = document.getElementById('currentMiladiDate');
const currentHijriDateDisplay = document.getElementById('currentHijriDate');
const selectedLocationDisplay = document.getElementById('selectedLocationDisplay');


let db; // IndexedDB instance

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
        syncButton.innerHTML = `<span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span> Loading...`;
    } else {
        syncButtonSpinner.classList.add('d-none');
        syncButton.disabled = false;
        syncButton.innerHTML = `Sync This Year's Prayer Times`;
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

        // --- START DEBUGGING LOG ---
        console.group(`API Response for ${zone} - ${year}/${month}`);
        console.log('API URL:', url);
        console.log('Full API Response:', data);
        // Corrected condition check for data.status
        const conditionResult = data.status === 'OK!' && Array.isArray(data.prayerTime) && data.prayerTime.length > 0;
        console.log('Condition (status === "OK!" && isArray && length > 0) result:', conditionResult);
        console.groupEnd();
        // --- END DEBUGGING LOG ---

        // Check if data.prayerTime exists and is an array, and if it has actual data
        if (conditionResult) { // Use the pre-evaluated condition result
            console.log(`Successfully fetched prayer data for ${zone} - ${year}/${month}`);
            return data.prayerTime;
        } else {
            console.warn(`No prayer data found for ${zone} - ${year}/${month}: API returned status '${data.status}' or empty prayerTime array. This might indicate an issue with the API data for this period.`);
            return []; // Return empty array if no valid data is found
        }
    } catch (error) {
        console.error(`Error fetching prayer times for ${zone} - ${year}/${month}:`, error);
        // If there's an error, return an empty array to prevent breaking the overall sync
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
        // Not critical, can proceed
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
                // Convert "DD-Mon-YYYY" to a comparable date format
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
 * Populates the location select dropdown with JAKIM zones.
 */
function populateLocationSelect() {
    locationSelect.innerHTML = ''; // Clear existing options
    JAKIM_ZONES.forEach(zone => {
        const option = document.createElement('option');
        option.value = zone.code;
        option.textContent = zone.name;
        locationSelect.appendChild(option);
    });
}

/**
 * Displays prayer times in the table, focusing only on today's data.
 * @param {string} locationCode - The JAKIM zone code.
 * @param {number} year - The year to display.
 */
async function displayPrayerTimes(locationCode, year) {
    prayerTimesTableBody.innerHTML = '<tr><td colspan="8" class="text-center text-muted py-4">Loading today\'s prayer times...</td></tr>';
    const data = await getPrayerTimesForYear(locationCode, year);

    if (!data || data.length === 0) {
        prayerTimesTableBody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">No prayer times found for today for this location and year. Please click 'Sync' to fetch.</td></tr>`;
        return;
    }

    const today = new Date();
    // Format for comparison "DD-Mon-YYYY" e.g., "15-Jun-2025"
    const todayFormatted = `${today.getDate().toString().padStart(2, '0')}-${today.toLocaleString('en-US', { month: 'short' })}-${today.getFullYear()}`;

    const todayPrayerData = data.find(dayData => dayData.date === todayFormatted);

    prayerTimesTableBody.innerHTML = ''; // Clear existing rows

    if (todayPrayerData) {
        const row = document.createElement('tr');
        // No date, hijri, day columns as per new layout
        row.innerHTML = `
            <td>${todayPrayerData.imsak}</td>
            <td>${todayPrayerData.fajr}</td>
            <td>${todayPrayerData.syuruk}</td>
            <td>${todayPrayerData.dhuha || '--:--'}</td>
            <td>${todayPrayerData.dhuhr}</td>
            <td>${todayPrayerData.asr}</td>
            <td>${todayPrayerData.maghrib}</td>
            <td>${todayPrayerData.isha}</td>
        `;
        prayerTimesTableBody.appendChild(row);

        // Update current dates and location display
        const locationName = JAKIM_ZONES.find(z => z.code === locationCode)?.name || locationCode;
        selectedLocationDisplay.textContent = locationName;
        currentMiladiDateDisplay.textContent = today.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
        currentHijriDateDisplay.textContent = todayPrayerData.hijri; // Use hijri from API response
    } else {
        prayerTimesTableBody.innerHTML = `<tr><td colspan="8" class="text-center text-muted py-4">Today's prayer times are not available for this location or year. Please sync or try again later.</td></tr>`;
        currentHijriDateDisplay.textContent = ''; // Clear if not available
    }
}


/**
 * Updates the current time displayed on the page.
 */
function updateClock() {
    const now = new Date();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    currentTimeDisplay.textContent = `${hours}:${minutes}:${seconds}`;
}


// Event Listeners
document.addEventListener('DOMContentLoaded', async () => {
    // Open IndexedDB first
    await openDatabase();

    // Populate locations dropdown
    populateLocationSelect();

    // Initial display based on default selected location and current year
    const initialLocationCode = locationSelect.value;
    const currentYear = new Date().getFullYear();
    displayPrayerTimes(initialLocationCode, currentYear);

    // Update clock every second
    setInterval(updateClock, 1000);
    updateClock(); // Call immediately to avoid initial delay

    // Add change listener for location select
    locationSelect.addEventListener('change', (event) => {
        const selectedLocation = event.target.value;
        const currentYear = new Date().getFullYear();
        displayPrayerTimes(selectedLocation, currentYear);
    });

    // Add click listener for sync button
    syncButton.addEventListener('click', () => {
        const selectedLocation = locationSelect.value;
        fetchAndStoreAllPrayerTimes(selectedLocation);
    });
});
