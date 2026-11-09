import { playCelebrationSound } from "../sound-effects.js";

const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host { display: contents; }
    dialog { width: min(440px, calc(100vw - 28px)); max-width: none; max-height: min(90vh, 760px); overflow: auto; margin: auto; padding: 0; border: 0; border-radius: 28px; background: transparent; color: #493c35; }
    dialog::backdrop { background: rgba(54, 43, 40, .58); backdrop-filter: blur(4px); animation: fade-in .2s ease both; }
    .card { position: relative; z-index: 1; display: grid; justify-items: center; gap: 10px; overflow: hidden; padding: 32px 24px 26px; border: 1px solid #f2ddb0; border-radius: 28px; background: linear-gradient(145deg, #fff5d8, #ffedf1 58%, #edf8e5); box-shadow: 0 24px 80px rgba(48, 38, 32, .24); text-align: center; }
    .card.show { animation: pop .45s cubic-bezier(.2, 1.35, .4, 1) both; }
    h2, p, img, button { position: relative; z-index: 1; }
    h2 { margin: 2px 0 0; color: #76523d; font-size: clamp(1.45rem, 6vw, 1.9rem); }
    .speaker { margin: 0; color: #927354; font-weight: 800; }
    .message { margin: 0; max-width: 34ch; color: #574940; font-size: 1.08rem; font-weight: 750; line-height: 1.75; word-break: keep-all; }
    img { width: 118px; height: 118px; object-fit: contain; }
    button { margin-top: 8px; padding: 12px 34px; border: 0; border-radius: 999px; background: #f5c46d; color: #493b2b; font: inherit; font-weight: 850; cursor: pointer; }
    button:hover { background: #f1b74e; }
    button:focus-visible { outline: 3px solid #7e9f69; outline-offset: 3px; }
    .fireworks { position: fixed; z-index: 0; inset: 0; overflow: hidden; pointer-events: none; }
    .fireworks.show::before { position: absolute; inset: 0; background: radial-gradient(circle at 14% 18%, rgb(255 210 74 / 35%), transparent 24%), radial-gradient(circle at 83% 27%, rgb(255 105 158 / 30%), transparent 25%), radial-gradient(circle at 51% 73%, rgb(104 207 255 / 28%), transparent 30%); content: ""; animation: sky-flash 1.1s ease-out 4 both; }
    .burst { position: absolute; width: 10px; height: 10px; border-radius: 50%; opacity: 0; transform: scale(.08); filter: drop-shadow(0 0 8px #fff5b8); }
    .burst.large { width: 17px; height: 17px; }
    .burst.small { width: 6px; height: 6px; }
    .fireworks.show .burst { animation: firework 1.9s cubic-bezier(.12,.55,.28,1) 2 both; }
    .burst::before, .burst::after { position: absolute; width: inherit; height: inherit; border-radius: 50%; content: ""; }
    .burst::before { background: #ff4f6d; box-shadow: 0 -55px #ff4f6d, 39px -39px #ffe34f, 55px 0 #72f3a2, 39px 39px #ff65c3, 0 55px #55dcff, -39px 39px #ffe34f, -55px 0 #bd76ff, -39px -39px #72f3a2, 0 -88px #ffe34f, 62px -62px #55dcff, 88px 0 #ff4f6d, 62px 62px #72f3a2, 0 88px #ff65c3, -62px 62px #55dcff, -88px 0 #ffe34f, -62px -62px #bd76ff, 0 -116px #ff65c3, 82px -82px #72f3a2, 116px 0 #55dcff, 82px 82px #ffe34f, 0 116px #bd76ff, -82px 82px #ff4f6d, -116px 0 #72f3a2, -82px -82px #55dcff; }
    .burst::after { background: #fff9bf; box-shadow: 0 -28px #fff9bf, 20px -20px #fff, 28px 0 #fff9bf, 20px 20px #fff, 0 28px #fff9bf, -20px 20px #fff, -28px 0 #fff9bf, -20px -20px #fff; }
    .one { top: 16%; left: 14%; animation-delay: 0s !important; }
    .two { top: 23%; left: 82%; animation-delay: .2s !important; }
    .three { top: 48%; left: 50%; animation-delay: .4s !important; }
    .four { top: 72%; left: 22%; animation-delay: .6s !important; }
    .five { top: 70%; left: 79%; animation-delay: .8s !important; }
    .six { top: 10%; left: 55%; animation-delay: 1s !important; }
    .seven { top: 49%; left: 90%; animation-delay: 1.2s !important; }
    .eight { top: 86%; left: 47%; animation-delay: 1.4s !important; }
    .nine { top: 38%; left: 27%; animation-delay: .3s !important; }
    .ten { top: 38%; left: 72%; animation-delay: .7s !important; }
    .eleven { top: 88%; left: 13%; animation-delay: 1.1s !important; }
    .twelve { top: 13%; left: 92%; animation-delay: 1.5s !important; }
    @keyframes firework { 0% { opacity: 0; transform: scale(.08) rotate(0); } 14% { opacity: 1; } 100% { opacity: 0; transform: scale(1.85) rotate(55deg); } }
    @keyframes sky-flash { 0%, 100% { opacity: 0; } 12% { opacity: 1; } 30% { opacity: .15; } 48% { opacity: .8; } 68% { opacity: .1; } }
    @keyframes pop { from { opacity: 0; transform: translateY(10px) scale(.94); } to { opacity: 1; transform: translateY(0) scale(1); } }
    @keyframes fade-in { from { opacity: 0; } to { opacity: 1; } }
    @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; } }
  </style>
  <dialog aria-labelledby="title" aria-describedby="message">
    <div class="fireworks" aria-hidden="true"><span class="burst large one"></span><span class="burst large two"></span><span class="burst large three"></span><span class="burst large four"></span><span class="burst large five"></span><span class="burst six"></span><span class="burst seven"></span><span class="burst eight"></span><span class="burst small nine"></span><span class="burst small ten"></span><span class="burst small eleven"></span><span class="burst small twelve"></span></div>
    <div class="card">
      <img class="character-image" alt="">
      <h2 id="title">오늘 루틴 전부 완료!</h2>
      <p class="speaker"></p>
      <p class="message" id="message" lang="ko"></p>
      <button class="close" type="button">확인</button>
    </div>
  </dialog>
`;

class CelebrationMessage extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.append(template.content.cloneNode(true));
    this._lastId = null;
    this._dialog = this.shadowRoot.querySelector("dialog");
    this._card = this.shadowRoot.querySelector(".card");
    this._fireworks = this.shadowRoot.querySelector(".fireworks");
    this.shadowRoot.querySelector(".close").addEventListener("click", () => this._dialog.close());
  }

  show(messages, character) {
    if (!Array.isArray(messages) || messages.length === 0 || !character) return;
    const candidates = messages.filter((message) => message.id !== this._lastId);
    const pool = candidates.length ? candidates : messages;
    const selected = pool[Math.floor(Math.random() * pool.length)];
    this._lastId = selected.id;

    const image = this.shadowRoot.querySelector(".character-image");
    image.src = character.image;
    image.alt = character.name;
    this.shadowRoot.querySelector(".speaker").textContent = `${character.name}의 축하`;
    this.shadowRoot.querySelector(".message").textContent = selected.text;
    if (!this._dialog.open) this._dialog.showModal();
    playCelebrationSound();
    this._card.classList.remove("show");
    void this._card.offsetWidth;
    this._card.classList.add("show");
    this._fireworks.classList.remove("show");
    void this._fireworks.offsetWidth;
    this._fireworks.classList.add("show");
    this.shadowRoot.querySelector(".close").focus();
  }
}

customElements.define("celebration-message", CelebrationMessage);



