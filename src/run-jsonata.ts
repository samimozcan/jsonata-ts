import fs from "fs/promises";
import path from "path";
import jsonata from "jsonata";
import { execSync } from "child_process";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get command line arguments
const args = process.argv.slice(2);

if (args.length === 0) {
  console.error("Usage: npm run jsonata <filename.jsonata>");
  console.error("       npm run jsonata:watch <filename.jsonata>");
  console.error("Example: npm run jsonata evrim.jsonata");
  console.error("Example: npm run jsonata:watch evrim.jsonata");
  process.exit(1);
}

const jsonataFileName = args[0];
const inputBodyFileName = args[1] || "input-body.json";
const jsonataFilePath = path.join(
  __dirname,
  "../src/jsonata/",
  jsonataFileName
);
const jsonataInputBodyPath = path.join(
  __dirname,
  "../src/jsonata/",
  inputBodyFileName
);

async function main() {
  try {
    // Check if the JSONata file exists
    await fs.access(jsonataFilePath);

    const template = await fs.readFile(jsonataFilePath, "utf8");
    const inputBody = await fs.readFile(jsonataInputBodyPath, "utf8");

    const jsonataResponse = await jsonata(template).evaluate(
      JSON.parse(inputBody)
    );

    console.clear();
    console.log(`🚀 Running JSONata file: ${jsonataFileName}`);
    console.log("----------------------------------------------");
    console.dir(jsonataResponse, { depth: null, colors: true });

    // Copy result to clipboard
    execSync("pbcopy", {
      input: JSON.stringify(jsonataResponse, null, 2),
    });

    console.log("----------------------------------------------");
    console.log("✅ Result copied to clipboard!");
    console.log(`⏰ Executed at: ${new Date().toLocaleTimeString()}`);
  } catch (error) {
    console.clear();
    console.log(`❌ Error running JSONata file: ${jsonataFileName}`);
    if (error instanceof Error && "code" in error && error.code === "ENOENT") {
      console.error(
        `❌ Error: JSONata file '${jsonataFileName}' not found in ../src/jsonata/`
      );
      console.error("Available files:");
      try {
        const files = await fs.readdir(path.join(__dirname, "../src/jsonata/"));
        const jsonataFiles = files.filter((file) => file.endsWith(".jsonata"));
        jsonataFiles.forEach((file) => console.error(`  - ${file}`));
      } catch (dirError) {
        console.error("Could not list available files");
      }
    } else {
      console.error(
        "❌ Error:",
        error instanceof Error ? error.message : String(error)
      );
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("❌ Error in main function:", err);
  process.exit(1);
});
