import { playButtonClick } from "./sound-effects.js";
import "./components/battle-intro.js";
import "./components/routine-list.js";
import "./components/celebration-message.js";
import "./components/adventure-map.js";
import "./components/reward-roulette.js";

const DATA_URL = new URL("../data/motivationMessages.json", import.meta.url);
const CHARACTERS_URL = new URL("../data/characters.json", import.meta.url);
const MONSTERS_URL = new URL("../data/monsters.json", import.meta.url);
const MONSTER_MESSAGES_URL = new URL("../data/monsterMessages.json", import.meta.url);
const REWARD_GAMES_URL = new URL("../data/rewardGames.json", import.meta.url);
const SCHEDULE_URL = new URL("../data/defaultSchedule.json", import.meta.url);
const SCHEDULE_STORAGE_KEY = "chiikawaDailyRoutine.schedule";
const battleIntro = document.querySelector("#battleIntro");
const routineList = document.querySelector("#routineList");
const celebrationLayer = document.querySelector("#celebrationLayer");
const rewardRoulette = document.querySelector("#rewardRoulette");
const adventureMap = document.querySelector("#adventureMap");
const adventureMapButton = document.querySelector("#adventureMapButton");
const status = document.querySelector("#status");
const confirmButton = document.querySelector("#confirmButton");
const missionTitle = document.querySelector("#mission-title");

let schedule = null;
let monsters = [];
let characters = [];
let selectedCharacter = null;
let selectedMonster = null;
let monsterMessages = [];
let celebrationMessages = [];
let rewardGames = [];

function showBattleIntro(messages, characters) {
  const characterText = messages[Math.floor(Math.random() * messages.length)];
  const character = characters[Math.floor(Math.random() * characters.length)];
  selectedCharacter = {
    name: character.name,
    image: character.image,
  };
  selectedMonster = monsters[Math.floor(Math.random() * monsters.length)];
  const monsterText = monsterMessages[Math.floor(Math.random() * monsterMessages.length)];
  battleIntro.entry = {
    character: selectedCharacter,
    characterMessage: characterText.text,
    monster: selectedMonster,
    monsterMessage: monsterText.text,
  };
  status.textContent = "캐릭터와 함께 루틴을 완료해 몬스터를 물리쳐 보세요!";
}

function getTodayKey() {
  return new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date());
}

function showTodayRoutine() {
  if (!schedule || !selectedCharacter) return;
  const dayKey = getTodayKey();
  const tasks = schedule[dayKey] ?? [];
  routineList.entry = { dayKey, tasks, character: selectedCharacter, monster: selectedMonster };
  battleIntro.hidden = true;
  routineList.hidden = false;
  missionTitle.textContent = "오늘 할 루틴";
  status.textContent = `${selectedMonster.name}을(를) 물리치기 위해 루틴을 완료해 봐요!`;
  confirmButton.hidden = true;
}

async function initialize() {
  try {
    const [messageResponse, charactersResponse, monstersResponse, monsterMessagesResponse, scheduleResponse, celebrationResponse, rewardGamesResponse] = await Promise.all([
      fetch(DATA_URL),
      fetch(CHARACTERS_URL),
      fetch(MONSTERS_URL),
      fetch(MONSTER_MESSAGES_URL),
      fetch(SCHEDULE_URL),
      fetch(new URL("../data/celebrationMessages.json", import.meta.url)),
      fetch(REWARD_GAMES_URL),
    ]);
    if (!messageResponse.ok) throw new Error(`응원 메시지를 불러오지 못했어요 (${messageResponse.status})`);
    if (!charactersResponse.ok) throw new Error(`캐릭터 정보를 불러오지 못했어요 (${charactersResponse.status})`);
    if (!monstersResponse.ok) throw new Error(`몬스터 정보를 불러오지 못했어요 (${monstersResponse.status})`);
    if (!monsterMessagesResponse.ok) throw new Error(`몬스터 대사를 불러오지 못했어요 (${monsterMessagesResponse.status})`);
    if (!scheduleResponse.ok) throw new Error(`루틴을 불러오지 못했어요 (${scheduleResponse.status})`);
    if (!celebrationResponse.ok) throw new Error(`축하 메시지를 불러오지 못했어요 (${celebrationResponse.status})`);
    if (!rewardGamesResponse.ok) throw new Error(`보상 놀이를 불러오지 못했어요 (${rewardGamesResponse.status})`);

    const messageData = await messageResponse.json();
    const charactersData = await charactersResponse.json();
    const monstersData = await monstersResponse.json();
    const monsterMessagesData = await monsterMessagesResponse.json();
    const defaultSchedule = await scheduleResponse.json();
    try {
      const savedSchedule = localStorage.getItem(SCHEDULE_STORAGE_KEY);
      schedule = savedSchedule ? JSON.parse(savedSchedule) : defaultSchedule;
      if (!savedSchedule) localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(schedule));
    } catch (storageError) {
      console.warn("저장된 루틴을 읽지 못해 기본 루틴을 사용해요.", storageError);
      schedule = defaultSchedule;
      localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(schedule));
    }
    const celebrationData = await celebrationResponse.json();
    celebrationMessages = celebrationData.messages;
    const rewardGamesData = await rewardGamesResponse.json();
    rewardGames = rewardGamesData.games;
    if (!Array.isArray(messageData.messages) || messageData.messages.length === 0) {
      throw new Error("표시할 응원 메시지가 없어요.");
    }
    if (!Array.isArray(charactersData.characters) || charactersData.characters.length === 0) {
      throw new Error("캐릭터 정보가 없어요.");
    }
    if (!Array.isArray(monstersData.monsters) || monstersData.monsters.length === 0) {
      throw new Error("몬스터 정보가 없어요.");
    }
    if (!Array.isArray(monsterMessagesData.messages) || monsterMessagesData.messages.length === 0) {
      throw new Error("표시할 몬스터 대사가 없어요.");
    }
    if (!Array.isArray(celebrationMessages) || celebrationMessages.length === 0) {
      throw new Error("표시할 축하 메시지가 없어요.");
    }
    if (!Array.isArray(rewardGames) || rewardGames.length !== 8) {
      throw new Error("보상 놀이 8개를 불러오지 못했어요.");
    }

    characters = charactersData.characters.map((character) => ({
      id: character.id,
      name: character.name,
      image: new URL(character.image, CHARACTERS_URL).href,
    }));
    monsters = monstersData.monsters.map((monster) => ({
      name: monster.name,
      image: new URL(monster.image, MONSTERS_URL).href,
    }));
    monsterMessages = monsterMessagesData.messages;
    showBattleIntro(messageData.messages, characters);
    confirmButton.disabled = false;
  } catch (error) {
    status.textContent = "자료를 불러오지 못했어요. 로컬 웹 서버에서 페이지를 열어주세요.";
    console.error(error);
  }
}

document.addEventListener("click", (event) => {
  if (event.composedPath().some((node) => node instanceof HTMLButtonElement)) playButtonClick();
});

routineList.addEventListener("routine-complete", (event) => {
  adventureMap.recordToday();
  celebrationLayer.show(celebrationMessages, event.detail.character);
});
celebrationLayer.addEventListener("celebration-confirmed", () => rewardRoulette.show(rewardGames));
routineList.addEventListener("routine-change", (event) => {
  schedule[event.detail.dayKey] = event.detail.tasks;
  localStorage.setItem(SCHEDULE_STORAGE_KEY, JSON.stringify(schedule));
});
adventureMapButton.addEventListener("click", () => adventureMap.open());
confirmButton.addEventListener("click", showTodayRoutine);
initialize();





