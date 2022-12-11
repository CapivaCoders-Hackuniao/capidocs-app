import { NgModule } from "@angular/core";
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TextMaskModule } from 'angular2-text-mask';
import { NgxSpinnerModule } from "ngx-spinner";
import { QrCodeModule } from 'ng-qrcode';

import { PagesAppComponent } from './pages.app.component';
import { PagesRoutingModule } from './pages.route';

import { HomeComponent } from './home/home.component';
import { SidebarService } from '../services/sidebar.service';
import { SidebarComponent } from "../shared/sidebar/sidebar.component";
import { NavComponent } from "../shared/nav/nav.component";
import { ProfileComponent } from './profile/profile.component';


@NgModule({
    declarations: [
        PagesAppComponent,
        SidebarComponent,
        NavComponent,
        HomeComponent,
        ProfileComponent,
    ],
    imports: [
        CommonModule,
        RouterModule,
        PagesRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        HttpClientModule,
        NgbModule,
        QrCodeModule,
        TextMaskModule,
        NgxSpinnerModule
    ],
    providers: [
        SidebarService,
    ]
})
export class PagesModule { }
