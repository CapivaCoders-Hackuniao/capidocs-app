import { ethers, Contract } from 'ethers';
import { Validator } from './validator.model';

class RoleMember {
	constructor(public position: number, public name: string, public address: string) {}
}

class Role {
	id: string;
	count: number;
	members: RoleMember[];

	constructor() {
		this.members = [];
	}

	addMember(position: number, name: string, address: string) {
		this.members[position] = new RoleMember(position, name, address);
	}
}

export class Registry {
	registryContractInstance: Contract;
	requireRolePersona: boolean;
	requireRoleValidator: boolean;
	name: string;
	owner: string;
	roles: { PERSONA_ROLE: Role; VALIDATOR_ROLE: Role; ACC_MANAGER_ROLE: Role };
	personaFactory: string;
	validatorFactory: string;

	validators: Validator[];

	constructor(public address: string) {
		this.roles = { PERSONA_ROLE: new Role(), VALIDATOR_ROLE: new Role(), ACC_MANAGER_ROLE: new Role() };
		this.validators = [];
	}

	async createPersona(name: string): Promise<any> {
		const tx = await this.registryContractInstance.personaSelfRegistry(ethers.utils.formatBytes32String(name));
		return await tx.wait();
	}

	async createValidator(name: string, pubKey: string): Promise<any> {
		const tx = await this.registryContractInstance.validatorSelfRegistry(ethers.utils.formatBytes32String(name), pubKey);
		return await tx.wait();
	}

	addValidatorPublicInfo(
		index: number,
		name: string,
    owner: string,
    ownerPublicKey: string,
		address: string,
		paymentTokenAddress: string,
		paymentTokenSymbol: string,
		paymentTokenDecimals: number,
		validatedCount: number,
		queueSize: number
	) {
		this.validators[index] = new Validator(address);
		this.validators[index].fillPublicInfo(
      name,
      owner,
      ownerPublicKey,
			paymentTokenAddress,
			paymentTokenSymbol,
			paymentTokenDecimals,
			validatedCount,
			queueSize
		);
	}

	async loadRegistryAdmin(loaderCallback: any, scService: any) {
		loaderCallback(0);
		this.roles.PERSONA_ROLE.id = await this.registryContractInstance.PERSONA_ROLE();
		this.roles.PERSONA_ROLE.count = Number(
			ethers.utils.formatUnits(await this.registryContractInstance.getRoleMemberCount(this.roles.PERSONA_ROLE.id), 'wei')
		);
		loaderCallback(1);
		this.roles.VALIDATOR_ROLE.id = await this.registryContractInstance.VALIDATOR_ROLE();
		this.roles.VALIDATOR_ROLE.count = Number(
			ethers.utils.formatUnits(await this.registryContractInstance.getRoleMemberCount(this.roles.VALIDATOR_ROLE.id), 'wei')
		);
		loaderCallback(2);
		this.roles.ACC_MANAGER_ROLE.id = await this.registryContractInstance.ACC_MANAGER_ROLE();
		this.roles.ACC_MANAGER_ROLE.count = Number(
			ethers.utils.formatUnits(await this.registryContractInstance.getRoleMemberCount(this.roles.ACC_MANAGER_ROLE.id), 'wei')
		);
		loaderCallback(3);
		const totalCount = 5 + this.roles.PERSONA_ROLE.count + this.roles.VALIDATOR_ROLE.count + this.roles.ACC_MANAGER_ROLE.count;
		let promises = [];
		let progress = 4;
		for (let index = 0; index < this.roles.PERSONA_ROLE.count; index++) {
			promises.push(
				new Promise((resolve) => {
					this.registryContractInstance.getRoleMember(this.roles.PERSONA_ROLE.id, index).then(
						(address: string) => {
							scService.getPersonaName(address).then((name: string) => {
								this.roles.PERSONA_ROLE.addMember(index, name, address);
								progress++;
								loaderCallback((progress * 100) / totalCount);
								resolve(null);
							});
						},
						(err) => {
							resolve(null);
						}
					);
				})
			);
		}
		await Promise.all(promises);
		promises = [];
		for (let index = 0; index < this.roles.VALIDATOR_ROLE.count; index++) {
			promises.push(
				new Promise((resolve) => {
					this.registryContractInstance.getRoleMember(this.roles.VALIDATOR_ROLE.id, index).then(
						(address) => {
							scService.getValidatorName(address).then((name) => {
								this.roles.VALIDATOR_ROLE.addMember(index, name, address);
								progress++;
								loaderCallback((progress * 100) / totalCount);
								resolve(null);
							});
						},
						(err) => {
							resolve(null);
						}
					);
				})
			);
		}
		await Promise.all(promises);
		promises = [];
		for (let index = 0; index < this.roles.ACC_MANAGER_ROLE.count; index++) {
			promises.push(
				new Promise((resolve) => {
					this.registryContractInstance.getRoleMember(this.roles.ACC_MANAGER_ROLE.id, index).then(
						(address) => {
							this.roles.ACC_MANAGER_ROLE.addMember(index, 'Acc. Manager', address);
							progress++;
							loaderCallback((progress * 100) / totalCount);
							resolve(null);
						},
						(err) => {
							resolve(null);
						}
					);
				})
			);
		}
		await Promise.all(promises);
		this.personaFactory = await this.registryContractInstance.personaFactory();
		this.validatorFactory = await this.registryContractInstance.validatorFactory();
		loaderCallback(0);
	}

	async loadValidators(loaderCallback: any, scService: any) {
		loaderCallback(0);
		this.roles.VALIDATOR_ROLE.id = await this.registryContractInstance.VALIDATOR_ROLE();
		this.roles.VALIDATOR_ROLE.count = Number(
			ethers.utils.formatUnits(await this.registryContractInstance.getRoleMemberCount(this.roles.VALIDATOR_ROLE.id), 'wei')
		);
		loaderCallback(1);
		const totalCount = 2 + this.roles.VALIDATOR_ROLE.count;
		let promises = [];
		let progress = 2;
		for (let index = 0; index < this.roles.VALIDATOR_ROLE.count; index++) {
			promises.push(
				new Promise(async (resolve) => {
					const address = await this.registryContractInstance.getRoleMember(this.roles.VALIDATOR_ROLE.id, index);
					const name = await scService.getValidatorName(address);
          const owner = await scService.getValidatorOwner(address);
          const ownerPublicKey = await scService.getOwnerPublicKey(address);
					this.roles.VALIDATOR_ROLE.addMember(index, name, address);
					const tokenAddress = await scService.getValidatorPaymentToken(address);
					const tokenName = await scService.getTokenName(tokenAddress);
					const tokenDecimals = await scService.getTokenDecimals(tokenAddress);
					const { validatedCount, queueSize } = await scService.getValidatorQueueInfo(address);
					this.addValidatorPublicInfo(index, name, owner, ownerPublicKey, address, tokenAddress, tokenName, tokenDecimals, validatedCount, queueSize);
					progress++;
          loaderCallback((progress * 100) / totalCount);
          resolve(null);
				})
			);
		}
		await Promise.all(promises);
	}
}
