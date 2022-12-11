import { Component, OnInit } from '@angular/core';
import { environment } from '../../../environments/environment';
import { ethers } from 'ethers';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { SmartContractsService } from 'src/app/services/smart-contracts.service';
import { Globals } from 'src/app/globals';
import { FormGroup, FormBuilder } from '@angular/forms';
import CryptoJS from 'crypto-js';
import { SecurityService } from 'src/app/services/security.service';

@Component({
	selector: 'app-add-information',
	templateUrl: './add-information.component.html',
	styleUrls: ['./add-information.component.css'],
})
export class AddInformationComponent implements OnInit {
	documentNames: string[];
	form: FormGroup;
	formDocuments: string[];

	replace: boolean;

	constructor(
		private spinner: NgxSpinnerService,
		private toastrService: ToastrService,
		private scService: SmartContractsService,
		public globals: Globals,
		private fb: FormBuilder,
		private securityService: SecurityService
	) {
		this.form = this.fb.group({ documentToAdd: [''], docValue: [''] });
		this.formDocuments = [];
	}

	ngOnInit(): void {
		const input = document.getElementById('docFile');
    const fileName = document.getElementById('file-name');

	input.addEventListener('change', function(){
			fileName.textContent = "Documento carregado"
	});
		this.documentNames = environment.docsList;
	}

	async generateHash(value: string, obj: any) {
		const payload = await this.scService.generateSignature(value);
		obj.value = ethers.utils.solidityKeccak256(['string'], [payload]);
	}

	hashFile(file: any) {
		var file = file.files[0];
		var reader = new FileReader();
		reader.onload = (event) => {
			var binary = String(event.target.result);
			var hash = '0x' + CryptoJS.SHA256(binary).toString(CryptoJS.enc.Hex);
			this.addDocumentForm(hash);
		};
		reader.readAsBinaryString(file);
	}

	addDocumentForm(hash: string) {
		this.formDocuments.push(hash);
	}

	removeDocumentForm(hash: string) {
		this.formDocuments = this.formDocuments.filter((obj) => obj !== hash);
	}

	updateReplace(documentName: string) {
		const dName = this.scService.hashDocumentName(documentName);
		this.replace = this.globals.persona.documents.filter((obj) => obj.field == dName).length > 0;
	}

	addDocument(documentName: string, documentValue: string, documentValueHash: string) {
		this.scService.processCall(
			this.globals.persona.addField(
				documentName,
				this.securityService.encryptAES(
					{ documentValue: documentValue },
					ethers.utils.solidityKeccak256(['string'], [this.globals.userWallet.privateKey])
				),
				documentValueHash,
				this.formDocuments
			),
			this.spinner,
			this.toastrService,
			() => {
				this.globals.persona.loadPersona(() => {}, this.scService);
				this.form.reset();
				this.formDocuments = [];
			}
		);
	}

	replaceDocument(documentName: string, documentValue: string, documentValueHash: string) {
		this.scService.processCall(
			this.globals.persona.replaceField(
				documentName,
				this.securityService.encryptAES(
					{ documentValue: documentValue },
					ethers.utils.solidityKeccak256(['string'], [this.globals.userWallet.privateKey])
				),
				documentValueHash,
				this.formDocuments
			),
			this.spinner,
			this.toastrService,
			() => {
				this.globals.persona.loadPersona(() => {}, this.scService);
				this.form.reset();
				this.formDocuments = [];
			}
		);
	}
}
