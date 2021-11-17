import * as React from 'react';
import { FirebaseListenerContext, FirebaseListenerContextValue } from './FirebaseListenerContext';
import { Firebase, withFirebase } from '../Firebase';
import { ValueNotifier, OnUpdateFunc, UnregisterFunc } from './Notifier';
import { dbGameToClientGame } from '../Game/dbGameToClientGame';

//+----------------------------------\------------------------
//|	    FirebaseListenerProvider	 |
//\----------------------------------/
//	The provider of firebase data notifiers
//\-----------------------------------------------------------
type FirebaseListenerProviderProps = {
	firebase: Firebase;
	children: any;
}
class FirebaseListenerProviderBase extends React.Component<FirebaseListenerProviderProps> {
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
			this.props.firebase?.userRef(this.authUser.uid).on('value', (snapshot: any) => {
				const user = snapshot.val();
				this.handleUserUpdate(user);
			});
	}
	stopUserListening = () => {
		if (this.authUser?.uid)
			this.props.firebase.userRef(this.authUser.uid).off();
	}
	startGameListListening = () => {
		this.props.firebase.db.ref('gameList').on('value', (snapshot: any) => {
			const gameList = snapshot.val();
			this.handleGameListUpdate(gameList);
		});
	}
	stopGameListListening = () => {
		this.props.firebase.db.ref('gameList').off();
	}
	startGameListening = (gid: string) => {
		if (!gid)
			return;

		if (!this.gameListeningGIDs.includes(gid)) {
			this.gameListeningGIDs.push(gid);
			this.props.firebase.db.ref(`games/${gid}/status`).once('value', (snapshot: any) => {
				if (!snapshot.exists())
					this.handleGameUpdate(gid, null);

				this.props.firebase.db.ref(`games/${gid}`).on('value', (snapshot: any) => {
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
		if (!user.play)
			user.play = {};
		if (!user.past)
			user.past = {};

		const userGIDs = Object.keys(user.play);
		this.trimInactiveGamesListeners(userGIDs);
		this.startNewGamesListeners(userGIDs);

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
	handleGameUpdate = (gid: string, dbGame: any) => {
		const game = dbGameToClientGame(dbGame, gid, this.authUser.uid);
		if (game) {
			// Notify
			this.gameNotifierMap.get(gid)?.update(game);
		}
		else {
			// Stop if game doesn't exist
			this.stopGameListening(gid);
		}
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
		// Reject no-gid
		if (!gid) {
			onUpdate(null);
			return () => { };
		}

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
		registerGameListener: this.registerGameListener,
		setLocalUser: this.handleUserUpdate,
	};
	render() {
		return (
			<FirebaseListenerContext.Provider value={this.value}>
				{this.props.children}
			</FirebaseListenerContext.Provider>
		);
	}
}
const FirebaseListenerProvider = withFirebase(FirebaseListenerProviderBase);

export { FirebaseListenerProvider };