// أدوات مساعدة للإحداثيات الجغرافية وحساب المسافات والترتيب الذكي

export type LatLng = { lat: number; lng: number }

// محاولة استخراج الإحداثيات من رابط خرائط جوجل
// يدعم الصيغ التي تحتوي على @lat,lng أو q=lat,lng أو !3dlat!4dlng
export function parseCoordsFromUrl(url: string): LatLng | null {
  if (!url) return null
  try {
    // @lat,lng
    const at = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (at) return { lat: parseFloat(at[1]), lng: parseFloat(at[2]) }

    // q=lat,lng أو query=lat,lng أو ll=lat,lng
    const q = url.match(/[?&](?:q|query|ll|destination)=(-?\d+\.\d+),(-?\d+\.\d+)/)
    if (q) return { lat: parseFloat(q[1]), lng: parseFloat(q[2]) }

    // !3dlat!4dlng
    const d = url.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/)
    if (d) return { lat: parseFloat(d[1]), lng: parseFloat(d[2]) }

    // أي زوج أرقام عشرية يفصلهما فاصلة
    const pair = url.match(/(-?\d{1,3}\.\d{3,}),\s*(-?\d{1,3}\.\d{3,})/)
    if (pair) return { lat: parseFloat(pair[1]), lng: parseFloat(pair[2]) }
  } catch {
    // تجاهل
  }
  return null
}

// المسافة بين نقطتين بالكيلومترات (Haversine)
export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const lat1 = (a.lat * Math.PI) / 180
  const lat2 = (b.lat * Math.PI) / 180
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(h))
}

// ترتيب ذكي للمواقع: نبدأ من أول موقع، ثم نختار الأقرب فالأقرب (Nearest Neighbour)
export function smartOrder<T extends { lat: number | null; lng: number | null }>(
  items: T[],
): T[] {
  const withCoords = items.filter((i) => i.lat != null && i.lng != null) as (T & LatLng)[]
  const without = items.filter((i) => i.lat == null || i.lng == null)
  if (withCoords.length <= 2) return [...withCoords, ...without]

  const remaining = [...withCoords]
  const ordered: (T & LatLng)[] = []
  // نبدأ من الأقصى شمالًا كنقطة انطلاق ثابتة
  remaining.sort((a, b) => b.lat - a.lat)
  let current = remaining.shift()!
  ordered.push(current)

  while (remaining.length) {
    let bestIdx = 0
    let bestDist = Infinity
    for (let i = 0; i < remaining.length; i++) {
      const d = haversineKm(current, remaining[i])
      if (d < bestDist) {
        bestDist = d
        bestIdx = i
      }
    }
    current = remaining.splice(bestIdx, 1)[0]
    ordered.push(current)
  }

  return [...ordered, ...without]
}

// إيجاد أفضل موضع لإدراج موقع جديد بين موقعين متجاورين حسب أقرب مسافة
export function findInsertIndex(
  ordered: { lat: number | null; lng: number | null }[],
  newPoint: LatLng,
): number {
  const pts = ordered
    .map((o, idx) => ({ idx, lat: o.lat, lng: o.lng }))
    .filter((o) => o.lat != null && o.lng != null) as { idx: number; lat: number; lng: number }[]

  if (pts.length === 0) return ordered.length
  if (pts.length === 1) return pts[0].idx + 1

  // أقرب نقطة موجودة
  let nearest = pts[0]
  let nearestDist = haversineKm(newPoint, pts[0])
  for (const p of pts) {
    const d = haversineKm(newPoint, p)
    if (d < nearestDist) {
      nearestDist = d
      nearest = p
    }
  }
  // ندرج بعد أقرب نقطة
  return nearest.idx + 1
}
