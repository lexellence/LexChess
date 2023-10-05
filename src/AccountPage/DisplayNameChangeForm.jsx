import { useState, useCallback } from 'react';
import { useFirebaseContext } from '../Firebase';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { MAX_CHARS_DISPLAY_NAME } from '../constants/charlimits';

function DisplayNameChangeForm({ afterUpdate, onCancel }) {
	const [isEmpty, setIsEmpty] = useState(true);
	const [status, setStatus] = useState({ message: '', style: {} });
	const firebase = useFirebaseContext();

	const handleSubmit = useCallback(event => {
		event.preventDefault();
		const displayName = event.target.elements.displayName.value;

		setStatus({ message: "Updating display name...", class: "text-primary" });
		firebase.doDisplayNameUpdate(displayName)
			.then(() => {
				setStatus({ message: "Display name has been updated.", class: "text-success" });
			})
			.then(() => afterUpdate())
			.catch(error => {
				setStatus({ message: error.message, class: "text-danger" });
			});
	}, [firebase]);

	const handleChange = useCallback(event => setIsEmpty(event.target.value == ''), []);
	return (
		<>
			<Form className="mx-auto" onSubmit={handleSubmit}>
				<Form.Group className="mb-3" controlId="accountDisplayName">
					<Form.Control type="text" placeholder="new display name" name="displayName"
						maxLength={MAX_CHARS_DISPLAY_NAME} onChange={handleChange} />
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

export { DisplayNameChangeForm };