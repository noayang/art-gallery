// player.js —— 玩家的移动、碰撞、动画与渲染。

import { TILE, PLAYER, PLAYER_DRAW, SPAWN } from './config.js';

export class Player {
  constructor(frames, map, solidObjects) {
    this.frames = frames; // { down:{idle,walk[]}, up:..., ... }
    this.map = map;
    this.solidObjects = solidObjects; // 提供 isSolidRect(rect) 供碰撞检测

    // 用脚底中心作为世界坐标（像素）
    this.x = (SPAWN.x + 0.5) * TILE;
    this.y = (SPAWN.y + 1) * TILE;
    this.dir = 'down';
    this.moving = false;
    this.animT = 0;
    this.frameIdx = 0;
  }

  // 碰撞盒（返回世界坐标矩形）
  hitbox() {
    const w = PLAYER.hitbox.w * TILE;
    const h = PLAYER.hitbox.h * TILE;
    return {
      x: this.x - w / 2,
      y: this.y - h * PLAYER.hitbox.yOffset,
      w,
      h,
    };
  }

  // 检测矩形是否与不可通行格子 / 实体碰撞
  collides(rect) {
    // 与地图像素砖碰撞
    const x0 = Math.floor(rect.x / TILE);
    const x1 = Math.floor((rect.x + rect.w) / TILE);
    const y0 = Math.floor(rect.y / TILE);
    const y1 = Math.floor((rect.y + rect.h) / TILE);
    for (let y = y0; y <= y1; y++) {
      for (let x = x0; x <= x1; x++) {
        if (this.map.isSolid(x, y)) return true;
      }
    }
    // 与作品实体碰撞
    for (const obj of this.solidObjects) {
      if (obj.isSolidRect(rect)) return true;
    }
    return false;
  }

  // 尝试移动（先 X 后 Y，各自独立碰撞，避免斜向穿墙）
  move(dx, dy, dt) {
    const speed = PLAYER.speed * dt;

    if (dx !== 0) {
      this.x += Math.sign(dx) * speed;
      if (this.collides(this.hitbox())) this.x -= Math.sign(dx) * speed;
    }
    if (dy !== 0) {
      this.y += Math.sign(dy) * speed;
      if (this.collides(this.hitbox())) this.y -= Math.sign(dy) * speed;
    }
  }

  update(dt, input) {
    let dx = 0, dy = 0;
    if (input.left) dx -= 1;
    if (input.right) dx += 1;
    if (input.up) dy -= 1;
    if (input.down) dy += 1;

    this.moving = dx !== 0 || dy !== 0;

    if (this.moving) {
      // 优先取水平方向，其次垂直（对角也能走）
      if (dx !== 0) this.dir = dx < 0 ? 'left' : 'right';
      else if (dy !== 0) this.dir = dy < 0 ? 'up' : 'down';

      this.move(dx, dy, dt);

      // 推进走路动画帧
      this.animT += dt;
      const frames = this.frames[this.dir].walk;
      if (this.animT >= PLAYER.animSpeed) {
        this.animT = 0;
        this.frameIdx = (this.frameIdx + 1) % frames.length;
      }
    } else {
      this.frameIdx = 0;
      this.animT = 0;
    }
  }

  // 当前应显示的图片
  currentFrame() {
    const set = this.frames[this.dir];
    if (this.moving && set.walk.length) {
      return set.walk[this.frameIdx % set.walk.length];
    }
    return set.idle;
  }

  draw(ctx, cam) {
    const img = this.currentFrame();
    const w = PLAYER_DRAW.w;
    const h = PLAYER_DRAW.h;
    const sx = this.x - w / 2 - cam.x;
    const sy = this.y - h - cam.y;
    ctx.drawImage(img, sx, sy, w, h);
  }
}
