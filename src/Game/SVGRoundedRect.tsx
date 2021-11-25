function getLineLength(fullLength: number, r: number, round1: boolean, round2: boolean) {
	if (!round1 && !round2)
		return fullLength;
	else if (round1 && round2)
		return fullLength - (2.0 * r);
	else
		return fullLength - r;
}

type SVGRoundedRectProps = {
	x?: number;
	y?: number;
	w: number;
	h: number;
	rx?: number;
	ry?: number;
	fill?: string;
	roundTL?: boolean;
	roundTR?: boolean;
	roundBR?: boolean;
	roundBL?: boolean;
};
const SVGRoundedRect: React.FC<SVGRoundedRectProps> = ({ x = 0, y = 0, w, h, rx = 0, ry = 0, fill = 'black',
	roundTL = false, roundTR = false, roundBR = false, roundBL = false }) => {
	const topLength = getLineLength(w, rx, roundTL, roundTR);
	const bottomLength = getLineLength(w, rx, roundBL, roundBR);
	const rightLength = getLineLength(h, ry, roundTR, roundBR);
	const leftLength = getLineLength(h, ry, roundBL, roundTL);

	// Starting point
	let d = '';
	if (roundTL)
		d = `M${x + rx},${y} `;
	else
		d = `M${x},${y} `;

	// Top line, top-right arc
	d += `h${topLength} `;
	if (roundTR)
		d += `a${rx},${ry} 0 0 1 ${rx},${ry} `;

	// Right line, bottom-right arc
	d += `v${rightLength} `;
	if (roundBR)
		d += `a${rx},${ry} 0 0 1 ${-rx},${ry} `;

	// Bottom line, bottom-left arc
	d += `h${-bottomLength} `;
	if (roundBL)
		d += `a${rx},${ry} 0 0 1 ${-rx},${-ry} `;

	// Left line, top-left arc
	d += `v${-leftLength} `;
	if (roundTL)
		d += `a${rx},${ry} 0 0 1 ${rx},${-ry} `;

	// Close path
	d += 'z';
	return <path d={d} fill={fill} />;
}

export { SVGRoundedRect };
