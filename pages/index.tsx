import type { NextPage } from 'next';
import Head from 'next/head';
import { useState } from 'react';
import { RecaptchaComponent } from '../components/recaptcha';
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3';
import Swal from 'sweetalert2';
import Link from 'next/link';
import { strToBool } from '../utils/stringToBool';
import hyttpo from 'hyttpo';

const Home: NextPage = () => {
	const { executeRecaptcha } = useGoogleReCaptcha();

	const [infoAlert, setInfoAlert]: any = useState({ nothing: true });

	const clearForm = () => {
		const fileUploadForm: any = document.getElementById('fileUploadForm');
		fileUploadForm?.reset();
	};

	const handleSubmit = async(event: any) => {
		event.preventDefault();

		const recaptchaToken = await executeRecaptcha('upload');
  
		let result;
		if (strToBool(process.env.NEXT_PUBLIC_AUTHORIZATION)) {
			result = await Swal.fire({
				title: 'Your Authorization Token',
				input: 'password',
				inputAttributes: {
					autocapitalize: 'off'
				},
				showCancelButton: true,
				confirmButtonText: 'Submit',
				showLoaderOnConfirm: true,
				allowOutsideClick: () => !Swal.isLoading()
			});
		} else result = null;

		if ((result.isDenied) || (result.isDismissed)) {
			clearForm();

			setInfoAlert({
				message: 'Error: Invalid authorization token! (403)'
			});

			return;
		}

		const link: any = document.getElementById('linkUrl');
		const ToSCheckBox: any = document.getElementById('tosCheckbox');
		const checkbox: any = document.getElementById('withoutAuth');

		const res = await hyttpo.request({
			method: 'POST',
			url: window.location + 'api/short',
			body: JSON.stringify({
				gcaptcha: recaptchaToken || 'none'
			}),
			headers: {
				'Authorization': result?.value
			}
		}).catch(e => e);

		if (res.data?.message?.path) setInfoAlert({
			url: `${res.data.message.url}`,
			deleteUrl: `${res.data.message.deleteUrl}`
		});
		else setInfoAlert({ message: `Error: ${res.data.message} (${res.status})` });

		clearForm();

		return;
	};

	return (
		<div>
			<Head>
				<title>Shortener</title>
				<meta name='description' content='Shortener | Easy to short link' />
				<link rel='icon' href='/favicon.ico' />
			</Head>

			<main>
				<h1 className='title'>
          			Easy to short link!
				</h1>

				{ !infoAlert.nothing ? <div className='notification is-primary is-light'>
					{ infoAlert.url ? 
						<>
							<Link href={infoAlert.url}><a target={'_blank'}>Preview: {infoAlert.url}</a></Link>
							<br />
							<Link href={infoAlert.deleteUrl}><a target={'_blank'}>Delete: {infoAlert.deleteUrl}</a></Link>
						</>
						: infoAlert.message
					}
				</div> : '' } 

				<form className='box' onSubmit={handleSubmit} id='fileUploadForm'>
					<div className='field file is-boxed is-fullwidth'>
						<input className='input' id='linkUrl' type='text' placeholder="Text input" />
					</div>

					{ strToBool(process.env.NEXT_PUBLIC_AUTHORIZATION)
						? <>
							<div className='field control checkbox is-checkbox'>
								<label className='checkbox'>
									<input type='checkbox' id='withoutAuth'/>
                See file without authorization
								</label>
							</div>
							<br />
						</> :
						<></> 
					}

					<div className='field control checkbox is-checkbox'>
						<label className='checkbox'>
							<input type='checkbox' id='tosCheckbox' />
              					I agree to the <Link href='/tos'><a>terms and services</a></Link>
						</label>
					</div>

					<div className='field control has-text-centered'>
						<button className='button is-primary' type='submit'>Submit</button>
					</div>
				</form>
			</main>
		</div>
	);
};

export default RecaptchaComponent(Home);