/**
 * Criptografia local para o PIN de perfil (AES-GCM + PBKDF2, via Web Crypto).
 *
 * Isso NÃO é uma conta protegida por senha num servidor — é uma segunda camada
 * de privacidade num aparelho compartilhado. Sem o PIN, o blob salvo no
 * localStorage é ilegível (cifrado), mas qualquer pessoa com acesso físico ao
 * navegador ainda pode, em teoria, tentar adivinhar o PIN offline.
 */

const PBKDF2_ITERATIONS = 150_000;

export interface EncryptedBlob {
  salt: string;
  iv: string;
  ciphertext: string;
}

export interface DerivedKey {
  key: CryptoKey;
  salt: Uint8Array;
}

function toBase64(bytes: Uint8Array): string {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(b64: string): Uint8Array {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

/** Deriva uma chave AES-GCM a partir do PIN. Reaproveite o resultado enquanto o perfil estiver desbloqueado. */
export async function deriveKey(pin: string, existingSalt?: Uint8Array): Promise<DerivedKey> {
  const salt = existingSalt ?? crypto.getRandomValues(new Uint8Array(16));
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(pin),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: PBKDF2_ITERATIONS, hash: "SHA-256" },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
  return { key, salt };
}

export async function encryptWithKey(data: unknown, derived: DerivedKey): Promise<EncryptedBlob> {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertextBuf = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    derived.key,
    new TextEncoder().encode(JSON.stringify(data)),
  );
  return {
    salt: toBase64(derived.salt),
    iv: toBase64(iv),
    ciphertext: toBase64(new Uint8Array(ciphertextBuf)),
  };
}

/** Retorna null se a chave estiver errada (PIN incorreto) ou o blob estiver corrompido. */
export async function decryptWithKey<T>(blob: EncryptedBlob, key: CryptoKey): Promise<T | null> {
  try {
    const iv = fromBase64(blob.iv);
    const plainBuf = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: iv as BufferSource },
      key,
      fromBase64(blob.ciphertext) as BufferSource,
    );
    return JSON.parse(new TextDecoder().decode(plainBuf)) as T;
  } catch {
    return null;
  }
}

export function saltFromBlob(blob: EncryptedBlob): Uint8Array {
  return fromBase64(blob.salt);
}
