import { LookingGlassConfig } from './LookingGlassConfig';
	// if chromium, use the Screen Placement API to automatically place the window in the correct location, compensate for address bar
	export async function placeWindow(lkgCanvas: HTMLCanvasElement, config: LookingGlassConfig, enabled: any, onbeforeunload: any) {
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