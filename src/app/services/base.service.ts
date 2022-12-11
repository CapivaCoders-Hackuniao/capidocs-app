import { environment } from 'src/environments/environment';
import { HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';

export abstract class BaseService { 
    protected urlService: string = `${environment.api.server}:${environment.api.port}/`;
    protected portalUrl: string = `${environment.portalUrl.server}:${environment.portalUrl.port}`;

    protected extractData(response: any) {
        return response.data || {};
    }
    protected serviceError(response: Response | any) {
        let customError: string[] = [];
        let customResponse = { error: { errors: [] } }
        if (response instanceof HttpErrorResponse) {
            if (response.statusText === 'Unknown Error') {
                customError.push('An unknown error has occurred');
                response.error.errors = customError;
            }
        }
        if (response.status === 500) {
            customError.push('Processing error occurred, please try again later or contact support');
            customResponse.error.errors = customError;
            return throwError(customResponse);
        }
        return throwError(response);
    }
}