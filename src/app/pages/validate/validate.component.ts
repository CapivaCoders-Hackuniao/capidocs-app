import { Component, OnInit } from '@angular/core';
import { Globals } from 'src/app/globals';
import { Validator } from 'src/app/models/validator.model';
import { SecurityService } from 'src/app/services/security.service';
import { SmartContractsService } from 'src/app/services/smart-contracts.service';
import { ToastrService } from 'ngx-toastr';
import { NgxSpinnerService } from 'ngx-spinner';
import { ethers } from 'ethers';

@Component({
	selector: 'app-validate',
	templateUrl: './validate.component.html',
	styleUrls: ['./validate.component.css'],
})
export class ValidateComponent implements OnInit {
	constructor(
		public globals: Globals,
		private securityService: SecurityService,
		private scService: SmartContractsService,
		private spinner: NgxSpinnerService,
		private toastrService: ToastrService
	) {
		this.documentLinks = [];
		this.listValidators = [];
	}

	pagination = 1;
	listValidators: Validator[];
	selectedValidator: Validator;
	selectedDocument: any;
	documentLinks: string[];

	fileURL: string;
	fileReady: boolean;

	ngOnInit(): void {
		const input = document.getElementById('docFile');
    const fileName = document.getElementById('file-name');

	input.addEventListener('change', function(){
			fileName.textContent = "Documento carregado"
	});
		this.listValidators = this.globals.registry.validators;
	}

	selectListbyName(name: string) {
		if (name.length == 0) this.listValidators = this.globals.registry.validators;
		else this.listValidators = this.globals.registry.validators.filter((element) => element.name.search(name) >= 0);
	}

	async sendToValidator() {
		const documentValue = await this.encryptMessage(this.selectedDocument.value, this.selectedValidator.ownerPubKey);
		this.scService.processCall(
			this.globals.persona.askToValidate(
				this.selectedValidator.address,
				this.selectedDocument.fieldName,
				this.documentLinks,
				documentValue
			),
			this.spinner,
			this.toastrService,
			() => {
				this.globals.persona.loadPersona(() => {}, this.scService);
			}
		);
	}

	async encryptMessage(value: string, pubKey: string): Promise<string> {
		const decryptPayload = await this.securityService.decryptAES(
			value,
			ethers.utils.solidityKeccak256(['string'], [this.globals.userWallet.privateKey])
    );
    const payload = await this.scService.generateSignature(decryptPayload.documentValue);
		const decrypt = JSON.stringify(payload);
		const cypher = await this.securityService.encryptWithPublicKey(this.selectedValidator.ownerPubKey, decrypt);
		return cypher;
	}

	selectDocument(docName: string) {
		if (docName == 'Selecione um') {
			this.selectedDocument = null;
			this.listValidators = this.globals.registry.validators;
		} else {
			this.selectedDocument = this.globals.persona.documents.find((doc) => doc.fieldName == docName);
		}
	}

	encryptFile(file: any) {
		this.fileReady = false;
		var file = file.files[0];
		var reader = new FileReader();
		reader.onload = async (event) => {
      const binary = event.target.result as string;
      const encryptedBinary = await this.securityService.encryptWithPublicKey(this.selectedValidator.ownerPubKey, binary);
			const encryptedFile = new File([encryptedBinary], 'encrypted');
			this.fileURL = URL.createObjectURL(encryptedFile);
			this.fileReady = true;
		};
		reader.readAsDataURL(file);
	}

	removeLinkForm(link: string) {
		this.documentLinks = this.documentLinks.filter((obj) => obj !== link);
	}

	addLinkForm(link: string) {
		this.documentLinks.push(link);
	}

	async selectValidator(validator: Validator) {
		this.documentLinks = [];
		if (this.selectedValidator == validator) this.selectedValidator = null;
		else {
			const accepted = await this.scService.getValidatorDocumentType(validator.address, this.selectedDocument.fieldName);
			if (accepted) this.selectedValidator = validator;
			else {
				const toastr = this.toastrService.warning('', 'This validator does not process this kind of document', {
					progressBar: true,
				});
			}
		}
	}
}
