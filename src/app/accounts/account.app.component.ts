import { Component, OnInit } from "@angular/core";
import { Globals } from 'src/app/globals';

@Component({
    selector: 'account-app-root',
    templateUrl: './account.app.component.html'
})
export class AccountAppComponent {

    constructor(public globals: Globals
    ) { }
}
