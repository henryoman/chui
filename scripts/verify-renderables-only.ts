import { readFile } from "node:fs/promises";

const scanTargets = [
  "src",
];

const disallowedImportPatterns = [
  {
    pattern: /from\s+["']@opentui\/solid["']/,
    reason: "Use @opentui/core Renderables only.",
  },
  {
    pattern: /from\s+["']@opentui\/react["']/,
    reason: "Use @opentui/core Renderables only.",
  },
  {
    pattern: /from\s+["']@opentui\/core\/renderables\/composition\/constructs["']/,
    reason: "Constructs are disallowed in this codebase.",
  },
];

const disallowedCoreImports = [
  "h",
  "Box",
  "Text",
  "ScrollBox",
  "Input",
  "ASCIIFont",
  "Generic",
];

const listSourceFiles = async (dir: string): Promise<string[]> => {
  const proc = Bun.spawn(["rg", "--files", dir], {
    stdout: "pipe",
    stderr: "pipe",
  });

  const exitCode = await proc.exited;
  if (exitCode !== 0) {
    throw new Error(`Failed to list files in ${dir}`);
  }

  const output = await new Response(proc.stdout).text();
  return output
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.endsWith(".ts") || line.endsWith(".tsx"));
};

const main = async () => {
  const sourceFiles = (await Promise.all(scanTargets.map((dir) => listSourceFiles(dir)))).flat();
  const violations: string[] = [];

  for (const file of sourceFiles) {
    const content = await readFile(file, "utf8");

    for (const entry of disallowedImportPatterns) {
      if (entry.pattern.test(content)) {
        violations.push(`${file}: ${entry.reason}`);
      }
    }

    for (const symbol of disallowedCoreImports) {
      const re = new RegExp(
        String.raw`import\s*{[^}]*\b${symbol}\b[^}]*}\s*from\s*["']@opentui\/core["']`,
        "m",
      );
      if (re.test(content)) {
        violations.push(`${file}: Disallowed @opentui/core construct helper import '${symbol}'.`);
      }
    }
  }

  if (violations.length > 0) {
    console.error("OpenTUI policy violation: this repo is Renderables-only.");
    for (const line of violations) {
      console.error(`- ${line}`);
    }
    process.exit(1);
  }

  console.log("OpenTUI policy check passed (Renderables-only).");
};

await main();
