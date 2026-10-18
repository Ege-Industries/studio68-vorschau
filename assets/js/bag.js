// Hero: 3D-Boxsack zum Draufhauen (Pendel-Physik, Delle, Schatten auf das Plakat)
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

const H = 2.0, R = 0.43;

function leatherTexture() {
  const W = 2048, Hh = 1536, c = document.createElement('canvas');
  c.width = W; c.height = Hh;
  const g = c.getContext('2d');
  g.fillStyle = '#151518'; g.fillRect(0, 0, W, Hh);
  // fleckiges Leder
  for (let i = 0; i < 1400; i++) {
    const x = Math.random() * W, y = Math.random() * Hh, r = 14 + Math.random() * 110, a = Math.random() * .045;
    const gr = g.createRadialGradient(x, y, 0, x, y, r);
    gr.addColorStop(0, `rgba(255,255,255,${a})`); gr.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  // Abrieb in der Schlagzone
  for (let i = 0; i < 260; i++) {
    const x = W * .5 + (Math.random() - .5) * W * .5, y = Hh * (.25 + Math.random() * .5);
    g.strokeStyle = `rgba(255,255,255,${.03 + Math.random() * .06})`; g.lineWidth = 1 + Math.random() * 2;
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + (Math.random() - .5) * 60, y + (Math.random() - .5) * 14); g.stroke();
  }
  const stitch = (x1, y1, x2, y2) => {
    g.save(); g.setLineDash([14, 10]); g.strokeStyle = 'rgba(200,200,205,.35)'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); g.restore();
  };
  // Nähte (Seiten und hinten)
  for (const x of [W * .25, W * .75, 0, W]) {
    g.fillStyle = 'rgba(0,0,0,.65)'; g.fillRect(x - 4, 0, 8, Hh);
    stitch(x - 16, 0, x - 16, Hh); stitch(x + 16, 0, x + 16, Hh);
  }
  // obere/untere Bänder
  g.fillStyle = '#0c0c0e'; g.fillRect(0, 0, W, Hh * .075); g.fillRect(0, Hh * .93, W, Hh * .07);
  stitch(0, Hh * .075 - 14, W, Hh * .075 - 14); stitch(0, Hh * .93 + 14, W, Hh * .93 + 14);
  g.fillStyle = '#ff6b1a'; g.fillRect(0, Hh * .075, W, 10); g.fillRect(0, Hh * .93 - 10, W, 10);
  // Logo vorne
  g.save(); g.translate(W * .5, 0);
  g.fillStyle = '#f2f1ec'; g.textAlign = 'center';
  g.font = '900 118px Tektur, sans-serif';
  g.fillText('STUDIO', 0, Hh * .19);
  g.font = '560px Anton, Impact, sans-serif';
  g.fillStyle = '#ff6b1a'; g.fillText('68', 0, Hh * .58);
  g.font = '500 44px "JetBrains Mono", monospace'; g.fillStyle = 'rgba(242,241,236,.75)';
  g.fillText('HEDDESHEIM  //  FIGHT CLUB', 0, Hh * .87);
  g.restore();
  // abgenutzter Druck
  g.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 2600; i++) {
    g.fillStyle = `rgba(0,0,0,${Math.random() * .5})`;
    g.fillRect(W * .3 + Math.random() * W * .4, Hh * .12 + Math.random() * Hh * .5, 1 + Math.random() * 4, 1 + Math.random() * 3);
  }
  g.globalCompositeOperation = 'source-over';
  // Tape-Wicklung
  const ty = Hh * .63, th = Hh * .06;
  g.fillStyle = '#e8e4d8'; g.fillRect(0, ty, W, th);
  for (let i = 0; i < 500; i++) { g.fillStyle = `rgba(80,70,60,${Math.random() * .12})`; g.fillRect(Math.random() * W, ty + Math.random() * th, 4 + Math.random() * 40, 1 + Math.random() * 2); }
  g.fillStyle = 'rgba(0,0,0,.18)'; for (let x = 0; x < W; x += 120 + Math.random() * 90) g.fillRect(x, ty, 2, th);
  g.fillStyle = '#e8e4d8';
  for (let x = 0; x < W; x += 6) { g.fillRect(x, ty - Math.random() * 4, 6, 4); g.fillRect(x, ty + th - 1, 6, Math.random() * 4); }
  g.font = '600 30px "JetBrains Mono", monospace'; g.fillStyle = 'rgba(13,13,14,.55)';
  g.fillText('TRAIN HARD. FIGHT HARDER.', W * .5 - 240, ty + th * .62);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

function bumpTexture() {
  const W = 1024, Hh = 768, c = document.createElement('canvas');
  c.width = W; c.height = Hh;
  const g = c.getContext('2d'), img = g.createImageData(W, Hh);
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 118 + Math.random() * 22;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  g.filter = 'blur(1px)'; g.drawImage(c, 0, 0); g.filter = 'none';
  g.fillStyle = 'rgba(0,0,0,.5)';
  for (const x of [W * .25, W * .75, 0, W]) g.fillRect(x - 3, 0, 6, Hh);
  g.fillRect(0, Hh * .075, W, 4); g.fillRect(0, Hh * .93, W, 4);
  const t = new THREE.CanvasTexture(c);
  return t;
}

export function initBag({ canvas, hero, anchor, onHit, onHover, onPos }) {
  const mob = matchMedia('(max-width: 900px)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, mob ? 1.75 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture;
  scene.environmentIntensity = .38;
  const camera = new THREE.PerspectiveCamera(26, 1, .1, 200);
  camera.position.set(0, 0, 16);

  // Licht
  const key = new THREE.DirectionalLight(0xfff1e2, 2.8);
  key.position.set(-4.5, 6, 8); key.castShadow = true;
  key.shadow.mapSize.set(mob ? 1024 : 2048, mob ? 1024 : 2048);
  Object.assign(key.shadow.camera, { left: -6, right: 6, top: 7, bottom: -7, near: 1, far: 40 });
  key.shadow.bias = -.0004;
  scene.add(key, key.target);
  const rim = new THREE.DirectionalLight(0x3fe0cf, 3.2); rim.position.set(6, 2.5, -5); scene.add(rim);
  const fill = new THREE.DirectionalLight(0xff6b1a, 1.25); fill.position.set(-7, -3, 3); scene.add(fill);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x222222, .35));

  // Schatten auf das "Plakat" dahinter
  const shadowPlane = new THREE.Mesh(new THREE.PlaneGeometry(80, 80), new THREE.ShadowMaterial({ opacity: .13 }));
  shadowPlane.position.z = -1.5; shadowPlane.receiveShadow = true; scene.add(shadowPlane);

  // Sack
  const pts = [];
  const cr = .1, n = 64;
  pts.push(new THREE.Vector2(0.001, -H / 2));
  for (let i = 0; i <= 8; i++) { const a = -Math.PI / 2 + (i / 8) * Math.PI / 2; pts.push(new THREE.Vector2(R - cr + Math.cos(a) * cr, -H / 2 + cr + Math.sin(a) * cr)); }
  for (let i = 1; i < n; i++) { const y = -H / 2 + cr + (i / n) * (H - 2 * cr); const bulge = Math.sin((i / n) * Math.PI) * .012; pts.push(new THREE.Vector2(R + bulge, y)); }
  for (let i = 0; i <= 8; i++) { const a = (i / 8) * Math.PI / 2; pts.push(new THREE.Vector2(R - cr + Math.cos(a) * cr, H / 2 - cr + Math.sin(a) * cr)); }
  pts.push(new THREE.Vector2(0.001, H / 2));
  const bagGeo = new THREE.LatheGeometry(pts, 110, Math.PI, Math.PI * 2);
  const map = leatherTexture();
  const uniforms = { uHit: { value: new THREE.Vector3(0, 0, R) }, uAmp: { value: 0 }, uWob: { value: 0 }, uTime: { value: 0 } };
  const bagMat = new THREE.MeshPhysicalMaterial({
    map, bumpMap: bumpTexture(), bumpScale: .9, roughness: .5, metalness: 0,
    clearcoat: .55, clearcoatRoughness: .4, sheen: .5, sheenRoughness: .55, sheenColor: new THREE.Color('#585866')
  });
  bagMat.onBeforeCompile = sh => {
    Object.assign(sh.uniforms, uniforms);
    sh.vertexShader = 'uniform vec3 uHit; uniform float uAmp; uniform float uWob; uniform float uTime;\n' +
      sh.vertexShader.replace('#include <begin_vertex>', `#include <begin_vertex>
        float dd = distance(position, uHit);
        float dent = uAmp * exp(-dd * dd * 7.0);
        float rip = uWob * sin(position.y * 8.0 - uTime * 28.0) * exp(-abs(position.y - uHit.y) * 1.3);
        transformed -= normal * dent * .16;
        transformed += normal * rip * .02;`);
  };
  const bag = new THREE.Mesh(bagGeo, bagMat);
  bag.castShadow = true;

  const metal = new THREE.MeshStandardMaterial({ color: 0xc4c8cf, metalness: 1, roughness: .26 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x0f0f11, metalness: .3, roughness: .5 });
  const bagGroup = new THREE.Group();
  bagGroup.add(bag);
  // Deckel-Ring + D-Ringe + Ketten zum Wirbel
  const capRing = new THREE.Mesh(new THREE.TorusGeometry(R * .9, .028, 10, 64), dark);
  capRing.rotation.x = Math.PI / 2; capRing.position.y = H / 2 - .005; bagGroup.add(capRing);
  const strapH = .62, swivel = new THREE.Vector3(0, H / 2 + strapH, 0);
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + i * Math.PI / 2, p = new THREE.Vector3(Math.sin(a) * R * .82, H / 2 + .02, Math.cos(a) * R * .82);
    const d = new THREE.Mesh(new THREE.TorusGeometry(.045, .012, 8, 16), metal);
    d.position.copy(p).add(new THREE.Vector3(0, .035, 0)); d.lookAt(swivel); bagGroup.add(d);
    const len = p.distanceTo(swivel);
    const s = new THREE.Mesh(new THREE.CylinderGeometry(.009, .009, len, 6), metal);
    s.position.copy(p).lerp(swivel, .5);
    s.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), swivel.clone().sub(p).normalize());
    s.castShadow = true; bagGroup.add(s);
  }
  const sw = new THREE.Mesh(new THREE.CylinderGeometry(.045, .045, .12, 16), metal);
  sw.position.copy(swivel); sw.castShadow = true; bagGroup.add(sw);

  const pivot = new THREE.Group();
  pivot.rotation.order = 'XZY';
  pivot.add(bagGroup);
  const rig = new THREE.Group(); rig.add(pivot); scene.add(rig);

  // Hauptkette (instanziert, Länge hängt vom Layout ab)
  const linkGeo = new THREE.TorusGeometry(.052, .015, 8, 18); linkGeo.scale(1, 1.6, 1);
  const MAXL = 90, chain = new THREE.InstancedMesh(linkGeo, metal, MAXL);
  chain.castShadow = true; pivot.add(chain);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), one = new THREE.Vector3(1, 1, 1);
  let L = 4;   // Pendellänge Wirbel→Sackmitte inkl. Kette (lokal)

  function buildChain(len) {
    const step = .118, cnt = Math.min(MAXL, Math.ceil(len / step));
    for (let i = 0; i < cnt; i++) {
      q.setFromEuler(new THREE.Euler(0, i % 2 ? Math.PI / 2 : 0, 0));
      v.set(0, -i * step - .06, 0);
      m4.compose(v, q, one); chain.setMatrixAt(i, m4);
    }
    chain.count = cnt; chain.instanceMatrix.needsUpdate = true;
  }

  let unit = .01;
  function layout() {
    const hr = hero.getBoundingClientRect(), ar = anchor.getBoundingClientRect();
    const w = Math.max(1, hr.width), h = Math.max(1, hr.height);
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    const vh = 2 * camera.position.z * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2));
    unit = vh / h;
    const cx = ar.left - hr.left + ar.width * (mob ? .6 : .5);
    const cy = ar.top - hr.top + ar.height * (mob ? .56 : .55);
    const hpx = ar.height * (mob ? .66 : .8);
    const s = (hpx * unit) / H;
    rig.scale.setScalar(s);
    const bx = (cx - w / 2) * unit, by = (h / 2 - cy) * unit;
    const topY = mob ? (h / 2 - (ar.top - hr.top - 22)) * unit : (h / 2) * unit + .6;   // Handy: über dem Foto, sonst über dem Rand
    rig.position.set(bx, topY, 0);
    const chainLen = (topY - by) / s - H / 2 - strapH;
    bagGroup.position.y = -(chainLen + strapH + H / 2);
    chain.position.y = 0;
    buildChain(chainLen + .02);
    chain.position.y = 0;
    // Kette endet am Wirbel
    L = chainLen + strapH + H / 2;
    key.target.position.set(bx, by, 0);
    key.position.set(bx - 3, by + 5, 13);
    shadowPlane.position.set(bx, by, -1.5);
  }

  // Physik
  const st = { ax: 0, az: .13, vx: 0, vz: 0, ty: 0, vt: .4 };
  let lastHit = -10, t = 0;
  function step(dt) {
    const Le = THREE.MathUtils.clamp(L, 2.4, 5.5), w2 = 9.81 / Le * .9;
    const sub = 4, h2 = dt / sub;
    for (let i = 0; i < sub; i++) {
      st.vx += (-w2 * Math.sin(st.ax) - .7 * st.vx) * h2;
      st.vz += (-w2 * Math.sin(st.az) - .7 * st.vz) * h2;
      st.vt += (-5.5 * st.ty - .9 * st.vt) * h2;
      // leichter Wind, wenn niemand schlägt
      if (t - lastHit > 5) { st.vz += Math.sin(t * .7) * .012 * h2 * 10; st.vx += Math.cos(t * .53) * .006 * h2 * 10; }
      st.ax += st.vx * h2; st.az += st.vz * h2; st.ty += st.vt * h2;
    }
    pivot.rotation.set(st.ax, st.ty, st.az);
    uniforms.uAmp.value *= Math.exp(-dt * 8);
    uniforms.uWob.value *= Math.exp(-dt * 3.5);
    uniforms.uTime.value = t;
  }

  // Treffer
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  const pv = { x: 0, y: 0, t: 0, vx: 0, vy: 0 };
  function toNdc(e) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
    return r;
  }
  function pick(e) { toNdc(e); ray.setFromCamera(ndc, camera); return ray.intersectObject(bag, false)[0]; }

  function punch(e) {
    const hit = pick(e);
    if (!hit) return false;
    const speed = Math.min(4, Math.hypot(pv.vx, pv.vy));
    const s = THREE.MathUtils.clamp(.55 + speed * .45 + Math.random() * .15, .55, 1.65);
    const dir = ray.ray.direction.clone(); dir.y *= .2; dir.normalize();
    dir.x += THREE.MathUtils.clamp(pv.vx * .18, -.45, .45);
    const piv = new THREE.Vector3(); pivot.getWorldPosition(piv);
    const r = hit.point.clone().sub(piv).divideScalar(rig.scale.x * L);
    const dw = new THREE.Vector3().crossVectors(r, dir).multiplyScalar(.27 * s);
    st.vx += dw.x; st.vz += dw.z;
    const local = bag.worldToLocal(hit.point.clone());
    st.vt += THREE.MathUtils.clamp((local.x / R) * 1.4 * s + dw.y * 2, -3, 3);
    uniforms.uHit.value.copy(local);
    uniforms.uAmp.value = Math.min(1.25, .5 + s * .5);
    uniforms.uWob.value = s;
    lastHit = t;
    const hr = hero.getBoundingClientRect();
    const newton = Math.round(240 + s * 560 + Math.random() * 60);
    onHit && onHit({ x: e.clientX - hr.left, y: e.clientY - hr.top, newton, s });
    return true;
  }

  function onMove(e) {
    const now = performance.now(), dt = Math.max(8, now - pv.t);
    pv.vx = pv.vx * .5 + ((e.clientX - pv.x) / dt) * .5;
    pv.vy = pv.vy * .5 + ((e.clientY - pv.y) / dt) * .5;
    pv.x = e.clientX; pv.y = e.clientY; pv.t = now;
    if (onHover && e.pointerType === 'mouse') onHover(!!pick(e));
  }
  function onDown(e) {
    if (e.target.closest('a,button,input,label,.bag-hud')) return;
    if (e.pointerType !== 'mouse') { pv.vx = (Math.random() - .5) * 1.4; pv.vy = 0; }
    punch(e);
  }
  hero.addEventListener('pointermove', onMove, { passive: true });
  hero.addEventListener('pointerdown', onDown);
  hero.addEventListener('pointerleave', () => onHover && onHover(false));

  let running = true, raf = 0, last = performance.now();
  const pp = new THREE.Vector3();
  const io = new IntersectionObserver(es => { running = es[0].isIntersecting; if (running) loop(); }, { threshold: 0 });
  io.observe(hero);
  function loop() {
    cancelAnimationFrame(raf);
    if (!running || document.hidden) return;
    raf = requestAnimationFrame(loop);
    const nowT = performance.now();
    const dt = Math.min(1 / 30, Math.max(0, (nowT - last) / 1000)); last = nowT; t += dt;
    step(dt);
    renderer.render(scene, camera);
    if (onPos) {
      bag.getWorldPosition(pp); pp.project(camera);
      onPos({ x: (pp.x + 1) / 2 * canvas.clientWidth, y: (1 - pp.y) / 2 * canvas.clientHeight, r: R * rig.scale.x / unit });
    }
  }
  document.addEventListener('visibilitychange', () => { last = performance.now(); loop(); });
  const ro = new ResizeObserver(() => layout());
  ro.observe(hero);
  layout(); loop();
  return { layout, renderer };
}
