import React, { useState, useEffect } from 'react';
import { GameImagesContext, GameImagesContextValue } from './GameImagesContext';
import { boardImageSource, pieceImageSources } from './imageSources';

function handleError(this: HTMLImageElement) {
	alert('Error loading image ' + this.src);
}
function loadImage(source: string, onLoad: (img: HTMLImageElement) => void): void {
	let img = new Image();
	img.onload = () => onLoad(img);
	img.onerror = handleError;
	img.src = source;
}
function loadImages(sources: string[], onLoadCompletion: (images: HTMLImageElement[]) => void) {
	let counter = 0;
	let images: HTMLImageElement[] = [];
	function handleLoad() {
		counter++;
		if (counter === sources.length) onLoadCompletion(images);
	}
	for (let source of sources) {
		let img = new Image();
		img.onload = handleLoad;
		img.onerror = handleError;
		img.src = source;
		images.push(img);
	}
};

//+--------------------------------\--------------------------
//|	 	GameHistoryPageProvider    |
//\--------------------------------/--------------------------
const GameImagesProvider: React.FC = ({ children }) => {
	const [boardImage, setBoardImage] = useState<HTMLImageElement | null>(null);
	const [pieceImages, setPieceImages] = useState<HTMLImageElement[] | null>(null);

	useEffect(() => {
		loadImage(boardImageSource, (img) => setBoardImage(img));
		loadImages(pieceImageSources, (images) => {
			setPieceImages(images);
		})
	}, []);

	const value: GameImagesContextValue = {
		board: boardImage,
		pieces: pieceImages,
	}
	return (
		<GameImagesContext.Provider value={value}>
			{children}
		</GameImagesContext.Provider>
	);
}

export { GameImagesProvider };