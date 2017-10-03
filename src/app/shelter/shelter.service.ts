import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';

import { Observable } from 'rxjs/Observable';
import 'rxjs/add/observable/throw';
import { Observer } from 'rxjs/Observer';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import * as L from 'leaflet';
import { Map } from 'leaflet';
import { IPagedResults, IShelter, IMarker, IFile } from '../shared/types/interfaces';
import { Enums  } from '../shared/types/enums';

@Injectable()
export class ShelterService {

    sheltersBaseUrl: string = '/api/shelters';

    constructor(private http: Http) { }

    getShelters(region?:String,section?:String): Observable<IShelter[]> {
        let query="";
        if(region){
            query+="?region="+region
            if(section){
                query+="&section="+section
            }
        }else{
            if(section){
                query+="?section="+section
            }
        }

        return this.http.get(this.sheltersBaseUrl+query)
            .map((res: Response) => {
                let shelters = res.json();
                return shelters;
            })
            .catch(this.handleError.bind(this));
    }

    getNewId():Observable<{id:string}>{
        return this.http.put(this.sheltersBaseUrl + '/confirm/newId',{new:true})
            .map((res: Response) => res.json())
            .catch(this.handleError.bind(this));
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
            .catch(this.handleError.bind(this));
    }

    getConutryMarkersNumber(countryName:String,section:String,region:String): Observable<any>{
        let query="?";
        if(countryName){
            query+='name=' + countryName;
            if(region){
                query+="&";
            }
        }

        if(region){
            query+="region="+region
            if(section){
                query+='&section='+section;
            }
        } 
        
        return this.http.get(this.sheltersBaseUrl + '/country' + query)
            .map((res: Response) => {
                let markers = res.json();
                return markers;
            })
            .catch(this.handleError.bind(this));
    }

    getSheltersAroundPoint(point:L.LatLng,range:number,section?:String,region?:String):Observable<IShelter[]>{
        let query='?lat='+ point.lat +"&lng="+ point.lng+"&range="+range;
        if(region){
            query+='&section='+section;
        }
        if(section){
            query+='&region='+region;
        }
        return this.http.get(this.sheltersBaseUrl + '/point' + query)
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
            .catch(this.handleError.bind(this));
    }

    getFile(id):Observable<IFile>{
        return this.http.get(this.sheltersBaseUrl+"/file/"+id)
            .map((res:Response)=>res.json())
            .catch(this.handleError.bind(this));
    }

    getAllFiles():Observable<IFile[]>{
        return this.http.get(this.sheltersBaseUrl+"/file/all")
            .map((res:Response)=>res.json())
            .catch(this.handleError.bind(this));
    }

    getFilesByShelterId(id):Observable<IFile[]>{
        return this.http.get(this.sheltersBaseUrl+"/file/byshel/"+id)
            .map((res:Response)=>res.json())
            .catch(this.handleError.bind(this));
    }

    getAllImages():Observable<IFile[]>{
        return this.http.get(this.sheltersBaseUrl+"/image/all")
            .map((res:Response)=>res.json())
            .catch(this.handleError.bind(this));
    }

    getImagesByShelterId(id):Observable<IFile[]>{
        return this.http.get(this.sheltersBaseUrl+"/image/byshel/"+id)
            .map((res:Response)=>res.json())
            .catch(this.handleError.bind(this));
    }

    insertFile(file:IFile):Observable<string>{
        let formData:FormData=new FormData();
        let b=(new Blob([JSON.stringify(file)]))
        formData.append("file",b);
        return this.http.post(this.sheltersBaseUrl+"/file/confirm", formData)
            .map((res:Response)=>res.json())
            .catch(this.handleError.bind(this));
    }

    removeFile(id,shelId):Observable<boolean>{
        return this.http.delete(this.sheltersBaseUrl+"/file/confirm/"+id+"/"+shelId)
            .map((res:Response)=>res.json())
            .catch(this.handleError.bind(this));
    }

    updateFile(id,shelId,description):Observable<boolean>{
        return this.http.put(this.sheltersBaseUrl+"/file/"+id,{description:description,shelId:shelId})
            .map((res:Response)=>res.json())
            .catch(this.handleError.bind(this));
    }

    insertShelter(shelter: IShelter): Observable<IShelter> {
        return this.http.post(this.sheltersBaseUrl, shelter)
            .map((res: Response) => res.json())
            .catch(this.handleError.bind(this));
    }

    confirmShelter(shelterId:String,confirm:boolean): Observable<boolean>{
        return this.http.put(this.sheltersBaseUrl + '/confirm/'+shelterId,{confirm:confirm})
            .map((res: Response) => res.json())
            .catch(this.handleError.bind(this));
    }

    preventiveUpdateShelter(shelter: IShelter,section:string): Observable<boolean> {
        return this.http.put(this.sheltersBaseUrl + '/confirm/' + section + '/' + shelter._id, shelter)
            .map((res: Response) => res.json())
            .catch(this.handleError.bind(this));
    }

    updateShelter(shelter: IShelter): Observable<boolean> {
        return this.http.put(this.sheltersBaseUrl + '/' + shelter._id, shelter)
            .map((res: Response) => res.json())
            .catch(this.handleError.bind(this));
    }

    deleteShelter(id: String): Observable<boolean> {
        return this.http.delete(this.sheltersBaseUrl + '/' + id)
            .map((res: Response) => res.json())
            .catch(this.handleError.bind(this));
    }

    handleError(error: any) {
        console.error('server error:', error);
        if (error instanceof Response) {
            if(error.status==403){
                //this.http.get("/")
                /*
                var casBaseUrl = "https://prova.cai.it";
                var parsedUrl=encodeURIComponent("http://localhost:4200/j_spring_cas_security_check");
                location.href=casBaseUrl+"/cai-cas/login?service="+parsedUrl;*/
            }else{
                let errMessage = '';
                try {
                    errMessage = error.json().error;
                } catch (err) {
                    errMessage = error.statusText;
                }
                return Observable.throw(errMessage);
            }
        }
        return Observable.throw(error || 'Node.js server error');
    }
}
