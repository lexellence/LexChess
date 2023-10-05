import { useState, useCallback } from 'react';
import { useFirebaseContext } from '../Firebase';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import { MAX_CHARS_EMAIL } from '../constants/charlimits';
import * as ROUTES from "../constants/routes";

const requiresRecentLoginErrorCode = "auth/requires-recent-login";
const requiresRecentLoginErrorMessage = <>Recent authentication required.<br />Sign out and sign back in, then try again.</>;

function EmailChangeForm() {
	const [email, setEmail] = useState('');
	const [status, setStatus] = useState({ message: '', style: {} });
	const [showForm, setShowForm] = useState(false);
	const firebase = useFirebaseContext();
	const navigate = useNavigate();

	const handleSubmit = useCallback(event => {
		event.preventDefault();
		setStatus({ message: "Updating email...", class: "text-primary" });
		firebase.doEmailUpdate(event.target.elements.email.value)
			.then(() => {
				setStatus({ message: "Email has been updated.", class: "text-success" })
				setShowForm(false);
			})
			.then(() => navigate(ROUTES.ACCOUNT))
			.catch(error => {
				if (error.code === requiresRecentLoginErrorCode)
					setStatus({ message: requiresRecentLoginErrorMessage, class: "text-danger" });
				else
					setStatus({ message: error.message, class: "text-danger" });
			});
	}, [firebase]);

	const handleChange = useCallback(event => setEmail(event.target.value), []);
	const isValid = (email != '');

	return (
		<>
			{!showForm &&
				<Button variant="primary" onClick={() => setShowForm(true)}>
					Change
				</Button>
			}
			{showForm &&
				<Form className="mx-auto" onSubmit={handleSubmit}>
					<Form.Group className="mb-3" controlId="accountEmail">
						<Form.Control type="email" placeholder="name@example.com" name="email"
							maxLength={MAX_CHARS_EMAIL} onChange={handleChange} />
						<Form.Text className="text-muted">
							We'll never share your email with anyone else.
						</Form.Text>
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

export { EmailChangeForm };