import crypto from 'crypto';

const algorithm = 'aes-256-gcm';

export class CryptoUtils {
  private static getKey(secret: string): Buffer {
    return crypto.scryptSync(secret, 'salt', 32);
  }

  static encrypt(text: string, secret: string): string {
    const key = this.getKey(secret);
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
  }

  static decrypt(encryptedText: string, secret: string): string {
    const parts = encryptedText.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const key = this.getKey(secret);
    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  static generateApiKey(): string {
    return 'fai_' + crypto.randomBytes(32).toString('hex');
  }

  static hashApiKey(apiKey: string): string {
    return crypto
      .createHash('sha256')
      .update(apiKey)
      .digest('hex');
  }

  static generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  static hmacSign(data: string, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(data)
      .digest('hex');
  }

  static verifyHmac(data: string, signature: string, secret: string): boolean {
    const expected = this.hmacSign(data, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    );
  }

  static maskSensitiveData(data: string, showChars: number = 4): string {
    if (data.length <= showChars * 2) {
      return '*'.repeat(data.length);
    }

    const start = data.slice(0, showChars);
    const end = data.slice(-showChars);
    const masked = '*'.repeat(Math.max(4, data.length - showChars * 2));

    return `${start}${masked}${end}`;
  }
}