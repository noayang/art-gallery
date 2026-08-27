// ui.js —— 开场引导、交互提示条、作品详情弹窗。

import { loadImage } from './assets.js';

export class UI {
  constructor() {
    this.intro = document.getElementById('intro');
    this.introTitle = document.getElementById('intro-title');
    this.introSub = document.getElementById('intro-sub');
    this.startBtn = document.getElementById('start-btn');

    this.hintBar = document.getElementById('hint-bar');
    this.modal = document.getElementById('modal');
    this.modalBody = document.getElementById('modal-body');
    this.modalClose = document.getElementById('modal-close');

    this.modalClose.addEventListener('click', () => this.close());
  }

  // —— 开场 ——
  setupIntro(title, subtitle) {
    if (title) this.introTitle.textContent = title;
    if (subtitle) this.introSub.textContent = subtitle;
  }
  onStart(cb) {
    this.startBtn.addEventListener('click', cb);
  }
  hideIntro() {
    this.intro.classList.add('hidden');
  }

  // —— 提示条 ——
  showHint(text = '按 E 查看作品') {
    this.hintBar.innerHTML = text;
    this.hintBar.classList.remove('hidden');
  }
  hideHint() {
    this.hintBar.classList.add('hidden');
  }

  // —— 弹窗 ——
  async open(artwork) {
    const kindLabel = artwork.type === 'novel' ? '小说 · 文学' : '画作 · 绘画';

    // 清空并重建内容（用节点 + textContent，避免注入、天然支持换行）
    this.modalBody.innerHTML = '';

    const kind = el('div', 'modal-kind', kindLabel);
    const title = el('div', 'modal-title', artwork.title);
    const author = el('div', 'modal-author', '作者：' + artwork.author);
    this.modalBody.append(kind, title, author);

    if (artwork.type === 'painting' && artwork.image) {
      // 预加载，缺失时回退到彩色占位图
      const img = await loadImage(artwork.image, 640, 480);
      img.className = 'modal-art';
      img.alt = artwork.title;
      this.modalBody.append(img);
    } else if (artwork.type === 'novel') {
      const text = await this._resolveText(artwork);
      const txt = el('div', 'modal-text', text);
      this.modalBody.append(txt);
    }

    if (artwork.message) {
      const msg = el('div', 'modal-message');
      const label = el('span', 'msg-label', '作者的话');
      msg.append(label, document.createTextNode(artwork.message));
      this.modalBody.append(msg);
    }

    this.modal.classList.remove('hidden');
  }

  close() {
    this.modal.classList.add('hidden');
  }
  isOpen() {
    return !this.modal.classList.contains('hidden');
  }

  async _resolveText(artwork) {
    if (artwork.text) return artwork.text;
    if (artwork.textFile) {
      try {
        const res = await fetch(artwork.textFile);
        if (res.ok) return await res.text();
      } catch (e) {
        /* fall through */
      }
      return '（正文文件加载失败：' + artwork.textFile + '）';
    }
    return '（暂无正文）';
  }
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}
