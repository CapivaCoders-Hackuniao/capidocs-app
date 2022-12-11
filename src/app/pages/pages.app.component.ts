import { Component, OnInit } from "@angular/core";
import { Globals } from 'src/app/globals';
import { SidebarService } from "../services/sidebar.service";

@Component({
    selector: 'pages-app-root',
    templateUrl: './pages.app.component.html'
})
export class PagesAppComponent {
	isToogled: boolean;
    constructor(public globals: Globals,
        private sidebarService: SidebarService
    ) { }

    ngOnInit(): void {
        this.sidebarService.currentState.subscribe(a => this.isToogled = a);
      }

}
