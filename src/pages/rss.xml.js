import rss from '@astrojs/rss';

export function GET() {
	let allPosts = import.meta.glob('./posts/*.md', { eager: true });
	let posts = Object.values(allPosts);

	posts = posts.sort((a, b) => {
		return parseInt(b.url.split('/posts/')[1].split('-')[0]) - parseInt(a.url.split('/posts/')[1].split('-')[0]);
	});

	//只保留12，当前太多了
	posts.splice(12);

	return rss({
		title: '友谊博客',
		description: '记录泽与甜的友谊',
		site: 'https://blog-about-tian.vercel.app/',
		customData: `<image><url>https://gw.alipayobjects.com/zos/k/qv/coffee-2-icon.png</url></image>`,
		items: posts.map((item) => {
			const url = item.url;
			const oldTitle = url.split('/posts/')[1];
			const title = '第' + oldTitle.split('-')[0] + '期 - ' + oldTitle.split('-')[1];
			return {
				link: url,
				title,
				description: item.compiledContent(),
				pubDate: item.frontmatter.date,
			};
		}),
	});
}
