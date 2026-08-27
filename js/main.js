// main.js —— 入口：加载资源、初始化、游戏循环。

import { TILE, MAP, PLAYER_DRAW, KEYS, DEFAULT_SPRITES, PLAYER_FRAMES } from './config.js';
import { loadImage, loadImageMap, loadImageList } from './assets.js';
import { Map } from './map.js';
import { Player } from './player.js';
import { buildArtworks } from './artworks.js';
import { UI } from './ui.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');

// —— 输入状态 ——
const input = { up: false, down: false, left: false, right: false };
const keyMap = {};
for (const [action, keys] of Object.entries(KEYS)) {
  for (const k of keys) keyMap[k] = action;
}

function setKey(e, on) {
  const action = keyMap[e.key];
  if (!action) return;
  if (action === 'interact') {
    if (on && !e.repeat) tryInteract();
  } else {
    input[action] = on;
  }
}
window.addEventListener('keydown', (e) => {
  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) e.preventDefault();
  setKey(e, true);
});
window.addEventListener('keyup', (e) => setKey(e, false));

// —— 相机 ——
const cam = { x: 0, y: 0, w: 0, h: 0 };
function resize() {
  const dpr = window.devicePixelRatio || 1;
  cam.w = window.innerWidth;
  cam.h = window.innerHeight;
  canvas.width = Math.floor(cam.w * dpr);
  canvas.height = Math.floor(cam.h * dpr);
  canvas.style.width = cam.w + 'px';
  canvas.style.height = cam.h + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
window.addEventListener('resize', resize);

function updateCamera(player) {
  let tx = player.x - cam.w / 2;
  let ty = player.y - cam.h / 2;
  const maxX = MAP.w * TILE - cam.w;
  const maxY = MAP.h * TILE - cam.h;
  tx = Math.max(0, Math.min(tx, maxX > 0 ? maxX : 0));
  ty = Math.max(0, Math.min(ty, maxY > 0 ? maxY : 0));
  cam.x = tx;
  cam.y = ty;
}

// —— 交互 ——
let artworks = [];
let player = null;
let ui = null;

function nearestInteractable() {
  const hb = player.hitbox();
  let best = null;
  let bestDist = Infinity;
  for (const a of artworks) {
    if (a.isNear(hb)) {
      const r = a.rect();
      const cx = r.x + r.w / 2;
      const cy = r.y + r.h / 2;
      const d = (player.x - cx) ** 2 + (player.y - cy) ** 2;
      if (d < bestDist) {
        bestDist = d;
        best = a;
      }
    }
  }
  return best;
}

async function tryInteract() {
  if (!player) return;
  if (ui.isOpen()) {
    ui.close();
    return;
  }
  const a = nearestInteractable();
  if (a) await ui.open(a);
}

// —— 渲染 ——
function render() {
  ctx.fillStyle = '#0e0e14';
  ctx.fillRect(0, 0, cam.w, cam.h);

  map.draw(ctx, cam);

  // 按 Y 排序玩家与作品块，让“身前后”遮挡正确
  const entities = [
    ...artworks.map((a) => ({ y: a.rect().y + a.rect().h, draw: () => a.draw(ctx, cam) })),
    { y: player.y, draw: () => player.draw(ctx, cam) },
  ];
  entities.sort((a, b) => a.y - b.y);
  for (const e of entities) e.draw();
}

// —— 主循环 ——
let last = 0;
function loop(ts) {
  const dt = Math.min((ts - last) / 1000, 0.05);
  last = ts;

  player.update(dt, input);
  updateCamera(player);

  // 交互提示
  if (!ui.isOpen()) {
    if (nearestInteractable()) ui.showHint();
    else ui.hideHint();
  } else {
    ui.hideHint();
  }

  render();
  requestAnimationFrame(loop);
}

// —— 启动 ——
async function start() {
  resize();

  // 读取作品内容配置
  let data;
  try {
    const res = await fetch('data/artworks.json');
    data = await res.json();
  } catch (e) {
    data = { title: '线上美术展', subtitle: '', artworks: [] };
    console.error('无法加载 data/artworks.json，使用空展厅', e);
  }

  // 加载素材
  const [tileImages, playerFrames] = await Promise.all([
    loadImageMap({ 0: 'assets/tiles/floor.png', 1: 'assets/tiles/wall.png' }, TILE, TILE),
    (async () => {
      const out = {};
      for (const dir of ['down', 'up', 'left', 'right']) {
        const set = PLAYER_FRAMES[dir];
        out[dir] = {
          idle: await loadImage(set.idle, PLAYER_DRAW.w, PLAYER_DRAW.h),
          walk: await loadImageList(set.walk, PLAYER_DRAW.w, PLAYER_DRAW.h),
        };
      }
      return out;
    })(),
  ]);

  map = new Map(tileImages);

  // 构建作品实体（含地图上的像素块精灵）
  const raw = data.artworks || [];
  const artworkList = await buildArtworks(raw, (d) => {
    const path = d.sprite || DEFAULT_SPRITES[d.type] || DEFAULT_SPRITES.painting;
    return loadImage(path, (d.w ?? 1) * TILE, (d.h ?? 1) * TILE);
  });
  artworks = artworkList;

  player = new Player(playerFrames, map, artworkList);

  ui = new UI();
  ui.setupIntro(data.title, data.subtitle);
  ui.onStart(() => {
    ui.hideIntro();
    last = performance.now();
    requestAnimationFrame(loop);
  });
}

let map = null;

start();
