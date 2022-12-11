import { Component, OnInit } from '@angular/core';
import { Globals } from '../../globals';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { CustomValidators } from 'ngx-custom-validators';
import { ethers } from 'ethers';
import { NgxSpinnerService } from 'ngx-spinner';
import { ToastrService } from 'ngx-toastr';
import { SmartContractsService } from 'src/app/services/smart-contracts.service';

@Component({
	selector: 'app-admin',
	templateUrl: './admin.component.html',
	styleUrls: ['./admin.component.css'],
})
export class AdminComponent implements OnInit {
	form: FormGroup;

	constructor(
		public globals: Globals,
		private toastrService: ToastrService,
		private spinner: NgxSpinnerService,
		private fb: FormBuilder,
		private scService: SmartContractsService
	) {
		this.form = this.fb.group({
			name: [this.globals.registry.name, [Validators.required, CustomValidators.rangeLength([1, 32])]],
			requireRolePersona: [this.globals.registry.requireRolePersona, [Validators.required]],
			requireRoleValidator: [this.globals.registry.requireRoleValidator, [Validators.required]],
			personaFactory: [this.globals.registry.personaFactory, [Validators.required, CustomValidators.rangeLength([42, 42])]],
			validatorFactory: [this.globals.registry.validatorFactory, [Validators.required, CustomValidators.rangeLength([42, 42])]],
			newPersonaName: ['', [Validators.required, CustomValidators.rangeLength([1, 32])]],
			newPersonaAddress: ['', [Validators.required, CustomValidators.rangeLength([42, 42])]],
			newValidatorName: ['', [Validators.required, CustomValidators.rangeLength([1, 32])]],
      newValidatorAddress: ['', [Validators.required, CustomValidators.rangeLength([42, 42])]],
      newValidatorPubKey: ['', [Validators.required, CustomValidators.rangeLength([64, 132])]],
			addRoleAddress: ['', [Validators.required, CustomValidators.rangeLength([42, 42])]],
		});
	}

	ngOnInit(): void {}

	changeName(param: string) {
		this.scService.processCall(
			this.globals.registry.registryContractInstance.changeName(ethers.utils.formatBytes32String(param)),
			this.spinner,
			this.toastrService
		);
	}

	changeRequireRolePersona(param: boolean) {
		this.scService.processCall(
			this.globals.registry.registryContractInstance.changeRequireRolePersona(param),
			this.spinner,
			this.toastrService
		);
	}

	changeRequireRoleValidator(param: boolean) {
		this.scService.processCall(
			this.globals.registry.registryContractInstance.changeRequireRoleValidator(param),
			this.spinner,
			this.toastrService
		);
	}

	updateFactory(personaFactory: string, validatorFactory: string) {
		this.scService.processCall(
			this.globals.registry.registryContractInstance.updateFactoryAddresses(personaFactory, validatorFactory),
			this.spinner,
			this.toastrService
		);
	}

	newPersona(name: string, address: string) {
		this.scService.processCall(
			this.globals.registry.registryContractInstance.personaCreateRegistry(address, ethers.utils.formatBytes32String(name)),
			this.spinner,
			this.toastrService
		);
	}

	newValidator(name: string, address: string, pubKey: string) {
		this.scService.processCall(
			this.globals.registry.registryContractInstance.validatorCreateRegistry(address, ethers.utils.formatBytes32String(name), pubKey),
			this.spinner,
			this.toastrService
		);
	}

	revokeRole(id: string, address: string) {
		this.scService.processCall(
			this.globals.registry.registryContractInstance.revokeRole(id, address),
			this.spinner,
			this.toastrService
		);
	}

	grantRole(id: string, address: string) {
		this.scService.processCall(
			this.globals.registry.registryContractInstance.grantRole(ethers.utils.solidityKeccak256(['string'], [id]), address),
			this.spinner,
			this.toastrService
		);
	}

	refreshInfos() {
		this.spinner.show();
		Promise.all([
			this.scService.loadContracts(),
			this.globals.registry.loadRegistryAdmin((progress: number) => {
				this.loaderCallback(progress);
			}, this.scService),
		]).then(() => {
			this.spinner.hide();
			this.toastrService.success('Success', 'Registry lodaded', {
				progressBar: true,
			});
		}),
			(err) => {
				this.scService.showErr(err, this.spinner, this.toastrService);
			};
	}

	loaderCallback(progressBar: number) {
		if (progressBar == 0) this.globals.loaderProgress = '';
		else this.globals.loaderProgress = progressBar.toFixed(2);
	}
}
