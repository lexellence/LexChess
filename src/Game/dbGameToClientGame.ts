function dbGameToClientGame(dbGame: any, gid: string, uid: string) {
	if (dbGame) {
		const game: any = {
			gid: gid,
			status: dbGame.status,
			name_w: dbGame.name_w,
			name_b: dbGame.name_b,
			name_d: dbGame.name_d,
			moves: dbGame.moves ? Object.values(dbGame.moves) : [],
		};

		// Add user's team
		switch (uid) {
			case dbGame.uid_w: game.team = 'w'; break;
			case dbGame.uid_b: game.team = 'b'; break;
			case dbGame.uid_d: game.team = 'd'; break;
			default: game.team = 'o';
		}

		return game;
	}
	else
		return null;
}

export { dbGameToClientGame };