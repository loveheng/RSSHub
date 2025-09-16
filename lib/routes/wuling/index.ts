import got from '@/utils/got';
import { load } from 'cheerio';
import type { Route } from '@/types'

function parseRelativeUrl(href: string | undefined, base: string): string | undefined {
    if (!href) {
        return undefined;
    }
    try {
        return new URL(href, base).href;
    } catch {
        return href;
    }
}

export const route: Route = {
    path: '/wulingSilverBadge',
    categories: ['car'],
    example: '/wuling/wulingSilverBadge',
    parameters: {},
    features: {
        requirePuppeteer: true,
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['wuling.com/wulingSilverBadge'],
            target: '/wulingSilverBadge',
        },
    ],
    name: '五菱银标车型',
    maintainers: ['your-github-id'], // 换成你的 GitHub 用户名
    handler,
    description: '抓取五菱官网银标车型及价格信息',
};

async function handler() {
    const url = 'https://www.wuling.com/wulingSilverBadge';
    const { data } = await got(url);
    const $ = load(data);

    const items = $('.car-type-card')
        .toArray()
        .map((elem) => {
            const $elem = $(elem);
            const title = $elem.find('.car-name').text().trim();
            const price = $elem.find('.car-price').text().trim();
            const image = $elem.find('img').attr('src');
            const linkOriginal = $elem.find('a').attr('href') || '';
	    const link = linkOriginal
    			?new URL(
          		linkOriginal.replace('/testDrive?', '/carDetail?'),
                        url
                     ).href : url;

            return {
                title: `${title} — ${price}`,
                link,
                description: `<img src="${image}" /><br/>价格：${price}`,
                guid: link || title,
                pubDate: new Date().toUTCString(),
            };
        });

    if (items.length === 0) {
        throw new Error('this route is empty, please check the original site');
    }

    return {
        title: '五菱银标车型',
        link: url,
        description: '上汽通用五菱银标全部车型及价格信息',
        item: items,
    };
}
