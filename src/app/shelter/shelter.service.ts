// import { Injectable } from '@angular/core';
// import { Http, Response } from '@angular/http';

// //Grab everything with import 'rxjs/Rx';
// import { Observable } from 'rxjs/Observable';
// import 'rxjs/add/observable/throw';
// import { Observer } from 'rxjs/Observer';
// import 'rxjs/add/operator/map'; 
// import 'rxjs/add/operator/catch';

// // import { IShelter } from '../../shared/interfaces';

// @Injectable()
// export class ShelterService {
  
//     sheletersBaseUrl: string = '/api/sheleters';

//     constructor(private http: Http) { }
    
//     getShelters() : Observable<IShelter[]> {
//         return this.http.get(this.sheletersBaseUrl)
//                     .map((res: Response) => {
//                         let shelters = res.json();
//                         return shelters;
//                     })
//                     .catch(this.handleError);
//     }

//     // getSheltersPage(page: number, pageSize: number) : Observable<IPagedResults<IShelter[]>> {
//     //     return this.http.get(`${this.sheletersBaseUrl}/page/${page}/${pageSize}`)
//     //                .map((res: Response) => {
//     //                    const totalRecords = + res.headers.get('X-InlineCount');
//     //                    let shelters = res.json();
//     //                    return {
//     //                        results: shelters,
//     //                        totalRecords: totalRecords
//     //                    };
//     //                })
//     //                .catch(this.handleError);
//     // }
    
//     getshelter(id: number) : Observable<IShelter> {
//         return this.http.get(this.sheletersBaseUrl + '/' + id)
//                    .map((res: Response) => {
//                        let shelter = res.json();
//                        return shelter;
//                    })
//                    .catch(this.handleError);
//     }

//     insertshelter(shelter: IShelter) : Observable<IShelter> {
//         return this.http.post(this.sheletersBaseUrl, shelter)
//                    .map((res: Response) => res.json())
//                    .catch(this.handleError);
//     }
    
//     updateshelter(shelter: IShelter) : Observable<boolean> {
//         return this.http.put(this.sheletersBaseUrl + '/' + shelter.id, shelter)
//                    .map((res: Response) => res.json())
//                    .catch(this.handleError);  
//     }

//     deleteshelter(id: number) : Observable<boolean> {
//         return this.http.delete(this.sheletersBaseUrl + '/' + id)
//                    .map((res: Response) => res.json().status)
//                    .catch(this.handleError);
//     }
    
//     handleError(error: any) {
//         console.error('server error:', error); 
//         if (error instanceof Response) {
//           let errMessage = '';
//           try {
//             errMessage = error.json().error;
//           } catch(err) {
//             errMessage = error.statusText;
//           }
//           return Observable.throw(errMessage);
//         }
//         return Observable.throw(error || 'Node.js server error');
//     }

//     //Not using now but leaving since they show how to create
//     //and work with custom observables
       
//     createObservable(data: any) : Observable<any> {
//         return Observable.create((observer: Observer<any>) => {
//             observer.next(data);
//             observer.complete();
//         });
//     }

// }
