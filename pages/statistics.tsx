import type { NextPage } from 'next';
import Head from 'next/head';
import { CardGroup, Card } from 'react-bootstrap';
import { getStats } from '../utils/statistics';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { config, dom } from '@fortawesome/fontawesome-svg-core';
import { faFileImage, faSun } from '@fortawesome/free-solid-svg-icons';

config.autoAddCss = false;

const stats = getStats();

export const getServerSideProps = () => {
	const { links, daily } = stats.get();

	return { props: { links, daily } };
};

const Statistics: NextPage = ({ links, daily }: any) => {
	return (
		<div>
			<Head>
				<title>Shortener</title>
				<meta name='description' content='Shortener | Easy to short link' />
				<link rel='icon' href='/favicon.ico' />

				<style>{dom.css()}</style>
			</Head>

			<main>
				<h1 className='title'>
                    Statistics
				</h1>

				<h1 className='subtitle'>
                    Updates every 1 hour
				</h1>

				<CardGroup>
					<Card style={{ width: '18rem' }}>
						<Card.Body>
							<Card.Text>
                                Links
							</Card.Text>
							<Card.Title>
								<FontAwesomeIcon icon={faFileImage} size='2x' />
								<span className='ml-2' style={{ fontSize: '35px' }}>{ links.toLocaleString('en-US') }</span>
							</Card.Title>
						</Card.Body>
					</Card>
					<Card style={{ width: '18rem' }}>
						<Card.Body>
							<Card.Text>
                                Daily Links
							</Card.Text>
							<Card.Title>
								<FontAwesomeIcon icon={faSun} size='2x' />
								<span className='ml-2' style={{ fontSize: '35px' }}>{ daily.toLocaleString('en-US') }</span>
							</Card.Title>
						</Card.Body>
					</Card>
				</CardGroup>
			</main>
		</div>
	);
};

export default Statistics;