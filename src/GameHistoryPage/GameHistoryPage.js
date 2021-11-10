import HistoryGameList from './HistoryGameList';
import Game from '../Game';
import {
	withAuthorization,
	withEmailVerification,
} from '../Session';
import { useGameHistoryPageContext } from './GameHistoryPageContext';

function GameHistoryPage() {
	const { game, leaveGame } = useGameHistoryPageContext();

	if (game)
		return (
			<div className='page-wrapper'>
				<Game game={game} leaveGame={leaveGame} />
			</div>
		);
	else
		return (
			<div align='center' style={{ display: 'block' }}>
				<h1>View my past games</h1>
				<HistoryGameList />
			</div>
		);
}

export default
	withEmailVerification(
		withAuthorization(authUser => !!authUser)(
			GameHistoryPage));
