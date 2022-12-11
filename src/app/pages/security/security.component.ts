import { Component, OnInit } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { WalletService } from 'src/app/services/wallet.service';
import { StorageService } from 'src/app/services/storage.service';
import { LocalStorageKeysEnum } from 'src/app/models/local-storage-keys.enum';

@Component({
  selector: 'app-security',
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.css']
})
export class SecurityComponent implements OnInit {
  privatekey = 'a9ac29cbeb110215ae6d5af5d8731a848160a3a7dabef198 b832a38d4b4385e2';
  mnemonic: LocalStorageKeysEnum;

  constructor(
    private toastrService: ToastrService,
    private walletService: WalletService,
    private storageService: StorageService,) { }

  ngOnInit(): void {
    const wallet = this.walletService.restore(this.mnemonic);

    this.storageService.setLocalStorage(LocalStorageKeysEnum.mneumonic, wallet.mnemonic.phrase);

  }

  copyToClipboarPrivateKey() {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = this.privatekey;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);


    this.toastrService.success('Chave privada copiada para a área de transferência!', 'Success', {
      progressBar: true
    });
  }

  copyToClipboarMnemonic() {
    const selBox = document.createElement('textarea');
    selBox.style.position = 'fixed';
    selBox.style.left = '0';
    selBox.style.top = '0';
    selBox.style.opacity = '0';
    selBox.value = this.mnemonic;
    document.body.appendChild(selBox);
    selBox.focus();
    selBox.select();
    document.execCommand('copy');
    document.body.removeChild(selBox);


    this.toastrService.success('Mnemonic copiado para a área de transferência!', 'Success', {
      progressBar: true
    });
  }

}