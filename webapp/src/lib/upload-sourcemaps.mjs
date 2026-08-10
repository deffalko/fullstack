import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { config } from 'dotenv'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Загружаем .env из корня webapp (папка выше src)
config({ path: path.join(__dirname, '../../.env') })

async function uploadSourcemaps() {
  console.log('🚀 Uploading sourcemaps to Rollbar...')

  // const accessToken = process.env.VITE_WEBAPP_ROLLBAR_ACCESS_TOKEN
  const accessToken = process.env.WEBAPP_ROLLBAR_ACCESS_TOKEN

  if (!accessToken) {
    console.error('❌ VITE_WEBAPP_ROLLBAR_ACCESS_TOKEN is not set')
    console.log('💡 Check your .env file at:', path.join(__dirname, '../../.env'))
    process.exit(1)
  }

  const distPath = path.join(__dirname, '../../dist')
  const assetsPath = path.join(distPath, 'assets')

  let jsFiles = []
  let mapFiles = []
  let basePath = ''

  if (fs.existsSync(assetsPath)) {
    console.log('📁 Found dist/assets/ folder')
    const files = fs.readdirSync(assetsPath)
    jsFiles = files.filter((f) => f.endsWith('.js') && !f.endsWith('.map'))
    mapFiles = files.filter((f) => f.endsWith('.map'))
    basePath = assetsPath
  } else if (fs.existsSync(distPath)) {
    console.log('📁 Found dist/ folder')
    const files = fs.readdirSync(distPath)
    jsFiles = files.filter((f) => f.endsWith('.js') && !f.endsWith('.map'))
    mapFiles = files.filter((f) => f.endsWith('.map'))
    basePath = distPath
  } else {
    console.error('❌ No dist/ folder found at:', distPath)
    process.exit(1)
  }

  if (jsFiles.length === 0) {
    console.warn('⚠️ No JS files found')
    return
  }

  console.log(`📦 Found ${jsFiles.length} JS files`)
  console.log(`📦 Found ${mapFiles.length} map files`)

  const version = process.env.SOURCE_VERSION || '1.0.0'
  const appUrl = process.env.VITE_WEBAPP_URL || 'http://localhost:5173'

  console.log(`📌 Version: ${version}`)
  console.log(`📌 App URL: ${appUrl}`)

  let successCount = 0
  let failCount = 0

  for (const jsFile of jsFiles) {
    const mapFile = jsFile + '.map'
    const mapPath = path.join(basePath, mapFile)

    if (!fs.existsSync(mapPath)) {
      console.warn(`⚠️ No sourcemap for ${jsFile}`)
      continue
    }

    const mapContent = fs.readFileSync(mapPath, 'utf8')
    const minifiedUrl = `${appUrl}/assets/${jsFile}`

    console.log(`⬆️ Uploading ${jsFile} (${Math.round(mapContent.length / 1024)}KB)...`)

    const formData = new FormData()
    formData.append('access_token', accessToken)
    formData.append('version', version)
    formData.append('minified_url', minifiedUrl)
    formData.append('source_map', new Blob([mapContent], { type: 'application/json' }), mapFile)

    try {
      const response = await fetch('https://api.rollbar.com/api/1/sourcemap', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        console.log(`✅ Uploaded ${jsFile}`, data)
        successCount++
      } else {
        const error = await response.text()
        console.error(`❌ Failed ${jsFile}:`, error)
        failCount++
      }
    } catch (error) {
      console.error(`❌ Error ${jsFile}:`, error.message)
      failCount++
    }
  }

  console.log(`\n📊 Summary: ${successCount} uploaded, ${failCount} failed`)

  if (successCount > 0) {
    console.log('\n✅ Sourcemaps uploaded successfully!')
    console.log('📋 Check in Rollbar: Settings → Source Maps')
  }
}

uploadSourcemaps()
