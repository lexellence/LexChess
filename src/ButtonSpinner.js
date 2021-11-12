import { Spinner } from 'react-bootstrap';

const ButtonSpinner = ({ variant }) => (
	<Spinner
		as="span"
		variant={variant}
		size="sm"
		role="status"
		aria-hidden="true"
		animation="border" />
);

export { ButtonSpinner };