import { useState, useCallback } from 'react';
import { useFirebaseContext } from '../Firebase';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { MAX_CHARS_DISPLAY_NAME } from '../constants/charlimits';
import * as ROUTES from "../constants/routes";

function DisplayNameChangeForm() {
	const [displayName, setDisplayName] = useState('');
	const [status, setStatus] = useState({ message: '', style: {} });
	const [showForm, setShowForm] = useState(false);
	const firebase = useFirebaseContext();
	const navigate = useNavigate();

	const handleSubmit = useCallback(event => {
		event.preventDefault();
		setStatus({ message: "Updating display name...", class: "text-primary" });
		firebase.doDisplayNameUpdate(event.target.elements.displayName.value)
			.then(() => {
				setStatus({ message: "Display name has been updated.", class: "text-success" });
				setShowForm(false);
			})
			.then(() => navigate(ROUTES.ACCOUNT))
			.catch(error => {
				setStatus({ message: error.message, class: "text-danger" });
			});
	}, [firebase]);

	const handleChange = useCallback(event => setDisplayName(event.target.value), []);
	const isValid = (displayName != '');

	return (
		<>
			{!showForm &&
				<Button variant="primary" onClick={() => setShowForm(true)}>
					Change
				</Button>
			}
			{showForm &&
				<Form className="mx-auto" onSubmit={handleSubmit}>
					<Form.Group className="mb-3" controlId="accountDisplayName">
						<Form.Control type="text" placeholder="new display name" name="displayName"
							maxLength={MAX_CHARS_DISPLAY_NAME} onChange={handleChange} />
					</Form.Group>
					<Button variant="primary" type="button" onClick={() => setShowForm(false)}>
						Cancel
					</Button>
					<Button variant="primary" type="submit" disabled={!isValid}>
						Update
					</Button>
				</Form>
			}
			{status.message && <section className={status.class}>{status.message}</section>}
		</>
	);
}

export { DisplayNameChangeForm };