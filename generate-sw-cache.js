const fs = require('fs');
const path = require('path');

// --- Configuration ---
const PROJECT_ROOT = process.cwd(); // Get the current working directory (your project root)

const PRECACHE_FOLDERS = [
    './css',
    './js',
    './images',
    './fonts',
    './audio',
];

const STATIC_FILES_TO_PRECACHE = [
    './', // Caches the root (index.html)
    './index.html',
    './manifest.json',
    './monthly-view.html',
    './monthly-view',
    // Add any other top-level static files not in a folder
];

const SW_TEMPLATE_PATH = './service-worker-template.js'; // Your SW template
const SW_OUTPUT_PATH = './service-worker.js';           // The generated SW

// --- Helper function to get all files in a directory recursively ---
function getAllFiles(dirPath, arrayOfFiles) {
    arrayOfFiles = arrayOfFiles || [];
    const files = fs.readdirSync(dirPath);

    files.forEach(function(file) {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
        } else {
            // Calculate path relative to PROJECT_ROOT
            let relativePath = path.relative(PROJECT_ROOT, fullPath);
            // Ensure forward slashes for URLs and add leading ./
            relativePath = './' + relativePath.replace(/\\/g, '/');
            arrayOfFiles.push(relativePath);
        }
    });

    return arrayOfFiles;
}

// --- Main script logic ---
let allUrlsToCache = [...STATIC_FILES_TO_PRECACHE];

PRECACHE_FOLDERS.forEach(folder => {
    // Ensure the folder path for fs.readdirSync is correct if it starts with ./
    const absoluteFolderPath = path.join(PROJECT_ROOT, folder);
    if (fs.existsSync(absoluteFolderPath)) {
        const filesInFolder = getAllFiles(absoluteFolderPath);
        allUrlsToCache = allUrlsToCache.concat(filesInFolder);
    } else {
        console.warn(`Warning: Folder not found at path: ${folder}. Skipping.`);
    }
});

// Format for JavaScript array
const urlsString = JSON.stringify(allUrlsToCache, null, 2); // Pretty print for readability

// Read the service worker template
let swContent = fs.readFileSync(SW_TEMPLATE_PATH, 'utf8');

// Replace placeholders in the template with the generated URLs and new cache name
swContent = swContent.replace('/* %%PRECACHE_URLS%% */', `const urlsToCache = ${urlsString};`);
const newCacheName = `prayer-times-cache-${Date.now()}`; // Generate a unique name based on current timestamp
swContent = swContent.replace(/const CACHE_NAME = 'prayer-times-cache-v\d+';/, `const CACHE_NAME = '${newCacheName}';`); // Regex to match current vX pattern

// Write the new service worker file
fs.writeFileSync(SW_OUTPUT_PATH, swContent);

console.log('Service worker generated successfully with the following URLs:');
console.log(allUrlsToCache);
console.log(`New cache name: ${newCacheName}`);