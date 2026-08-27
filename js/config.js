// config.js —— 全局配置与素材路径约定。
// 把你自己准备好的素材按这里声明的路径放进去即可；
// 缺失的图片会自动用彩色占位块顶替，游戏照常运行。

// 每个格子的像素尺寸（星露谷类通常是 16 或 32，这里默认 32）
export const TILE = 32;

// 地图尺寸（格子数）
export const MAP = { w: 40, h: 24 };

// 玩家参数
export const PLAYER = {
  speed: 170,      // 移动速度（像素/秒）
  hitbox: {        // 碰撞盒占单个格子的比例（更窄更矮，手感更自然）
    w: 0.55,
    h: 0.4,
    yOffset: 0.6,  // 碰撞盒底边对齐脚部
  },
  animSpeed: 0.16, // 走路动画每帧间隔（秒）
};

// 地图格子类型：数字 -> 属性
// solid = 不可通行
export const TILE_TYPES = {
  0: { name: 'floor', solid: false, img: 'assets/tiles/floor.png' },
  1: { name: 'wall',  solid: true,  img: 'assets/tiles/wall.png' },
};

// 代表作品的“像素块”默认精灵（画作 -> 画框块，小说 -> 书本块）
// 每个作品也可在 artworks.json 里用 sprite 字段覆盖成专属图案
export const DEFAULT_SPRITES = {
  painting: 'assets/objects/painting.png',
  novel:    'assets/objects/novel.png',
};

// 小人四个方向的待机 + 走路帧（全部单独图片）
// 走路帧可以是 1~N 张，代码会循环播放；留空则退化为单帧
export const PLAYER_FRAMES = {
  down:  { idle: 'assets/player/idle_down.png',  walk: ['assets/player/walk_down_0.png',  'assets/player/walk_down_1.png'] },
  up:    { idle: 'assets/player/idle_up.png',    walk: ['assets/player/walk_up_0.png',    'assets/player/walk_up_1.png'] },
  left:  { idle: 'assets/player/idle_left.png',  walk: ['assets/player/walk_left_0.png',  'assets/player/walk_left_1.png'] },
  right: { idle: 'assets/player/idle_right.png', walk: ['assets/player/walk_right_0.png', 'assets/player/walk_right_1.png'] },
};

// 玩家渲染尺寸（像素）。默认高度占 1.5 格，适合小人比例。
export const PLAYER_DRAW = { w: TILE * 0.9, h: TILE * 1.5 };

// 角色初始出生点（格子坐标）
export const SPAWN = { x: 20, y: 21 };

// 交互键
export const KEYS = {
  up:    ['w', 'W', 'ArrowUp'],
  down:  ['s', 'S', 'ArrowDown'],
  left:  ['a', 'A', 'ArrowLeft'],
  right: ['d', 'D', 'ArrowRight'],
  interact: ['e', 'E', ' ', 'Enter'],
};
