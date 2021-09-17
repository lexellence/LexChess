import React from 'react';

type ProviderValue = any;
const FirebaseListenerContext = React.createContext<ProviderValue>(null);

export default FirebaseListenerContext;