import {Injectable } from '@angular/core'
import { Subject } from 'rxjs/Subject';
import { Http, Response,Headers,RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import "rxjs/add/observable/of";
import { Enums } from './types/enums';
import { Subscription } from 'rxjs/Subscription';
import { ActivatedRoute, Router } from '@angular/router';

@Injectable()
export class BcAuthService{
    private _disableAuth:boolean=false;
    private userBaseUrl = '/user';
    private newShelter:boolean=false;
    private localPermissions:any[];
    private userSectionCodeSub:Subscription;

    constructor(private http: Http,private route:ActivatedRoute,private router:Router) {
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

    private getRegion(code:String){
        return code.substr(2,2);
    }

    private getSection(code:String){
        return code.substr(4,3);
    }

    isCentralUser():Observable<boolean>{
        return Observable.create(observer=>{
            this.getUserProfile().subscribe(profile=>{
                observer.next(profile&&(profile.role==Enums.User_Type.central||profile.role==Enums.User_Type.superUser));
                observer.complete();
            });
        });
    }

    processUserProfileCode(profile):{section:String,region:String}{
        if(profile.role==Enums.User_Type.superUser){
            return {section:null,region:null};
        }else{
            let section;
            let region;
            if(profile.role==Enums.User_Type.regional){
                region=this.getRegion(profile.code);
            }else if(profile.role==Enums.User_Type.sectional){
                section=this.getSection(profile.code);
                region=this.getRegion(profile.code);
            }else if(profile.role!=Enums.User_Type.central){
                return null;
            }
            return {section:section,region:region};
        }
 
    }

    revisionCheck(permission?){
        return permission==Enums.User_Type.superUser||(Enums.DetailRevisionPermission.find(obj=>obj==permission)!=null);
    }

    private updateProfile():Observable<any>{
        if(this._disableAuth){
            return Observable.create(observer=>{
                let user={role:Enums.User_Type.superUser,code:"9999999"};
                this.userProfile=user;
                return user;
            })
        }else{
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
    }

    setNewShelter(){
        this.newShelter=true;
    }

    private checkEnumPermission(names,shelId,profile){
        let permission:boolean=false;
        if(profile.role==Enums.User_Type.superUser){
            permission=true;
        }else{
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
                        if(shelId.substr(2,5)==profile.code.substr(2,5)){
                            permission=true;
                        }
                    }
                }
            });
        }   
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
                    if(shelId&&profile.code.substr(2,5)==shelId.substr(2,5)){
                        observer.next(Enums.User_Type.sectional);                        
                    }else{
                        observer.next(null);
                    }
                }else if(profile.role==Enums.User_Type.superUser){
                    observer.next(Enums.User_Type.superUser);
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
                if(profile.role){
                    observer.next(profile.role);
                }else{
                    observer.next(null);
                }
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
            this.router.navigate([{outlets:({'access-denied': '','primary': null})}]);
        }
        this.routeError=true;
        this.errorRouteSource.next(true);
        return Observable.throw({error:"Access denied"})
    }

}