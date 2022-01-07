import type { NextPage } from 'next';
import Head from 'next/head';
import { strToBool } from '../../utils/stringToBool';
import { useEffect, useState } from 'react';
import Swal from 'sweetalert2';
import { Button } from 'react-bulma-components';
import Prism from 'prismjs';
import 'prismjs/themes/prism-tomorrow.css';

export const getServerSideProps = () => {
	if (!strToBool(process.env.NEXT_PUBLIC_SHAREX_SUPPORT)) {
		return {
			redirect: {
				destination: '/',
				permanent: true,
			},
		};
	}

	return { props: {} };
};

const ShareX: NextPage = () => {
	const [object, setObject] = useState({});

	const downloadFile = () => {
		window.location.replace(`${window.location.origin}/api/generator/sharex?config=${JSON.stringify(object)}&token=${object['Headers']?.['Authorization']}`);
	};

	useEffect(() => {
		const set = async() => {
			const obj = {
				'Version': '13.7.0',
				'Name': 'Shortener',
				'DestinationType': 'URLShortener',
				'RequestMethod': 'POST',
				'RequestURL': `${window.location.origin}/api/short`,
				'Body': 'JSON',
				'Data': JSON.stringify({
					'gcaptcha': 'none',
					'tos-accept': 'true',
					'withoutAuth': 'true',
					'link': '$input$'
				}),
				'URL': '$json:message.url$',
				'DeletionURL': '$json:message.deleteUrl$'
			};
    
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
    
			if (result.value) {
				obj['Headers'] = {};
				obj['Headers']['Authorization'] = result.value;
			}

			setObject(obj);
		};

		set();
		Prism.highlightAll();
	}, []);

	return (
		<div>
			<Head>
				<title>Shortener</title>
				<meta name='description' content='Shortener | Easy to short link' />
				<link rel='icon' href='/favicon.ico' />
			</Head>

			<main>
				<h1 className='title'>
                    ShareX Config
				</h1>

				<div className='code'>
					<pre>
						<code className='language-json'>
							{
								JSON.stringify(object, null, 2)
							}
						</code>
					</pre>
				</div>

				<Button color='success' onClick={() => downloadFile()}>Download SXCU</Button>
			</main>
		</div>
	);
};

export default ShareX;