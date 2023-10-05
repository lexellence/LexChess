import { useState, useCallback } from 'react';
import { useFirebaseContext } from '../Firebase';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { MAX_CHARS_EMAIL } from '../constants/charlimits';

const requiresRecentLoginErrorCode = "auth/requires-recent-login";
const requiresRecentLoginErrorMessage = <>Recent authentication required.<br />Sign out and sign back in, then try again.</>;
function EmailChangeForm({ afterUpdate, onCancel }) {
	const [isEmpty, setIsEmpty] = useState(true);
	const [status, setStatus] = useState({ message: '', style: {} });
	const firebase = useFirebaseContext();

	const handleSubmit = useCallback(event => {
		event.preventDefault();
		const email = event.target.elements.email.value;

		setStatus({ message: "Updating email...", class: "text-primary" });
		firebase.doEmailUpdate(email)
			.then(() => {
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
	}, [firebase]);

	const handleChange = useCallback(event => setIsEmpty(event.target.value == ''), []);
	// const isInvalid = (newEmail === '');
	return (
		<>
			<Form className="mx-auto" onSubmit={handleSubmit}>
				<Form.Group className="mb-3" controlId="accountEmail">
					<Form.Control type="email" placeholder="name@example.com" name="email"
						maxLength={MAX_CHARS_EMAIL} onChange={handleChange} />
					<Form.Text className="text-muted">
						We'll never share your email with anyone else.
					</Form.Text>
				</Form.Group>
				<Button variant="primary" type="button" onClick={onCancel}>
					Cancel
				</Button>
				<Button variant="primary" type="submit" disabled={isEmpty}>
					Update
				</Button>
			</Form >
			{status.message && <section className={status.class}>{status.message}</section>}
		</>
	);
}

export { EmailChangeForm };