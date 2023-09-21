import { useState, useCallback } from 'react';
import { useFirebaseContext } from '../Firebase';

const requiresRecentLoginErrorCode = "auth/requires-recent-login";
const requiresRecentLoginErrorMessage = <>Recent authentication required.<br />Sign out and sign back in, then try again.</>;
function EmailChangeForm({ afterUpdate }) {
	const [newEmail, setNewEmail] = useState('');
	const [status, setStatus] = useState({ message: '', style: {} });
	const firebase = useFirebaseContext();

	const onSubmit = useCallback(event => {
		event.preventDefault();
		setStatus({ message: "Updating email...", class: "text-primary" });
		firebase.doEmailUpdate(newEmail)
			.then(() => {
				setNewDisplayName('');
				setStatus({ message: "Email has been updated.", class: "text-success" })
			})
			.then(() => afterUpdate())
			.catch(error => {
				console.log(error.message);
				if (error.code === requiresRecentLoginErrorCode)
					setStatus({ message: requiresRecentLoginErrorMessage, class: "text-danger" });
				else
					setStatus({ message: error.message, class: "text-danger" });
			});
	}, [newEmail, firebase]);

	const onChange = useCallback(event => setNewEmail(event.target.value), []);
	const isInvalid = (newEmail === '');
	return (
		<>
			<form onSubmit={onSubmit}>
				<input
					name="newEmail"
					value={newEmail}
					onChange={onChange}
					type="text"
					placeholder="New Email"
					maxlength="254" />
				<button disabled={isInvalid} type="submit">
					Update
				</button>
			</form>
			{status.message && <section className={status.class}>{status.message}</section>}
		</>
	);
}

export { EmailChangeForm };