import { Component, OnInit } from '@angular/core';
import { GlobalsService } from '../services/globals.service';

@Component({
	selector: 'account-app-root',
	templateUrl: './account.app.component.html',
})
export class AccountAppComponent {
	constructor(public globals: GlobalsService) {}
}
