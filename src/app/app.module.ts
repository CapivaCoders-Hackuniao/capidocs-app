import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { Globals } from './globals';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { AccountModule } from './accounts/account.module';
import { SecurityService } from './services/security.service';
import { WalletService } from './services/wallet.service';
import { StorageService } from './services/storage.service';
import { SigninService } from './services/signin.service';
import { ToastrModule } from 'ngx-toastr';
import { ModalModule } from './_modal';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AngularOpenDatagridModule } from 'angular-open-datagrid';
import { PagesModule } from './pages/pages.module';


@NgModule({
	declarations: [AppComponent],
	imports: [
		BrowserModule,
		FormsModule,
		ReactiveFormsModule,
		AppRoutingModule,
		BrowserAnimationsModule,
		AccountModule,
		PagesModule,
		ModalModule,
		AngularOpenDatagridModule,
		ToastrModule.forRoot({ timeOut: 2000 }),
		NgbModule,
	],
	providers: [WalletService, StorageService, SigninService, SecurityService, Globals],
	bootstrap: [AppComponent],
})
export class AppModule {}
