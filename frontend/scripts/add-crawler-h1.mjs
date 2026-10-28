#!/usr/bin/env node
// Post-build: every prerendered dist/**/index.html ships an empty #root, so
// crawlers see no <h1>. Fill it with the page's heading, taken from its own
// <title>: the first " — " / " | " / " - " segment that isn't the brand and
// isn't a bare name ("Length Converter — km, miles | DoAide Convert" →
// "Length Converter", "DoAide | PaySlip — Free Salary Slip Generator" →
// "Free Salary Slip Generator").
// React's createRoot replaces #root's children on mount.
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const DIST = process.argv[2] || join(dirname(fileURLToPath(import.meta.url)), '..', 'dist')

export function headingFromTitle(title) {
  const parts = title.split(/ — | \| | - /).map((s) => s.trim()).filter(Boolean)
  const named = parts.filter((p) => !/doaide/i.test(p))
  const pool = named.length ? named : parts
  return pool.find((p) => p.length >= 8) || pool.reduce((a, b) => (b.length > a.length ? b : a), '')
}

function* htmlFiles(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) yield* htmlFiles(p)
    else if (name === 'index.html') yield p
  }
}

let n = 0
for (const file of htmlFiles(DIST)) {
  const html = readFileSync(file, 'utf8')
  const title = html.match(/<title[^>]*>([^<]*)<\/title>/)?.[1]
  if (!title || !html.includes('<div id="root"></div>')) continue
  // The title is already HTML-escaped, so it goes in as-is.
  writeFileSync(file, html.replace('<div id="root"></div>', () => `<div id="root"><h1>${headingFromTitle(title)}</h1></div>`))
  n++
}
console.log(`add-crawler-h1: ${n} page(s)`)
