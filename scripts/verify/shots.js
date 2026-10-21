// Запускается через Playwright: async (page) => {...}. Подкладывает тестовые данные в IndexedDB
// браузера проверки (не в приложение) и снимает скриншоты экранов в разных состояниях.
async (page) => {
  const BASE = 'http://localhost:5199/flex-app/'
  const OUT = '/tmp/flex-verify'
  const STATES = (globalThis.__STATES ?? 'empty,half,full,overflow').split(',')
  const SIZES = [
    { name: 'iphone', width: 390, height: 844 },
    { name: 'android', width: 412, height: 915 },
  ]

  async function seed(state) {
    await page.evaluate(async (state) => {
      const pad = (n) => String(n).padStart(2, '0')
      const ds = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
      const daysAgo = (n) => { const d = new Date(); d.setDate(d.getDate() - n); return ds(d) }
      let seedN = 42
      const rnd = () => ((seedN = (seedN * 16807) % 2147483647) / 2147483647)

      const color = (hex, label) => new Promise((res) => {
        const c = document.createElement('canvas'); c.width = 600; c.height = 800
        const g = c.getContext('2d'); g.fillStyle = hex; g.fillRect(0, 0, 600, 800)
        g.fillStyle = '#fff'; g.font = 'bold 48px sans-serif'; g.fillText(label, 40, 420)
        c.toBlob(res, 'image/jpeg', 0.8)
      })

      const span = { empty: 0, half: 14, full: 90, overflow: 120 }[state]
      const logs = []
      const heavyIds = ['l1-a', 'l1-b', 'l1-a']
      let h = 0
      for (let i = span - 1; i >= 0; i--) {
        const date = daysAgo(i)
        const p = state === 'half' ? 0.7 : 0.85
        if (rnd() < p) logs.push({ id: crypto.randomUUID(), routineId: 'l1-light', kind: 'light', date, createdAt: Date.now() - i * 864e5 })
        if (i % 2 === 1 && rnd() < 0.8) logs.push({ id: crypto.randomUUID(), routineId: heavyIds[h++ % 3], kind: 'heavy', date, createdAt: Date.now() - i * 864e5 + 1 })
        if (state === 'overflow' && i < 3) {
          for (const r of ['l2-s', 'l4-big5', 'l1-light']) logs.push({ id: crypto.randomUUID(), routineId: r, kind: r === 'l1-light' ? 'light' : 'support', date, createdAt: Date.now() - i * 864e5 + 2 })
          logs.push({ id: crypto.randomUUID(), routineId: 'test', kind: 'test', date, createdAt: Date.now() })
        }
      }
      if (state === 'full') logs.push({ id: crypto.randomUUID(), routineId: 'test', kind: 'test', date: daysAgo(10), createdAt: Date.now() })

      const poses = ['pike', 'squat', 'front-l', 'front-r', 'middle', 'pancake', 'bridge', 'shoulders', 'other']
      const colors = ['#7aa6a0', '#c9a27e', '#8d9fc4', '#b58bb0', '#9cb07a']
      const nPhotos = { empty: 0, half: 3, full: 18, overflow: 54 }[state]
      const longNote = 'Очень длинная заметка о том, как прошёл замер: разогрелся десять минут, тянуло под коленом слева сильнее, чем справа, правая нога ушла ниже на два сантиметра, в конце немного щипало в паху — сбавил.'
      const photos = []
      for (let i = 0; i < nPhotos; i++) {
        const pose = poses[i % poses.length]
        const blob = await color(colors[i % colors.length], `${pose} #${i}`)
        photos.push({
          id: crypto.randomUUID(), date: daysAgo(Math.floor(i / poses.length) * 28 + (i % 3)), pose,
          state: i % 2 ? 'warm' : 'cold', note: state === 'overflow' ? longNote : i % 3 ? '' : 'после разминки',
          blob, thumb: blob, createdAt: Date.now() - i,
        })
      }

      const settings = {
        currentLevel: state === 'overflow' ? 'l4' : 'l1', levelStart: daysAgo(state === 'full' ? 27 : 5),
        strengthMode: 'alternate', alternateStart: daysAgo(0), weekdays: [0, 2, 4], heavyMode: 'between',
        criteria: state === 'full' ? { 'l1-squat': true, 'l1-pike': true, 'l1-angel': true } : state === 'half' ? { 'l1-squat': true } : {},
        lastBackup: state === 'full' ? Date.now() - 40 * 864e5 : undefined,
      }

      const db = await new Promise((res, rej) => { const r = indexedDB.open('flex-app', 1); r.onsuccess = () => res(r.result); r.onerror = rej })
      const tx = db.transaction(['logs', 'photos', 'kv'], 'readwrite')
      tx.objectStore('logs').clear(); tx.objectStore('photos').clear()
      logs.forEach((l) => tx.objectStore('logs').put(l))
      photos.forEach((p) => tx.objectStore('photos').put(p))
      tx.objectStore('kv').put(settings, 'settings')
      await new Promise((res) => (tx.oncomplete = res))
      db.close()
    }, state)
  }

  const tab = async (name) => { await page.locator('.tabbar button', { hasText: name }).click(); await page.waitForTimeout(350) }
  const shots = []
  for (const size of SIZES) {
    await page.setViewportSize({ width: size.width, height: size.height })
    for (const state of STATES) {
      await page.goto(BASE); await page.waitForTimeout(400)
      await seed(state)
      await page.evaluate(() => history.replaceState(null, ''))
      await page.reload(); await page.waitForTimeout(600)
      const snap = async (n) => { const f = `${OUT}/${size.name}-${state}-${n}.png`; await page.screenshot({ path: f, fullPage: true }); shots.push(f) }
      await tab('Сегодня'); await snap('1-today')
      await tab('Программа'); await snap('2-program')
      await tab('Прогресс'); await snap('3-stats')
      await page.locator('.seg button', { hasText: 'Фото' }).click(); await page.waitForTimeout(500); await snap('4-photos')
      if (state !== 'empty') {
        await page.getByRole('button', { name: 'Сравнить' }).click(); await page.waitForTimeout(600); await snap('6-compare')
        if (state === 'full') {
          await page.locator('.seg button', { hasText: 'Рядом' }).click(); await page.waitForTimeout(400); await snap('7-compare-side')
        }
        await page.goBack(); await page.waitForTimeout(300)
        await page.locator('button:has(.chip)').first().click(); await page.waitForTimeout(500); await snap('8-photo')
        await page.goBack(); await page.waitForTimeout(300)
      }
      await tab('Настройки'); await snap('5-settings')
    }
  }
  return shots.length + ' screenshots'
}
