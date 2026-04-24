import crypto from "node:crypto";

interface EncryptionKeys {
  [version: string]: Buffer;
}

function loadKeys(): EncryptionKeys {
  const keys: EncryptionKeys = {};
  for (let i = 1; i <= 10; i++) {
    const keyHex = process.env[`ENCRYPTION_KEY_V${i}`];
    if (keyHex) {
      keys[`v${i}`] = Buffer.from(keyHex, "hex");
    }
  }
  if (Object.keys(keys).length === 0) {
    throw new Error("No encryption keys configured");
  }
  return keys;
}

let _keys: EncryptionKeys | null = null;
function getKeys(): EncryptionKeys {
  if (!_keys) _keys = loadKeys();
  return _keys;
}

function getCurrentVersion(): string {
  return `v${process.env.ENCRYPTION_KEY_CURRENT_VERSION || "1"}`;
}

export function encrypt(plaintext: string): string {
  const keys = getKeys();
  const version = getCurrentVersion();
  const key = keys[version];
  if (!key) throw new Error(`Encryption key ${version} not found`);

  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();

  return `${version}:${iv.toString("hex")}:${encrypted.toString("hex")}:${tag.toString("hex")}`;
}

export function decrypt(ciphertext: string): string {
  const keys = getKeys();
  const [version, ivHex, encryptedHex, tagHex] = ciphertext.split(":");
  const key = keys[version];
  if (!key)
    throw new Error(
      `Encryption key ${version} not found. Key rotation needed.`
    );

  const iv = Buffer.from(ivHex, "hex");
  const encrypted = Buffer.from(encryptedHex, "hex");
  const tag = Buffer.from(tagHex, "hex");

  const decipher = crypto.createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(tag);
  return decipher.update(encrypted).toString("utf8") + decipher.final("utf8");
}

export function needsReEncryption(ciphertext: string): boolean {
  const version = ciphertext.split(":")[0];
  return version !== getCurrentVersion();
}

export function reEncrypt(ciphertext: string): string {
  const plaintext = decrypt(ciphertext);
  return encrypt(plaintext);
}
