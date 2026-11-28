// Inti renderer: toon shading + outline + pass grading + lapisan HUD 2D.
import * as THREE from 'three';
import { OutlineEffect } from 'three/addons/effects/OutlineEffect.js';

THREE.ColorManagement.enabled = false;
// ?land=1 → landscape 1280x720 (teaser/video musik); default potret 720x1280
export const LANDSCAPE = new URLSearchParams(location.search).has('land');
export const W = LANDSCAPE ? 1280 : 720, H = LANDSCAPE ? 720 : 1280;

export const renderer = new THREE.WebGLRenderer({ antialias: false, preserveDrawingBuffer: true });
renderer.setPixelRatio(1);
renderer.setSize(W, H);
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

export const outline = new OutlineEffect(renderer, {
  defaultThickness: 0.0042, defaultColor: [0.17, 0.11, 0.08], defaultAlpha: 1,
});

const rt = new THREE.WebGLRenderTarget(W, H, { samples: 4 });

// ---------- gradient toon 3 tingkat
const gData = new Uint8Array([120, 120, 120, 255, 200, 200, 200, 255, 255, 255, 255, 255]);
export const toonGrad = new THREE.DataTexture(gData, 3, 1, THREE.RGBAFormat);
toonGrad.minFilter = toonGrad.magFilter = THREE.NearestFilter;
toonGrad.needsUpdate = true;

const matCache = new Map();
export function toon(color, opts = {}) {
  const key = color + JSON.stringify(opts);
  if (!opts.map && matCache.has(key)) return matCache.get(key);
  const m = new THREE.MeshToonMaterial({ color, gradientMap: toonGrad, ...opts });
  if (opts.noOutline) { delete m.noOutline; m.userData.outlineParameters = { visible: false }; }
  if (!opts.map) matCache.set(key, m);
  return m;
}
export function flat(color, opts = {}) {
  const m = new THREE.MeshBasicMaterial({ color, ...opts });
  m.userData.outlineParameters = { visible: false };
  return m;
}
export function noOutline(m) { m.userData.outlineParameters = { visible: false }; return m; }

// ---------- pass grading
const post = new THREE.ShaderMaterial({
  uniforms: {
    tDiffuse: { value: rt.texture }, res: { value: new THREE.Vector2(W, H) }, time: { value: 0 },
    sat: { value: 1 }, bright: { value: 0 }, contrast: { value: 1 }, tint: { value: new THREE.Vector3(1, 1, 1) },
    vigColor: { value: new THREE.Vector3(0, 0, 0) }, vigAmt: { value: 0.3 }, vigRad: { value: 0.75 }, vigSoft: { value: 0.8 },
    grain: { value: 0.035 }, blur: { value: 0 }, footage: { value: 0 },
    overlayColor: { value: new THREE.Vector3(0, 0, 0) }, overlayAmt: { value: 0 },
    shiftX: { value: 0 },
  },
  vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.,1.); }`,
  fragmentShader: `
  uniform sampler2D tDiffuse; uniform vec2 res; uniform float time;
  uniform float sat, bright, contrast, vigAmt, vigRad, vigSoft, grain, blur, footage, overlayAmt, shiftX;
  uniform vec3 tint, vigColor, overlayColor; varying vec2 vUv;
  float rnd(vec2 c){ return fract(sin(dot(c, vec2(12.9898,78.233))) * 43758.5453); }
  void main(){
    vec2 uv = vUv + vec2(shiftX, 0.);
    vec3 c;
    if (blur > 0.) {
      vec3 a = vec3(0.); float n = 0.;
      for (int i=-4;i<=4;i++) for (int j=-4;j<=4;j++){ a += texture2D(tDiffuse, uv + vec2(float(i), float(j)) * blur / res).rgb; n += 1.; }
      c = a / n;
    } else c = texture2D(tDiffuse, uv).rgb;
    if (footage > 0.) {
      vec3 r = texture2D(tDiffuse, uv + vec2(0.0025, 0.)).rgb;
      c.r = mix(c.r, r.r, footage);
      c *= mix(1., 0.93 + 0.07 * sin(uv.y * res.y * 1.4), footage);
    }
    c = (c - 0.5) * contrast + 0.5 + bright;
    float l = dot(c, vec3(0.299, 0.587, 0.114));
    c = mix(vec3(l), c, sat) * tint;
    vec2 d = (vUv - 0.5) * 2.0; d.y *= 0.82;
    float v = smoothstep(vigRad, vigRad + vigSoft, length(d));
    c = mix(c, vigColor, v * vigAmt);
    c += (rnd(vUv * res + fract(time) * 91.7) - 0.5) * grain;
    c = mix(c, overlayColor, overlayAmt);
    gl_FragColor = vec4(clamp(c, 0., 1.), 1.);
  }`,
  depthTest: false, depthWrite: false,
});
const quadScene = new THREE.Scene();
const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
quadScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), post));

// ---------- HUD 2D (canvas transparan di atas)
export const hudCanvas = document.createElement('canvas');
hudCanvas.width = W; hudCanvas.height = H;
export const hud = hudCanvas.getContext('2d');
const hudTex = new THREE.CanvasTexture(hudCanvas);
hudTex.minFilter = THREE.LinearFilter;
const hudMat = new THREE.MeshBasicMaterial({ map: hudTex, transparent: true, depthTest: false });
const hudScene = new THREE.Scene();
hudScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), hudMat));

// ---------- preset grading
export const GRADES = {
  hangat: { sat: 0.95, contrast: 0.95, bright: 0.0, tint: [1.05, 1.0, 0.93], vigColor: [0.18, 0.11, 0.07], vigAmt: 0.45, vigRad: 0.7, vigSoft: 0.9, grain: 0.035 },
  malam: { sat: 0.9, contrast: 1.0, bright: -0.02, tint: [1.02, 0.96, 0.9], vigColor: [0.05, 0.04, 0.08], vigAmt: 0.6, vigRad: 0.55, vigSoft: 0.9, grain: 0.04 },
  tegang: { sat: 0.7, contrast: 1.05, bright: -0.03, tint: [0.9, 0.96, 1.08], vigColor: [0.02, 0.03, 0.06], vigAmt: 0.7, vigRad: 0.45, vigSoft: 0.9, grain: 0.05 },
  rekaman: { sat: 0.45, contrast: 1.1, bright: 0.0, tint: [0.96, 1.0, 1.02], vigColor: [0, 0, 0], vigAmt: 0.5, vigRad: 0.6, vigSoft: 0.9, grain: 0.1, footage: 1 },
  kenangan: { sat: 0.65, contrast: 0.9, bright: 0.05, tint: [1.04, 1.0, 0.94], vigColor: [1, 1, 1], vigAmt: 0.95, vigRad: 0.5, vigSoft: 0.6, grain: 0.03 },
  pagi: { sat: 0.95, contrast: 0.95, bright: 0.02, tint: [0.98, 1.0, 1.03], vigColor: [0.1, 0.1, 0.12], vigAmt: 0.35, vigRad: 0.75, vigSoft: 0.9, grain: 0.03 },
  sore: { sat: 1.0, contrast: 0.95, bright: 0.0, tint: [1.1, 0.97, 0.84], vigColor: [0.25, 0.1, 0.05], vigAmt: 0.5, vigRad: 0.6, vigSoft: 0.9, grain: 0.035 },
  panas: { sat: 1.1, contrast: 1.05, bright: 0.04, tint: [1.12, 1.0, 0.84], vigColor: [1, 0.85, 0.6], vigAmt: 0.35, vigRad: 0.6, vigSoft: 0.9, grain: 0.04 },
  hujan: { sat: 0.7, contrast: 0.95, bright: -0.06, tint: [0.92, 0.97, 1.05], vigColor: [0.08, 0.1, 0.14], vigAmt: 0.55, vigRad: 0.55, vigSoft: 0.9, grain: 0.05 },
  gelap: { sat: 0.5, contrast: 1.1, bright: -0.38, tint: [0.85, 0.9, 1.1], vigColor: [0, 0, 0], vigAmt: 0.9, vigRad: 0.3, vigSoft: 0.8, grain: 0.08 },
  pantai: { sat: 1.12, contrast: 1.0, bright: 0.04, tint: [1.0, 1.02, 1.05], vigColor: [0.1, 0.15, 0.2], vigAmt: 0.3, vigRad: 0.75, vigSoft: 0.9, grain: 0.03 },
  senja: { sat: 1.08, contrast: 1.0, bright: 0.02, tint: [1.15, 0.97, 0.8], vigColor: [0.3, 0.1, 0.05], vigAmt: 0.55, vigRad: 0.55, vigSoft: 0.9, grain: 0.035 },
  unggun: { sat: 1.0, contrast: 1.08, bright: -0.02, tint: [1.1, 0.95, 0.85], vigColor: [0.02, 0.02, 0.06], vigAmt: 0.7, vigRad: 0.45, vigSoft: 0.9, grain: 0.045 },
  ancaman: { sat: 0.55, contrast: 1.1, bright: -0.04, tint: [1.08, 0.88, 0.88], vigColor: [0.08, 0, 0], vigAmt: 0.75, vigRad: 0.4, vigSoft: 0.9, grain: 0.06 },
};
const DEFAULT = { sat: 1, contrast: 1, bright: 0, tint: [1, 1, 1], vigColor: [0, 0, 0], vigAmt: 0, vigRad: 0.7, vigSoft: 0.8, grain: 0.03, footage: 0, blur: 0, overlayColor: [0, 0, 0], overlayAmt: 0, shiftX: 0 };

export function applyGrade(g) {
  const o = { ...DEFAULT, ...(typeof g === 'string' ? GRADES[g] : g) };
  const u = post.uniforms;
  for (const k of ['sat', 'contrast', 'bright', 'vigAmt', 'vigRad', 'vigSoft', 'grain', 'footage', 'blur', 'overlayAmt', 'shiftX']) u[k].value = o[k];
  u.tint.value.set(...o.tint); u.vigColor.value.set(...o.vigColor); u.overlayColor.value.set(...o.overlayColor);
}
export function mixGrade(a, b, k) {
  const A = { ...DEFAULT, ...(typeof a === 'string' ? GRADES[a] : a) };
  const B = { ...DEFAULT, ...(typeof b === 'string' ? GRADES[b] : b) };
  const o = {};
  for (const key in A) {
    o[key] = Array.isArray(A[key]) ? A[key].map((v, i) => v + (B[key][i] - v) * k) : A[key] + (B[key] - A[key]) * k;
  }
  return o;
}

export function renderFrame(scene, camera, time) {
  post.uniforms.time.value = time;
  renderer.setRenderTarget(rt);
  renderer.setClearColor(scene.userData.clear ?? 0x000000, 1);
  renderer.clear();
  outline.render(scene, camera);
  renderer.setRenderTarget(null);
  renderer.autoClear = true;
  renderer.render(quadScene, quadCam);
  hudTex.needsUpdate = true;
  renderer.autoClear = false;
  renderer.render(hudScene, quadCam);
  renderer.autoClear = true;
}

// ---------- util
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, k) => a + (b - a) * k;
export const ease = (k) => { k = clamp(k); return k * k * (3 - 2 * k); };
export const easeOut = (k) => { k = clamp(k); return 1 - (1 - k) * (1 - k); };
export const easeIn = (k) => { k = clamp(k); return k * k; };
export const seg = (t, a, b) => clamp((t - a) / (b - a));
export const v3 = (a) => new THREE.Vector3(...a);
export function noise1(t, seed = 0) {
  return Math.sin(t * 1.7 + seed) * 0.5 + Math.sin(t * 2.9 + seed * 1.3) * 0.3 + Math.sin(t * 4.3 + seed * 2.1) * 0.2;
}
