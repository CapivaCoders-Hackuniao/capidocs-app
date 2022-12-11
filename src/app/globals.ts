import { Injectable } from '@angular/core';
import { Persona } from './models/persona.model';
import { Validator } from './models/validator.model';
import { Registry } from './models/registry.model';
import { ethers } from 'ethers';

@Injectable()
export class Globals {
	ethersProvider: ethers.providers.Web3Provider;
	userWallet: ethers.Wallet;
	userAddress: string;
	password: string;
	persona: Persona;
	hasPersona: boolean;
	validator: Validator;
	hasValidator: boolean;
	registry: Registry;
	registryOwner: boolean;
	registryAccManager: boolean;

	loaderProgress = '';
}
