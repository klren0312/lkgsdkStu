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
    isSessionSupported(mode: any): boolean;
    isFeatureSupported(featureDescriptor: any): boolean;
    requestSession(mode: any, enabledFeatures: any): Promise<any>;
    requestAnimationFrame(callback: any): any;
    cancelAnimationFrame(handle: any): void;
    onFrameStart(sessionId: any, renderState: any): void;
    /**
   * 计算相机间距
   * @param {number} viewNums 视点数
   * @param {number} dz 相机到物体中心点距离
   * @param {number} deg 物体到左右两边相机的夹角
   * @returns
   */
    getCameraDis(viewNums: any, dz: any, deg: any): number;
    onFrameEnd(sessionId: any): void;
    requestFrameOfReferenceTransform(type: any, _options: any): Promise<any>;
    endSession(sessionId: any): void;
    doesSessionSupportReferenceSpace(sessionId: any, type: any): any;
    getViewSpaces(mode: any): any[] | undefined;
    getViewport(sessionId: any, _eye: any, _layer: any, target: any, viewIndex: any): boolean;
    getProjectionMatrix(_eye: any, viewIndex: any): any;
    getBasePoseMatrix(): any[];
    getBaseViewMatrix(): any[];
    _getViewMatrixByIndex(viewIndex: any): any;
    getInputSources(): never[];
    getInputPose(_inputSource: any, _coordinateSystem: any, _poseType: any): null;
    onWindowResize(): void;
}
