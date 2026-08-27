// assets.js —— 图片加载 + 占位图回退。
// 如果某张图片路径不存在，就用彩色占位块顶替，保证游戏总能运行。

import { TILE } from './config.js';

// 简单字符串哈希 -> 稳定的颜色
function hash(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h * 31 + str.charCodeAt(i)) >>> 0;
  }
  return h;
}

// 生成一张占位图（彩色方块 + 描边 + 文件名）
function placeholder(path, w = TILE, h = TILE) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');
  const hue = hash(path) % 360;
  ctx.fillStyle = `hsl(${hue}, 55%, 45%)`;
  ctx.fillRect(0, 0, w, h);
  ctx.strokeStyle = 'rgba(0,0,0,0.6)';
  ctx.lineWidth = Math.max(1, Math.floor(w / 16));
  ctx.strokeRect(ctx.lineWidth / 2, ctx.lineWidth / 2, w - ctx.lineWidth, h - ctx.lineWidth);

  // 画文件名后几位，方便识别缺失的素材
  const label = path.split('/').pop().replace(/\.[^.]+$/, '');
  ctx.fillStyle = 'rgba(255,255,255,0.85)';
  ctx.font = `${Math.max(6, Math.floor(w / 8))}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label.slice(-6), w / 2, h / 2);

  const img = new Image();
  img.src = c.toDataURL();
  img._placeholder = true;
  return img;
}

// 加载单张图片；失败时返回占位图
export function loadImage(path, w = TILE, h = TILE) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(placeholder(path, w, h));
    img.src = path;
  });
}

// 并发加载一批，返回 { key: Image } 的对象
export async function loadImageMap(map, w, h) {
  const keys = Object.keys(map);
  const imgs = await Promise.all(keys.map((k) => loadImage(map[k], w, h)));
  const out = {};
  keys.forEach((k, i) => (out[k] = imgs[i]));
  return out;
}

// 加载一个数组（用于走路帧），返回 Image[]
export async function loadImageList(list, w, h) {
  return Promise.all(list.map((p) => loadImage(p, w, h)));
}
