import { JoinAPIContext } from './JoinAPIContext';

const withJoinAPI =
	Component =>
		props => (
			<JoinAPIContext.Consumer>
				{value => <Component {...props} joinAPI={value} />}
			</JoinAPIContext.Consumer>
		);

export { withJoinAPI };