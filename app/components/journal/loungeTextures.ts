// Canvas-drawn covers for the lounge: pearl file folders for the app and
// tech entries, glossy magazines for the rest. Type is set in the site's own
// fonts; images are the posts' own.

import * as THREE from 'three';

export type Fonts = { serif: string; mono: string };

export type CoverArt = {
  num: string;
  title: string;
  dateLabel: string;
  read: string;
  image?: string;   // magazine cover photo
  icon?: string;    // folder's app icon
};

export async function loadFonts(): Promise<Fonts> {
  const css = getComputedStyle(document.documentElement);
  const serif = css.getPropertyValue('--font-fraunces').trim() || 'Georgia, serif';
  const mono = css.getPropertyValue('--font-jetbrains').trim() || 'Menlo, monospace';
  await Promise.all([
    document.fonts.load(`300 64px ${serif}`),
    document.fonts.load(`italic 400 64px ${serif}`),
    document.fonts.load(`500 20px ${mono}`),
  ]).catch(() => {});
  return { serif, mono };
}

export const COVER = { w: 512, h: 680 };

function canvas() {
  const c = document.createElement('canvas');
  c.width = COVER.w; c.height = COVER.h;
  return { c, g: c.getContext('2d')! };
}

function texture(c: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function load(src: string) {
  return new Promise<HTMLImageElement | null>(resolve => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function wrap(g: CanvasRenderingContext2D, text: string, maxW: number) {
  const lines: string[] = [];
  let line = '';
  for (const word of text.split(' ')) {
    const next = line ? `${line} ${word}` : word;
    if (g.measureText(next).width > maxW && line) { lines.push(line); line = word; } else line = next;
  }
  if (line) lines.push(line);
  return lines;
}

// A pearl folder: gold edge and tab, the app's icon, the title set large.
export function folderTexture(a: CoverArt, f: Fonts) {
  const { c, g } = canvas();
  const { w, h } = COVER;
  const draw = (icon: HTMLImageElement | null) => {
    const grad = g.createLinearGradient(0, 0, w, h);
    grad.addColorStop(0, '#f4f1ec');
    grad.addColorStop(1, '#dcd6cc');
    g.fillStyle = grad;
    g.fillRect(0, 0, w, h);
    // Fine fibre so the pearl reads as card stock, not plastic.
    for (let i = 0; i < 1400; i++) {
      g.fillStyle = `rgba(120,100,70,${Math.random() * 0.035})`;
      g.fillRect(Math.random() * w, Math.random() * h, 1 + Math.random() * 6, 1);
    }
    g.strokeStyle = '#c3a064';
    g.lineWidth = 6;
    g.strokeRect(14, 14, w - 28, h - 28);
    g.lineWidth = 1.5;
    g.strokeRect(26, 26, w - 52, h - 52);

    g.fillStyle = '#8a6a3c';
    g.font = `500 20px ${f.mono}`;
    g.fillText(`FILE No. ${a.num}`, 52, 76);
    g.textAlign = 'right';
    g.fillText(`${a.read.toUpperCase()}`, w - 52, 76);
    g.textAlign = 'left';

    if (icon) {
      g.save();
      g.beginPath();
      g.roundRect(52, 112, 112, 112, 26);
      g.clip();
      g.drawImage(icon, 52, 112, 112, 112);
      g.restore();
    }

    g.fillStyle = '#1e1a16';
    g.font = `300 50px ${f.serif}`;
    wrap(g, a.title, w - 104).slice(0, 4).forEach((l, i) => g.fillText(l, 50, 310 + i * 58));

    g.fillStyle = '#c3a064';
    g.fillRect(52, h - 120, 80, 3);
    g.fillStyle = '#8a6a3c';
    g.font = `500 18px ${f.mono}`;
    g.fillText(a.dateLabel.toUpperCase(), 52, h - 76);
  };
  draw(null);
  const t = texture(c);
  const ready = a.icon ? load(a.icon).then(img => { draw(img); t.needsUpdate = true; }) : Promise.resolve();
  return { tex: t, ready };
}

// A magazine: the post's image full-bleed, a masthead, the title as the
// cover line.
export function magazineTexture(a: CoverArt, f: Fonts) {
  const { c, g } = canvas();
  const { w, h } = COVER;
  const draw = (img: HTMLImageElement | null) => {
    if (img) {
      const s = Math.max(w / img.width, h / img.height);
      g.drawImage(img, (w - img.width * s) / 2, (h - img.height * s) / 2, img.width * s, img.height * s);
    } else {
      const grad = g.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, '#2a1840');
      grad.addColorStop(1, '#0c1a2a');
      g.fillStyle = grad;
      g.fillRect(0, 0, w, h);
    }
    // Shade top and bottom so the type sits on dark.
    const top = g.createLinearGradient(0, 0, 0, 200);
    top.addColorStop(0, 'rgba(8,8,14,0.75)');
    top.addColorStop(1, 'rgba(8,8,14,0)');
    g.fillStyle = top;
    g.fillRect(0, 0, w, 200);
    const bottom = g.createLinearGradient(0, h - 320, 0, h);
    bottom.addColorStop(0, 'rgba(8,8,14,0)');
    bottom.addColorStop(1, 'rgba(8,8,14,0.9)');
    g.fillStyle = bottom;
    g.fillRect(0, h - 320, w, 320);

    g.fillStyle = '#f4ece0';
    g.font = `italic 400 92px ${f.serif}`;
    g.fillText('Orbit', 32, 104);
    g.font = `500 16px ${f.mono}`;
    g.fillStyle = '#e8a87c';
    g.textAlign = 'right';
    g.fillText(`No. ${a.num} · ${a.dateLabel.toUpperCase()}`, w - 32, 50);
    g.textAlign = 'left';

    g.fillStyle = '#ffffff';
    g.font = `300 46px ${f.serif}`;
    const lines = wrap(g, a.title, w - 64).slice(0, 3);
    lines.forEach((l, i) => g.fillText(l, 32, h - 44 - (lines.length - 1 - i) * 52 - 36));
    g.fillStyle = '#e8a87c';
    g.font = `500 16px ${f.mono}`;
    g.fillText(`${a.read.toUpperCase()} READ`, 32, h - 34);
  };
  draw(null);
  const t = texture(c);
  const ready = a.image ? load(a.image).then(img => { draw(img); t.needsUpdate = true; }) : Promise.resolve();
  return { tex: t, ready };
}
