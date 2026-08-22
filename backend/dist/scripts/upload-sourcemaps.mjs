// backend/src/scripts/upload-sourcemaps.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Загружаем .env
const envPath = path.join(__dirname, '../../.env');
console.log('📁 Loading .env from:', envPath);
if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach((line) => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length) {
            process.env[key.trim()] = valueParts.join('=').trim();
        }
    });
}
console.log('🔑 ROLLBAR_SERVER_ACCESS_TOKEN:', process.env.ROLLBAR_SERVER_ACCESS_TOKEN ? '✅ Set' : '❌ Not set');
async function uploadSourcemaps() {
    console.log('🚀 Uploading backend sourcemaps to Rollbar...');
    const accessToken = process.env.ROLLBAR_SERVER_ACCESS_TOKEN;
    if (!accessToken) {
        console.error('❌ ROLLBAR_SERVER_ACCESS_TOKEN is not set');
        process.exit(1);
    }
    // ✅ Правильный путь для вашей структуры
    const distPath = path.join(__dirname, '../../dist');
    console.log('📁 Looking for dist at:', distPath);
    if (!fs.existsSync(distPath)) {
        console.error('❌ Backend dist folder not found at:', distPath);
        process.exit(1);
    }
    // Ищем все .js файлы рекурсивно
    function findJsFiles(dir) {
        const results = [];
        const items = fs.readdirSync(dir, { withFileTypes: true });
        for (const item of items) {
            const fullPath = path.join(dir, item.name);
            if (item.isDirectory()) {
                results.push(...findJsFiles(fullPath));
            }
            else if (item.name.endsWith('.js') && !item.name.endsWith('.map')) {
                results.push(fullPath);
            }
        }
        return results;
    }
    const jsFiles = findJsFiles(distPath);
    if (jsFiles.length === 0) {
        console.warn('⚠️ No JS files found in backend dist');
        return;
    }
    console.log(`📦 Found ${jsFiles.length} JS files`);
    const version = process.env.SOURCE_VERSION || '1.0.0';
    const appUrl = process.env.WEBAPP_URL || 'http://localhost:3000';
    console.log(`📌 Version: ${version}`);
    console.log(`📌 App URL: ${appUrl}`);
    let successCount = 0;
    let failCount = 0;
    for (const jsFilePath of jsFiles) {
        const jsFile = path.basename(jsFilePath);
        const mapFile = jsFile + '.map';
        const mapPath = path.join(path.dirname(jsFilePath), mapFile);
        if (!fs.existsSync(mapPath)) {
            console.warn(`⚠️ No sourcemap for ${jsFile}`);
            continue;
        }
        const mapContent = fs.readFileSync(mapPath, 'utf8');
        // Для бекенда используем относительный путь
        const relativePath = path.relative(distPath, jsFilePath);
        const minifiedUrl = `${appUrl}/${relativePath}`;
        console.log(`⬆️ Uploading ${relativePath} (${Math.round(mapContent.length / 1024)}KB)...`);
        const formData = new FormData();
        formData.append('access_token', accessToken);
        formData.append('version', version);
        formData.append('minified_url', minifiedUrl);
        formData.append('source_map', new Blob([mapContent], { type: 'application/json' }), mapFile);
        try {
            const response = await fetch('https://api.rollbar.com/api/1/sourcemap', {
                method: 'POST',
                body: formData,
            });
            if (response.ok) {
                const data = await response.json();
                console.log(`✅ Uploaded ${relativePath}`, data);
                successCount++;
            }
            else {
                const error = await response.text();
                console.error(`❌ Failed ${relativePath}:`, error);
                failCount++;
            }
        }
        catch (error) {
            console.error(`❌ Error ${relativePath}:`, error.message);
            failCount++;
        }
    }
    console.log(`\n📊 Summary: ${successCount} uploaded, ${failCount} failed`);
    if (successCount > 0) {
        console.log('\n✅ Backend sourcemaps uploaded successfully!');
        console.log('📋 Check in Rollbar: Settings → Source Maps');
    }
}
uploadSourcemaps();
//# sourceMappingURL=upload-sourcemaps.mjs.map