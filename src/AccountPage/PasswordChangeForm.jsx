import { useState, useCallback } from 'react';
import { useFirebaseContext } from '../Firebase';
import { useNavigate } from 'react-router-dom';
import Button from 'react-bootstrap/Button';
import Form from 'react-bootstrap/Form';
import * as ROUTES from "../constants/routes";

const requiresRecentLoginErrorCode = "auth/requires-recent-login";
const requiresRecentLoginErrorMessage = <>Recent authentication required.<br />Sign out and sign back in, then try again.</>;

function PasswordChangeForm() {
	const [password1, setPassword1] = useState('');
	const [password2, setPassword2] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [status, setStatus] = useState({ message: '', style: {} });
	const [showForm, setShowForm] = useState(false);
	const firebase = useFirebaseContext();
	const navigate = useNavigate();

	const handleSubmit = useCallback(event => {
		event.preventDefault();
		setStatus({ message: "Updating password...", class: "text-primary" });
		firebase.doPasswordUpdate(event.target.elements.password1.value)
			.then(() => {
				setStatus({ message: "Password has been updated.", class: "text-success" });
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

	const handleChange1 = useCallback(event => setPassword1(event.target.value), []);
	const handleChange2 = useCallback(event => setPassword2(event.target.value), []);
	const handleSwitch = useCallback(event => {
		setShowPassword(event.target.checked);
	}, []);

	let isValid = password1 != '';
	if (!showPassword && isValid)
		isValid = password1 === password2;

	return (
		<>
			{!showForm &&
				<Button variant="primary" onClick={() => setShowForm(true)}>
					Change
				</Button>
			}
			{showForm &&
				<Form className="mx-auto" onSubmit={handleSubmit}>
					<Form.Check className="mb-1" type="switch" id="showPasswordSwitch"
						label="Show Password" onChange={handleSwitch} />
					<Form.Group className="mb-1" controlId="accountPassword1">
						<Form.Control type={showPassword ? "text" : "password"} placeholder="new password" name="password1"
							onChange={handleChange1} />
					</Form.Group>
					{!showPassword &&
						<Form.Group className="mb-1" controlId="accountPassword2">
							<Form.Control type="password" placeholder="confirm new password" name="password2"
								onChange={handleChange2} defaultValue={password2} />
						</Form.Group>
					}
					<div className="mt-3">
						<Button variant="primary" type="button" onClick={() => setShowForm(false)}>
							Cancel
						</Button>
						<Button variant="primary" type="submit" disabled={!isValid}>
							Update
						</Button>
					</div>
				</Form>
			}
			{status.message && <section className={status.class}>{status.message}</section>}
		</>
	);
}

export { PasswordChangeForm };