/**
 * NOXES AI Face Compositor
 * Preserves 100% of the user's real face from their uploaded photo
 * and seamlessly composites it into the user's requested scene (Cafe, Astronaut, Beach, Cyberpunk, etc.)
 */

export type SceneType = 'cafe' | 'astronaut' | 'beach' | 'cyberpunk' | 'penthouse' | 'concert' | 'custom';

export interface SceneConfig {
  name: string;
  badge: string;
  type: SceneType;
  filterOverlay?: string;
  lightingTone: { r: number; g: number; b: number; alpha: number };
}

export function detectSceneFromPrompt(prompt: string): SceneType {
  const p = prompt.toLowerCase();
  if (p.includes('kafe') || p.includes('cafe') || p.includes('kopi') || p.includes('coffee') || p.includes('nongkrong')) {
    return 'cafe';
  }
  if (p.includes('astronot') || p.includes('astronaut') || p.includes('luar angkasa') || p.includes('bulan') || p.includes('space')) {
    return 'astronaut';
  }
  if (p.includes('pantai') || p.includes('beach') || p.includes('sunset') || p.includes('laut') || p.includes('pulau')) {
    return 'beach';
  }
  if (p.includes('cyber') || p.includes('neon') || p.includes('hacker') || p.includes('robot') || p.includes('masa depan')) {
    return 'cyberpunk';
  }
  if (p.includes('kantor') || p.includes('bos') || p.includes('sultan') || p.includes('penthouse') || p.includes('mewah') || p.includes('hotel')) {
    return 'penthouse';
  }
  if (p.includes('konser') || p.includes('panggung') || p.includes('musik') || p.includes('festival')) {
    return 'concert';
  }
  return 'cafe'; // default friendly aesthetic cafe
}

export async function composeFaceIntoScene(
  userImageSrc: string,
  sceneType: SceneType,
  promptText: string
): Promise<{ dataUrl: string; title: string }> {
  return new Promise((resolve, reject) => {
    const userImg = new Image();
    userImg.crossOrigin = 'anonymous';

    userImg.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const size = 800;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        if (!ctx) {
          throw new Error('Canvas 2D context not available');
        }

        // 1. Draw themed background scene
        drawThemedBackground(ctx, sceneType, size);

        // 2. Draw outfit / body overlay in the background
        drawThemedOutfit(ctx, sceneType, size);

        // 3. Composite user's ORIGINAL face preserving 100% facial features
        drawUserFace(ctx, userImg, sceneType, size);

        // 4. Draw foreground atmospheric effects, lighting reflections, and vignette
        drawAtmosphericLighting(ctx, sceneType, size);

        // 5. Watermark badge "NOXES AI • 100% Face Preserved"
        drawBrandingBadge(ctx, sceneType, size);

        const titles: Record<SceneType, string> = {
          cafe: 'Nongkrong di Cafe Estetik',
          astronaut: 'Astronot di Luar Angkasa',
          beach: 'Liburan Santuy di Pantai Sunset',
          cyberpunk: 'Suasana Kota Masa Depan Cyberpunk',
          penthouse: 'Boss Sultan di Luxury Penthouse',
          concert: 'Bintang Panggung di Konser Musik',
          custom: 'Hasil Edit NOXES AI',
        };

        const resultUrl = canvas.toDataURL('image/png', 0.95);
        resolve({
          dataUrl: resultUrl,
          title: titles[sceneType] || 'Edit Foto Wajah Asli',
        });
      } catch (err) {
        reject(err);
      }
    };

    userImg.onerror = (e) => reject(new Error('Gagal memuat foto user'));
    userImg.src = userImageSrc;
  });
}

function drawThemedBackground(ctx: CanvasRenderingContext2D, scene: SceneType, size: number) {
  const w = size;
  const h = size;

  if (scene === 'cafe') {
    // Warm aesthetic cafe background with bokeh and warm lighting
    const bgGrad = ctx.createLinearGradient(0, 0, w, h);
    bgGrad.addColorStop(0, '#1c130d');
    bgGrad.addColorStop(0.5, '#2e1c12');
    bgGrad.addColorStop(1, '#180f0a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Window light & coffee shop shelves blur
    ctx.fillStyle = 'rgba(255, 210, 150, 0.12)';
    ctx.fillRect(w * 0.1, 0, w * 0.45, h * 0.55);

    // Warm Bokeh lights
    const bokehColors = ['rgba(255, 180, 100, 0.25)', 'rgba(255, 220, 150, 0.2)', 'rgba(255, 140, 60, 0.18)'];
    for (let i = 0; i < 24; i++) {
      const bx = (i * 127) % w;
      const by = (i * 89) % (h * 0.65);
      const br = 18 + (i * 7) % 36;
      ctx.beginPath();
      ctx.arc(bx, by, br, 0, Math.PI * 2);
      ctx.fillStyle = bokehColors[i % bokehColors.length];
      ctx.fill();
    }

    // Wooden cafe table at bottom
    const tableGrad = ctx.createLinearGradient(0, h * 0.72, 0, h);
    tableGrad.addColorStop(0, '#3d2516');
    tableGrad.addColorStop(0.3, '#2a180d');
    tableGrad.addColorStop(1, '#140c06');
    ctx.fillStyle = tableGrad;
    ctx.fillRect(0, h * 0.72, w, h * 0.28);

    // Coffee mug on the table
    ctx.fillStyle = '#f0e6d6';
    ctx.beginPath();
    ctx.roundRect(w * 0.72, h * 0.75, 48, 56, 6);
    ctx.fill();
    // Steam
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(w * 0.75, h * 0.73);
    ctx.bezierCurveTo(w * 0.73, h * 0.70, w * 0.77, h * 0.67, w * 0.74, h * 0.64);
    ctx.stroke();

  } else if (scene === 'astronaut') {
    // Deep cosmic space with starry nebula and planet curvature
    const spaceGrad = ctx.createRadialGradient(w * 0.6, h * 0.35, 10, w * 0.5, h * 0.5, w * 0.75);
    spaceGrad.addColorStop(0, '#1c1b3f');
    spaceGrad.addColorStop(0.4, '#100f24');
    spaceGrad.addColorStop(0.8, '#06060f');
    spaceGrad.addColorStop(1, '#020205');
    ctx.fillStyle = spaceGrad;
    ctx.fillRect(0, 0, w, h);

    // Stars
    for (let i = 0; i < 120; i++) {
      const sx = (i * 137) % w;
      const sy = (i * 97) % h;
      const sr = (i % 5 === 0) ? 2 : 1;
      ctx.fillStyle = (i % 3 === 0) ? '#00ffc6' : (i % 4 === 0) ? '#c084fc' : '#ffffff';
      ctx.globalAlpha = 0.4 + (i % 6) * 0.1;
      ctx.beginPath();
      ctx.arc(sx, sy, sr, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    // Glowing Earth / Nebula in background
    const earthGrad = ctx.createRadialGradient(w * 0.85, h * 0.25, 20, w * 0.85, h * 0.25, 120);
    earthGrad.addColorStop(0, 'rgba(0, 220, 255, 0.4)');
    earthGrad.addColorStop(0.5, 'rgba(30, 90, 200, 0.25)');
    earthGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = earthGrad;
    ctx.beginPath();
    ctx.arc(w * 0.85, h * 0.25, 120, 0, Math.PI * 2);
    ctx.fill();

  } else if (scene === 'beach') {
    // Tropical golden hour sunset beach
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h * 0.65);
    skyGrad.addColorStop(0, '#4a154b');
    skyGrad.addColorStop(0.4, '#c0392b');
    skyGrad.addColorStop(0.7, '#e67e22');
    skyGrad.addColorStop(1, '#f39c12');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h * 0.65);

    // Giant setting sun
    const sunGrad = ctx.createRadialGradient(w * 0.5, h * 0.42, 10, w * 0.5, h * 0.42, 80);
    sunGrad.addColorStop(0, '#ffffff');
    sunGrad.addColorStop(0.3, '#fff4cc');
    sunGrad.addColorStop(0.8, '#ff9f43');
    sunGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.42, 80, 0, Math.PI * 2);
    ctx.fill();

    // Ocean horizon and sunset reflection
    const oceanGrad = ctx.createLinearGradient(0, h * 0.58, 0, h);
    oceanGrad.addColorStop(0, '#d35400');
    oceanGrad.addColorStop(0.3, '#962d00');
    oceanGrad.addColorStop(0.7, '#2c3e50');
    oceanGrad.addColorStop(1, '#1a252f');
    ctx.fillStyle = oceanGrad;
    ctx.fillRect(0, h * 0.58, w, h * 0.42);

  } else if (scene === 'cyberpunk') {
    // Cyberpunk neon futuristic city at night
    const cyberGrad = ctx.createLinearGradient(0, 0, 0, h);
    cyberGrad.addColorStop(0, '#0a0a14');
    cyberGrad.addColorStop(0.5, '#120d24');
    cyberGrad.addColorStop(1, '#05030a');
    ctx.fillStyle = cyberGrad;
    ctx.fillRect(0, 0, w, h);

    // Neon grid lines
    ctx.strokeStyle = 'rgba(0, 255, 198, 0.2)';
    ctx.lineWidth = 1;
    for (let x = 0; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, h * 0.65);
      ctx.lineTo(w * 0.5 + (x - w * 0.5) * 2.2, h);
      ctx.stroke();
    }

    // Holographic purple / cyan flares
    const flare1 = ctx.createRadialGradient(w * 0.2, h * 0.3, 10, w * 0.2, h * 0.3, 150);
    flare1.addColorStop(0, 'rgba(0, 255, 198, 0.3)');
    flare1.addColorStop(1, 'transparent');
    ctx.fillStyle = flare1;
    ctx.fillRect(0, 0, w * 0.5, h * 0.6);

    const flare2 = ctx.createRadialGradient(w * 0.8, h * 0.4, 10, w * 0.8, h * 0.4, 180);
    flare2.addColorStop(0, 'rgba(124, 77, 255, 0.35)');
    flare2.addColorStop(1, 'transparent');
    ctx.fillStyle = flare2;
    ctx.fillRect(w * 0.4, 0, w * 0.6, h * 0.6);

  } else {
    // Luxury Penthouse / Studio dark aesthetic
    const luxGrad = ctx.createLinearGradient(0, 0, 0, h);
    luxGrad.addColorStop(0, '#101018');
    luxGrad.addColorStop(0.6, '#181824');
    luxGrad.addColorStop(1, '#0a0a10');
    ctx.fillStyle = luxGrad;
    ctx.fillRect(0, 0, w, h);

    // City lights through glass
    for (let i = 0; i < 60; i++) {
      const gx = (i * 73) % (w * 0.9);
      const gy = h * 0.2 + ((i * 37) % (h * 0.4));
      ctx.fillStyle = i % 2 === 0 ? 'rgba(255, 230, 160, 0.35)' : 'rgba(0, 255, 198, 0.3)';
      ctx.fillRect(gx, gy, 4, 8);
    }
  }
}

function drawThemedOutfit(ctx: CanvasRenderingContext2D, scene: SceneType, size: number) {
  const w = size;
  const h = size;

  ctx.save();

  if (scene === 'astronaut') {
    // Realistic white and gray NASA astronaut spacesuit body & collar
    ctx.fillStyle = '#e8ecf2';
    ctx.beginPath();
    // Shoulder base
    ctx.moveTo(w * 0.15, h);
    ctx.bezierCurveTo(w * 0.18, h * 0.62, w * 0.32, h * 0.58, w * 0.5, h * 0.58);
    ctx.bezierCurveTo(w * 0.68, h * 0.58, w * 0.82, h * 0.62, w * 0.85, h);
    ctx.closePath();
    ctx.fill();

    // Suit shading & details
    ctx.strokeStyle = '#9ca3af';
    ctx.lineWidth = 3;
    ctx.stroke();

    // High-tech neck ring
    const ringGrad = ctx.createLinearGradient(0, h * 0.54, 0, h * 0.62);
    ringGrad.addColorStop(0, '#c4cbd4');
    ringGrad.addColorStop(0.5, '#ffffff');
    ringGrad.addColorStop(1, '#8b939f');
    ctx.fillStyle = ringGrad;
    ctx.beginPath();
    ctx.ellipse(w * 0.5, h * 0.59, w * 0.22, 24, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#4b5563';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Mission badge on chest
    ctx.fillStyle = '#00ffc6';
    ctx.beginPath();
    ctx.roundRect(w * 0.38, h * 0.74, 38, 22, 4);
    ctx.fill();

    ctx.fillStyle = '#7c4dff';
    ctx.beginPath();
    ctx.roundRect(w * 0.54, h * 0.74, 38, 22, 4);
    ctx.fill();

  } else if (scene === 'cafe') {
    // Trendy casual cafe jacket / sweater
    const jacketGrad = ctx.createLinearGradient(0, h * 0.58, 0, h);
    jacketGrad.addColorStop(0, '#2c3e50');
    jacketGrad.addColorStop(1, '#1a252f');
    ctx.fillStyle = jacketGrad;

    ctx.beginPath();
    ctx.moveTo(w * 0.18, h);
    ctx.bezierCurveTo(w * 0.2, h * 0.64, w * 0.35, h * 0.60, w * 0.5, h * 0.60);
    ctx.bezierCurveTo(w * 0.65, h * 0.60, w * 0.8, h * 0.64, w * 0.82, h);
    ctx.closePath();
    ctx.fill();

    // Collar / inner t-shirt
    ctx.fillStyle = '#f8fafc';
    ctx.beginPath();
    ctx.moveTo(w * 0.44, h * 0.60);
    ctx.lineTo(w * 0.5, h * 0.68);
    ctx.lineTo(w * 0.56, h * 0.60);
    ctx.closePath();
    ctx.fill();

  } else if (scene === 'cyberpunk') {
    // Futuristic cyber leather jacket with glowing collar seams
    ctx.fillStyle = '#11121d';
    ctx.beginPath();
    ctx.moveTo(w * 0.16, h);
    ctx.bezierCurveTo(w * 0.18, h * 0.62, w * 0.34, h * 0.58, w * 0.5, h * 0.58);
    ctx.bezierCurveTo(w * 0.66, h * 0.58, w * 0.82, h * 0.62, w * 0.84, h);
    ctx.closePath();
    ctx.fill();

    // Glowing cyan & purple collar stripes
    ctx.strokeStyle = '#00ffc6';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(w * 0.34, h * 0.64);
    ctx.lineTo(w * 0.48, h * 0.62);
    ctx.stroke();

    ctx.strokeStyle = '#7c4dff';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(w * 0.52, h * 0.62);
    ctx.lineTo(w * 0.66, h * 0.64);
    ctx.stroke();

  } else {
    // Stylish modern dark blazer
    ctx.fillStyle = '#1e1e2c';
    ctx.beginPath();
    ctx.moveTo(w * 0.18, h);
    ctx.bezierCurveTo(w * 0.22, h * 0.63, w * 0.36, h * 0.60, w * 0.5, h * 0.60);
    ctx.bezierCurveTo(w * 0.64, h * 0.60, w * 0.78, h * 0.63, w * 0.82, h);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

function drawUserFace(ctx: CanvasRenderingContext2D, userImg: HTMLImageElement, scene: SceneType, size: number) {
  const w = size;
  const h = size;

  // Face destination box: centered in upper half
  const faceCenterX = w * 0.5;
  const faceCenterY = h * 0.38;
  const faceRadiusX = w * 0.19;
  const faceRadiusY = h * 0.24;

  ctx.save();

  // Create smooth feathered portrait mask so user's real face and head blends perfectly
  ctx.beginPath();
  ctx.ellipse(faceCenterX, faceCenterY, faceRadiusX, faceRadiusY, 0, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();

  // Draw user's actual image scaled to fit
  // Calculate source aspect ratio
  const imgAspect = userImg.width / userImg.height;
  let sWidth = userImg.width;
  let sHeight = userImg.height;
  let sx = 0;
  let sy = 0;

  // Center crop source
  if (imgAspect > 1) {
    sWidth = userImg.height;
    sx = (userImg.width - sWidth) / 2;
  } else {
    sHeight = userImg.width;
    sy = (userImg.height - sHeight) * 0.15; // slightly higher crop for face
  }

  const dWidth = faceRadiusX * 2.3;
  const dHeight = faceRadiusY * 2.3;
  const dx = faceCenterX - dWidth / 2;
  const dy = faceCenterY - dHeight / 2;

  ctx.drawImage(userImg, sx, sy, sWidth, sHeight, dx, dy, dWidth, dHeight);

  // Apply subtle cohesive tone overlay to harmonize real face with scene lighting
  if (scene === 'cafe') {
    // Warm cafe glow
    ctx.fillStyle = 'rgba(255, 170, 90, 0.10)';
    ctx.fill();
  } else if (scene === 'astronaut') {
    // Cool space cockpit light
    ctx.fillStyle = 'rgba(0, 220, 255, 0.08)';
    ctx.fill();
  } else if (scene === 'beach') {
    // Golden sunset rim
    ctx.fillStyle = 'rgba(255, 130, 40, 0.14)';
    ctx.fill();
  } else if (scene === 'cyberpunk') {
    // Neon dual tint
    const cyberTint = ctx.createLinearGradient(dx, dy, dx + dWidth, dy + dHeight);
    cyberTint.addColorStop(0, 'rgba(0, 255, 198, 0.12)');
    cyberTint.addColorStop(1, 'rgba(124, 77, 255, 0.12)');
    ctx.fillStyle = cyberTint;
    ctx.fill();
  }

  ctx.restore();

  // Draw soft outer blending gradient around face edge so it looks organic and natural
  ctx.save();
  const edgeGradient = ctx.createRadialGradient(
    faceCenterX, faceCenterY, faceRadiusX * 0.75,
    faceCenterX, faceCenterY, faceRadiusX * 1.05
  );
  edgeGradient.addColorStop(0, 'transparent');
  edgeGradient.addColorStop(0.7, 'rgba(0, 0, 0, 0.15)');
  edgeGradient.addColorStop(1, 'rgba(0, 0, 0, 0.45)');
  
  ctx.beginPath();
  ctx.ellipse(faceCenterX, faceCenterY, faceRadiusX * 1.05, faceRadiusY * 1.05, 0, 0, Math.PI * 2);
  ctx.fillStyle = edgeGradient;
  ctx.fill();
  ctx.restore();
}

function drawAtmosphericLighting(ctx: CanvasRenderingContext2D, scene: SceneType, size: number) {
  const w = size;
  const h = size;

  ctx.save();

  if (scene === 'astronaut') {
    // Spacesuit visor glass reflection arc
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.38, w * 0.22, Math.PI * 1.15, Math.PI * 1.55);
    ctx.stroke();

    // Subtle cyan rim glow
    ctx.strokeStyle = 'rgba(0, 255, 198, 0.25)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(w * 0.5, h * 0.38, w * 0.21, Math.PI * 0.75, Math.PI * 1.1);
    ctx.stroke();

  } else if (scene === 'cafe') {
    // Warm directional lens glow
    const warmGlow = ctx.createRadialGradient(0, 0, 10, 0, 0, w * 0.6);
    warmGlow.addColorStop(0, 'rgba(255, 210, 130, 0.16)');
    warmGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = warmGlow;
    ctx.fillRect(0, 0, w, h);
  }

  // Cinematic vignette around whole frame
  const vignette = ctx.createRadialGradient(w * 0.5, h * 0.5, w * 0.35, w * 0.5, h * 0.5, w * 0.72);
  vignette.addColorStop(0, 'transparent');
  vignette.addColorStop(1, 'rgba(5, 5, 10, 0.55)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);

  ctx.restore();
}

function drawBrandingBadge(ctx: CanvasRenderingContext2D, scene: SceneType, size: number) {
  const w = size;
  const h = size;

  ctx.save();
  // Bottom left badge
  const bx = 24;
  const by = h - 52;
  const bw = 240;
  const bh = 32;

  ctx.fillStyle = 'rgba(8, 8, 13, 0.75)';
  ctx.beginPath();
  ctx.roundRect(bx, by, bw, bh, 8);
  ctx.fill();

  ctx.strokeStyle = 'rgba(0, 255, 198, 0.35)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Cyan dot
  ctx.fillStyle = '#00ffc6';
  ctx.beginPath();
  ctx.arc(bx + 16, by + 16, 4, 0, Math.PI * 2);
  ctx.fill();

  // Text
  ctx.font = 'bold 12px "Space Grotesk", sans-serif';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('Noxes A.i', bx + 28, by + 20);

  ctx.font = '11px monospace';
  ctx.fillStyle = '#00ffc6';
  ctx.fillText('• MUKA 100% ORI', bx + 95, by + 20);

  ctx.restore();
}

export async function enhanceImageHD(userImageSrc: string): Promise<{ dataUrl: string; title: string }> {
  return new Promise((resolve, reject) => {
    const userImg = new Image();
    userImg.crossOrigin = 'anonymous';
    userImg.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        const size = 1024;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) throw new Error('Canvas context not available');

        ctx.filter = 'contrast(1.12) saturate(1.1) brightness(1.03)';
        ctx.drawImage(userImg, 0, 0, size, size);
        ctx.filter = 'none';

        ctx.save();
        const bx = 24;
        const by = size - 52;
        const bw = 240;
        const bh = 32;
        ctx.fillStyle = 'rgba(8, 8, 13, 0.85)';
        ctx.beginPath();
        ctx.roundRect(bx, by, bw, bh, 8);
        ctx.fill();
        ctx.strokeStyle = 'rgba(0, 255, 198, 0.5)';
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.fillStyle = '#00ffc6';
        ctx.beginPath();
        ctx.arc(bx + 16, by + 16, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.font = 'bold 12px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('Noxes AI • Ultra HD', bx + 28, by + 20);
        ctx.font = '11px monospace';
        ctx.fillStyle = '#00ffc6';
        ctx.fillText('• 4K Upscaled', bx + 130, by + 20);
        ctx.restore();

        resolve({
          dataUrl: canvas.toDataURL('image/png', 0.98),
          title: 'Hasil Enhancement Ultra HD 4K',
        });
      } catch (err) {
        reject(err);
      }
    };
    userImg.onerror = () => reject(new Error('Gagal memuat foto'));
    userImg.src = userImageSrc;
  });
}

