import { playAttackSound } from "../sound-effects.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host { display: block; margin-top: 8px; text-align: left; }
    :host([hidden]) { display: none !important; }
    .panel { padding: clamp(10px, 1.5vh, 16px); border: 1px solid #e7ecd9; border-radius: 18px; background: #fbfff5; }
    .heading { display: flex; justify-content: space-between; align-items: end; gap: 10px; margin-bottom: 8px; }
    .eyebrow { margin: 0 0 4px; color: #82956e; font-size: .76rem; font-weight: 800; letter-spacing: .08em; }
    h3 { margin: 0; color: #43513b; font-size: 1.15rem; }
    .count { color: #718065; font-size: .8rem; font-weight: 700; }
    .tasks { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 6px; margin: 0; padding: 0; list-style: none; }
    li { display: grid; grid-template-columns: 22px 22px minmax(0, 1fr) auto; align-items: center; gap: 6px; min-width: 0; padding: 7px 9px; border-radius: 11px; background: #fff; color: #4d463f; font-size: .9rem; }
    li.drag-over { outline: 2px dashed #88a96e; background: #f1f7e9; }
    li.dragging { opacity: .55; }
    .drag-handle { padding: 2px; border: 0; background: transparent; color: #89977d; font-size: 1rem; cursor: grab; touch-action: none; user-select: none; }
    .drag-handle:active { cursor: grabbing; }
    .task-actions, .editor-actions, .toolbar { display: flex; align-items: center; gap: 7px; }
    button { border: 1px solid #dce5d2; border-radius: 8px; padding: 5px 8px; background: #fff; color: #536448; font: inherit; font-size: .74rem; font-weight: 700; cursor: pointer; }
    button:hover { background: #f1f7e9; }
    .delete { color: #a45151; border-color: #efdada; }
    .editor { display: flex; flex-wrap: wrap; gap: 8px; margin: 8px 0; }
    .editor[hidden] { display: none; }
    .editor input { flex: 1 1 180px; min-width: 0; border: 1px solid #dce5d2; border-radius: 9px; padding: 9px 11px; font: inherit; }
    .popup-backdrop { position: fixed; z-index: 1000; inset: 0; display: grid; place-items: center; padding: 20px; background: rgb(39 47 35 / 48%); }
    .popup-backdrop[hidden] { display: none; }
    .popup { width: min(100%, 400px); padding: 22px; border: 1px solid #e7ecd9; border-radius: 20px; background: #fbfff5; box-shadow: 0 18px 55px rgb(37 48 31 / 24%); }
    .popup h4 { margin: 0 0 15px; color: #43513b; font-size: 1.2rem; }
    .popup .editor { margin: 0; }
    .popup-actions { display: flex; justify-content: flex-end; gap: 8px; }
    .popup-actions[hidden] { display: none; }
    .popup-message { margin: 0 0 15px; color: #655c53; line-height: 1.5; }
    input[type="checkbox"] { width: 21px; height: 21px; margin: 0; accent-color: #88a96e; cursor: pointer; }
    input[type="checkbox"]:disabled { cursor: wait; }
    .task-text { line-height: 1.5; }
    input:checked + .task-text { color: #8b9384; text-decoration: line-through; }
    .empty { margin: 0; padding: 14px; border-radius: 14px; background: #fff; color: #756761; text-align: center; }
    .battle { margin: 0 0 8px; padding: 8px 11px; border: 1px solid #f0dfc9; border-radius: 14px; background: linear-gradient(135deg, #fff7e9, #f3f8e9); }
    .battle-top { display: flex; justify-content: space-between; align-items: baseline; gap: 10px; margin-bottom: 5px; }
    .monster-name { margin: 0; color: #655344; font-weight: 800; }
    .hp-label { margin: 0; color: #7c514b; font-size: .88rem; font-weight: 800; white-space: nowrap; }
    .hp-track { height: 8px; overflow: hidden; border-radius: 999px; background: #ead8d3; }
    .hp-fill { display: block; width: 100%; height: 100%; border-radius: inherit; background: linear-gradient(90deg, #f47f76, #d95353); transition: width .45s ease; }
    .fighters { position: relative; display: none; grid-template-columns: 1fr auto 1fr; align-items: center; min-height: 92px; overflow: hidden; }
    .fighters.visible { display: grid; }
    figure { display: grid; justify-items: center; gap: 4px; margin: 0; }
    figure img { width: min(100%, 100px); height: 78px; object-fit: contain; }
    figcaption { color: #817065; font-size: .78rem; font-weight: 750; }
    .vs { z-index: 1; color: #d89048; font-size: 1.1rem; font-weight: 900; }
    .impact { position: absolute; z-index: 2; top: 42%; left: 50%; color: #ed7d4d; font-size: 2.6rem; opacity: 0; transform: translate(-50%, -50%) scale(.2) rotate(-15deg); }
    .fighters figure { position: relative; z-index: 1; }
    .fighters.attacking { animation: stage-shake .82s ease-in-out; }
    .fighters.attacking::before { position: absolute; z-index: 2; top: 48%; left: 8%; width: 84%; height: 6px; border-radius: 99px; background: linear-gradient(90deg, transparent, #fff47a 20%, #fff 50%, #ff8a63 80%, transparent); box-shadow: 0 0 18px 6px rgb(255 153 75 / 75%); content: ""; pointer-events: none; transform: rotate(-10deg) scaleX(0); animation: slash .82s ease-out; }
    .fighters.attacking figure:first-of-type { animation: monster-recoil .82s cubic-bezier(.2,.8,.3,1); }
    .fighters.attacking figure:last-of-type { animation: hero-lunge .82s cubic-bezier(.2,.8,.3,1); }
    .fighters.attacking .impact { z-index: 4; color: #fff25c; font-size: 4.2rem; filter: drop-shadow(0 0 8px #ff784e) drop-shadow(0 0 20px #ffcf47); animation: impact .82s ease-out; }
    .fighters.defeated figure:first-of-type { filter: grayscale(1); opacity: .35; transform: rotate(12deg) scale(.88); transition: .35s ease; }
    .battle-message { min-height: 1.2em; margin: 4px 0 0; color: #756761; font-size: .78rem; text-align: center; }
    @keyframes hero-lunge { 0%, 100% { transform: translateX(0) scale(1); } 30% { transform: translateX(-34px) rotate(-9deg) scale(1.18); } 56% { transform: translateX(9px) rotate(5deg) scale(.94); } 76% { transform: translateX(-7px) rotate(-3deg) scale(1.04); } }
    @keyframes monster-recoil { 0%, 100% { transform: translateX(0) scale(1); } 30% { transform: translateX(25px) rotate(11deg) scale(.88); } 56% { transform: translateX(-8px) rotate(-5deg) scale(1.06); } 76% { transform: translateX(5px) rotate(3deg) scale(.98); } }
    @keyframes stage-shake { 0%, 100% { transform: translateX(0); } 28% { transform: translateX(-5px); } 38% { transform: translateX(6px); } 50% { transform: translateX(-4px); } 62% { transform: translateX(3px); } }
    @keyframes slash { 0% { opacity: 0; transform: rotate(-10deg) scaleX(0); } 28% { opacity: 1; transform: rotate(-10deg) scaleX(1); } 70% { opacity: .7; } 100% { opacity: 0; transform: rotate(-10deg) scaleX(.4); } }
    @keyframes impact { 0%, 20% { opacity: 0; transform: translate(-50%, -50%) scale(.1) rotate(-30deg); } 38% { opacity: 1; transform: translate(-50%, -50%) scale(1.5) rotate(18deg); } 70% { opacity: .95; transform: translate(-50%, -50%) scale(1) rotate(0); } 100% { opacity: 0; transform: translate(-50%, -50%) scale(.2) rotate(30deg); } }
    @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; transition-duration: .01ms !important; } }
    @media (max-width: 560px) {
      .tasks { gap: 5px; }
      li { grid-template-columns: 18px 18px minmax(0, 1fr); gap: 4px; padding: 6px; font-size: .8rem; }
      .task-actions { grid-column: 3; }
      .task-actions button { padding: 3px 6px; font-size: .68rem; }
      input[type="checkbox"] { width: 18px; height: 18px; }
    }
    @media (max-height: 700px) {
      .eyebrow { margin-bottom: 1px; }
      .battle { padding: 6px 9px; }
      .fighters { min-height: 72px; }
      figure img { height: 60px; }
      .tasks { gap: 4px; }
      li { padding-top: 5px; padding-bottom: 5px; }
    }
  </style>
  <section class="panel" aria-label="오늘의 루틴 목록">
    <div class="heading">
      <div><p class="eyebrow">TODAY'S ROUTINE</p><h3 class="day"></h3></div>
      <span class="count"></span>
    </div>
    <section class="battle" aria-label="몬스터 결투와 HP">
      <div class="battle-top"><p class="monster-name"></p><p class="hp-label" aria-live="polite"></p></div>
      <div class="hp-track" role="progressbar" aria-label="몬스터 HP"><span class="hp-fill"></span></div>
      <div class="fighters">
        <figure><img class="monster-image" alt=""><figcaption class="monster-caption"></figcaption></figure>
        <span class="vs" aria-hidden="true">VS</span>
        <figure><img class="hero-image" alt=""><figcaption class="hero-name"></figcaption></figure>
        <span class="impact" aria-hidden="true">✹</span>
      </div>
      <p class="battle-message" role="status">루틴 체크로 공격을 시작해봐요!</p>
    </section>
    <div class="toolbar"><button type="button" class="add">+ 루틴 추가</button></div>
    <ol class="tasks"></ol>
    <p class="empty" hidden>오늘은 예정된 루틴이 없어요. 편안한 하루 보내요!</p>
  </section>
  <div class="popup-backdrop" hidden>
    <section class="popup" role="dialog" aria-modal="true" aria-labelledby="popup-title">
      <h4 id="popup-title"></h4>
      <p class="popup-message" hidden></p>
      <form class="editor" hidden><input type="text" maxlength="80" aria-label="루틴 이름" placeholder="루틴 이름"><div class="editor-actions"><button type="submit" class="save">저장</button><button type="button" class="cancel">취소</button></div></form>
      <div class="popup-actions" hidden><button type="button" class="confirm-delete delete">삭제</button><button type="button" class="cancel-delete">취소</button></div>
    </section>
  </div>
`;

const dayNames = {
  Monday: "월요일", Tuesday: "화요일", Wednesday: "수요일", Thursday: "목요일",
  Friday: "금요일", Saturday: "토요일", Sunday: "일요일",
};

class RoutineList extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._entry = null;
    this._hp = 0;
    this._maxHp = 0;
    this._completed = new Set();
    this._busy = false;
    this._editingId = null;
    this._deletingId = null;
    this._dragState = null;
  }

  set entry(value) {
    this._entry = value;
    this._maxHp = value.tasks.length;
    this._hp = this._maxHp;
    this._completed = new Set();
    this.render();
  }

  render() {
    if (!this._entry) return;
    this.shadowRoot.replaceChildren(template.content.cloneNode(true));

    const { dayKey, tasks, character, monster } = this._entry;
    tasks.sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    const day = dayNames[dayKey] ?? dayKey;
    const list = this.shadowRoot.querySelector(".tasks");
    this.shadowRoot.querySelector(".day").textContent = day;
    this.shadowRoot.querySelector(".count").textContent = `${tasks.length}개 루틴`;
    this.shadowRoot.querySelector(".empty").hidden = tasks.length > 0;

    const battle = this.shadowRoot.querySelector(".battle");
    battle.hidden = tasks.length === 0;
    battle.querySelector(".monster-name").textContent = `상대 몬스터: ${monster.name}`;
    battle.querySelector(".hero-image").src = character.image;
    battle.querySelector(".hero-image").alt = character.name;
    battle.querySelector(".hero-name").textContent = character.name;
    battle.querySelector(".monster-image").src = monster.image;
    battle.querySelector(".monster-image").alt = monster.name;
    battle.querySelector(".monster-caption").textContent = monster.name;
    this.updateHp();

    tasks.forEach((task, index) => {
      const item = document.createElement("li");
      const checkbox = document.createElement("input");
      const dragHandle = document.createElement("button");
      const text = document.createElement("label");
      const actions = document.createElement("div");
      const editButton = document.createElement("button");
      const deleteButton = document.createElement("button");
      const checkboxId = `routine-${dayKey}-${index}`;
      item.dataset.taskId = task.id;
      checkbox.type = "checkbox";
      checkbox.id = checkboxId;
      checkbox.checked = false;
      checkbox.setAttribute("aria-label", `${task.text} 완료`);
      dragHandle.type = "button";
      dragHandle.className = "drag-handle";
      dragHandle.textContent = "⠿";
      dragHandle.setAttribute("aria-label", `${task.text} 순서 이동`);
      dragHandle.disabled = this._busy;
      text.className = "task-text";
      text.htmlFor = checkboxId;
      text.textContent = task.text;
      checkbox.addEventListener("change", () => this.toggleTask(task, checkbox));
      actions.className = "task-actions";
      editButton.type = deleteButton.type = "button";
      editButton.disabled = deleteButton.disabled = this._busy;
      editButton.textContent = "수정";
      deleteButton.textContent = "삭제";
      deleteButton.className = "delete";
      editButton.addEventListener("click", () => this.openEditor(task));
      deleteButton.addEventListener("click", () => this.openDeletePopup(task));
      dragHandle.addEventListener("pointerdown", (event) => this.startDrag(event, task.id, dragHandle));
      dragHandle.addEventListener("pointermove", (event) => this.moveDrag(event));
      dragHandle.addEventListener("pointerup", (event) => this.finishDrag(event));
      dragHandle.addEventListener("pointercancel", (event) => this.finishDrag(event, true));
      actions.append(editButton, deleteButton);
      item.append(checkbox, dragHandle, text, actions);
      list.append(item);
    });

    const editor = this.shadowRoot.querySelector(".editor");
    const input = editor.querySelector("input");
    const backdrop = this.shadowRoot.querySelector(".popup-backdrop");
    const addButton = this.shadowRoot.querySelector(".add");
    addButton.disabled = this._busy;
    addButton.addEventListener("click", () => this.openEditor());
    this.shadowRoot.querySelector(".cancel").addEventListener("click", () => this.closeEditor());
    editor.addEventListener("submit", (event) => {
      event.preventDefault();
      const text = input.value.trim();
      if (!text) { input.focus(); return; }
      const nextTasks = [...this._entry.tasks];
      if (this._editingId) {
        const task = nextTasks.find((item) => item.id === this._editingId);
        if (task) task.text = text;
      } else {
        nextTasks.push({ text, id: `custom-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, done: false, sortOrder: nextTasks.length + 1 });
      }
      this.updateTasks(nextTasks);
    });
    this.shadowRoot.querySelector(".cancel-delete").addEventListener("click", () => this.closePopup());
    this.shadowRoot.querySelector(".confirm-delete").addEventListener("click", () => {
      if (this._deletingId) this.removeTask(this._deletingId);
    });
    backdrop.addEventListener("click", (event) => {
      if (event.target === backdrop) this.closePopup();
    });
    backdrop.addEventListener("keydown", (event) => {
      if (event.key === "Escape") this.closePopup();
    });
  }

  startDrag(event, taskId, handle) {
    if (this._busy || event.button !== 0) return;
    event.preventDefault();
    this._dragState = {
      taskId, pointerId: event.pointerId,
      startX: event.clientX, startY: event.clientY,
      targetId: taskId, insertAfter: false, dragging: false,
    };
    handle.setPointerCapture(event.pointerId);
  }

  moveDrag(event) {
    const state = this._dragState;
    if (!state || state.pointerId !== event.pointerId) return;
    if (!state.dragging && Math.hypot(event.clientX - state.startX, event.clientY - state.startY) < 5) return;
    state.dragging = true;
    event.preventDefault();
    this.shadowRoot.querySelectorAll("li").forEach((row) => row.classList.remove("drag-over"));
    const source = [...this.shadowRoot.querySelectorAll("li")].find((row) => row.dataset.taskId === state.taskId);
    source?.classList.add("dragging");
    const target = this.shadowRoot.elementFromPoint(event.clientX, event.clientY)?.closest("li");
    if (!target || target.dataset.taskId === state.taskId) return;
    target.classList.add("drag-over");
    state.targetId = target.dataset.taskId;
    state.insertAfter = event.clientY > target.getBoundingClientRect().top + target.offsetHeight / 2;
  }

  finishDrag(event, cancelled = false) {
    const state = this._dragState;
    if (!state || state.pointerId !== event.pointerId) return;
    this._dragState = null;
    this.shadowRoot.querySelectorAll("li").forEach((row) => row.classList.remove("dragging", "drag-over"));
    if (!cancelled && state.dragging && state.targetId !== state.taskId) {
      this.reorderTasks(state.taskId, state.targetId, state.insertAfter);
    }
  }

  reorderTasks(sourceId, targetId, insertAfter) {
    const nextTasks = [...this._entry.tasks].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
    const sourceIndex = nextTasks.findIndex((task) => task.id === sourceId);
    const targetIndex = nextTasks.findIndex((task) => task.id === targetId);
    if (sourceIndex < 0 || targetIndex < 0) return;
    let insertionIndex = targetIndex + (insertAfter ? 1 : 0);
    const [movingTask] = nextTasks.splice(sourceIndex, 1);
    if (sourceIndex < insertionIndex) insertionIndex -= 1;
    nextTasks.splice(insertionIndex, 0, movingTask);
    this.updateTasks(nextTasks);
  }

  openEditor(task = null) {
    const editor = this.shadowRoot.querySelector(".editor");
    this._editingId = task?.id ?? null;
    this._deletingId = null;
    editor.querySelector("input").value = task?.text ?? "";
    this.shadowRoot.querySelector("#popup-title").textContent = task ? "루틴 수정" : "루틴 추가";
    this.shadowRoot.querySelector(".popup-message").hidden = true;
    this.shadowRoot.querySelector(".popup-actions").hidden = true;
    this.shadowRoot.querySelector(".save").textContent = task ? "저장" : "추가";
    editor.hidden = false;
    this.shadowRoot.querySelector(".popup-backdrop").hidden = false;
    editor.querySelector("input").focus();
  }

  openDeletePopup(task) {
    this._editingId = null;
    this._deletingId = task.id;
    this.shadowRoot.querySelector("#popup-title").textContent = "루틴 삭제 확인";
    const message = this.shadowRoot.querySelector(".popup-message");
    message.textContent = `“${task.text}” 루틴을 삭제할까요?`;
    message.hidden = false;
    this.shadowRoot.querySelector(".editor").hidden = true;
    this.shadowRoot.querySelector(".popup-actions").hidden = false;
    this.shadowRoot.querySelector(".popup-backdrop").hidden = false;
    this.shadowRoot.querySelector(".cancel-delete").focus();
  }

  closeEditor() {
    this._editingId = null;
    const editor = this.shadowRoot.querySelector(".editor");
    editor.reset();
    editor.hidden = true;
    this.closePopup();
  }

  closePopup() {
    this._editingId = null;
    this._deletingId = null;
    this.shadowRoot.querySelector(".popup-backdrop").hidden = true;
  }

  removeTask(taskId) {
    this.updateTasks(this._entry.tasks.filter((task) => task.id !== taskId));
  }

  updateTasks(tasks) {
    const taskIds = new Set(tasks.map((task) => task.id));
    this._completed = new Set([...this._completed].filter((id) => taskIds.has(id)));
    tasks.forEach((task, index) => { task.sortOrder = index + 1; });
    this._entry.tasks = tasks;
    this.closeEditor();
    this._maxHp = tasks.length;
    this._hp = Math.max(0, this._maxHp - this._completed.size);
    this.dispatchEvent(new CustomEvent("routine-change", {
      detail: { dayKey: this._entry.dayKey, tasks }, bubbles: true, composed: true,
    }));
    this.render();
  }

  updateHp() {
    const track = this.shadowRoot.querySelector(".hp-track");
    if (!track) return;
    const fill = track.querySelector(".hp-fill");
    const ratio = this._maxHp === 0 ? 0 : this._hp / this._maxHp;
    fill.style.width = `${ratio * 100}%`;
    track.setAttribute("aria-valuemin", "0");
    track.setAttribute("aria-valuemax", String(this._maxHp));
    track.setAttribute("aria-valuenow", String(this._hp));
    this.shadowRoot.querySelector(".hp-label").textContent = `HP ${this._hp} / ${this._maxHp}`;
    this.shadowRoot.querySelector(".fighters").classList.toggle("defeated", this._hp === 0 && this._maxHp > 0);
  }

  async toggleTask(task, checkbox) {
    if (this._busy) return;
    const battleMessage = this.shadowRoot.querySelector(".battle-message");

    if (!checkbox.checked) {
      if (this._completed.delete(task.id)) {
        this._hp = Math.min(this._maxHp, this._hp + 1);
        this.updateHp();
        battleMessage.textContent = `체크를 취소해 HP가 1 회복됐어요.`;
      }
      return;
    }

    this._busy = true;
    playAttackSound();
    this.shadowRoot.querySelectorAll(".task-actions button, .add").forEach((button) => { button.disabled = true; });
    this.shadowRoot.querySelectorAll('input[type="checkbox"]').forEach((input) => { input.disabled = true; });
    const fighters = this.shadowRoot.querySelector(".fighters");
    fighters.classList.add("visible");
    fighters.classList.remove("attacking");
    void fighters.offsetWidth;
    fighters.classList.add("attacking");
    battleMessage.textContent = `${this._entry.character.name}의 공격! ${task.text} 완료!`;

    await new Promise((resolve) => setTimeout(resolve, 850));
    this._completed.add(task.id);
    this._hp = Math.max(0, this._hp - 1);
    this.updateHp();
    battleMessage.textContent = this._hp === 0
      ? `${this._entry.monster.name}을(를) 물리쳤어요! 오늘 루틴을 모두 해냈어요!`
      : `${this._entry.monster.name}의 HP가 줄었어요! 다음 루틴도 힘내요!`;
    fighters.classList.add("visible");
    fighters.classList.remove("attacking");
    if (this._hp === 0) {
      this.dispatchEvent(new CustomEvent("routine-complete", { detail: { character: this._entry.character }, bubbles: true, composed: true }));
    }
    this._busy = false;
    this.shadowRoot.querySelectorAll(".task-actions button, .add").forEach((button) => { button.disabled = false; });
    this.shadowRoot.querySelectorAll('input[type="checkbox"]').forEach((input) => { input.disabled = false; });
  }
}

customElements.define("routine-list", RoutineList);







