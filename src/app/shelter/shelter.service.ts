import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import { Observer } from 'rxjs/Observer';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { IPagedResults, IShelter, IMarker, IFile } from '../shared/types/interfaces';
import { Enums  } from '../shared/types/enums';

@Injectable()
export class ShelterService {

    //sheletersBaseUrl: string = '/api/shelters';
    sheletersBaseUrl: string = 'http://localhost:8080/api/shelters';
    //sheletersBaseUrl: string = 'https://test-mongo-cai.herokuapp.com/api/shelters';

    constructor(private http: Http) { }

    getShelters(): Observable<IShelter[]> {
        return this.http.get(this.sheletersBaseUrl)
            .map((res: Response) => {
                let shelters = res.json();
                return shelters;
            })
            .catch(this.handleError);
    }

    getNewId():Observable<{id:string}>{
        return this.http.put(this.sheletersBaseUrl + '/confirm/newId',{new:true})
            .map((res: Response) => res.json())
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

    getShelter(id: String): Observable<IShelter> {
        return this.http.get(this.sheletersBaseUrl + '/' + id)
            .map((res: Response) => {
                let shelter = res.json();
                return shelter;
            })
            .catch(this.handleError);
    }

    getConutryMarkersNumber(countryName:String): Observable<any>{
        return this.http.get(this.sheletersBaseUrl + '/country/' + countryName)
            .map((res: Response) => {
                let markers = res.json();
                return markers;
            })
            .catch(this.handleError);
    }

    getSheltersAroundPoint(point:L.LatLng,range:number):Observable<IShelter[]>{
        return this.http.get(this.sheletersBaseUrl + '/point/' + point.lat +'/' + point.lng + '/' + range)
            .map((res: Response) => {
                let shelter = res.json();
                return shelter;
            })
            .catch(this.handleError);
    }   

    getShelterSection(id: String,section: string): Observable<IShelter> {
        return this.http.get(this.sheletersBaseUrl + '/' + id + '/' + section)
            .map((res: Response) => {
                let shelter = res.json();
                return shelter;
            })
            .catch(this.handleError);
    }

    getFile(id):Observable<IFile>{
        return this.http.get(this.sheletersBaseUrl+"/file/"+id)
            .map((res:Response)=>res.json())
            .catch(this.handleError);
    }

    getAllFiles():Observable<IFile[]>{
        return this.http.get(this.sheletersBaseUrl+"/file/all")
            .map((res:Response)=>res.json())
            .catch(this.handleError);
    }

    getFilesByShelterId(id):Observable<IFile[]>{
        return this.http.get(this.sheletersBaseUrl+"/file/byshel/"+id)
            .map((res:Response)=>res.json())
            .catch(this.handleError);
    }

    insertFile(file:IFile):Observable<boolean>{
        return this.http.post(this.sheletersBaseUrl+"/file", file)
            .map((res:Response)=>res.json())
            .catch(this.handleError);
    }

    removeFile(id):Observable<boolean>{
        return this.http.delete(this.sheletersBaseUrl+"/file/"+id)
            .map((res:Response)=>res.json())
            .catch(this.handleError);
    }

    insertShelter(shelter: IShelter): Observable<IShelter> {
        return this.http.post(this.sheletersBaseUrl, shelter)
            .map((res: Response) => res.json())
            .catch(this.handleError);
    }

    confirmShelter(shelterId:String,confirm:boolean): Observable<boolean>{
        return this.http.put(this.sheletersBaseUrl + '/confirm/'+shelterId,{confirm:confirm})
            .map((res: Response) => res.json())
            .catch(this.handleError);
    }

    preventiveUpdateShelter(shelter: IShelter,section:string): Observable<boolean> {
        return this.http.put(this.sheletersBaseUrl + '/confirm/' + section + '/' + shelter._id, shelter)
            .map((res: Response) => res.json())
            .catch(this.handleError);
    }

    updateShelter(shelter: IShelter): Observable<boolean> {
        return this.http.put(this.sheletersBaseUrl + '/' + shelter._id, shelter)
            .map((res: Response) => res.json())
            .catch(this.handleError);
    }

    deleteShelter(id: String): Observable<boolean> {
        return this.http.delete(this.sheletersBaseUrl + '/' + id)
            .map((res: Response) => res.json())
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
