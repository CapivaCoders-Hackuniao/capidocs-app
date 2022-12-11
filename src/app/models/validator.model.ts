import { ethers } from 'ethers';
import { environment } from 'src/environments/environment';

class DocumentInfo {
	constructor(public name: string, public id: string, public accepted: boolean, public price: number) {}
}

export class Validator {
	validatorContractInstance: ethers.Contract;

	private loaderStep = 0.1;
	private loaderProgress = 0;

	name: string;
	owner: string;
	ownerPubKey: string;
	paymentTokenAddress: string;
	paymentTokenSymbol: string;
	paymentTokenDecimals: number;
	validatedCount: number;
	queueSize: number;

	documentInfos: Array<DocumentInfo>;

	nextValidation: {
		persona: string;
		documentType: string;
		documentName: string;
		documentLinks: string[];
		documentHashes: string[];
		documentValue: string;
		documentValueHash: string;
	};

	pendingValidations: Array<{
		persona: string;
		documentType: string;
		document: string;
	}>;

	constructor(public address: string) {
		this.documentInfos = [];
		this.pendingValidations = [];
	}

	async loadNextValidation(): Promise<boolean> {
		const [
			persona,
			documentType,
			documentLinks,
			documentHashes,
			documentValue,
			documentValueHash,
		] = await this.validatorContractInstance.getNextValidation();
		this.nextValidation = {
			persona: persona,
			documentType: documentType,
			documentName: ethers.utils.parseBytes32String(documentType).toUpperCase(),
			documentLinks: documentLinks,
			documentHashes: documentHashes,
			documentValue: documentValue,
			documentValueHash: documentValueHash,
		};
		return true;
	}

	async loadValidator(loaderCallback: any, scService: any) {
		this.loaderProgress = 0;
		loaderCallback(1);
		const tokenAddress = await this.stepProgress(scService.getValidatorPaymentToken(this.address), loaderCallback);
		const [name, owner, ownerPubKey, tokenName, tokenDecimals, { validatedCount, queueSize }] = await Promise.all([
			this.stepProgress(this.validatorContractInstance.name(), loaderCallback),
			this.stepProgress(this.validatorContractInstance.owner(), loaderCallback),
			this.stepProgress(this.validatorContractInstance.ownerPublicKey(), loaderCallback),
			this.stepProgress(scService.getTokenName(tokenAddress), loaderCallback),
			this.stepProgress(scService.getTokenDecimals(tokenAddress), loaderCallback),
			this.stepProgress(scService.getValidatorQueueInfo(this.address), loaderCallback),
		]);
		this.fillPublicInfo(
			ethers.utils.parseBytes32String(name),
			owner,
			ownerPubKey,
			tokenAddress,
			tokenName,
			tokenDecimals,
			validatedCount,
			queueSize
		);
		let promisesAccepted = [];
		let promisesPrice = [];
		this.documentInfos = [];
		environment.docsList.forEach((doc) => {
			promisesAccepted.push(
				this.stepProgress(this.validatorContractInstance.documentTypes(this.hashDocumentName(doc)), loaderCallback)
			);
			promisesPrice.push(
				this.stepProgress(this.validatorContractInstance.documentPrices(this.hashDocumentName(doc)), loaderCallback)
			);
		});
		const promisesAcceptedAnswers = await Promise.all(promisesAccepted);
		const promisesPriceAnswers = await Promise.all(promisesPrice);
		for (let index = 0; index < environment.docsList.length; index++) {
			const name = environment.docsList[index];
			const id = this.hashDocumentName(name);
			const accepted = promisesAcceptedAnswers[index];
			const price = Number(ethers.utils.formatUnits(promisesPriceAnswers[index], this.paymentTokenDecimals));
			this.documentInfos.push(new DocumentInfo(name, id, accepted, price));
		}
		this.stepProgress(this.loadNextValidation(), loaderCallback);
		let promisePending = [];
		this.pendingValidations = [];
		for (let index = validatedCount + 1; index < validatedCount + queueSize + 1; index++) {
			promisePending.push(this.stepProgress(this.validatorContractInstance.validationQueue(index), loaderCallback));
		}
		const pendingAnswer = await Promise.all(promisePending);
		pendingAnswer.forEach((element) => {
			this.pendingValidations.push({
				persona: element[0],
				documentType: element[1],
				document: ethers.utils.parseBytes32String(element[1]).toUpperCase(),
			});
		});
		loaderCallback(100);
	}

	async stepProgress(promise: Promise<any>, loaderCallback: any): Promise<any> {
		const val = await promise;
		this.loaderProgress += (100 - this.loaderProgress) * this.loaderStep;
		loaderCallback(this.loaderProgress);
		return val;
	}

	fillPublicInfo(
		name: string,
		owner: string,
		ownerPubKey: string,
		paymentTokenAddress: string,
		paymentTokenSymbol: string,
		paymentTokenDecimals: number,
		validatedCount: number,
		queueSize: number
	) {
		this.name = name;
		this.owner = owner;
		this.ownerPubKey = ownerPubKey;
		this.paymentTokenAddress = paymentTokenAddress;
		this.paymentTokenSymbol = paymentTokenSymbol;
		this.paymentTokenDecimals = paymentTokenDecimals;
		this.validatedCount = validatedCount;
		this.queueSize = queueSize;
	}

	changeName(name: string): Promise<any> {
		return this.validatorContractInstance.changeName(ethers.utils.formatBytes32String(name));
	}

	setPaymentToken(address: string): Promise<any> {
		return this.validatorContractInstance.setPaymentToken(address);
	}

	transferOwnership(address: string): Promise<any> {
		return this.validatorContractInstance.transferOwnershipValidator(address);
	}

	setDocumentPrices(documentTypesN: string[], documentPricesN: string[]): Promise<any> {
		let documentTypes = [];
		let documentPrices = [];
		documentTypesN.forEach((element) => {
			documentTypes.push(ethers.utils.arrayify(this.hashDocumentName(element)));
		});
		documentPricesN.forEach((element) => {
			documentPrices.push(ethers.utils.formatUnits(element, this.paymentTokenDecimals));
		});
		return this.validatorContractInstance.setDocumentPrices(documentTypes, documentPrices);
	}

	setDocumentPrice(documentType: string, documentPrice: string): Promise<any> {
		return this.validatorContractInstance.setDocumentPrice(
			this.hashDocumentName(documentType),
			ethers.utils.formatUnits(documentPrice, this.paymentTokenDecimals)
		);
	}

	addDocumentTypes(documentTypesN: string[]): Promise<any> {
		let documentTypes = [];
		documentTypesN.forEach((element) => {
			documentTypes.push(ethers.utils.arrayify(this.hashDocumentName(element)));
		});
		return this.validatorContractInstance.addDocumentTypes(documentTypes);
	}

	addDocumentType(documentType: string): Promise<any> {
		return this.validatorContractInstance.addDocumentType(this.hashDocumentName(documentType));
	}

	removeDocumentTypes(documentTypesN: string[]): Promise<any> {
		let documentTypes = [];
		documentTypesN.forEach((element) => {
			documentTypes.push(ethers.utils.arrayify(this.hashDocumentName(element)));
		});
		return this.validatorContractInstance.removeDocumentTypes(documentTypes);
	}

	removeDocumentType(documentType: string): Promise<any> {
		return this.validatorContractInstance.removeDocumentType(this.hashDocumentName(documentType));
	}

	processValidation(status: number, signature: string): Promise<any> {
		return this.validatorContractInstance.processValidation(status, signature);
	}

	hashDocumentName(documentName: string): string {
		return ethers.utils.formatBytes32String(documentName.trim().replace(/ /g, '').normalize().toLowerCase());
	}
}
