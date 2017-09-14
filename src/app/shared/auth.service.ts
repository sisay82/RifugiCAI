import {Injectable } from '@angular/core'
import { Subject } from 'rxjs/Subject';
import { Http, Response,Headers,RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Enums } from './types/enums';
import { Subscription } from 'rxjs/Subscription';
import { ActivatedRoute } from '@angular/router';

@Injectable()
export class BcAuthService{
    private userBaseUrl = '/user';
    private newShelter:boolean=false;
    private localPermissions:any[];
    private userSectionCodeSub:Subscription;

    constructor(private http: Http,private route:ActivatedRoute) {
        this.userSectionCodeSub = this.updateProfile().subscribe(profile=>{
            this.userProfileSource.next(profile);
            if(this.userSectionCodeSub){
                this.userSectionCodeSub.unsubscribe();
            }
        });
    }

    private shelIdSource = new Subject<String>();
    shelId$ = this.shelIdSource.asObservable();
    onShelId(shelId){
        this.shelIdSource.next(shelId);
    }

    private shelIdRequestSource = new Subject<void>();
    shelIdRequest$ = this.shelIdRequestSource.asObservable();
    onShelIdRequest(){
        this.shelIdRequestSource.next();
    }

    private userProfile:{code:String,role:Enums.User_Type};
    private userProfileSource = new Subject<{code:String,role:Enums.User_Type}>();
    getUserProfile():Observable<{code:String,role:Enums.User_Type}>{
        if(this.userProfile){
            return Observable.of(this.userProfile);
        }else{
            return this.userProfileSource.asObservable();
        }
    }

    private updateProfile():Observable<any>{
        return this.http.get(this.userBaseUrl)
        .map((res: Response) => {
            this.routeError=false;
            this.errorRouteSource.next(false);
            let user=res.json();
            user.role=(user.role?(user.role):Enums.User_Type.sectional);
            this.userProfile=user
            return user;
        })
        .catch(this.handleError.bind(this));
    }

    setNewShelter(){
        this.newShelter=true;
    }

    private checkEnumPermission(names,shelId,profile){
        let permission:boolean=false;
        names.forEach(name=>{
            if(name==Enums.User_Type.central){
                if(profile.role==Enums.User_Type.central){
                    permission=true;
                }
            }else if(shelId){
                if(name==Enums.User_Type.regional&&profile.role==Enums.User_Type.regional){
                    if(shelId.substr(2,2)==profile.code.substr(2,2)){
                        permission=true;
                    }
                }else if(name==Enums.User_Type.sectional&&profile.role==Enums.User_Type.sectional){
                    if(shelId.substr(4,3)==profile.code.substr(4,3)){
                        permission=true;
                    }
                }
            }
        });
        return permission;
    }

    getPermissions():Observable<any[]>{
        if(this.localPermissions){
            return Observable.of(this.localPermissions);
        }else{
            let permissions:any[]=[];
            return Observable.create(observer=>{
                let getSectionCodeSub = this.getUserProfile().subscribe(profile=>{
                    let getShelIdSub = this.shelId$.subscribe(shelId=>{
                        if(this.checkEnumPermission(Enums.DetailRevisionPermission,shelId,profile)){
                            permissions.push(Enums.MenuSection.detail);
                        }
                        if(this.checkEnumPermission(Enums.DocRevisionPermission,shelId,profile)){
                            permissions.push(Enums.MenuSection.document);
                        }
                        if(this.checkEnumPermission(Enums.EconomyRevisionPermission,shelId,profile)){
                            permissions.push(Enums.MenuSection.economy);
                        }
                        this.localPermissions=permissions
                        observer.next(permissions);
                        observer.complete();
                        if(getShelIdSub!=undefined){
                            getShelIdSub.unsubscribe();
                        }
                        if(getSectionCodeSub!=undefined){
                            getSectionCodeSub.unsubscribe();
                        }
                    });
                    this.onShelIdRequest()
                });
            });
        }
    }

    checkRevisionPermissionForShelter(shelId:String):Observable<Enums.User_Type>{
        this.onShelId(shelId);
        return Observable.create(observer=>{
            let sectionCodeInit = this.getUserProfile().subscribe(profile=>{
                if(profile.role==Enums.User_Type.central){
                    observer.next(Enums.User_Type.central);
                }
                else if(profile.role==Enums.User_Type.regional){
                    if(shelId&&profile.code.substr(2,2)==shelId.substr(2,2)){
                        observer.next(Enums.User_Type.regional);                        
                    }else{
                        observer.next(null);
                    }
                }
                else if(profile.role==Enums.User_Type.sectional){
                    if(shelId&&profile.code.substr(4,3)==shelId.substr(4,3)){
                        observer.next(Enums.User_Type.sectional);                        
                    }else{
                        observer.next(null);
                    }
                }
                else observer.next(null);
                if(sectionCodeInit!=undefined){
                    sectionCodeInit.unsubscribe();
                }
                observer.complete();
            });
        });
    }

    checkUserPermission():Observable<Enums.User_Type>{
        let revisionPermission:Enums.User_Type;    
        return Observable.create(observer=>{
            let sectionCodeInit = this.getUserProfile().subscribe(profile=>{
                if(profile.role==Enums.User_Type.central){
                    observer.next(Enums.User_Type.central);
                }
                else if(profile.role==Enums.User_Type.regional){
                    observer.next(Enums.User_Type.regional);
                }
                else if(profile.role==Enums.User_Type.sectional){
                    observer.next(Enums.User_Type.sectional);
                }
                else observer.next(null);
                observer.complete();
            });
        });
    }

    getRouteError():Observable<boolean>{
        if(!this.routeError){
            return this.errorRoute$;
        }else{
            return Observable.of(this.routeError);
        }
    }

    private errorRouteSource = new Subject<boolean>();
    private routeError;
    private errorRoute$ = this.errorRouteSource.asObservable();
    private handleError(error: any) {
        if(!this.route.children.find(child=>child.outlet=="access-denied")){
            location.href="/(access-denied:)";
        }
        this.routeError=true;
        this.errorRouteSource.next(true);
        return Observable.throw({error:"Access denied"})
    }

}