import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Globals } from "src/app/globals";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from "ngx-toastr";
import { SmartContractsService } from "src/app/services/smart-contracts.service";
import { SecurityService } from "src/app/services/security.service";
import { CustomValidators } from "ngx-custom-validators";
import { ethers } from "ethers";

@Component({
	selector: "app-dashboard",
	templateUrl: "./dashboard.component.html",
	styleUrls: ["./dashboard.component.css"],
})
export class DashboardComponent implements OnInit {
	isToogled: boolean;

	public pagination = 1;
	form: FormGroup;
	createPersonaFormGroup: FormGroup;
	createValidatorFormGroup: FormGroup;

	showValues: boolean[];

	constructor(
		private fb: FormBuilder,
		public globals: Globals,
		private spinner: NgxSpinnerService,
		private toastrService: ToastrService,
		private scService: SmartContractsService,
		private securityService: SecurityService
	) {
		this.form = this.fb.group({
			document: ["", [Validators.required]],
			value: ["", [Validators.required]],
		});
		this.createPersonaFormGroup = this.fb.group({
			personaName: ["", [Validators.required, CustomValidators.rangeLength([1, 32])]],
		});
		this.createValidatorFormGroup = this.fb.group({
			validatorName: ["", [Validators.required, CustomValidators.rangeLength([1, 32])]],
		});
		this.showValues = [];
	}

	ngOnInit(): void {}

	updateFields(item) {
		this.form.patchValue({
			document: item.fieldName,
			value: item.value,
		});
	}

	async decryptValue(item: any, index: number) {
		if (!item.decryptValue || item.decryptValue.length == 0) {
			const decrypt = await this.securityService.decryptAES(
				item.value,
				ethers.utils.solidityKeccak256(["string"], [this.globals.userWallet.privateKey])
			);
			item.decryptValue = decrypt.documentValue;
		}
		this.showValues[index] = true;
	}

	createPersona(name: string) {
		this.spinner.show();
		let loader = 0;
		const interval = setInterval(() => {
			loader += ((100 - loader) * 3 * Math.random()) / (5 + loader);
			if (loader > 99.9) loader = 99.99;
			this.globals.loaderProgress = loader.toFixed(2);
		}, 100);
		this.globals.registry.createPersona(name).then(
			(tx) => {
				this.loadContracts().then(
					() => {
						this.globals.persona
							.loadPersona((progress: number) => {
								this.globals.loaderProgress = progress.toFixed(2);
							}, this.scService)
							.then(() => {
								clearInterval(interval);
								this.spinner.hide();
							}),
							(err) => {
								console.warn(err);
								clearInterval(interval);
								this.spinner.hide();
							};
					},
					(err) => {
						console.warn(err);
						clearInterval(interval);
						this.spinner.hide();
					}
				);
			},
			(err) => {
				console.warn(err);
				clearInterval(interval);
				this.spinner.hide();
			}
		);
	}

	createValidator(name: string) {
		this.spinner.show();
		let loader = 0;
		const interval = setInterval(() => {
			loader += ((100 - loader) * 3 * Math.random()) / (5 + loader);
			if (loader > 99.9) loader = 99.99;
			this.globals.loaderProgress = loader.toFixed(2);
		}, 100);
		this.globals.registry.createValidator(name, this.globals.userWallet.publicKey).then(
			(tx) => {
				this.loadContracts().then(
					() => {
						this.globals.loaderProgress = "0";
						clearInterval(interval);
						this.globals.validator
							.loadValidator((progress: number) => {
								this.globals.loaderProgress = progress.toFixed(2);
							}, this.scService)
							.then(() => {
								this.spinner.hide();
							}),
							(err) => {
								clearInterval(interval);
								console.warn(err);
								this.spinner.hide();
							};
					},
					(err) => {
						console.warn(err);
						this.spinner.hide();
					}
				);
			},
			(err) => {
				console.warn(err);
				this.loadContracts().then(
					() => {
						clearInterval(interval);
						this.globals.validator
							.loadValidator((progress: number) => {
								this.globals.loaderProgress = progress.toFixed(2);
							}, this.scService)
							.then(() => {
								this.spinner.hide();
							}),
							(err) => {
								clearInterval(interval);
								console.warn(err);
								this.spinner.hide();
							};
					},
					(err) => {
						console.warn(err);
						this.spinner.hide();
					}
				);
			}
		);
	}

	async loadContracts() {
		await this.scService.loadContracts();
	}
}
