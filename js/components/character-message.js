const template = document.createElement("template");
template.innerHTML = `
  <style>
    :host { display: block; }
    :host([hidden]) { display: none !important; }
    .card { display: grid; grid-template-columns: minmax(90px, 150px) 1fr; align-items: center; gap: 14px; max-width: 660px; margin: 0 auto; padding: 12px; border-radius: 20px; background: #fff4dd; text-align: left; }
    .portrait { display: grid; place-items: center; min-height: 100px; margin: 0; }
    img { display: block; width: 100%; max-width: 140px; max-height: 135px; object-fit: contain; }
    .speaker { margin: 4px 0 0; color: #927354; font-size: .78rem; font-weight: 800; text-align: center; }
    .bubble { position: relative; padding: 14px 16px; border: 2px solid #f1dfc4; border-radius: 18px; background: #fff; }
    .bubble::before { position: absolute; top: 32px; left: -10px; width: 17px; height: 17px; border-bottom: 2px solid #f1dfc4; border-left: 2px solid #f1dfc4; background: #fff; content: ""; transform: rotate(45deg); }
    .label { margin: 0 0 9px; color: #b28b64; font-size: .74rem; font-weight: 800; letter-spacing: .08em; }
    .message { margin: 0; color: #493c35; font-size: clamp(.98rem, 2.8vh, 1.2rem); font-weight: 750; line-height: 1.45; word-break: keep-all; }
    @media (max-width: 560px) {
      .card { grid-template-columns: minmax(70px, 100px) 1fr; gap: 8px; padding: 8px; }
      .portrait { min-height: 75px; }
      img { max-height: 100px; }
      .bubble { padding: 10px 11px; }
      .bubble::before { top: 22px; left: -8px; width: 13px; height: 13px; }
      .message { font-size: clamp(.88rem, 4vw, 1rem); line-height: 1.35; }
    }
  </style>
  <article class="card">
    <figure class="portrait">
      <img class="character" alt="">
      <figcaption class="speaker"></figcaption>
    </figure>
    <div class="bubble">
      <p class="label">친구의 응원 메시지</p>
      <p class="message" lang="ko"></p>
    </div>
  </article>
`;

class CharacterMessage extends HTMLElement {
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

    this.shadowRoot.replaceChildren(template.content.cloneNode(true));
    const image = this.shadowRoot.querySelector(".character");
    image.src = this._entry.image;
    image.alt = `${this._entry.characterName} 캐릭터`;
    this.shadowRoot.querySelector(".speaker").textContent = this._entry.characterName;
    this.shadowRoot.querySelector(".message").textContent = this._entry.text;
  }
}

customElements.define("character-message", CharacterMessage);

