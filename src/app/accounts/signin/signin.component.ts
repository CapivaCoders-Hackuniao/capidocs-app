import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { WalletService } from 'src/app/services/wallet.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { SignInService } from 'src/app/services/signin.service';
import { Router } from '@angular/router';
import { GlobalsService } from 'src/app/services/globals.service';
import { ethers } from 'ethers';
import { environment } from 'src/environments/environment';
import { Account } from 'src/app/models/account.model';
import { StorageService } from 'src/app/services/storage.service';
import { LocalStorageKeysEnum } from 'src/app/models/local-storage-keys.enum';

@Component({
	selector: 'app-signin',
	templateUrl: './signin.component.html',
	styleUrls: ['./signin.component.css'],
})
export class SignInComponent implements OnInit {
	
	form: FormGroup;
	password: string | undefined;

	selectedAddress: string | undefined;
	loadedAccounts: Account[] | undefined;
	accountSelect: boolean | undefined;

	constructor(
		private fb: FormBuilder,
		private walletService: WalletService,
		private toastrService: ToastrService,
		private spinner: NgxSpinnerService,
		private signInService: SignInService,
		private router: Router,
		private globals: GlobalsService,
		private storageService: StorageService
	) {
		this.form = this.fb.group({
			password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(15)]],
		});
	}

	ngOnInit() {
		this.loadAccountData();
	}

	loadAccountData() {
		this.loadedAccounts = [];
		const localAccounts: Account[] = this.storageService.getLocalStorage(LocalStorageKeysEnum.accounts);
		if (!localAccounts || localAccounts.length === 0) return;
		this.loadedAccounts = localAccounts;
	}

	deleteAccount(address: string) {
		this.storageService.removeLocalStorage(address);
		const newAccountsArray = this.loadedAccounts!.filter((acc) => acc.address != address);
		this.storageService.setLocalStorage(LocalStorageKeysEnum.accounts, newAccountsArray);
		this.loadAccountData();
	}

	async signIn() {
		try {
			this.spinner.show();
			this.globals.initLoader('Descriptografando carteira');
			this.password = this.form.controls['password'].value;
			const encryptWallet = this.walletService.getFromStorage(this.selectedAddress!);
			if (!encryptWallet) {
				const toastr = this.toastrService.error('Carteira não existe, crie ou importe uma!', '', {
					progressBar: true,
				});
				if (toastr)
					toastr.onHidden.subscribe(() => {
						this.spinner.hide();
					});
				return;
			}
			const wallet = await this.walletService.decrypt(encryptWallet, this.password!);
			this.signInService.setAddress(wallet.address);
			this.globals.ethersProvider = new ethers.providers.JsonRpcProvider(environment.blockchainNode);
			this.globals.userWallet = new ethers.Wallet(wallet.privateKey, this.globals.ethersProvider);
			this.globals.user.address = wallet.address;
			this.globals.initLoader('Lendo contratos');
			console.log('Lendo contratos')
			await this.walletService.initContracts();
			this.globals.clearLoader();
			this.spinner.hide();
			this.router.navigate(['/pages/home']);

		} catch (err) {
			console.error(err)
			const toastr = this.toastrService.error('Senha inválida!', '', {
				progressBar: true,
			});
			if (toastr)
				toastr.onHidden.subscribe(() => {
					this.spinner.hide();
				});
		}
	}

	runError(exception: any) {
		const toastr = this.toastrService.error(exception.error.errors[0], '', {
			progressBar: true,
		});

		if (toastr) toastr.onHidden.subscribe(() => {});
	}
}
