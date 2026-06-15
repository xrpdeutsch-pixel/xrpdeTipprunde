import crypto from "crypto";

const ALGORITHM = "aes-256-gcm";

/**
 * Derives a 32-byte AES key from SETTINGS_ENCRYPTION_KEY (any length string,
 * e.g. generated via `openssl rand -hex 32`).
 */
function getKey(): Buffer {
  const secret = process.env.SETTINGS_ENCRYPTION_KEY;
  if (!secret) {
    throw new Error(
      "SETTINGS_ENCRYPTION_KEY ist nicht gesetzt. Bitte einen zufälligen Schlüssel (z.B. mit `openssl rand -hex 32`) in der .env hinterlegen, bevor Zugangsdaten gespeichert werden."
    );
  }
  return crypto.createHash("sha256").update(secret).digest();
}

/**
 * Encrypts a string with AES-256-GCM. Returns base64(iv | authTag | ciphertext).
 */
export function encrypt(plainText: string): string {
  const key = getKey();
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

export function decrypt(cipherText: string): string {
  const key = getKey();
  const data = Buffer.from(cipherText, "base64");
  const iv = data.subarray(0, 12);
  const authTag = data.subarray(12, 28);
  const encrypted = data.subarray(28);
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}
