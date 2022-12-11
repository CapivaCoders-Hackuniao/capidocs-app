import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalsService } from 'src/app/services/globals.service';
import { environment } from 'src/environments/environment';

@Component({
	selector: 'app-sidebar',
	templateUrl: './sidebar.component.html',
	styleUrls: ['./sidebar.component.css'],
})
export class SidebarComponent implements OnInit {

	address: string | undefined;
	blockchainExplorer: string | undefined;

	constructor(
		private router: Router,
		public globals: GlobalsService,
	) { }

	ngOnInit(): void {
		this.address = this.globals.user.address;
		this.blockchainExplorer = environment.blockchainExplorer;
	}

	signOut() {
		this.router.navigate(['/accounts/signin']);
	}
}
