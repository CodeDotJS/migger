#!/usr/bin/env node

'use strict';

const os = require('os');
const dns = require('dns');
const fs = require('fs');
const isUrl = require('is-url');
const got = require('got');
const download = require('download');
const ora = require('ora');
const jsf = require('jsonfile');
const log = require('log-update');
const mista = require('mista');
const chalk = require('chalk');
const updateNotifier = require('update-notifier');
const pkg = require('./package.json');

updateNotifier({pkg}).notify();

const spinner = ora();

const file = `${Math.random().toString(15).substr(2, 5)}.json`;
const red = chalk.red.bold('›');
const end = process.exit;
const arg = process.argv[2];
const inf = process.argv[3];
const pth = process.argv[4];
let dir = `${process.argv[5]}/instagram`;

if (!pth) {
	dir = `${os.homedir()}/instagram`;
}

const dim = str => {
	return chalk.dim(str);
};

const cyan = () => {
	return chalk.cyan.bold('✓');
};

if (!arg || arg === '-h' || arg === '--help') {
	log(`
 Usage: mig ${chalk.green('<command>')} ${chalk.yellow('[url]')} ${chalk.blue('<opt>')}

 Command:
  -d, ${dim('--download')}    Download all the media
  -e, ${dim('--export')}      Export links in as JSON

 Option:
  -p, ${dim('--path')}        Specify path of the folder for files

  Help:
  -h, ${dim('--help')}        Show help
		`);
	end(1);
}

const checkConnectionStatus = () => {
	dns.lookup('instagram.com', err => {
		if (err) {
			log(`\n${red} ${dim('Please check your internet connection! ')} \n`);
			end(1);
		} else {
			log();
			spinner.text = 'Connecting...';
		}
	});
};

const displayMessage = () => {
	log(`\n${red} ${dim('The given url does not contain multiple images/videos!')} \n`);
	end(1);
};

const handleUrlError = () => {
	return isUrl(inf) === false ? `${log(`\n${red} ${dim('Please provide a valid url!')} \n`)}${end(1)}` : `${log()}${spinner.text = 'Hold on, boi!'}${spinner.start()}`; // eslint-disable-line no-return-assign
};

inf === undefined ? `${log(`\n${red} ${dim('Please provide a url to download data!')} \n`)}${end(1)}` : handleUrlError(); // eslint-disable-line no-unused-expressions

const returnValidUrl = getUrl => {
	return getUrl.split('?')[0] + '?__a=1';
};

if (arg === '-d' || arg === '--download') {
	checkConnectionStatus();
	const url = returnValidUrl(inf);
	// You can simplify it using mista()
	got(url, {json: true}).then(res => {
		const base = res.body.graphql.shortcode_media.edge_sidecar_to_children.edges;
		const store = {data: []};
		for (let i = 0; i < base.length; i++) {
			const vid = base[i].node.video_url;
			const img = base[i].node.display_resources[2].src;
			vid === undefined ? store.data.push(img) : store.data.push(vid); // eslint-disable-line no-unused-expressions
		}
		const arr = store.data;
		log();
		spinner.text = 'Downloading files...';
		Promise.all(arr.map(x => download(x, dir))).then(() => {
			log(`\n${cyan('✓')} Download Complete! \n\n${cyan('✓')} ${arr.length} files saved in ${chalk.blue(dir)} \n`);
			spinner.stop();
		});
	}).catch(err => {
		if (err) {
			displayMessage();
		}
	});
}

if (arg === '-e' || arg === '--export') {
	checkConnectionStatus();
	mista(inf).then(res => {
		log(`\n${cyan('✓')} Links Exported!\n\n${cyan('✓')} File saved as ${chalk.yellow(`${file}`)} in ${chalk.blue(dir)} \n`);
		spinner.stop();

		if (!fs.existsSync(dir)) {
			fs.mkdirSync(dir);
		}

		const dest = `${dir}/${file}`;

		jsf.writeFile(dest, res, {spaces: 2}, err => {
			end(1);
			log(err);
		});
	}).catch(err => {
		if (err) {
			displayMessage();
		}
	});
}
