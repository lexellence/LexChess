import React from 'react';
import FirebaseListenerContext from './FirebaseListenerContext';
import Firebase, { withFirebase } from '../Firebase';
// import * as api from '../api';

//+--------------------------\--------------------------------
//|	        Notifier	     |
//\--------------------------/
//	Middle-man between firebase database listeners and 
//		internal component listeners.
//\-----------------------------------------------------------
type OnUpdateFunc = (data: any) => void;
type UnregisterFunc = () => void;
class Notifier {
	private initialized: boolean;
	private data: any;
	private onUpdateList: OnUpdateFunc[];
	constructor() {
		this.initialized = false;
		this.data = null;
		this.onUpdateList = [];
	};
	register = (onUpdate: OnUpdateFunc): UnregisterFunc => {
		this.onUpdateList.push(onUpdate);
		if (this.initialized)
			this.notify(onUpdate);
		const unregister = () => {
			this.onUpdateList = this.onUpdateList.filter(element => element !== onUpdate);
		};
		return unregister;
	};
	update = (newData: any): void => {
		if (!this.initialized)
			this.initialized = true;
		this.data = newData;
		this.notifyAll();
	};
	notify = (onUpdate: OnUpdateFunc): void => {
		onUpdate(this.data ? { ...this.data } : null);
	};
	notifyAll = (): void => {
		this.onUpdateList.forEach(onUpdate => this.notify(onUpdate));
	};
	hasListeners = (): boolean => {
		return this.onUpdateList.length > 0;
	};
};
//+--------------------------\--------------------------------
//|	      GameNotifier	     |
//\--------------------------/
//	Adds a flag to Notifier signalling whether the Firebase 
//		listener has been turned on.
//\-----------------------------------------------------------
class GameNotifier extends Notifier {
	listening: boolean;
	constructor(listening: boolean) {
		super();
		this.listening = listening;
	}
};
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
		gameNotifierMap = new Map();	// key = gid, value = GameNotifier
		userNotifier = new Notifier();
		gameListNotifier = new Notifier();
		unregisterAuthListener = () => { };

		componentDidMount() {
			// Listen to game list
			this.props.firebase.db.ref('gameList').on('value', (snapshot) => {
				this.gameListNotifier.update(snapshot.val());
			});

			// Listen to authUser
			const onSignIn = (authUser: any) => {
				this.authUser = authUser;

				// Listen to db user
				if (this.authUser?.uid)
					this.props.firebase?.userRef(this.authUser.uid).on('value', (snapshot) => {
						const user = snapshot.val();
						this.handleUserUpdate(user);
					});
			};
			const onSignOut = () => {
				this.authUser = null;

				// Stop listening to db user
				this.props.firebase.userRef(this.authUser.uid).off();

				// Stop listening to user games
				this.gameNotifierMap.forEach((gameNotifier, gid) => {
					if (gameNotifier.listening) {
						this.props.firebase.db.ref(`games/${gid}`).off();
						gameNotifier.listening = false;
					}
				});
				this.gameNotifierMap.clear();
			};
			this.unregisterAuthListener = this.props.firebase.onAuthUserListener(onSignIn, onSignOut);
		}
		componentWillUnmount() {
			// Stop listening to authUser
			this.unregisterAuthListener();

			// Stop listening to game list
			this.props.firebase.db.ref('gameList').off();

		}
		handleUserUpdate = (user: any) => {
			const userGIDs = user?.gids ? Object.keys(user.gids) : [];

			// Stop listening to games that user is no longer in
			let gidsToDelete: string[] = [];
			this.gameNotifierMap.forEach((gameNotifier, gid) => {
				// If user no longer in game
				if (!userGIDs.includes(gid)) {
					// Stop listening
					if (gameNotifier.listening) {
						this.props.firebase.db.ref(`games/${gid}`).off();
						gameNotifier.listening = false;
					}
					// Delete notifier if no listeners registered
					if (!gameNotifier.hasListeners())
						gidsToDelete.push(gid);
				}
			});
			// Delete selected notifiers
			for (const gid of gidsToDelete)
				this.gameNotifierMap.delete(gid);


			// Listen to new user games
			for (const gid of userGIDs) {
				// Create game notifier 
				if (!this.gameNotifierMap.has(gid))
					this.gameNotifierMap.set(gid, new GameNotifier(false));

				if (!this.gameNotifierMap.get(gid).listening) {
					// Listen to game
					this.gameNotifierMap.get(gid).listening = true;
					this.props.firebase.db.ref(`games/${gid}`).on('value', (snapshot) => {
						this.gameNotifierMap.get(gid).update(snapshot.val());
					});
				}
			}
			// Notify user listeners
			this.userNotifier.update(user);
		};


		registerUserListener = (onUpdate: OnUpdateFunc): UnregisterFunc => {
			return this.userNotifier.register(onUpdate);
		};
		registerGameListListener = (onUpdate: OnUpdateFunc): UnregisterFunc => {
			return this.gameListNotifier.register(onUpdate);
		};
		registerGameListener = (onUpdate: OnUpdateFunc, gid: string): UnregisterFunc => {
			// Create notifier if none exists
			if (!this.gameNotifierMap.has(gid))
				this.gameNotifierMap.set(gid, new GameNotifier(false));

			const gameListenerUnregister = this.gameNotifierMap.get(gid).register(onUpdate);
			const unregister = () => {
				gameListenerUnregister();

				// Delete notifier if stopped listening and has no listeners
				if (!this.gameNotifierMap.get(gid).hasListeners() && !this.gameNotifierMap.get(gid).listening)
					this.gameNotifierMap.delete(gid);
			};
			return unregister;
		};
		state = {
			value: {
				registerUserListener: this.registerUserListener,
				registerGameListListener: this.registerGameListListener,
				registerGameListener: this.registerGameListener
			}
		};
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