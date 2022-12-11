import { Injectable } from '@angular/core';
import { ethers } from 'ethers';
import { User } from '../models/user.model';

@Injectable({
	providedIn: 'root',
})
export class GlobalsService {

	adminWallet: ethers.Wallet | undefined;
	admin: User;
	userWallet: ethers.Wallet | undefined;
	user: User;
	ethersProvider: ethers.providers.BaseProvider | undefined;

	loaderProgress: Number;
	showLoader: boolean = false;
	loaderMessage: string = '';

	constructor() {
		this.loaderProgress = 0;
		this.user = new User();
		this.admin = new User();
	}

	initLoader(message = '') {
		this.showLoader = true;
		this.loaderProgress = 0;
		this.loaderMessage = message;
	}

	clearLoader() {
		this.showLoader = false;
		this.loaderProgress = 0;
		this.loaderMessage = '';
	}
}
