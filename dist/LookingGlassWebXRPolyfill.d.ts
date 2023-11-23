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
import WebXRPolyfill from "@lookingglass/webxr-polyfill/src/WebXRPolyfill";
import { ViewControlArgs } from "./LookingGlassConfig";
import LookingGlassXRDevice from "./LookingGlassXRDevice";
export declare class LookingGlassWebXRPolyfill extends WebXRPolyfill {
    private vrButton;
    device: LookingGlassXRDevice | undefined;
    /** 在Looking Glass中预览时, 设置为true */
    isPresenting: boolean;
    constructor(cfg?: Partial<ViewControlArgs>);
    static init(cfg?: Partial<ViewControlArgs>): Promise<void>;
    /**Load  the polyfill*/
    private loadPolyfill;
    /** 如果存在"Enter VR" 按钮, 则重写按钮 */
    private overrideDefaultVRButton;
    /** 修改vrbutton样式 */
    private updateVRButtonUI;
    update(cfg: Partial<ViewControlArgs>): void;
}
/**
 * Get the global Looking Glass Config.
 * This can be used to update any config value in realtime by setting it like follows
 * let config = LookingGlassConfig
 * config.trackballX = Math.PI / 2
 * ```
 */
export declare const LookingGlassConfig: import("./LookingGlassConfig").LookingGlassConfig;
