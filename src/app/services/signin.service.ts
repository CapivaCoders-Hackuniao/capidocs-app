import { Injectable } from "@angular/core";
import { StorageService } from './storage.service';
import { LocalStorageKeysEnum } from '../models/local-storage-keys.enum';
import { BehaviorSubject } from 'rxjs';

@Injectable()
export class SignInService {

    private _address = new BehaviorSubject<string>('');

    constructor(
        private storageService: StorageService,
    ) { }

    get address() {
        return this._address.asObservable();
    }

    setAddress(address: string) {
        this.storageService.setLocalStorage(LocalStorageKeysEnum.address, address);
    }

    getAddress() {
        return this.storageService.getLocalStorage(LocalStorageKeysEnum.address);
    }

    updateAddressStore() {
        this._address.next(this.storageService.getLocalStorage(LocalStorageKeysEnum.address));
    }
}