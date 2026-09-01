import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = resolve(__dirname, "..");

export const THEMES_DIR = "themes";
export const INDEX_FILE = "themes.json";
export const INDEX_VERSION = 1;
export const INDEX_SCHEMA_FILE = "schema/themes.schema.json";
export const THEME_FILE_SCHEMA_FILE = "schema/theme-file.schema.json";

export const themesDirAbs = resolve(PROJECT_ROOT, THEMES_DIR);
export const indexFileAbs = resolve(PROJECT_ROOT, INDEX_FILE);
export const indexSchemaFileAbs = resolve(PROJECT_ROOT, INDEX_SCHEMA_FILE);
export const themeFileSchemaFileAbs = resolve(PROJECT_ROOT, THEME_FILE_SCHEMA_FILE);

export const themeIdFromFileName = (file: string) => file.replace(/\.json$/, "");
