import { Component } from "@angular/core";

@Component({
    selector: 'app-login-info',
    templateUrl: './login-info.component.html'
})
export class LoginInfoComponent {

    userLogged: boolean = false;
    email: string = '';

    constructor() { }

    isLogged(): boolean {
        return this.userLogged;
    }

    login() {
        this.userLogged = true;
        if (this.userLogged)
            this.email = 'user@email.com';
    }

    logout() {
        this.userLogged = false;
        this.email = '';
    }
}