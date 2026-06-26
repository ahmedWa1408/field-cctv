import { Pool } from "pg"

// تحويل DMS إلى عشري
function dms(d, m, s, dir) {
  let v = d + m / 60 + s / 3600
  if (dir === "S" || dir === "W") v = -v
  return v
}

// مواقع المسارات 2..6 كما أرسلها المستخدم (الترتيب الذكي يُحسب لاحقًا)
const PLANS = {
  2: [
    { code: "BRDSM283-284", url: "https://maps.app.goo.gl/dBrf4rr7rP2hKDon6" },
    { code: "64", storage: "فلاش", url: "https://goo.gl/maps/V58dACuZMEdZ556f9" },
    { code: "QSMSM065", url: "https://maps.app.goo.gl/RGZWHMSV6nBm19LY8" },
    { code: "159-160", url: "https://maps.app.goo.gl/SFHJWbtxSbmMDvEq9" },
    { code: "UJWCP003-004", url: "https://maps.app.goo.gl/jdzmGEN6q4nXptcN9" },
    { code: "UJWSM018-019", lat: 26.60664, lng: 43.55367 },
    { code: "UJWSM006-007", storage: "فلاش", url: "https://maps.app.goo.gl/furFdqi4Uoz7FME47" },
    { code: "UJWSM020-021", storage: "فلاش", url: "https://maps.app.goo.gl/BefGN4az9REQ2EMh9" },
    { code: "MKRSM001-002", storage: "فلاش", url: "https://maps.app.goo.gl/9ZesvJFfneXpjw1w9" },
    { code: "QSMSM259-260", storage: "فلاش", url: "https://maps.app.goo.gl/aAyrGnm5UY7HLoi6A" },
    { code: "MKRSM003-004", storage: "فلاش", lat: 26.849152, lng: 43.098782 },
    { code: "QSMSM257", storage: "فلاش", lat: 26.903107, lng: 43.011235 },
    { code: "مديور بنص الطريق", url: "https://maps.app.goo.gl/ejVSfbbeZdG1a5776" },
    { code: "UJWSM005", url: "https://goo.gl/maps/GkrDYdZvJwexcix47" },
    { code: "BRD221", url: "https://maps.app.goo.gl/aqQp4hj1KQyTUdTf7" },
    { code: "228 عند الجامعة", lat: 26.36374, lng: 43.79309 },
  ],
  3: [
    { code: "BRDSM249-250", url: "https://maps.app.goo.gl/yUvBZedwhqPv6FnY6" },
    { code: "BRDIT176", storage: "هارد ديسك", url: "https://maps.app.goo.gl/dBLmTuMPtVmYJ4HW7" },
    { code: "BRDIT173", storage: "هارد ديسك", url: "https://maps.app.goo.gl/pi1v8EH6vL8jNAs26" },
    { code: "QSMSM109", url: "https://maps.app.goo.gl/8jqE32CjykmsPpnf7" },
    { code: "QSMIT137-140-032", storage: "هارد ديسك", note: "اشارة المحكمة", url: "https://maps.app.goo.gl/Gh5spu3bf13QmQua6" },
    { code: "QSMSM107-108", url: "https://maps.app.goo.gl/9kNgZfimpkoDmd7i8" },
    { code: "QSMSM119-120", url: "https://maps.app.goo.gl/qMd3F1mEg5uubfZUA" },
    { code: "QSMSM125-126", url: "https://maps.app.goo.gl/39CzjUsKFMfuBvd78" },
    { code: "QSMSM154-155", url: "https://maps.app.goo.gl/kNXzwjEy951e1SRi6" },
    { code: "135-136", url: "https://maps.app.goo.gl/AgPfPEL8hQKB9j5L8" },
    { code: "QSMSM127-128", url: "https://maps.app.goo.gl/7FxG6fnjPWbFA1j17" },
    { code: "BRD239", url: "https://maps.app.goo.gl/ivyUp7DCUM5quNG16" },
    { code: "QSMSM053", url: "https://maps.app.goo.gl/G78He3stLkhGo4TU6" },
    { code: "QSMSM103-104", url: "https://maps.app.goo.gl/XSwSR75NaS4FKK799" },
    { code: "QSMSM023", url: "https://maps.app.goo.gl/g4ja1FjER6tHVLXf7" },
    { code: "QSMSM022", url: "https://maps.app.goo.gl/n2FAcxqvarfb7Lsj9" },
    { code: "BRDSM247-248", url: "https://maps.app.goo.gl/c2f4TEjhzFLX77o49" },
    { code: "RBHSM001-002", lat: 26.3772606, lng: 44.2294121 },
    { code: "SDRSM001-002", url: "https://maps.app.goo.gl/MBLwgruqPKPnKzox9" },
    { code: "QSMCP002", url: "https://maps.app.goo.gl/4ViDn6zR8DZBiFfp6" },
    { code: "ASYSM079-080", lat: 26.105273, lng: 44.5015812 },
    { code: "QSMCP001", url: "https://maps.app.goo.gl/pzs1G5zczA48BXke9" },
    { code: "BRDSM232", url: "https://maps.app.goo.gl/vHW3pvAZ7hoKjbEKA" },
    { code: "QSMSM024", url: "https://maps.app.goo.gl/aZKXvCFkMLJX2M3v6" },
    { code: "QSMSM014", url: "https://maps.app.goo.gl/mshbT7mXiLNxnhQs5" },
    { code: "QSMSM117-118", url: "https://maps.app.goo.gl/GhEaJPPPuiM4Kiba7" },
    { code: "BRDSM277-278", url: "https://maps.app.goo.gl/WTrthx2esU5i6r3W6" },
    { code: "QSMSM076-077", url: "https://maps.app.goo.gl/cnnrR94STUkT8QmY7" },
    { code: "QSMSM046", url: "https://maps.app.goo.gl/SNLYvRaB1cqTugqt9" },
    { code: "QSMSM047", url: "https://maps.app.goo.gl/bTQ1CVWrMus5jvEZ9" },
    { code: "QSMIT025", storage: "هارد ديسك", url: "https://maps.app.goo.gl/tDrCNySR8Nwt36YH6" },
    { code: "QSMSM094", url: "https://maps.app.goo.gl/wz898JGBCsqCnBbe6" },
    { code: "170-171", url: "https://maps.app.goo.gl/f6LLAgxZnFojWxoJ9" },
    { code: "QSMSM050-051", url: "https://maps.app.goo.gl/pZUfbAvdTERjGKhL6" },
  ],
  4: [
    { code: "QSMSM005", url: "https://maps.app.goo.gl/1B9SYvBkFkFc8cmk8" },
    { code: "BRDIT169", storage: "هارد ديسك", note: "حديقة الحضاري", url: "https://maps.app.goo.gl/N795GrmuhN5iXn6k8" },
    { code: "50-51", url: "https://goo.gl/maps/Kg4ZDkMrGGuLYoVY7" },
    { code: "BRDSM263-264", url: "https://maps.app.goo.gl/B97KnXo3q3HbyRJA9" },
    { code: "54-55", url: "https://maps.app.goo.gl/R2iXKBVVQppc21VLA" },
    { code: "BRD237-238", storage: "فلاش", url: "https://maps.app.goo.gl/D3so2ahvMAunexKj9" },
    { code: "87", url: "https://goo.gl/maps/TkuSAnxNyhdkjN9P9" },
    { code: "BUKSM139", lat: dms(26, 9, 44.3, "N"), lng: dms(43, 47, 53.8, "E"), url: "https://maps.app.goo.gl/sqRNb32rKgosGTem9" },
    { code: "BDYSM151-152", storage: "فلاش", note: "يسحب يوميًا", lat: 26.088598, lng: 43.784485 },
    { code: "BUKSM144-145", storage: "فلاش", lat: dms(26, 13, 57.5, "N"), lng: dms(43, 44, 47.6, "E"), url: "https://maps.app.goo.gl/88HjEoxzUXj9NDkB6" },
    { code: "334-335", url: "https://maps.app.goo.gl/YxcBh85BsBN3Qaqs6" },
    { code: "RKBSM020", url: "https://maps.app.goo.gl/r2J42oLvx6XfadyTA" },
    { code: "RKBSM016-017", storage: "فلاش", lat: 26.055583, lng: 43.652361 },
    { code: "RKBTE001-002", lat: dms(26, 3, 20.4, "N"), lng: dms(43, 33, 27.9, "E"), url: "https://maps.app.goo.gl/RwDQ4j6wENkAH4T87" },
    { code: "RKBSM005-006", url: "https://maps.app.goo.gl/6AcvYS59PJ4gzYk96" },
    { code: "RKBSM007-008", storage: "فلاش", lat: 26.090772, lng: 43.596276 },
    { code: "QSMSM019", url: "https://goo.gl/maps/aPRzfchvhkQm6fuN7" },
    { code: "SAQSM001-002", url: "https://maps.app.goo.gl/TtzEkN71EVpj8VnV9" },
    { code: "BUKSM156-157", url: "https://maps.app.goo.gl/6t9ZVzqq2UqDTGKH8" },
    { code: "QSMSM135-136", note: "يسحب يوميًا", url: "https://maps.app.goo.gl/NgrX89V3XSQ8Zpz8A" },
    { code: "BUKSM146-147", lat: 26.232633, lng: 43.746546 },
    { code: "BRDSM225", storage: "فلاش", url: "https://maps.app.goo.gl/eb8y49dig9TEvxzb6" },
    { code: "18", storage: "فلاش", url: "https://goo.gl/maps/CRX5EY2ttCzdTnQa9" },
  ],
  5: [
    { code: "T152", lat: dms(26, 21, 34.9, "N"), lng: dms(43, 58, 4.8, "E"), url: "https://maps.app.goo.gl/NjHFoZnxB5HCi5eL6" },
    { code: "QSMSM004", url: "https://maps.app.goo.gl/dhKau6a4M9iBZuQw5" },
    { code: "BRDSM233", url: "https://maps.app.goo.gl/2HrAaQmo52KtAfnBA" },
    { code: "34-35", url: "https://maps.app.goo.gl/23BSpq8qnwM3pPvv7" },
    { code: "145", storage: "هارد ديسك", url: "https://maps.app.goo.gl/zEa6yN8Fhu4pPuW38" },
    { code: "QSMSM147-148", lat: 26.4232345, lng: 43.9770699 },
    { code: "QSMSM129-130", url: "https://maps.app.goo.gl/F4PKgWBum3j3atVt7" },
    { code: "QAMSM214", url: "https://maps.app.goo.gl/Pb9wbPbsu1tmx4jM9" },
    { code: "QSMSM212", lat: dms(26, 43, 10.8, "N"), lng: dms(44, 8, 8.5, "E"), url: "https://maps.app.goo.gl/9asScZWsbYoivNit5" },
    { code: "141-142", url: "https://maps.app.goo.gl/Ah6zyUnSuFaTbihL7" },
    { code: "QSMSM173", lat: dms(27, 20, 53.5, "N"), lng: dms(44, 19, 51.6, "E"), url: "https://maps.app.goo.gl/aSajwzo62tJRco9VA" },
    { code: "QSMWS022-014", lat: dms(27, 26, 5.5, "N"), lng: dms(44, 24, 41.3, "E"), url: "https://maps.app.goo.gl/U9LvUF7yMTP2ofUU7" },
    { code: "QAHSM010-011", url: "https://maps.app.goo.gl/q2B8qipPAJTaPJMn6" },
    { code: "QSMSM206-207", lat: dms(27, 33, 55.6, "N"), lng: dms(44, 35, 53.8, "E"), url: "https://maps.app.goo.gl/pBNcfiLtrQKRQn7R9" },
    { code: "QAHSM008-009", lat: 27.6421154, lng: 44.708243 },
    { code: "QSMSM059-060", url: "https://goo.gl/maps/FenHG662qXkbfTZV7" },
    { code: "QSMSM110", url: "https://maps.app.goo.gl/ffw9GqhTnJ5HkSgPA" },
    { code: "BRDIT167", url: "https://maps.app.goo.gl/2SPeTWedJQjDAovU6" },
  ],
  6: [
    { code: "QSMIT157", storage: "هارد ديسك", url: "https://maps.app.goo.gl/LVqK8SctBAa4tQXd9" },
    { code: "78-79", url: "https://goo.gl/maps/fXoeZB7jNT1XSvwAA" },
    { code: "QSMIT019", url: "https://goo.gl/maps/NYaZT7hH7w3ipmfEA" },
    { code: "289-290", note: "البطين", url: "https://maps.app.goo.gl/xUkNrQgC1ejS9uUN7" },
    { code: "SRISM005-006", lat: 27.241933, lng: 43.461567 },
    { code: "QSISM008-009", storage: "فلاش", note: "قصيباء", url: "https://maps.app.goo.gl/9jWjAJBEaTq5rwZc8" },
    { code: "UJWCP003-004", url: "https://maps.app.goo.gl/jdzmGEN6q4nXptcN9" },
    { code: "UJWSM018-019", lat: 26.60664, lng: 43.55367 },
    { code: "UJWSM006-007", storage: "فلاش", url: "https://maps.app.goo.gl/furFdqi4Uoz7FME47" },
    { code: "UJWSM020-021", storage: "فلاش", url: "https://maps.app.goo.gl/BefGN4az9REQ2EMh9" },
    { code: "MKRSM001-002", storage: "فلاش", url: "https://maps.app.goo.gl/9ZesvJFfneXpjw1w9" },
    { code: "QSMSM259-260", storage: "فلاش", url: "https://maps.app.goo.gl/aAyrGnm5UY7HLoi6A" },
    { code: "MKRSM003-004", storage: "فلاش", lat: 26.849152, lng: 43.098782 },
    { code: "QSMSM257", storage: "فلاش", lat: 26.903107, lng: 43.011235 },
    { code: "مديور بنص الطريق", url: "https://maps.app.goo.gl/ejVSfbbeZdG1a5776" },
    { code: "UJWSM005", lat: dms(26, 31, 19.7, "N"), lng: dms(43, 39, 1.5, "E"), url: "https://goo.gl/maps/GkrDYdZvJwexcix47" },
    { code: "BRD221", url: "https://maps.app.goo.gl/aqQp4hj1KQyTUdTf7" },
    { code: "159-160", note: "دبوس مثبّت", url: "https://maps.app.goo.gl/SFHJWbtxSbmMDvEq9" },
    { code: "64", storage: "فلاش", url: "https://goo.gl/maps/V58dACuZMEdZ556f9" },
    { code: "QSMSM065", url: "https://maps.app.goo.gl/RGZWHMSV6nBm19LY8" },
    { code: "BRDSM283-284", url: "https://maps.app.goo.gl/dBrf4rr7rP2hKDon6" },
  ],
}

function validCoords(c) {
  return c && c.lat >= 16 && c.lat <= 33 && c.lng >= 34 && c.lng <= 56
}

function parseCoords(url) {
  if (!url) return null
  const decoded = decodeURIComponent(url)
  let m = decoded.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/)
  if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) }
  m = decoded.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/)
  if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) }
  m = decoded.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
  if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) }
  return null
}

async function resolveUrl(url) {
  try {
    const res = await fetch(url, { redirect: "follow", headers: { "User-Agent": "Mozilla/5.0" } })
    let coords = parseCoords(res.url)
    if (validCoords(coords)) return coords
    const text = await res.text()
    let m = text.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/)
    if (m) {
      const c = { lat: parseFloat(m[1]), lng: parseFloat(m[2]) }
      if (validCoords(c)) return c
    }
    m = text.match(/(\d{2}\.\d{4,}),(\d{2}\.\d{4,})/)
    if (m) {
      const c = { lat: parseFloat(m[1]), lng: parseFloat(m[2]) }
      if (validCoords(c)) return c
    }
  } catch (e) {
    console.error("resolve failed", url, e.message)
  }
  return null
}

function haversine(a, b) {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const x =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

function smartOrder(items) {
  const withCoords = items.filter((s) => s.lat != null && s.lng != null)
  const without = items.filter((s) => s.lat == null || s.lng == null)
  if (withCoords.length < 2) return items
  let start = withCoords.reduce((a, b) => (b.lat > a.lat ? b : a))
  const remaining = withCoords.filter((s) => s !== start)
  const ordered = [start]
  let current = start
  while (remaining.length) {
    let nearestIdx = 0
    let nearestDist = Infinity
    remaining.forEach((s, i) => {
      const d = haversine(current, s)
      if (d < nearestDist) {
        nearestDist = d
        nearestIdx = i
      }
    })
    current = remaining.splice(nearestIdx, 1)[0]
    ordered.push(current)
  }
  return [...ordered, ...without]
}

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  for (const planNumber of Object.keys(PLANS)) {
    const sites = PLANS[planNumber]
    console.log(`\n[v0] === Plan ${planNumber} (${sites.length} sites) ===`)
    for (const s of sites) {
      if (s.lat == null) {
        const direct = parseCoords(s.url)
        if (direct) {
          s.lat = direct.lat
          s.lng = direct.lng
        } else {
          const resolved = await resolveUrl(s.url)
          if (resolved) {
            s.lat = resolved.lat
            s.lng = resolved.lng
          }
        }
      }
      console.log(`[v0] ${s.code}: ${s.lat?.toFixed?.(4) ?? "—"}, ${s.lng?.toFixed?.(4) ?? "—"}`)
    }
    const ordered = smartOrder(sites)
    await pool.query('DELETE FROM sites WHERE "planNumber" = $1', [Number(planNumber)])
    let i = 1
    for (const s of ordered) {
      await pool.query(
        'INSERT INTO sites ("planNumber", code, storage, "mapUrl", lat, lng, "orderIndex") VALUES ($1,$2,$3,$4,$5,$6,$7)',
        [Number(planNumber), s.code, s.storage || null, s.url || null, s.lat ?? null, s.lng ?? null, i],
      )
      i++
    }
    console.log(`[v0] inserted ${ordered.length} sites for plan ${planNumber}`)
  }
  await pool.end()
  console.log("\n[v0] done")
}

main()
