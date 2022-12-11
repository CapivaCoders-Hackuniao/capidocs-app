import { Component, OnInit } from '@angular/core';
import { GlobalsService } from 'src/app/services/globals.service';
import { environment } from 'src/environments/environment';

@Component({
	selector: 'app-home',
	templateUrl: './home.component.html',
	styleUrls: ['./home.component.css'],
})
export class HomeComponent implements OnInit {
	address: string | undefined;
	network: string;
	symbol: string;

	constructor(public globals: GlobalsService) {
		this.network = environment.network;
		this.symbol = environment.tokenSymbol;
	}

	ngOnInit(): void {
		this.address = this.globals.user.address;
	}
}
