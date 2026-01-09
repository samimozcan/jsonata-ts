import { execSync } from 'node:child_process';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import jsonata from 'jsonata';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonataFilePath = path.join(__dirname, '../src/jsonata/jsonata-template.v15-works.jsonata');
const jsonataInputBodyPath = path.join(__dirname, '../src/jsonata/input-body.json');

async function main() {
  const template = await fs.readFile(jsonataFilePath, 'utf8');
  const inputBody = await fs.readFile(jsonataInputBodyPath, 'utf8');

  const jsonataResponse = await jsonata(template).evaluate(JSON.parse(inputBody));
  console.log('----------------------------------------------');
  console.dir(jsonataResponse, { depth: null, colors: true });
  execSync('pbcopy', {
    input: JSON.stringify(jsonataResponse, null, 2),
  });
}

main().catch((err) => {
  console.error('Error in main function:', err);
});
