import LRU from 'lru-cache';

const getLinks = () => {
	return 0;
};

const getDailyLinks = () => {
	return 0;
};

export const getStats = () => {
	const cache = new LRU({
		maxAge: 3600000
	});

	return {
		get: () => {
			let links = cache.get('uploads') || null;
			let daily = cache.get('storage') || null;

			if (!links) {
				links = getLinks();
				cache.set('links', links);
			}

			if (!daily) {
				daily = getDailyLinks();
				cache.set('daily', daily);
			}

			return {
				links,
				daily
			};
		}
	};
};