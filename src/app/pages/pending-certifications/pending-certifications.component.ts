import { Component, OnInit } from '@angular/core';
import { Globals } from 'src/app/globals';
import { Persona } from '../../models/persona.model';
import { LocalStorageKeysEnum } from 'src/app/models/local-storage-keys.enum';
import { StorageService } from 'src/app/services/storage.service';
import { WalletService } from 'src/app/services/wallet.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { SmartContractsService } from 'src/app/services/smart-contracts.service';

@Component({
	selector: 'app-pending-certifications',
	templateUrl: './pending-certifications.component.html',
	styleUrls: ['./pending-certifications.component.css'],
})
export class PendingCertificationsComponent {
	public paginacao = 1;

	constructor(
		public globals: Globals,
		private spinner: NgxSpinnerService,
		private toastrService: ToastrService,
		private scService: SmartContractsService
	) {}

	approve() {
		this.scService.processCall(this.globals.persona.processLastPendingCertificate(true), this.spinner, this.toastrService, () => {
			this.globals.persona.loadPersona(() => {}, this.scService);
		});
	}

	discard() {
		this.scService.processCall(this.globals.persona.processLastPendingCertificate(false), this.spinner, this.toastrService, () => {
			this.globals.persona.loadPersona(() => {}, this.scService);
		});
	}
}
