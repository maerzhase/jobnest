const jobnestVersion = process.env.NEXT_PUBLIC_JOBNEST_VERSION;

if (!jobnestVersion) {
  throw new Error("NEXT_PUBLIC_JOBNEST_VERSION is not defined.");
}

export const JOBNEST_VERSION = jobnestVersion;
