import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { NgxSpinnerModule } from "ngx-spinner";

import { AccountAppComponent } from './account.app.component';
import { AccountRoutingModule } from './account.route';

import { SignInComponent } from './signin/signin.component';
import { RestoreComponent } from './restore/restore.component';
import { CreateComponent } from './create/create.component';
import { CreateConfirmationComponent } from './create-confirmation/create-confirmation.component';
import { CreateConfirmationMneumonicComponent } from "./create-confirmation-mneumonic/create-confirmation-mneumonic.component";

@NgModule({
    declarations: [
        AccountAppComponent,
        SignInComponent,
        RestoreComponent,
        CreateComponent,
        CreateConfirmationComponent,
        CreateConfirmationMneumonicComponent,
    ],
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        NgxSpinnerModule,
        AccountRoutingModule
    ],
    providers: [
       
    ]
})
export class AccountModule { }