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
export declare const DefaultEyeHeight: number;
declare type Value = {
    value: number;
};
export declare type CalibrationArgs = {
    configVersion: string;
    pitch: Value;
    slope: Value;
    center: Value;
    viewCone: Value;
    invView: Value;
    verticalAngle: Value;
    DPI: Value;
    screenW: Value;
    screenH: Value;
    flipImageX: Value;
    flipImageY: Value;
    flipSubp: Value;
};
export declare type ViewControlArgs = {
    /**
     * defines the height of the individual quilt view, the width is then set based on the aspect ratio of the connected device.
     * @default 512
     */
    tileHeight: number;
    /**
     * defines the number of views to be rendered
     * @default 45
     */
    numViews: number;
    /** defines the rotation of the camera on the X-axis */
    trackballX: number;
    /** defines the rotation of the camera on the Y-axis */
    trackballY: number;
    /** defines the position of the camera on the x-axis */
    targetX: number;
    /** defines the position of the camera on the Y-axis */
    targetY: number;
    /** defines the position of the camera on the Z-axis */
    targetZ: number;
    /** defines the size of the camera, this makes your scene bigger or smaller without changing the focus. */
    targetDiam: number;
    /** defines the vertical FOV of your camera (defined in radians) */
    fovy: number;
    /** modifies to the view frustum to increase or decrease the perceived depth of the scene. */
    depthiness: number;
    /** changes how the original canvas on your main web page is displayed, can show the encoded subpixel matrix, a single centered view, or a quilt view. */
    inlineView: number;
};
declare type LookingGlassConfigEvent = "on-config-changed";
export declare class LookingGlassConfig extends EventTarget {
    private _calibration;
    private _viewControls;
    constructor(cfg?: Partial<ViewControlArgs>);
    private syncCalibration;
    addEventListener(type: LookingGlassConfigEvent, callback: EventListenerOrEventListenerObject | null, options?: boolean | AddEventListenerOptions | undefined): void;
    private onConfigChange;
    get calibration(): CalibrationArgs;
    set calibration(value: Partial<CalibrationArgs>);
    updateViewControls(value: Partial<ViewControlArgs> | undefined): void;
    /**
     * defines the height of the individual quilt view, the width is then set based on the aspect ratio of the connected device.
     */
    get tileHeight(): number;
    set tileHeight(v: number);
    /**
     * defines the number of views to be rendered
     */
    get numViews(): number;
    set numViews(v: number);
    /**
     * defines the position of the camera on the X-axis
     */
    get targetX(): number;
    set targetX(v: number);
    /**
     * defines the position of the camera on the Y-axis
     */
    get targetY(): number;
    set targetY(v: number);
    /**
     * defines the position of the camera on the X-axis
     */
    get targetZ(): number;
    set targetZ(v: number);
    /**
     * defines the rotation of the camera on the X-axis
     */
    get trackballX(): number;
    set trackballX(v: number);
    /**
     * defines the rotation of the camera on the Y-axis
     */
    get trackballY(): number;
    set trackballY(v: number);
    /**
     * defines the size of the camera, this makes your scene bigger or smaller without changing the focus.
     */
    get targetDiam(): number;
    set targetDiam(v: number);
    /**
     * defines the vertical FOV of your camera (defined in radians)
     */
    get fovy(): number;
    set fovy(v: number);
    /**
     * modifies to the view frustum to increase or decrease the perceived depth of the scene.
     */
    get depthiness(): number;
    set depthiness(v: number);
    /**
     * changes how the original canvas on your main web page is displayed, can show the encoded subpixel matrix, a single centered view, or a quilt view.
     */
    get inlineView(): number;
    set inlineView(v: number);
    get aspect(): number;
    get tileWidth(): number;
    get framebufferWidth(): number;
    get quiltWidth(): number;
    get quiltHeight(): number;
    get framebufferHeight(): number;
    get viewCone(): number;
    get tilt(): number;
    get subp(): number;
    get pitch(): number;
}
/** The global LookingGlassConfig */
export declare function getLookingGlassConfig(): LookingGlassConfig;
/** Update the global LookingGlassConfig's viewControls */
export declare function updateLookingGlassConfig(viewControls: Partial<ViewControlArgs> | undefined): void;
export {};
