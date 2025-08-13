import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);

const sqlite3 = require('sqlite3');
sqlite3.verbose();

export default sqlite3;
