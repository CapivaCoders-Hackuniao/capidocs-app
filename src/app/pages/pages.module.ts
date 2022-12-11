import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { CustomFormsModule } from 'ngx-custom-validators';
import { TextMaskModule } from 'angular2-text-mask';
import { QRCodeModule } from 'angularx-qrcode';
import { NgxPaginationModule } from 'ngx-pagination';

import { PagesRoutingModule } from './pages.route';
import { NotFoundComponent } from './not-found/not-found.component';
import { SidebarService } from '../services/sidebar.service';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AddInformationComponent } from './add-information/add-information.component';
import { CertificationComponent } from './certification/certification.component';
import { PagesAppComponent } from './pages.app.component';
import { AdminComponent } from './admin/admin.component';
import { AuthenticationComponent } from './authentication/authentication.component';
import { PendingCertificationsComponent } from './pending-certifications/pending-certifications.component';
import { ProfileComponent } from './profile/profile.component';
import { SecurityComponent } from './security/security.component';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { SidebarComponent } from '../components/sidebar/sidebar.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { ModalModule } from '../_modal';
import { ValidateComponent } from './validate/validate.component';
import { SubmitCertificationsComponent } from './submit-certifications/submit-certifications.component';
import { CertificateComponent } from './certificate/certificate.component';
import { FooterComponent } from './footer/footer.component';

@NgModule({
	declarations: [
		PagesAppComponent,
		NotFoundComponent,
		AddInformationComponent,
		AdminComponent,
		AuthenticationComponent,
		CertificationComponent,
		DashboardComponent,
		PendingCertificationsComponent,
		ProfileComponent,
		ValidateComponent,
		SecurityComponent,
		NavbarComponent,
		SidebarComponent,
		SubmitCertificationsComponent,
		CertificateComponent,
  FooterComponent,
	],
	imports: [
		CommonModule,
		RouterModule,
		PagesRoutingModule,
		FormsModule,
		ReactiveFormsModule,
		HttpClientModule,
		NgbModule,
		CustomFormsModule,
		TextMaskModule,
		QRCodeModule,
		NgxSpinnerModule,
    ModalModule,
    NgxPaginationModule,
	],
	providers: [SidebarService],
})
export class PagesModule {}
