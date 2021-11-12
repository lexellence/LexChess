function getPieceImage(images: HTMLImageElement[] | null, team: 'w' | 'b', type: 'p' | 'n' | 'b' | 'r' | 'q' | 'k'): HTMLImageElement | null {
	if (!images || images.length < 12)
		return null;
	switch (type) {
		case 'k':
			return (team === 'w') ? images[0] : images[6];
		case 'q':
			return (team === 'w') ? images[1] : images[7];
		case 'b':
			return (team === 'w') ? images[2] : images[8];
		case 'n':
			return (team === 'w') ? images[3] : images[9];
		case 'r':
			return (team === 'w') ? images[4] : images[10];
		case 'p':
			return (team === 'w') ? images[5] : images[11];
	}
};

export { getPieceImage };