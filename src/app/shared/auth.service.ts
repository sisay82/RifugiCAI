import {Injectable } from '@angular/core'
import { Subject } from 'rxjs/Subject';
import { Http, Response,Headers,RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Enums } from './types/enums';
import { Subscription } from 'rxjs/Subscription';

@Injectable()
export class BcAuthService{
    private userBaseUrl = '/user';
    private newShelter:boolean=false;
    private localPermissions:any[];
    private userSectionCodeSub:Subscription;

    constructor(private http: Http) {
        this.userSectionCodeSub = this.updateUserSectionCode().subscribe(code=>{
            this.userSectionCodeSource.next(code);
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

    private userSectionCode;    
    private userSectionCodeSource = new Subject<String>();
    getUserSectionCode():Observable<String>{
        if(this.userSectionCode){
            return Observable.of(this.userSectionCode);
        }else{
            return this.userSectionCodeSource.asObservable();
        }
    }

    private updateUserSectionCode(){
        return this.http.get(this.userBaseUrl)
        .map((res: Response) => {
            this.userSectionCodeSource.next(res.text().toString());
            this.userSectionCode=res.text().toString();
            return this.userSectionCode;
        })
        .catch(this.handleError.bind(this));
    }

    private getChildByName(node:Node,name:String):Node{
        for(let i=0;i<node.childNodes.length;i++){
            if(node.childNodes.item(i).localName==name){
                return node.childNodes.item(i);
            }
            if(node.childNodes.item(i).hasChildNodes()){
                let n = this.getChildByName(node.childNodes.item(i),name);
                if(n){
                    return n;
                }
            }
        }
        return null;
    }

    setNewShelter(){
        this.newShelter=true;
    }

    private checkEnumPermission(names,shelId,sectionCode){
        let permission:boolean=false;
        names.forEach(name=>{
            if(name==Enums.User_Type.central){
                if(sectionCode.substr(0,2)==Enums.User_Type.central){
                    permission=true;
                }
            }else if(shelId){
                if(name==Enums.User_Type.regional){
                    if(shelId.substr(2,2)==sectionCode.substr(2,2)){
                        permission=true;
                    }
                }else if(name==Enums.User_Type.sectional){
                    if(shelId.substr(4,3)==sectionCode.substr(4,3)){
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
                let getSectionCodeSub = this.getUserSectionCode().subscribe(sectionCode=>{
                    let getShelIdSub = this.shelId$.subscribe(shelId=>{
                        if(this.checkEnumPermission(Enums.DetailRevisionPermission,shelId,sectionCode)){
                            permissions.push(Enums.MenuSection.detail);
                        }
                        if(this.checkEnumPermission(Enums.DocRevisionPermission,shelId,sectionCode)){
                            permissions.push(Enums.MenuSection.document);
                        }
                        if(this.checkEnumPermission(Enums.EconomyRevisionPermission,shelId,sectionCode)){
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
        let revisionPermission:Enums.User_Type;    
        return Observable.create(observer=>{
            let sectionCodeInit = this.getUserSectionCode().subscribe(code=>{
                if(code.substr(0,2)==Enums.User_Type.central.toString()){
                    observer.next(Enums.User_Type.central);
                }
                else if(code.substr(0,2)==Enums.User_Type.regional.toString()){
                    if(shelId&&code.substr(2,2)==shelId.substr(2,2)){
                        observer.next(Enums.User_Type.regional);                        
                    }else{
                        observer.next(null);
                    }
                }
                else if(code.substr(0,2)==Enums.User_Type.sectional.toString()){
                    if(shelId&&code.substr(4,3)==shelId.substr(4,3)){
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
            let sectionCodeInit = this.getUserSectionCode().subscribe(code=>{
                if(code.substr(0,2)==Enums.User_Type.central.toString()){
                    observer.next(Enums.User_Type.central);
                }
                else if(code.substr(2,2)==Enums.User_Type.regional.toString()){
                    observer.next(Enums.User_Type.regional);
                }
                else if(code.substr(4,3)==Enums.User_Type.sectional.toString()){
                    observer.next(Enums.User_Type.sectional);
                }
                else observer.next(null);
                observer.complete();
            });
        });
    }

    private handleError(error: any) {
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