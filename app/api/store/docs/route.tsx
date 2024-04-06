import fs from "fs";
import path from "path";

import {
	convertMarkdownToNestedDoc,
	convertNestedDocToMarkdown,
	parseFileName,
} from "@/utils/parse";

export async function GET(req: Request) {
	const files = fs
		.readdirSync(process.env.STORE_LOCATION as string)
		.filter((file) => path.extname(file) === ".md");

	var docs: doc[] = [];
	files.forEach((file) => {
		const body = convertMarkdownToNestedDoc(
			fs.readFileSync(
				path.join(process.env.STORE_LOCATION as string, file),
				"utf8"
			)
		);
		let { birthtime, mtime } = fs.statSync(
			path.join(process.env.STORE_LOCATION as string, file)
		);

		docs.push({
			uid: file,
			title: parseFileName(file),
			body,
			created: birthtime,
			modified: mtime,
		});
	});

	return new Response(
		JSON.stringify({
			docs,
		})
	);
}

export async function POST(req: Request) {
	const { file } = await req.json();

	const filePath = decodeURI(
		path.join(process.env.STORE_LOCATION as string, `${file.title}.md`)
	);

	const fileContent = convertNestedDocToMarkdown(file.body);

	fs.writeFileSync(filePath, fileContent);

	const fileStats = fs.statSync(filePath);

	return new Response(
		JSON.stringify({
			doc: {
				uid: `${file.title}.md`,
				created: fileStats.birthtime,
				modified: fileStats.mtime,
			},
		})
	);
}
