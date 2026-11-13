// 날짜·금액 계산. 화면과 무관한 순수 계산만 둔다.
// 한 달 = 21일 ~ 다음 달 20일(월급날). 첫 달만 2026-11-20 ~ 2026-12-20.

export const START_DAY = Date.UTC(2026, 10, 20); // 모금 시작일. 이 날 전에는 날짜를 세지 않고 시작 안내를 보여준다
const FIRST_PAYDAY = Date.UTC(2026, 11, 20);
const DAY_MS = 86400000;
const STAGE_THRESHOLDS = [30, 60, 90, 100]; // 이 비율을 넘을 때마다 그림 단계가 하나씩 올라간다

// 한국 시간 기준 오늘 날짜(시각 없이 UTC 자정 값으로 다룬다)
export function todayKST(now = Date.now()) {
  const k = new Date(now + 9 * 3600 * 1000);
  return Date.UTC(k.getUTCFullYear(), k.getUTCMonth(), k.getUTCDate());
}

// 그 날짜가 속한 달의 월급날
export function paydayFor(day) {
  const d = new Date(day);
  const month = d.getUTCDate() <= 20 ? d.getUTCMonth() : d.getUTCMonth() + 1;
  return Math.max(Date.UTC(d.getUTCFullYear(), month, 20), FIRST_PAYDAY);
}

export function daysBetween(from, to) {
  return Math.round((to - from) / DAY_MS);
}

export function isoDate(day) {
  return new Date(day).toISOString().slice(0, 10);
}

// 0(처음) ~ 4(목표 달성)
export function stageFor(percent) {
  return STAGE_THRESHOLDS.filter((t) => percent >= t).length;
}

export function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ",") { row.push(cell); cell = ""; }
    else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      row.push(cell); rows.push(row); row = []; cell = "";
    } else cell += c;
  }
  if (cell !== "" || row.length) { row.push(cell); rows.push(row); }
  return rows;
}

// "2026-12-20", "2026. 12. 20" 같은 표기를 모두 받아준다
function parseDate(text) {
  const m = /(\d{4})\D+(\d{1,2})\D+(\d{1,2})/.exec(text || "");
  return m ? Date.UTC(+m[1], +m[2] - 1, +m[3]) : null;
}

function parseAmount(text) {
  return Number(String(text || "").replace(/[^\d]/g, "")) || 0;
}

// 요약 칸 표: 1행은 제목, 2행부터 [월급날, 합계, 인원]
export function summarize(rows, payday) {
  let monthTotal = 0;
  let monthCount = 0;
  let total = 0;
  for (const [date, amount, count] of rows.slice(1)) {
    const day = parseDate(date);
    if (day === null) continue;
    const sum = parseAmount(amount);
    total += sum;
    if (day === payday) {
      monthTotal = sum;
      monthCount = parseAmount(count);
    }
  }
  return { monthTotal, monthCount, total };
}
