import { Component, OnInit } from '@angular/core';

import { Globals } from 'src/app/globals';
import { SidebarService } from 'src/app/services/sidebar.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {
  isCollapsed: boolean;
  isToggled: boolean;

  constructor(
    public globals: Globals,
    private sidebarService: SidebarService) {
      this.isCollapsed = true;
     }

  ngOnInit(): void {
  }

  toggleSidebar() {
    this.isToggled = !this.isToggled;
    this.sidebarService.changeVisibility(this.isToggled);
}
}
