import { ethers, Wallet } from 'ethers';
import { LocalStorageKeysEnum } from '../models/local-storage-keys.enum';
import { StorageService } from './storage.service';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';

import { default as token } from '../../../contracts/Token.json';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { GlobalsService } from './globals.service';
import { Account } from '../models/account.model';

@Injectable()
export class WalletService {

	constructor(
		private storageService: StorageService,
		public globals: GlobalsService,
		private spinner: NgxSpinnerService,
		private toastrService: ToastrService
	) { }

	create() {
		return ethers.Wallet.createRandom();
	}

	restore(mnemonic: string) {
		return ethers.Wallet.fromMnemonic(mnemonic);
	}

	async store(wallet: Wallet, password: string, name?: string, company?: string) {
		const options = {
			scrypt: {
				N: 1 << environment.scryptDiff,
			},
		};
		const encrypted = await wallet.encrypt(password, options);
		this.storageService.setLocalStorage(wallet.address, encrypted);
		this.processAccounts(wallet.address, name!, company!);
	}

	private processAccounts(address: string, name: string, company: string) {
		const accounts = this.storageService.getLocalStorage(LocalStorageKeysEnum.accounts);
		const accountsArray: Account[] = accounts ? accounts : [];
		accountsArray.push({ address: address, name: name, company: company });
		this.storageService.setLocalStorage(LocalStorageKeysEnum.accounts, accountsArray);
	}

	getFromStorage(address: string) {
		return this.storageService.getLocalStorage(address);
	}

	decrypt(encryptedWallet: string, password: string) {
		return ethers.Wallet.fromEncryptedJson(encryptedWallet, password, (progress: number) => {
			this.globals.loaderProgress = progress * 100;
		});
	}

	async initContracts() {
		this.globals.ethersProvider = new ethers.providers.JsonRpcProvider(environment.blockchainNode);
		this.globals.user.tokenContract = new ethers.Contract(environment.tokenAddress, token.abi, this.globals.userWallet);
		this.globals.admin.tokenContract = new ethers.Contract(environment.tokenAddress, token.abi, this.globals.adminWallet);
		await Promise.all([this.readBalance(), this.readRoles()]);
		this.setTransferListener();
		this.setRolesListener();
	}

	private async readRoles() {
		const [userIsAdmin, userIsMinter, userIsBurner] = await Promise.all([
			this.globals.user.tokenContract!['hasRole'](environment.tokenRoles.admin, this.globals.user.address),
			this.globals.user.tokenContract!['hasRole'](environment.tokenRoles.minter, this.globals.user.address),
			this.globals.user.tokenContract!['hasRole'](environment.tokenRoles.burner, this.globals.user.address),
		]);

		const [adminIsAdmin, adminIsMinter, adminIsBurner] = await Promise.all([
			this.globals.user.tokenContract!['hasRole'](environment.tokenRoles.admin, this.globals.admin.address),
			this.globals.user.tokenContract!['hasRole'](environment.tokenRoles.minter, this.globals.admin.address),
			this.globals.user.tokenContract!['hasRole'](environment.tokenRoles.burner, this.globals.admin.address),
		]);

		this.globals.user.isAdmin = userIsAdmin;
		this.globals.user.isMinter = userIsMinter;
		this.globals.user.isBurner = userIsBurner;

		this.globals.admin.isAdmin = adminIsAdmin;
		this.globals.admin.isMinter = adminIsMinter;
		this.globals.admin.isBurner = adminIsBurner;
	}

	private async readBalance() {

		const [userBalance, userEth] = await Promise.all([
			this.globals.user.tokenContract!['balanceOf'](this.globals.userWallet!.address),
			this.globals.ethersProvider!.getBalance(this.globals.user.address!),
		]);

		const [adminBalance, adminEth] = await Promise.all([
			this.globals.user.tokenContract!['balanceOf'](this.globals.userWallet!.address),
			this.globals.ethersProvider!.getBalance(this.globals.user.address!),
		]);

		this.globals.user.balance = ethers.utils.formatEther(userBalance);
		this.globals.user.eth = ethers.utils.formatEther(userEth);
		this.globals.user.lowGas = userEth.lte(ethers.utils.parseEther(environment.minimumGas.toFixed(18)));

		this.globals.admin.balance = ethers.utils.formatEther(adminBalance);
		this.globals.admin.eth = ethers.utils.formatEther(adminEth);
		this.globals.admin.lowGas = adminEth.lte(ethers.utils.parseEther(environment.minimumGas.toFixed(18)));
	}

	setRolesListener() {
		this.globals.user.tokenContract!.on('RoleGranted', (role: any, account: any) => {
			if (account == this.globals.userWallet!.address || account == this.globals.adminWallet?.address) this.readRoles();
		});
		this.globals.user.tokenContract!.on('RoleRevoked', (role: any, account: any) => {
			if (account == this.globals.userWallet!.address || account == this.globals.adminWallet?.address) this.readRoles();
		});
	}

	setTransferListener() {
		this.globals.user.tokenContract!.on('Transfer', (from: any, to: any) => {
			if (from == this.globals.userWallet!.address || to == this.globals.userWallet!.address ||
				from == this.globals.adminWallet!.address || to == this.globals.adminWallet!.address)
				this.readBalance();
		});
	}

	transfer(recipient: string, amount: string) {

		this.getGasPrice().then((gasPrice) => {
			this.processCall(this.globals.user.tokenContract!['transfer'](
				recipient,
				ethers.utils.parseEther(amount),
				{ gasPrice: gasPrice }
			));
		});

	}

	transferFrom(sender: string, recipient: string, amount: string) {
		this.getGasPrice().then((gasPrice) => {
			this.processCall(this.globals.user.tokenContract!['transferFrom'](
				sender,
				recipient,
				ethers.utils.parseEther(amount),
				{ gasPrice: gasPrice }));
		});
	}

	approve(spender: string, amount: string) {
		this.getGasPrice().then((gasPrice) => {
			this.processCall(this.globals.user.tokenContract!['approve'](
				spender,
				ethers.utils.parseEther(amount),
				{ gasPrice: gasPrice }));
		});
	}

	increaseAllowance(spender: string, amount: string) {
		this.getGasPrice().then((gasPrice) => {
			this.processCall(this.globals.user.tokenContract!['increaseAllowance'](
				spender,
				ethers.utils.parseEther(amount),
				{ gasPrice: gasPrice }));
		});
	}

	decreaseAllowance(spender: string, amount: string) {
		this.getGasPrice().then((gasPrice) => {
			this.processCall(this.globals.user.tokenContract!['decreaseAllowance'](
				spender,
				ethers.utils.parseEther(amount),
				{ gasPrice: gasPrice }));
		});
	}

	mint(contract: ethers.Contract, to: string, amount: string) {
		this.getGasPrice().then((gasPrice) => {
			this.processCall(contract['mint'](
				to,
				ethers.utils.parseEther(amount),
				{ gasPrice: gasPrice }));
		});
	}

	burnFrom(contract: ethers.Contract,from: string, amount: string) {
		this.getGasPrice().then((gasPrice) => {
			this.processCall(contract['burnFrom'](
				from,
				ethers.utils.parseEther(amount),
				{ gasPrice: gasPrice }));
		});
	}

	grantRole(role: string, account: string) {
		this.getGasPrice().then((gasPrice) => {
			this.processCall(this.globals.user.tokenContract!['grantRole'](
				role,
				account,
				{ gasPrice: gasPrice }));
		});
	}

	revokeRole(role: string, account: string) {
		this.getGasPrice().then((gasPrice) => {
			this.processCall(this.globals.user.tokenContract!['revokeRole'](
				role,
				account,
				{ gasPrice: gasPrice }));
		})
	}

	async getGasPrice() {
		const gasPrice = await this.globals.ethersProvider!.getGasPrice();
		console.log(`gasPrice ${gasPrice}`);
		return gasPrice;
	}

	processCall(call: any, resolve = () => { }, errAns = () => { }) {
		this.globals.initLoader('Processando a transação');
		this.spinner.show();
		let loader = 0;
		const interval = setInterval(() => {
			loader += ((100 - loader) * Math.random()) / (5 + loader);
			if (loader > 99.9) loader = 99.99;
			this.globals.loaderProgress = loader;
		}, 100);
		call.then(
			(tx: any) => {
				tx.wait().then((receipt: any) => {
					this.spinner.hide();
					clearInterval(interval);
					console.log(`tx hash ${receipt.transactionHash}`);
					this.toastrService.success(
						'Transação ' + receipt.transactionHash + ' completa no bloco ' + receipt.blockNumber,
						'',
						{
							disableTimeOut: true,
							closeButton: true
						}
					);
					this.globals.clearLoader();
					resolve();
				}),
					(err: any) => {
						clearInterval(interval);
						this.showErr(err);
						errAns();
					};
			},
			(err: any) => {
				clearInterval(interval);
				this.showErr(err);
				errAns();
			}
		);
	}

	showErr(err: any) {
		console.warn(err);
		this.globals.loaderProgress = 0;
		const toastr = this.toastrService.error('Error', 'Error when sending the transaction: ' + err, {
			progressBar: true,
		});
		if (toastr)
			toastr.onHidden.subscribe(() => {
				this.spinner.hide();
			});
		this.globals.clearLoader();
	}
}
