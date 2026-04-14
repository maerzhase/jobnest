import fs from "node:fs";
import path from "node:path";

const rootDir = process.cwd();
const packageJsonPath = path.join(rootDir, "apps/jobnest/package.json");
const tauriConfigPath = path.join(rootDir, "apps/jobnest/src-tauri/tauri.conf.json");
const cargoTomlPath = path.join(rootDir, "apps/jobnest/src-tauri/Cargo.toml");
const cargoLockPath = path.join(rootDir, "apps/jobnest/src-tauri/Cargo.lock");
const checkMode = process.argv.includes("--check");

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
const nextVersion = packageJson.version;

const tauriConfig = JSON.parse(fs.readFileSync(tauriConfigPath, "utf8"));
const currentTauriVersion = tauriConfig.version;

const cargoToml = fs.readFileSync(cargoTomlPath, "utf8");
const cargoTomlMatch = cargoToml.match(/^version = "([^"]+)"$/m);
if (!cargoTomlMatch) {
  throw new Error(`Could not find package version in ${cargoTomlPath}`);
}
const currentCargoTomlVersion = cargoTomlMatch[1];

const cargoLock = fs.existsSync(cargoLockPath)
  ? fs.readFileSync(cargoLockPath, "utf8")
  : null;
const cargoLockMatch = cargoLock?.match(/name = "jobnest"\nversion = "([^"]+)"/);
const currentCargoLockVersion = cargoLockMatch?.[1] ?? null;

const mismatches = [
  ["tauri.conf.json", currentTauriVersion],
  ["Cargo.toml", currentCargoTomlVersion],
  ...(currentCargoLockVersion ? [["Cargo.lock", currentCargoLockVersion]] : []),
].filter(([, version]) => version !== nextVersion);

if (checkMode) {
  if (mismatches.length > 0) {
    const details = mismatches
      .map(([file, version]) => `${file}=${version}`)
      .join(", ");
    throw new Error(`jobnest version mismatch: package.json=${nextVersion}, ${details}`);
  }

  console.log(`jobnest versions are in sync at ${nextVersion}`);
  process.exit(0);
}

if (currentTauriVersion !== nextVersion) {
  tauriConfig.version = nextVersion;
  fs.writeFileSync(tauriConfigPath, `${JSON.stringify(tauriConfig, null, 2)}\n`);
}

if (currentCargoTomlVersion !== nextVersion) {
  fs.writeFileSync(
    cargoTomlPath,
    cargoToml.replace(/^version = "[^"]+"$/m, `version = "${nextVersion}"`),
  );
}

if (cargoLock && currentCargoLockVersion && currentCargoLockVersion !== nextVersion) {
  fs.writeFileSync(
    cargoLockPath,
    cargoLock.replace(
      /name = "jobnest"\nversion = "[^"]+"/,
      `name = "jobnest"\nversion = "${nextVersion}"`,
    ),
  );
}

console.log(`synced jobnest versions to ${nextVersion}`);
