import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import * as L from 'leaflet';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import { Observer } from 'rxjs/Observer';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import { IPagedResults, IShelter, IMarker, IFile } from '../shared/types/interfaces';
import { Enums  } from '../shared/types/enums';

@Injectable()
export class ShelterService {

    //private sheltersBaseUrl: string = '/api/shelters';
    private sheltersBaseUrl: string = 'http://localhost:27010/api/shelters';
    //private sheltersBaseUrl: string = 'https://test-mongo-cai.herokuapp.com/api/shelters';

    constructor(private http: Http) { }

    getShelters(): Observable<IShelter[]> {
        return this.http.get(this.sheltersBaseUrl)
            .map((res: Response) => {
                let shelters = res.json();
                return shelters;
            })
            .catch(this.handleError);
    }

    getNewId():Observable<{id:string}>{
        return this.http.put(this.sheltersBaseUrl + '/confirm/newId',{new:true})
            .map((res: Response) => res.json())
            .catch(this.handleError);
    }

    getSheltersPage(page: number, pageSize: number): Observable<IPagedResults<IShelter[]>> {
        return this.http.get(`${this.sheltersBaseUrl}/page/${page}/${pageSize}`)
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
        return this.http.get(this.sheltersBaseUrl + '/' + id)
            .map((res: Response) => {
                let shelter = res.json();
                return shelter;
            })
            .catch(this.handleError);
    }

    getConutryMarkersNumber(countryName:String): Observable<any>{
        return this.http.get(this.sheltersBaseUrl + '/country?name=' + countryName)
            .map((res: Response) => {
                let markers = res.json();
                return markers;
            })
            .catch(this.handleError.bind(this));
    }

    getSheltersAroundPoint(point:L.LatLng,range:number):Observable<IShelter[]>{
        return this.http.get(this.sheltersBaseUrl + '/point?lat='+ point.lat +"&lng="+ point.lng+"&range="+range)
            .map((res: Response) => {
                let shelter = res.json();
                return shelter;
            })
            .catch(this.handleError.bind(this));
    }      

    getShelterSection(id: String,section: string): Observable<IShelter> {
        return this.http.get(this.sheltersBaseUrl + '/' + id + '/' + section)
            .map((res: Response) => {
                let shelter = res.json();
                return shelter;
            })
            .catch(this.handleError);
    }

    getFile(id):Observable<IFile>{
        return this.http.get(this.sheltersBaseUrl+"/file/"+id)
            .map((res:Response)=>res.json())
            .catch(this.handleError);
    }

    getAllFiles():Observable<IFile[]>{
        return this.http.get(this.sheltersBaseUrl+"/file/all")
            .map((res:Response)=>res.json())
            .catch(this.handleError);
    }

    getFilesByShelterId(id):Observable<IFile[]>{
        return this.http.get(this.sheltersBaseUrl+"/file/byshel/"+id)
            .map((res:Response)=>res.json())
            .catch(this.handleError);
    }

    getAllImages():Observable<IFile[]>{
        return this.http.get(this.sheltersBaseUrl+"/image/all")
            .map((res:Response)=>res.json())
            .catch(this.handleError);
    }

    getImagesByShelterId(id):Observable<IFile[]>{
        return this.http.get(this.sheltersBaseUrl+"/image/byshel/"+id)
            .map((res:Response)=>res.json())
            .catch(this.handleError);
    }

    insertFile(file:IFile):Observable<string>{
        let formData:FormData=new FormData();
        let b=(new Blob([JSON.stringify(file)]))
        formData.append("file",b);
        return this.http.post(this.sheltersBaseUrl+"/file/confirm", formData)
            .map((res:Response)=>res.json())
            .catch(this.handleError);
    }

    removeFile(id,shelId):Observable<boolean>{
        return this.http.delete(this.sheltersBaseUrl+"/file/confirm/"+id+"/"+shelId)
            .map((res:Response)=>res.json())
            .catch(this.handleError);
    }

    updateFile(file:IFile):Observable<boolean>{
        return this.http.put(this.sheltersBaseUrl+"/file/"+file._id,{file:file})
            .map((res:Response)=>res.json())
            .catch(this.handleError);
    }

    insertShelter(shelter: IShelter): Observable<IShelter> {
        return this.http.post(this.sheltersBaseUrl, shelter)
            .map((res: Response) => res.json())
            .catch(this.handleError);
    }

    confirmShelter(shelterId:String,confirm:boolean): Observable<boolean>{
        return this.http.put(this.sheltersBaseUrl + '/confirm/'+shelterId,{confirm:confirm})
            .map((res: Response) => res.json())
            .catch(this.handleError);
    }

    preventiveUpdateShelter(shelter: IShelter,section:string): Observable<boolean> {
        return this.http.put(this.sheltersBaseUrl + '/confirm/' + section + '/' + shelter._id, shelter)
            .map((res: Response) => res.json())
            .catch(this.handleError);
    }

    updateShelter(shelter: IShelter): Observable<boolean> {
        return this.http.put(this.sheltersBaseUrl + '/' + shelter._id, shelter)
            .map((res: Response) => res.json())
            .catch(this.handleError);
    }

    deleteShelter(id: String): Observable<boolean> {
        return this.http.delete(this.sheltersBaseUrl + '/' + id)
            .map((res: Response) => res.json())
            .catch(this.handleError);
    }

    handleError(error: any) {
        console.error('server error:', error);
        if(error&&error.status==500){
          //  location.href="/pageNotFound"
        }

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
