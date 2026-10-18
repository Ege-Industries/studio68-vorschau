// R2: 3D-Octagon. Jede der 8 Käfigseiten = eine Disziplin. Scroll dreht den Käfig.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

const N = 8, RAD = 5, FH = 1.85, BASE = .55, TAU = Math.PI * 2;
const APO = RAD * Math.cos(Math.PI / N), SIDE = 2 * RAD * Math.sin(Math.PI / N);
const sideAngle = i => (i / N) * TAU;            // Normale der Seite i (0 = +z)
const postAngle = i => sideAngle(i) + Math.PI / N;

function floorTexture(discs) {
  const S = 2048, c = document.createElement('canvas'); c.width = c.height = S;
  const g = c.getContext('2d'), C = S / 2, k = S / (2 * RAD);
  g.save();
  g.beginPath();
  for (let i = 0; i < N; i++) { const a = postAngle(i); const x = C + Math.sin(a) * RAD * k, y = C + Math.cos(a) * RAD * k; i ? g.lineTo(x, y) : g.moveTo(x, y); }
  g.closePath(); g.clip();
  g.fillStyle = '#1a1a1d'; g.fillRect(0, 0, S, S);
  for (let i = 0; i < 9000; i++) { g.fillStyle = `rgba(255,255,255,${Math.random() * .03})`; g.fillRect(Math.random() * S, Math.random() * S, 2, 2); }
  // Ringe
  g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 6;
  g.beginPath(); g.arc(C, C, 1.55 * k, 0, TAU); g.stroke();
  g.strokeStyle = 'rgba(255,107,26,.55)'; g.lineWidth = 10;
  g.beginPath(); g.arc(C, C, 1.75 * k, 0, TAU); g.stroke();
  // Logo
  g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillStyle = 'rgba(242,241,236,.9)'; g.font = '900 230px Tektur, sans-serif';
  g.fillText('studio.', C - 120, C);
  g.fillStyle = '#ff6b1a'; g.fillText('68', C + 330, C);
  g.font = '600 46px "JetBrains Mono", monospace'; g.fillStyle = 'rgba(242,241,236,.5)';
  g.fillText('HEDDESHEIM  //  EST. FIGHT CLUB', C, C + 170);
  // Sektor-Beschriftungen
  for (let i = 0; i < N; i++) {
    const a = sideAngle(i), d = discs[i];
    g.save(); g.translate(C + Math.sin(a) * (APO - .78) * k, C + Math.cos(a) * (APO - .78) * k); g.rotate(-a);
    g.fillStyle = d ? d.color : '#fff'; g.font = '400 74px Anton, Impact, sans-serif';
    g.fillText(`${String(i + 1).padStart(2, '0')}  ${(d ? d.name : '').toUpperCase()}`, 0, 0);
    g.restore();
    // Linie Mitte→Pfosten
    const p = postAngle(i);
    g.strokeStyle = 'rgba(255,255,255,.06)'; g.lineWidth = 3;
    g.beginPath(); g.moveTo(C + Math.sin(p) * 2 * k, C + Math.cos(p) * 2 * k); g.lineTo(C + Math.sin(p) * RAD * k, C + Math.cos(p) * RAD * k); g.stroke();
  }
  g.restore();
  // Rand
  g.strokeStyle = '#ff6b1a'; g.lineWidth = 14; g.beginPath();
  for (let i = 0; i <= N; i++) { const a = postAngle(i % N); const x = C + Math.sin(a) * RAD * k * .985, y = C + Math.cos(a) * RAD * k * .985; i ? g.lineTo(x, y) : g.moveTo(x, y); }
  g.stroke();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}

function meshTexture() {
  const S = 256, c = document.createElement('canvas'); c.width = c.height = S;
  const g = c.getContext('2d');
  g.fillStyle = '#000'; g.fillRect(0, 0, S, S);
  g.strokeStyle = '#fff'; g.lineWidth = 11; g.lineCap = 'round';
  g.beginPath(); g.moveTo(0, S / 2); g.lineTo(S / 2, 0); g.lineTo(S, S / 2); g.lineTo(S / 2, S); g.closePath(); g.stroke();
  g.beginPath(); g.moveTo(-S / 2, 0); g.lineTo(0, -S / 2); g.stroke();
  for (const [x, y] of [[0, 0], [S, 0], [0, S], [S, S]]) { g.beginPath(); g.arc(x, y, 6, 0, TAU); g.fillStyle = '#fff'; g.fill(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

function bannerTexture(d, i, on) {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 140;
  const g = c.getContext('2d');
  g.fillStyle = on ? d.color : '#0d0d0f'; g.fillRect(0, 0, 1024, 140);
  g.fillStyle = on ? '#0d0d0e' : 'rgba(242,241,236,.92)';
  g.font = '400 100px Anton, Impact, sans-serif'; g.textBaseline = 'middle';
  g.fillText(`${String(i + 1).padStart(2, '0')}`, 26, 76);
  let fs = 100; g.font = `400 ${fs}px Anton, Impact, sans-serif`;
  while (g.measureText(d.name.toUpperCase()).width > 760 && fs > 50) { fs -= 4; g.font = `400 ${fs}px Anton, Impact, sans-serif`; }
  g.fillText(d.name.toUpperCase(), 170, 76);
  g.fillStyle = on ? '#0d0d0e' : d.color; g.fillRect(0, 0, 12, 140);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}

export function initOctagon({ canvas, section, discs, label, onActive }) {
  const mob = matchMedia('(max-width: 900px)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: !mob, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, mob ? 1.5 : 1.75));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.shadowMap.enabled = !mob;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.setClearColor(0x09090a, 1);

  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x09090a, .045);
  const camera = new THREE.PerspectiveCamera(mob ? 48 : 36, 1, .1, 200);

  const cage = new THREE.Group(); scene.add(cage);

  // Podest
  const baseGeo = new THREE.CylinderGeometry(RAD * 1.06, RAD * 1.1, BASE, N, 1, false, Math.PI / N);
  const baseMesh = new THREE.Mesh(baseGeo, new THREE.MeshStandardMaterial({ color: 0x101012, roughness: .7, metalness: .2 }));
  baseMesh.position.y = BASE / 2; baseMesh.receiveShadow = true; cage.add(baseMesh);
  // leuchtende Kante
  const edgePts = []; for (let i = 0; i <= N; i++) { const a = postAngle(i % N); edgePts.push(new THREE.Vector3(Math.sin(a) * RAD * 1.1, .02, Math.cos(a) * RAD * 1.1)); }
  const edge = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(edgePts, false, 'catmullrom', 0), 64, .025, 6, false), new THREE.MeshBasicMaterial({ color: 0xff6b1a }));
  edge.material.color.multiplyScalar(2.2); cage.add(edge);
  const edge2 = edge.clone(); edge2.scale.setScalar(.962); edge2.position.y = BASE + .005; edge2.material = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x3fe0cf).multiplyScalar(1.6) }); cage.add(edge2);

  // Boden
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(RAD * 2, RAD * 2), new THREE.MeshStandardMaterial({ map: floorTexture(discs), roughness: .82, metalness: 0, transparent: true }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = BASE + .01; floor.receiveShadow = true; cage.add(floor);

  // Sektor-Licht auf dem Boden (aktive Seite)
  const secShape = new THREE.Shape();
  secShape.moveTo(0, 0);
  secShape.lineTo(Math.sin(-Math.PI / N) * RAD * .97, Math.cos(-Math.PI / N) * RAD * .97);
  secShape.lineTo(Math.sin(Math.PI / N) * RAD * .97, Math.cos(Math.PI / N) * RAD * .97);
  const secMat = new THREE.MeshBasicMaterial({ color: 0xff6b1a, transparent: true, opacity: .16, blending: THREE.AdditiveBlending, depthWrite: false });
  const sector = new THREE.Mesh(new THREE.ShapeGeometry(secShape), secMat);
  sector.rotation.x = -Math.PI / 2; sector.position.y = BASE + .02;
  const secPivot = new THREE.Group(); secPivot.add(sector);
  sector.rotation.set(-Math.PI / 2, 0, 0);
  // ShapeGeometry liegt in XY; nach -90° um X zeigt +y nach -z → um 180° drehen, damit Spitze nach +z zeigt
  sector.rotation.z = Math.PI;
  cage.add(secPivot);

  // Pfosten
  const padMat = new THREE.MeshStandardMaterial({ color: 0x141416, roughness: .55, metalness: .1 });
  const padTop = new THREE.MeshStandardMaterial({ color: 0xff6b1a, roughness: .5, emissive: 0x401000 });
  const steel = new THREE.MeshStandardMaterial({ color: 0x9aa0a8, metalness: .95, roughness: .3 });
  for (let i = 0; i < N; i++) {
    const a = postAngle(i), x = Math.sin(a) * RAD, z = Math.cos(a) * RAD;
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(.2, .2, FH + .1, 16), padMat);
    pad.position.set(x, BASE + (FH + .1) / 2, z); pad.castShadow = true; cage.add(pad);
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(.205, .205, .16, 16), padTop);
    cap.position.set(x, BASE + FH + .13, z); cage.add(cap);
  }

  // Zaun + Banner + Rails
  const alpha = meshTexture();
  const fenceMat = new THREE.MeshStandardMaterial({ color: 0x8d939b, metalness: .9, roughness: .35, alphaMap: alpha, alphaTest: .35, side: THREE.DoubleSide });
  const banners = [], bannerMeshes = [];
  for (let i = 0; i < N; i++) {
    const a = sideAngle(i), mx = Math.sin(a) * APO, mz = Math.cos(a) * APO;
    const tex = alpha.clone(); tex.repeat.set(SIDE / .2, (FH - .35) / .2); tex.needsUpdate = true;
    const m = fenceMat.clone(); m.alphaMap = tex;
    const fence = new THREE.Mesh(new THREE.PlaneGeometry(SIDE - .3, FH - .35), m);
    fence.position.set(mx, BASE + .2 + (FH - .35) / 2, mz); fence.rotation.y = a;
    fence.castShadow = true;
    fence.customDepthMaterial = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, alphaMap: tex, alphaTest: .35 });
    cage.add(fence);
    // oberer gepolsterter Balken mit Banner
    const d = discs[i] || { name: '', color: '#ff6b1a' };
    const bTex = [bannerTexture(d, i, false), bannerTexture(d, i, true)];
    const bm = new THREE.MeshStandardMaterial({ map: bTex[0], roughness: .55, emissive: 0xffffff, emissiveMap: bTex[1], emissiveIntensity: 0 });
    const banner = new THREE.Mesh(new THREE.BoxGeometry(SIDE - .3, .48, .16), bm);
    banner.position.set(Math.sin(a) * (APO + .03), BASE + FH + .04, Math.cos(a) * (APO + .03)); banner.rotation.y = a;
    cage.add(banner); banners.push(bm); bannerMeshes.push(banner);
    const rail = new THREE.Mesh(new THREE.CylinderGeometry(.035, .035, SIDE, 8), steel);
    rail.position.set(mx, BASE + .2, mz); rail.rotation.set(0, a, Math.PI / 2); cage.add(rail);
    // Banner-Material: Map wechselt beim Aktivieren
    bm.userData = { tex: bTex };
  }

  // Lichttraverse
  const truss = new THREE.Group(); scene.add(truss);
  const trussMat = new THREE.MeshStandardMaterial({ color: 0x2a2a2e, metalness: .8, roughness: .4 });
  const lampMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xfff2dd).multiplyScalar(3) });
  const coneMat = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
    uniforms: { uCol: { value: new THREE.Color(0xfff0d8) }, uOp: { value: .16 } },
    vertexShader: 'varying float vY; varying vec3 vN; varying vec3 vV; void main(){ vY = uv.y; vec4 mv = modelViewMatrix*vec4(position,1.); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }',
    fragmentShader: 'uniform vec3 uCol; uniform float uOp; varying float vY; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(abs(dot(vN, vV)), 1.6); gl_FragColor = vec4(uCol, uOp * vY * vY * f); }'
  });
  const TR = 6.4;
  for (let i = 0; i < N; i++) {
    const a = postAngle(i), b = postAngle(i + 1);
    const p1 = new THREE.Vector3(Math.sin(a) * RAD * 1.08, TR, Math.cos(a) * RAD * 1.08), p2 = new THREE.Vector3(Math.sin(b) * RAD * 1.08, TR, Math.cos(b) * RAD * 1.08);
    const beam = new THREE.Mesh(new THREE.BoxGeometry(.18, .18, p1.distanceTo(p2)), trussMat);
    beam.position.copy(p1).lerp(p2, .5); beam.lookAt(p2); truss.add(beam);
    const sa = sideAngle(i), lx = Math.sin(sa) * RAD * .98, lz = Math.cos(sa) * RAD * .98;
    const lamp = new THREE.Mesh(new THREE.CylinderGeometry(.16, .2, .3, 12), trussMat); lamp.position.set(lx, TR - .2, lz); truss.add(lamp);
    const glow = new THREE.Mesh(new THREE.CircleGeometry(.15, 16), lampMat); glow.rotation.x = Math.PI / 2; glow.position.set(lx, TR - .36, lz); truss.add(glow);
    const cone = new THREE.Mesh(new THREE.CylinderGeometry(.16, 1.9, TR - BASE - .4, 24, 1, true), coneMat.clone());
    cone.position.set(lx * .82, (TR + BASE) / 2 - .2, lz * .82); cone.rotation.z = 0;
    cone.lookAt(0, BASE, 0); cone.rotateX(Math.PI / 2);
    cone.position.set(lx, TR - .36 - (TR - BASE - .4) / 2, lz);
    cone.rotation.set(0, 0, 0);
    const dirV = new THREE.Vector3(-lx * .45, -(TR - BASE - .4), -lz * .45).normalize();
    cone.quaternion.setFromUnitVectors(new THREE.Vector3(0, -1, 0), dirV);
    const len = TR - BASE - .4;
    cone.position.set(lx + dirV.x * len / 2, TR - .36 + dirV.y * len / 2, lz + dirV.z * len / 2);
    // uv.y = 1 oben (schmal) → Shader blendet unten aus
    truss.add(cone);
  }
  // Truss dreht mit dem Käfig
  cage.add(truss);

  // Licht
  scene.add(new THREE.HemisphereLight(0x8899aa, 0x080808, .5));
  const top = new THREE.SpotLight(0xfff1dc, 220, 30, Math.PI / 4.2, .55, 1.6);
  top.position.set(0, 12, 0); top.target.position.set(0, 0, 0);
  top.castShadow = !mob; top.shadow.mapSize.set(1536, 1536); top.shadow.bias = -.0005;
  scene.add(top, top.target);
  const accent = new THREE.SpotLight(0xff6b1a, 140, 26, Math.PI / 7, .6, 1.4);
  accent.position.set(0, 7, 9); accent.target.position.set(0, BASE, APO - .5); scene.add(accent, accent.target);
  const rimL = new THREE.PointLight(0x3fe0cf, 30, 22, 1.6); rimL.position.set(-9, 3, -6); scene.add(rimL);
  const rimR = new THREE.PointLight(0xff5aa8, 22, 22, 1.6); rimR.position.set(9, 2.5, -5); scene.add(rimR);

  // Bodenring + Partikel (Cyber)
  const ringMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0x3fe0cf).multiplyScalar(1.2), transparent: true, opacity: .55, side: THREE.DoubleSide });
  const ring = new THREE.Mesh(new THREE.RingGeometry(RAD * 1.45, RAD * 1.47, 128, 1, 0, TAU * .82), ringMat);
  ring.rotation.x = -Math.PI / 2; ring.position.y = .01; scene.add(ring);
  const ring2 = new THREE.Mesh(new THREE.RingGeometry(RAD * 1.6, RAD * 1.61, 128, 1, 0, TAU * .3), ringMat.clone());
  ring2.rotation.x = -Math.PI / 2; ring2.position.y = .01; ring2.material.color = new THREE.Color(0xff6b1a).multiplyScalar(1.5); scene.add(ring2);
  const ticks = new THREE.Group();
  for (let i = 0; i < 64; i++) {
    const a = i / 64 * TAU, l = i % 8 === 0 ? .5 : .18;
    const tk = new THREE.Mesh(new THREE.PlaneGeometry(.025, l), ringMat);
    tk.rotation.x = -Math.PI / 2; tk.rotation.z = -a; tk.position.set(Math.sin(a) * RAD * 1.7, .01, Math.cos(a) * RAD * 1.7);
    ticks.add(tk);
  }
  scene.add(ticks);
  const pc = mob ? 260 : 600, pg = new THREE.BufferGeometry(), pp = new Float32Array(pc * 3);
  for (let i = 0; i < pc; i++) { const r = Math.random() * RAD * 1.3, a = Math.random() * TAU; pp[i * 3] = Math.sin(a) * r; pp[i * 3 + 1] = BASE + Math.random() * 6; pp[i * 3 + 2] = Math.cos(a) * r; }
  pg.setAttribute('position', new THREE.BufferAttribute(pp, 3));
  const dust = new THREE.Points(pg, new THREE.PointsMaterial({ color: 0xffe9cf, size: .035, transparent: true, opacity: .55, depthWrite: false, blending: THREE.AdditiveBlending }));
  scene.add(dust);

  // Postprocessing
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), mob ? .55 : .75, .55, .78);
  composer.addPass(bloom);
  composer.addPass(new OutputPass());

  let W = 1, Hh = 1;
  function resize() {
    W = canvas.clientWidth || innerWidth; Hh = canvas.clientHeight || innerHeight;
    renderer.setSize(W, Hh, false); composer.setSize(W, Hh);
    camera.aspect = W / Hh;
    // Käfig nach rechts (Desktop) bzw. nach oben (Handy) schieben, damit die Karte Platz hat
    if (mob) camera.setViewOffset(W, Hh, 0, Hh * .2, W, Hh);
    else camera.setViewOffset(W, Hh, -W * .17, 0, W, Hh);
    camera.updateProjectionMatrix();
  }
  resize();
  addEventListener('resize', resize);

  // Scroll → Fortschritt
  const ss = x => x * x * x * (x * (x * 6 - 15) + 10);
  let target = 0, cur = 0, active = -1, mx = 0, my = 0, t = 0;
  const lp = new THREE.Vector3();
  function progress() {
    const r = section.getBoundingClientRect(), total = r.height - innerHeight;
    const p = THREE.MathUtils.clamp(-r.top / Math.max(1, total), 0, 1) * (N - 1);
    const i = Math.floor(p), f = p - i;
    return Math.min(N - 1, i + ss(THREE.MathUtils.clamp((f - .28) / .44, 0, 1)));
  }
  addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }, { passive: true });

  function setActive(i) {
    if (i === active) return;
    active = i;
    banners.forEach((m, k) => { m.map = m.userData.tex[k === i ? 1 : 0]; m.needsUpdate = true; });
    const col = new THREE.Color(discs[i] ? discs[i].color : '#ff6b1a');
    accent.color.copy(col); secMat.color.copy(col);
    onActive && onActive(i);
  }

  let running = false, raf = 0, last = performance.now();
  const io = new IntersectionObserver(es => { running = es[0].isIntersecting; if (running) { last = performance.now(); loop(); } }, { rootMargin: '100px' });
  io.observe(section);
  function loop() {
    cancelAnimationFrame(raf);
    if (!running || document.hidden) return;
    raf = requestAnimationFrame(loop);
    const n = performance.now(), dt = Math.min(1 / 30, Math.max(0, (n - last) / 1000)); last = n; t += dt;
    target = progress();
    cur += (target - cur) * (1 - Math.exp(-dt * 7));
    const idx = Math.round(cur);
    setActive(Math.max(0, Math.min(N - 1, idx)));
    cage.rotation.y = -cur * TAU / N + Math.sin(t * .3) * .02;
    secPivot.rotation.y = sideAngle(active);
    const pulse = .7 + Math.sin(t * 3) * .3;
    banners.forEach((m, k) => { m.emissiveIntensity = k === active ? .55 + pulse * .25 : 0; });
    secMat.opacity = .1 + pulse * .08;
    ring.rotation.z = t * .12; ring2.rotation.z = -t * .2; ticks.rotation.y = t * .03;
    const pa = pg.attributes.position.array;
    for (let i = 0; i < pc; i++) { pa[i * 3 + 1] += dt * .08; if (pa[i * 3 + 1] > BASE + 6) pa[i * 3 + 1] = BASE; }
    pg.attributes.position.needsUpdate = true;
    // Kamera: leichte Parallaxe + Fahrt
    const f = cur - Math.floor(cur), swing = Math.sin(f * Math.PI);
    const hf = Math.atan(Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.aspect);
    const dist = mob ? (RAD * 1.02) / Math.tan(hf) : Math.max(14.5, (RAD * 1.32) / Math.tan(hf));
    scene.fog.density = .045 * 14.5 / dist;
    camera.position.set(mx * 1.6, dist * (mob ? .3 : .34) + my * -.8 + swing * .5, dist - swing * .8);
    camera.lookAt(0, mob ? 1.2 : 1.9, 0);
    composer.render();
    if (label && bannerMeshes[active]) {
      bannerMeshes[active].getWorldPosition(lp); lp.y += .62;
      lp.project(camera);
      const x = (lp.x + 1) / 2 * W, y = (1 - lp.y) / 2 * Hh;
      label.style.transform = `translate3d(${x}px, ${y}px, 0) translate(-50%, -100%)`;
    }
  }
  document.addEventListener('visibilitychange', () => { last = performance.now(); loop(); });

  function goTo(i) {
    const r = section.getBoundingClientRect(), total = r.height - innerHeight;
    const y = scrollY + r.top + (i / (N - 1)) * total + 2;
    scrollTo({ top: y, behavior: 'smooth' });
  }
  return { goTo };
}
