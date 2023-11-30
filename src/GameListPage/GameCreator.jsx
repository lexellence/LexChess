import { useState } from 'react';
import { Button, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { ButtonSpinner } from '../ButtonSpinner';
import { useJoinAPIContext } from '../API';
const defaultTeamSelection = 'd';
const createGameRadioMap = new Map([
	['d', { label: 'Defer', variant: 'primary', spinnerVariant: 'light' }],
	['w', { label: 'White', variant: 'light', spinnerVariant: 'dark' }],
	['b', { label: 'Black', variant: 'dark', spinnerVariant: 'light' }],
]);

function GameCreator({ isUserMaxedOut }) {
	const [teamSelection, setTeamSelection] = useState(defaultTeamSelection);
	const { createGame, isCreatingGame } = useJoinAPIContext();

	let createButtonContent;
	if (isCreatingGame) {
		createButtonContent =
			<>
				Creating...
				<ButtonSpinner variant={createGameRadioMap.get(teamSelection).spinnerVariant} />
			</>
	}
	else if (isUserMaxedOut) {
		createButtonContent = "You're maxed out!";
	}
	else {
		createButtonContent = 'Create game';
	}

	const canCreateGame = !isCreatingGame && !isUserMaxedOut;
	return (
		<>
			Play as:<br />
			<ToggleButtonGroup type='radio' name='teamSelection' defaultValue={defaultTeamSelection}
				onChange={!isCreatingGame ? setTeamSelection : null}>
				{Array.from(createGameRadioMap).map(([team, radio], i) =>
					<ToggleButton id={`create-game-team-button-${i}`} key={team} value={team}
						variant={teamSelection === team ? radio.variant : `outline-${radio.variant}`}
						size='sm' disabled={isCreatingGame}>{radio.label}
					</ToggleButton>)}
			</ToggleButtonGroup>
			<br />
			<Button className='game-button' disabled={!canCreateGame}
				onClick={canCreateGame ? () => createGame(teamSelection) : null}
				variant={createGameRadioMap.get(teamSelection).variant}>
				{createButtonContent}
			</Button>
		</>
	);
};

export { GameCreator };