const SVG_NS = "http://www.w3.org/2000/svg";
const WHEEL_COLORS = ["#ff7a70", "#ffbd55", "#77cbb3", "#68b8ed", "#a38be8", "#f279ae"];

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host { display: contents; }
    dialog { width: min(960px, calc(100vw - 20px)); max-width: none; max-height: min(94vh, 900px); max-height: min(94dvh, 900px); overflow: auto; margin: auto; padding: 0; border: 0; border-radius: 28px; background: transparent; color: #493c35; }
    dialog::backdrop { background: rgb(30 26 46 / 76%); backdrop-filter: blur(8px); animation: fade-in .25s ease both; }
    .panel { position: relative; isolation: isolate; overflow: hidden; padding: clamp(16px, 3vw, 30px); border: 1px solid #ffe28a; border-radius: 28px; background: radial-gradient(circle at 50% -10%, #fff9cc 0, transparent 38%), radial-gradient(circle at 4% 94%, #ffd8e8 0, transparent 35%), radial-gradient(circle at 100% 88%, #c9edff 0, transparent 34%), linear-gradient(145deg, #fff8e4, #f8edff 55%, #eaf8ff); box-shadow: 0 24px 90px rgb(0 0 0 / 35%); }
    .panel::before, .panel::after { position: absolute; z-index: -1; color: rgb(236 170 54 / 36%); content: "✦"; pointer-events: none; }
    .panel::before { top: 15%; left: 4%; font-size: 3.5rem; animation: twinkle 1.7s ease-in-out infinite alternate; }
    .panel::after { right: 5%; bottom: 17%; color: rgb(169 120 228 / 36%); font-size: 4rem; animation: twinkle 2s .5s ease-in-out infinite alternate; }
    .top { display: flex; justify-content: space-between; align-items: flex-start; gap: 12px; margin-bottom: 15px; }
    .eyebrow { margin: 0 0 3px; color: #a27436; font-size: .75rem; font-weight: 900; letter-spacing: .14em; }
    h2 { margin: 0; color: #64457f; font-size: clamp(1.35rem, 4vw, 2rem); line-height: 1.15; text-shadow: 0 2px #fff; }
    .subtitle { margin: 6px 0 0; color: #725d75; font-size: .92rem; }
    .close { flex: 0 0 40px; width: 40px; height: 40px; border: 1px solid #ead7b1; border-radius: 50%; background: rgb(255 255 255 / 85%); color: #725d75; font-size: 1.4rem; cursor: pointer; }
    .layout { display: grid; grid-template-columns: minmax(300px, 1.05fr) minmax(280px, .95fr); align-items: center; gap: clamp(14px, 3vw, 28px); }
    .wheel-area { display: grid; justify-items: center; gap: 10px; }
    .wheel-wrap { position: relative; width: min(100%, 440px); aspect-ratio: 1; filter: drop-shadow(0 13px 16px rgb(105 71 130 / 27%)); }
    .wheel { display: block; width: 100%; height: 100%; overflow: visible; border-radius: 50%; transform: rotate(0deg); transition: transform 6.4s cubic-bezier(.08,.72,.12,1); }
    .wheel-ring { fill: none; stroke: #eab64c; stroke-width: 8; }
    .sector { stroke: #fff8df; stroke-width: 3; }
    .sector-label { fill: #fff; font-family: "Noto Sans KR", "Malgun Gothic", sans-serif; font-size: 13px; font-weight: 900; paint-order: stroke; stroke: rgb(69 48 86 / 40%); stroke-linejoin: round; stroke-width: 2px; text-anchor: middle; dominant-baseline: middle; }
    .hub-outer { fill: #fff3bd; stroke: #db9d35; stroke-width: 5; }
    .hub-inner { fill: #fff; stroke: #f2c855; stroke-width: 3; }
    .hub-star { fill: #f5b839; font-size: 31px; font-weight: 900; text-anchor: middle; dominant-baseline: central; }
    .pointer { position: absolute; z-index: 2; top: -4px; left: 50%; width: 0; height: 0; border-right: 19px solid transparent; border-bottom: 0; border-left: 19px solid transparent; border-top: 38px solid #ff526e; filter: drop-shadow(0 3px 2px rgb(100 45 60 / 45%)); transform: translateX(-50%); }
    .pointer::after { position: absolute; top: -36px; left: -9px; width: 18px; height: 18px; border: 3px solid #fff5c9; border-radius: 50%; background: #ffdf65; content: ""; }
    .wheel-caption { margin: 0; color: #837185; font-size: .8rem; font-weight: 750; text-align: center; }
    .side { display: grid; gap: 12px; }
    .result { min-height: 91px; padding: 12px 14px; border: 1px solid #ead8f0; border-radius: 17px; background: rgb(255 255 255 / 82%); box-shadow: 0 5px 15px rgb(103 73 117 / 8%); }
    .result.winner { border-color: #f3cc59; background: linear-gradient(130deg, #fffbe0, #fff 60%, #ffe8f2); animation: winner-pop .45s cubic-bezier(.2,1.4,.4,1) both; }
    .result-title { margin: 0; color: #65477d; font-size: 1rem; font-weight: 900; }
    .result-description { margin: 5px 0 0; color: #716378; font-size: .82rem; line-height: 1.45; }
    .games-title { margin: 0; color: #765984; font-size: .88rem; font-weight: 900; }
    .edit-toggle, .edit-action { min-height: 36px; padding: 7px 10px; border: 1px solid #dfcce7; border-radius: 10px; background: #fff; color: #684b76; font: inherit; font-size: .8rem; font-weight: 800; cursor: pointer; }
    [hidden] { display: none !important; }
    .editor { display: grid; gap: 8px; max-height: 260px; overflow: auto; padding: 2px; }
    .editor-row { display: grid; grid-template-columns: 1fr auto; gap: 6px; padding: 8px; border: 1px solid #ead8f0; border-radius: 12px; background: rgb(255 255 255 / 82%); }
    .editor-fields { display: grid; gap: 5px; }
    .editor input, .editor textarea { width: 100%; box-sizing: border-box; padding: 7px; border: 1px solid #dfd2e3; border-radius: 8px; font: inherit; font-size: .78rem; }
    .editor textarea { min-height: 52px; resize: vertical; }
    .editor-actions { display: flex; flex-wrap: wrap; gap: 6px; }
    .editor-actions .save { background: #755bc6; color: #fff; }
    .edit-action.delete { align-self: center; color: #a23e58; }
    .game-list { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 7px; }
    .game-option { min-height: 45px; padding: 8px 9px; border: 1px solid #e6d8e9; border-radius: 12px; background: rgb(255 255 255 / 84%); color: #67536c; font: inherit; font-size: .8rem; font-weight: 800; line-height: 1.25; cursor: pointer; transition: transform .15s ease, box-shadow .15s ease, background .15s ease; }
    .game-option:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 5px 12px rgb(102 73 118 / 15%); }
    .game-option[aria-pressed="true"] { border: 2px solid #e7a93d; background: #fff5ca; color: #684b24; }
    .controls { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .spin, .start { min-height: 46px; padding: 10px 12px; border: 0; border-radius: 14px; color: #fff; font: inherit; font-weight: 900; cursor: pointer; transition: transform .15s ease, filter .15s ease; }
    .spin:hover:not(:disabled), .start:hover { transform: translateY(-2px); filter: brightness(1.06); }
    .spin:disabled { cursor: wait; opacity: .5; }
    .spin-random { background: linear-gradient(120deg, #f16b83, #e94870); box-shadow: 0 5px 0 #b93660, 0 9px 15px rgb(185 54 96 / 20%); }
    .spin-selected { background: linear-gradient(120deg, #936de1, #6751c5); box-shadow: 0 5px 0 #4b3d9f, 0 9px 15px rgb(91 66 166 / 20%); }
    .start { grid-column: 1 / -1; background: linear-gradient(120deg, #f3b839, #f28b45); box-shadow: 0 5px 0 #bc6b2c, 0 9px 15px rgb(188 107 44 / 20%); }
    .footer-note { margin: 0; color: #927f96; font-size: .73rem; text-align: center; }
    @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
    @keyframes twinkle { from { opacity: .3; transform: rotate(-15deg) scale(.8); } to { opacity: 1; transform: rotate(15deg) scale(1.15); } }
    @keyframes winner-pop { from { opacity: .4; transform: scale(.94); } to { opacity: 1; transform: scale(1); } }
    @media (max-width: 700px) {
      dialog { width: min(560px, calc(100vw - 12px)); max-height: 96vh; max-height: 96dvh; }
      .panel { padding: 15px 12px; border-radius: 22px; }
      .layout { grid-template-columns: 1fr; gap: 8px; }
      .wheel-wrap { width: min(67vw, 320px); }
      .side { gap: 8px; }
      .result { min-height: 70px; padding: 9px 11px; }
      .game-option { min-height: 39px; padding: 6px; font-size: .76rem; }
      .controls { gap: 7px; }
      .spin, .start { min-height: 42px; padding: 8px; font-size: .82rem; }
    }
    @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; } }
  </style>
  <dialog aria-labelledby="roulette-title">
    <section class="panel">
      <header class="top">
        <div><p class="eyebrow">VICTORY REWARD</p><h2 id="roulette-title">오늘의 승리 놀이!</h2><p class="subtitle">아빠와 함께 신나는 보상 놀이를 골라봐요.</p></div>
        <button type="button" class="close" aria-label="룰렛 닫기">×</button>
      </header>
      <div class="layout">
        <section class="wheel-area" aria-label="놀이 룰렛">
          <div class="wheel-wrap"><span class="pointer" aria-hidden="true"></span><svg class="wheel" viewBox="0 0 360 360" role="img" aria-label="8가지 놀이가 들어 있는 룰렛"></svg></div>
          <p class="wheel-caption">화살표에 멈춘 놀이가 오늘의 보상이에요!</p>
        </section>
        <section class="side">
          <div class="result" role="status" aria-live="polite"><p class="result-title">어떤 놀이가 나올까요?</p><p class="result-description">무작위로 돌리거나, 하고 싶은 놀이를 골라 돌려보세요.</p></div>
          <p class="games-title">직접 고르고 싶다면</p>
          <button type="button" class="edit-toggle">룰렛 항목 수정</button>
          <div class="editor" hidden aria-label="룰렛 항목 편집"></div>
          <div class="editor-actions" hidden><button type="button" class="edit-action add">항목 추가</button><button type="button" class="edit-action save">저장</button><button type="button" class="edit-action cancel">취소</button></div>
          <div class="game-list" role="group" aria-label="직접 선택할 놀이"></div>
          <div class="controls">
            <button type="button" class="spin spin-random">🎡 무작위 스핀</button>
            <button type="button" class="spin spin-selected" disabled>선택 놀이로 스핀</button>
            <button type="button" class="start" hidden>놀이 시작!</button>
          </div>
          <p class="footer-note">안전한 공간에서 아빠와 함께 즐겨요 ✨</p>
        </section>
      </div>
    </section>
  </dialog>
`;

class RewardRoulette extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.append(template.content.cloneNode(true));
    this._dialog = this.shadowRoot.querySelector("dialog");
    this._wheel = this.shadowRoot.querySelector(".wheel");
    this._games = [];
    this._rotation = 0;
    this._selectedId = null;
    this._spinning = false;
    this._spinningGame = null;
    this._editing = false;
    this._dialog.addEventListener("click", (event) => {
      if (event.target === this._dialog) this._dialog.close();
    });
    this.shadowRoot.querySelector(".close").addEventListener("click", () => this._dialog.close());
    this.shadowRoot.querySelector(".start").addEventListener("click", () => this._dialog.close());
    this.shadowRoot.querySelector(".spin-random").addEventListener("click", () => this.spinRandom());
    this.shadowRoot.querySelector(".spin-selected").addEventListener("click", () => this.spinSelected());
    this.shadowRoot.querySelector(".edit-toggle").addEventListener("click", () => this.beginEdit());
    this.shadowRoot.querySelector(".editor-actions .add").addEventListener("click", () => this.addGame());
    this.shadowRoot.querySelector(".editor-actions .save").addEventListener("click", () => this.saveEdit());
    this.shadowRoot.querySelector(".editor-actions .cancel").addEventListener("click", () => this.cancelEdit());
  }

  show(games) {
    if (!Array.isArray(games) || games.length < 2 || this._spinning) return;
    this._games = games;
    this._rotation = 0;
    this._selectedId = null;
    this._winner = null;
    this._wheel.style.transition = "none";
    this._wheel.style.transform = "rotate(0deg)";
    this.renderWheel();
    this.renderChoices();
    this.setResult("어떤 놀이가 나올까요?", "무작위로 돌리거나, 하고 싶은 놀이를 골라 돌려보세요.", false);
    this.shadowRoot.querySelector(".spin-random").disabled = false;
    this.shadowRoot.querySelector(".spin-selected").disabled = true;
    this.shadowRoot.querySelector(".start").hidden = true;
    if (!this._dialog.open) this._dialog.showModal();
    this.shadowRoot.querySelector(".spin-random").focus();
  }

  renderWheel() {
    const svg = this._wheel;
    svg.replaceChildren();
    const segmentAngle = 360 / this._games.length;
    const center = 180;
    const radius = 172;

    this._games.forEach((game, index) => {
      const startAngle = (index * segmentAngle - 90) * Math.PI / 180;
      const endAngle = ((index + 1) * segmentAngle - 90) * Math.PI / 180;
      const start = { x: center + radius * Math.cos(startAngle), y: center + radius * Math.sin(startAngle) };
      const end = { x: center + radius * Math.cos(endAngle), y: center + radius * Math.sin(endAngle) };
      const sector = document.createElementNS(SVG_NS, "path");
      sector.setAttribute("d", `M ${center} ${center} L ${start.x} ${start.y} A ${radius} ${radius} 0 0 1 ${end.x} ${end.y} Z`);
      sector.setAttribute("fill", WHEEL_COLORS[index % WHEEL_COLORS.length]);
      sector.setAttribute("class", "sector");
      svg.append(sector);

      const middleAngle = (index * segmentAngle + segmentAngle / 2 - 90) * Math.PI / 180;
      const textX = center + 112 * Math.cos(middleAngle);
      const textY = center + 112 * Math.sin(middleAngle);
      const label = document.createElementNS(SVG_NS, "text");
      label.setAttribute("x", String(textX));
      label.setAttribute("y", String(textY));
      label.setAttribute("class", "sector-label");
      const words = game.title.replaceAll(" ", "");
      const lineLength = words.length > 8 ? 5 : Math.ceil(words.length / 2);
      const lines = [words.slice(0, lineLength), words.slice(lineLength)].filter(Boolean);
      lines.forEach((line, lineIndex) => {
        const tspan = document.createElementNS(SVG_NS, "tspan");
        tspan.setAttribute("x", String(textX));
        tspan.setAttribute("dy", lineIndex === 0 ? (lines.length === 1 ? "0" : "-0.55em") : "1.1em");
        tspan.textContent = line;
        label.append(tspan);
      });
      svg.append(label);
    });

    const ring = document.createElementNS(SVG_NS, "circle");
    ring.setAttribute("cx", String(center));
    ring.setAttribute("cy", String(center));
    ring.setAttribute("r", "176");
    ring.setAttribute("class", "wheel-ring");
    svg.append(ring);
    const hubOuter = document.createElementNS(SVG_NS, "circle");
    hubOuter.setAttribute("cx", String(center));
    hubOuter.setAttribute("cy", String(center));
    hubOuter.setAttribute("r", "37");
    hubOuter.setAttribute("class", "hub-outer");
    svg.append(hubOuter);
    const hubInner = document.createElementNS(SVG_NS, "circle");
    hubInner.setAttribute("cx", String(center));
    hubInner.setAttribute("cy", String(center));
    hubInner.setAttribute("r", "28");
    hubInner.setAttribute("class", "hub-inner");
    svg.append(hubInner);
    const star = document.createElementNS(SVG_NS, "text");
    star.setAttribute("x", String(center));
    star.setAttribute("y", String(center + 1));
    star.setAttribute("class", "hub-star");
    star.textContent = "★";
    svg.append(star);
  }

  renderChoices() {
    const list = this.shadowRoot.querySelector(".game-list");
    list.replaceChildren();
    this._games.forEach((game) => {
      const option = document.createElement("button");
      option.type = "button";
      option.className = "game-option";
      option.textContent = game.title;
      option.setAttribute("aria-pressed", "false");
      option.addEventListener("click", () => this.selectGame(game));
      list.append(option);
    });
  }

  beginEdit() {
    if (this._spinning || this._games.length === 0) return;
    this._editing = true;
    this._draftGames = this._games.map((game) => ({ ...game }));
    this.renderEditor();
    this.shadowRoot.querySelector(".editor").hidden = false;
    this.shadowRoot.querySelector(".editor-actions").hidden = false;
    this.shadowRoot.querySelector(".game-list").hidden = true;
    this.shadowRoot.querySelector(".edit-toggle").hidden = true;
  }

  renderEditor() {
    const editor = this.shadowRoot.querySelector(".editor");
    editor.replaceChildren();
    this._draftGames.forEach((game, index) => {
      const row = document.createElement("div");
      row.className = "editor-row";
      const fields = document.createElement("div");
      fields.className = "editor-fields";
      const title = document.createElement("input");
      title.value = game.title;
      title.maxLength = 32;
      title.setAttribute("aria-label", `항목 ${index + 1} 이름`);
      title.placeholder = "항목 이름";
      title.addEventListener("input", () => { game.title = title.value; });
      const description = document.createElement("textarea");
      description.value = game.description;
      description.maxLength = 180;
      description.setAttribute("aria-label", `항목 ${index + 1} 설명`);
      description.placeholder = "설명";
      description.addEventListener("input", () => { game.description = description.value; });
      fields.append(title, description);
      const remove = document.createElement("button");
      remove.type = "button";
      remove.className = "edit-action delete";
      remove.textContent = "삭제";
      remove.addEventListener("click", () => {
        if (this._draftGames.length <= 2) return;
        this._draftGames.splice(index, 1);
        this.renderEditor();
      });
      row.append(fields, remove);
      editor.append(row);
    });
  }

  addGame() {
    this._draftGames.push({ id: `custom-${Date.now()}`, title: "새 놀이", description: "함께 즐길 놀이를 적어주세요." });
    this.renderEditor();
    this.shadowRoot.querySelector(".editor").lastElementChild?.querySelector("input")?.focus();
  }

  saveEdit() {
    const games = this._draftGames.map((game) => ({ ...game, title: game.title.trim(), description: game.description.trim() }));
    if (games.length < 2 || games.some((game) => !game.title || !game.description)) {
      this.setResult("항목을 확인해 주세요", "항목은 2개 이상이어야 하며 이름과 설명을 모두 입력해야 해요.", false);
      return;
    }
    const ids = new Set();
    games.forEach((game, index) => {
      if (!game.id || ids.has(game.id)) game.id = `custom-${Date.now()}-${index}`;
      ids.add(game.id);
    });
    this._games = games;
    this.renderWheel();
    this.renderChoices();
    this.finishEdit();
    this.setResult("룰렛 항목을 저장했어요", "수정한 항목으로 룰렛을 돌릴 수 있어요.", false);
    this.dispatchEvent(new CustomEvent("games-change", { detail: { games: this._games }, bubbles: true, composed: true }));
  }

  cancelEdit() { this.finishEdit(); }

  finishEdit() {
    this._editing = false;
    this.shadowRoot.querySelector(".editor").hidden = true;
    this.shadowRoot.querySelector(".editor-actions").hidden = true;
    this.shadowRoot.querySelector(".game-list").hidden = false;
    this.shadowRoot.querySelector(".edit-toggle").hidden = false;
  }

  selectGame(game) {
    if (this._spinning) return;
    this._selectedId = game.id;
    this._winner = null;
    this.shadowRoot.querySelectorAll(".game-option").forEach((option, index) => {
      option.setAttribute("aria-pressed", String(this._games[index].id === game.id));
    });
    this.shadowRoot.querySelector(".spin-selected").disabled = false;
    this.shadowRoot.querySelector(".start").hidden = true;
    this.setResult(`선택한 놀이: ${game.title}`, "이 놀이에 룰렛을 멈추고 싶다면 ‘선택 놀이로 스핀’을 눌러요.", false);
  }

  spinRandom() {
    if (this._spinning || this._games.length === 0) return;
    const index = Math.floor(Math.random() * this._games.length);
    this.spinTo(index);
  }

  spinSelected() {
    if (this._spinning || !this._selectedId) return;
    const index = this._games.findIndex((game) => game.id === this._selectedId);
    if (index >= 0) this.spinTo(index);
  }

  spinTo(index) {
    const game = this._games[index];
    if (!game || this._spinning) return;
    this._spinning = true;
    this._spinningGame = game;
    this._winner = null;
    this.shadowRoot.querySelector(".spin-random").disabled = true;
    this.shadowRoot.querySelector(".spin-selected").disabled = true;
    this.shadowRoot.querySelector(".start").hidden = true;
    this.setResult("두근두근… 룰렛이 돌아가고 있어요!", "화살표가 멈추는 곳을 지켜봐요!", false);

    const fullTurn = 360;
    const targetRotation = ((fullTurn - ((index + 0.5) * fullTurn / this._games.length) % fullTurn) + fullTurn) % fullTurn;
    const currentRotation = ((this._rotation % fullTurn) + fullTurn) % fullTurn;
    const correction = (targetRotation - currentRotation + fullTurn) % fullTurn;
    this._rotation += fullTurn * 7 + correction;
    this._wheel.style.transition = "transform 6.4s cubic-bezier(.08,.72,.12,1)";
    requestAnimationFrame(() => { this._wheel.style.transform = `rotate(${this._rotation}deg)`; });

    this._wheel.addEventListener("transitionend", (event) => {
      if (event.propertyName === "transform") this.finishSpin();
    }, { once: true });
    this._spinTimer = setTimeout(() => this.finishSpin(), 6900);
  }

  finishSpin() {
    if (!this._spinning || !this._spinningGame) return;
    clearTimeout(this._spinTimer);
    this._spinning = false;
    this._winner = this._spinningGame;
    this._selectedId = this._winner.id;
    this.shadowRoot.querySelectorAll(".game-option").forEach((option, index) => {
      option.setAttribute("aria-pressed", String(this._games[index].id === this._winner.id));
    });
    this.shadowRoot.querySelector(".spin-random").disabled = false;
    this.shadowRoot.querySelector(".spin-selected").disabled = false;
    this.shadowRoot.querySelector(".start").hidden = false;
    this.setResult(`🎉 오늘의 보상: ${this._winner.title}!`, this._winner.description, true);
  }

  setResult(title, description, isWinner) {
    const result = this.shadowRoot.querySelector(".result");
    result.classList.toggle("winner", isWinner);
    result.querySelector(".result-title").textContent = title;
    result.querySelector(".result-description").textContent = description;
  }
}

customElements.define("reward-roulette", RewardRoulette);
