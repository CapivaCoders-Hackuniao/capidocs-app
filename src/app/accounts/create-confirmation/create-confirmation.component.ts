import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';

import { ToastrService } from 'ngx-toastr';
import { CustomValidators } from 'ngx-custom-validators';
import { NgxSpinnerService } from 'ngx-spinner';

import { WalletService } from 'src/app/services/wallet.service';
import { StorageService } from 'src/app/services/storage.service';
import { LocalStorageKeysEnum } from 'src/app/models/local-storage-keys.enum';
import { CreateConfirmationModel } from 'src/app/models/create-confirmation.model';
import { Router } from '@angular/router';


@Component({
  selector: 'app-create-confirmation',
  templateUrl: './create-confirmation.component.html',
  styleUrls: ['./create-confirmation.component.css']
})
export class CreateConfirmationComponent {

  form: FormGroup;
  model: CreateConfirmationModel;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastrService: ToastrService,
    private spinner: NgxSpinnerService,
    private walletService: WalletService,
    private storageService: StorageService
  ) {
    const password = new FormControl('', [Validators.required, CustomValidators.rangeLength([6, 32])]);
    const confirmPassword = new FormControl('', [Validators.required, , CustomValidators.rangeLength([6, 32]), CustomValidators.equalTo(password)]);

    this.form = this.fb.group({
      mneumonic: ['', Validators.required],
      password: password,
      confirmPassword: confirmPassword
    });
  }

  async confirm() {
    try {
      this.spinner.show();

      this.model = Object.assign({}, this.model, this.form.value);
      const localMneumonic = this.storageService.getLocalStorage(LocalStorageKeysEnum.mneumonic);

      if (localMneumonic !== this.model.mneumonic) {
        const toastr = this.toastrService.error('Error', 'Invalid Mneumonic!', {
          progressBar: true
        });
        if (toastr) {
          toastr.onHidden.subscribe(() => {
            this.spinner.hide();
          });
          return;
        }
      }

      const wallet = this.walletService.restore(this.model.mneumonic);
      await this.walletService.store(wallet, this.model.password);

      const toastr = this.toastrService.success('Success', 'Wallet created!', {
        progressBar: true
      });

      if (toastr) {
        toastr.onHidden.subscribe(() => {
          this.storageService.removeLocalStorage(LocalStorageKeysEnum.mneumonic);
          this.spinner.hide();
          this.router.navigate(['/accounts/signin']);
        });
      }
    } catch (err) {
      const toastr = this.toastrService.error('Error', 'Error to create wallet!', {
        progressBar: true
      });

      if (toastr)
        toastr.onHidden.subscribe(() => {
          this.storageService.removeLocalStorage(LocalStorageKeysEnum.mneumonic);
          this.spinner.hide();
        });
    }
  }
}
