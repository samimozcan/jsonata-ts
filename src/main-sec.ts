import fs from "fs/promises";
import path from "path";
import jsonata from "jsonata";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonataFilePath = path.join(
  __dirname,
  "../src/jsonata/sec-mapping-alican.jsonata"
);
const jsonataInputBodyPath = path.join(
  __dirname,
  "../src/jsonata/input-body-sec-alican.json"
);

async function main() {
  const template = await fs.readFile(jsonataFilePath, "utf8");
  const inputBody = await fs.readFile(jsonataInputBodyPath, "utf8");

  const jsonataResponse = await jsonata(template).evaluate(
    JSON.parse(inputBody)
  );
  console.log("----------------------------------------------");
  console.dir(jsonataResponse, { depth: null, colors: true });
  execSync("pbcopy", {
    input: JSON.stringify(jsonataResponse, null, 2),
  });
}

main().catch((err) => {
  console.error("Error in main function:", err);
});
