/**
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import XRDevice from '@lookingglass/webxr-polyfill/src/devices/XRDevice';
import XRSpace from '@lookingglass/webxr-polyfill/src/api/XRSpace'
import { mat4, vec3 } from 'gl-matrix';
import { PRIVATE as LookingGlassXRWebGLLayer_PRIVATE } from './LookingGlassXRWebGLLayer';
import { DefaultEyeHeight, getLookingGlassConfig } from './LookingGlassConfig';

export default class LookingGlassXRDevice extends XRDevice {
  static instance: LookingGlassXRDevice | null = null;

  constructor(global) {
    super(global);

    this.sessions = new Map();

    this.viewSpaces = [];
    this.basePoseMatrix = mat4.create(); // 基础姿态矩阵
    this.inlineProjectionMatrix = mat4.create(); // 投影矩阵
    this.inlineInverseViewMatrix = mat4.create(); // 视图矩阵
    this.LookingGlassProjectionMatrices = []; // 预览窗口投影矩阵
    this.LookingGlassInverseViewMatrices = []; // 预览窗口视图矩阵
    this.captureScreenshot = false;
    this.screenshotCallback = null;

    if (!LookingGlassXRDevice.instance) {
      LookingGlassXRDevice.instance = this;
  }
}

  static getInstance() {
    return LookingGlassXRDevice.instance;
  }

  onBaseLayerSet(sessionId, layer) {
    const session = this.sessions.get(sessionId);
    session.baseLayer = layer;
    const cfg = getLookingGlassConfig();

    // lkg layer
    const baseLayerPrivate = layer[LookingGlassXRWebGLLayer_PRIVATE];
    baseLayerPrivate.LookingGlassEnabled = session.immersive;
    if (session.immersive) {
      cfg.XRSession = this.sessions.get(sessionId)
      //create the window and pass in the session reference
      if (cfg.popup == null) {
        baseLayerPrivate.moveCanvasToWindow(true, () => {
          this.endSession(sessionId);
        });
      } else {
        console.warn('attempted to assign baselayer twice?')
      }
    }
  }

  isSessionSupported(mode) {
    return mode === 'inline' || mode === 'immersive-vr';
  }

  isFeatureSupported(featureDescriptor) {
    switch (featureDescriptor) {
      case 'viewer': return true;
      case 'local': return true;
      case 'local-floor': return true;
      case 'bounded-floor': return false;
      case 'unbounded': return false;
      default:
        console.warn('LookingGlassXRDevice.isFeatureSupported: feature not understood:', featureDescriptor);
        return false;
    }
  }

  async requestSession(mode, enabledFeatures) {
    if (!this.isSessionSupported(mode)) {
      return Promise.reject();
    }
    const immersive = mode !== 'inline';
    const session = new Session(mode, enabledFeatures);
    this.sessions.set(session.id, session);
    if (immersive) {
      this.dispatchEvent('@@@lookingglass/webxr-polyfill/vr-present-start', session.id);
    }
    return Promise.resolve(session.id);
  }

  requestAnimationFrame(callback) {
    return this.global.requestAnimationFrame(callback);
  }

  cancelAnimationFrame(handle) {
    this.global.cancelAnimationFrame(handle);
  }

  onFrameStart(sessionId, renderState) {
    const session = this.sessions.get(sessionId);
    const cfg = getLookingGlassConfig();
    const dz = 10
    const dc = this.getCameraDis(48, dz, 52)
    if (session.immersive) {
      let index = 0
      for (let i = 0; i < cfg.numViews; ++i) {
        let currentX = -dc * 24 + index * dc
        if (currentX > dc * 24) {
            currentX = -dc * 24
            index = 0
        }
        const eye = vec3.fromValues(currentX, 0, dz)
        const center = vec3.fromValues(currentX, 0, 0)
        const up = vec3.fromValues(0, 1, 0)
        const mProj = (this.LookingGlassProjectionMatrices[i] = this.LookingGlassProjectionMatrices[i] || mat4.create());
        mat4.lookAt(mProj, eye, center, up)
        mat4.perspective(mProj, cfg.fovy, 1536 / 2048, 1, 20)
      }

      const baseLayerPrivate = session.baseLayer[LookingGlassXRWebGLLayer_PRIVATE];
      baseLayerPrivate.clearFramebuffer();
      // 如果会话不是沉浸式的，我们需要为内联会话设置投影矩阵和视图矩阵
      // Note: I think this breaks three.js when the session is ended. We should *try* to grab the camera position before entering the session if possible. 
    } else {
      const gl = session.baseLayer.context;

      // Projection
      const aspect = gl.drawingBufferWidth / gl.drawingBufferHeight;
      mat4.perspective(this.inlineProjectionMatrix, renderState.inlineVerticalFieldOfView, aspect,
        renderState.depthNear, renderState.depthFar);

      // View
      mat4.fromTranslation(this.basePoseMatrix, [0, DefaultEyeHeight, 0]);
      mat4.invert(this.inlineInverseViewMatrix, this.basePoseMatrix);
    }
  }
  /**
 * 计算相机间距
 * @param {number} viewNums 视点数
 * @param {number} dz 相机到物体中心点距离
 * @param {number} deg 物体到左右两边相机的夹角
 * @returns 
 */
  getCameraDis(viewNums, dz, deg) {
    const dr = 2 * dz * Math.tan((deg / 2) * Math.PI/180)
    const dc = dr / (viewNums - 1)
    return dc
  }

  onFrameEnd(sessionId) {
    const session = this.sessions.get(sessionId);
    // 贴图渲染
    session.baseLayer[LookingGlassXRWebGLLayer_PRIVATE].blitTextureToDefaultFramebufferIfNeeded();

    if (this.captureScreenshot && this.screenshotCallback) {
      this.screenshotCallback();
      this.captureScreenshot = false;
    }
  }
  // Looking Glass WebXR Library requires local to be set when requesting an XR session.
  // 需要在请求XR session时, 设置local
  async requestFrameOfReferenceTransform(type, _options) {
    const matrix = mat4.create();
    switch (type) {
      case 'viewer':
      case 'local':
        mat4.fromTranslation(matrix, [0, -DefaultEyeHeight, 0]);
        return matrix;
      case 'local-floor':
        return matrix;
      default:
        throw new Error('XRReferenceSpaceType not understood');
    }
  }

  endSession(sessionId) {
    const session = this.sessions.get(sessionId);
    if (session.immersive && session.baseLayer) {
      // 关闭窗口, 在会话结束时销毁控件
      session.baseLayer[LookingGlassXRWebGLLayer_PRIVATE].moveCanvasToWindow(false);
      this.dispatchEvent('@@@lookingglass/webxr-polyfill/vr-present-end', sessionId);
    }
    session.ended = true;
  }

  doesSessionSupportReferenceSpace(sessionId, type) {
    const session = this.sessions.get(sessionId);
    if (session.ended) {
      return false;
    }
    return session.enabledFeatures.has(type);
  }

  getViewSpaces(mode) {
    if (mode === 'immersive-vr') {
      const cfg = getLookingGlassConfig();

      // Fill up viewSpaces to the necessary size if it's too short.
      for (let i = this.viewSpaces.length; i < cfg.numViews; ++i) {
        this.viewSpaces[i] = new LookingGlassXRSpace(i);
      }
      // And trim it down if it's too long.
      this.viewSpaces.length = cfg.numViews;
      return this.viewSpaces;
    }

    return undefined;
  }

  // 获取当前视图, 并决定在多视点图哪个位置渲染他
  // get the current view and determine where on the quilt to render it. 
  getViewport(sessionId, _eye, _layer, target, viewIndex) {
    if (viewIndex === undefined) {
      const session = this.sessions.get(sessionId);
      const gl = session.baseLayer.context;

      target.x = 0;
      target.y = 0;
      target.width = gl.drawingBufferWidth;
      target.height = gl.drawingBufferHeight;
    } else {
      const cfg = getLookingGlassConfig();
      const col = viewIndex % cfg.quiltWidth;
      const row = Math.floor(viewIndex / cfg.quiltWidth);
      // determine where to draw the current viewIndex to in the quilt
      target.x = (cfg.framebufferWidth / cfg.quiltWidth) * col;
      target.y = (cfg.framebufferHeight / cfg.quiltHeight) * row;
      target.width = cfg.framebufferWidth / cfg.quiltWidth;
      target.height = cfg.framebufferHeight / cfg.quiltHeight;
    }
    return true;
  }

  getProjectionMatrix(_eye, viewIndex) {
    if (viewIndex === undefined) { return this.inlineProjectionMatrix; }
    return this.LookingGlassProjectionMatrices[viewIndex] || mat4.create();
  }

  getBasePoseMatrix() {
    return this.basePoseMatrix;
  }

  getBaseViewMatrix() {
    // Only used for inline mode.
    return this.inlineInverseViewMatrix;
  }

  _getViewMatrixByIndex(viewIndex) {
    return (this.LookingGlassInverseViewMatrices[viewIndex] = this.LookingGlassInverseViewMatrices[viewIndex] || mat4.create());
  }

  getInputSources() { return []; }

  getInputPose(_inputSource, _coordinateSystem, _poseType) { return null; }

  onWindowResize() { }
};

let SESSION_ID = 0;
class Session {
	public mode: any;
	public immersive: boolean; // 是否沉浸式
	public id: any;
	public baseLayer: any;
	public inlineVerticalFieldOfView: number
  public ended: boolean
  public enabledFeatures: any

	constructor(mode, enabledFeatures) {
		this.mode = mode;
		this.immersive = mode === "immersive-vr" || mode === "immersive-ar";
		this.id = ++SESSION_ID;
		this.baseLayer = null;
		this.inlineVerticalFieldOfView = Math.PI * 0.5;
		this.ended = false;
		this.enabledFeatures = enabledFeatures;
	}
}

class LookingGlassXRSpace extends XRSpace {
  public viewIndex:any
  constructor(viewIndex) {
    super();
    this.viewIndex = viewIndex;
  }

  get eye() { return 'none'; }

  _onPoseUpdate(device) {
    this._inverseBaseMatrix = device._getViewMatrixByIndex(this.viewIndex);
  }
}
