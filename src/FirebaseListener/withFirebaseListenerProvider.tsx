import React from 'react';
import FirebaseListenerContext from './FirebaseListenerContext';
import Firebase, { withFirebase } from '../Firebase';
import { ValueNotifier, OnUpdateFunc, UnregisterFunc } from './Notifier';

//+----------------------------------\------------------------
//|	  withFirebaseListenerProvider	 |
//\----------------------------------/
//	Wrap a component to act as the single provider of 
//	user's data stored in firebase database
//\-----------------------------------------------------------
type WithFirebaseListenerProviderProps = {
	firebase: Firebase;
}
const withFirebaseListenerProvider = (Component: any) => {
	class WithFirebaseListenerProvider extends React.Component<WithFirebaseListenerProviderProps> {
		authUser: any = null;
		gameNotifierMap = new Map<string, ValueNotifier>();	// key = gid, value = ChildAddedNotifier
		gameListeningGIDs: string[] = [];
		userNotifier = new ValueNotifier();
		gameListNotifier = new ValueNotifier();
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
				this.props.firebase.db.ref(`games/${gid}`).on('value', (snapshot) => {
					const game = snapshot.val();
					this.handleGameUpdate(gid, game);
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
			user.gids = user?.gids ? Object.keys(user.gids) : [];

			this.trimInactiveGamesListeners(user.gids);
			this.startNewGamesListeners(user.gids);

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
			// Stop if game doesn't exist
			if (!game)
				this.stopGameListening(gid);
			else {
				// Convert to array of move strings
				game.moves = game.moves ? Object.values(game.moves) : [];
			}

			this.gameNotifierMap.get(gid)!.update(game);
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

			const gameListenerUnregister = this.gameNotifierMap.get(gid)!.register(onUpdate);
			const unregister = () => {
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
		state = {
			value: {
				registerUserListener: this.registerUserListener,
				registerGameListListener: this.registerGameListListener,
				registerGameListener: this.registerGameListener
			}
		}
		render() {
			return (
				<FirebaseListenerContext.Provider value={this.state.value}>
					<Component {...this.props} />
				</FirebaseListenerContext.Provider>
			);
		}
	}

	return withFirebase(WithFirebaseListenerProvider);
};

export default withFirebaseListenerProvider;