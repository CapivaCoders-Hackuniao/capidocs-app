import { InjectionToken } from '@angular/core';
import { ethers } from 'ethers';
import { environment } from 'src/environments/environment';

export const provider = new InjectionToken('provider', {
    providedIn: 'root',
    factory: async () => {
        try {
            const provider = new ethers.providers.JsonRpcProvider(environment.blockchainNode);
            return provider;
        } catch (err) {
            throw new Error('Non-Ethereum browser detected. You should consider trying Mist or MetaMask!');
        }
    }
});
