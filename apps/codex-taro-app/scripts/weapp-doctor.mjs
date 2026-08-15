import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const fail = message => {
  console.error(`[weapp-doctor] ${message}`)
  process.exit(1)
}

const projectConfigPath = path.join(appRoot, 'dist', 'weapp', 'project.config.json')
const devtoolsProjectRoot = path.dirname(projectConfigPath)
const expectedProjectRoot = path.resolve(appRoot, 'dist', 'weapp')

if (!fs.existsSync(projectConfigPath)) {
  fail(`missing DevTools project config: ${projectConfigPath}`)
}

let projectConfig
try {
  projectConfig = JSON.parse(fs.readFileSync(projectConfigPath, 'utf8'))
} catch (error) {
  fail(`cannot read ${projectConfigPath}: ${error.message}`)
}

if (projectConfig.miniprogramRoot !== './') {
  fail(`dist/weapp/project.config.json.miniprogramRoot must be ./, got ${projectConfig.miniprogramRoot || '(empty)'}`)
}

const resolvedMiniProgramRoot = path.resolve(devtoolsProjectRoot, projectConfig.miniprogramRoot)
const resolvedAppJson = path.resolve(resolvedMiniProgramRoot, 'app.json')
const expectedAppJson = path.resolve(expectedProjectRoot, 'app.json')

if (resolvedMiniProgramRoot !== expectedProjectRoot || resolvedAppJson !== expectedAppJson) {
  fail(`resolved app.json mismatch: ${resolvedAppJson}`)
}

if (!fs.existsSync(resolvedAppJson)) {
  fail(`missing resolved app.json: ${resolvedAppJson}`)
}

let appJson
try {
  appJson = JSON.parse(fs.readFileSync(resolvedAppJson, 'utf8'))
} catch (error) {
  fail(`cannot read ${resolvedAppJson}: ${error.message}`)
}

if (!Array.isArray(appJson.pages)) fail('app.json.pages must be an array')

const missingPages = appJson.pages.filter(page => {
  if (typeof page !== 'string') return true
  return !fs.existsSync(path.resolve(resolvedMiniProgramRoot, `${page}.wxml`))
})

if (missingPages.length > 0) {
  fail(`missing page WXML: ${missingPages.join(', ')}`)
}

console.log(`DevTools Project Root:\n${devtoolsProjectRoot}`)
console.log(`miniprogramRoot:\n${projectConfig.miniprogramRoot}`)
console.log(`Resolved MiniProgram Root:\n${resolvedMiniProgramRoot}`)
console.log(`Resolved app.json:\n${resolvedAppJson}`)
console.log(`Pages:\n${appJson.pages.length}/${appJson.pages.length} OK`)
