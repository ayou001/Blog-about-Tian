import fs from 'fs';
import dayjs from 'dayjs';
import tailwind from '@astrojs/tailwind';

import { defineConfig } from 'astro/config';
import { parse } from 'node-html-parser';
import { SITE } from './src/config';
import rehypeCustomizeImageSrc from './rehype-customize-image-src.js';

const DEFAULT_FORMAT = 'YYYY/MM/DD';
const WEEKLY_REPO_NAME = 'ayou001/Blog-about-Tian';

function getCreateDateFormat(filePath) {
	return dayjs(fs.statSync(filePath).birthtime).format(DEFAULT_FORMAT);
}

function getWeeklyDateFormat(num) {
	if (num < 100) {
		return dayjs('2022-10-10')
			.subtract(100 - num, 'week')
			.format(DEFAULT_FORMAT);
	}
	return getCreateDateFormat(filePath);
}

function getTwitterImg(num) {
	return num >= 110 ? `https://weekly.tw93.fun/assets/${num}.jpg` : undefined;
}

function defaultLayoutPlugin() {
  return function (tree, file) {
    const filePath = file.history[0]; // 获取文件路径
    console.log('Processing file:', filePath); // 调试信息

    const { frontmatter } = file.data.astro;
    frontmatter.layout = '@layouts/post.astro';

    if (tree.children[0]?.value && !frontmatter.pic) {
      const imageElement = parse(tree.children[0].value).querySelector('img');
      frontmatter.pic = imageElement?.getAttribute('src');
    }

    if (tree.children[1]?.children[1]?.value) {
      frontmatter.desc = tree.children[1].children[1].value;
    }

    frontmatter.desc = frontmatter.desc || SITE.description;
    frontmatter.pic = frontmatter.pic || SITE.pic;

    if (!frontmatter.date) {
      try {
        let dateToUse = SITE.repo === WEEKLY_REPO_NAME ? getWeeklyDateFormat(filePath.split('/posts/')[1].split('-')[0]) : getCreateDateFormat(filePath);
        frontmatter.date = dateToUse || dayjs().format(DEFAULT_FORMAT); // 设置日期为有效值或默认日期
      } catch (error) {
        console.error('Error processing date for file:', filePath, error);
        frontmatter.date = dayjs().format(DEFAULT_FORMAT); // 设置默认日期
      }
    }

    if (SITE.repo === WEEKLY_REPO_NAME) {
      try {
        let twitterImgToUse = getTwitterImg(filePath.split('/posts/')[1].split('-')[0]);
        frontmatter.twitterImg = twitterImgToUse || ''; // 设置Twitter图片为有效值或空字符串
      } catch (error) {
        console.error('Error processing Twitter image for file:', filePath, error);
      }
    }
  };
}


export default defineConfig({
	prefetch: true,
	integrations: [tailwind()],
	markdown: {
		remarkPlugins: [defaultLayoutPlugin],
		rehypePlugins: [rehypeCustomizeImageSrc],
	},
});
