import { Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { BaseService } from './base.service';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class TransactionService extends BaseService {
    constructor(
        private http: HttpClient
    ) {
        super();
    }

    getToTransactionByAddress(address): Observable<any> {
        return this.http.get<any>(`${this.urlService}transaction/to/${address}`);
    }

    getFromTransactionByAddress(address): Observable<any> {
        return this.http.get<any>(`${this.urlService}transaction/from/${address}`);
    }
}