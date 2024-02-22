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
    const session = this.sessions.get(sessionId); // 获取当前XR会话
    session.baseLayer = layer;
    const cfg = getLookingGlassConfig();

    // lkg layer
    const baseLayerPrivate = layer[LookingGlassXRWebGLLayer_PRIVATE];
    baseLayerPrivate.LookingGlassEnabled = session.immersive;
    if (session.immersive) {
      cfg.XRSession = this.sessions.get(sessionId)
      //create the window and pass in the session reference
      // 创建弹框并结束会话
      if (cfg.popup == null) {
        baseLayerPrivate.moveCanvasToWindow(true, () => {
          this.endSession(sessionId);
        });
      } else {
        console.warn('attempted to assign baselayer twice?')
      }
    }
  }

  /**
   * 判断当前会话是否支持传入的模式
   * @param mode inline - 内联呈现模式, 内容在常规2D网页中展示，但可能有基本的AR或VR效果
   *             immersive-vr - 沉浸式虚拟现实（VR）体验
   * @returns 
   */
  isSessionSupported(mode) {
    return mode === 'inline' || mode === 'immersive-vr';
  }

  /**
   * 判断当前会话是否支持传入XR特性描述符
   * @param featureDescriptor
   * 'viewer' 参考空间与用户的头部相关联，通常提供基本的旋转信息。
   * 'local' 和 'local-floor' 参考空间提供了用户相对于设备初始位置的位置和方向信息，其中 'local-floor' 还考虑到了地面高度基准。
   * 'bounded-floor' 和 'unbounded' 参考空间通常用于更大的追踪区域，允许用户在更大的物理空间内自由移动，但在这个实现中，这两种特性未被支持。
   * @returns
   */
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

  /**
   * 获取会话
   * @param mode 模式
   * @param enabledFeatures 支持的特性
   * @returns 
   */
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
    // 获取当前会话
    const session = this.sessions.get(sessionId);
    // 获取lkg配置
    const cfg = getLookingGlassConfig();
    // 如果会话是沉浸式vr
    if (session.immersive) {
      // 计算视场角(Field of View, FOV)垂直分量一半的正切值
      const tanHalfFovy = Math.tan(0.5 * cfg.fovy);
      // 计算焦距 目标直径的一半 与 tanHalfFovy 计算
      const focalDistance = 0.5 * cfg.targetDiam / tanHalfFovy;
      // 通过从焦距中减去目标的整个直径来计算 裁剪平面用来限制渲染到某个空间区域
      const clipPlaneBias = focalDistance - cfg.targetDiam;

      // 姿态矩阵
      const mPose = this.basePoseMatrix;
      // 平移
      mat4.fromTranslation(mPose, [cfg.targetX, cfg.targetY, cfg.targetZ]);
      // x轴旋转
      mat4.rotate(mPose, mPose, cfg.trackballX, [0, 1, 0]);
      // y轴旋转
      mat4.rotate(mPose, mPose, -cfg.trackballY, [1, 0, 0]);
      // z轴平移焦距距离
      mat4.translate(mPose, mPose, [0, 0, focalDistance]);

      // 宫格图矩阵计算
      for (let i = 0; i < cfg.numViews; ++i) {
        // 计算了当前摄像机/视图沿视角锥的相对位置
        // 这实际上是视图范围有多宽的度量。随着i从0到cfg.numViews - 1，这个比例从-0.5变化到0.5。
        const fractionAlongViewCone = (i + 0.5) / cfg.numViews - 0.5; // -0.5 < this < 0.5
        // 它基于其沿视角锥的位置计算当前摄像机的角度的正切值。这有助于确定多少偏移量来模拟从不同角度查看。
        const tanAngleToThisCamera = Math.tan(cfg.viewCone * fractionAlongViewCone);
        // 它使用角度的正切和预定义的focalDistance计算相机的平行偏移值
        const offsetAlongBaseline = focalDistance * tanAngleToThisCamera;

        // 视图矩阵 将基础姿态矩阵按照offsetAlongBaseline平移
        const mView = (this.LookingGlassInverseViewMatrices[i] = this.LookingGlassInverseViewMatrices[i] || mat4.create());
        mat4.translate(mView, mPose, [offsetAlongBaseline, 0, 0]);
        mat4.invert(mView, mView);

        // 投影矩阵
        // depthNear/Far are the distances from the view origin to the near/far planes.
        // l/r/t/b/n/f are as in the usual OpenGL perspective matrix formulation.

        // n 表示近裁剪面的距离，即视点到最近显示物体的距离。
        // f 表示远裁剪面的距离，即视点到最远显示物体的距离。
        // l, r, b, t 分别代表左、右、下、上裁剪面与视点的距离。这些值定义了视锥体的边界。
        // 近平面距离
        const n = Math.max(clipPlaneBias + renderState.depthNear, 0.01);
        // 远平面距离
        const f = clipPlaneBias + renderState.depthFar;
        // 根据近平面距离Y轴半径长度
        const halfYRange = n * tanHalfFovy;
        // 计算近平面上的投影视锥的顶部和底部
        const t = halfYRange, b = -halfYRange;
        // 确定视锥的左右边界，考虑相机的偏移以确保透视是正确的
        const midpointX = n * -tanAngleToThisCamera;
        const halfXRange = cfg.aspect * halfYRange;
        const r = midpointX + halfXRange, l = midpointX - halfXRange;
        // 将当前视点的投影矩阵保存到数组中
        const mProj = (this.LookingGlassProjectionMatrices[i] = this.LookingGlassProjectionMatrices[i] || mat4.create());
        // 设置投影矩阵的值
        mat4.set(mProj,
          // 控制了水平方向的缩放，保证图像的宽度适应视锥体的宽度。
          2 * n / (r - l), 0, 0, 0,
          // 控制了垂直方向的缩放，保证图像的高度适应视锥体的高度。
          0, 2 * n / (t - b), 0, 0,
          // 包含了透视除法的因子，这部分负责将3D坐标转换为2D屏幕坐标，同时根据深度调整大小，以创建远处物体看起来更小的透视效果。
          // -1 在此处是为了将视锥体内的物体坐标转换到标准化设备坐标（NDC）
          (r + l) / (r - l), (t + b) / (t - b), -(f + n) / (f - n), -1,
          // 主要用于深度值的线性变换，保证物体的深度值能够正确地映射到深度缓冲区。
          0, 0, -2 * f * n / (f - n), 0);
      }

      const baseLayerPrivate = session.baseLayer[LookingGlassXRWebGLLayer_PRIVATE];
      baseLayerPrivate.clearFramebuffer();
      //if session is not immersive, we need to set the projection matrix and view matrix for the inline session 
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

  onFrameEnd(sessionId) {
    const session = this.sessions.get(sessionId);
    session.baseLayer[LookingGlassXRWebGLLayer_PRIVATE].blitTextureToDefaultFramebufferIfNeeded();

    if (this.captureScreenshot && this.screenshotCallback) {
      this.screenshotCallback();
      this.captureScreenshot = false;
    }
  }

  // Looking Glass WebXR Library requires local to be set when requesting an XR session.
  // 需要在请求XR session时, 需要设置local
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

  /**
   * 结束会话
   * @param sessionId
   */
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
      // 确定当前视图索引绘制到多视点图中的位置
      target.x = (cfg.framebufferWidth / cfg.quiltWidth) * col;
      target.y = (cfg.framebufferHeight / cfg.quiltHeight) * row;
      target.width = cfg.framebufferWidth / cfg.quiltWidth;
      target.height = cfg.framebufferHeight / cfg.quiltHeight;
    }
    return true;
  }

  /**
   * 获取投影矩阵
   * @param _eye 
   * @param viewIndex 
   * @returns 
   */
  getProjectionMatrix(_eye, viewIndex) {
    if (viewIndex === undefined) { return this.inlineProjectionMatrix; }
    return this.LookingGlassProjectionMatrices[viewIndex] || mat4.create();
  }

  /**
   * 获取基础姿态矩阵
   * @returns 
   */
  getBasePoseMatrix() {
    return this.basePoseMatrix;
  }

  /**
   * 获取基础视图矩阵
   * @returns
   */
  getBaseViewMatrix() {
    // Only used for inline mode.
    return this.inlineInverseViewMatrix;
  }

  /**
   * 根据视点序号获取视图矩阵
   * @param viewIndex
   * @returns 
   */
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
