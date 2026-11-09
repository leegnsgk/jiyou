const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host { display: contents; }
    dialog { width: min(640px, calc(100vw - 24px)); max-width: none; max-height: min(90vh, 780px); overflow: auto; margin: auto; padding: 0; border: 0; border-radius: 26px; background: transparent; color: #463b36; }
    dialog::backdrop { background: rgba(54, 43, 40, .58); backdrop-filter: blur(4px); animation: fade-in .18s ease both; }
    .panel { padding: clamp(18px, 4vw, 28px); border: 1px solid #f1e4d7; border-radius: 26px; background: #fffdfa; box-shadow: 0 24px 80px rgba(48,38,32,.24); }
    .top { display: flex; justify-content: space-between; align-items: flex-start; gap: 14px; margin-bottom: 17px; }
    .eyebrow { margin: 0 0 4px; color: #9c7869; font-size: .74rem; font-weight: 800; letter-spacing: .1em; }
    h2 { margin: 0; color: #463b36; font-size: clamp(1.2rem, 4vw, 1.55rem); }
    .totals { margin: 6px 0 0; color: #83756b; font-size: .86rem; }
    .close { display: grid; flex: 0 0 38px; width: 38px; height: 38px; place-items: center; border: 1px solid #eadfce; border-radius: 50%; background: #fff; color: #725d4d; font: inherit; font-size: 1.35rem; cursor: pointer; }
    .close:hover { background: #fff4dd; }
    .navigation { display: flex; align-items: center; gap: 8px; margin-bottom: 13px; }
    .navigation button { display: grid; width: 36px; height: 36px; place-items: center; border: 1px solid #eadfce; border-radius: 50%; background: #fff; color: #725d4d; font: inherit; font-size: 1.15rem; cursor: pointer; }
    .navigation button:hover { background: #fff4dd; }
    .month { flex: 1; color: #66564b; font-size: .95rem; font-weight: 800; text-align: center; }
    button:focus-visible { outline: 3px solid #8cae78; outline-offset: 2px; }
    .weekdays, .days { display: grid; grid-template-columns: repeat(7, minmax(0, 1fr)); gap: 6px; }
    .weekdays { margin-bottom: 6px; }
    .weekday { padding: 5px 0; color: #9a8a7e; font-size: .76rem; font-weight: 800; text-align: center; }
    .weekday:first-child { color: #d77e76; }
    .weekday:last-child { color: #7892b3; }
    .day, .blank { position: relative; display: grid; min-height: clamp(44px, 10vw, 68px); place-items: center; border-radius: 14px; }
    .day { border: 1px solid #f0e9df; background: #fffdfa; color: #5e5148; }
    .day.today { border: 2px solid #eab75b; background: #fff8e8; }
    .day.stamped { border-color: #dce8cd; background: #f4faec; }
    .number { position: absolute; top: 5px; left: 7px; color: #766a60; font-size: .76rem; font-weight: 750; }
    .day.today .number { color: #a87529; }
    .stamp { color: #edaa44; font-size: clamp(1.15rem, 4vw, 1.65rem); line-height: 1; filter: drop-shadow(0 2px 1px rgba(161,107,35,.18)); animation: stamp-in .35s cubic-bezier(.2,1.5,.4,1) both; }
    .day.stamped::after { position: absolute; right: 5px; bottom: 4px; color: #80a46a; content: "완료"; font-size: .56rem; font-weight: 800; }
    .notice { min-height: 1.4em; margin: 13px 0 0; color: #7b8d67; font-size: .84rem; text-align: center; }
    .notice.error { color: #b4534b; }
    @keyframes stamp-in { from { opacity: 0; transform: scale(.45) rotate(-24deg); } to { opacity: 1; transform: scale(1) rotate(0); } }
    @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
    @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation: none !important; transition: none !important; } }
    @media (max-width: 420px) { .weekdays, .days { gap: 4px; } .day, .blank { min-height: 42px; border-radius: 10px; } }
  </style>
  <dialog aria-labelledby="adventure-title">
    <section class="panel">
      <header class="top">
        <div>
          <p class="eyebrow">ADVENTURE MAP</p>
          <h2 id="adventure-title">모험 지도</h2>
          <p class="totals"></p>
        </div>
        <button class="close" type="button" aria-label="모험 지도 닫기">×</button>
      </header>
      <nav class="navigation" aria-label="달력 월 선택">
        <button class="previous" type="button" aria-label="이전 달">‹</button>
        <span class="month" aria-live="polite"></span>
        <button class="next" type="button" aria-label="다음 달">›</button>
      </nav>
      <div class="weekdays" aria-hidden="true"></div>
      <div class="days" role="grid" aria-label="월간 완료 도장 달력"></div>
      <p class="notice" role="status"></p>
    </section>
  </dialog>
`;

const weekdays = ["월", "화", "수", "목", "금", "토", "일"];
const storageKey = "chiikawaAdventureMap";

function localDateKey(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

class AdventureMap extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.append(template.content.cloneNode(true));
    const now = new Date();
    this._year = now.getFullYear();
    this._month = now.getMonth();
    this._completedDates = this.readRecords();
    this._dialog = this.shadowRoot.querySelector("dialog");
    this.shadowRoot.querySelector(".close").addEventListener("click", () => this._dialog.close());
    this.shadowRoot.querySelector(".previous").addEventListener("click", () => this.changeMonth(-1));
    this.shadowRoot.querySelector(".next").addEventListener("click", () => this.changeMonth(1));
  }

  readRecords() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) ?? "{}");
      const dates = Array.isArray(saved.completedDates) ? saved.completedDates : [];
      return new Set(dates.filter((date) => /^\d{4}-\d{2}-\d{2}$/.test(date)));
    } catch (error) {
      console.warn("완료 기록을 불러오지 못했어요.", error);
      return new Set();
    }
  }

  connectedCallback() {
    this.render();
  }

  open() {
    this.render();
    if (!this._dialog.open) this._dialog.showModal();
    this.shadowRoot.querySelector(".close").focus();
  }

  recordToday() {
    const date = localDateKey(new Date());
    if (this._completedDates.has(date)) {
      this.setNotice("오늘의 완료 도장은 이미 찍혀 있어요!");
      return false;
    }

    this._completedDates.add(date);
    try {
      localStorage.setItem(storageKey, JSON.stringify({
        version: 1,
        completedDates: [...this._completedDates].sort(),
        updatedAt: new Date().toISOString(),
      }));
      this._year = new Date().getFullYear();
      this._month = new Date().getMonth();
      this.render();
      this.setNotice("오늘의 완료 도장을 모험 지도에 찍었어요!");
      return true;
    } catch (error) {
      this._completedDates.delete(date);
      this.render();
      this.setNotice("완료 기록을 저장하지 못했어요. 브라우저 저장 공간을 확인해주세요.", true);
      console.error(error);
      return false;
    }
  }

  changeMonth(offset) {
    const view = new Date(this._year, this._month + offset, 1);
    this._year = view.getFullYear();
    this._month = view.getMonth();
    this.render();
  }

  setNotice(message, isError = false) {
    const notice = this.shadowRoot.querySelector(".notice");
    notice.textContent = message;
    notice.classList.toggle("error", isError);
  }

  render() {
    if (!this.shadowRoot.querySelector(".days")) return;
    const weekdaysNode = this.shadowRoot.querySelector(".weekdays");
    weekdaysNode.replaceChildren(...weekdays.map((day) => {
      const node = document.createElement("span");
      node.className = "weekday";
      node.textContent = day;
      return node;
    }));

    const grid = this.shadowRoot.querySelector(".days");
    grid.replaceChildren();
    const firstDay = new Date(this._year, this._month, 1);
    const offset = (firstDay.getDay() + 6) % 7;
    const totalDays = new Date(this._year, this._month + 1, 0).getDate();
    const now = new Date();
    const today = localDateKey(now);
    const monthKey = `${this._year}-${String(this._month + 1).padStart(2, "0")}`;
    const monthCount = [...this._completedDates].filter((date) => date.startsWith(`${monthKey}-`)).length;

    this.shadowRoot.querySelector(".month").textContent = new Intl.DateTimeFormat("ko-KR", { year: "numeric", month: "long" }).format(firstDay);
    this.shadowRoot.querySelector(".totals").textContent = `이번 달 도장 ${monthCount}개 · 지금까지 ${this._completedDates.size}일 완료`;

    for (let i = 0; i < offset; i++) {
      const blank = document.createElement("span");
      blank.className = "blank";
      blank.setAttribute("aria-hidden", "true");
      grid.append(blank);
    }
    for (let day = 1; day <= totalDays; day++) {
      const date = `${monthKey}-${String(day).padStart(2, "0")}`;
      const cell = document.createElement("div");
      cell.className = "day";
      cell.setAttribute("role", "gridcell");
      const number = document.createElement("time");
      number.className = "number";
      number.dateTime = date;
      number.textContent = String(day);
      cell.append(number);
      if (date === today) cell.classList.add("today");
      if (this._completedDates.has(date)) {
        cell.classList.add("stamped");
        cell.setAttribute("aria-label", `${day}일 완료 도장`);
        const stamp = document.createElement("span");
        stamp.className = "stamp";
        stamp.setAttribute("aria-hidden", "true");
        stamp.textContent = "★";
        cell.append(stamp);
      } else {
        cell.setAttribute("aria-label", `${day}일`);
      }
      grid.append(cell);
    }
  }
}

customElements.define("adventure-map", AdventureMap);
