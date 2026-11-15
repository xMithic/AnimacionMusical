#!/usr/bin/env node
/**
 * build.mjs — ensambla el visor a partir de viewer/ (sin dependencias, Node 18+).
 *
 *   node tools/build.mjs           regenera los archivos generados
 *   node tools/build.mjs --check   solo comprueba que estén al día (código de salida 1 si no)
 *
 * Qué genera:
 *   1. admin/js/00-viewer-template.js  → el panel usa esta plantilla para la vista previa y para publicar.
 *   2. index.html                      → vuelve a escribir el CÓDIGO del visor y conserva tal cual
 *                                        los datos incrustados (config, modelos y animaciones).
 *
 * Los modelos, las animaciones y la configuración NO se tocan: solo se reemplaza el código del visor.
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const VIEWER = join(ROOT, 'viewer');
const CHECK = process.argv.includes('--check');

/** Lee un archivo, o todos los .css/.js de una carpeta en orden alfabético (por eso el prefijo 01-, 02-…). */
function inline(rel) {
  const p = join(VIEWER, rel);
  if (statSync(p).isDirectory()) {
    return readdirSync(p)
      .filter((f) => /\.(css|js)$/.test(f))
      .sort()
      .map((f) => readFileSync(join(p, f), 'utf8'))
      .join('');
  }
  return readFileSync(p, 'utf8');
}

/** viewer/template.html con cada {{inline:ruta}} reemplazado por su contenido. */
function buildTemplate() {
  const tpl = readFileSync(join(VIEWER, 'template.html'), 'utf8');
  return tpl.replace(/\{\{inline:([^}]+)\}\}/g, (_, rel) => inline(rel.trim()));
}

/** Datos incrustados de un index.html ya publicado (texto crudo, sin reinterpretar). */
function readData(html) {
  const get = (id) => {
    const m = html.match(new RegExp('<script id="' + id + '" type="application/json">([\\s\\S]*?)<\\/script>'));
    return m ? m[1] : null;
  };
  return { cfg: get('cfg'), mdl: get('mdl'), anm: get('anm') };
}

const outputs = [];
const template = buildTemplate();

outputs.push([
  'admin/js/00-viewer-template.js',
  '/* GENERADO por tools/build.mjs a partir de viewer/. No editar a mano: edita viewer/ y ejecuta `node tools/build.mjs`. */\n' +
    'const TPL=' + JSON.stringify(template) + ';\n',
]);

const indexPath = join(ROOT, 'index.html');
if (existsSync(indexPath)) {
  const { cfg, mdl, anm } = readData(readFileSync(indexPath, 'utf8'));
  if (cfg !== null && mdl !== null && anm !== null) {
    // Funciones como reemplazo: así los "$" de los datos no se interpretan como patrones.
    outputs.push([
      'index.html',
      template.replace('/*CFG*/', () => cfg).replace('/*MODELS*/', () => mdl).replace('/*ANIMS*/', () => anm),
    ]);
  } else {
    console.warn('index.html no tiene los bloques de datos (cfg/mdl/anm): se omite. Publícalo desde admin.html.');
  }
} else {
  console.warn('No existe index.html: se omite. Publícalo desde admin.html.');
}

let stale = 0;
for (const [rel, content] of outputs) {
  const path = join(ROOT, rel);
  const current = existsSync(path) ? readFileSync(path, 'utf8') : null;
  if (current === content) { console.log('= ' + rel + ' (sin cambios)'); continue; }
  if (CHECK) { console.log('✗ ' + rel + ' está desactualizado'); stale++; continue; }
  writeFileSync(path, content);
  console.log('✓ ' + rel);
}
if (CHECK && stale) { console.error('\nEjecuta: node tools/build.mjs'); process.exit(1); }
