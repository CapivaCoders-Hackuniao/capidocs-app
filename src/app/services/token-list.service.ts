import { Injectable, Inject } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { BaseService } from './base.service';
import { Observable } from 'rxjs';
import { catchError, map } from "rxjs/operators";
import { ContractService } from './contract.service';
import { TokenListModel } from '../models/token-list.model';
import { SigninService } from './signin.service';

@Injectable({
    providedIn: 'root'
})
export class TokenListService extends BaseService {

    constructor(
        private contractService: ContractService,
        private signinService: SigninService,
        private httpClient: HttpClient
    ) {
        super();
    }

    listDefault(): Observable<TokenListModel[]> {
        const response = this.httpClient
            .get<TokenListModel[]>(`${this.portalUrl}/token-list`)
            .pipe(
                map(this.extractData),
                catchError(this.serviceError));
        return response;
    }

    getById(id: number): Observable<TokenListModel> {
        const response = this.httpClient
            .post(`${this.portalUrl}/token-list/id`, { id })
            .pipe(
                map(this.extractData),
                catchError(this.serviceError));
        return response;
    }

    async getBalanceById(id: number, address: string) {
        let token;
        this.getById(id).subscribe((response: TokenListModel) => {
            token = response;
        });
        const contractInstance = await this.contractService.instanceUnsigneContract(token.address);
        return await contractInstance.balanceOf(address);
    }

    getByAddress(address: string): Observable<TokenListModel> {
        const response = this.httpClient
            .post(`${this.portalUrl}/token-list/id`, { address })
            .pipe(
                map(this.extractData),
                catchError(this.serviceError));
        return response;
    }

    async getBalanceByAddress(addressToken: string, addressUser: string) {
        const contractInstance = await this.contractService.instanceUnsigneContract(addressToken);
        return await contractInstance.balanceOf(addressUser);
    }

    async getTotalSupply(addressToken: string) {
        const contractInstance = await this.contractService.instanceUnsigneContract(addressToken);
        return await contractInstance.totalSupply();
    }

    async send(addressToken: string, to: string, value: number) {
        const password = this.signinService.getPassword();
        const contractInstance = await this.contractService.instanceSignedContract(addressToken, password);
        return await contractInstance.transfer(to, value);
    }

}