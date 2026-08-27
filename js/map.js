// map.js —— 地图数据、碰撞检测、地面与墙壁的渲染。

import { TILE, MAP, TILE_TYPES, SPAWN } from './config.js';

// 内部墙体：每个是 {x, y, w, h}（格子坐标），用于勾出房间和隔断
const INTERIOR_WALLS = [
  // 上排两个隔间（画作展厅）
  { x: 0,  y: 8, w: 13, h: 1 },
  { x: 0,  y: 8, w: 1,  h: 8 },   // 左侧竖墙
  { x: 26, y: 8, w: 14, h: 1 },
  { x: 39, y: 8, w: 1,  h: 8 },   // 右侧竖墙
  // 中排隔间（小说阅读区）
  { x: 16, y: 14, w: 8, h: 1 },
  // 下排隔间
  { x: 6,  y: 20, w: 8, h: 1 },
  { x: 26, y: 20, w: 8, h: 1 },
];

// 生成地图网格：默认全是地板，四周一圈墙，再叠加内部墙体
function buildGrid() {
  const grid = [];
  for (let y = 0; y < MAP.h; y++) {
    const row = [];
    for (let x = 0; x < MAP.w; x++) {
      const border = x === 0 || y === 0 || x === MAP.w - 1 || y === MAP.h - 1;
      row.push(border ? 1 : 0);
    }
    grid.push(row);
  }
  for (const wall of INTERIOR_WALLS) {
    for (let y = wall.y; y < wall.y + wall.h; y++) {
      for (let x = wall.x; x < wall.x + wall.w; x++) {
        if (x >= 0 && y >= 0 && x < MAP.w && y < MAP.h) grid[y][x] = 1;
      }
    }
  }
  return grid;
}

export class Map {
  constructor(tileImages) {
    this.grid = buildGrid();
    this.tileImages = tileImages; // { 0: Image, 1: Image }
  }

  // 指定格子是否不可通行
  isSolid(x, y) {
    if (x < 0 || y < 0 || x >= MAP.w || y >= MAP.h) return true; // 边界外视为墙
    return TILE_TYPES[this.grid[y][x]].solid;
  }

  // 渲染地板与墙壁
  draw(ctx, cam) {
    const x0 = Math.max(0, Math.floor(cam.x / TILE));
    const y0 = Math.max(0, Math.floor(cam.y / TILE));
    const x1 = Math.min(MAP.w, Math.ceil((cam.x + cam.w) / TILE));
    const y1 = Math.min(MAP.h, Math.ceil((cam.y + cam.h) / TILE));

    for (let y = y0; y < y1; y++) {
      for (let x = x0; x < x1; x++) {
        const tile = this.grid[y][x];
        const img = this.tileImages[tile];
        ctx.drawImage(img, x * TILE - cam.x, y * TILE - cam.y, TILE, TILE);
      }
    }
  }
}
