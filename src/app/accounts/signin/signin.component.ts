import { Component, Inject } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { ethers } from 'ethers';
import { CustomValidators } from 'ngx-custom-validators';
import { WalletService } from 'src/app/services/wallet.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { SigninService } from 'src/app/services/signin.service';
import { Router } from '@angular/router';
import { provider } from 'src/app/services/ethers.service';
import { ModalService } from 'src/app/_modal';
import { Globals } from 'src/app/globals';
import { SmartContractsService } from 'src/app/services/smart-contracts.service';
import { SecurityService } from 'src/app/services/security.service';

@Component({
	selector: 'app-signin',
	templateUrl: './signin.component.html',
	styleUrls: ['./signin.component.css'],
})
export class SigninComponent {
	form: FormGroup;
	password: string;

	balance: string = '0';

	constructor(
		@Inject(provider) private ethersProvider: ethers.providers.Web3Provider,
		private fb: FormBuilder,
		private walletService: WalletService,
		private spinner: NgxSpinnerService,
		private signinService: SigninService,
		private router: Router,
		private toastrService: ToastrService,
		private scService: SmartContractsService,
		public modalService: ModalService,
		public globals: Globals
	) {
		this.form = this.fb.group({
			password: ['', [Validators.required, CustomValidators.rangeLength([6, 32])]],
		});
	}

	openModal(id: string) {
		this.modalService.open(id);
	}

	closeModal(id: string) {
		this.modalService.close(id);
	}

	async signin() {
		try {
			this.globals.ethersProvider = await this.ethersProvider;
			this.spinner.show();
			this.password = this.form.controls.password.value;
			const encryptWallet = this.walletService.getFromStorage();
			if (!encryptWallet) {
				const toastr = this.toastrService.error('Error', 'Wallet do not exists, create or restore one!', {
					progressBar: true,
				});
				if (toastr)
					toastr.onHidden.subscribe(() => {
						this.spinner.hide();
					});
				return;
			}
			const wallet = await this.walletService.decrypt(encryptWallet, this.password);
			this.globals.userAddress = wallet.address;
			const balance = await this.globals.ethersProvider.getBalance(this.globals.userAddress);
			this.globals.balance = ethers.utils.formatEther(balance);
			this.globals.userWallet = new ethers.Wallet(wallet.privateKey, this.globals.ethersProvider);
			this.globals.loaderProgress = '';
			await this.loadContracts();
			this.spinner.hide();
			this.openModal('confirmIdentity');
		} catch (err) {
			console.error(err);
			const toastr = this.toastrService.error('Error', 'Error to log in!', {
				progressBar: true,
			});
			if (toastr)
				toastr.onHidden.subscribe(() => {
					this.spinner.hide();
				});
		}
	}

	async loadContracts() {
		await this.scService.loadContracts();
	}

	async confirm() {

		if (this.globals.balance === '0.0') {
			this.toastrService.warning('Você deve ter saldo em CELO para continuar');
			return;
		}

		this.closeModal('confirmIdentity');
		if (this.globals.hasPersona) {
			this.spinner.show();
			await this.globals.persona.loadPersona((progress: number) => {
				this.loaderCallback(progress);
			}, this.scService);
			this.spinner.hide();
			this.globals.registry.loadValidators(() => { }, this.scService);
		}
		if (this.globals.hasValidator) {
			this.spinner.show();
			await this.globals.validator.loadValidator((progress: number) => {
				this.loaderCallback(progress);
			}, this.scService);
			this.spinner.hide();
		}
		this.globals.loaderProgress = '';
		this.router.navigate(['/pages/dashboard']);
	}

	admin() {
		this.closeModal('confirmIdentity');
		this.spinner.show();
		this.globals.registry
			.loadRegistryAdmin((progress: number) => {
				this.loaderCallback(progress);
			}, this.scService)
			.then(
				() => {
					this.spinner.hide();
					this.globals.loaderProgress = '';
					this.router.navigate(['/pages/admin']);
				},
				(err) => {
					console.warn(err);
					this.spinner.hide();
				}
			);
	}

	loaderCallback(progressBar: number) {
		if (progressBar == 0) this.globals.loaderProgress = '';
		else this.globals.loaderProgress = progressBar.toFixed(2);
	}
}
