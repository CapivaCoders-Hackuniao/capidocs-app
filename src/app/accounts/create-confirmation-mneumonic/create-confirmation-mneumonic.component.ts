import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { LocalStorageKeysEnum } from 'src/app/models/local-storage-keys.enum';
import { StorageService } from 'src/app/services/storage.service';
import ArrayUtil from 'src/app/utils/array.utl';

@Component({
  selector: 'app-create-confirmation-mneumonic',
  templateUrl: './create-confirmation-mneumonic.component.html',
  styleUrls: ['./create-confirmation-mneumonic.component.css']
})
export class CreateConfirmationMneumonicComponent implements OnInit {

  form: FormGroup;

  mneumonic: string | undefined;

  mneumonicRandom: string[] | undefined;
  selectedMneumonic: string[] = [];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private toastrService: ToastrService,
    private storageService: StorageService,
  ) {
    this.form = this.fb.group(
      {
        mnemonic: ['', Validators.required],
        selectMnemonic: ['', Validators.required],
      },
      {
        validators: this.checkMeneumonic,
      }
    );
  }

  checkMeneumonic(group: FormGroup) {
    const mnemonic = group.controls['mnemonic'].value;
    const selectedMneumonic = group.controls['selectMnemonic'].value;
    return mnemonic === selectedMneumonic ? null : { matching: true };
  }

  ngOnInit(): void {
    this.mneumonic = this.storageService.getLocalStorage(LocalStorageKeysEnum.mnemonic);
    this.form.patchValue({
      mnemonic: this.mneumonic,
    });
    let split = this.mneumonic!.split(' ');
    const random = ArrayUtil.randomArrayShuffle(split);
    this.mneumonicRandom = random;
  }

  addValue(value: string) {

    this.selectedMneumonic.push(value);

    const index = this.mneumonicRandom!.indexOf(value);
    if (index !== -1)
      this.mneumonicRandom!.splice(index, 1);

    let selectMneumonicString = this.selectedMneumonic.join(' ');

    this.form.patchValue({
      selectMnemonic: selectMneumonicString,
    });

    console.log('form', selectMneumonicString)
  }

  removeValue(value: string) {

    this.mneumonicRandom!.push(value);

    const index = this.selectedMneumonic.indexOf(value);
    if (index !== -1)
      this.selectedMneumonic.splice(index, 1);

    let selectMneumonicString = this.selectedMneumonic.join(' ');

    this.form.patchValue({
      selectMnemonic: selectMneumonicString,
    });

    console.log('form', selectMneumonicString)
  }

  async confirmation() {
    this.router.navigate(['/accounts/create-confirmation']);
  }
}
