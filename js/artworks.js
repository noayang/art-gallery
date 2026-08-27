// artworks.js —— 代表作品的“像素块”：碰撞、渲染、交互检测。
// 每个作品在地图上是一个实心块，走近后按交互键即可弹出详情。

import { TILE, DEFAULT_SPRITES } from './config.js';

export class Artwork {
  constructor(data, spriteImage) {
    this.id = data.id;
    this.type = data.type;               // 'painting' | 'novel'
    this.title = data.title || '未命名';
    this.author = data.author || '佚名';
    this.message = data.message || '';
    this.image = data.image || null;     // 画作：大图路径
    this.text = data.text || null;       // 小说：正文（内联）
    this.textFile = data.textFile || null; // 小说：正文文件路径（可选）

    // 格子坐标与尺寸
    this.x = data.x ?? 0;
    this.y = data.y ?? 0;
    this.w = data.w ?? 1;
    this.h = data.h ?? 1;

    this.sprite = spriteImage;           // 地图上的像素块图片
  }

  // 世界坐标矩形
  rect() {
    return { x: this.x * TILE, y: this.y * TILE, w: this.w * TILE, h: this.h * TILE };
  }

  // 作为实体是否与某矩形相交（用于碰撞）
  isSolidRect(rect) {
    const r = this.rect();
    return (
      rect.x < r.x + r.w &&
      rect.x + rect.w > r.x &&
      rect.y < r.y + r.h &&
      rect.y + rect.h > r.y
    );
  }

  // 是否可与玩家交互（把块向外扩一圈）
  isNear(playerHitbox, margin = TILE * 0.9) {
    const r = this.rect();
    return (
      playerHitbox.x < r.x + r.w + margin &&
      playerHitbox.x + playerHitbox.w > r.x - margin &&
      playerHitbox.y < r.y + r.h + margin &&
      playerHitbox.y + playerHitbox.h > r.y - margin
    );
  }

  draw(ctx, cam) {
    const r = this.rect();
    ctx.drawImage(this.sprite, r.x - cam.x, r.y - cam.y, r.w, r.h);
  }
}

// 由 artworks.json 数组 + 预加载的精灵图，构建 Artwork 实例列表
export async function buildArtworks(list, getSprite) {
  const items = [];
  for (const data of list) {
    const sprite = await getSprite(data);
    items.push(new Artwork(data, sprite));
  }
  return items;
}
