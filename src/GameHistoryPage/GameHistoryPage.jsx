import { HistoryGameList } from './HistoryGameList';
import { Game } from '../Game';
import {
	withAuthorization,
	withEmailVerification,
} from '../Session';
import { useGameHistoryPageContext } from './useGameHistoryPageContext';

function GameHistoryPageBase() {
	const { game, historyPosition, setHistoryPosition, leaveGame } = useGameHistoryPageContext();
	return (
		<section id='game-page'>
			{game ?
				<Game game={game} historyPosition={historyPosition} setHistoryPosition={setHistoryPosition} leaveGame={leaveGame} />
				:
				<>
					<h1>View my past games</h1>
					<HistoryGameList />
				</>
			}
		</section>
	);
}
const GameHistoryPage = withEmailVerification(
	withAuthorization(authUser => !!authUser)(
		GameHistoryPageBase));

export { GameHistoryPage };

