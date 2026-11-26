import { audio, mediaPath, videos } from './media';
import { mapping } from '../../gallery/shared/input.js';
import { read } from '../../gallery/shared/storage.js';
import { validatePack } from '../../gallery/shared/content.js';
import Phaser from 'phaser';
import { ENGLISH_TRIVIA_QUESTIONS, WORLD_CUP_QUESTIONS, type ButtonKey, type Question } from './questions';
import './styles.css';

const WIDTH = 1280;
const HEIGHT = 720;
const GAME_FONT = 'Jersey M54, Arial Black, Arial';
const ANNOUNCEMENT_FONT = 'Rush Driver, Jersey M54, Arial Black, Arial';
const FOOTER_FONT = 'Arial Black, Arial';
const QUIZ_SECONDS = 17;
const MINI_SECONDS = 5;
const STICK_MINI_SECONDS = MINI_SECONDS + 7;
const CHAMPION_STREAK = 5;

const XBOX_BUTTONS: Record<ButtonKey, number> = { A: 0, B: 1, X: 2, Y: 3 };
const NINTENDO_BUTTONS: Record<ButtonKey, number> = { A: 1, B: 0, X: 3, Y: 2 };
const BUTTON_COLORS: Record<ButtonKey, number> = {
  A: 0x23c55e,
  B: 0xef4444,
  X: 0x3b82f6,
  Y: 0xfacc15,
};
const BUTTON_TEXT: Record<ButtonKey, string> = {
  A: '#ffffff',
  B: '#ffffff',
  X: '#ffffff',
  Y: '#ffffff',
};
const BUTTON_ORDER: ButtonKey[] = ['A', 'B', 'X', 'Y'];
const PANEL_ALPHA = 0.86;
const ANSWER_CARD_WIDTH = 550;
const ANSWER_CARD_HEIGHT = 104;
const ANSWER_CARD_RADIUS = 18;
const QUESTION_PANEL_WIDTH = 880;
const QUESTION_PANEL_HEIGHT = 82;
const QUESTION_PANEL_RADIUS = 18;
const MINI_INSTRUCTION_PANEL_WIDTH = 920;
const MINI_INSTRUCTION_PANEL_HEIGHT = 116;
const MINI_INSTRUCTION_PANEL_Y = 142;
const MINI_PANEL_Y = 292;
const MINI_PANEL_WIDTH = 360;
const MINI_PANEL_HEIGHT = 220;
const MINI_PROGRESS_TRACK_WIDTH = 240;
const TIMING_BALL_SWING = 140;
const STICK_CURSOR_X_RANGE = 120;
const STICK_CURSOR_Y_RANGE = 70;
const HELD_BUTTON_REPEAT_MS = 95;
const TIMER_WIDTH = 520;
const TIMER_HEIGHT = 18;
const TIMER_RADIUS = 9;
const PLAYER_PANEL_WIDTH = 360;
const PLAYER_PANEL_HEIGHT = 96;
const PLAYER_PANEL_RADIUS = 18;
const PLAYER_BADGE_WIDTH = 96;
const PLAYER_BADGE_HEIGHT = 42;
const PLAYER_BADGE_RADIUS = 10;
const PLAYER_COLORS = [0x38bdf8, 0xfacc15] as const;
const PLAYER_TEXT_COLORS = ['#0284c7', '#ca8a04'] as const;
const VIDEO_KEYS = {
  idle: 'stadium-loop-v2',
  quiz: 'quiz-idle',
  penalty: 'penalty-build',
  penaltyPrep: 'penalty-prep-extended',
  goal: 'goal',
  save: 'save',
  championship: 'championship',
} as const;
const STADIUM_AUDIO_KEY = 'stadium-loop-v2-audio';
const VIDEO_AUDIO: Partial<Record<string, string>> = {
  [VIDEO_KEYS.idle]: STADIUM_AUDIO_KEY,
  [VIDEO_KEYS.goal]: 'goal-audio',
  [VIDEO_KEYS.save]: 'save-audio',
  [VIDEO_KEYS.championship]: 'championship-audio',
};

type ControlMapping = { keys: Record<string, string>; buttons: Record<string, number> };

type VideoScene = 'idle' | 'quiz' | 'penalty' | 'goal' | 'save' | 'no-winner' | 'championship';

const SCENE_VIDEO: Record<VideoScene, string> = {
  idle: VIDEO_KEYS.idle,
  quiz: VIDEO_KEYS.quiz,
  penalty: VIDEO_KEYS.penaltyPrep,
  goal: VIDEO_KEYS.goal,
  save: VIDEO_KEYS.save,
  'no-winner': VIDEO_KEYS.idle,
  championship: VIDEO_KEYS.championship,
};
const VIDEO_LOOP: Record<string, boolean> = {
  [VIDEO_KEYS.idle]: true,
  [VIDEO_KEYS.quiz]: true,
  [VIDEO_KEYS.penaltyPrep]: true,
  [VIDEO_KEYS.goal]: false,
  [VIDEO_KEYS.save]: false,
  [VIDEO_KEYS.championship]: false,
};
const NO_WINNER_VIDEO_MS = 18000;
const NO_WINNER_TEXT_MS = 7000;
const GOAL_VIDEO_MS = 10000;
const SAVE_VIDEO_MS = 10000;
const CHAMPIONSHIP_VIDEO_MS = 10000;
const CHAMPION_NAME_REVEAL_MS = 8000;
const VIDEO_TRANSITION_MS = 2500;
const VIDEO_TRANSITION_BLUR = 1.15;

const COMMENTARY_KEYS = {
  idleRoger: 'commentary-idle-roger',
  idleLiam: 'commentary-idle-liam',
  quizStart: 'commentary-quiz-start',
  noWinner: 'commentary-no-winner',
  minigameReady: 'commentary-minigame-ready',
  goal: 'commentary-goal',
  save: 'commentary-save',
  champion: 'commentary-champion',
} as const;

const MINI_COMMENTARY_KEYS: Record<MiniGameType, string> = {
  timing: 'commentary-mini-timing',
  mash: 'commentary-mini-mash',
  stick: 'commentary-mini-stick',
  sequence: 'commentary-mini-sequence',
  reaction: 'commentary-mini-reaction',
  corners: 'commentary-mini-corners',
  switch: 'commentary-mini-switch',
  shake: 'commentary-mini-shake',
};

type Player = {
  name: string;
  answer?: ButtonKey;
  quizCorrect: boolean;
  streak: number;
  carryStreak: boolean;
  goals: number;
  miniScore: number;
  miniDone: boolean;
};

type Mode = 'name-entry' | 'quiz' | 'reveal' | 'minigame' | 'result' | 'champion';
type MiniGameType =
  | 'timing'
  | 'mash'
  | 'stick'
  | 'sequence'
  | 'reaction'
  | 'corners'
  | 'switch'
  | 'shake';

type MiniGameState = {
  type: MiniGameType;
  shooterIndex: number;
  keeperIndex: number;
  startedAt: number;
  started: boolean;
  readyPlayers: [boolean, boolean];
  targetX: number;
  targetY: number;
  targetButton: ButtonKey;
  revealAt: number;
  switchEvery: number;
  lastAxes: [[number, number], [number, number]];
  cornerPicks: Array<ButtonKey | undefined>;
  sequence: ButtonKey[];
  sequenceProgress: [number, number];
  lastMashAt: [number, number];
  resultShown: boolean;
};

type ButtonCard = {
  key: ButtonKey;
  shadow: Phaser.GameObjects.Graphics;
  shine: Phaser.GameObjects.Graphics;
  bg: Phaser.GameObjects.Graphics;
  pill: Phaser.GameObjects.Ellipse;
  buttonLabel: Phaser.GameObjects.Text;
  answerLabel: Phaser.GameObjects.Text;
};

class EnglishWorldCupScene extends Phaser.Scene {
  private mode: Mode = 'name-entry';
  private players: Player[] = [
    { name: 'Player 1', answer: undefined, quizCorrect: false, streak: 0, carryStreak: false, goals: 0, miniScore: 0, miniDone: false },
    { name: 'Player 2', answer: undefined, quizCorrect: false, streak: 0, carryStreak: false, goals: 0, miniScore: 0, miniDone: false },
  ];
  private currentQuestion: Question = ENGLISH_TRIVIA_QUESTIONS[0];
  private englishQuestionBag: Question[] = [];
  private worldCupQuestionBag: Question[] = [];
  private questionPatternIndex = 0;
  private questionNumber = 0;
  private previousButtonPressed = new Map<string, boolean>();
  private heldButtonRepeatAt = new Map<string, number>();
  private nameDrafts: [string, string] = ['PLAYER 1', 'PLAYER 2'];
  private nameEntryOriginals: [string, string] = ['PLAYER 1', 'PLAYER 2'];
  private stadium!: Phaser.GameObjects.Container;
  private mediaLayer?: Phaser.GameObjects.Video;
  private videoAudio = new Map<string, Phaser.Sound.BaseSound>();
  private mediaEnabled = true;
  private currentVideoKey?: string;
  private videoBlurFx?: Phaser.FX.Blur;
  private videoTransitionTween?: Phaser.Tweens.Tween;
  private headerBar!: Phaser.GameObjects.Rectangle;
  private title!: Phaser.GameObjects.Text;
  private subtitle!: Phaser.GameObjects.Text;
  private timerText!: Phaser.GameObjects.Text;
  private timerBar!: Phaser.GameObjects.Graphics;
  private timerTrack!: Phaser.GameObjects.Graphics;
  private roundChip!: Phaser.GameObjects.Text;
  private questionBg!: Phaser.GameObjects.Graphics;
  private questionText!: Phaser.GameObjects.Text;
  private answerCards: ButtonCard[] = [];
  private playerPanels: Phaser.GameObjects.Container[] = [];
  private playerNames: Phaser.GameObjects.Text[] = [];
  private playerStats: Phaser.GameObjects.Text[] = [];
  private lockBadgeBgs: Phaser.GameObjects.Graphics[] = [];
  private lockBadges: Phaser.GameObjects.Text[] = [];
  private messageText!: Phaser.GameObjects.Text;
  private footerText!: Phaser.GameObjects.Text;
  private miniLayer!: Phaser.GameObjects.Container;
  private miniGraphics!: Phaser.GameObjects.Graphics;
  private activeMini?: MiniGameState;
  private phaseTimers = new Set<number>();
  private pressedKeys = new Set<string>();
  private touchAxes: Array<[number, number]> = [[0, 0], [0, 0]];
  private controlsMapping = mapping() as ControlMapping;
  private customButtons = Boolean(read('input', {}).buttons);
  private customQuestions = loadQuiz();
  private customQuestionIndex = 0;
  private playerPadSlots: [number | null, number | null] = [null, null];
  private inputReadyAt = 0;
  private processingGamepadBatch = false;
  private finishMiniGameQueued = false;
  private quizStartedAt = 0;
  private quizResolved = false;
  private currentScene: VideoScene = 'idle';
  private currentVideoMuted = false;
  private lastSoundHealthCheckAt = 0;
  private championResetIndexes: number[] = [];
  private crowdDots: Phaser.GameObjects.Arc[] = [];
  private floaters: Phaser.GameObjects.Arc[] = [];
  constructor() {
    super('EnglishWorldCupScene');
  }

  preload() {
    for (const [type, filename] of Object.entries(videos)) {
      this.load.video(VIDEO_KEYS[type as keyof typeof videos], mediaPath(filename + '.webm'), false);
    }
    for (const [key, filename] of Object.entries(audio)) this.load.audio(key, mediaPath(filename + '.mp3'));

  }

  create() {
    this.createBlankBackground();
    this.createMediaLayer();
    this.createVideoAudio();
    this.createUi();
    this.createClassroomControls();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => { for (const timer of this.phaseTimers) clearTimeout(timer); });
    this.showNameEntry();
  }

  update(time: number) {
    this.pollGamepads();
    this.ensureSoundContinuity(time);

    if (this.mode === 'quiz') {
      this.updateQuizTimer(time);
    }
    if (this.mode === 'minigame') {
      this.updateMiniGame(time);
    }
  }

  private createBlankBackground() {
    this.stadium = this.add.container(0, 0).setDepth(-20);
    this.stadium.add(this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x07111f, 1));
  }

  private createMediaLayer() {
    this.mediaLayer = this.add.video(WIDTH / 2, HEIGHT / 2)
      .setDepth(-18)
      .setOrigin(0.5)
      .setMute(false)
      .setVolume(1);
    try {
      this.videoBlurFx = this.mediaLayer.postFX.addBlur(0, 0, 0, 0, 0xffffff, 2);
    } catch {
      this.videoBlurFx = undefined;
    }
  }

  private createVideoAudio() {
    Object.values(VIDEO_AUDIO).forEach((audioKey) => {
      if (!audioKey || this.videoAudio.has(audioKey)) return;
      this.videoAudio.set(audioKey, this.sound.add(audioKey, {
        loop: audioKey === STADIUM_AUDIO_KEY,
        volume: 1,
      }));
    });
  }

  private createUi() {
    this.add.rectangle(WIDTH / 2, HEIGHT / 2, WIDTH, HEIGHT, 0x000000, 0.08).setDepth(-5);
    this.headerBar = this.add.rectangle(WIDTH / 2, 62, 1210, 74, 0x07111f, 0.42)
      .setStrokeStyle(2, 0xffffff, 0.1);
    this.title = this.add.text(42, 34, 'English World Cup', {
      fontFamily: GAME_FONT,
      fontSize: '24px',
      color: '#ffffff',
      stroke: '#0f172a',
      strokeThickness: 5,
    });
    this.subtitle = this.add.text(194, 73, '', {
      fontFamily: GAME_FONT,
      fontSize: '15px',
      color: '#dff7ff',
    });

    this.roundChip = this.add.text(1040, 52, '', {
      fontFamily: GAME_FONT,
      fontSize: '19px',
      color: '#0f172a',
      backgroundColor: '#ffffff',
      padding: { left: 16, right: 16, top: 9, bottom: 9 },
    }).setOrigin(0.5);
    this.setHeaderVisible(false);

    this.timerTrack = this.add.graphics();
    this.timerBar = this.add.graphics();
    this.drawTimerBar(1, 0x22c55e);
    this.timerText = this.add.text(WIDTH / 2, 520, '', {
      fontFamily: GAME_FONT,
      fontSize: '36px',
      color: '#ffffff',
      stroke: '#0f172a',
      strokeThickness: 7,
    }).setOrigin(0.5);

    this.questionBg = this.add.graphics();
    this.drawQuestionPanel();
    this.questionText = this.add.text(WIDTH / 2, 198, '', {
      fontFamily: GAME_FONT,
      fontSize: '41px',
      color: '#0f172a',
      align: 'center',
      wordWrap: { width: 790 },
      stroke: '#ffffff',
      strokeThickness: 2,
    }).setOrigin(0.5);

    this.createAnswerCards();
    this.createPlayerPanels();

    this.messageText = this.add.text(WIDTH / 2, 586, '', {
      fontFamily: GAME_FONT,
      fontSize: '24px',
      color: '#ffffff',
      align: 'center',
      wordWrap: { width: 1000 },
      stroke: '#0f172a',
      strokeThickness: 6,
    }).setOrigin(0.5);

    this.footerText = this.add.text(WIDTH / 2, 688, '', {
      fontFamily: FOOTER_FONT,
      fontSize: '16px',
      color: '#cbd5e1',
      align: 'center',
    }).setOrigin(0.5);

    this.miniGraphics = this.add.graphics().setDepth(20);
    this.miniLayer = this.add.container(0, 0).setDepth(21);
  }

  private createAnswerCards() {
    const layout: Array<[ButtonKey, number, number]> = [
      ['A', 338, 302],
      ['B', 942, 302],
      ['X', 338, 438],
      ['Y', 942, 438],
    ];

    for (const [key, x, y] of layout) {
      const shadow = this.add.graphics({ x: x + 6, y: y + 8 });
      shadow.fillStyle(0x020617, 0.28);
      shadow.fillRoundedRect(-ANSWER_CARD_WIDTH / 2, -ANSWER_CARD_HEIGHT / 2, ANSWER_CARD_WIDTH, ANSWER_CARD_HEIGHT, ANSWER_CARD_RADIUS);

      const bg = this.add.graphics({ x, y });
      this.drawAnswerCardBg(bg, BUTTON_COLORS[key], PANEL_ALPHA);

      const shine = this.add.graphics({ x, y: y - 36 });
      shine.fillStyle(0xffffff, 0.12);
      shine.fillRoundedRect(-255, -7, 510, 14, 7);
      const pill = this.add.ellipse(x - 224, y, 70, 70, 0xffffff, 0.98)
        .setStrokeStyle(5, 0x101827, 0.32);
      const buttonLabel = this.add.text(x - 224, y, key, {
        fontFamily: GAME_FONT,
        fontSize: '35px',
        color: Phaser.Display.Color.IntegerToColor(BUTTON_COLORS[key]).rgba,
      }).setOrigin(0.5);
      const answerLabel = this.add.text(x - 166, y, '', {
        fontFamily: GAME_FONT,
        fontSize: '30px',
        color: BUTTON_TEXT[key],
        wordWrap: { width: 410 },
      }).setOrigin(0, 0.5);
      this.answerCards.push({ key, shadow, shine, bg, pill, buttonLabel, answerLabel });
    }
  }

  private drawAnswerCardBg(bg: Phaser.GameObjects.Graphics, color: number, alpha: number) {
    bg.clear();
    bg.fillStyle(color, alpha);
    bg.fillRoundedRect(-ANSWER_CARD_WIDTH / 2, -ANSWER_CARD_HEIGHT / 2, ANSWER_CARD_WIDTH, ANSWER_CARD_HEIGHT, ANSWER_CARD_RADIUS);
    bg.lineStyle(4, 0xffffff, 0.78);
    bg.strokeRoundedRect(-ANSWER_CARD_WIDTH / 2, -ANSWER_CARD_HEIGHT / 2, ANSWER_CARD_WIDTH, ANSWER_CARD_HEIGHT, ANSWER_CARD_RADIUS);
  }

  private drawQuestionPanel(
    width = QUESTION_PANEL_WIDTH,
    height = QUESTION_PANEL_HEIGHT,
    y = 157,
  ) {
    this.questionBg.clear();
    this.questionBg.fillStyle(0xffffff, PANEL_ALPHA);
    this.questionBg.fillRoundedRect(
      WIDTH / 2 - width / 2,
      y,
      width,
      height,
      QUESTION_PANEL_RADIUS,
    );
    this.questionBg.lineStyle(4, 0xffffff, 0.82);
    this.questionBg.strokeRoundedRect(
      WIDTH / 2 - width / 2,
      y,
      width,
      height,
      QUESTION_PANEL_RADIUS,
    );
  }

  private drawTimerBar(progress: number, color: number) {
    const x = WIDTH / 2 - TIMER_WIDTH / 2;
    const y = 548;
    this.timerTrack.clear();
    this.timerTrack.fillStyle(0xffffff, 0.28);
    this.timerTrack.fillRoundedRect(x, y, TIMER_WIDTH, TIMER_HEIGHT, TIMER_RADIUS);
    this.timerTrack.lineStyle(2, 0xffffff, 0.45);
    this.timerTrack.strokeRoundedRect(x, y, TIMER_WIDTH, TIMER_HEIGHT, TIMER_RADIUS);

    this.timerBar.clear();
    this.timerBar.fillStyle(color, 0.95);
    this.timerBar.fillRoundedRect(x, y, TIMER_WIDTH * Phaser.Math.Clamp(progress, 0, 1), TIMER_HEIGHT, TIMER_RADIUS);
  }

  private createPlayerPanels() {
    const positions: Array<[number, number, 0 | 1]> = [
      [34, 640, 0],
      [1246, 640, 1],
    ];

    for (const [x, y, side] of positions) {
      const panel = this.add.container(x, y);
      const panelX = side === 0 ? 0 : -PLAYER_PANEL_WIDTH;
      const nameX = side === 0 ? 24 : -PLAYER_PANEL_WIDTH + 24;
      const badgeX = side === 0 ? PLAYER_PANEL_WIDTH - 118 : -118;
      const bg = this.add.graphics();
      bg.fillStyle(0xffffff, PANEL_ALPHA);
      bg.fillRoundedRect(panelX, -PLAYER_PANEL_HEIGHT / 2, PLAYER_PANEL_WIDTH, PLAYER_PANEL_HEIGHT, PLAYER_PANEL_RADIUS);
      bg.lineStyle(5, PLAYER_COLORS[side], 1);
      bg.strokeRoundedRect(panelX, -PLAYER_PANEL_HEIGHT / 2, PLAYER_PANEL_WIDTH, PLAYER_PANEL_HEIGHT, PLAYER_PANEL_RADIUS);

      const name = this.add.text(nameX, -21, '', {
        fontFamily: GAME_FONT,
        fontSize: '30px',
        color: PLAYER_TEXT_COLORS[side],
        stroke: '#ffffff',
        strokeThickness: 2,
      }).setOrigin(0, 0.5);
      const stats = this.add.text(nameX, 22, '', {
        fontFamily: GAME_FONT,
        fontSize: '17px',
        color: '#64748b',
      }).setOrigin(0, 0.5);

      const badgeBg = this.add.graphics();
      this.drawLockBadgeBg(badgeBg, badgeX, -PLAYER_BADGE_HEIGHT / 2, PLAYER_BADGE_WIDTH, PLAYER_BADGE_HEIGHT, 0xf8fafc, PLAYER_COLORS[side]);
      const badge = this.add.text(badgeX + PLAYER_BADGE_WIDTH / 2, 0, '', {
        fontFamily: GAME_FONT,
        fontSize: '18px',
        color: '#0f172a',
      }).setOrigin(0.5);
      panel.add([bg, name, stats, badgeBg, badge]);
      this.playerPanels.push(panel);
      this.playerNames.push(name);
      this.playerStats.push(stats);
      this.lockBadgeBgs.push(badgeBg);
      this.lockBadges.push(badge);
    }
  }

  private drawLockBadgeBg(
    badgeBg: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    width: number,
    height: number,
    fill: number,
    stroke: number,
  ) {
    badgeBg.clear();
    badgeBg.fillStyle(fill, PANEL_ALPHA);
    badgeBg.fillRoundedRect(x, y, width, height, PLAYER_BADGE_RADIUS);
    badgeBg.lineStyle(3, stroke, 0.85);
    badgeBg.strokeRoundedRect(x, y, width, height, PLAYER_BADGE_RADIUS);
  }

  private after(delay: number, callback: () => void) {
    const timer = window.setTimeout(() => {
      this.phaseTimers.delete(timer);
      callback();
    }, delay);
    this.phaseTimers.add(timer);
  }

  private createClassroomControls() {
    const nameForm = document.querySelector<HTMLFormElement>('#player-setup')!;
    const controls = document.querySelector<HTMLElement>('#classroom-controls')!;
    const legacy = ['KeyA', 'KeyS', 'KeyD', 'KeyF', 'KeyJ', 'KeyK', 'KeyL', 'Semicolon'];
    const answer = (index: number) => this.handleButton(Math.floor(index / 4), BUTTON_ORDER[index % 4]);

    nameForm.addEventListener('submit', event => {
      event.preventDefault();
      const form = new FormData(nameForm);
      this.nameDrafts = [String(form.get('player1')), String(form.get('player2'))];
      this.unlockAudio();
      this.startQuizFromNames();
    });
    controls.addEventListener('click', event => {
      const button = (event.target as HTMLElement).closest<HTMLButtonElement>('button[data-answer]');
      if (button) answer(Number(button.dataset.answer));
    });
    controls.querySelectorAll<HTMLButtonElement>('button[data-axis]').forEach(button => {
      const index = Number(button.dataset.player);
      const offset = button.dataset.axis!.split(',').map(Number) as [number, number];
      const release = () => { this.touchAxes[index] = [0, 0]; };
      button.addEventListener('pointerdown', event => {
        button.setPointerCapture(event.pointerId);
        this.touchAxes[index] = offset;
      });
      button.addEventListener('pointerup', release);
      button.addEventListener('pointercancel', release);
      button.addEventListener('lostpointercapture', release);
      button.addEventListener('keydown', event => {
        if (event.key === ' ' || event.key === 'Enter') this.touchAxes[index] = offset;
      });
      button.addEventListener('keyup', release);
      button.addEventListener('blur', release);
    });
    window.addEventListener('keydown', event => {
      const target = event.target as HTMLElement;
      if (target.matches('input, textarea, select') || event.ctrlKey || event.altKey || event.metaKey) return;
      this.pressedKeys.add(event.code);
      if (this.mode === 'name-entry') {
        if (event.code === this.controlsMapping.keys.confirm && !target.closest('button')) nameForm.requestSubmit();
        return;
      }
      if (['stick', 'shake'].includes(this.activeMini?.type ?? '') &&
          ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'KeyQ', 'KeyE', 'KeyW', 'KeyZ'].includes(event.code)) {
        event.preventDefault();
        return;
      }
      const mapped = Array.from({ length: 8 }, (_, index) => this.controlsMapping.keys['answer' + (index + 1)]);
      const match = mapped.indexOf(event.code);
      const index = match < 0 ? legacy.indexOf(event.code) : match;
      if (index >= 0) {
        event.preventDefault();
        if (!event.repeat || this.activeMini?.type === 'mash' || this.activeMini?.type === 'switch') answer(index);
      }
    });
    window.addEventListener('keyup', event => this.pressedKeys.delete(event.code));
    window.addEventListener('blur', () => { this.pressedKeys.clear(); this.touchAxes = [[0, 0], [0, 0]]; });
    window.addEventListener('storage', () => {
      this.controlsMapping = mapping() as ControlMapping;
      this.customButtons = Boolean(read('input', {}).buttons);
    });
    window.addEventListener('message', event => {
      if (event.origin !== location.origin || event.source !== window.parent || event.data?.type !== 'englishcode-action') return;
      if (event.data.action === 'confirm' && this.mode === 'name-entry') nameForm.requestSubmit();
      const match = /^answer([1-8])$/.exec(event.data.action);
      if (match) answer(Number(match[1]) - 1);
    });
  }

  private showControls() {
    document.querySelector<HTMLElement>('#game')!.dataset.phase = this.mode;
    const active = this.mode === 'quiz' || this.mode === 'minigame';
    document.querySelector<HTMLElement>('#player-setup')!.hidden = this.mode !== 'name-entry';
    document.querySelector<HTMLElement>('#classroom-controls')!.hidden = !active;
    document.querySelectorAll<HTMLElement>('[data-directions]').forEach(row => {
      row.hidden = !active || !['stick', 'shake'].includes(this.activeMini?.type ?? '');
    });
    document.querySelectorAll<HTMLButtonElement>('button[data-answer]').forEach((button, i) => {
      const key = BUTTON_ORDER[i % 4];
      const text = this.mode === 'quiz' ? this.currentQuestion.answers[key] : null;
      button.hidden = this.mode === 'quiz' && !text;
      button.disabled = this.mode === 'quiz' && Boolean(this.players[Math.floor(i / 4)].answer);
      button.textContent = text ? `${key} · ${text}` : key;
    });
    const prompt = document.querySelector<HTMLElement>('#control-prompt')!;
    prompt.textContent = this.mode === 'quiz' ? this.currentQuestion.prompt :
      this.activeMini ? this.miniInstruction(this.activeMini.type) : '';
    if (window.parent !== window) {
      const actions = active ? Array.from({ length: 8 }, (_, index) => index)
        .filter(index => this.mode !== 'quiz' || Boolean(this.currentQuestion.answers[BUTTON_ORDER[index % 4]]))
        .map(index => 'answer' + (index + 1)) : this.mode === 'name-entry' ? ['confirm'] : [];
      window.parent.postMessage({ type: 'englishcode-ready', game: 'world_cup', actions }, location.origin);
    }
  }

  private playerAxes(index: number) {
    const pad = this.getGamepad(index);
    if (pad) return [pad.axes[0] ?? 0, pad.axes[1] ?? 0];
    const [left, right, up, down] = index === 0 ? ['KeyQ', 'KeyE', 'KeyW', 'KeyZ'] :
      ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];
    const [x, y] = this.touchAxes[index];
    return [x || Number(this.pressedKeys.has(right)) - Number(this.pressedKeys.has(left)),
      y || Number(this.pressedKeys.has(down)) - Number(this.pressedKeys.has(up))];
  }

  private showNameEntry() {
    this.mode = 'name-entry';
    this.playScene('idle');
    this.startIdleCommentary(1200);
    this.clearMini();
    this.setQuizUiVisible(false);
    this.setTimerVisible(false);
    this.setHeaderVisible(false);
    this.messageText.setPosition(WIDTH / 2, 688);
    this.questionText.setText('');
    this.messageText.setText("Enter player nicknames below");
    this.footerText.setText('');
    this.nameEntryOriginals = [
      this.players[0].name.trim().toUpperCase() || 'PLAYER 1',
      this.players[1].name.trim().toUpperCase() || 'PLAYER 2',
    ];
    this.nameDrafts = [
      this.nameEntryOriginals[0],
      this.nameEntryOriginals[1],
    ];
    this.players[0].name = this.nameDrafts[0];
    this.players[1].name = this.nameDrafts[1];
    document.querySelector<HTMLInputElement>('#player-one')!.value = this.nameDrafts[0];
    document.querySelector<HTMLInputElement>('#player-two')!.value = this.nameDrafts[1];
    this.updatePanels();
    this.showControls();
  }

  private showNameEntryWithNoWinner() {
    this.showNameEntry();
    this.playScene('no-winner', true);
    this.clearCommentaryEvents();
    this.playCommentary(COMMENTARY_KEYS.noWinner);
    this.startIdleCommentary(9000);
    this.setQuestionTextStyle(false);
    this.setAnnouncementTextStyle('#7f1d1d', '#ffffff');
    this.questionText.setPosition(WIDTH / 2, 178);
    this.questionText.setText('NO WINNER');
    this.after(NO_WINNER_TEXT_MS, () => {
      if (this.mode === 'name-entry') this.questionText.setText('');
    });
  }

  private startQuizFromNames() {
    if (this.mode !== 'name-entry') return;
    this.assignGamepads();
    const previousPlayers = this.players.map((player) => ({ ...player }));
    this.players[0].name = this.nameDrafts[0].trim().toUpperCase() || 'PLAYER 1';
    this.players[1].name = this.nameDrafts[1].trim().toUpperCase() || 'PLAYER 2';
    this.players.forEach((player, index) => {
      const previous = previousPlayers[index];
      const keepsIdentity = this.samePlayerName(this.nameEntryOriginals[index], player.name);
      player.answer = undefined;
      player.quizCorrect = false;
      player.streak = keepsIdentity ? previous.streak : 0;
      player.carryStreak = keepsIdentity ? previous.carryStreak : false;
      player.goals = keepsIdentity ? previous.goals : 0;
      player.miniScore = 0;
      player.miniDone = false;
    });
    this.questionNumber = 0;
    this.showQuestion();
  }

  private showQuestion() {
    this.mode = 'quiz';
    this.playScene('quiz');
    this.clearCommentaryEvents();
    this.playCommentary(COMMENTARY_KEYS.quizStart);
    this.clearMini();
    this.setQuizUiVisible(true);
    this.drawQuestionPanel();
    this.quizStartedAt = this.time.now;
    this.quizResolved = false;
    this.armInputGate(350);
    this.currentQuestion = this.shuffleQuestionAnswers(this.nextQuestion());
    this.questionNumber += 1;
    this.players.forEach((player) => {
      player.answer = undefined;
      player.quizCorrect = false;
    });
    this.messageText.setPosition(WIDTH / 2, 586);
    this.setQuestionTextStyle(true);
    this.questionText.setPosition(WIDTH / 2, 198);
    this.title.setText('English World Cup');
    this.subtitle.setText('Choose your answer');
    this.roundChip.setText(`Question ${this.questionNumber}`);
    this.questionText.setText(this.displayPrompt(this.currentQuestion.prompt));
    this.messageText.setText('');
    this.footerText.setText('');

    this.answerCards.forEach((card) => {
      const text = this.currentQuestion.answers[card.key];
      for (const part of [card.answerLabel, card.shadow, card.bg, card.shine, card.pill, card.buttonLabel]) part.setVisible(Boolean(text));
      card.answerLabel.setText(text ?? '');
      card.shadow.setAlpha(0.34);
      card.bg.setAlpha(0.96);
      card.bg.setScale(1);
      card.shine.setScale(1);
      card.pill.setScale(1);
    });
    this.updatePanels();
    this.showControls();
  }

  private updateQuizTimer(time: number) {
    const elapsed = (time - this.quizStartedAt) / 1000;
    const remaining = Math.max(0, QUIZ_SECONDS - elapsed);
    const progress = Phaser.Math.Clamp(remaining / QUIZ_SECONDS, 0, 1);
    const color = progress < 0.28 ? 0xef4444 : progress < 0.55 ? 0xfacc15 : 0x22c55e;
    this.drawTimerBar(progress, color);
    this.timerText.setText(`${Math.ceil(remaining)}`);
    this.timerText.setScale(remaining <= 5 ? 1 + Math.sin(time / 90) * 0.07 : 1);

    if (remaining <= 0 && !this.quizResolved) {
      this.players.forEach((player) => {
        if (!player.answer) player.answer = undefined;
      });
      this.resolveQuiz();
    }
  }

  private resolveQuiz() {
    if (this.quizResolved) return;
    this.quizResolved = true;
    this.mode = 'reveal';
    this.showControls();
    const correct = this.currentQuestion.correct;
    const correctPlayers = this.players.map((player) => player.answer === correct);
    this.players.forEach((player, index) => {
      player.quizCorrect = correctPlayers[index];
    });

    this.answerCards.forEach((card) => {
      const isCorrect = card.key === correct;
      card.shadow.setAlpha(isCorrect ? 0.48 : 0.18);
      card.bg.setAlpha(isCorrect ? 1 : 0.42);
      card.shine.setAlpha(isCorrect ? 0.22 : 0.06);
      if (isCorrect) {
        this.tweens.add({ targets: [card.bg, card.pill, card.shine], scale: 1.06, yoyo: true, duration: 170, repeat: 2 });
      }
    });
    this.messageText.setText('');
    this.footerText.setText('');
    this.updatePanels(true);

    this.after(1500, () => {
      if (this.mode !== 'reveal') return;
      if (!correctPlayers[0] && !correctPlayers[1]) {
        this.players.forEach((_, index) => this.resetPlayerForNameEntry(index));
        this.showNameEntryWithNoWinner();
        return;
      }
      if (correctPlayers[0] && correctPlayers[1]) {
        this.players.forEach((player) => this.awardGoal(player));
        if (this.showChampionIfNeeded()) return;
        this.showQuestion();
        return;
      }
      this.startMiniGame(correctPlayers[0] ? 0 : 1, correctPlayers[0] ? 1 : 0);
    });
  }

  private startMiniGame(shooterIndex: number, keeperIndex: number) {
    const type = Phaser.Math.RND.pick<MiniGameType>([
      'timing',
      'mash',
      'stick',
      'sequence',
      'reaction',
      'corners',
      'switch',
      'shake',
    ]);
    this.mode = 'minigame';
    this.playScene('penalty');
    this.clearCommentaryEvents();
    this.playCommentary(COMMENTARY_KEYS.minigameReady);
    this.scheduleCommentary(2900, () => {
      if (this.mode === 'minigame' && this.activeMini && !this.activeMini.started) {
        this.playCommentary(MINI_COMMENTARY_KEYS[this.activeMini.type]);
      }
    });
    this.scheduleCommentary(15000, () => {
      if (this.mode === 'minigame' && this.activeMini && !this.activeMini.started) {
        this.playCommentary(MINI_COMMENTARY_KEYS[this.activeMini.type]);
      }
    });
    this.setQuizUiVisible(false);
    this.setTimerVisible(true);
    this.clearMini();
    this.players.forEach((player) => {
      player.miniScore = 0;
      player.miniDone = false;
    });
    this.activeMini = {
      type,
      shooterIndex,
      keeperIndex,
      startedAt: this.time.now,
      started: false,
      readyPlayers: [false, false],
      targetX: Phaser.Math.Between(540, 740),
      targetY: Phaser.Math.Between(330, 430),
      targetButton: Phaser.Math.RND.pick(BUTTON_ORDER),
      revealAt: this.time.now + Phaser.Math.Between(900, 1700),
      switchEvery: 650,
      lastAxes: [[0, 0], [0, 0]],
      cornerPicks: [undefined, undefined],
      sequence: Phaser.Utils.Array.Shuffle([...BUTTON_ORDER]).slice(0, 4),
      sequenceProgress: [0, 0],
      lastMashAt: [0, 0],
      resultShown: false,
    };
    this.armInputGate(350);

    this.messageText.setPosition(WIDTH / 2, 688);
    this.title.setText('Penalty Battle');
    this.subtitle.setText(`${this.players[shooterIndex].name} shoots  |  ${this.players[keeperIndex].name} saves`);
    this.roundChip.setText('Penalty');
    this.drawMiniInstructionText();
    this.messageText.setText('Both players press A to start');
    this.showControls();
    this.timerText.setText(`${this.miniDuration(type)}`);
    this.drawTimerBar(1, 0x38bdf8);
    this.footerText.setText('');
    this.updatePanels();
  }

  private updateMiniGame(time: number) {
    if (!this.activeMini) return;
    if (!this.activeMini.started) {
      this.drawMiniInstructions();
      return;
    }
    const elapsed = (time - this.activeMini.startedAt) / 1000;
    const duration = this.miniDuration(this.activeMini.type);
    const remaining = Math.max(0, duration - elapsed);
    this.timerText.setText(`${Math.ceil(remaining)}`);
    this.drawTimerBar(Phaser.Math.Clamp(remaining / duration, 0, 1), 0x38bdf8);

    this.drawMiniGame(time, remaining);

    if (remaining <= 0 && !this.activeMini.resultShown) {
      this.finishMiniGame();
    }
  }

  private drawMiniGame(time: number, remaining: number) {
    if (!this.activeMini) return;
    this.miniGraphics.clear();
    this.miniLayer.removeAll(true);
    this.drawMiniInstructionText();
    this.footerText.setText('');

    const leftX = 250;
    const rightX = 1030;
    this.drawPlayerMiniPanel(0, leftX, this.players[0].miniScore);
    this.drawPlayerMiniPanel(1, rightX, this.players[1].miniScore);

    if (this.activeMini.type === 'timing') {
      this.drawTimingMini(time);
    }
    if (this.activeMini.type === 'mash') {
      this.drawMashMini();
    }
    if (this.activeMini.type === 'stick') {
      this.drawStickMini();
    }
    if (this.activeMini.type === 'sequence') {
      this.drawSequenceMini();
    }
    if (this.activeMini.type === 'reaction') {
      this.drawReactionMini(time);
    }
    if (this.activeMini.type === 'corners') {
      this.drawCornersMini();
    }
    if (this.activeMini.type === 'switch') {
      this.drawSwitchMini(time);
    }
    if (this.activeMini.type === 'shake') {
      this.updateShakeScore();
      if (this.mode !== 'minigame' || !this.activeMini) return;
      this.drawShakeMini();
    }

    if (remaining < 1.2) {
      this.messageText.setText('Last second');
    } else {
      this.messageText.setText('');
    }
  }

  private drawMiniInstructions() {
    if (!this.activeMini) return;
    this.miniGraphics.clear();
    this.miniLayer.removeAll(true);
    this.drawMiniInstructionText();
    this.drawPlayerMiniPanel(0, 250, this.players[0].miniScore);
    this.drawPlayerMiniPanel(1, 1030, this.players[1].miniScore);
  }

  private drawMiniInstructionText() {
    if (!this.activeMini) return;
    let panelHeight = MINI_INSTRUCTION_PANEL_HEIGHT;
    const instructionY = () => MINI_INSTRUCTION_PANEL_Y + panelHeight / 2;
    this.drawQuestionPanel(MINI_INSTRUCTION_PANEL_WIDTH, panelHeight, MINI_INSTRUCTION_PANEL_Y);
    this.questionBg.setVisible(true);
    this.setQuestionTextStyle(true);
    this.questionText.setWordWrapWidth(MINI_INSTRUCTION_PANEL_WIDTH - 90);
    if (this.activeMini.type !== 'corners') {
      this.questionText.setVisible(true);
      this.questionText.setText(this.miniInstruction(this.activeMini.type));
      panelHeight = Math.max(MINI_INSTRUCTION_PANEL_HEIGHT, this.questionText.height + 34);
      this.drawQuestionPanel(MINI_INSTRUCTION_PANEL_WIDTH, panelHeight, MINI_INSTRUCTION_PANEL_Y);
      this.questionText.setPosition(WIDTH / 2, instructionY());
      return;
    }

    this.questionText.setText('');
    this.questionText.setVisible(false);
    const pieces: Array<{ text: string; color: string }> = [
      { text: 'PICK A CORNER WITH ', color: '#0f172a' },
      { text: 'A', color: '#22c55e' },
      { text: ' B', color: '#ef4444' },
      { text: ' X', color: '#3b82f6' },
      { text: ' Y', color: '#facc15' },
    ];
    const texts = pieces.map((piece) => this.add.text(0, 0, piece.text, {
      fontFamily: GAME_FONT,
      fontSize: '41px',
      color: piece.color,
      stroke: '#ffffff',
      strokeThickness: 2,
    }).setOrigin(0, 0.5));
    const totalWidth = texts.reduce((width, text) => width + text.width, 0);
    let x = WIDTH / 2 - totalWidth / 2;
    texts.forEach((text) => {
      text.setPosition(x, instructionY());
      x += text.width;
      this.miniLayer.add(text);
    });
  }

  private beginMiniGame() {
    if (this.mode !== 'minigame' || !this.activeMini || this.activeMini.started) return;
    this.clearCommentaryEvents();
    this.players.forEach((player) => {
      player.miniScore = 0;
      player.miniDone = false;
    });
    this.activeMini.started = true;
    this.activeMini.startedAt = this.time.now;
    this.activeMini.revealAt = this.time.now + Phaser.Math.Between(900, 1700);
    this.activeMini.lastAxes = [[0, 0], [0, 0]];
    this.messageText.setText('');
    this.footerText.setText('');
    this.armInputGate(250);
  }

  private drawPlayerMiniPanel(playerIndex: number, x: number, score: number) {
    const player = this.players[playerIndex];
    const role = this.activeMini?.shooterIndex === playerIndex ? 'SHOOTER' : 'KEEPER';
    const color = playerIndex === 0 ? 0x38bdf8 : 0xfacc15;
    this.miniGraphics.fillStyle(0xffffff, PANEL_ALPHA).fillRoundedRect(
      x - MINI_PANEL_WIDTH / 2,
      MINI_PANEL_Y,
      MINI_PANEL_WIDTH,
      MINI_PANEL_HEIGHT,
      18,
    );
    this.miniGraphics.lineStyle(4, color, 0.95).strokeRoundedRect(
      x - MINI_PANEL_WIDTH / 2,
      MINI_PANEL_Y,
      MINI_PANEL_WIDTH,
      MINI_PANEL_HEIGHT,
      18,
    );
    this.miniLayer.add(this.add.text(x, MINI_PANEL_Y + 32, role, {
      fontFamily: GAME_FONT,
      fontSize: '25px',
      color: '#64748b',
    }).setOrigin(0.5));
    this.miniLayer.add(this.add.text(x, MINI_PANEL_Y + 70, player.name, {
      fontFamily: GAME_FONT,
      fontSize: '30px',
      color: PLAYER_TEXT_COLORS[playerIndex],
      stroke: '#ffffff',
      strokeThickness: 2,
    }).setOrigin(0.5));
    this.miniGraphics.fillStyle(0x94a3b8, 0.34).fillRoundedRect(
      x - MINI_PROGRESS_TRACK_WIDTH / 2,
      MINI_PANEL_Y + 170,
      MINI_PROGRESS_TRACK_WIDTH,
      22,
      11,
    );
    this.miniGraphics.fillStyle(color, 1).fillRoundedRect(
      x - MINI_PROGRESS_TRACK_WIDTH / 2,
      MINI_PANEL_Y + 170,
      Phaser.Math.Clamp(score, 0, 100) * (MINI_PROGRESS_TRACK_WIDTH / 100),
      22,
      11,
    );
    this.miniLayer.add(this.add.text(x, MINI_PANEL_Y + 125, `${Math.round(score)}`, {
      fontFamily: GAME_FONT,
      fontSize: '34px',
      color: '#0f172a',
    }).setOrigin(0.5));
  }

  private drawTimingMini(time: number) {
    if (!this.activeMini) return;
    const ballX = 640 + Math.sin((time - this.activeMini.startedAt) / 260) * TIMING_BALL_SWING;
    this.miniGraphics.fillStyle(0xffffff, 0.22).fillRoundedRect(500, 430, 280, 28, 14);
    this.miniGraphics.fillStyle(0x22c55e, 0.95).fillRoundedRect(this.activeMini.targetX - 38, 423, 76, 42, 18);
    this.miniGraphics.fillStyle(0xffffff, 1).fillCircle(ballX, 444, 24);
    this.miniGraphics.lineStyle(5, 0x0f172a, 0.9).strokeCircle(ballX, 444, 24);
  }

  private drawMashMini() {
    this.miniLayer.add(this.createButtonIcon(640, 430, 'A', 1.55));
  }

  private drawStickMini() {
    if (!this.activeMini) return;
    this.miniGraphics.fillStyle(0x22c55e, 0.85).fillCircle(this.activeMini.targetX, this.activeMini.targetY, 42);
    this.miniGraphics.lineStyle(5, 0xffffff, 0.9).strokeCircle(this.activeMini.targetX, this.activeMini.targetY, 42);
    for (let playerIndex = 0; playerIndex < 2; playerIndex += 1) {
      const [axisX, axisY] = this.playerAxes(playerIndex);
      const x = 640 + axisX * STICK_CURSOR_X_RANGE;
      const y = 390 + axisY * STICK_CURSOR_Y_RANGE;
      const color = playerIndex === 0 ? 0x38bdf8 : 0xfacc15;
      this.miniGraphics.fillStyle(color, 1).fillCircle(x, y, 18);
      this.miniGraphics.lineStyle(4, 0xffffff, 0.85).strokeCircle(x, y, 18);
    }
  }

  private drawSequenceMini() {
    if (!this.activeMini) return;
    this.activeMini.sequence.forEach((key, index) => {
      this.miniLayer.add(this.createButtonIcon(520 + index * 80, 430, key, 1));
    });
  }

  private drawReactionMini(time: number) {
    if (!this.activeMini) return;
    const waiting = time < this.activeMini.revealAt;
    this.miniGraphics.fillStyle(waiting ? 0xfacc15 : 0x22c55e, 0.95).fillRoundedRect(500, 430, 280, 78, 24);
    this.miniLayer.add(this.add.text(640, 469, waiting ? 'WAIT' : 'NOW', {
      fontFamily: GAME_FONT,
      fontSize: '30px',
      color: waiting ? '#172033' : '#ffffff',
    }).setOrigin(0.5));
    if (!waiting) {
      this.miniLayer.add(this.createButtonIcon(640, 370, this.activeMini.targetButton, 1.35));
    }
  }

  private drawCornersMini() {
    const corners: Array<[ButtonKey, number, number]> = [
      ['X', 545, 360],
      ['Y', 735, 360],
      ['A', 545, 455],
      ['B', 735, 455],
    ];
    this.miniGraphics.fillStyle(0xffffff, PANEL_ALPHA).fillRoundedRect(500, 330, 280, 160, 18);
    this.miniGraphics.lineStyle(7, 0xffffff, 0.85).strokeRoundedRect(500, 330, 280, 160, 18);
    this.miniGraphics.lineStyle(4, 0xffffff, 0.5).lineBetween(640, 330, 640, 490);
    this.miniGraphics.lineStyle(4, 0xffffff, 0.5).lineBetween(500, 410, 780, 410);
    corners.forEach(([key, x, y]) => {
      this.miniLayer.add(this.createButtonIcon(x, y, key, 0.8));
    });
  }

  private drawSwitchMini(time: number) {
    const key = this.currentSwitchButton(time);
    this.miniLayer.add(this.createButtonIcon(640, 420, key, 1.7));
    this.miniGraphics.fillStyle(0xffffff, 0.22).fillRoundedRect(500, 495, 280, 16, 8);
    const phase = ((time - (this.activeMini?.startedAt ?? time)) % (this.activeMini?.switchEvery ?? 650)) / (this.activeMini?.switchEvery ?? 650);
    this.miniGraphics.fillStyle(BUTTON_COLORS[key], 1).fillRoundedRect(500, 495, 280 * (1 - phase), 16, 8);
  }

  private drawShakeMini() {
    this.miniGraphics.lineStyle(8, 0xffffff, 0.85).strokeCircle(640, 420, 70);
    this.miniGraphics.lineStyle(4, 0x38bdf8, 0.8).strokeCircle(640, 420, 44);
    this.miniGraphics.lineStyle(4, 0xfacc15, 0.8).strokeCircle(640, 420, 96);
    this.miniLayer.add(this.add.text(640, 420, 'L', {
      fontFamily: GAME_FONT,
      fontSize: '48px',
      color: '#ffffff',
      stroke: '#0f172a',
      strokeThickness: 6,
    }).setOrigin(0.5));
  }

  private createButtonIcon(x: number, y: number, key: ButtonKey, scale: number) {
    const group = this.add.container(x, y);
    const circle = this.add.ellipse(0, 0, 56 * scale, 56 * scale, BUTTON_COLORS[key], 1)
      .setStrokeStyle(4, 0xffffff, 0.9);
    const label = this.add.text(0, 0, key, {
      fontFamily: GAME_FONT,
      fontSize: `${28 * scale}px`,
      color: BUTTON_TEXT[key],
    }).setOrigin(0.5);
    group.add([circle, label]);
    return group;
  }

  private currentSwitchButton(time: number) {
    if (!this.activeMini) return 'A';
    const index = Math.floor((time - this.activeMini.startedAt) / this.activeMini.switchEvery) % BUTTON_ORDER.length;
    return BUTTON_ORDER[index];
  }

  private updateShakeScore() {
    if (!this.activeMini) return;
    for (let playerIndex = 0; playerIndex < 2; playerIndex += 1) {
      const [axisX, axisY] = this.playerAxes(playerIndex);
      const last = this.activeMini.lastAxes[playerIndex];
      const delta = Math.abs(axisX - last[0]) + Math.abs(axisY - last[1]);
      if (delta > 0.32) {
        this.players[playerIndex].miniScore = Math.min(100, this.players[playerIndex].miniScore + delta * 2.8);
        if (this.players[playerIndex].miniScore >= 100) this.players[playerIndex].miniDone = true;
      }
      this.activeMini.lastAxes[playerIndex] = [axisX, axisY];
    }
    if (this.players.some((player) => player.miniScore >= 100)) {
      this.finishMiniGame();
    }
  }

  private finishMiniGame() {
    if (!this.activeMini) return;
    if (this.activeMini.resultShown) return;
    if (this.processingGamepadBatch) {
      this.finishMiniGameQueued = true;
      return;
    }
    this.activeMini.resultShown = true;
    const shooter = this.players[this.activeMini.shooterIndex];
    const keeper = this.players[this.activeMini.keeperIndex];
    const shooterScore = Math.round(shooter.miniScore);
    const keeperScore = Math.round(keeper.miniScore);
    const shooterName = shooter.name;
    const keeperName = keeper.name;

    if (this.activeMini.type === 'reaction' && shooterScore === 0 && keeperScore === 0) {
      this.showResult(
        'NO WINNER',
        'No winner',
        'No correct button',
        `${shooterName} 0 - ${keeperName} 0`,
        false,
        undefined,
        [0, 1],
      );
      return;
    }

    if (shooterScore === keeperScore) {
      this.showResult(
        'NO WINNER',
        'No winner',
        'Tie game',
        `${shooterName} ${shooterScore} - ${keeperName} ${keeperScore}`,
        false,
        undefined,
        [0, 1],
      );
      return;
    }

    const goal = shooterScore > keeperScore;
    const miniWinner = goal ? shooter : keeper;
    const miniLoser = goal ? keeper : shooter;
    const miniWinnerIndex = this.players.indexOf(miniWinner);
    const miniLoserIndex = this.players.indexOf(miniLoser);
    const miniWinnerName = miniWinner.name;
    this.awardGoal(miniWinner);
    this.resetPlayerForNameEntry(miniLoserIndex);

    if (goal) {
      if (this.showChampionIfNeeded()) return;
      this.showResult(
        'GOOOAL',
        miniWinnerName,
        `${shooterName} scored the penalty`,
        `${shooterName} ${shooterScore} - ${keeperName} ${keeperScore}`,
        true,
        miniWinnerIndex,
      );
    } else {
      if (this.showChampionIfNeeded()) return;
      this.showResult(
        'SAVE',
        miniWinnerName,
        `${keeperName} saved the penalty`,
        `${shooterName} ${shooterScore} - ${keeperName} ${keeperScore}`,
        true,
        miniWinnerIndex,
      );
    }
  }

  private showResult(
    headline: string,
    winnerName: string,
    penaltyLine: string,
    scoreLine: string,
    dramatic: boolean,
    winnerIndex?: number,
    resetIndexesBeforeNameEntry: number[] = [],
  ) {
    this.mode = 'result';
    this.showControls();
    this.playScene(headline === 'GOOOAL' ? 'goal' : headline === 'SAVE' ? 'save' : headline === 'NO WINNER' ? 'no-winner' : 'idle');
    this.clearCommentaryEvents();
    if (headline === 'GOOOAL') this.playCommentary(COMMENTARY_KEYS.goal, 0.9);
    if (headline === 'SAVE') this.playCommentary(COMMENTARY_KEYS.save, 0.86);
    if (headline === 'NO WINNER') this.playCommentary(COMMENTARY_KEYS.noWinner);
    this.clearMini();
    this.setQuizUiVisible(false);
    this.setTimerVisible(false);
    this.title.setText(headline);
    this.subtitle.setText(penaltyLine);
    this.setQuestionTextStyle(false);
    this.setAnnouncementTextStyle(
      headline === 'NO WINNER' ? '#7f1d1d' : this.announcementColorForPlayer(winnerIndex),
      headline === 'NO WINNER' ? '#ffffff' : '#0f172a',
    );
    this.questionText.setPosition(WIDTH / 2, 178);
    this.questionText.setText(headline === 'NO WINNER' ? 'NO WINNER' : winnerName);
    this.roundChip.setText('Result');
    this.messageText.setPosition(WIDTH / 2, 688);
    this.messageText.setText(scoreLine || this.bestStreakMessage());
    this.footerText.setText('');
    if (dramatic) {
      this.cameras.main.flash(260, 255, 255, 255);
      this.cameras.main.shake(260, 0.006);
    }
    this.updatePanels(true);
    if (headline === 'GOOOAL') {
      this.after(GOAL_VIDEO_MS, () => {
        if (this.mode === 'result') this.showNameEntry();
      });
      return;
    }
    if (headline === 'SAVE') {
      this.after(SAVE_VIDEO_MS, () => {
        if (this.mode === 'result') this.showNameEntry();
      });
      return;
    }
    if (headline === 'NO WINNER') {
      this.after(NO_WINNER_TEXT_MS, () => {
        if (this.mode === 'result') this.questionText.setText('');
      });
      this.after(NO_WINNER_VIDEO_MS, () => {
        if (this.mode === 'result') {
          resetIndexesBeforeNameEntry.forEach((index) => this.resetPlayerForNameEntry(index));
          this.showNameEntry();
        }
      });
      return;
    }
    this.input.keyboard?.once('keydown-ENTER', () => this.showNameEntry());
  }

  private handleButton(playerIndex: number, key: ButtonKey) {
    this.unlockAudio();
    if (this.time.now < this.inputReadyAt) return;
    if (this.mode === 'name-entry') {
      return;
    }
    if (this.mode === 'quiz') {
      if (!this.currentQuestion.answers[key]) return;
      if (!this.players[playerIndex].answer) {
        this.players[playerIndex].answer = key;
        this.updatePanels();
        document.querySelectorAll<HTMLButtonElement>('button[data-answer]').forEach((button, index) => {
          if (Math.floor(index / 4) === playerIndex) button.disabled = true;
        });
      }
      if (this.players.every((player) => player.answer)) {
        this.resolveQuiz();
      }
      return;
    }
    if (this.mode === 'minigame') {
      if (this.activeMini && !this.activeMini.started) {
        if (key === 'A') {
          this.activeMini.readyPlayers[playerIndex] = true;
          this.updatePanels();
          if (this.activeMini.readyPlayers.every(Boolean)) {
            this.beginMiniGame();
          }
        }
        return;
      }
      this.handleMiniInput(playerIndex, key);
      return;
    }
  }

  private handleMiniInput(playerIndex: number, key: ButtonKey) {
    if (!this.activeMini) return;
    if (!this.activeMini.started) return;
    const player = this.players[playerIndex];
    if (player.miniDone) return;
    const now = this.time.now;

    if (this.activeMini.type === 'timing' && key === 'A') {
      const ballX = 640 + Math.sin((now - this.activeMini.startedAt) / 260) * TIMING_BALL_SWING;
      const distance = Math.abs(ballX - this.activeMini.targetX);
      player.miniScore = Math.max(player.miniScore, Math.max(0, 100 - distance * 1.3));
      player.miniDone = true;
    }

    if (this.activeMini.type === 'mash' && key === 'A') {
      player.miniScore = Math.min(100, player.miniScore + 8);
      this.activeMini.lastMashAt[playerIndex] = now;
      if (player.miniScore >= 100) {
        player.miniDone = true;
        this.finishMiniGame();
        return;
      }
    }

    if (this.activeMini.type === 'stick' && key === 'A') {
      const [axisX, axisY] = this.playerAxes(playerIndex);
      const cursorX = 640 + axisX * STICK_CURSOR_X_RANGE;
      const cursorY = 390 + axisY * STICK_CURSOR_Y_RANGE;
      const distance = Phaser.Math.Distance.Between(cursorX, cursorY, this.activeMini.targetX, this.activeMini.targetY);
      player.miniScore = Math.max(player.miniScore, Math.max(0, 100 - distance));
      player.miniDone = true;
    }

    if (this.activeMini.type === 'sequence') {
      const progress = this.activeMini.sequenceProgress[playerIndex];
      if (this.activeMini.sequence[progress] === key) {
        this.activeMini.sequenceProgress[playerIndex] += 1;
        player.miniScore = this.activeMini.sequenceProgress[playerIndex] * 25;
        if (this.activeMini.sequenceProgress[playerIndex] >= this.activeMini.sequence.length) {
          player.miniDone = true;
          this.finishMiniGame();
          return;
        }
      } else {
        player.miniScore = Math.max(0, player.miniScore - 15);
      }
    }

    if (this.activeMini.type === 'reaction') {
      if (now < this.activeMini.revealAt) return;
      if (key === this.activeMini.targetButton) {
        const reactionMs = now - this.activeMini.revealAt;
        player.miniScore = Math.max(player.miniScore, Math.max(50, 100 - reactionMs / 12));
        player.miniDone = true;
        this.finishMiniGame();
        return;
      }
      return;
    }

    if (this.activeMini.type === 'corners') {
      this.activeMini.cornerPicks[playerIndex] = key;
      player.miniDone = true;
      if (this.activeMini.cornerPicks.every(Boolean)) {
        const shooterPick = this.activeMini.cornerPicks[this.activeMini.shooterIndex];
        const keeperPick = this.activeMini.cornerPicks[this.activeMini.keeperIndex];
        const saved = shooterPick === keeperPick;
        this.players[this.activeMini.shooterIndex].miniScore = saved ? 25 : 100;
        this.players[this.activeMini.keeperIndex].miniScore = saved ? 100 : 25;
      }
    }

    if (this.activeMini.type === 'switch') {
      const target = this.currentSwitchButton(now);
      player.miniScore = Phaser.Math.Clamp(player.miniScore + (key === target ? 12 : -16), 0, 100);
      if (player.miniScore >= 100) {
        player.miniDone = true;
        this.finishMiniGame();
        return;
      }
    }

    if (this.players.every((p) => p.miniDone)) {
      this.finishMiniGame();
    }
  }

  private pollGamepads() {
    this.assignGamepads();
    if (this.time.now < this.inputReadyAt) {
      this.syncGamepadButtonState();
      return;
    }

    const buttonEvents: Array<[number, ButtonKey]> = [];
    for (let playerIndex = 0; playerIndex < 2; playerIndex += 1) {
      const pad = this.getGamepad(playerIndex);
      if (!pad) continue;
      BUTTON_ORDER.forEach((key) => {
        const buttonIndex = this.controllerButtonIndex(pad, key);
        const button = pad.buttons[buttonIndex];
        const lockKey = `pad-${playerIndex}-${buttonIndex}`;
        const pressed = Boolean(button?.pressed);
        const wasPressed = this.previousButtonPressed.get(lockKey) ?? false;
        if (pressed && !wasPressed) {
          this.heldButtonRepeatAt.set(lockKey, this.time.now + HELD_BUTTON_REPEAT_MS);
          buttonEvents.push([playerIndex, key]);
        }
        if (pressed && wasPressed && this.canRepeatHeldButton(lockKey)) {
          this.heldButtonRepeatAt.set(lockKey, this.time.now + HELD_BUTTON_REPEAT_MS);
          buttonEvents.push([playerIndex, key]);
        }
        if (!pressed) {
          this.heldButtonRepeatAt.delete(lockKey);
        }
        this.previousButtonPressed.set(lockKey, pressed);
      });
    }

    this.processingGamepadBatch = true;
    buttonEvents.forEach(([playerIndex, key]) => this.handleButton(playerIndex, key));
    this.processingGamepadBatch = false;
    if (this.finishMiniGameQueued) {
      this.finishMiniGameQueued = false;
      this.finishMiniGame();
    }
  }

  private getGamepad(playerIndex: number) {
    const slot = this.playerPadSlots[playerIndex];
    if (slot === null) return null;
    return navigator.getGamepads?.()[slot] ?? null;
  }

  private assignGamepads() {
    const pads = this.connectedGamepads();
    const connectedSlots = new Set(pads.map((pad) => pad.index));
    const assignedSlots = new Set<number>();

    for (let playerIndex = 0; playerIndex < 2; playerIndex += 1) {
      const slot = this.playerPadSlots[playerIndex];
      if (slot !== null && connectedSlots.has(slot) && !assignedSlots.has(slot)) {
        assignedSlots.add(slot);
      } else {
        this.clearPlayerButtonState(playerIndex);
        this.playerPadSlots[playerIndex] = null;
      }
    }

    for (let playerIndex = 0; playerIndex < 2; playerIndex += 1) {
      if (this.playerPadSlots[playerIndex] !== null) continue;
      const nextPad = pads.find((pad) => !assignedSlots.has(pad.index));
      if (!nextPad) continue;
      this.playerPadSlots[playerIndex] = nextPad.index;
      assignedSlots.add(nextPad.index);
      this.clearPlayerButtonState(playerIndex);
    }
  }

  private connectedGamepads() {
    return Array.from(navigator.getGamepads?.() ?? []).filter((pad): pad is Gamepad => Boolean(pad));
  }

  private armInputGate(delayMs: number) {
    this.inputReadyAt = this.time.now + delayMs;
    this.syncGamepadButtonState();
    this.heldButtonRepeatAt.clear();
  }

  private syncGamepadButtonState() {
    this.playerPadSlots.forEach((slot, playerIndex) => {
      if (slot === null) return false;
      const pad = navigator.getGamepads?.()[slot];
      if (!pad) return false;
      BUTTON_ORDER.forEach((key) => {
        const buttonIndex = this.controllerButtonIndex(pad, key);
        const lockKey = `pad-${playerIndex}-${buttonIndex}`;
        const pressed = Boolean(pad.buttons[buttonIndex]?.pressed);
        this.previousButtonPressed.set(lockKey, pressed);
        if (pressed && this.activeMini?.started && (this.activeMini.type === 'mash' || this.activeMini.type === 'switch')) {
          this.heldButtonRepeatAt.set(lockKey, this.time.now + HELD_BUTTON_REPEAT_MS);
        } else if (!pressed) {
          this.heldButtonRepeatAt.delete(lockKey);
        }
      });
    });
  }

  private canRepeatHeldButton(lockKey: string) {
    if (!this.activeMini?.started) return false;
    if (this.activeMini.type !== 'mash' && this.activeMini.type !== 'switch') return false;
    return this.time.now >= (this.heldButtonRepeatAt.get(lockKey) ?? Number.POSITIVE_INFINITY);
  }

  private clearPlayerButtonState(playerIndex: number) {
    [...this.previousButtonPressed.keys()].forEach((key) => {
      if (key.startsWith(`pad-${playerIndex}-`)) this.previousButtonPressed.delete(key);
    });
    [...this.heldButtonRepeatAt.keys()].forEach((key) => {
      if (key.startsWith(`pad-${playerIndex}-`)) this.heldButtonRepeatAt.delete(key);
    });
  }

  private controllerButtonIndex(pad: Gamepad, key: ButtonKey) {
    if (this.customButtons) return this.controlsMapping.buttons['answer' + (BUTTON_ORDER.indexOf(key) + 1)];
    return this.isNintendoLayout(pad) ? NINTENDO_BUTTONS[key] : XBOX_BUTTONS[key];
  }

  private isNintendoLayout(pad: Gamepad) {
    return /nintendo|switch|joy-con|joycon|pro controller/i.test(pad.id);
  }

  private setQuizUiVisible(visible: boolean) {
    this.setTimerVisible(visible);
    this.questionBg.setVisible(visible);
    this.answerCards.forEach((card) => {
      card.shadow.setVisible(visible);
      card.shine.setVisible(visible);
      card.bg.setVisible(visible);
      card.pill.setVisible(visible);
      card.buttonLabel.setVisible(visible);
      card.answerLabel.setVisible(visible);
    });
  }

  private setTimerVisible(visible: boolean) {
    this.timerTrack.setVisible(visible);
    this.timerBar.setVisible(visible);
    this.timerText.setVisible(visible);
  }

  private setQuestionTextStyle(isQuizQuestion: boolean) {
    this.questionText.setVisible(true);
    this.questionText.setFontFamily(isQuizQuestion ? GAME_FONT : ANNOUNCEMENT_FONT);
    this.questionText.setFontSize(isQuizQuestion ? 41 : 42);
    this.questionText.setColor(isQuizQuestion ? '#0f172a' : '#ffffff');
    this.questionText.setStroke(isQuizQuestion ? '#ffffff' : '#0f172a', isQuizQuestion ? 2 : 7);
    this.questionText.setWordWrapWidth(isQuizQuestion ? 790 : 1020);
    this.questionText.setPadding(0, 0, 0, isQuizQuestion ? 14 : 0);
  }

  private displayPrompt(prompt: string) {
    return prompt
      .replace(/_{2,}/g, '━━━━')
      .replace(/\?/g, '？');
  }

  private setAnnouncementTextStyle(color: string, stroke = '#0f172a') {
    this.questionText.setFontSize(52);
    this.questionText.setColor(color);
    this.questionText.setStroke(stroke, 8);
    this.questionText.setPadding(28, 12, 42, 14);
  }

  private announcementColorForPlayer(playerIndex?: number) {
    return playerIndex === 0 || playerIndex === 1 ? PLAYER_TEXT_COLORS[playerIndex] : '#ffffff';
  }

  private setHeaderVisible(visible: boolean) {
    this.headerBar.setVisible(visible);
    this.title.setVisible(visible);
    this.subtitle.setVisible(visible);
    this.roundChip.setVisible(visible);
  }

  private clearMini() {
    this.miniGraphics.clear();
    this.miniLayer.removeAll(true);
    this.finishMiniGameQueued = false;
    this.activeMini = undefined;
  }

  private refillQuestionBag() {
    this.englishQuestionBag = [...ENGLISH_TRIVIA_QUESTIONS];
    this.worldCupQuestionBag = [...WORLD_CUP_QUESTIONS];
  }

  private nextQuestion() {
    if (this.customQuestions.length) {
      return this.customQuestions[this.customQuestionIndex++ % this.customQuestions.length];
    }
    if (this.englishQuestionBag.length === 0 && this.worldCupQuestionBag.length === 0) {
      this.refillQuestionBag();
    }

    const useWorldCup = this.questionPatternIndex % 3 === 2;
    this.questionPatternIndex += 1;

    if (useWorldCup) {
      if (this.worldCupQuestionBag.length === 0) {
        this.refillQuestionBag();
      }
      return this.worldCupQuestionBag.shift() ?? WORLD_CUP_QUESTIONS[0];
    }

    if (this.englishQuestionBag.length === 0) {
      this.refillQuestionBag();
    }
    return this.englishQuestionBag.shift() ?? ENGLISH_TRIVIA_QUESTIONS[0];
  }

  private shuffleQuestionAnswers(question: Question): Question {
    const keys = BUTTON_ORDER.filter(key => Boolean(question.answers[key]));
    const shuffledKeys = Phaser.Utils.Array.Shuffle([...keys]);
    const answers: Question['answers'] = {};
    let correct: ButtonKey = 'A';

    shuffledKeys.forEach((originalKey, index) => {
      const newKey = keys[index];
      answers[newKey] = question.answers[originalKey];
      if (originalKey === question.correct) {
        correct = newKey;
      }
    });

    return {
      prompt: question.prompt,
      answers,
      correct,
    };
  }

  private updatePanels(showAnswer = false) {
    this.players.forEach((player, index) => {
      this.playerNames[index].setText(player.name.toUpperCase());
      this.playerStats[index].setText(`Goals ${player.goals}`);
      this.updateLockBadgeStyle(index, 0xf8fafc, PLAYER_COLORS[index], '#0f172a');
      if (this.mode === 'quiz') {
        this.lockBadges[index].setText(player.answer ? 'LOCK' : '...');
      } else if (showAnswer && player.answer) {
        this.lockBadges[index].setText(player.answer);
      } else if (this.mode === 'minigame' && this.activeMini && !this.activeMini.started) {
        const ready = this.activeMini.readyPlayers[index];
        this.lockBadges[index].setText(ready ? 'Ready' : 'Press A');
        this.updateLockBadgeStyle(index, ready ? 0x22c55e : 0xef4444, ready ? 0x15803d : 0xb91c1c, '#ffffff');
      } else if (this.mode === 'name-entry') {
        this.lockBadges[index].setText(index === 0 ? 'P1' : 'P2');
      } else {
        this.lockBadges[index].setText(index === 0 ? 'P1' : 'P2');
      }
    });
  }

  private updateLockBadgeStyle(index: number, fill: number, stroke: number, textColor: string) {
    const badgeX = index === 0 ? PLAYER_PANEL_WIDTH - 118 : -118;
    this.drawLockBadgeBg(
      this.lockBadgeBgs[index],
      badgeX,
      -PLAYER_BADGE_HEIGHT / 2,
      PLAYER_BADGE_WIDTH,
      PLAYER_BADGE_HEIGHT,
      fill,
      stroke,
    );
    this.lockBadges[index].setColor(textColor);
  }

  private bestStreakMessage() {
    const best = [...this.players].sort((a, b) => b.streak - a.streak)[0];
    if (best.streak <= 0) return '';
    return `Best goals: ${best.name} ${best.goals}`;
  }

  private samePlayerName(a: string, b: string) {
    return a.trim().toLowerCase() === b.trim().toLowerCase();
  }

  private awardGoal(player: Player) {
    player.streak += 1;
    player.goals = player.streak;
    player.carryStreak = true;
  }

  private resetPlayerForNameEntry(index: number) {
    const player = this.players[index];
    player.name = `PLAYER ${index + 1}`;
    player.answer = undefined;
    player.quizCorrect = false;
    player.streak = 0;
    player.carryStreak = false;
    player.goals = 0;
    player.miniScore = 0;
    player.miniDone = false;
  }

  private showChampionIfNeeded() {
    const championIndexes = this.players
      .map((player, index) => (player.streak >= CHAMPION_STREAK ? index : -1))
      .filter((index) => index !== -1);
    if (championIndexes.length === 0) return false;
    const championIndex = championIndexes.length === 1 ? championIndexes[0] : undefined;
    this.showChampion(
      championIndexes.map((index) => this.players[index].name).join(' and '),
      this.announcementColorForPlayer(championIndex),
      championIndexes,
    );
    return true;
  }

  private showChampion(championName: string, championColor: string, championIndexes: number[]) {
    this.mode = 'champion';
    this.showControls();
    this.championResetIndexes = [...championIndexes];
    this.playScene('championship');
    this.clearCommentaryEvents();
    this.clearMini();
    this.setQuizUiVisible(false);
    this.setTimerVisible(false);
    this.messageText.setPosition(WIDTH / 2, 586);
    this.setQuestionTextStyle(false);
    this.setAnnouncementTextStyle(championColor);
    this.questionText.setPosition(WIDTH / 2, 250);
    this.title.setText('CONGRATULATIONS');
    this.subtitle.setText(`${CHAMPION_STREAK} goals reached`);
    this.questionText.setText('');
    this.roundChip.setText('Champion');
    this.messageText.setText('');
    this.footerText.setText('');
    this.cameras.main.flash(420, 255, 255, 255);
    this.cameras.main.shake(320, 0.006);
    this.updatePanels(true);
    this.scheduleCommentary(CHAMPION_NAME_REVEAL_MS, () => {
      if (this.mode === 'champion') this.playCommentary(COMMENTARY_KEYS.champion, 0.9);
    });
    this.after(CHAMPION_NAME_REVEAL_MS, () => {
      if (this.mode === 'champion') this.questionText.setText(championName);
    });
    this.after(CHAMPIONSHIP_VIDEO_MS, () => {
      if (this.mode === 'champion') this.resetAfterChampion();
    });
  }

  private resetAfterChampion() {
    this.championResetIndexes.forEach((index) => this.resetPlayerForNameEntry(index));
    this.championResetIndexes = [];
    this.players.forEach((player) => {
      player.answer = undefined;
      player.quizCorrect = false;
      player.miniScore = 0;
      player.miniDone = false;
    });
    this.showNameEntry();
  }

  private miniDuration(type: MiniGameType) {
    return type === 'stick' ? STICK_MINI_SECONDS : MINI_SECONDS;
  }

  private miniInstruction(type: MiniGameType) {
    return {
      timing: 'Press A when the ball crosses the green zone',
      mash: 'Press A as fast as possible',
      stick: 'Move to the target, then press A',
      sequence: 'Repeat the buttons in order',
      reaction: 'Wait for the signal, then press the button',
      corners: 'Pick a corner with A B X Y',
      switch: 'Press the button that appears',
      shake: 'Move the stick or alternate directions quickly',
    }[type];
  }

  private playCommentary(_key: string, _volume = 1) {
    return;
  }

  private unlockAudio() {
    const soundManager = this.sound as Phaser.Sound.WebAudioSoundManager | Phaser.Sound.NoAudioSoundManager | Phaser.Sound.HTML5AudioSoundManager;
    if ('context' in soundManager && soundManager.context?.state === 'suspended') {
      void soundManager.context.resume();
    }
    this.ensureSoundContinuity(this.time.now, true);
  }

  private startIdleCommentary(_delayMs: number) {
    return;
  }

  private playIdleCommentary() {
    return;
  }

  private scheduleCommentary(_delayMs: number, _callback: () => void) {
    return;
  }

  private clearCommentaryEvents() {
    return;
  }

  private animateStadium(time: number) {
    this.crowdDots.forEach((dot, index) => {
      dot.setAlpha(0.55 + Math.sin(time / 180 + index) * 0.25);
    });
    this.floaters.forEach((dot, index) => {
      dot.y -= 0.08 + (index % 3) * 0.02;
      dot.x += Math.sin(time / 700 + index) * 0.08;
      if (dot.y < 20) dot.y = 690;
    });
  }

  private playScene(scene: VideoScene, forceRestart = false) {
    this.cameras.main.setBackgroundColor('#07111f');
    this.currentScene = scene;
    if (!this.mediaLayer || !this.mediaEnabled) {
      this.mediaLayer?.setVisible(false);
      return;
    }

    const videoKey = SCENE_VIDEO[scene];
    const loop = VIDEO_LOOP[videoKey];
    const separateAudioKey = VIDEO_AUDIO[videoKey];
    this.currentVideoMuted = Boolean(separateAudioKey);
    this.setVideoAudioActive(separateAudioKey, forceRestart);
    this.playVideoKey(videoKey, loop, forceRestart, this.currentVideoMuted);
  }

  private playVideoKey(videoKey: string, loop: boolean, forceRestart = false, muteVideo = false) {
    if (!this.mediaLayer) return;
    this.mediaLayer
      .setVisible(true)
      .setMute(muteVideo)
      .setVolume(1)
      .setDisplaySize(WIDTH, HEIGHT);
    if (this.currentVideoKey !== videoKey || !loop || forceRestart) {
      if (this.currentVideoKey) this.startVideoTransition();
      this.currentVideoKey = videoKey;
      this.mediaLayer.changeSource(videoKey, true, loop);
      this.after(80, () => {
        this.mediaLayer
          ?.setMute(muteVideo)
          .setVolume(1)
          .setDisplaySize(WIDTH, HEIGHT);
      });
    }
  }

  private setVideoAudioActive(activeAudioKey?: string, forceRestart = false) {
    this.videoAudio.forEach((sound, audioKey) => {
      if (audioKey !== activeAudioKey && sound.isPlaying) sound.stop();
    });

    if (!activeAudioKey) return;
    const sound = this.videoAudio.get(activeAudioKey);
    if (!sound) return;
    if (forceRestart && sound.isPlaying) sound.stop();
    if (!sound.isPlaying) {
      sound.play({ loop: activeAudioKey === STADIUM_AUDIO_KEY, volume: 1 });
    }
  }

  private ensureSoundContinuity(time: number, force = false) {
    if (!force && time - this.lastSoundHealthCheckAt < 900) return;
    this.lastSoundHealthCheckAt = time;

    const soundManager = this.sound as Phaser.Sound.WebAudioSoundManager | Phaser.Sound.NoAudioSoundManager | Phaser.Sound.HTML5AudioSoundManager;
    if ('context' in soundManager && soundManager.context?.state === 'suspended') {
      void soundManager.context.resume();
    }

    const currentAudioKey = this.currentVideoKey ? VIDEO_AUDIO[this.currentVideoKey] : undefined;
    if (currentAudioKey) {
      this.videoAudio.forEach((sound, audioKey) => {
        if (audioKey !== currentAudioKey && sound.isPlaying) sound.stop();
      });
      const currentSound = this.videoAudio.get(currentAudioKey);
      if (currentSound && !currentSound.isPlaying) {
        currentSound.play({ loop: currentAudioKey === STADIUM_AUDIO_KEY, volume: 1 });
      }
    }

    if (!this.mediaLayer || !this.mediaEnabled || !this.currentVideoKey) return;
    this.mediaLayer.setMute(this.currentVideoMuted).setVolume(1);
    const video = (this.mediaLayer as unknown as { video?: HTMLVideoElement }).video;
    if (video) {
      video.muted = this.currentVideoMuted;
      video.volume = 1;
      if (video.paused && (VIDEO_LOOP[this.currentVideoKey] || this.currentScene === 'quiz' || this.currentScene === 'penalty')) {
        void video.play().catch(() => undefined);
      }
    }
  }

  private startVideoTransition() {
    if (!this.videoBlurFx) return;
    this.videoTransitionTween?.stop();
    this.videoBlurFx.x = VIDEO_TRANSITION_BLUR;
    this.videoBlurFx.y = VIDEO_TRANSITION_BLUR;
    this.videoBlurFx.strength = VIDEO_TRANSITION_BLUR;
    this.videoTransitionTween = this.tweens.add({
      targets: this.videoBlurFx,
      x: 0,
      y: 0,
      strength: 0,
      duration: VIDEO_TRANSITION_MS,
      ease: 'Sine.easeOut',
    });
  }
}

function loadQuiz(): Question[] {
  try {
    const pack = validatePack(read('pack:world_cup', null), 'quiz');
    if (pack.items.some((item: { options: string[] }) => item.options.length > 4)) {
      document.querySelector('#content-notice')!.textContent = 'World Cup uses 2–4 options per question. The original questions will be used.';
      return [];
    }
    return pack.items.map((item: { question: string; options: string[]; answer: string }) => ({
      prompt: item.question,
      answers: Object.fromEntries(item.options.map((option, index) => [BUTTON_ORDER[index], option])),
      correct: BUTTON_ORDER[item.options.indexOf(item.answer)],
    }));
  } catch {
    return [];
  }
}

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  parent: 'game',
  width: WIDTH,
  height: HEIGHT,
  backgroundColor: '#102a3a',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  input: {
    gamepad: true,
  },
  scene: EnglishWorldCupScene,
};

const startGame = () => {
  new Phaser.Game(config);
};

if ('fonts' in document) {
  Promise.allSettled([
    document.fonts.load(`24px ${GAME_FONT}`),
    document.fonts.load('italic 42px "Rush Driver"'),
  ]).then(startGame);
} else {
  startGame();
}
