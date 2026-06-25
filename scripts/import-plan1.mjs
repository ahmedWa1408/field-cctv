import { Pool } from "pg"

// مواقع مسار 1 - عنيزة والمذنب (كما أرسلها المستخدم)
const SITES = [
  { code: "QSMSM204-205", storage: "3 فلاشات", url: "https://maps.app.goo.gl/rD6qtCLzpYay22AN6" },
  { code: "113-114", storage: "", url: "https://maps.app.goo.gl/ScMENYkk7k7s62KR7" },
  { code: "139", storage: "هارد ديسك", lat: 26.125314, lng: 43.959106, url: "https://www.google.com/maps/place/26%C2%B007'31.1%22N+43%C2%B057'32.8%22E/@26.1253188,43.9616809,652m/" },
  { code: "100", storage: "", url: "https://goo.gl/maps/FLZCuf1CWLq3DhHz5" },
  { code: "UMZSM194", storage: "", url: "https://maps.app.goo.gl/ucDGXCynoh2dbw1H9" },
  { code: "QSMTE149-150", storage: "", url: "https://maps.app.goo.gl/XAutYAd5ZtNnaU43A" },
  { code: "188-189", storage: "", url: "https://maps.app.goo.gl/j9T84niBqVaWgSrC8" },
  { code: "QSMIT149-150", storage: "هارد ديسك", url: "https://maps.app.goo.gl/ui7hjoWeNq1VtUAz5" },
  { code: "178-179", storage: "", url: "https://maps.app.goo.gl/zvDwCJzyKpaD3cMx5" },
  { code: "67-68", storage: "", url: "https://goo.gl/maps/G33sQ4qWF3iL8jJt8" },
  { code: "QSMTE137-138", storage: "", url: "https://goo.gl/maps/Afaund5xT2LuUytt6" },
  { code: "176-177", storage: "", url: "https://maps.app.goo.gl/k8qh4Nap8tQRKJFY6" },
  { code: "255-256", storage: "", url: "https://maps.app.goo.gl/htN3LhE4hQZg8q8k7" },
  { code: "UNZSM197-198", storage: "", url: "https://maps.app.goo.gl/nqg5SNu4DyFSeDvU7" },
  { code: "QSMIT001", storage: "", note: "انعطاف", url: "https://maps.app.goo.gl/sezps3xvYsuCv5fs8" },
  { code: "QSMIT021", storage: "هارد ديسك", url: "https://maps.app.goo.gl/FgL3dnSySX2woWi99" },
  { code: "QSMIT006", storage: "هارد ديسك", url: "https://goo.gl/maps/RWUR6vBNXvP6Rxg9A" },
  { code: "QSMIT033", storage: "", note: "مقابل 144", url: "https://maps.app.goo.gl/9GfrebVeNdhZFAEm6" },
  { code: "QSMIT144", storage: "", note: "انعطاف", lat: 26.086306, lng: 43.977389, url: "https://maps.app.goo.gl/JLqtfxFDuQG3Cjdy9" },
  { code: "143", storage: "هارد ديسك", url: "https://maps.app.goo.gl/8B4kJev31yEiM9ef7" },
  { code: "QSMSM328-329", storage: "", url: "https://maps.app.goo.gl/JHXSuswzQQ2FwFFa8" },
  { code: "QSMSM326-327", storage: "", url: "https://maps.app.goo.gl/5wa7NHV1EfEj3Msw9" },
  { code: "MTNSM003-004", storage: "3 فلاشات", lat: 25.931778, lng: 44.116378, url: "https://www.google.com/maps/place/25%C2%B055'54.4%22N+44%C2%B006'59.0%22E/" },
  { code: "MTNCP001-002", storage: "3 فلاشات", url: "https://maps.app.goo.gl/tCaqrGE3bAbuWHoE8" },
  { code: "MTNIT001", storage: "هارد ديسك", url: "https://maps.app.goo.gl/PJCkL6CryS4hSknm7" },
  { code: "QSMSM315-316", storage: "", url: "https://maps.app.goo.gl/rtXkWd1CFYaKCEk76" },
  { code: "MTN001-002", storage: "فلاش", url: "https://maps.app.goo.gl/WBGif5dRWEAUaMCD8" },
  { code: "MTNIT002", storage: "هارد ديسك", note: "المذنب", url: "https://maps.app.goo.gl/Fdh5mLbHP9GyeyYA6" },
  { code: "QSMSM223", storage: "", note: "بعد المذنب", url: "https://maps.app.goo.gl/kGoNJQzqfSigLPmF9" },
  { code: "QSMSM226-227", storage: "", lat: 26.1398745, lng: 44.2108727, url: "https://maps.google.com?q=26.1398745,44.2108727" },
  { code: "QSMSM151", storage: "", url: "https://maps.app.goo.gl/XLTKDAwEiUeTNqFh8" },
]

function validCoords(c) {
  // نطاق منطقي للسعودية لاستبعاد الأرقام الخاطئة المستخرجة من جسم الصفحة
  return c && c.lat >= 16 && c.lat <= 33 && c.lng >= 34 && c.lng <= 56
}

function parseCoords(url) {
  if (!url) return null
  const decoded = decodeURIComponent(url)
  // النمط: q=lat,lng
  let m = decoded.match(/[?&]q=(-?\d+\.\d+),(-?\d+\.\d+)/)
  if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) }
  // النمط: !3dLAT!4dLNG
  m = decoded.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/)
  if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) }
  // النمط: @lat,lng
  m = decoded.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
  if (m) return { lat: parseFloat(m[1]), lng: parseFloat(m[2]) }
  // النمط: DMS مثل 26°07'31.1"N 43°57'32.8"E
  m = decoded.match(/(\d+)°(\d+)'([\d.]+)"([NS])\s*\+?\s*(\d+)°(\d+)'([\d.]+)"([EW])/)
  if (m) {
    const lat = (parseInt(m[1]) + parseInt(m[2]) / 60 + parseFloat(m[3]) / 3600) * (m[4] === "S" ? -1 : 1)
    const lng = (parseInt(m[5]) + parseInt(m[6]) / 60 + parseFloat(m[7]) / 3600) * (m[8] === "W" ? -1 : 1)
    return { lat, lng }
  }
  return null
}

async function resolveUrl(url) {
  try {
    const res = await fetch(url, { redirect: "follow", headers: { "User-Agent": "Mozilla/5.0" } })
    const finalUrl = res.url
    let coords = parseCoords(finalUrl)
    if (validCoords(coords)) return coords
    // أحيانًا الإحداثيات داخل جسم الصفحة
    const text = await res.text()
    // ابحث عن نمط !3d..!4d داخل الصفحة أولًا (أدق)
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

// ترتيب ذكي: أقرب جار بدءًا من الموقع الأقصى شمالًا (مدخل المسار)
function smartOrder(items) {
  const withCoords = items.filter((s) => s.lat != null && s.lng != null)
  const without = items.filter((s) => s.lat == null || s.lng == null)
  if (withCoords.length < 2) return items
  // ابدأ من الأقصى شمالًا
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
  // المواقع بدون إحداثيات تُلحق في نهاية القائمة بترتيب ورودها
  return [...ordered, ...without]
}

async function main() {
  console.log("[v0] resolving coordinates...")
  for (const s of SITES) {
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
    console.log(`[v0] ${s.code}: ${s.lat ?? "—"}, ${s.lng ?? "—"}`)
  }

  const ordered = smartOrder(SITES)

  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  await pool.query("DELETE FROM sites WHERE \"planNumber\" = 1")
  let i = 1
  for (const s of ordered) {
    await pool.query(
      'INSERT INTO sites ("planNumber", code, storage, "mapUrl", lat, lng, "orderIndex") VALUES ($1,$2,$3,$4,$5,$6,$7)',
      [1, s.code, s.storage || null, s.url || null, s.lat ?? null, s.lng ?? null, i],
    )
    i++
  }
  await pool.end()
  console.log(`[v0] inserted ${ordered.length} sites for plan 1`)
}

main()
