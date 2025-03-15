import { readFileSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";


export const readJson = (path: string) => {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = dirname(__filename);

    const fullPath = join(__dirname, path);
    const json = JSON.parse(readFileSync(fullPath, 'utf8'));

    return json;
}