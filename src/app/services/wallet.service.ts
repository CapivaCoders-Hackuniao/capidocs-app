import { ethers } from 'ethers';
import { LocalStorageKeysEnum } from '../models/local-storage-keys.enum';
import { StorageService } from './storage.service';
import { Injectable } from '@angular/core';
import { Globals } from 'src/app/globals';
import { environment } from 'src/environments/environment';

@Injectable()
export class WalletService {
	constructor(private storageService: StorageService, private globals: Globals) {}
	create() {
		return ethers.Wallet.createRandom();
	}

	restore(mneumonic) {
		return ethers.Wallet.fromMnemonic(mneumonic);
	}

	async store(wallet: any, password: string) {
		const options = {
			scrypt: {
				N: 1 << environment.scryptDiff,
			},
		};
		const encrypted = await wallet.encrypt(password, options);
		this.storageService.setLocalStorage(LocalStorageKeysEnum.wallet, encrypted);
	}

	getFromStorage() {
		return this.storageService.getLocalStorage(LocalStorageKeysEnum.wallet);
	}

	decrypt(encryptedWallet, password: string) {
		return ethers.Wallet.fromEncryptedJson(encryptedWallet, password, (progress) => {
			this.globals.loaderProgress = (progress * 100).toFixed(2);
		});
	}
}
