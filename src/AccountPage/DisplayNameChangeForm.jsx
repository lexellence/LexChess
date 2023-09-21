import { useState, useCallback } from 'react';
import { useFirebaseContext } from '../Firebase';

function DisplayNameChangeForm({ afterUpdate }) {
	const [newDisplayName, setNewDisplayName] = useState('');
	const [error, setError] = useState(null);
	const [message, setMessage] = useState('');
	const firebase = useFirebaseContext();

	const onSubmit = useCallback(event => {
		event.preventDefault();
		setMessage("Updating display name...");
		setError(null);
		firebase.doDisplayNameUpdate(newDisplayName)
			.then(() => setMessage("Display name has been updated."))
			.then(() => afterUpdate())
			.catch(error => {
				setError(error);
				setMessage(null);
			});
	}, [newDisplayName, firebase]);

	const onChange = useCallback(event => setNewDisplayName(event.target.value), []);
	const isInvalid = (newDisplayName === '');
	return (
		<>
			<form onSubmit={onSubmit}>
				<input
					name="newDisplayName"
					value={newDisplayName}
					onChange={onChange}
					type="text"
					placeholder="New Display Name" />
				<button disabled={isInvalid} type="submit">
					Update
				</button>
				{error && <section>{error.message}</section>}
				{message && <section>{message}</section>}
			</form>
		</>
	);
}

export { DisplayNameChangeForm };