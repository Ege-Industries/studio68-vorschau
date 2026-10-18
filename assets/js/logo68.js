// Footer: verchromte, irisierende "68" (Y2K-Chrom), folgt der Maus
import * as THREE from 'three';

function ring(cx, cy, ro, ri) {
  const s = new THREE.Shape(); s.absarc(cx, cy, ro, 0, Math.PI * 2, false);
  const h = new THREE.Path(); h.absarc(cx, cy, ri, 0, Math.PI * 2, true); s.holes.push(h);
  return s;
}
function stem() {
  // Bogen der 6: Ellipsenband von links (180°) bis oben (100°)
  const s = new THREE.Shape(), cx = .7, cy = -.5, a0 = Math.PI, a1 = Math.PI * 100 / 180, seg = 40;
  for (let i = 0; i <= seg; i++) { const a = a0 + (a1 - a0) * i / seg; const x = cx + Math.cos(a) * 1.3, y = cy + Math.sin(a) * 1.6; i ? s.lineTo(x, y) : s.moveTo(x, y); }
  for (let i = seg; i >= 0; i--) { const a = a0 + (a1 - a0) * i / seg; s.lineTo(cx + Math.cos(a) * 1.0, cy + Math.sin(a) * 1.3); }
  s.closePath();
  return s;
}

function envScene() {
  const sc = new THREE.Scene();
  const sky = new THREE.Mesh(new THREE.SphereGeometry(20, 32, 16), new THREE.ShaderMaterial({
    side: THREE.BackSide,
    vertexShader: 'varying vec3 p; void main(){ p = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
    fragmentShader: 'varying vec3 p; void main(){ vec3 top = vec3(.55,.85,.9); vec3 mid = vec3(.18,.18,.2); vec3 bot = vec3(1.,.45,.12); vec3 c = mix(mid, top, smoothstep(.0,.9,p.y)); c = mix(c, bot, smoothstep(.0,-.8,p.y)); c += vec3(1.,.35,.66) * pow(max(0., dot(p, normalize(vec3(-.8,.3,.4)))), 8.) * 1.5; gl_FragColor = vec4(c,1.); }'
  }));
  sc.add(sky);
  const box = (c, x, y, z, w, h) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c, side: THREE.DoubleSide })); m.position.set(x, y, z); m.lookAt(0, 0, 0); sc.add(m); };
  box(new THREE.Color(4, 4, 4), 0, 8, 6, 10, 3);
  box(new THREE.Color(3, 1.2, 2), -9, 2, 2, 4, 8);
  box(new THREE.Color(1, 3, 2.8), 9, 1, -3, 4, 10);
  box(new THREE.Color(3, 1.4, .3), 0, -6, 8, 14, 2);
  return sc;
}

export function initLogo68({ canvas }) {
  const mob = matchMedia('(max-width: 900px)').matches;
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, mob ? 1.75 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(envScene(), .02).texture;
  const camera = new THREE.PerspectiveCamera(30, 1, .1, 100);
  camera.position.set(0, 0, 9);

  const mat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, metalness: 1, roughness: .06, iridescence: 1, iridescenceIOR: 1.7,
    iridescenceThicknessRange: [180, 820], clearcoat: 1, clearcoatRoughness: .05
  });
  const ext = { depth: .38, bevelEnabled: true, bevelThickness: .09, bevelSize: .06, bevelSegments: 8, curveSegments: 48 };
  const g = new THREE.Group();
  const six = [ring(0, -.5, .6, .3), stem()], eight = [ring(0, .56, .5, .25), ring(0, -.5, .6, .3)];
  for (const s of six) { const m = new THREE.Mesh(new THREE.ExtrudeGeometry(s, ext), mat); m.position.x = -.82; g.add(m); }
  for (const s of eight) { const m = new THREE.Mesh(new THREE.ExtrudeGeometry(s, ext), mat); m.position.x = .82; g.add(m); }
  g.children.forEach(m => m.geometry.translate(0, 0, -.19));
  scene.add(g);
  const l1 = new THREE.PointLight(0xff6b1a, 18, 20); l1.position.set(-3, -2, 3); scene.add(l1);
  const l2 = new THREE.PointLight(0x3fe0cf, 18, 20); l2.position.set(3, 2, 3); scene.add(l2);

  function resize() {
    const w = canvas.clientWidth, h = canvas.clientHeight;
    renderer.setSize(w, h, false); camera.aspect = w / h;
    camera.position.z = w / h < 1 ? 11 : 8.2;
    camera.updateProjectionMatrix();
  }
  resize(); addEventListener('resize', resize);

  let mx = 0, my = 0, spin = 0, t = 0, running = false, raf = 0, last = performance.now(), entered = false;
  addEventListener('pointermove', e => { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; }, { passive: true });
  canvas.addEventListener('pointerdown', () => { spin += Math.PI * 2; });
  const io = new IntersectionObserver(es => {
    running = es[0].isIntersecting;
    if (running && !entered) { entered = true; spin += Math.PI * 2; }
    if (running) { last = performance.now(); loop(); }
  });
  io.observe(canvas);
  let rot = 0;
  function loop() {
    cancelAnimationFrame(raf);
    if (!running || document.hidden) return;
    raf = requestAnimationFrame(loop);
    const n = performance.now(), dt = Math.min(1 / 30, Math.max(0, (n - last) / 1000)); last = n; t += dt;
    const d = spin * (1 - Math.exp(-dt * 2.2)); spin -= d; rot += d;
    g.rotation.y = rot + mx * .9 + Math.sin(t * .6) * .12;
    g.rotation.x = my * .5 + Math.sin(t * .8) * .05;
    g.position.y = Math.sin(t * 1.1) * .08;
    l1.position.x = Math.sin(t * .7) * 4; l2.position.x = Math.cos(t * .5) * 4;
    renderer.render(scene, camera);
  }
  canvas.style.cursor = 'pointer';
  return {};
}
