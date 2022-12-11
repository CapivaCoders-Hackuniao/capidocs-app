import { Component } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

import { RestoreModel } from 'src/app/models/restore.model';
import { WalletService } from 'src/app/services/wallet.service';

@Component({
	selector: 'app-restore',
	templateUrl: './restore.component.html',
	styleUrls: ['./restore.component.css'],
})
export class RestoreComponent {
	form: FormGroup;
	model: RestoreModel | undefined;

	constructor(
		private fb: FormBuilder,
		private router: Router,
		private toastrService: ToastrService,
		private spinner: NgxSpinnerService,
		private walletService: WalletService
	) {
		this.form = this.fb.group(
			{
				mnemonic: ['', [Validators.required]],
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

	checkPasswords(group: FormGroup) {
		const pass = group.controls['password'].value;
		const confirmPass = group.controls['confirmPassword'].value;
		return pass === confirmPass ? null : { matching: true };
	}

	async restore() {
		try {
			this.spinner.show();
			this.model = Object.assign({}, this.model, this.form.value);
			const wallet = this.walletService.restore(this.model!.mnemonic!);
			await this.walletService.store(wallet, this.model!.password!, this.model!.accountName, this.model!.accountCompany);
			const toastr = this.toastrService.success('Carteira restaurada!', '', {
				progressBar: true,
			});
			if (toastr) {
				toastr.onHidden.subscribe(() => {
					this.spinner.hide();
					this.router.navigate(['/accounts/signin']);
				});
			}
		} catch (err) {
			console.log(err)
			const toastr = this.toastrService.error('Erro ao restaurar a carteira!', '', {
				progressBar: true,
			});
			if (toastr) {
				toastr.onHidden.subscribe(() => {
					this.spinner.hide();
				});
			}
		}
	}
}
