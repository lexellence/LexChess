import React from 'react';
import FirebaseListenerContext, { FirebaseListenerContextValue } from './FirebaseListenerContext';
import Firebase, { withFirebase } from '../Firebase';
import { ValueNotifier, OnUpdateFunc, UnregisterFunc } from './Notifier';

//+----------------------------------\------------------------
//|	    FirebaseListenerProvider	 |
//\----------------------------------/
//	The provider of firebase data notifiers
//\-----------------------------------------------------------
type WithFirebaseListenerProviderProps = {
	firebase: Firebase;
	children: any;
}
class FirebaseListenerProvider extends React.Component<WithFirebaseListenerProviderProps> {
	authUser: any = null;
	gameNotifierMap: Map<string, ValueNotifier> = new Map<string, ValueNotifier>();	// key = gid, value = ChildAddedNotifier
	gameListeningGIDs: string[] = [];
	userNotifier: ValueNotifier = new ValueNotifier();
	gameListNotifier: ValueNotifier = new ValueNotifier();
	unregisterAuthListener = () => { };

	//+----------------------------------\------------------------
	//|	  		 Mount/Unmount			 |
	//\----------------------------------/------------------------
	componentDidMount() {
		this.startGameListListening();
		this.registerAuthListener();
	}
	componentWillUnmount() {
		this.unregisterAuthListener();
		this.stopAllListening();
	}
	registerAuthListener = () => {
		const onSignIn = (authUser: any) => {
			this.authUser = authUser;

			this.startUserListening();
		};
		const onSignOut = () => {
			// Stop user and games, but not game list
			this.stopUserListening();
			this.stopAllGameListening();
			this.gameNotifierMap.clear();

			this.authUser = null;
		};
		this.unregisterAuthListener = this.props.firebase.onAuthUserListener(onSignIn, onSignOut);
	}

	//+----------------------------------\------------------------
	//|	  Start/Stop Firebase Listeners	 |
	//\----------------------------------/------------------------
	startUserListening = () => {
		if (this.authUser?.uid)
			this.props.firebase?.userRef(this.authUser.uid).on('value', (snapshot) => {
				const user = snapshot.val();
				this.handleUserUpdate(user);
			});
	}
	stopUserListening = () => {
		if (this.authUser?.uid)
			this.props.firebase.userRef(this.authUser.uid).off();
	}
	startGameListListening = () => {
		this.props.firebase.db.ref('gameList').on('value', (snapshot) => {
			const gameList = snapshot.val();
			this.handleGameListUpdate(gameList);
		});
	}
	stopGameListListening = () => {
		this.props.firebase.db.ref('gameList').off();
	}
	startGameListening = (gid: string) => {
		if (!this.gameListeningGIDs.includes(gid)) {
			this.gameListeningGIDs.push(gid);
			this.props.firebase.db.ref(`games/${gid}/status`).once('value', (snapshot) => {
				if (!snapshot.exists())
					this.handleGameUpdate(gid, null);

				this.props.firebase.db.ref(`games/${gid}`).on('value', (snapshot) => {
					const game = snapshot.val();
					this.handleGameUpdate(gid, game);
				});
			});
		}
	}
	stopGameListening = (gid: string) => {
		if (this.gameListeningGIDs.includes(gid)) {
			this.props.firebase.db.ref(`games/${gid}`).off();
			this.gameListeningGIDs = this.gameListeningGIDs.filter(element => element !== gid);
		}
	}
	stopAllGameListening = () => {
		this.gameNotifierMap.forEach((gameNotifier, gid) => {
			this.stopGameListening(gid);
		});
	}
	stopAllListening = () => {
		this.stopUserListening();
		this.stopGameListListening();
		this.stopAllGameListening();
	}

	//+----------------------------------\------------------------
	//|	  		 User Update			 |
	//\----------------------------------/------------------------
	handleUserUpdate = (user: any) => {
		// Allow non-existant user object
		if (!user)
			user = {};

		// Convert to array of gid strings
		user.gidsPlay = user.gidsPlay ? Object.keys(user.gidsPlay) : [];
		user.gidsPast = user.gidsPast ? Object.keys(user.gidsPast) : [];

		this.trimInactiveGamesListeners(user.gidsPlay);
		this.startNewGamesListeners(user.gidsPlay);

		this.userNotifier.update(user);
	}
	trimInactiveGamesListeners = (updatedUserGIDs: string[]) => {
		let gidsToDelete: string[] = [];
		this.gameNotifierMap.forEach((gameNotifier, gid) => {
			// If user no longer in game
			if (!updatedUserGIDs.includes(gid)) {
				this.stopGameListening(gid);

				// Delete notifier if no listeners registered
				if (!gameNotifier.hasListeners())
					gidsToDelete.push(gid);
			}
		});
		// Delete selected notifiers
		for (const gid of gidsToDelete)
			this.gameNotifierMap.delete(gid);
	}
	startNewGamesListeners = (updatedUserGIDs: string[]) => {
		for (const gid of updatedUserGIDs) {
			// Create game notifier if not already created
			if (!this.gameNotifierMap.has(gid))
				this.gameNotifierMap.set(gid, new ValueNotifier());

			this.startGameListening(gid);
		}
	}

	//+----------------------------------\------------------------
	//|	  		Game List Update		 |
	//\----------------------------------/------------------------
	handleGameListUpdate = (gameList: Object) => {
		// Convert object to array, including gid from property keys
		if (gameList) {
			gameList = Object.entries(gameList).map(listing => {
				return { gid: listing[0], ...listing[1] };
			});
		}
		else
			gameList = [];

		this.gameListNotifier.update(gameList);
	}

	//+----------------------------------\------------------------
	//|	  		  Game Update		     |
	//\----------------------------------/------------------------
	handleGameUpdate = (gid: string, game: any) => {
		if (game) {
			// Convert to array of move strings
			game.moves = game.moves ? Object.values(game.moves) : [];
		}

		this.gameNotifierMap.get(gid)?.update(game);

		// Stop if game doesn't exist
		if (!game)
			this.stopGameListening(gid);
	}

	//+----------------------------------\------------------------
	//|	  	 Registration Callbacks		 |
	//\----------------------------------/------------------------
	registerUserListener = (onUpdate: OnUpdateFunc): UnregisterFunc => {
		return this.userNotifier.register(onUpdate);
	}
	registerGameListListener = (onUpdate: OnUpdateFunc): UnregisterFunc => {
		return this.gameListNotifier.register(onUpdate);
	}
	registerGameListener = (onUpdate: OnUpdateFunc, gid: string): UnregisterFunc => {
		// Create notifier if none exists
		if (!this.gameNotifierMap.has(gid))
			this.gameNotifierMap.set(gid, new ValueNotifier());

		// Start listening 
		this.startGameListening(gid);

		const gameListenerUnregister = this.gameNotifierMap?.get(gid)?.register(onUpdate);
		const unregister = () => {
			if (gameListenerUnregister)
				gameListenerUnregister();

			// Delete notifier if stopped listening and has no listeners
			if (!this.gameNotifierMap.get(gid)!.hasListeners() && !this.gameListeningGIDs.includes(gid))
				this.gameNotifierMap.delete(gid);
		};
		return unregister;
	}

	//+----------------------------------\------------------------
	//|	  	 		Render				 |
	//\----------------------------------/------------------------
	value: FirebaseListenerContextValue = {
		registerUserListener: this.registerUserListener,
		registerGameListListener: this.registerGameListListener,
		registerGameListener: this.registerGameListener
	};
	render() {
		return (
			<FirebaseListenerContext.Provider value={this.value}>
				{this.props.children}
			</FirebaseListenerContext.Provider>
		);
	}
}

export default withFirebase(FirebaseListenerProvider);