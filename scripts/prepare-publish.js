#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

console.log('🔍 Verificando que el proyecto esté listo para publicar...')

if (!fs.existsSync('dist')) {
  console.error('❌ La carpeta dist/ no existe. Ejecuta: npm run build')
  process.exit(1)
}

const requiredFiles = [
  'dist/index.js',
  'dist/index.d.ts',
  'README.md',
  'LICENSE',
]

for (const file of requiredFiles) {
  if (!fs.existsSync(file)) {
    console.error(`❌ Archivo requerido no encontrado: ${file}`)
    process.exit(1)
  }
}

const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'))

if (!pkg.name || !pkg.version || !pkg.description) {
  console.error('❌ package.json debe tener name, version y description')
  process.exit(1)
}

if (!pkg.repository || !pkg.repository.url) {
  console.warn('⚠️  Se recomienda agregar repository.url en package.json')
}

console.log('✅ Proyecto listo para publicar')
console.log(`📦 Paquete: ${pkg.name}@${pkg.version}`)
console.log(`📝 Descripción: ${pkg.description}`)
