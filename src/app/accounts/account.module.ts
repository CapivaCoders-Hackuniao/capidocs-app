import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { CustomFormsModule } from 'ngx-custom-validators';
import { NgxSpinnerModule } from 'ngx-spinner';

import { AccountAppComponent } from './account.app.component';
import { AccountRoutingModule } from './account.route';

import { SigninComponent } from './signin/signin.component';
import { RestoreComponent } from './restore/restore.component';
import { CreateComponent } from './create/create.component';
import { CreateConfirmationComponent } from './create-confirmation/create-confirmation.component';
import { ModalModule } from '../_modal';

import { HeaderComponent } from '../components/header/header.component';
import { FooterComponent } from '../components/footer/footer.component';


@NgModule({
	declarations: [AccountAppComponent, SigninComponent, RestoreComponent, CreateComponent, CreateConfirmationComponent, HeaderComponent , FooterComponent],

	imports: [
		CommonModule,
		RouterModule,
		FormsModule,
		ReactiveFormsModule,
		CustomFormsModule,
		NgxSpinnerModule,
		AccountRoutingModule,
		ModalModule
	],
	providers: [],
})
export class AccountModule {}
