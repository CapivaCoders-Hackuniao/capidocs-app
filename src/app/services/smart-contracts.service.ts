import { Injectable } from '@angular/core';
import { Globals } from '../globals';
import { ethers } from 'ethers';
import { environment } from 'src/environments/environment';

import * as RegistryContract from '../../../contracts/build/Registry.json';
import * as PersonaContract from '../../../contracts/build/Persona.json';
import * as ValidatorContract from '../../../contracts/build/Validator.json';
import * as ERC20Contract from '../../../contracts/build/ERC20.json';
import { Registry } from '../models/registry.model';
import { Persona } from '../models/persona.model';
import { Validator } from '../models/validator.model';

@Injectable({
	providedIn: 'root',
})
export class SmartContractsService {
	constructor(public globals: Globals) {}

	async loadContracts() {
		this.globals.registry = new Registry(environment.registryAddress);
		this.connectRegistry(environment.registryAddress);
		let [
			name,
			owner,
			requireRolePersona,
			requireRoleValidator,
			ownerToPersona,
			ownerToValidator,
			registryAccManager,
		] = await Promise.all([
			this.globals.registry.registryContractInstance.name(),
			this.globals.registry.registryContractInstance.owner(),
			this.globals.registry.registryContractInstance.requireRolePersona(),
			this.globals.registry.registryContractInstance.requireRoleValidator(),
			this.globals.registry.registryContractInstance.ownerToPersona(this.globals.userAddress),
			this.globals.registry.registryContractInstance.ownerToValidator(this.globals.userAddress),
			this.globals.registry.registryContractInstance.hasRole(
				ethers.utils.solidityKeccak256(['string'], ['ACC_MANAGER_ROLE']),
				this.globals.userAddress
			),
		]);
		this.globals.registry.name = ethers.utils.parseBytes32String(name);
		this.globals.registry.owner = owner;
		this.globals.registry.requireRolePersona = requireRolePersona;
		this.globals.registry.requireRoleValidator = requireRoleValidator;
		this.globals.persona = new Persona(ownerToPersona);
		this.globals.validator = new Validator(ownerToValidator);
		this.globals.registryOwner = this.globals.userAddress == this.globals.registry.owner;
		this.globals.registryAccManager = registryAccManager;
		this.globals.hasPersona = this.globals.persona.address != '0x0000000000000000000000000000000000000000';
		if (this.globals.hasPersona) this.connectPersona(this.globals.persona.address);
		this.globals.hasValidator = this.globals.validator.address != '0x0000000000000000000000000000000000000000';
		if (this.globals.hasValidator) this.connectValidator(this.globals.validator.address);
	}

	connectRegistry(address: string) {
		this.globals.registry.registryContractInstance = new ethers.Contract(address, RegistryContract.abi, this.globals.userWallet);
	}

	connectPersona(address: string) {
		this.globals.persona.personaContractInstance = new ethers.Contract(address, PersonaContract.abi, this.globals.userWallet);
	}

	connectValidator(address: string) {
		this.globals.validator.validatorContractInstance = new ethers.Contract(address, ValidatorContract.abi, this.globals.userWallet);
	}

	async getPersonaName(address: any): Promise<string> {
		const contract = new ethers.Contract(address, PersonaContract.abi, this.globals.ethersProvider);
		return ethers.utils.parseBytes32String(await contract.name());
	}

	async getPersonaOwner(address: any): Promise<string> {
		const contract = new ethers.Contract(address, PersonaContract.abi, this.globals.ethersProvider);
		return await contract.owner();
	}

	async getValidatorName(address: any): Promise<string> {
		const contract = new ethers.Contract(address, ValidatorContract.abi, this.globals.ethersProvider);
		return ethers.utils.parseBytes32String(await contract.name());
	}

	async getValidatorOwner(address: any): Promise<string> {
		const contract = new ethers.Contract(address, ValidatorContract.abi, this.globals.ethersProvider);
		return await contract.owner();
	}

	async getOwnerPublicKey(address: any): Promise<string> {
		const contract = new ethers.Contract(address, ValidatorContract.abi, this.globals.ethersProvider);
		return await contract.ownerPublicKey();
	}

	async getValidatorPaymentToken(address: any): Promise<string> {
		const contract = new ethers.Contract(address, ValidatorContract.abi, this.globals.ethersProvider);
		return await contract.paymentToken();
	}

	async getTokenName(address: any): Promise<string> {
		if (address == '0x0000000000000000000000000000000000000000') return '';
		const contract = new ethers.Contract(address, ERC20Contract.abi, this.globals.ethersProvider);
		return await contract.symbol();
	}

	async getTokenDecimals(address: any): Promise<number> {
		if (address == '0x0000000000000000000000000000000000000000') return 0;
		const contract = new ethers.Contract(address, ERC20Contract.abi, this.globals.ethersProvider);
		return await contract.decimals();
	}

	async getValidatorQueueInfo(address: any): Promise<{ validatedCount: number; queueSize: number }> {
		const contract = new ethers.Contract(address, ValidatorContract.abi, this.globals.ethersProvider);
		const validationQueueStart = ethers.utils.formatUnits(await contract.validationQueueStart(), 'wei');
		const validationQueueEnd = ethers.utils.formatUnits(await contract.validationQueueEnd(), 'wei');
		return {
			validatedCount: Number(validationQueueStart) - 1,
			queueSize: 1 + Number(validationQueueEnd) - Number(validationQueueStart),
		};
	}

	async getValidatorDocumentType(address: any, document: any): Promise<boolean> {
		const contract = new ethers.Contract(address, ValidatorContract.abi, this.globals.ethersProvider);
		return await contract.documentTypes(this.hashDocumentName(document));
	}

	processCall(call: any, spinner: any, toastrService: any, resolve = () => {}, errAns = () => {}) {
		this.globals.loaderProgress = '';
		spinner.show();
		let loader = 0;
		const interval = setInterval(() => {
			loader += (100 - loader) * 3  * Math.random() / (5 + loader);
      if (loader > 99.9) loader = 99.99;
      this.globals.loaderProgress = loader.toFixed(2);
		}, 100);
		call.then(
			(tx) => {
				tx.wait().then((receipt) => {
          spinner.hide();
          clearInterval(interval);
					toastrService.success(
						'Success',
						'Transaction ' + receipt.transactionHash + ' completed on block ' + receipt.blockNumber,
						{
							progressBar: true,
						}
					);
					resolve();
				}),
					(err) => {
            clearInterval(interval);
						this.showErr(err, spinner, toastrService);
						errAns();
					};
			},
			(err) => {
        clearInterval(interval);
				this.showErr(err, spinner, toastrService);
				errAns();
			}
		);
	}

	showErr(err: any, spinner: any, toastrService: any) {
		console.warn(err);
		this.globals.loaderProgress = '';
		const toastr = toastrService.error('Error', 'Error when sending the transaction: ' + err, {
			progressBar: true,
		});
		if (toastr)
			toastr.onHidden.subscribe(() => {
				spinner.hide();
			});
	}

	hashDocumentName(documentName: string): string {
		return ethers.utils.formatBytes32String(this.normalizeDocumentName(documentName));
	}

  private normalizeDocumentName(documentName: string): string {
    return documentName.replace(/ /g, '').normalize().toLowerCase();
  }

	async generateSignature(message: string): Promise<string> {
		const signature = await this.globals.userWallet.signMessage(message);
		return this.payloadJson(message, signature);
	}

	private payloadJson(message: string, signature: string): string {
		return JSON.stringify({ message: message, signature: signature });
	}
}
