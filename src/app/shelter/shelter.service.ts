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
import { Enums } from '../shared/types/enums';

@Injectable()
export class ShelterService {

    private sheltersBaseUrl = '/api/shelters';
    // private sheltersBaseUrl: string = 'http://localhost:27010/api/shelters';
    // private sheltersBaseUrl: string = 'https://test-mongo-cai.herokuapp.com/api/shelters';

    constructor(private http: Http) { }

    getShelters(): Observable<IShelter[]> {
        return this.http.get(this.sheltersBaseUrl)
            .map((res: Response) => {
                const shelters = res.json();
                return shelters;
            })
            .catch(this.handleError.bind(this));
    }

    getNewId(): Observable<{ id: string }> {
        return this.http.put(this.sheltersBaseUrl + '/confirm/newId', { new: true })
            .map((res: Response) => res.json())
            .catch(this.handleError.bind(this));
    }

    getSheltersPage(page: number, pageSize: number): Observable<IPagedResults<IShelter[]>> {
        return this.http.get(`${this.sheltersBaseUrl}/page/${page}/${pageSize}`)
            .map((res: Response) => {
                const totalRecords = + res.headers.get('X-InlineCount');
                const shelters = res.json();
                return {
                    results: shelters,
                    totalRecords: totalRecords
                };
            })
            .catch(this.handleError);
    }

    getShelter(id: String): Observable<IShelter> {
        return this.http.get(this.sheltersBaseUrl + `/${id}`)
            .map((res: Response) => {
                const shelter = res.json();
                return shelter;
            })
            .catch(this.handleError.bind(this));
    }

    getConutryMarkersNumber(countryName: String): Observable<any> {
        return this.http.get(this.sheltersBaseUrl + `/country/${countryName}`)
            .map((res: Response) => {
                const markers = res.json();
                return markers;
            })
            .catch(this.handleError.bind(this));
    }

    getSheltersAroundPoint(point: L.LatLng, range: number): Observable<IShelter[]> {
        const query = '?lat=' + point.lat + "&lng=" + point.lng + "&range=" + range;

        return this.http.get(this.sheltersBaseUrl + '/point' + query)
            .map((res: Response) => {
                const shelter = res.json();
                return shelter;
            })
            .catch(this.handleError.bind(this));
    }

    getShelterSection(id: String, section: string): Observable<IShelter> {
        return this.http.get(this.sheltersBaseUrl + `/${id}/${section}`)
            .map((res: Response) => {
                const shelter = res.json();
                return shelter;
            })
            .catch(this.handleError.bind(this));
    }

    getFile(id): Observable<IFile> {
        return this.http.get(this.sheltersBaseUrl + `/file/${id}`)
            .map((res: Response) => res.json())
            .catch(this.handleError.bind(this));
    }

    getFIlesByTypes(types): Observable<IFile[]> {
        let query = '?';
        types.forEach(type => {
            query += 'types[]=' + type + '&';
        });
        query = query.substring(0, query.length - 1);
        return this.http.get(this.sheltersBaseUrl + "/files/byType" + query)
            .map((res: Response) => res.json())
            .catch(this.handleError.bind(this));
    }

    getAllFiles(): Observable<IFile[]> {
        return this.http.get(this.sheltersBaseUrl + "/file/all")
            .map((res: Response) => res.json())
            .catch(this.handleError.bind(this));
    }

    getFilesByShelterId(id): Observable<IFile[]> {
        return this.http.get(this.sheltersBaseUrl + `/file/byshel/${id}`)
            .map((res: Response) => res.json())
            .catch(this.handleError.bind(this));
    }

    getFilesByShelterIdAndType(id, types: Enums.Files.File_Type[]): Observable<IFile[]> {
        let query = '';
        if (types && types.length > 0) {
            query = '?';
            types.forEach(type => {
                query += 'types[]=' + type + '&';
            });
            query = query.substring(0, query.length - 1);
        }
        return this.http.get(this.sheltersBaseUrl + `/file/byshel/${id}/bytype` + query)
            .map((res: Response) => res.json())
            .catch(this.handleError.bind(this));
    }

    insertFile(file: IFile): Observable<string> {
        const formData: FormData = new FormData();
        const b = (new Blob([JSON.stringify(file)]))
        formData.append("file", b);
        return this.http.post(this.sheltersBaseUrl + "/file/confirm", formData)
            .map((res: Response) => res.json())
            .catch(this.handleError.bind(this));
    }

    removeFile(id, shelId): Observable<boolean> {
        return this.http.delete(this.sheltersBaseUrl + `/file/confirm/${id}/${shelId}`)
            .map((res: Response) => res.json())
            .catch(this.handleError.bind(this));
    }

    updateFile(file: IFile): Observable<boolean> {
        return this.http.put(this.sheltersBaseUrl + `/file/${file._id}`, { file: file })
            .map((res: Response) => res.json())
            .catch(this.handleError.bind(this));
    }

    insertShelter(shelter: IShelter): Observable<IShelter> {
        return this.http.post(this.sheltersBaseUrl, shelter)
            .map((res: Response) => res.json())
            .catch(this.handleError.bind(this));
    }

    confirmShelter(shelterId: String, confirm: boolean): Observable<boolean> {
        return this.http.put(this.sheltersBaseUrl + `/confirm/${shelterId}`, { confirm: confirm })
            .map((res: Response) => res.json())
            .catch(this.handleError.bind(this));
    }

    preventiveUpdateShelter(shelter: IShelter, section: string): Observable<boolean> {
        return this.http.put(this.sheltersBaseUrl + `/confirm/${section}/${shelter._id}`, shelter)
            .map((res: Response) => res.json())
            .catch(this.handleError.bind(this));
    }

    updateShelter(shelter: IShelter, confirm?: boolean): Observable<boolean> {
        let query = "";
        if (confirm) {
            query = "?confirm=" + confirm;
        }
        return this.http.put(this.sheltersBaseUrl + `/${shelter._id}` + query, shelter)
            .map((res: Response) => res.json())
            .catch(this.handleError.bind(this));
    }

    deleteShelter(id: String): Observable<boolean> {
        return this.http.delete(this.sheltersBaseUrl + `/${id}`)
            .map((res: Response) => res.json())
            .catch(this.handleError.bind(this));
    }

    handleError(error: any) {
        console.error('server error:', error);
        if (error && error.status === 500) {
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
