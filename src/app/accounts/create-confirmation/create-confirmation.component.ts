import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';

import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';

import { WalletService } from 'src/app/services/wallet.service';
import { StorageService } from 'src/app/services/storage.service';
import { LocalStorageKeysEnum } from 'src/app/models/local-storage-keys.enum';
import { CreateConfirmationModel } from 'src/app/models/create-confirmation.model';
import { Router } from '@angular/router';
import { GlobalsService } from '../../services/globals.service';

@Component({
	selector: 'app-create-confirmation',
	templateUrl: './create-confirmation.component.html',
	styleUrls: ['./create-confirmation.component.css'],
})
export class CreateConfirmationComponent implements OnInit {

	form: FormGroup;
	model: CreateConfirmationModel | undefined;

	constructor(
		private fb: FormBuilder,
		private router: Router,
		private toastrService: ToastrService,
		private spinner: NgxSpinnerService,
		private walletService: WalletService,
		private storageService: StorageService,
		private globalsService: GlobalsService,
	) {
		this.form = this.fb.group(
			{
				mnemonic: ['', Validators.required],
				password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(15)]],
				confirmPassword: ['', [Validators.required]],
				accountName: [''],
				accountCompany: [''],
			},
			{
				validators: this.checkPasswords,
			}
		);
	}

	ngOnInit(): void {
		const mneumonic = this.storageService.getLocalStorage(LocalStorageKeysEnum.mnemonic);
		this.form.patchValue({
			mnemonic: mneumonic,
		});
	}

	checkPasswords(group: FormGroup) {
		const pass = group.controls['password'].value;
		const confirmPass = group.controls['confirmPassword'].value;
		return pass === confirmPass ? null : { matching: true };
	}

	async confirm() {
		try {
			this.spinner.show();
			this.model = Object.assign({}, this.model, this.form.value);
			const localMnemonic = this.storageService.getLocalStorage(LocalStorageKeysEnum.mnemonic);
			if (localMnemonic !== this.model!.mnemonic) {
				const toastr = this.toastrService.error('Error', 'Mneumonic inválido!', {
					progressBar: true,
				});
				if (toastr) {
					toastr.onHidden.subscribe(() => {
						this.spinner.hide();
					});
					return;
				}
			}
			const wallet = this.walletService.restore(this.model!.mnemonic!);
			await this.walletService.store(wallet, this.model!.password!, this.model!.accountName, this.model!.accountCompany);
			const toastr = this.toastrService.success('Carteira criada!', '', {
				progressBar: true,
			});

			this.walletService.mint(this.globalsService.admin.tokenContract!, wallet.address, '5');

			if (toastr) {
				toastr.onHidden.subscribe(() => {
					this.storageService.removeLocalStorage(LocalStorageKeysEnum.mnemonic);
					this.spinner.hide();
					this.router.navigate(['/accounts/signin']);
				});
			}
		} catch (err) {
			const toastr = this.toastrService.error('Erro ao criar a carteira!', '', {
				progressBar: true,
			});
			if (toastr)
				toastr.onHidden.subscribe(() => {
					this.storageService.removeLocalStorage(LocalStorageKeysEnum.mnemonic);
					this.spinner.hide();
				});
		}
	}
}
