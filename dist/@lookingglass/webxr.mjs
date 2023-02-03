var re = Object.defineProperty;
var se = (r, t, e) => t in r ? re(r, t, { enumerable: !0, configurable: !0, writable: !0, value: e }) : r[t] = e;
var L = (r, t, e) => (se(r, typeof t != "symbol" ? t + "" : t, e), e);
import Y from "@lookingglass/webxr-polyfill/src/api/index";
import oe from "@lookingglass/webxr-polyfill/src/api/XRSystem";
import ce from "@lookingglass/webxr-polyfill/src/WebXRPolyfill";
import * as le from "holoplay-core";
import { Shader as he } from "holoplay-core";
import de from "@lookingglass/webxr-polyfill/src/devices/XRDevice";
import ue from "@lookingglass/webxr-polyfill/src/api/XRSpace";
import { mat4 as E } from "gl-matrix";
import fe, { PRIVATE as me } from "@lookingglass/webxr-polyfill/src/api/XRWebGLLayer";
const U = 1.6;
var H;
(function(r) {
  r[r.Swizzled = 0] = "Swizzled", r[r.Center = 1] = "Center", r[r.Quilt = 2] = "Quilt";
})(H || (H = {}));
class pe extends EventTarget {
  constructor(e) {
    super();
    L(this, "_calibration", {
      configVersion: "1.0",
      pitch: { value: 45 },
      slope: { value: -5 },
      center: { value: -0.5 },
      viewCone: { value: 40 },
      invView: { value: 1 },
      verticalAngle: { value: 0 },
      DPI: { value: 338 },
      screenW: { value: 250 },
      screenH: { value: 250 },
      flipImageX: { value: 0 },
      flipImageY: { value: 0 },
      flipSubp: { value: 0 }
    });
    L(this, "_viewControls", {
      tileHeight: 512,
      numViews: 45,
      trackballX: 0,
      trackballY: 0,
      targetX: 0,
      targetY: U,
      targetZ: -0.5,
      targetDiam: 2,
      fovy: 13 / 180 * Math.PI,
      depthiness: 1.25,
      inlineView: H.Center
    });
    this._viewControls = { ...this._viewControls, ...e }, this.syncCalibration();
  }
  syncCalibration() {
    new le.Client((e) => {
      if (e.devices.length < 1) {
        console.error("No Looking Glass devices found!");
        return;
      }
      e.devices.length > 1 && console.warn("More than one Looking Glass device found... using the first one"), this.calibration = e.devices[0].calibration;
    }, (e) => {
      console.error("Error creating Looking Glass client:", e);
    });
  }
  addEventListener(e, a, n) {
    super.addEventListener(e, a, n);
  }
  onConfigChange() {
    this.dispatchEvent(new Event("on-config-changed"));
  }
  get calibration() {
    return this._calibration;
  }
  set calibration(e) {
    this._calibration = {
      ...this._calibration,
      ...e
    }, this.onConfigChange();
  }
  updateViewControls(e) {
    e != null && (this._viewControls = {
      ...this._viewControls,
      ...e
    }, this.onConfigChange());
  }
  get tileHeight() {
    return this._viewControls.tileHeight;
  }
  set tileHeight(e) {
    this.updateViewControls({ tileHeight: e });
  }
  get numViews() {
    return this._viewControls.numViews;
  }
  set numViews(e) {
    this.updateViewControls({ numViews: e });
  }
  get targetX() {
    return this._viewControls.targetX;
  }
  set targetX(e) {
    this.updateViewControls({ targetX: e });
  }
  get targetY() {
    return this._viewControls.targetY;
  }
  set targetY(e) {
    this.updateViewControls({ targetY: e });
  }
  get targetZ() {
    return this._viewControls.targetZ;
  }
  set targetZ(e) {
    this.updateViewControls({ targetZ: e });
  }
  get trackballX() {
    return this._viewControls.trackballX;
  }
  set trackballX(e) {
    this.updateViewControls({ trackballX: e });
  }
  get trackballY() {
    return this._viewControls.trackballY;
  }
  set trackballY(e) {
    this.updateViewControls({ trackballY: e });
  }
  get targetDiam() {
    return this._viewControls.targetDiam;
  }
  set targetDiam(e) {
    this.updateViewControls({ targetDiam: e });
  }
  get fovy() {
    return this._viewControls.fovy;
  }
  set fovy(e) {
    this.updateViewControls({ fovy: e });
  }
  get depthiness() {
    return this._viewControls.depthiness;
  }
  set depthiness(e) {
    this.updateViewControls({ depthiness: e });
  }
  get inlineView() {
    return this._viewControls.inlineView;
  }
  set inlineView(e) {
    this.updateViewControls({ inlineView: e });
  }
  get aspect() {
    return this._calibration.screenW.value / this._calibration.screenH.value;
  }
  get tileWidth() {
    return Math.round(this.tileHeight * this.aspect);
  }
  get framebufferWidth() {
    const e = this.tileWidth * this.tileHeight * this.numViews;
    return 2 ** Math.ceil(Math.log2(Math.max(Math.sqrt(e), this.tileWidth)));
  }
  get quiltWidth() {
    return Math.floor(this.framebufferWidth / this.tileWidth);
  }
  get quiltHeight() {
    return Math.ceil(this.numViews / this.quiltWidth);
  }
  get framebufferHeight() {
    return 2 ** Math.ceil(Math.log2(this.quiltHeight * this.tileHeight));
  }
  get viewCone() {
    return this._calibration.viewCone.value * this.depthiness / 180 * Math.PI;
  }
  get tilt() {
    return this._calibration.screenH.value / (this._calibration.screenW.value * this._calibration.slope.value) * (this._calibration.flipImageX.value ? -1 : 1);
  }
  get subp() {
    return 1 / (this._calibration.screenW.value * 3);
  }
  get pitch() {
    const e = this._calibration.screenW.value / this._calibration.DPI.value;
    return this._calibration.pitch.value * e * Math.cos(Math.atan(1 / this._calibration.slope.value));
  }
}
let X = null;
function A() {
  return X == null && (X = new pe()), X;
}
function z(r) {
  const t = A();
  r != null && t.updateViewControls(r);
}
function be(r) {
  var F;
  const t = A(), e = document.createElement("style");
  document.head.appendChild(e), (F = e.sheet) == null || F.insertRule("#LookingGlassWebXRControls * { all: revert; font-family: sans-serif }");
  const a = document.createElement("div");
  a.id = "LookingGlassWebXRControls", a.style.position = "fixed", a.style.zIndex = "1000", a.style.padding = "15px", a.style.width = "320px", a.style.maxWidth = "calc(100vw - 18px)", a.style.maxHeight = "calc(100vh - 18px)", a.style.whiteSpace = "nowrap", a.style.background = "rgba(0, 0, 0, 0.6)", a.style.color = "white", a.style.borderRadius = "10px", a.style.right = "15px", a.style.bottom = "15px";
  const n = document.createElement("div");
  a.appendChild(n), n.style.width = "100%", n.style.textAlign = "center", n.style.fontWeight = "bold", n.innerText = "Looking Glass Controls ";
  const f = document.createElement("div");
  a.appendChild(f), f.style.width = "100%", f.style.whiteSpace = "normal", f.style.color = "rgba(255,255,255,0.7)", f.style.fontSize = "14px", f.style.margin = "5px 0", f.innerHTML = "Click the popup and use WASD, mouse left/right drag, and scroll.";
  const c = document.createElement("input");
  n.appendChild(c), c.type = "button", c.value = "\u2190", c.dataset.otherValue = "\u2192", c.onclick = () => {
    [a.style.right, a.style.left] = [a.style.left, a.style.right], [c.value, c.dataset.otherValue] = [c.dataset.otherValue || "", c.value];
  };
  const l = document.createElement("div");
  a.appendChild(l);
  const o = (i, h, u) => {
    const s = u.stringify, v = document.createElement("div");
    v.style.marginBottom = "8px", l.appendChild(v);
    const y = i, R = t[i], p = document.createElement("label");
    if (v.appendChild(p), p.innerText = u.label, p.setAttribute("for", y), p.style.width = "100px", p.style.display = "inline-block", p.style.textDecoration = "dotted underline 1px", p.style.fontFamily = '"Courier New"', p.style.fontSize = "13px", p.style.fontWeight = "bold", p.title = u.title, h.type !== "checkbox") {
      const m = document.createElement("input");
      v.appendChild(m), m.type = "button", m.value = "\u238C", m.alt = "reset", m.title = "Reset value to default", m.style.padding = "0 4px", m.onclick = (T) => {
        d.value = R, d.oninput(T);
      };
    }
    const d = document.createElement("input");
    v.appendChild(d), Object.assign(d, h), d.id = y, d.title = u.title, d.value = h.value !== void 0 ? h.value : R;
    const k = (m) => {
      t[i] = m, G(m);
    };
    d.oninput = () => {
      const m = h.type === "range" ? parseFloat(d.value) : h.type === "checkbox" ? d.checked : d.value;
      k(m);
    };
    const N = (m) => {
      let T = m(t[i]);
      u.fixRange && (T = u.fixRange(T), d.max = Math.max(parseFloat(d.max), T).toString(), d.min = Math.min(parseFloat(d.min), T).toString()), d.value = T, k(T);
    };
    h.type === "range" && (d.style.width = "110px", d.style.height = "8px", d.onwheel = (m) => {
      N((T) => T + Math.sign(m.deltaX - m.deltaY) * h.step);
    });
    let G = (m) => {
    };
    if (s) {
      const m = document.createElement("span");
      m.style.fontFamily = '"Courier New"', m.style.fontSize = "13px", m.style.marginLeft = "3px", v.appendChild(m), G = (T) => {
        m.innerHTML = s(T);
      }, G(R);
    }
    return N;
  };
  o("tileHeight", { type: "range", min: 160, max: 455, step: 1 }, {
    label: "resolution",
    title: "resolution of each view",
    stringify: (i) => `${(i * t.aspect).toFixed()}&times;${i.toFixed()}`
  }), o("numViews", { type: "range", min: 1, max: 145, step: 1 }, {
    label: "views",
    title: "number of different viewing angles to render",
    stringify: (i) => i.toFixed()
  });
  const D = o("trackballX", {
    type: "range",
    min: -Math.PI,
    max: 1.0001 * Math.PI,
    step: 0.5 / 180 * Math.PI
  }, {
    label: "trackball x",
    title: "camera trackball x",
    fixRange: (i) => (i + Math.PI * 3) % (Math.PI * 2) - Math.PI,
    stringify: (i) => `${(i / Math.PI * 180).toFixed()}&deg;`
  }), x = o("trackballY", {
    type: "range",
    min: -0.5 * Math.PI,
    max: 0.5001 * Math.PI,
    step: 1 / 180 * Math.PI
  }, {
    label: "trackball y",
    title: "camera trackball y",
    fixRange: (i) => Math.max(-0.5 * Math.PI, Math.min(i, 0.5 * Math.PI)),
    stringify: (i) => `${(i / Math.PI * 180).toFixed()}&deg;`
  }), _ = o("targetX", { type: "range", min: -20, max: 20, step: 0.1 }, {
    label: "target x",
    title: "target position x",
    fixRange: (i) => i,
    stringify: (i) => i.toFixed(2) + " m"
  }), V = o("targetY", { type: "range", min: -20, max: 20, step: 0.1 }, {
    label: "target y",
    title: "target position y",
    fixRange: (i) => i,
    stringify: (i) => i.toFixed(2) + " m"
  }), C = o("targetZ", { type: "range", min: -20, max: 20, step: 0.1 }, {
    label: "target z",
    title: "target position z",
    fixRange: (i) => i,
    stringify: (i) => i.toFixed(2) + " m"
  });
  o("fovy", {
    type: "range",
    min: 1 / 180 * Math.PI,
    max: 120.1 / 180 * Math.PI,
    step: 1 / 180 * Math.PI
  }, {
    label: "fov",
    title: "perspective fov (degrades stereo effect)",
    fixRange: (i) => Math.max(1 / 180 * Math.PI, Math.min(i, 120.1 / 180 * Math.PI)),
    stringify: (i) => {
      const h = i / Math.PI * 180, u = Math.atan(Math.tan(i / 2) * t.aspect) * 2 / Math.PI * 180;
      return `${h.toFixed()}&deg;&times;${u.toFixed()}&deg;`;
    }
  }), o("depthiness", { type: "range", min: 0, max: 2, step: 0.01 }, {
    label: "depthiness",
    title: 'exaggerates depth by multiplying the width of the view cone (as reported by the firmware) - can somewhat compensate for depthiness lost using higher fov. 1.25 seems to be most physically accurate on Looking Glass 8.9".',
    fixRange: (i) => Math.max(0, i),
    stringify: (i) => `${i.toFixed(2)}x`
  }), o("inlineView", { type: "range", min: 0, max: 2, step: 1 }, {
    label: "inline view",
    title: "what to show inline on the original canvas (swizzled = no overwrite)",
    fixRange: (i) => Math.max(0, Math.min(i, 2)),
    stringify: (i) => i === 0 ? "swizzled" : i === 1 ? "center" : i === 2 ? "quilt" : "?"
  }), r.oncontextmenu = (i) => {
    i.preventDefault();
  }, r.addEventListener("wheel", (i) => {
    const h = t.targetDiam, u = 1.1, s = Math.log(h) / Math.log(u);
    return t.targetDiam = Math.pow(u, s + i.deltaY * 0.01);
  }), r.addEventListener("mousemove", (i) => {
    const h = i.movementX, u = -i.movementY;
    if (i.buttons & 2 || i.buttons & 1 && (i.shiftKey || i.ctrlKey)) {
      const s = t.trackballX, v = t.trackballY, y = -Math.cos(s) * h + Math.sin(s) * Math.sin(v) * u, R = -Math.cos(v) * u, p = Math.sin(s) * h + Math.cos(s) * Math.sin(v) * u;
      _((d) => d + y * t.targetDiam * 1e-3), V((d) => d + R * t.targetDiam * 1e-3), C((d) => d + p * t.targetDiam * 1e-3);
    } else
      i.buttons & 1 && (D((s) => s - h * 0.01), x((s) => s - u * 0.01));
  });
  const b = { w: 0, a: 0, s: 0, d: 0 };
  r.addEventListener("keydown", (i) => {
    switch (i.code) {
      case "KeyW":
        b.w = 1;
        break;
      case "KeyA":
        b.a = 1;
        break;
      case "KeyS":
        b.s = 1;
        break;
      case "KeyD":
        b.d = 1;
        break;
    }
  }), r.addEventListener("keyup", (i) => {
    switch (i.code) {
      case "KeyW":
        b.w = 0;
        break;
      case "KeyA":
        b.a = 0;
        break;
      case "KeyS":
        b.s = 0;
        break;
      case "KeyD":
        b.d = 0;
        break;
    }
  }), requestAnimationFrame(g);
  function g() {
    let i = b.d - b.a, h = b.w - b.s;
    i && h && (i *= Math.sqrt(0.5), h *= Math.sqrt(0.5));
    const u = t.trackballX, s = t.trackballY, v = Math.cos(u) * i - Math.sin(u) * Math.cos(s) * h, y = -Math.sin(s) * h, R = -Math.sin(u) * i - Math.cos(u) * Math.cos(s) * h;
    _((p) => p + v * t.targetDiam * 0.03), V((p) => p + y * t.targetDiam * 0.03), C((p) => p + R * t.targetDiam * 0.03), requestAnimationFrame(g);
  }
  return a;
}
const I = Symbol("LookingGlassXRWebGLLayer");
class ve extends fe {
  constructor(t, e, a) {
    super(t, e, a);
    const n = document.createElement("canvas");
    n.tabIndex = 0;
    const f = n.getContext("2d", { alpha: !1 });
    n.addEventListener("dblclick", function() {
      this.requestFullscreen();
    });
    const c = be(n), l = A(), o = this[me].config, D = e.createTexture();
    let x, _;
    const V = e.createFramebuffer(), C = e.enable.bind(e), b = e.disable.bind(e), g = e.getExtension("OES_vertex_array_object"), F = 34229, i = g ? g.bindVertexArrayOES.bind(g) : e.bindVertexArray.bind(e);
    (o.depth || o.stencil) && (o.depth && o.stencil ? _ = {
      format: e.DEPTH_STENCIL,
      attachment: e.DEPTH_STENCIL_ATTACHMENT
    } : o.depth ? _ = {
      format: e.DEPTH_COMPONENT16,
      attachment: e.DEPTH_ATTACHMENT
    } : o.stencil && (_ = {
      format: e.STENCIL_INDEX8,
      attachment: e.STENCIL_ATTACHMENT
    }), x = e.createRenderbuffer());
    const h = () => {
      const w = e.getParameter(e.TEXTURE_BINDING_2D);
      if (e.bindTexture(e.TEXTURE_2D, D), e.texImage2D(e.TEXTURE_2D, 0, e.RGBA, l.framebufferWidth, l.framebufferHeight, 0, e.RGBA, e.UNSIGNED_BYTE, null), e.texParameteri(e.TEXTURE_2D, e.TEXTURE_MIN_FILTER, e.LINEAR), e.bindTexture(e.TEXTURE_2D, w), x) {
        const S = e.getParameter(e.RENDERBUFFER_BINDING);
        e.bindRenderbuffer(e.RENDERBUFFER, x), e.renderbufferStorage(e.RENDERBUFFER, _.format, l.framebufferWidth, l.framebufferHeight), e.bindRenderbuffer(e.RENDERBUFFER, S);
      }
    };
    h(), l.addEventListener("on-config-changed", h);
    const u = e.getParameter(e.FRAMEBUFFER_BINDING);
    e.bindFramebuffer(e.FRAMEBUFFER, V), e.framebufferTexture2D(e.FRAMEBUFFER, e.COLOR_ATTACHMENT0, e.TEXTURE_2D, D, 0), (o.depth || o.stencil) && e.framebufferRenderbuffer(e.FRAMEBUFFER, _.attachment, e.RENDERBUFFER, x), e.bindFramebuffer(e.FRAMEBUFFER, u);
    const s = e.createProgram(), v = e.createShader(e.VERTEX_SHADER);
    e.attachShader(s, v);
    const y = e.createShader(e.FRAGMENT_SHADER);
    e.attachShader(s, y);
    {
      const w = `
       attribute vec2 a_position;
       varying vec2 v_texcoord;
       void main() {
         gl_Position = vec4(a_position * 2.0 - 1.0, 0.0, 1.0);
         v_texcoord = a_position;
       }
     `;
      e.shaderSource(v, w), e.compileShader(v), e.getShaderParameter(v, e.COMPILE_STATUS) || console.warn(e.getShaderInfoLog(v));
    }
    let R, p, d;
    const k = () => {
      const w = he(l);
      if (w === R)
        return;
      if (R = w, e.shaderSource(y, w), e.compileShader(y), !e.getShaderParameter(y, e.COMPILE_STATUS)) {
        console.warn(e.getShaderInfoLog(y));
        return;
      }
      if (e.linkProgram(s), !e.getProgramParameter(s, e.LINK_STATUS)) {
        console.warn(e.getProgramInfoLog(s));
        return;
      }
      p = e.getAttribLocation(s, "a_position"), d = e.getUniformLocation(s, "u_viewType");
      const S = e.getUniformLocation(s, "u_texture"), B = e.getParameter(e.CURRENT_PROGRAM);
      e.useProgram(s), e.uniform1i(S, 0), e.useProgram(B);
    };
    l.addEventListener("on-config-changed", k);
    const N = g ? g.createVertexArrayOES() : e.createVertexArray(), G = e.createBuffer(), m = e.getParameter(e.ARRAY_BUFFER_BINDING), T = e.getParameter(F);
    i(N), e.bindBuffer(e.ARRAY_BUFFER, G), e.bufferData(e.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]), e.STATIC_DRAW), e.enableVertexAttribArray(p), e.vertexAttribPointer(p, 2, e.FLOAT, !1, 0, 0), i(T), e.bindBuffer(e.ARRAY_BUFFER, m);
    const q = () => {
      console.assert(this[I].LookingGlassEnabled), e.bindFramebuffer(e.FRAMEBUFFER, this.framebuffer);
      const w = e.getParameter(e.COLOR_CLEAR_VALUE), S = e.getParameter(e.DEPTH_CLEAR_VALUE), B = e.getParameter(e.STENCIL_CLEAR_VALUE);
      e.clearColor(0, 0, 0, 0), e.clearDepth(1), e.clearStencil(0), e.clear(e.DEPTH_BUFFER_BIT | e.COLOR_BUFFER_BIT | e.STENCIL_BUFFER_BIT), e.clearColor(w[0], w[1], w[2], w[3]), e.clearDepth(S), e.clearStencil(B);
    }, M = e.canvas;
    let W, O;
    const j = () => {
      if (!this[I].LookingGlassEnabled)
        return;
      (M.width !== l.calibration.screenW.value || M.height !== l.calibration.screenH.value) && (console.log("warning, the canvas is not the correct size!"), console.log("app", M.width, "width", M.height, "height"), console.log("looking glass", n.width, "width", n.height, "height"), W = M.width, O = M.height, M.width = l.calibration.screenW.value, M.height = l.calibration.screenH.value, console.log("new width and height", M.width, "width", M.height, "height"));
      const w = e.getParameter(F), S = e.getParameter(e.CULL_FACE), B = e.getParameter(e.BLEND), $ = e.getParameter(e.DEPTH_TEST), Z = e.getParameter(e.STENCIL_TEST), Q = e.getParameter(e.SCISSOR_TEST), J = e.getParameter(e.VIEWPORT), ee = e.getParameter(e.FRAMEBUFFER_BINDING), te = e.getParameter(e.RENDERBUFFER_BINDING), ie = e.getParameter(e.CURRENT_PROGRAM), ne = e.getParameter(e.ACTIVE_TEXTURE);
      {
        const ae = e.getParameter(e.TEXTURE_BINDING_2D);
        e.bindFramebuffer(e.FRAMEBUFFER, null), e.useProgram(s), i(N), e.activeTexture(e.TEXTURE0), e.bindTexture(e.TEXTURE_2D, D), e.disable(e.BLEND), e.disable(e.CULL_FACE), e.disable(e.DEPTH_TEST), e.disable(e.STENCIL_TEST), e.viewport(0, 0, e.drawingBufferWidth, e.drawingBufferHeight), e.uniform1i(d, 0), e.drawArrays(e.TRIANGLES, 0, 6), f == null || f.clearRect(0, 0, n.width, n.height), f == null || f.drawImage(M, 0, 0), l.inlineView !== 0 && (e.uniform1i(d, l.inlineView), e.drawArrays(e.TRIANGLES, 0, 6)), e.bindTexture(e.TEXTURE_2D, ae);
      }
      e.activeTexture(ne), e.useProgram(ie), e.bindRenderbuffer(e.RENDERBUFFER, te), e.bindFramebuffer(e.FRAMEBUFFER, ee), e.viewport(...J), (Q ? C : b)(e.SCISSOR_TEST), (Z ? C : b)(e.STENCIL_TEST), ($ ? C : b)(e.DEPTH_TEST), (B ? C : b)(e.BLEND), (S ? C : b)(e.CULL_FACE), i(w);
    };
    let P;
    window.addEventListener("unload", () => {
      P && P.close(), P = void 0;
    });
    const K = (w, S) => {
      var B;
      !!P != w && (w ? (k(), n.style.position = "fixed", n.style.top = "0", n.style.left = "0", n.style.width = "100%", n.style.height = "100%", n.width = l.calibration.screenW.value, n.height = l.calibration.screenH.value, document.body.appendChild(c), P = window.open("", void 0, "width=640,height=360"), P.document.title = "Looking Glass Window (fullscreen me on Looking Glass!)", P.document.body.style.background = "black", P.document.body.appendChild(n), console.assert(S), P.onbeforeunload = S) : ((B = c.parentElement) == null || B.removeChild(c), M.width = W, M.height = O, P.onbeforeunload = void 0, P.close(), P = void 0));
    };
    this[I] = {
      LookingGlassEnabled: !1,
      framebuffer: V,
      clearFramebuffer: q,
      blitTextureToDefaultFramebufferIfNeeded: j,
      moveCanvasToWindow: K
    };
  }
  get framebuffer() {
    return this[I].LookingGlassEnabled ? this[I].framebuffer : null;
  }
  get framebufferWidth() {
    return A().framebufferWidth;
  }
  get framebufferHeight() {
    return A().framebufferHeight;
  }
}
class Ee extends de {
  constructor(t) {
    super(t), this.sessions = /* @__PURE__ */ new Map(), this.viewSpaces = [], this.basePoseMatrix = E.create(), this.inlineProjectionMatrix = E.create(), this.inlineInverseViewMatrix = E.create(), this.LookingGlassProjectionMatrices = [], this.LookingGlassInverseViewMatrices = [];
  }
  onBaseLayerSet(t, e) {
    const a = this.sessions.get(t);
    a.baseLayer = e;
    const n = e[I];
    n.LookingGlassEnabled = a.immersive, a.immersive && n.moveCanvasToWindow(!0, () => {
      this.endSession(t);
    });
  }
  isSessionSupported(t) {
    return t === "inline" || t === "immersive-vr";
  }
  isFeatureSupported(t) {
    switch (t) {
      case "viewer":
        return !0;
      case "local":
        return !0;
      case "local-floor":
        return !0;
      case "bounded-floor":
        return !1;
      case "unbounded":
        return !1;
      default:
        return console.warn("LookingGlassXRDevice.isFeatureSupported: feature not understood:", t), !1;
    }
  }
  async requestSession(t, e) {
    if (!this.isSessionSupported(t))
      return Promise.reject();
    const a = t !== "inline", n = new we(t, e);
    return this.sessions.set(n.id, n), a && this.dispatchEvent("@@webxr-polyfill/vr-present-start", n.id), Promise.resolve(n.id);
  }
  requestAnimationFrame(t) {
    return this.global.requestAnimationFrame(t);
  }
  cancelAnimationFrame(t) {
    this.global.cancelAnimationFrame(t);
  }
  onFrameStart(t, e) {
    const a = this.sessions.get(t), n = A();
    if (a.immersive) {
      const f = Math.tan(0.5 * n.fovy), c = 0.5 * n.targetDiam / f, l = c - n.targetDiam, o = this.basePoseMatrix;
      E.fromTranslation(o, [n.targetX, n.targetY, n.targetZ]), E.rotate(o, o, n.trackballX, [0, 1, 0]), E.rotate(o, o, -n.trackballY, [1, 0, 0]), E.translate(o, o, [0, 0, c]);
      for (let x = 0; x < n.numViews; ++x) {
        const _ = (x + 0.5) / n.numViews - 0.5, V = Math.tan(n.viewCone * _), C = c * V, b = this.LookingGlassInverseViewMatrices[x] = this.LookingGlassInverseViewMatrices[x] || E.create();
        E.translate(b, o, [C, 0, 0]), E.invert(b, b);
        const g = Math.max(l + e.depthNear, 0.01), F = l + e.depthFar, i = g * f, h = i, u = -i, s = g * -V, v = n.aspect * i, y = s + v, R = s - v, p = this.LookingGlassProjectionMatrices[x] = this.LookingGlassProjectionMatrices[x] || E.create();
        E.set(p, 2 * g / (y - R), 0, 0, 0, 0, 2 * g / (h - u), 0, 0, (y + R) / (y - R), (h + u) / (h - u), -(F + g) / (F - g), -1, 0, 0, -2 * F * g / (F - g), 0);
      }
      a.baseLayer[I].clearFramebuffer();
    } else {
      const f = a.baseLayer.context, c = f.drawingBufferWidth / f.drawingBufferHeight;
      E.perspective(this.inlineProjectionMatrix, e.inlineVerticalFieldOfView, c, e.depthNear, e.depthFar), E.fromTranslation(this.basePoseMatrix, [0, U, 0]), E.invert(this.inlineInverseViewMatrix, this.basePoseMatrix);
    }
  }
  onFrameEnd(t) {
    this.sessions.get(t).baseLayer[I].blitTextureToDefaultFramebufferIfNeeded();
  }
  async requestFrameOfReferenceTransform(t, e) {
    const a = E.create();
    switch (t) {
      case "viewer":
      case "local":
        return E.fromTranslation(a, [0, -U, 0]), a;
      case "local-floor":
        return a;
      default:
        throw new Error("XRReferenceSpaceType not understood");
    }
  }
  endSession(t) {
    const e = this.sessions.get(t);
    e.immersive && e.baseLayer && (e.baseLayer[I].moveCanvasToWindow(!1), this.dispatchEvent("@@webxr-polyfill/vr-present-end", t)), e.ended = !0;
  }
  doesSessionSupportReferenceSpace(t, e) {
    const a = this.sessions.get(t);
    return a.ended ? !1 : a.enabledFeatures.has(e);
  }
  getViewSpaces(t) {
    if (t === "immersive-vr") {
      const e = A();
      for (let a = this.viewSpaces.length; a < e.numViews; ++a)
        this.viewSpaces[a] = new ye(a);
      return this.viewSpaces.length = e.numViews, this.viewSpaces;
    }
  }
  getViewport(t, e, a, n, f) {
    if (f === void 0) {
      const l = this.sessions.get(t).baseLayer.context;
      n.x = 0, n.y = 0, n.width = l.drawingBufferWidth, n.height = l.drawingBufferHeight;
    } else {
      const c = A(), l = f % c.quiltWidth, o = Math.floor(f / c.quiltWidth);
      n.x = c.tileWidth * l, n.y = c.tileHeight * o, n.width = c.tileWidth, n.height = c.tileHeight;
    }
    return !0;
  }
  getProjectionMatrix(t, e) {
    return e === void 0 ? this.inlineProjectionMatrix : this.LookingGlassProjectionMatrices[e] || E.create();
  }
  getBasePoseMatrix() {
    return this.basePoseMatrix;
  }
  getBaseViewMatrix() {
    return this.inlineInverseViewMatrix;
  }
  _getViewMatrixByIndex(t) {
    return this.LookingGlassInverseViewMatrices[t] = this.LookingGlassInverseViewMatrices[t] || E.create();
  }
  getInputSources() {
    return [];
  }
  getInputPose(t, e, a) {
    return null;
  }
  onWindowResize() {
  }
}
let ge = 0;
class we {
  constructor(t, e) {
    L(this, "mode");
    L(this, "immersive");
    L(this, "id");
    L(this, "baseLayer");
    L(this, "inlineVerticalFieldOfView");
    L(this, "ended");
    L(this, "enabledFeatures");
    this.mode = t, this.immersive = t === "immersive-vr" || t === "immersive-ar", this.id = ++ge, this.baseLayer = null, this.inlineVerticalFieldOfView = Math.PI * 0.5, this.ended = !1, this.enabledFeatures = e;
  }
}
class ye extends ue {
  constructor(e) {
    super();
    L(this, "viewIndex");
    this.viewIndex = e;
  }
  get eye() {
    return "none";
  }
  _onPoseUpdate(e) {
    this._inverseBaseMatrix = e._getViewMatrixByIndex(this.viewIndex);
  }
}
class Ae extends ce {
  constructor(e) {
    super();
    L(this, "vrButton");
    L(this, "device");
    L(this, "isPresenting", !1);
    z(e), this.overrideDefaultVRButton(), console.warn('Looking Glass WebXR "polyfill" overriding native WebXR API.');
    for (const a in Y)
      this.global[a] = Y[a];
    this.global.XRWebGLLayer = ve, this.injected = !0, this.device = new Ee(this.global), this.xr = new oe(Promise.resolve(this.device)), Object.defineProperty(this.global.navigator, "xr", {
      value: this.xr,
      configurable: !0
    });
  }
  async overrideDefaultVRButton() {
    this.vrButton = await xe("VRButton"), this.vrButton && (this.device.addEventListener("@@webxr-polyfill/vr-present-start", () => {
      this.isPresenting = !0, this.updateVRButtonUI();
    }), this.device.addEventListener("@@webxr-polyfill/vr-present-end", () => {
      this.isPresenting = !1, this.updateVRButtonUI();
    }), this.vrButton.addEventListener("click", (e) => {
      this.updateVRButtonUI();
    }), this.updateVRButtonUI());
  }
  async updateVRButtonUI() {
    if (this.vrButton) {
      await Re(100), this.isPresenting ? this.vrButton.innerHTML = "EXIT LOOKING GLASS" : this.vrButton.innerHTML = "ENTER LOOKING GLASS";
      const e = 220;
      this.vrButton.style.width = `${e}px`, this.vrButton.style.left = `calc(50% - ${e / 2}px)`;
    }
  }
  update(e) {
    z(e);
  }
}
async function xe(r) {
  return new Promise((t, e) => {
    const a = new MutationObserver(function(n) {
      n.forEach(function(f) {
        f.addedNodes.forEach(function(c) {
          const l = c;
          l.id == r && (t(l), a.disconnect());
        });
      });
    });
    a.observe(document.body, { subtree: !1, childList: !0 }), setTimeout(() => {
      a.disconnect(), e(`id:${r} not found`);
    }, 5e3);
  });
}
function Re(r) {
  return new Promise((t) => setTimeout(t, r));
}
const Ve = A();
export {
  Ve as LookingGlassConfig,
  Ae as LookingGlassWebXRPolyfill
};
