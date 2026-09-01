import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { THEMES_DIR, INDEX_FILE, INDEX_VERSION, themesDirAbs, indexFileAbs, themeIdFromFileName } from "./theme-config.js";
import type { ThemeFile, ThemeIndexEntry, ThemeIndex } from "./theme-types.js";

const REQUIRED_FIELDS = ["name", "description", "author", "tags", "palette"] as const;

function parseThemeFile(file: string): ThemeIndexEntry {
  const filePath = `${THEMES_DIR}/${file}`;
  const theme: ThemeFile = JSON.parse(readFileSync(`${themesDirAbs}/${file}`, "utf-8"));
  const id = themeIdFromFileName(file);

  const missingFields = REQUIRED_FIELDS.filter((field) => theme[field] === undefined);
  if (missingFields.length) {
    throw new Error(`${filePath}: missing required fields: ${missingFields.join(", ")}`);
  }

  return {
    id,
    name: theme.name,
    description: theme.description,
    author: theme.author,
    tags: theme.tags,
    palette: theme.palette,
    path: filePath,
  };
}

function checkForDuplicates(entries: ThemeIndexEntry[]): void {
  const ids = entries.map((entry) => entry.id);
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length) {
    throw new Error(`Duplicate theme ids: ${duplicates.join(", ")}`);
  }
}

const files = readdirSync(themesDirAbs)
  .filter((file) => file.endsWith(".json"))
  .sort();

const entries = files.map(parseThemeFile);
checkForDuplicates(entries);

const index: ThemeIndex = {
  $schema: "./schema/themes.schema.json",
  version: INDEX_VERSION,
  themes: entries,
};

writeFileSync(indexFileAbs, JSON.stringify(index, null, 2) + "\n");
console.log(`Wrote ${INDEX_FILE} with ${entries.length} themes`);
