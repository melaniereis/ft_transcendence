	import path from 'path';
	import fs from 'fs';
	import { FastifyInstance } from 'fastify';

	const filesToServe = [
	'ambient.mp3',
	'Background4.jpg',
	'gamebg.jpg',
	'avatar',
	'Background.png',
	'Background.jpg',
	'Background1.jpg',
	'Background2.gif',
	'Background3.jpg',
	'Background5.jpg',
	'Background5.png',
	'Background6.jpg',
	'Background7.jpg',
	'gris.jpg',
	'bugbusters.png',
	'hacktivists.png',
	'codealliance.png',
	'logicleague.png',
	'Blue_002.png', 'Blue_003.png', 'Blue_004.png', 'Blue_005.png', 'Blue_006.png',
	'Blue_007.png', 'Blue_008.png', 'Blue_009.png', 'Blue_010.png', 'Blue_011.png',
	'Blue_012.png', 'Blue_013.png', 'Blue_014.png', 'Blue_015.png', 'Blue_016.png',
	'Blue_017.png', 'Blue_018.png', 'Blue_019.png', 'Blue_020.png',
	'default.png'
	];

	const mimeTypes: Record<string, string> = {
	'.mp3': 'audio/mpeg',
	'.jpg': 'image/jpeg',
	'.jpeg': 'image/jpeg',
	'.png': 'image/png',
	'.gif': 'image/gif',
	};

	export function registerAssetRoutes(fastify: FastifyInstance) {
	filesToServe.forEach(filename => {
		fastify.get(`/${filename}`, (request, reply) => {
		console.log(`📦 Serving asset: /${filename}`);
		const filePath = path.join(process.cwd(), 'frontend', 'assets', filename);
		const ext = path.extname(filename).toLowerCase();
		const mimeType = mimeTypes[ext] || 'application/octet-stream';

		// Check if file exists before streaming
		fs.access(filePath, fs.constants.R_OK, (err) => {
			if (err) {
			reply.code(404).send('File not found');
			return;
			}
			const stream = fs.createReadStream(filePath);
			reply.header('Content-Type', mimeType);
			reply.send(stream);
		});
		});
	});
	}
