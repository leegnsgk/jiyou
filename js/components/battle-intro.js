const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host { display: block; }
    :host([hidden]) { display: none !important; }
    .arena { position: relative; overflow: hidden; padding: clamp(10px, 2vh, 18px); border: 1px solid #f0dfc9; border-radius: 20px; background: radial-gradient(ellipse at 50% 100%, #fce6c8, transparent 60%), linear-gradient(140deg, #fff9ed, #f4f8e8); }
    .arena::before, .arena::after { position: absolute; color: #e9b454; content: "✦"; animation: twinkle 1.8s ease-in-out infinite alternate; }
    .arena::before { top: 12%; left: 48%; font-size: 1.5rem; }
    .arena::after { right: 8%; bottom: 13%; color: #e990a7; font-size: 1.2rem; animation-delay: .7s; }
    .duel { position: relative; display: grid; grid-template-columns: minmax(0, 1fr) 44px minmax(0, 1fr); align-items: center; gap: clamp(5px, 2vw, 18px); max-width: 760px; margin: 0 auto; }
    .fighter { display: grid; justify-items: center; min-width: 0; }
    .portrait { display: grid; place-items: center; height: clamp(100px, 18vh, 170px); margin: 0; }
    .portrait img { display: block; width: min(100%, 165px); height: 100%; object-fit: contain; filter: drop-shadow(0 8px 6px rgb(90 65 44 / 14%)); }
    .monster .portrait { animation: enter-left .65s cubic-bezier(.2,1.4,.45,1) both; }
    .character .portrait { animation: enter-right .65s .12s cubic-bezier(.2,1.4,.45,1) both; }
    .monster .portrait img { animation: fight-left 1.35s .75s ease-in-out infinite; }
    .character .portrait img { animation: fight-right 1.35s 1.25s ease-in-out infinite; }
    .name { margin: 0 0 7px; color: #79614e; font-size: .78rem; font-weight: 850; }
    .bubble { position: relative; width: 100%; min-height: 88px; padding: 11px 12px; border: 2px solid #f1dfc4; border-radius: 18px; background: #fff; box-shadow: 0 6px 14px rgb(92 72 50 / 9%); color: #493c35; font-size: clamp(.78rem, 2.1vw, 1rem); font-weight: 750; line-height: 1.5; text-align: center; word-break: keep-all; }
    .character .bubble { border-color: #f2d998; background: #fffdf4; animation: bubble-in .5s 1s both, bubble-float 2.6s 1.5s ease-in-out infinite; }
    .monster .bubble { border-color: #e6c5d7; background: #fff7fb; animation: bubble-in .5s .2s both, bubble-float 2.6s .7s ease-in-out infinite; }
    .bubble::after { position: absolute; top: -9px; left: calc(50% - 8px); width: 14px; height: 14px; border-top: 2px solid #f1dfc4; border-left: 2px solid #f1dfc4; background: #fff; content: ""; transform: rotate(45deg); }
    .character .bubble::after { border-color: #f2d998; background: #fffdf4; }
    .monster .bubble::after { border-color: #e6c5d7; background: #fff7fb; }
    .vs { z-index: 1; display: grid; width: 42px; height: 42px; place-items: center; border: 3px solid #fff; border-radius: 50%; background: linear-gradient(140deg, #ffb65d, #f27c79); box-shadow: 0 4px 12px rgb(180 94 69 / 25%); color: white; font-size: .86rem; font-weight: 950; animation: versus .75s .25s cubic-bezier(.2,1.6,.4,1) both, versus-pulse 1.4s 1s ease-in-out infinite; }
    @keyframes enter-left { from { opacity: 0; transform: translateX(-45px) rotate(-8deg) scale(.82); } to { opacity: 1; transform: translateX(0) rotate(0) scale(1); } }
    @keyframes enter-right { from { opacity: 0; transform: translateX(45px) rotate(8deg) scale(.82); } to { opacity: 1; transform: translateX(0) rotate(0) scale(1); } }
    @keyframes fight-left { 0%, 100% { transform: translateX(0) rotate(0) scale(1); } 32% { transform: translateX(12px) rotate(5deg) scale(1.05); } 54% { transform: translateX(-3px) rotate(-2deg) scale(.98); } 76% { transform: translateX(5px) rotate(2deg) scale(1.02); } }
    @keyframes fight-right { 0%, 100% { transform: translateX(0) rotate(0) scale(1); } 32% { transform: translateX(-12px) rotate(-5deg) scale(1.05); } 54% { transform: translateX(3px) rotate(2deg) scale(.98); } 76% { transform: translateX(-5px) rotate(-2deg) scale(1.02); } }
    @keyframes bubble-in { from { opacity: 0; transform: translateY(10px) scale(.92); } to { opacity: 1; transform: translateY(0) scale(1); } }
    @keyframes bubble-float { 0%, 100% { translate: 0 0; } 50% { translate: 0 -3px; } }
    @keyframes versus { from { opacity: 0; transform: scale(.3) rotate(-30deg); } to { opacity: 1; transform: scale(1) rotate(0); } }
    @keyframes versus-pulse { 50% { box-shadow: 0 0 0 6px rgb(242 124 121 / 14%), 0 4px 12px rgb(180 94 69 / 25%); } }
    @keyframes twinkle { from { opacity: .35; transform: scale(.8) rotate(-12deg); } to { opacity: 1; transform: scale(1.2) rotate(12deg); } }
    @media (max-width: 480px) {
      .arena { padding: 8px 6px; }
      .duel { grid-template-columns: minmax(0, 1fr) 30px minmax(0, 1fr); gap: 4px; }
      .portrait { height: clamp(82px, 15vh, 125px); }
      .name { margin-bottom: 5px; font-size: .7rem; }
      .bubble { min-height: 78px; padding: 8px 7px; border-radius: 14px; font-size: clamp(.69rem, 3.1vw, .82rem); line-height: 1.4; }
      .vs { width: 30px; height: 30px; border-width: 2px; font-size: .68rem; }
    }
    @media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; } }
  </style>
  <section class="arena" aria-label="캐릭터와 몬스터의 대결">
    <div class="duel">
      <article class="fighter monster">
        <figure class="portrait"><img class="monster-image" alt=""></figure>
        <p class="name monster-name"></p>
        <p class="bubble monster-message" lang="ko"></p>
      </article>
      <span class="vs" aria-hidden="true">VS</span>
      <article class="fighter character">
        <figure class="portrait"><img class="character-image" alt=""></figure>
        <p class="name character-name"></p>
        <p class="bubble character-message" lang="ko"></p>
      </article>
    </div>
  </section>
`;

class BattleIntro extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this._entry = null;
  }

  set entry(value) {
    this._entry = value;
    this.render();
  }

  render() {
    if (!this._entry) return;
    const { character, characterMessage, monster, monsterMessage } = this._entry;
    this.shadowRoot.replaceChildren(template.content.cloneNode(true));
    const characterImage = this.shadowRoot.querySelector(".character-image");
    characterImage.src = character.image;
    characterImage.alt = character.name;
    this.shadowRoot.querySelector(".character-name").textContent = character.name;
    this.shadowRoot.querySelector(".character-message").textContent = characterMessage;
    const monsterImage = this.shadowRoot.querySelector(".monster-image");
    monsterImage.src = monster.image;
    monsterImage.alt = monster.name;
    this.shadowRoot.querySelector(".monster-name").textContent = monster.name;
    this.shadowRoot.querySelector(".monster-message").textContent = monsterMessage;
  }
}

customElements.define("battle-intro", BattleIntro);
