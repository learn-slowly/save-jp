// 이 파일 주소에 붙은 ?v= 표시를 다른 파일에도 붙여, 새로 올린 뒤 옛 파일과 섞여 화면이 비는 일을 막는다
const version = new URL(import.meta.url).search;
const { CONFIG } = await import(`./config.js${version}`);
const { START_DAY, todayKST, paydayFor, daysBetween, stageFor, parseCsv, summarize } = await import(`./cycle.js${version}`);

const $ = (id) => document.getElementById(id);
const won = (n) => `${n.toLocaleString("ko-KR")}원`;
const manwon = (n) => (n % 10000 === 0 ? `${(n / 10000).toLocaleString("ko-KR")}만 원` : won(n));

const THANKS_IMAGES = [`images/thanks-chair.webp${version}`, "images/ttami-wave.png"];
let thanksTurn = Math.floor(Math.random() * THANKS_IMAGES.length);
let toastTimer;

function toast(message) {
  const el = $("toast");
  el.textContent = message;
  el.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove("show"), 2200);
}

async function copy(text, message) {
  try {
    await navigator.clipboard.writeText(text);
    toast(message);
  } catch {
    window.prompt("아래 내용을 길게 눌러 복사해 주세요", text);
  }
}

function renderDday() {
  const today = todayKST();
  if (today < START_DAY) {
    const start = new Date(START_DAY);
    $("dday").textContent = `${start.getUTCMonth() + 1}월 ${start.getUTCDate()}일 모금 시작!`;
    return;
  }
  const left = daysBetween(today, paydayFor(today));
  $("dday").textContent = left === 0 ? "오늘이 당직자 월급날!" : `당직자 월급날까지 D-${left}`;
}

function renderMoney({ monthTotal, monthCount, total }) {
  const percent = Math.floor((monthTotal / CONFIG.goal) * 100);
  const shown = Math.min(percent, 100);
  document.body.dataset.stage = String(stageFor(percent));
  $("month-total").textContent = won(monthTotal);
  $("fill").style.width = `${shown}%`;
  $("bar").setAttribute("aria-valuenow", String(shown));
  $("percent").textContent = `${shown}%`;
  $("count").textContent = `${monthCount.toLocaleString("ko-KR")}명`;
  $("total").textContent = won(total);
  const extra = monthTotal - CONFIG.goal;
  $("over").hidden = extra <= 0;
  if (extra > 0) $("over").textContent = `목표보다 ${won(extra)} 더 모였어요!`;
}

function showStatus(message) {
  $("status").hidden = false;
  $("status").textContent = message;
}

async function loadMoney() {
  if (!CONFIG.sheetCsvUrl) {
    showStatus("모금 현황 연결을 준비하고 있어요.");
    return;
  }
  try {
    const res = await fetch(CONFIG.sheetCsvUrl, { cache: "no-store" });
    if (!res.ok) throw new Error(String(res.status));
    renderMoney(summarize(parseCsv(await res.text()), paydayFor(todayKST())));
    $("status").hidden = true;
  } catch {
    showStatus("현황을 불러오지 못했어요. 잠시 뒤 다시 열어 주세요.");
  }
}

function renderInfo() {
  const payday = new Date(paydayFor(todayKST()));
  const paydayText = `${payday.getUTCMonth() + 1}월 ${payday.getUTCDate()}일`;
  $("goal").textContent = manwon(CONFIG.goal);
  $("story-title").textContent = CONFIG.storyTitle;
  $("story").textContent = CONFIG.story.replace("{월급날}", paydayText);
  $("memo").textContent = CONFIG.depositMemo;
  if (CONFIG.account) {
    $("bank-line").textContent = [CONFIG.bank, CONFIG.holder].filter(Boolean).join(" · ");
    $("account-number").textContent = CONFIG.account;
    $("copy-hint").hidden = false;
  }
  $("contact-phone").textContent = CONFIG.contactPhone;
  $("contact-phone").href = `tel:${CONFIG.contactPhone.replace(/\D/g, "")}`;
  $("contact-name").textContent = CONFIG.contactName;
}

function openThanks() {
  const img = $("thanks-img");
  img.src = THANKS_IMAGES[thanksTurn];
  thanksTurn = (thanksTurn + 1) % THANKS_IMAGES.length;
  // 그림을 다시 넣어 인사 동작이 매번 처음부터 나오게 한다
  img.style.animation = "none";
  void img.offsetWidth;
  img.style.animation = "";
  $("thanks").hidden = false;
  $("thanks-close").focus();
}

function closeThanks() {
  $("thanks").hidden = true;
  $("paid").focus();
}

// 카카오톡 등이 붙이는 꼬리 글자 없이 페이지 주소만 공유한다
const pageUrl = () => location.origin + location.pathname;

async function share() {
  const data = {
    title: "도당위원장을 구해주세요",
    text: "정의당 경남도당 특별당비 모금 중! 이번 달 목표가 모이면 임금체불 신고서가 찢어집니다.",
    url: pageUrl(),
  };
  if (navigator.share) {
    try { await navigator.share(data); } catch { /* 공유 창을 닫은 경우 */ }
  } else {
    copy(data.url, "링크를 복사했어요. 단톡방에 붙여 넣어 주세요.");
  }
}

renderInfo();
renderDday();
loadMoney();

$("copy-account").addEventListener("click", () => {
  if (CONFIG.account) copy(CONFIG.account, "계좌번호를 복사했어요");
});
$("paid").addEventListener("click", openThanks);
$("thanks-close").addEventListener("click", closeThanks);
$("thanks").addEventListener("click", (e) => { if (e.target === e.currentTarget) closeThanks(); });
document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !$("thanks").hidden) closeThanks(); });
$("share").addEventListener("click", share);
$("copy-link").addEventListener("click", () => copy(pageUrl(), "링크를 복사했어요"));
document.addEventListener("visibilitychange", () => {
  if (document.visibilityState === "visible") { renderDday(); loadMoney(); }
});
