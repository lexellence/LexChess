import { Spinner } from 'react-bootstrap';

const ButtonSpinner = () => (
	<Spinner
		as="span"
		variant="light"
		size="sm"
		role="status"
		aria-hidden="true"
		animation="border" />
);

export default ButtonSpinner;