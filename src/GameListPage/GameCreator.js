import React, { useState } from 'react';
import { Button, ToggleButton, ToggleButtonGroup } from 'react-bootstrap';
import { ButtonSpinner } from '../ButtonSpinner';
import { useJoinAPIContext } from '../API';

const createGameRadioMap = new Map([
	['d', { label: 'Defer', variant: 'primary', spinnerVariant: 'light' }],
	['w', { label: 'White', variant: 'light', spinnerVariant: 'dark' }],
	['b', { label: 'Black', variant: 'dark', spinnerVariant: 'light' }],
]);
const defaultTeamSelection = 'd';

const GameCreator = () => {
	const [teamSelection, setTeamSelection] = useState(defaultTeamSelection);
	const { createGame, isCreatingGame } = useJoinAPIContext();

	return (
		<>
			Play as:<br />
			<ToggleButtonGroup type='radio' name='teamSelection' defaultValue={defaultTeamSelection}
				onChange={!isCreatingGame ? setTeamSelection : null}>
				{Array.from(createGameRadioMap).map(([team, radio]) =>
					<ToggleButton key={team} value={team}
						variant={teamSelection === team ? radio.variant : `outline-${radio.variant}`}
						size='sm' disabled={isCreatingGame}>{radio.label}
					</ToggleButton>)}
			</ToggleButtonGroup>
			<br />
			<Button className='game-button' disabled={isCreatingGame}
				onClick={!isCreatingGame ? () => createGame(teamSelection) : null}
				variant={createGameRadioMap.get(teamSelection).variant}>
				{isCreatingGame ?
					<>Creating...
						<ButtonSpinner variant={createGameRadioMap.get(teamSelection).spinnerVariant} /></>
					: 'Create game'}
			</Button>
		</>
	);
};

export { GameCreator };