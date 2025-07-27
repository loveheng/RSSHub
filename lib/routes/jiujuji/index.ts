import { Route } from '@/types';
import got from '@/utils/got';
import { load } from 'cheerio';
import { parseDate } from '@/utils/parse-date';

export const route: Route = {
    path: '/latest',
    categories: ['blog'],
    example: '/jiujuji/latest',
    parameters: {},
    features: {
        requireConfig: false,
        requirePuppeteer: false,
        antiCrawler: false,
        supportBT: false,
        supportPodcast: false,
        supportScihub: false,
    },
    radar: [
        {
            source: ['jiujuji.com'],
            target: '/latest',
        },
    ],
    name: '最新文章',
    maintainers: ['your-github-id'], // 替换为你的 GitHub ID
    handler,
    description: '抓取 jiujuji 最新文章，保留 description 并处理 content:encoded 中的图片地址。',
};

async function handler() {
    const feedUrl = 'https://www.jiujuji.com/feed';
    const { data: feed } = await got(feedUrl);
    const $ = load(feed, { xmlMode: true });

    const list = $('item')
        .toArray()
        .map((item) => {
            const $item = $(item);

            const title = $item.find('title').text();
            const link = $item.find('link').text();
            const pubDate = parseDate($item.find('pubDate').text());

            const contentEncodedRaw = $item.find(String.raw`content\:encoded`).text();
            const $$ = load(contentEncodedRaw, { xmlMode: false });

            $$('img').each((_, img) => {
                const $img = $$(img);
                const dataSrc = $img.attr('data-src');
                if (dataSrc) {
                    $img.attr('src', dataSrc);
                }
            });

            const contentEncodedProcessed = $$.html();

            return {
                title,
                link,
                pubDate,
                description: contentEncodedProcessed,
            };
        });

    return {
        title: 'jiujuji 最新文章',
        link: 'https://www.jiujuji.com/',
        item: list,
    };
}
