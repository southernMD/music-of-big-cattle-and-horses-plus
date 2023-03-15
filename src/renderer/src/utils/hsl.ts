function hsl (rgb:Array<number>) {
	const r:number = rgb[0] / 255;
	const g:number = rgb[1] / 255;
	const b:number = rgb[2] / 255;
	const min:number = Math.min(r, g, b);
	const max:number = Math.max(r, g, b);
	const delta:number= max - min;
	let h:number = 0;
	let s:number;

    if (r === max) {
		h = (g - b) / delta;
	} else if (g === max) {
		h = 2 + (b - r) / delta;
	} else if (b === max) {
		h = 4 + (r - g) / delta;
	}

	h = Math.min(h * 60, 360);

	if (h < 0) {
		h += 360;
	}

	const l:number = (min + max) / 2;

	if (max === min) {
		s = 0;
	} else if (l <= 0.5) {
		s = delta / (max + min);
	} else {
		s = delta / (2 - max - min);
	}

	return [h, s * 100, l * 100];
};

export {hsl}