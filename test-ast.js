const { unified } = require('unified');
const remarkParse = require('remark-parse');
const remarkRehype = require('remark-rehype');
const rehypeRaw = require('rehype-raw');

const markdown = `
<img src="1.jpg" />

<img src="2.jpg" />
`;

const processor = unified()
  .use(remarkParse)
  .use(remarkRehype, { allowDangerousHtml: true })
  .use(rehypeRaw);

const tree = processor.parse(markdown);
const hast = processor.runSync(tree);

console.log(JSON.stringify(hast, null, 2));
