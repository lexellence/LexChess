import * as React from 'react';
import { OnUpdateFunc, UnregisterFunc } from './Notifier';

type FirebaseListenerContextValue = {
	registerUserListener(onUpdate: OnUpdateFunc): UnregisterFunc;
	registerGameListListener(onUpdate: OnUpdateFunc): UnregisterFunc;
	registerGameListener(onUpdate: OnUpdateFunc, gid: string): UnregisterFunc;
	setLocalUser(user: any): void;
};
const FirebaseListenerContext = React.createContext<FirebaseListenerContextValue | undefined>(undefined);

export type { FirebaseListenerContextValue };
export { FirebaseListenerContext };