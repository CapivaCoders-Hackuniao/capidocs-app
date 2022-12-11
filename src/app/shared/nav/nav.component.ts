import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { GlobalsService } from 'src/app/services/globals.service';
import { SidebarService } from '../../services/sidebar.service';

@Component({
	selector: 'app-nav',
	templateUrl: './nav.component.html',
	styleUrls: ['nav.component.css'],
})
export class NavComponent implements OnInit {
	isCollapsed: boolean;
	isToggled: boolean=false;
	address: string | undefined;

	constructor(
		private sidebarService: SidebarService,
		private toastrService: ToastrService,
		private router: Router,
		public globals: GlobalsService
	) {
		this.isCollapsed = true;
	}

	ngOnInit(): void {
		this.address = this.globals.user.address;
	}
	copyToClipboard() {
		const selBox = document.createElement('textarea');
		selBox.style.position = 'fixed';
		selBox.style.left = '0';
		selBox.style.top = '0';
		selBox.style.opacity = '0';
		selBox.value = this.address!;
		document.body.appendChild(selBox);
		selBox.focus();
		selBox.select();
		document.execCommand('copy');
		document.body.removeChild(selBox);

		this.toastrService.success('Carteira copiada!', '', {
			progressBar: true,
		});
	}

	toggleSidebar() {
		this.isToggled = !this.isToggled;
		this.sidebarService.changeVisibility(this.isToggled);
	}

	signOut() {
		this.router.navigate(['/accounts/signin']);
	}
}
