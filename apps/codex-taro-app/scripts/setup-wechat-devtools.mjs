import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const targetRoot = path.resolve(appRoot, 'dist', 'weapp')
const linkPath = 'D:\\wxdev\\community-idle'

const fail = message => {
  console.error(`[setup:wechat-devtools] ${message}`)
  process.exit(1)
}

if (!fs.existsSync(targetRoot) || !fs.statSync(targetRoot).isDirectory()) {
  fail(`missing dist/weapp; run npm run build:weapp first: ${targetRoot}`)
}

const samePath = (left, right) => path.resolve(left).toLowerCase() === path.resolve(right).toLowerCase()
fs.mkdirSync(path.dirname(linkPath), { recursive: true })

let status = 'created'
let existing
try {
  existing = fs.lstatSync(linkPath)
} catch (error) {
  if (error.code !== 'ENOENT') fail(`cannot inspect ${linkPath}: ${error.message}`)
}

if (existing) {
  if (!existing.isSymbolicLink()) {
    fail(`${linkPath} exists and is not a directory junction; refusing to remove it`)
  }

  const currentTarget = fs.realpathSync(linkPath)
  if (samePath(currentTarget, targetRoot)) {
    status = 'reused'
  } else {
    fs.unlinkSync(linkPath)
    status = 'refreshed'
  }
}

if (status !== 'reused') fs.symlinkSync(targetRoot, linkPath, 'junction')

const actualTarget = fs.realpathSync(linkPath)
if (!samePath(actualTarget, targetRoot)) {
  fail(`junction target mismatch: ${actualTarget}`)
}

console.log(`[setup:wechat-devtools] ${status}`)
console.log(`Junction: ${linkPath}`)
console.log(`Target: ${actualTarget}`)
