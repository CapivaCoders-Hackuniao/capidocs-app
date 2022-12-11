import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { Globals } from 'src/app/globals';
import { Persona } from '../../models/persona.model';
import { LocalStorageKeysEnum } from 'src/app/models/local-storage-keys.enum';
import { StorageService } from 'src/app/services/storage.service';
import { WalletService } from 'src/app/services/wallet.service';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  address: string;
  showPrivate = false;

  constructor(
    private toastrService: ToastrService,
    public globals: Globals,
    private walletService: WalletService,
    private storageService: StorageService
  ) { }

  ngOnInit(): void {

  }

  copyToclipBoardAddress(value: string) {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = value;

    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);


    this.toastrService.success('Address to clipboard!', 'Success', {
      progressBar: true
    });
  }

}
