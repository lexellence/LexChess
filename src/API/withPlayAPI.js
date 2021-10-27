import React from 'react';
import PlayAPIContext from './PlayAPIContext';

const withPlayAPI =
	Component =>
		props => (
			<PlayAPIContext.Consumer>
				{value => <Component {...props} playAPI={value} />}
			</PlayAPIContext.Consumer>
		);

export default withPlayAPI;