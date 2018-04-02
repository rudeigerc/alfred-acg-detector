'use strict';
const alfy = require('alfy');
const htmlparser = require("htmlparser2");

const id = alfy.input;
const items = [];

function fetchBilibili(id) {
	const aid = id.substring(2);
	const pagelistUrl = `https://api.bilibili.com/x/player/pagelist?aid=${aid}`;
	const videoUrl = `https://www.bilibili.com/video/${id}`;

	alfy.fetch(pagelistUrl).then(data => {
		if (data.code === 0) {
			if (data.data.length === 1) {
				alfy.fetch(videoUrl, { json: false }).then(data => {
					let handler = new htmlparser.DomHandler( (error, dom) => {
						if (!error) {
							const title = htmlparser.DomUtils.getElementsByTagName('title', dom)[0].children[0].data;
							items.push({
								title: title,
								subtitle: id,
								arg: videoUrl
							});
						} else {
							items.push({
								title: error,
								subtitle: id
							})
						}
					});
					let parser = new htmlparser.Parser(handler);
					parser.write(data);
					parser.end();
					alfy.output(items);
				});
			} else {
				alfy.output(data.data.map(page => ({
					title: page.part,
					subtitle: id,
					arg: `https://www.bilibili.com/video/${id}?p=${page.page}`
				})));
			}
		} else {
			alfy.output([{
				title: data.code,
				subtitle: id
			}])
		}
	});
}

if (id.startsWith('av')) {
	fetchBilibili(id);
}
