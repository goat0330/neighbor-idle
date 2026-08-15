import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const projectConfigPath = path.join(appRoot, 'project.config.json')
const projectConfig = JSON.parse(fs.readFileSync(projectConfigPath, 'utf8'))
const expectedRoot = 'dist-weapp'
const configuredRoot = String(projectConfig.miniprogramRoot || '').replaceAll('\\', '/').replace(/\/$/, '')

if (configuredRoot !== expectedRoot) {
  throw new Error(`project.config.json miniprogramRoot must be ${expectedRoot}/, got ${projectConfig.miniprogramRoot || '(empty)'}`)
}

const outputRoot = path.join(appRoot, expectedRoot)
const legacyRoot = path.join(appRoot, 'dist')
if (fs.existsSync(legacyRoot)) {
  throw new Error('legacy dist/ exists; remove or archive it before opening the WeChat project')
}

const appJsonPath = path.join(outputRoot, 'app.json')
if (!fs.existsSync(appJsonPath)) throw new Error(`missing ${path.relative(appRoot, appJsonPath)}`)
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'))
const requiredFiles = ['app.js', 'app.json', 'base.wxml']

for (const relative of requiredFiles) {
  if (!fs.existsSync(path.join(outputRoot, relative))) throw new Error(`missing dist-weapp/${relative}`)
}

for (const page of appJson.pages || []) {
  for (const extension of ['.js', '.json', '.wxml']) {
    const relative = `${page}${extension}`
    if (!fs.existsSync(path.join(outputRoot, relative))) throw new Error(`missing dist-weapp/${relative}`)
  }
}

console.log(`weapp output verified: ${appJson.pages.length} pages in ${expectedRoot}/`)
