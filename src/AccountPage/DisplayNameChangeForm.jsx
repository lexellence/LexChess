import { useState, useCallback } from 'react';
import { useFirebaseContext } from '../Firebase';

function DisplayNameChangeForm({ afterUpdate }) {
	const [newDisplayName, setNewDisplayName] = useState('');
	const [status, setStatus] = useState({ message: '', style: {} });
	const firebase = useFirebaseContext();

	const onSubmit = useCallback(event => {
		event.preventDefault();
		setStatus({ message: "Updating display name...", class: "text-primary" });
		firebase.doDisplayNameUpdate(newDisplayName)
			.then(() => {
				setNewDisplayName('');
				setStatus({ message: "Display name has been updated.", class: "text-success" });
			})
			.then(() => afterUpdate())
			.catch(error => {
				setStatus({ message: error.message, class: "text-danger" });
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
					placeholder="New Display Name"
					maxlength="36" />
				<button disabled={isInvalid} type="submit">
					Update
				</button>
			</form>
			{status.message && <section className={status.class}>{status.message}</section>}
		</>
	);
}

export { DisplayNameChangeForm };