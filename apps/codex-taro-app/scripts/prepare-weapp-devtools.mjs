import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const outputRoot = path.join(appRoot, 'dist', 'weapp')
const sourceConfigPath = path.join(appRoot, 'project.config.json')
const outputConfigPath = path.join(outputRoot, 'project.config.json')

const fail = message => {
  console.error(`[prepare-weapp-devtools] ${message}`)
  process.exit(1)
}

if (!fs.existsSync(outputRoot) || !fs.statSync(outputRoot).isDirectory()) {
  fail(`missing dist/weapp: ${outputRoot}`)
}

let sourceConfig
try {
  sourceConfig = JSON.parse(fs.readFileSync(sourceConfigPath, 'utf8'))
} catch (error) {
  fail(`cannot read project.config.json: ${error.message}`)
}

const devtoolsConfig = {
  ...sourceConfig,
  miniprogramRoot: './',
}

fs.writeFileSync(outputConfigPath, `${JSON.stringify(devtoolsConfig, null, 2)}\n`, 'utf8')
console.log(`[prepare-weapp-devtools] wrote ${outputConfigPath}`)
