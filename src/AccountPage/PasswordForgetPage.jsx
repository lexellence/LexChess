import * as React from 'react';
import { PasswordForgetForm } from './PasswordForgetForm';

function PasswordForgetPage() {
	return (
		<div className='authPage'>
			<h1>Password Forget</h1>
			<div className='authForm'>
				<PasswordForgetForm />
			</div>
		</div>
	);
};

export { PasswordForgetPage };
