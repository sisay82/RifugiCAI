import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import { Observer } from 'rxjs/Observer';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';

import { IPagedResults, IShelter } from '../shared/types/interfaces';
import { Enums  } from '../shared/types/enums';

@Injectable()
export class ShelterService {

    sheletersBaseUrl: string = 'http://test-mongo-cai.herokuapp.com/api/shelters';

    constructor(private http: Http) { }

    getShelters(): Observable<IShelter[]> {
        return this.http.get(this.sheletersBaseUrl)
            .map((res: Response) => {
                let shelters = res.json();
                return shelters;
            })
            .catch(this.handleError);
    }

    getSheltersPage(page: number, pageSize: number): Observable<IPagedResults<IShelter[]>> {
        return this.http.get(`${this.sheletersBaseUrl}/page/${page}/${pageSize}`)
            .map((res: Response) => {
                const totalRecords = + res.headers.get('X-InlineCount');
                let shelters = res.json();
                return {
                    results: shelters,
                    totalRecords: totalRecords
                };
            })
            .catch(this.handleError);
    }

    getShelter(id: number, section: Enums.ShelterSectionType): Observable<IShelter> {
        let urlsString: String = section ? this.sheletersBaseUrl + '/' + id + '/' + section : this.sheletersBaseUrl + '/' + id;
        return this.http.get(this.sheletersBaseUrl + '/' + id)
            .map((res: Response) => {
                let shelter = res.json();
                return shelter;
            })
            .catch(this.handleError);
    }

    insertShelter(shelter: IShelter): Observable<IShelter> {
        return this.http.post(this.sheletersBaseUrl, shelter)
            .map((res: Response) => res.json())
            .catch(this.handleError);
    }

    updateShelter(shelter: IShelter): Observable<boolean> {
        return this.http.put(this.sheletersBaseUrl + '/' + shelter.id, shelter)
            .map((res: Response) => res.json())
            .catch(this.handleError);
    }

    deleteShelter(id: number): Observable<boolean> {
        return this.http.delete(this.sheletersBaseUrl + '/' + id)
            .map((res: Response) => res.json().status)
            .catch(this.handleError);
    }

    handleError(error: any) {
        console.error('server error:', error);
        if (error instanceof Response) {
            let errMessage = '';
            try {
                errMessage = error.json().error;
            } catch (err) {
                errMessage = error.statusText;
            }
            return Observable.throw(errMessage);
        }
        return Observable.throw(error || 'Node.js server error');
    }
}
