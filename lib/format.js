// Currency + time formatting helpers (Thai baht)

export function formatBaht(n) {
  return "฿" + Number(n || 0).toLocaleString("en-US");
}

// seconds -> "mm:ss"
export function formatClock(totalSeconds) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = String(Math.floor(s / 60)).padStart(2, "0");
  const ss = String(s % 60).padStart(2, "0");
  return `${mm}:${ss}`;
}

// "A-5" -> "A5"
export function seatLabel(id) {
  return id.replace("-", "");
}

// sort seat ids by row letter then seat number ("A-5","A-6","B-1")
export function sortSeats(ids) {
  return [...ids].sort((a, b) => {
    const [ra, na] = a.split("-");
    const [rb, nb] = b.split("-");
    return ra === rb ? Number(na) - Number(nb) : ra.localeCompare(rb);
  });
}
