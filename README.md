# 像素线上美术展

一个星露谷风格的像素互动小游戏：网页玩家控制一个像素小人，在美术馆里自由闲逛，走到代表作品的像素块前按 `E`，就会弹出窗口展示作品（画作图片 / 小说正文）+ 作者署名 + 作者想说的话。

纯前端实现，无任何后端与构建依赖，可直接部署到 **GitHub Pages** 免费额度。

---

## 一、快速上手

### 本地预览

因为用到了 ES 模块和 `fetch`，需要用一个本地静态服务器打开（不能直接双击 `index.html`）。任选其一：

```bash
# 在项目根目录下
python -m http.server 8000
# 或
npx serve .
```

然后浏览器打开 `http://localhost:8000`。

> 也可以直接部署到 GitHub Pages 看效果（见下文），无需本地环境。

### 部署到 GitHub Pages

1. 把整个 `art-gallery/` 文件夹的内容推到一个 GitHub 仓库的根目录（或 `docs/` 分支）。
2. 仓库 **Settings → Pages**，Source 选择该分支的根目录（root），保存。
3. 几分钟后访问 `https://<你的用户名>.github.io/<仓库名>/` 即可。

> 注意：GitHub Pages 免费额度有软限制（约 1GB、每月 100GB 流量），本项目只有图片体积，完全够用。画作大图建议压缩到单张 500KB 以内。

---

## 二、操作说明

| 按键 | 作用 |
| --- | --- |
| `W` / `A` / `S` / `D` 或方向键 | 移动小人 |
| `E` / 空格 / 回车 | 查看面前的作品 / 关闭弹窗 |
| `Esc` 或点 ✕ | 关闭弹窗 |

---

## 三、目录结构

```
art-gallery/
├── index.html              入口页面
├── css/style.css           样式（弹窗、开场、提示条）
├── js/
│   ├── config.js           常量、地图尺寸、素材路径约定、角色帧
│   ├── assets.js           图片加载 + 缺失时彩色占位图回退
│   ├── map.js              地图布局、碰撞、渲染
│   ├── player.js           玩家移动/动画/碰撞
│   ├── artworks.js         作品像素块：碰撞、渲染、交互检测
│   ├── ui.js               弹窗 / 开场 / 提示条
│   └── main.js             启动、游戏循环、相机、输入
├── data/
│   └── artworks.json       ★ 你要维护的作品内容（见下）
└── assets/                 你要放入素材的地方（见下）
    ├── tiles/              地板、墙
    ├── player/             小人四方向 待机 + 走路帧
    ├── objects/            代表作品的像素块（画框块 / 书本块）
    └── artworks/           实际画作大图（弹窗里展示）
```

---

## 四、放入你的美术素材

所有素材都是**单独图片**，按下面的路径/文件名放置即可。**缺失的图片会自动用彩色占位块顶替，游戏照常运行**，方便你先跑通再逐张替换。

| 位置 | 文件名 | 说明 |
| --- | --- | --- |
| `assets/tiles/` | `floor.png` | 地板（32×32，可平铺） |
| `assets/tiles/` | `wall.png` | 墙壁（32×32） |
| `assets/player/` | `idle_down/up/left/right.png` | 小人四方向待机（约 29×48） |
| `assets/player/` | `walk_down_0.png`、`walk_down_1.png` … | 小人走路帧，每个方向 1~N 张 |
| `assets/objects/` | `painting.png` | 画作在地图上的“画框块” |
| `assets/objects/` | `novel.png` | 小说在地图上的“书本块” |
| `assets/artworks/` | 任意 `.png` | 画作大图（弹窗里展示） |

> **尺寸约定**：一格 = 32px。小人建议宽约 0.9 格、高约 1.5 格（29×48 左右）；作品像素块按其占的格子数决定（默认 1×1 或 2×2 格）。这些都是 `config.js` 里的 `TILE`、`PLAYER_DRAW`，可自行调整。

---

## 五、添加 / 修改作品（只改 `data/artworks.json`）

每个作品是一个对象，画作和小说字段略有不同：

**画作（painting）**

```json
{
  "id": "my-painting",
  "type": "painting",
  "title": "作品标题",
  "author": "作者署名",
  "message": "作者想说的话……",
  "image": "assets/artworks/我的画.png",
  "x": 4, "y": 3, "w": 2, "h": 2
}
```

**小说（novel）** —— 正文两种写法二选一：

```json
{
  "id": "my-novel",
  "type": "novel",
  "title": "《小说标题》",
  "author": "作者署名",
  "message": "作者想说的话……",
  "text": "小说正文……\n换行用 \\n 表示。",
  "x": 16, "y": 10, "w": 1, "h": 1
}
```

或把长文放在单独文件里，改用 `textFile`（如 `"textFile": "assets/novels/雨夜来客.txt"`），`text` 和 `textFile` 同时存在时优先用 `text`。

### 字段说明

| 字段 | 必填 | 说明 |
| --- | --- | --- |
| `id` | 是 | 唯一标识，随意起 |
| `type` | 是 | `"painting"` 或 `"novel"` |
| `title` | 是 | 作品标题 |
| `author` | 否 | 作者署名（默认“佚名”） |
| `message` | 否 | 作者想说的话 |
| `image` | 画作必填 | 大图路径 |
| `text` / `textFile` | 小说选一 | 正文 |
| `x`, `y` | 是 | 在地图上的格子坐标（左上角） |
| `w`, `h` | 否 | 占几格（默认 1×1），画作建议 2×2 |
| `sprite` | 否 | 覆盖该作品在地图上的像素块图片，默认用 `painting.png` / `novel.png` |

> **摆放注意**：`x/y` 要落在可走的地板区域（不要压住墙）。地图尺寸 40×24 格，四周和若干内部隔断是墙。作品块本身是实心的，小人不能穿过，正好模拟“站在画前/书前”。

---

## 六、自定义地图布局

地图在 `js/map.js` 里定义。改 `INTERIOR_WALLS` 数组（每项 `{x, y, w, h}`，单位格）即可增删隔断房间；四周墙体自动生成。想加新地块类型，改 `config.js` 的 `TILE_TYPES` 即可。

---

## 七、常见问题

- **打开是黑屏 / 报错**：多半是直接双击 `index.html` 打开导致 ES 模块和 `fetch` 失效，请用本地服务器或部署到 GitHub Pages。
- **图片显示成彩色方块**：说明对应路径的素材还没放，按上表补齐即可。
- **小人能穿墙**：检查作品 `x/y/w/h` 是否与墙体重叠，或 `config.js` 里 `PLAYER.hitbox` 是否调得过大。
