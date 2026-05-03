const fs = require('fs')
const path = require('path')

const rootDir = path.resolve(__dirname)
const buildDir = path.join(rootDir, 'frontend-react', 'dist')
const targetDir = path.join(rootDir, 'dist')

try {
  if (!fs.existsSync(buildDir)) {
    throw new Error(`Build output not found: ${buildDir}`)
  }

  if (fs.existsSync(targetDir)) {
    fs.rmSync(targetDir, { recursive: true, force: true })
  }

  fs.cpSync(buildDir, targetDir, { recursive: true })
  console.log('Copied frontend build to root dist directory.')
} catch (error) {
  console.error(error)
  process.exit(1)
}
