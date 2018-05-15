
import { throwError as observableThrowError, Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Map, LatLng } from 'leaflet';
import { IPagedResults, IShelter, IMarker, IFile } from '../shared/types/interfaces';
import { Enums } from '../shared/types/enums';
import { catchError, map } from 'rxjs/operators';

@Injectable()
export class ShelterService {

    private sheltersBaseUrl = '/api/shelters';
    // private sheltersBaseUrl: string = 'http://localhost:27010/api/shelters';
    // private sheltersBaseUrl: string = 'https://test-mongo-cai.herokuapp.com/api/shelters';

    constructor(private http: HttpClient) { }

    getShelters(): Observable<IShelter[]> {
        return this.http.get(this.sheltersBaseUrl).pipe(
            map(res => Array.isArray(res) ? <any>res : []),
            catchError(this.handleError.bind(this)));
    }

    getNewId(): Observable<{ id: string }> {
        return this.http.put(this.sheltersBaseUrl + '/confirm/newId', { new: true }).pipe(
            map(res => <any>res),
            catchError(this.handleError.bind(this)));
    }

    getSheltersPage(page: number, pageSize: number): Observable<IPagedResults<IShelter[]>> {
        return this.http.get(`${this.sheltersBaseUrl}/page/${page}/${pageSize}`).pipe(
            map((res: Response) => {
                const totalRecords = + res.headers.get('X-InlineCount');
                if (Array.isArray(res)) {
                    return {
                        results: <any>res,
                        totalRecords: totalRecords
                    };
                } else {
                    return {
                        results: [],
                        totalRecords: totalRecords
                    }
                }
            }),
            catchError(this.handleError));
    }

    getShelter(id: String): Observable<IShelter> {
        return this.http.get(this.sheltersBaseUrl + `/${id}`).pipe(
            catchError(this.handleError.bind(this)));
    }

    getConutryMarkersNumber(countryName: String): Observable<any> {
        return this.http.get(this.sheltersBaseUrl + `/country/${countryName}`).pipe(
            catchError(this.handleError.bind(this)));
    }

    getSheltersAroundPoint(point: LatLng, range: number): Observable<IShelter[]> {
        const query = '?lat=' + point.lat + "&lng=" + point.lng + "&range=" + range;
        return this.http.get(this.sheltersBaseUrl + '/point' + query).pipe(
            map(res => Array.isArray(res) ? <any>res : []),
            catchError(this.handleError.bind(this)));
    }

    getShelterSection(id: String, section: string): Observable<IShelter> {
        return this.http.get(this.sheltersBaseUrl + `/${id}/${section}`).pipe(
            catchError(this.handleError.bind(this)));
    }

    getFile(id): Observable<IFile> {
        return this.http.get(this.sheltersBaseUrl + `/file/${id}`).pipe(
            catchError(this.handleError.bind(this)));
    }

    getFIlesByTypes(types): Observable<IFile[]> {
        let query = '?';
        types.forEach(type => {
            query += 'types[]=' + type + '&';
        });
        query = query.substring(0, query.length - 1);
        return this.http.get(this.sheltersBaseUrl + "/files/byType" + query).pipe(
            map(res => Array.isArray(res) ? <any>res : []),
            catchError(this.handleError.bind(this)));
    }

    getAllFiles(): Observable<IFile[]> {
        return this.http.get(this.sheltersBaseUrl + "/file/all").pipe(
            map(res => Array.isArray(res) ? <any>res : []),
            catchError(this.handleError.bind(this)));
    }

    getFilesByShelterId(id): Observable<IFile[]> {
        return this.http.get(this.sheltersBaseUrl + `/file/byshel/${id}`).pipe(
            map(res => Array.isArray(res) ? <any>res : []),
            catchError(this.handleError.bind(this)));
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
        return this.http.get(this.sheltersBaseUrl + `/file/byshel/${id}/bytype` + query).pipe(
            map(res => Array.isArray(res) ? <any>res : []),
            catchError(this.handleError.bind(this)));
    }

    insertFile(file: IFile): Observable<String> {
        const formData: FormData = new FormData();
        const b = (new Blob([JSON.stringify(file)]))
        formData.append("file", b);
        return this.http.post(this.sheltersBaseUrl + "/file/confirm", formData).pipe(
            map(res => res instanceof Object ? null : <any>res),
            catchError(this.handleError.bind(this)));
    }

    removeFile(id, shelId): Observable<boolean> {
        return this.http.delete(this.sheltersBaseUrl + `/file/confirm/${id}/${shelId}`).pipe(
            map(res => res instanceof Object ? null : <any>res),
            catchError(this.handleError.bind(this)));
    }

    updateFile(file: IFile): Observable<boolean> {
        return this.http.put(this.sheltersBaseUrl + `/file/${file._id}`, { file: file }).pipe(
            map(res => res instanceof Object ? null : <any>res),
            catchError(this.handleError.bind(this)));
    }

    insertShelter(shelter: IShelter): Observable<IShelter> {
        return this.http.post(this.sheltersBaseUrl, shelter).pipe(
            catchError(this.handleError.bind(this)));
    }

    confirmShelter(shelterId: String, confirm: boolean): Observable<boolean> {
        return this.http.put(this.sheltersBaseUrl + `/confirm/${shelterId}`, { confirm: confirm }).pipe(
            map(res => res instanceof Object ? null : <any>res),
            catchError(this.handleError.bind(this)));
    }

    preventiveUpdateShelter(shelter: IShelter, section: string): Observable<boolean> {
        return this.http.put(this.sheltersBaseUrl + `/confirm/${section}/${shelter._id}`, shelter).pipe(
            map(res => res instanceof Object ? null : <any>res),
            catchError(this.handleError.bind(this)));
    }

    updateShelter(shelter: IShelter, confirm?: boolean): Observable<boolean> {
        let query = "";
        if (confirm) {
            query = "?confirm=" + confirm;
        }
        return this.http.put(this.sheltersBaseUrl + `/${shelter._id}` + query, shelter).pipe(
            map(res => res instanceof Object ? null : <any>res),
            catchError(this.handleError.bind(this)));
    }

    deleteShelter(id: String): Observable<{} | boolean> {
        return this.http.delete(this.sheltersBaseUrl + `/${id}`).pipe(
            catchError(this.handleError.bind(this)));
    }

    handleError(error: any) {
        console.error('server error:', error);
        if (error && error.status === 500) {
            //  location.href="/pageNotFound"
        }

        if (error instanceof Response) {
            let errMessage = '';
            try {
                errMessage = (<any>error).error;
            } catch (err) {
                errMessage = error.statusText;
            }
            return observableThrowError(errMessage);
        }
        return observableThrowError(error || 'Node.js server error');
    }
}
