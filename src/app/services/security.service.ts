import * as CryptoJS from 'crypto-js';
import { encrypt, decrypt } from 'eccrypto-js';
import { publicKeyConvert } from 'secp256k1';

export class SecurityService {
	ec: any;

	constructor() {}

	encryptAES(data: any, password: string) {
		return CryptoJS.AES.encrypt(JSON.stringify(data), password).toString();
	}

	async decryptAES(data: string, password: string) {
		const bytes = CryptoJS.AES.decrypt(data, password);
		if (bytes.toString()) {
			return await JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
		}
		throw 'Unable to decrypt';
	}

	async encryptWithPublicKey(publicKey: string, message: string): Promise<string> {
		return await this.ecEncryptWithPublicKey(publicKey, message);
	}

	async decryptWithPrivateKey(privateKey: string, encrypted: string): Promise<string> {
		return await this.ecDecryptWithPrivateKey(privateKey, encrypted);
	}

	async ecEncryptWithPublicKey(publicKey: string, message: string): Promise<string> {
		const enc = new TextEncoder();
		const messageBytes = enc.encode(this.removeTrailing0x(message));
		const pubString = this.removeTrailing0x(publicKey);
		const encryptedBuffers = await encrypt(Buffer.from(pubString, 'hex'), Buffer.from(messageBytes));
		const encrypted = {
			iv: encryptedBuffers.iv.toString('hex'),
			ephemPublicKey: encryptedBuffers.ephemPublicKey.toString('hex'),
			ciphertext: encryptedBuffers.ciphertext.toString('hex'),
			mac: encryptedBuffers.mac.toString('hex'),
		};
		return this.stringify(encrypted);
	}

	async ecDecryptWithPrivateKey(privateKey: string, encryptedStr: string): Promise<string> {
		const encrypted = this.parse(encryptedStr);
		const twoStripped = this.removeTrailing0x(privateKey);
		const encryptedBuffer = {
			iv: Buffer.from(encrypted.iv, 'hex'),
			ephemPublicKey: Buffer.from(encrypted.ephemPublicKey, 'hex'),
			ciphertext: Buffer.from(encrypted.ciphertext, 'hex'),
			mac: Buffer.from(encrypted.mac, 'hex'),
		};
		const decryptedBuffer = await decrypt(Buffer.from(twoStripped, 'hex'), encryptedBuffer);
		return decryptedBuffer.toString();
	}

	stringify(cipher: { ephemPublicKey: string; iv: string; mac: string; ciphertext: string }): string {
		if (typeof cipher === 'string') return cipher;
		const compressedKey = this.compress(cipher.ephemPublicKey);
		const ret = Buffer.concat([
			Buffer.from(cipher.iv, 'hex'), // 16bit
			Buffer.from(compressedKey, 'hex'), // 33bit
			Buffer.from(cipher.mac, 'hex'), // 32bit
			Buffer.from(cipher.ciphertext, 'hex'), // var bit
		]);
		return ret.toString('hex');
	}

	parse(str: string): { ephemPublicKey: string; iv: string; mac: string; ciphertext: string } {
		if (typeof str !== 'string') return str;
		const buf = Buffer.from(str, 'hex');
		const ret = {
			iv: buf.toString('hex', 0, 16),
			ephemPublicKey: buf.toString('hex', 16, 49),
			mac: buf.toString('hex', 49, 81),
			ciphertext: buf.toString('hex', 81, buf.length),
		};
		ret.ephemPublicKey = '04' + this.decompress(ret.ephemPublicKey);

		return ret;
	}

	compress(startsWith04: string): string {
		const testBuffer = Buffer.from(startsWith04, 'hex');
		if (testBuffer.length === 64) startsWith04 = '04' + startsWith04;
		return this.uint8ArrayToHex(publicKeyConvert(Buffer.from(startsWith04, 'hex'), true));
	}

	decompress(startsWith02Or03: string): string {
		const testBuffer = Buffer.from(startsWith02Or03, 'hex');
		if (testBuffer.length === 64) startsWith02Or03 = '04' + startsWith02Or03;
		let decompressed = this.uint8ArrayToHex(publicKeyConvert(Buffer.from(startsWith02Or03, 'hex'), false));
		decompressed = decompressed.substring(2);
		return decompressed;
	}

	removeTrailing0x(str: string): string {
		if (str.startsWith('0x')) return str.substring(2);
		else return str;
	}

	uint8ArrayToHex(arr: ArrayBuffer | SharedArrayBuffer): string {
		return Buffer.from(arr).toString('hex');
	}
}
