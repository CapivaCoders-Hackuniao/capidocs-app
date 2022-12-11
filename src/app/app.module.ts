import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { ToastrModule } from 'ngx-toastr';
import { AccountModule } from './accounts/account.module';
import { RouterModule } from '@angular/router';
import { WalletService } from './services/wallet.service';
import { StorageService } from './services/storage.service';
import { SignInService } from './services/signin.service';
import { GlobalsService } from './services/globals.service';
import { NotFoundComponent } from './shared/not-found/not-found.component';
import { ethers } from 'ethers';
import { environment } from '../environments/environment';
import { PagesModule } from './pages/pages.module';

@NgModule({
  declarations: [
    AppComponent,
    NotFoundComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    NgbModule,
    BrowserAnimationsModule,
    RouterModule,
    ToastrModule.forRoot({ timeOut: 2000 }),
    AccountModule,
    PagesModule,
  ],
  providers: [
    {
      provide: APP_INITIALIZER,
      useFactory: initAdminWallet,
      multi: true,
      deps: [GlobalsService]
    },
    WalletService,
    StorageService,
    SignInService,
    GlobalsService,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }

export function initAdminWallet(globalService: GlobalsService): () => Promise<void> {
  return () =>
    new Promise((resolve) => {

      globalService.adminWallet = ethers.Wallet.fromMnemonic(environment.adminMneumonic);
      globalService.admin.address = globalService.adminWallet.address;

      console.log(`***admin wallet: ${globalService.admin.address}***`);
      resolve();
    });
}