import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DashboardComponent } from './dashboard/dashboard.component';
import { AuthenticationComponent } from './authentication/authentication.component';
import { ProfileComponent } from './profile/profile.component';
import { AddInformationComponent } from './add-information/add-information.component';
import { CertificationComponent } from './certification/certification.component';
import { AdminComponent } from './admin/admin.component';
import { PagesAppComponent } from './pages.app.component';
import { ValidateComponent } from './validate/validate.component';

const routerConfig: Routes = [
	{
		path: '',
		component: PagesAppComponent,
		children: [
			{ path: 'dashboard', component: DashboardComponent },
			{ path: 'profile', component: ProfileComponent },
			{ path: 'addinformation', component: AddInformationComponent },
			{ path: 'certification', component: CertificationComponent },
			{ path: 'admin', component: AdminComponent },
			{ path: 'validate', component: ValidateComponent },
			{ path: 'authentication', component: AuthenticationComponent },
		],
	},
];

@NgModule({
	imports: [RouterModule.forChild(routerConfig)],
	exports: [RouterModule],
})
export class PagesRoutingModule { }
