/**
 * Creates a GitHub repository and pushes the project content
 * using the GitHub Git Data API via the Replit connectors SDK.
 */
import { ReplitConnectors } from "@replit/connectors-sdk";
import fs from "fs";
import path from "path";

const connectors = new ReplitConnectors();
const ROOT = path.resolve(import.meta.dirname, "..", "..");

// Directories and files to exclude
const EXCLUDE_DIRS = new Set([
  ".git", "node_modules", ".pnpm-store", "dist", "build",
  ".cache", ".turbo", "__pycache__", ".next", ".agents",
  ".local", ".replit-artifact",
]);
const EXCLUDE_FILES = new Set([
  ".DS_Store", "pnpm-lock.yaml", ".replit", "replit.nix",
  ".gitignore",
]);
const EXCLUDE_EXTENSIONS = new Set([
  ".map",
]);
const BINARY_EXTENSIONS = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".ico", ".woff", ".woff2",
  ".ttf", ".eot", ".otf", ".mp4", ".mp3", ".wav", ".pdf", ".zip",
  ".tar", ".gz", ".bin", ".exe", ".dll",
]);

// Max file size to push via API (1MB)
const MAX_FILE_SIZE = 1_000_000;

async function ghProxy(endpoint: string, options: { method?: string; body?: string } = {}) {
  const res = await connectors.proxy("github", endpoint, {
    method: options.method ?? "GET",
    body: options.body,
    headers: options.body ? { "Content-Type": "application/json" } : undefined,
  } as Parameters<typeof connectors.proxy>[2]);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub ${res.status} on ${endpoint}: ${text.slice(0, 300)}`);
  }
  return res.json();
}

function collectFiles(dir: string, base: string = ""): { path: string; absolutePath: string }[] {
  const results: { path: string; absolutePath: string }[] = [];

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return results;
  }

  for (const entry of entries) {
    const relativePath = base ? `${base}/${entry.name}` : entry.name;
    const absolutePath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (EXCLUDE_DIRS.has(entry.name)) continue;
      results.push(...collectFiles(absolutePath, relativePath));
    } else if (entry.isFile()) {
      if (EXCLUDE_FILES.has(entry.name)) continue;
      const ext = path.extname(entry.name).toLowerCase();
      if (EXCLUDE_EXTENSIONS.has(ext)) continue;
      if (BINARY_EXTENSIONS.has(ext)) continue;
      try {
        const stat = fs.statSync(absolutePath);
        if (stat.size > MAX_FILE_SIZE) continue;
      } catch {
        continue;
      }
      results.push({ path: relativePath, absolutePath });
    }
  }

  return results;
}

async function main() {
  // 1. Get authenticated user
  console.log("Fetching GitHub user info...");
  const user = await ghProxy("/user") as { login: string };
  console.log(`Authenticated as: ${user.login}`);

  const repoName = "pro-se-besties";
  const repoDescription =
    "A legal-tech platform helping workers navigate workplace discrimination, harassment, retaliation, and wrongful termination.";

  // 2. Create or get the repository — auto_init creates initial commit so git DB is ready
  let repoCreated = false;
  try {
    const existing = await ghProxy(`/repos/${user.login}/${repoName}`) as { html_url: string };
    console.log(`Repo already exists: ${existing.html_url}`);
  } catch {
    console.log(`Creating repository '${repoName}'...`);
    await ghProxy("/user/repos", {
      method: "POST",
      body: JSON.stringify({
        name: repoName,
        description: repoDescription,
        private: false,
        auto_init: true, // Creates initial commit so the git DB is initialized
      }),
    });
    console.log(`Repository created: https://github.com/${user.login}/${repoName}`);
    repoCreated = true;
    // Give GitHub a moment to set up
    await new Promise((r) => setTimeout(r, 2000));
  }

  // 3. Check if repo has commits. If empty, initialize it via the contents API.
  let parentSha: string | null = null;
  try {
    const ref = await ghProxy(`/repos/${user.login}/${repoName}/git/ref/heads/main`) as { object: { sha: string } };
    parentSha = ref.object.sha;
    console.log(`Current HEAD: ${parentSha}`);
  } catch {
    // Repo is empty — seed it so the git DB initializes
    console.log("Repo is empty, initializing with README...");
    await ghProxy(`/repos/${user.login}/${repoName}/contents/README.md`, {
      method: "PUT",
      body: JSON.stringify({
        message: "chore: initialize repository",
        content: Buffer.from(
          "# Pro Se Besties\n\nA legal-tech platform for workplace rights.\n"
        ).toString("base64"),
      }),
    });
    await new Promise((r) => setTimeout(r, 2000));
    const ref2 = await ghProxy(`/repos/${user.login}/${repoName}/git/ref/heads/main`) as { object: { sha: string } };
    parentSha = ref2.object.sha;
    console.log(`Initialized. HEAD: ${parentSha}`);
  }

  // 4. Collect all files
  console.log("Collecting project files...");
  const files = collectFiles(ROOT);
  console.log(`Found ${files.length} files to push.`);

  // 5. Create git blobs for each file
  console.log("Creating git blobs...");
  const treeItems: { path: string; mode: string; type: string; sha: string }[] = [];
  let i = 0;

  for (const file of files) {
    i++;
    if (i % 10 === 0 || i === files.length) {
      process.stdout.write(`  [${i}/${files.length}] ${file.path.padEnd(60).slice(0, 60)}\r`);
    }

    let content: string;
    try {
      content = fs.readFileSync(file.absolutePath, "utf-8");
    } catch {
      continue; // skip unreadable files
    }

    try {
      const blob = await ghProxy(`/repos/${user.login}/${repoName}/git/blobs`, {
        method: "POST",
        body: JSON.stringify({ content, encoding: "utf-8" }),
      }) as { sha: string };

      treeItems.push({
        path: file.path,
        mode: "100644",
        type: "blob",
        sha: blob.sha,
      });
    } catch (err) {
      console.error(`\n  Skipping ${file.path}: ${(err as Error).message.slice(0, 80)}`);
    }
  }

  console.log(`\n${treeItems.length} blobs created.`);

  // 6. Create a git tree
  console.log("Creating git tree...");
  const treePayload: { tree: typeof treeItems; base_tree?: string } = { tree: treeItems };
  // Don't use base_tree — we want a clean tree with only our files
  const tree = await ghProxy(`/repos/${user.login}/${repoName}/git/trees`, {
    method: "POST",
    body: JSON.stringify(treePayload),
  }) as { sha: string };

  // 7. Create commit
  console.log("Creating commit...");
  const commitPayload: { message: string; tree: string; parents?: string[] } = {
    message: "Initial commit: Pro Se Besties legal-tech platform\n\nFull project pushed from Replit.",
    tree: tree.sha,
  };
  if (parentSha) commitPayload.parents = [parentSha];

  const commit = await ghProxy(`/repos/${user.login}/${repoName}/git/commits`, {
    method: "POST",
    body: JSON.stringify(commitPayload),
  }) as { sha: string };

  // 8. Update main branch reference
  console.log("Updating main branch...");
  try {
    await ghProxy(`/repos/${user.login}/${repoName}/git/refs/heads/main`, {
      method: "PATCH",
      body: JSON.stringify({ sha: commit.sha, force: true }),
    });
  } catch {
    await ghProxy(`/repos/${user.login}/${repoName}/git/refs`, {
      method: "POST",
      body: JSON.stringify({ ref: "refs/heads/main", sha: commit.sha }),
    });
  }

  console.log(`\nSuccess! Your project is live on GitHub:`);
  console.log(`https://github.com/${user.login}/${repoName}`);
}

main().catch((err) => {
  console.error("\nFailed:", err.message);
  process.exit(1);
});
