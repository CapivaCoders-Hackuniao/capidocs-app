import { Component, OnInit } from '@angular/core';
import { Globals } from 'src/app/globals';
import { SecurityService } from 'src/app/services/security.service';
import { FormGroup, FormBuilder, Validators, FormArray } from '@angular/forms';
import { SmartContractsService } from 'src/app/services/smart-contracts.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { CustomValidators } from 'ngx-custom-validators';
import { environment } from '../../../environments/environment';
import { ethers } from 'ethers';
import CryptoJS from 'crypto-js';

@Component({
	selector: 'app-authentication',
	templateUrl: './authentication.component.html',
	styleUrls: ['./authentication.component.css'],
})
export class AuthenticationComponent implements OnInit {
	formConfig: FormGroup;
	fieldsToAdd: string[];
	fieldsToRemove: string[];
	formValidation: FormGroup;

	decryptJson: any;

	decryptFile: File;
	fileReady: boolean;
	documentFileHashMatch: string;
	fileURL: string;

	constructor(
		public globals: Globals,
		private securityService: SecurityService,
		private fb: FormBuilder,
		private spinner: NgxSpinnerService,
		private toastrService: ToastrService,
		private scService: SmartContractsService
	) {
		this.formConfig = this.fb.group({
			name: ['Nickname', [Validators.required, CustomValidators.rangeLength([1, 32])]],
			tokenAaddress: ['Token address', [Validators.required, CustomValidators.rangeLength([42, 42])]],
			addField: this.fb.array([]),
			removeField: this.fb.array([]),
		});
		this.formValidation = this.fb.group({
			validatedoc: [],
			validatename: [],
			validatevalue: [],
			validatestatus: [],
		});
	}

	ngOnInit(): void {
		this.updateFields();
	}

	changeName(changeNameInput: string) {
		this.scService.processCall(this.globals.validator.changeName(changeNameInput), this.spinner, this.toastrService, () => {
			this.updateValidator();
		});
	}

	changeToken(changeTokenInput: string) {
		this.scService.processCall(this.globals.validator.setPaymentToken(changeTokenInput), this.spinner, this.toastrService, () => {
			this.updateValidator();
		});
	}

	private updateValidator() {
		this.globals.validator.loadValidator(() => {}, this.scService);
		this.updateFields();
	}

	updateFields() {
		this.fieldsToAdd = this.globals.validator.documentInfos.filter((doc) => !doc.accepted).map((doc) => doc.name);
		this.fieldsToRemove = this.globals.validator.documentInfos.filter((doc) => doc.accepted).map((doc) => doc.name);
		this.fieldsToAdd.forEach((item) => (this.formConfig.controls.addField as FormArray).push(this.fb.control(false)));
		this.fieldsToRemove.forEach((item) => (this.formConfig.controls.removeField as FormArray).push(this.fb.control(false)));
	}

	addSelectedFields() {
		let arr = [];
		for (let index = 0; index < this.fieldsToAdd.length; index++) {
			if (this.formConfig.controls.addField.value[index]) arr.push(this.fieldsToAdd[index]);
		}
		if (arr.length == 0) return;
		this.scService.processCall(this.globals.validator.addDocumentTypes(arr), this.spinner, this.toastrService, () => {
			this.updateValidator();
		});
	}

	removeSelectedFields() {
		let arr = [];
		for (let index = 0; index < this.fieldsToRemove.length; index++) {
			if (this.formConfig.controls.removeField.value[index]) arr.push(this.fieldsToRemove[index]);
		}
		if (arr.length == 0) return;
		console.log(arr);
		this.scService.processCall(this.globals.validator.removeDocumentTypes(arr), this.spinner, this.toastrService, () => {
			this.updateValidator();
		});
	}

	async evaluate(status: number) {
		const message = {
			status: status,
			address: this.globals.validator.nextValidation.persona,
			document: this.globals.validator.nextValidation.documentType,
		};
		const payload = JSON.stringify(message);
		const signature = await this.globals.userWallet.signMessage(payload);
		this.scService.processCall(this.globals.validator.processValidation(status, signature), this.spinner, this.toastrService, () => {
			this.globals.validator.loadValidator(() => {}, this.scService);
		});
	}

	async decryptObj() {
		const cypher = this.globals.validator.nextValidation.documentValue;
		const result = await this.securityService.decryptWithPrivateKey(this.globals.userWallet.privateKey, cypher);
		this.decryptJson = JSON.parse(result.substr(1).replace(/\\/g, '').slice(0, -1));
	}

	checkHash() {
		if (
			this.globals.validator.nextValidation.documentValueHash ==
			ethers.utils.id(JSON.stringify({ message: this.decryptJson.message, signature: this.decryptJson.signature }))
		)
			this.decryptJson.check = 'Match';
		else this.decryptJson.check = 'False';
	}

	async checkSig() {
		const promiseOwner = this.scService.getPersonaOwner(this.globals.validator.nextValidation.persona);
		this.decryptJson.signer = ethers.utils.verifyMessage(this.decryptJson.message, this.decryptJson.signature);
		this.decryptJson.owner = await promiseOwner;
		this.decryptJson.validSigner = this.decryptJson.signer == this.decryptJson.owner ? 'Valid' : 'Invalid';
	}

	verifyFileHash(hashFile: string) {
		var reader = new FileReader();
		reader.onload = (event) => {
			var binary = String(event.target.result);
			var hash = '0x' + CryptoJS.SHA256(binary).toString(CryptoJS.enc.Hex);
			this.documentFileHashMatch = hash == hashFile ? 'Match' : 'False';
		};
		reader.readAsBinaryString(this.decryptFile);
	}

	verifyFile(file: any) {
    this.fileReady = false;
    if (file.files.length == 0) return;
		var file = file.files[0];
		var reader = new FileReader();
		reader.onload = async (event) => {
			const binary = event.target.result as string;
			const encryptedText = atob(binary.split(',')[1]);
			const recover = await this.securityService.decryptWithPrivateKey(this.globals.userWallet.privateKey, encryptedText);
			this.decryptFile = this.dataURLtoFile(recover, 'decrypted');
			this.fileURL = URL.createObjectURL(this.decryptFile);
			this.fileReady = true;
		};
		reader.readAsDataURL(file);
	}

	dataURLtoFile(dataurl: string, filename: string): File {
		var arr = dataurl.split(','),
			mime = arr[0].match(/:(.*?);/)[1],
			bstr = atob(arr[1]),
			n = bstr.length,
			u8arr = new Uint8Array(n);
		while (n--) {
			u8arr[n] = bstr.charCodeAt(n);
		}
		return new File([u8arr], filename, { type: mime });
	}

	async decryptInfos() {
		await this.decryptObj();
		this.checkHash();
		await this.checkSig();
	}
}
