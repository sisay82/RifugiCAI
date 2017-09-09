import {Injectable } from '@angular/core'
import { Subject } from 'rxjs/Subject';
import { Http, Response,Headers,RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Enums } from './types/enums';

@Injectable()
export class BcAuthService{
    private userBaseUrl = '/user';
    private userSectionCode;
    public revisionPermissions=new Subject<any[]>();
    private newShelter:boolean=false;

    constructor(private http: Http) {
        let initSub = this.getUserSectionCode().subscribe(val=>{
            initSub.unsubscribe();
        });
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

    getUserSectionCode():Observable<String>{
        if(this.userSectionCode){
            return Observable.of(this.userSectionCode);
        }else{
            return this.http.get(this.userBaseUrl)
            .map((res: Response) => {
                this.userSectionCode=res.text().toString();
                return this.userSectionCode;
            })
            .catch(this.handleError.bind(this));
        }
    }

    private checkEnumPermission(names,id,sectionCode){
        let permission:boolean=false;
        names.forEach(name=>{
            if(name==Enums.User_Type.central){
                /*if(id.substr(0,2)==sectionCode.substr(0,2)){
                    permission=true;
                }*/
                if(sectionCode.substr(0,2)=='92'){
                    permission=true;
                }
            }else if(name==Enums.User_Type.regional){
                if(id&&id.substr(2,2)==sectionCode.substr(2,2)){
                    permission=true;
                }
            }else if(id&&name==Enums.User_Type.sectional){
                if(id.substr(4,3)==sectionCode.substr(4,3)){
                    permission=true;
                }
            }
        });
        return permission;
    }

    revisionPermissionEmit(value:any[]){
        this.revisionPermissions.next(value);
    }

    getPermissions(id,sectionCode):any[]{
        let permissions:any[]=[];
        this.revisionPermissionEmit([]);

        if(this.checkEnumPermission(Enums.DetailRevisionPermission,id,sectionCode)){
            permissions.push(Enums.MenuSection.detail);
        }
        if(this.checkEnumPermission(Enums.DocRevisionPermission,id,sectionCode)){
            permissions.push(Enums.MenuSection.document);
        }
        if(this.checkEnumPermission(Enums.EconomyRevisionPermission,id,sectionCode)){
            permissions.push(Enums.MenuSection.economy);
        }

        this.revisionPermissionEmit(permissions);
        return permissions;

    }

    checkRevisionPermission(id):Observable<boolean>{
        let revisionPermission:boolean=false;    
        return Observable.create(observer=>{

            let sectionCodeInit = this.getUserSectionCode().subscribe(code=>{
                if(this.getPermissions(id,code).length>0){
                    revisionPermission=true;
                }
                observer.next(revisionPermission);
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