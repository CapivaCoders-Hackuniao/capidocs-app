import { Injectable } from "@angular/core";
import { StorageService } from './storage.service';
import { LocalStorageKeysEnum } from '../models/local-storage-keys.enum';
import { SecurityService } from './security.service';
import { environment } from '../../environments/environment';

@Injectable()
export class SigninService {

    constructor(
        private storageService: StorageService,
    ) { }

    clearLocalStorageLogout() {
        this.storageService.removeLocalStorage(LocalStorageKeysEnum.address);
        this.storageService.removeLocalStorage(LocalStorageKeysEnum.password);
    }
}
