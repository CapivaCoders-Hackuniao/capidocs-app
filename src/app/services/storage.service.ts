import { LocalStorageKeysEnum } from '../models/local-storage-keys.enum';
import { Injectable } from '@angular/core';

@Injectable()
export class StorageService {
    public setLocalStorage(key: LocalStorageKeysEnum, data: any) {
        localStorage.setItem(key, JSON.stringify(data));
    }

    public getLocalStorage(key: LocalStorageKeysEnum) {
        return JSON.parse(localStorage.getItem(key));
    }

    public removeLocalStorage(key: LocalStorageKeysEnum) {
        localStorage.removeItem(key);
    }

    public clearLocalStorage() {
        localStorage.clear();
    }
}