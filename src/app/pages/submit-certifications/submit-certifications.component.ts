import { Component, ViewChild } from '@angular/core';
import { Globals } from 'src/app/globals';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { SmartContractsService } from 'src/app/services/smart-contracts.service';
import { CustomValidators } from 'ngx-custom-validators';
import { ethers } from 'ethers';
import { PersonaCertificate } from 'src/app/models/persona.model';
import * as htmlToImage from 'html-to-image';
import $ from "jquery";
import { FileHostingService } from 'src/app/services/file-hosting.service';

@Component({
	selector: 'app-submit-certifications',
	templateUrl: './submit-certifications.component.html',
	styleUrls: ['./submit-certifications.component.css'],
})
export class SubmitCertificationsComponent {
	form: FormGroup;
	certificatePreview: PersonaCertificate;
  templateId: number;
  upload: boolean;

	templateTables = [
		//TODO: Load from file/config/env/etc...
		{ name: 'Diploma', title: 'Diploma de', message: 'concluiu satisfatoriamente o curso de' },
		{ name: 'Curso' },
		{ name: 'Participação' },
		{ name: 'Recibo' },
		{ name: 'Evento' },
		{ name: 'Doação' },
		{ name: 'Ato' },
	];

	constructor(
		public globals: Globals,
		private fb: FormBuilder,
		private spinner: NgxSpinnerService,
		private toastrService: ToastrService,
    private scService: SmartContractsService,
    private fileHosting: FileHostingService
	) {
		this.form = this.fb.group({
			address: ['', [Validators.required, CustomValidators.rangeLength([42, 42])]],
			name: ['', [Validators.required, CustomValidators.rangeLength([1, 32])]],
			value: ['', [Validators.required, CustomValidators.rangeLength([1, 256])]],
			header: [''],
			description: [''],
			image: [''],
			imageUpload: [''],
			url: [''],
			issuer: [''],
			footer: [''],
			signerName: [''],
			date: [''],
		});
		this.templateId = -1;
	}

	async sendCertificateInfo() {
    if (this.upload) {
      if (this.form.controls.imageUpload.value) {
        //TODO
      }
      else {
        const signature = await this.globals.userWallet.signMessage(
          ethers.utils.id(this.form.controls.image.value));
        const url = await this.fileHosting.hostDataUrl(signature, this.form.controls.image.value);
        this.form.controls.image.setValue(url);
      }
    }
    const content = this.certificateContent();
		this.sendCertificate(this.form.controls.address.value, this.form.controls.name.value, this.form.controls.value.value, content);
	}

	private certificateContent() {
		return JSON.stringify({
			header: this.form.controls.header.value,
			description: this.form.controls.description.value,
			image: this.form.controls.image.value,
			url: this.form.controls.url.value,
			issuer: this.form.controls.issuer.value,
			footer: this.form.controls.footer.value,
		});
	}

	async sendCertificate(address: string, name: string, value: string, content: string) {
		const signaturePayload = await this.certificateSignature(address, name, value, content);
		this.scService.processCall(
			this.globals.persona.giveCertificateTo(address, name, value, content, signaturePayload),
			this.spinner,
			this.toastrService,
			() => {
				this.globals.persona.loadPersona(() => {}, this.scService);
			}
		);
	}

	private async certificateSignature(address: string, name: string, value: string, content: string) {
		return await this.globals.userWallet.signMessage(
			ethers.utils.id(JSON.stringify({ address: address, name: name, value: value, content: content }))
		);
	}

	preview() {
		const content = this.certificateContent();
		this.certificatePreview = new PersonaCertificate(
			this.form.controls.issuer.value,
			this.form.controls.name.value,
			this.form.controls.value.value,
			content,
			'assinatura hash',
			'0'
		);
	}

	fillTemplate() {
		this.form.controls.description.setValue(
			'Isso certifica que ' +
				this.form.controls.name.value +
				' ' +
				this.templateTables[this.templateId].message +
				' ' +
				this.form.controls.value.value
		);
		this.form.controls.header.setValue(this.templateTables[this.templateId].title + ' ' + this.form.controls.value.value);
		this.form.controls.footer.setValue('Signed by ' + this.form.controls.signerName.value);
		const node = document.getElementById('certificate-template-generated');
		htmlToImage
			.toPng(node)
			.then((dataUrl) => {
        this.form.controls.image.setValue(dataUrl);
        this.upload = true;
        this.preview();
        $('#template-modal-close').click();
			})
			.catch(function (error) {
				console.error('Error to generate file', error);
			});
  }
}
