import { readdirSync, readFileSync } from "node:fs";
import { compileSchema } from "json-schema-library";
import {
  THEMES_DIR,
  INDEX_FILE,
  themesDirAbs,
  indexFileAbs,
  indexSchemaFileAbs,
  themeFileSchemaFileAbs,
  themeIdFromFileName,
} from "./theme-config.js";
import type { ThemeIndex } from "./theme-types.js";

function loadJSON<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf-8"));
}

const formatError = (file: string, error: { message: string; data?: { pointer?: string } }) =>
  `${file}: ${error.message} (at ${error.data?.pointer ?? "/"})`;

const indexSchemaDocument = loadJSON<any>(indexSchemaFileAbs);
const indexSchema = compileSchema(indexSchemaDocument);
const themeIdSchema = compileSchema(indexSchemaDocument.$defs.theme.properties.id);
const themeFileSchema = compileSchema(loadJSON<object>(themeFileSchemaFileAbs));
const index: ThemeIndex = loadJSON<ThemeIndex>(indexFileAbs);

const indexErrors = indexSchema.validate(index).errors.map((error) => formatError(INDEX_FILE, error));

const themeFiles = readdirSync(themesDirAbs)
  .filter((file) => file.endsWith(".json"))
  .sort();

const fileNameErrors = themeFiles.flatMap((file) =>
  themeIdSchema
    .validate(themeIdFromFileName(file))
    .errors.map((error) => `${THEMES_DIR}/${file}: the filename becomes the theme id. ${error.message}`)
);

const themeFileErrors = themeFiles.flatMap((file) => {
  const filePath = `${THEMES_DIR}/${file}`;
  const theme = loadJSON<object>(`${themesDirAbs}/${file}`);
  return themeFileSchema.validate(theme).errors.map((error) => formatError(filePath, error));
});

const ids = index.themes.map((theme) => theme.id);
const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);

const allErrors = [
  ...indexErrors,
  ...fileNameErrors,
  ...themeFileErrors,
  ...duplicates.map((id) => `Duplicate theme ID: ${id}`),
];

if (allErrors.length) {
  console.error("Validation failed:\n");
  allErrors.forEach((error) => console.error(`  - ${error}`));
  console.error();
  process.exit(1);
}

console.log(`Validated ${index.themes.length} theme(s) and ${themeFiles.length} theme file(s). All checks passed.`);
