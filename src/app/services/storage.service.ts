import { Injectable } from '@angular/core';

@Injectable()
export class StorageService {
	public setLocalStorage(key: string, data: any) {
		localStorage.setItem(key, JSON.stringify(data));
	}

	public getLocalStorage(key: string) {
		return JSON.parse(localStorage.getItem(key)!);
	}

	public removeLocalStorage(key: string) {
		localStorage.removeItem(key);
	}

	public clearLocalStorage() {
		localStorage.clear();
	}
}
