import { createContext } from 'react';
import { Firebase } from '.';

const FirebaseContext = createContext<Firebase | undefined>(undefined);

export { FirebaseContext };