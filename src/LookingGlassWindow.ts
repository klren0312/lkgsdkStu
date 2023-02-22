import { LookingGlassConfig } from './LookingGlassConfig';
import { initLookingGlassControlGUI } from "./LookingGlassControls"


export const moveCanvasToWindow = (onbeforeunload, cfg: LookingGlassConfig, lkgCanvas: HTMLCanvasElement, appCanvas: HTMLCanvasElement, origWidth: number, origHeight: number) => {

	// initialize the Looking Glass Controls, pass references to both Canvas elements
	const controls = initLookingGlassControlGUI(lkgCanvas, appCanvas)

	lkgCanvas.style.position = "fixed"
	lkgCanvas.style.bottom = "0"
	lkgCanvas.style.left = "0"

	lkgCanvas.width = cfg.calibration.screenW.value
	lkgCanvas.height = cfg.calibration.screenH.value

	document.body.appendChild(controls)
	const screenPlacement = "getScreenDetails" in window
	console.log(screenPlacement, 'Screen placement API exists')
	try {
	} catch {
		console.log("user did not allow window placement, using normal popup instead")
	}
	if (screenPlacement) {
		// use chrome's screen placement to automatically position the window.
		placeWindow(lkgCanvas, cfg, onbeforeunload)
	} else {
		// open a normal pop up window, user will need to move it to the Looking Glass
		openPopup(cfg, lkgCanvas, onbeforeunload)
	}
		// destroy the window
	if (cfg.popup) {
		controls.parentElement?.removeChild(controls)
		// restore the original canvas size once an XR session has been exited
		appCanvas.width = origWidth
		appCanvas.height = origHeight
		if (cfg.popup) {
			cfg.popup.onbeforeunload = null
			cfg.popup.close()
			cfg.popup = null
		}
	}}
	// if chromium, use the Screen Placement API to automatically place the window in the correct location, compensate for address bar
	export async function placeWindow(lkgCanvas: HTMLCanvasElement, config: LookingGlassConfig, onbeforeunload: any) {
		const screenDetails = await (window as any).getScreenDetails() 
		console.log(screenDetails)
		//temporary, grab the first monitor ID with "LKG" Todo: make more robust
		const LKG = screenDetails.screens.filter((screen) => screen.label.includes("LKG"))[0]
		console.log(LKG, 'monitors')
		if (LKG === undefined) {
			console.log("no Looking Glass monitor detected - manually opening popup window")
			openPopup(config, lkgCanvas, onbeforeunload)
			return
		}
		else {
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
			config.popup.document.body.appendChild(lkgCanvas)
			console.assert(onbeforeunload)
			config.popup.onbeforeunload = onbeforeunload
		}
	}
	}

    // open a normal popup

	export async function openPopup(cfg: LookingGlassConfig, lkgCanvas: HTMLCanvasElement, onbeforeunload: any) {
		cfg.popup = window.open("", undefined, "width=640,height=360")
		if (cfg.popup) {
			cfg.popup.document.title = "Looking Glass Window (fullscreen me on Looking Glass!)"
			cfg.popup.document.body.style.background = "black"
			cfg.popup.document.body.appendChild(lkgCanvas)
			console.assert(onbeforeunload)
			cfg.popup.onbeforeunload = onbeforeunload
		}
	}