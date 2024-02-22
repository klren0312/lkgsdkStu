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
export default class LookingGlassXRDevice extends XRDevice {
    static instance: LookingGlassXRDevice | null;
    constructor(global: any);
    static getInstance(): LookingGlassXRDevice | null;
    onBaseLayerSet(sessionId: any, layer: any): void;
    /**
     * 判断当前会话是否支持传入的模式
     * @param mode inline - 内联呈现模式, 内容在常规2D网页中展示，但可能有基本的AR或VR效果
     *             immersive-vr - 沉浸式虚拟现实（VR）体验
     * @returns
     */
    isSessionSupported(mode: any): boolean;
    /**
     * 判断当前会话是否支持传入XR特性描述符
     * @param featureDescriptor
     * 'viewer' 参考空间与用户的头部相关联，通常提供基本的旋转信息。
     * 'local' 和 'local-floor' 参考空间提供了用户相对于设备初始位置的位置和方向信息，其中 'local-floor' 还考虑到了地面高度基准。
     * 'bounded-floor' 和 'unbounded' 参考空间通常用于更大的追踪区域，允许用户在更大的物理空间内自由移动，但在这个实现中，这两种特性未被支持。
     * @returns
     */
    isFeatureSupported(featureDescriptor: any): boolean;
    /**
     * 获取会话
     * @param mode 模式
     * @param enabledFeatures 支持的特性
     * @returns
     */
    requestSession(mode: any, enabledFeatures: any): Promise<any>;
    requestAnimationFrame(callback: any): any;
    cancelAnimationFrame(handle: any): void;
    onFrameStart(sessionId: any, renderState: any): void;
    onFrameEnd(sessionId: any): void;
    requestFrameOfReferenceTransform(type: any, _options: any): Promise<any>;
    /**
     * 结束会话
     * @param sessionId
     */
    endSession(sessionId: any): void;
    doesSessionSupportReferenceSpace(sessionId: any, type: any): any;
    getViewSpaces(mode: any): any[] | undefined;
    getViewport(sessionId: any, _eye: any, _layer: any, target: any, viewIndex: any): boolean;
    /**
     * 获取投影矩阵
     * @param _eye
     * @param viewIndex
     * @returns
     */
    getProjectionMatrix(_eye: any, viewIndex: any): any;
    /**
     * 获取基础姿态矩阵
     * @returns
     */
    getBasePoseMatrix(): any[];
    /**
     * 获取基础视图矩阵
     * @returns
     */
    getBaseViewMatrix(): any[];
    /**
     * 根据视点序号获取视图矩阵
     * @param viewIndex
     * @returns
     */
    _getViewMatrixByIndex(viewIndex: any): any;
    getInputSources(): never[];
    getInputPose(_inputSource: any, _coordinateSystem: any, _poseType: any): null;
    onWindowResize(): void;
}
