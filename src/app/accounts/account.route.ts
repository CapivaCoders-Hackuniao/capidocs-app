import { Routes, RouterModule } from "@angular/router";
import { NgModule } from '@angular/core';

import { AccountAppComponent } from './account.app.component';

import { SignInComponent } from './signin/signin.component';
import { RestoreComponent } from './restore/restore.component';
import { CreateComponent } from './create/create.component';
import { CreateConfirmationComponent } from './create-confirmation/create-confirmation.component';
import { CreateConfirmationMneumonicComponent } from "./create-confirmation-mneumonic/create-confirmation-mneumonic.component";


const routerConfig: Routes = [
    {
        path: '', component: AccountAppComponent,
        children: [
            { path: 'signin', component: SignInComponent },
            { path: 'restore', component: RestoreComponent },
            { path: 'create', component: CreateComponent },
            { path: 'create-confirmation-mneumonic', component: CreateConfirmationMneumonicComponent },
            { path: 'create-confirmation', component: CreateConfirmationComponent },
        ]
    }
];

@NgModule({
    imports: [
        RouterModule.forChild(routerConfig)
    ],
    exports: [
        RouterModule
    ]
})
export class AccountRoutingModule { }