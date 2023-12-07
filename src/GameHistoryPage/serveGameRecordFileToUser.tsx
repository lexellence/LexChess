import { date as dateFromKey } from 'firebase-key';

//+--------------------------------\--------------------------
//|	  serveGameRecordFileToUser    |
//\--------------------------------/--------------------------
function serveGameRecordFileToUser(gid: string, dbGame: any) {
    const filename = dbGame.name_w + ' vs ' + dbGame.name_b + ' ' + dateFromKey(gid).toString() + '.txt';;
    const content = gameToString(dbGame);

    serveFileToUser(filename, content);
}

//+--------------------------------\--------------------------
//|	    	 gameToString		   |
//\--------------------------------/--------------------------
function gameToString(dbGame: any): string {
    let gameString: string = '';

    // Add dates
    {
        let moveKeys: string[] = dbGame.moves ? Object.keys(dbGame.moves) : [];
        let gameStart = moveKeys.length > 0 ? dateFromKey(moveKeys[0]) : 'n/a';
        let gameEnd = moveKeys.length > 0 ? dateFromKey(moveKeys[moveKeys.length - 1]) : 'n/a';
        gameString += 'Start: ' + gameStart + '\n';
        gameString += 'End: ' + gameEnd + '\n';
    }

    // Add names
    gameString += 'White: ' + dbGame.name_w + '\n';
    gameString += 'Black: ' + dbGame.name_b + '\n';

    // Add result
    {
        const result = getGameResultString(dbGame.status, dbGame.name_w, dbGame.name_b);
        gameString += 'Result: ' + result + '\n';
    }

    // Add moves
    gameString += 'Moves: [';
    {
        let moveValues: string[] = dbGame.moves ? Object.values(dbGame.moves) : [];
        moveValues.forEach((move, i) => {
            gameString += move;
            const isNotLastMove = (i < moveValues.length - 1);
            if (isNotLastMove)
                gameString += ', ';
        });
    }
    gameString += ']\n';

    return gameString;
}

//+--------------------------------\--------------------------
//|	     getGameResultString	   |
//\--------------------------------/--------------------------
function getGameResultString(gameStatus: string, nameWhite: string, nameBlack: string) {
    switch (gameStatus) {
        case 'draw': return 'Draw'; break;
        case 'stale': return 'Draw (stalemate)'; break;
        case 'ins': return 'Draw (insufficient material)'; break;
        case '3fold': return 'Draw (three-fold repetition)'; break;
        case 'cm_w': return nameWhite + ' won (checkmate)'; break;
        case 'cm_b': return nameBlack + ' won (checkmate)'; break;
        case 'con_w': return nameWhite + ' won (concession)'; break;
        case 'con_b': return nameBlack + ' won (concession)'; break;
        default: return 'n/a'; break;
    }
}

//+--------------------------------\--------------------------
//|	 	    serveFileToUser  	   |
//\--------------------------------/--------------------------
function serveFileToUser(filename: string, fileContent: string) {
    const atag = document.createElement('a');
    const file = new Blob([fileContent], { type: 'text/plain' });
    atag.href = URL.createObjectURL(file);
    atag.download = filename;
    atag.click();
}

export { serveGameRecordFileToUser };

