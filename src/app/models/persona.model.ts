import { ethers } from 'ethers';
import { SecurityService } from '../services/security.service';

enum ValidationStatus {
	Empty,
	Pending,
	Valid,
	Contested,
	Invalid,
}

class PersonaDocument {
	field: string;
	fieldName: string;
	baseValue: string;
	value: string;
	decryptValue: string;
	documentValueHash: string;
	documentHashes: string[];
	validations: { address: string; status: number; timestamp: number; signature: string }[];
	validationStatus: ValidationStatus;
	validationStatusName: string;

	constructor(field: string, personaInfo: string[], documentHashes: string[], validators: string[], validatorAnswers: string[][]) {
		this.field = field;
		this.fieldName = ethers.utils.parseBytes32String(field).toUpperCase();
		this.baseValue = personaInfo[0];
		this.value = personaInfo[0];
		this.documentValueHash = personaInfo[1];
		this.documentHashes = documentHashes;
		this.validations = [];
		let index = 0;
		validators.forEach((element) => {
			this.validations.push({
				address: element,
				status: Number(validatorAnswers[index][0]),
				timestamp: Number(ethers.utils.formatUnits(validatorAnswers[index][1], 'wei')),
				signature: validatorAnswers[index][2],
			});
			index++;
		});
	}
}

export class PersonaCertificate {
	issuer: string;
	givenName: string;
	value: string;
	content: string;
	contentObj: { header: string; description: string; image: any; url: string; issuer: string; footer: string };
	signature: string;
	timestamp: number;

	constructor(issuer: string, givenName: string, value: string, content: string, signature: string, timestamp: string) {
		this.issuer = issuer;
		this.givenName = givenName;
		this.value = value;
		this.content = content;
		this.contentObj = content.length > 0 ? JSON.parse(content) : null;
		this.signature = signature;
		this.timestamp = Number(ethers.utils.formatUnits(timestamp, 'wei'));
	}
}

export class Persona {
	personaContractInstance: ethers.Contract;

	private loaderStep = 0.1;
	private loaderProgress = 0;

	name: string;
	documents: Array<PersonaDocument>;
	certificates: Array<PersonaCertificate>;
	pendingCertificate: PersonaCertificate;
	pendingCertificatesCount: number;

	pendingValidationsCount: number;
	validValidationsCount: number;
	invalidValidationsCount: number;

	constructor(public address: string) {
		this.documents = [];
		this.certificates = [];
	}

	async loadPersona(loaderCallback: any, scService: any) {
		this.loaderProgress = 0;
		this.documents = [];
		this.certificates = [];
		loaderCallback(1);
		const [namePersona, documentsList, certificatesCountBN, pendingCertificatesCount] = await Promise.all([
			this.stepProgress(this.personaContractInstance.name(), loaderCallback),
			this.stepProgress(this.personaContractInstance.getDocuments(), loaderCallback),
			this.stepProgress(this.personaContractInstance.getCertificatesCount(), loaderCallback),
			this.stepProgress(this.personaContractInstance.getPendingCertificatesCount(), loaderCallback),
		]);
		this.name = ethers.utils.parseBytes32String(namePersona);
		this.pendingCertificatesCount = Number(ethers.utils.formatUnits(pendingCertificatesCount, 'wei'));
		const certificatesCount = Number(ethers.utils.formatUnits(certificatesCountBN, 'wei'));
		let personaPromises = [];
		if (documentsList.length > 0)
			personaPromises.push(
				documentsList.forEach(async (element) => {
					let promises = [];
					promises.push(this.stepProgress(this.personaContractInstance.personaInfos(element), loaderCallback));
					promises.push(this.stepProgress(this.personaContractInstance.getValidators(element), loaderCallback));
					promises.push(this.stepProgress(this.personaContractInstance.getDocumentHashes(element), loaderCallback));
					const [personaInfo, validators, documentHashes] = await Promise.all(promises);
					let validatorAnswers = [];
					for (let index = 0; index < validators.length; index++) {
						validatorAnswers.push(
							await this.stepProgress(
								this.personaContractInstance.getValidationStatus(element, validators[index]),
								loaderCallback
							)
						);
					}
					this.registerDocument(element, personaInfo, documentHashes, validators, validatorAnswers);
				})
			);
		if (certificatesCount > 0) personaPromises.push(this.extractCertificates(certificatesCount, loaderCallback));
		if (pendingCertificatesCount > 0) personaPromises.push(this.stepProgress(this.getLastPendingCertificate(), loaderCallback));
		await Promise.all(personaPromises);
		await this.countValidations(documentsList.length);
	}

	private async extractCertificates(certificatesCount: number, loaderCallback: any) {
		let promises = [];
		for (let index = 0; index < certificatesCount; index++) {
			promises.push(this.stepProgress(this.personaContractInstance.getCertificate(index), loaderCallback));
		}
		const certificatesList = await Promise.all(promises);
		certificatesList.forEach((element) => {
			this.registerCertificate(
				element[0],
				ethers.utils.parseBytes32String(element[1]),
				element[2],
				element[3],
				element[4],
				element[5]
			);
		});
	}

	async countValidations(size: number) {
		this.pendingValidationsCount = 0;
		this.validValidationsCount = 0;
		this.invalidValidationsCount = 0;
		if (size == 0) return;
		while (this.documents.length < size) await new Promise((resolve) => setTimeout(resolve, 10));
		this.documents.forEach((element) => {
			let pendingValidationsCount = 0;
			let validValidationsCount = 0;
			let invalidValidationsCount = 0;
			element.validations.forEach((validation) => {
				switch (validation.status) {
					case 1:
						pendingValidationsCount++;
						this.pendingValidationsCount++;
						break;
					case 2:
						validValidationsCount++;
						this.validValidationsCount++;
						break;
					case 3:
						invalidValidationsCount++;
						this.invalidValidationsCount++;
						break;
				}
			});
			if (invalidValidationsCount > 0) {
				element.validationStatus = validValidationsCount > 0 ? ValidationStatus.Contested : ValidationStatus.Invalid;
			} else if (validValidationsCount > 0) element.validationStatus = ValidationStatus.Valid;
			else if (pendingValidationsCount > 0) element.validationStatus = ValidationStatus.Pending;
			else element.validationStatus = ValidationStatus.Empty;
			element.validationStatusName = ValidationStatus[element.validationStatus];
		});
	}

	async stepProgress(promise: Promise<any>, loaderCallback: any): Promise<any> {
		const val = await promise;
		this.loaderProgress += (100 - this.loaderProgress) * this.loaderStep;
		loaderCallback(this.loaderProgress);
		return val;
	}

	async getLastPendingCertificate() {
		const pendingCertificate = await this.personaContractInstance.getLastPendingCertificate();
		this.pendingCertificate = new PersonaCertificate(
			pendingCertificate[0],
			ethers.utils.parseBytes32String(pendingCertificate[1]),
			pendingCertificate[2],
			pendingCertificate[3],
			pendingCertificate[4],
			pendingCertificate[5]
		);
	}

	registerDocument(field: string, personaInfo: string[], documentHashes: string[], validators: string[], validatorAnswers: string[][]) {
		this.documents.push(new PersonaDocument(field, personaInfo, documentHashes, validators, validatorAnswers));
	}

	registerCertificate(issuer: string, givenName: string, value: string, content: string, signature: string, timestamp: string) {
		this.certificates.push(new PersonaCertificate(issuer, givenName, value, content, signature, timestamp));
	}

	changeName(name: string): Promise<any> {
		return this.personaContractInstance.changeName(ethers.utils.formatBytes32String(name));
	}

	transferOwnership(address: string): Promise<any> {
		return this.personaContractInstance.transferOwnershipPersona(address);
	}

	addField(documentName: string, documentValue: string, documentValueHash: string, documentHashes: string[]): Promise<any> {
		const documentType = this.hashDocumentName(documentName);
		const hashes = documentHashes.length == 0 ? [] : documentHashes.map((item) => ethers.utils.arrayify(item));
		return this.personaContractInstance.addField(documentType, documentValue, documentValueHash, hashes);
	}

	replaceField(documentName: string, documentValue: string, documentValueHash: string, documentHashes: string[]): Promise<any> {
		const documentType = this.hashDocumentName(documentName);
		const hashes = documentHashes.length == 0 ? [] : documentHashes.map((item) => ethers.utils.arrayify(item));
		return this.personaContractInstance.replaceField(documentType, documentValue, documentValueHash, hashes);
	}

	askToValidate(addressValidator: string, documentName: string, documentLinks: string[], documentValue: string): Promise<any> {
		const documentType = this.hashDocumentName(documentName);
		return this.personaContractInstance.askToValidate(addressValidator, documentType, documentLinks, documentValue);
	}

	processLastPendingCertificate(approve: boolean): Promise<any> {
		return this.personaContractInstance.processLastPendingCertificate(approve);
	}

	giveCertificateTo(addressPersona: string, givenName: string, value: string, content: string, signature: string): Promise<any> {
		return this.personaContractInstance.giveCertificateTo(
			addressPersona,
			ethers.utils.formatBytes32String(givenName),
			value,
			content,
			signature
		);
	}

	hashDocumentName(documentName: string): string {
		return ethers.utils.formatBytes32String(documentName.trim().replace(/ /g, '').normalize().toLowerCase());
	}
}
