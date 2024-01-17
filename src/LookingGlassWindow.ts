import { getLookingGlassConfig, LookingGlassConfig } from './LookingGlassConfig'
import { initLookingGlassControlGUI } from "./LookingGlassControls"

let controls

// this is the function responsible for opening the Looking Glass window and initializing the controls
/**
 * 打开预览框, 初始化交互控制
 * @param {boolean} enabled true-开启 false-销毁
 */
export const moveCanvasToWindow = (enabled: boolean, onbeforeunload) => {
	const cfg = getLookingGlassConfig()

	if (cfg.lkgCanvas == null) {
		console.warn('window placement called without a valid XR Session!')
		return
	}
	else if(enabled == false) {
	 	closeWindow(cfg, controls)
	}
	else {
		// initialize the Looking Glass Controls, pass references to both Canvas elements
		// 初始化lkg的控制器
		if (controls == null) {
			controls = initLookingGlassControlGUI() as Node
		}

		cfg.lkgCanvas.style.position = "fixed"
		cfg.lkgCanvas.style.bottom = "0"
		cfg.lkgCanvas.style.left = "0"

		cfg.lkgCanvas.width = cfg.calibration.screenW.value
		cfg.lkgCanvas.height = cfg.calibration.screenH.value

		document.body.appendChild(controls)

		// 获取浏览器 管理所有显示器上的窗口 的权限
		const screenPlacement = "getScreenDetails" in window
		console.log(screenPlacement, 'Screen placement API exists')
		try {
		} catch {
			console.log("user did not allow window placement, using normal popup instead")
		}
		if (screenPlacement) {
			// use chrome's screen placement to automatically position the window.
			// 使用谷歌浏览器的屏幕定位来自动将窗口定位到lkg屏幕上
			placeWindow(cfg.lkgCanvas, cfg, onbeforeunload)
		} else {
			// open a normal pop up window, user will need to move it to the Looking Glass
			// 使用原生的弹窗, 用户需要自己把窗口移动到lkg屏幕上
			openPopup(cfg, cfg.lkgCanvas, onbeforeunload)
		}
		// destroy the window
	}
}
// if chromium, use the Screen Placement API to automatically place the window in the correct location, compensate for address bar
// 如果是chromium 使用屏幕定位API来自定将窗口定位到正确的位置, 需要考虑地址栏
async function placeWindow(lkgCanvas: HTMLCanvasElement, config: LookingGlassConfig, onbeforeunload: any) {
	const screenDetails = await (window as any).getScreenDetails() // 获取所有显示器屏幕
	console.log(screenDetails)
	//temporary, grab the first monitor ID with "LKG" Todo: make more robust
	const LKG = screenDetails.screens.filter((screen) => screen.label.includes("LKG"))[0] // 查找是否存在lkg屏幕
	console.log(LKG, 'monitors')
	if (LKG === undefined) {
		console.log("no Looking Glass monitor detected - manually opening popup window")
		openPopup(config, lkgCanvas, onbeforeunload)
		return
	} else {
		console.log("monitor ID", LKG.label, "serial number", config.calibration)
		const features = [
			`left=${LKG.left}`,
			`top=${LKG.top}`,
			`width=${LKG.width}`,
			`height=${LKG.height}`,
			`menubar=no`,
			`toolbar=no`,
			`location=no`,
			`status=no`,
			`resizable=yes`,
			`scrollbars=no`,
			`fullscreenEnabled=true`,
		].join(",")
		config.popup = window.open("", "new", features)
		if (config.popup) {
			config.popup.document.body.style.background = "black"
			// ensure that the popup window is not zoomed
			config.popup.document.body.style.transform = "1.0"
			preventZoom(config)
			config.popup.document.body.appendChild(lkgCanvas)
			console.assert(onbeforeunload)
			config.popup.onbeforeunload = onbeforeunload
		}
	}
}

// 预览弹框
function openPopup(cfg: LookingGlassConfig, lkgCanvas: HTMLCanvasElement, onbeforeunload: any) {
	cfg.popup = window.open("", undefined, "width=640,height=360")
		if (cfg.popup) {
			cfg.popup.document.title = "Looking Glass Window (fullscreen me on Looking Glass!)"
			cfg.popup.document.body.style.background = "black"
			// ensure that the popup window is not zoomed
			cfg.popup.document.body.style.transform = "1.0"
			preventZoom(cfg)
			cfg.popup.document.body.appendChild(lkgCanvas)
			console.assert(onbeforeunload)
			cfg.popup.onbeforeunload = onbeforeunload
		}
	}

	// close the window and remove the controls
	function closeWindow(cfg: LookingGlassConfig, controls: any) {
		controls.parentElement?.removeChild(controls)
		// restore the original canvas size once an XR session has been exited
		// cfg.appCanvas.width = origWidth
		// cfg.appCanvas.height = origHeight
		if (cfg.popup) {
			cfg.popup.onbeforeunload = null
			cfg.popup.close()
			cfg.popup = null
		}
	}

	// prevent ctrl + and ctrl - on popup window

	function preventZoom(cfg) {
		if (cfg.popup) {
			cfg.popup.document.addEventListener("keydown", (e) => {
				if (e.ctrlKey && (e.key === "=" || e.key === "-" || e.key === "+")) {
					e.preventDefault()
				}
			})
		}
	}