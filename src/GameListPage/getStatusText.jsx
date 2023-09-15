function getStatusText(status, name_w, name_b) {
	let statusText;
	switch (status) {
		case 'wait': statusText = 'Waiting'; break;
		case 'play': statusText = 'Playing'; break;
		case 'draw': statusText = 'Draw'; break;
		case 'stale': statusText = 'Draw (stalemate)'; break;
		case 'ins': statusText = 'Draw (insufficient material)'; break;
		case '3fold': statusText = 'Draw (three-fold repetition)'; break;
		case 'cm_w': statusText = <>Checkmate!<br />{name_w} wins</>; break;
		case 'cm_b': statusText = <>Checkmate!<br />{name_b} wins</>; break;
		case 'con_w': statusText = <>Conceded<br />{name_w} wins</>; break;
		case 'con_b': statusText = <>Conceded<br />{name_b} wins</>; break;
		default:
			statusText = '';
	}
	return statusText;
}

export { getStatusText };
