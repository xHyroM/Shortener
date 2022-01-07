// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { nanoid } from 'nanoid';
import connectDB from '../../middleware/mongodb';
import link from '../../models/link';
import absoluteUrl from 'next-absolute-url';
import { strToBool } from '../../utils/stringToBool';
import { rateLimit } from '../../utils/rateLimit';
import hyttpo from 'hyttpo';

type Data = {
  name: string;
  message?: string | object;
  data?: object;
}

export const config = {
	api: {
		bodyParser: false
	}
};

const limiter = rateLimit({
	interval: process.env.SHAREX_RATE_LIMIT_INTERVAL,
	uniqueTokenPerInterval: 100,
});

const handler = async(
	req: NextApiRequest,
	res: NextApiResponse<Data>
) => {
	if (req.method !== 'POST') return res.status(400).json({ name: 'Bad Request', message: `Use POST instead of ${req.method}` });
	if (strToBool(process.env.NEXT_PUBLIC_AUTHORIZATION) && req.headers['authorization'] !== process.env.AUTHORIZATION_TOKEN)  return res.status(403).json({ name: 'Forbidden', message: 'Invalid authorization token!' });

	const body = req.body ? JSON.parse(req.body) : null;

	if (!body) {
		return res.status(422).json({
			name: 'UNPROCESSABLE ENTITY',
			message: 'Missing body'
		});
	}

	if (!body.link) {
		return res.status(422).json({
			name: 'UNPROCESSABLE ENTITY',
			message: 'Missing link!'
		});
	}

	if (!body.gcaptcha) {
		return res.status(422).json({
			name: 'UNPROCESSABLE ENTITY',
			message: 'Missing gcaptcha!'
		});
	}

	const verify = await hyttpo.request(
		{
			url: `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.SECRET_KEY}&response=${req.body.gcaptcha}`,
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
			},
			body: JSON.stringify({}),
			method: 'POST',
		}
	).catch(e => e);

	if (!verify.data.success) {
		const rateLimit = limiter.check(res, process.env.SHAREX_RATE_LIMIT, 'CACHE_TOKEN');

		if (strToBool(process.env.NEXT_PUBLIC_SHAREX_SUPPORT) && req.headers['user-agent'].includes('ShareX') && !rateLimit) {} // eslint-disable-line no-empty
		else {
			return res.status(rateLimit ? 429 : 422).json({
				name: rateLimit ? 'TOO MANY REQUESTS' : 'UNPROCESSABLE ENTITY',
				message: rateLimit ? 'Rate limit' : 'Invalid captcha key!'
			});
		}
	}

	const randomKey = nanoid(10);
	const deleteKey = nanoid(25);

	const object: any = {
		id: randomKey,
		link: body.link,
		withoutAuth: body.withoutAuth || true,
		deleteKey: deleteKey
	};

	await link.create(object);

	res.status(200).json({ 
		name: 'OK',
		message: {
			msg: 'Link has been shortened.',
			id: randomKey,
			link: body.link,
			url: `${absoluteUrl(req).origin}/api/?id=${randomKey}${!strToBool(body.withoutAuth) ? `&token=${process.env.AUTHORIZATION_TOKEN}` : ''}`,
			deleteUrl: `${absoluteUrl(req).origin}/api/?id=${randomKey}${process.env.AUTHORIZATION_TOKEN ? `&token=${process.env.AUTHORIZATION_TOKEN}` : ''}&del=${deleteKey}`,
		}, 
	});
};

export default connectDB(handler);