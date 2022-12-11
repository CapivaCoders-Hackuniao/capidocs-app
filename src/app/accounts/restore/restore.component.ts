import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators, FormControl } from '@angular/forms';
import { Router } from '@angular/router';

import { CustomValidators } from 'ngx-custom-validators';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';

import { RestoreModel } from 'src/app/models/restore.model';
import { StorageService } from 'src/app/services/storage.service';
import { LocalStorageKeysEnum } from 'src/app/models/local-storage-keys.enum';
import { WalletService } from 'src/app/services/wallet.service';

@Component({
  selector: 'app-restore',
  templateUrl: './restore.component.html',
  styleUrls: ['./restore.component.css']
})
export class RestoreComponent {

  form: FormGroup;
  model: RestoreModel;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastrService: ToastrService,
    private spinner: NgxSpinnerService,
    private walletService: WalletService
  ) {
    const password = new FormControl('', [Validators.required, CustomValidators.rangeLength([6, 32])]);
    const confirmPassword = new FormControl('', [Validators.required, CustomValidators.rangeLength([6, 32]), CustomValidators.equalTo(password)]);

    this.form = this.fb.group({
      mneumonic: ['', [Validators.required]],
      password: password,
      confirmPassword: confirmPassword
    });
  }

  async restore() {
    try {
      this.spinner.show();
      this.model = Object.assign({}, this.model, this.form.value);

      const wallet = this.walletService.restore(this.model.mneumonic);
      await this.walletService.store(wallet, this.model.password);

      const toastr = this.toastrService.success('Success', 'Wallet restored!', {
        progressBar: true
      });

      if (toastr) {
        toastr.onHidden.subscribe(() => {
          this.spinner.hide();
          this.router.navigate(['/accounts/signin']);
        });
      }
    } catch{
      const toastr = this.toastrService.error('Error', 'Error to restore wallet!', {
        progressBar: true
      });

      if(toastr){
        toastr.onHidden.subscribe(() => {
          this.spinner.hide();
        });
      }
    }
  }
}
