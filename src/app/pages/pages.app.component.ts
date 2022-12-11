import { Component, OnInit } from '@angular/core';
import { SidebarService } from '../services/sidebar.service';
import { SignInService } from '../services/signin.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { GlobalsService } from '../services/globals.service';

@Component({
  selector: 'pages-app-root',
  templateUrl: './pages.app.component.html',
  styleUrls: ['./pages.app.component.css']
})
export class PagesAppComponent implements OnInit {
  isToogled: boolean | undefined;
  address: Observable<string> | undefined;

  constructor(
    private sidebarService: SidebarService,
    private signInService: SignInService,
    private router: Router,
    public globals: GlobalsService
  ) { }

  ngOnInit(): void {

    this.sidebarService.currentState.subscribe(a => this.isToogled = a);

    this.signInService.updateAddressStore();
    this.signInService.address.subscribe(address => {
      if (!address)
        this.router.navigate(['/accounts/signin']);
    });
  }
}
