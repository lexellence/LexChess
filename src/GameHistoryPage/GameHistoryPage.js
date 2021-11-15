import { HistoryGameList } from './HistoryGameList';
import { Game } from '../Game';
import {
	withAuthorization,
	withEmailVerification,
} from '../Session';
import { useGameHistoryPageContext } from './GameHistoryPageContext';

function GameHistoryPageBase() {
	const { game, historyPosition, setHistoryPosition, leaveGame } = useGameHistoryPageContext();

	if (game)
		return (
			<div className='page-wrapper'>
				<Game game={game} historyPosition={historyPosition} setHistoryPosition={setHistoryPosition} leaveGame={leaveGame} />
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
const GameHistoryPage = withEmailVerification(
	withAuthorization(authUser => !!authUser)(
		GameHistoryPageBase));

export { GameHistoryPage };

