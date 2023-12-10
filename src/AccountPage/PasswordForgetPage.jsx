import * as React from 'react';
import { PasswordForgetForm } from './PasswordForgetForm';

function PasswordForgetPage() {
	return (
		<section id='auth-page'>
			<h1>Password Forget</h1>
			<div className='auth-form'>
				<PasswordForgetForm />
			</div>
		</section>
	);
};

export { PasswordForgetPage };
