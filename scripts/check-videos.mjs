import { readFileSync } from 'node:fs'

const src = readFileSync(new URL('../src/data/program.ts', import.meta.url), 'utf8')
const ids = [...new Set([...src.matchAll(/id: '([\w-]{11})', title:/g)].map((m) => m[1]))]

let bad = 0
for (const id of ids) {
  const res = await fetch(`https://www.youtube.com/oembed?format=json&url=https://www.youtube.com/watch?v=${id}`)
  if (res.ok) {
    const { title, author_name } = await res.json()
    console.log(`ok   ${id}  ${author_name} — ${title}`)
  } else {
    bad++
    console.log(`FAIL ${id}  HTTP ${res.status}`)
  }
}
console.log(`\n${ids.length - bad}/${ids.length} видео доступны`)
process.exit(bad ? 1 : 0)
