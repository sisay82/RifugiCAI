import {
    Injectable
} from '@angular/core'
import {
    Subject
} from 'rxjs/Subject';
import {
    HttpClient,
    /*Http,
    Response,
    Headers,
    RequestOptions*/
} from '@angular/common/http';
import {
    Observable
} from 'rxjs/Rx';
import "rxjs/add/observable/of";
import 'rxjs/add/observable/forkJoin';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/catch';
import {
    Enums
} from './types/enums';
import {
    Subscription
} from 'rxjs/Subscription';
import {
    ActivatedRoute,
    Router
} from '@angular/router';
import { Tools } from '../shared/tools/common.tools';
import Auth_Permissions = Enums.Auth_Permissions;
import Revision = Auth_Permissions.Revision;
import {
    getAllDebugNodes
} from '@angular/core/src/debug/debug_node';


export function hasInsertPermission(profile: Tools.IUserProfile): boolean {
    return profile && (Auth_Permissions.Edit.InsertShelterPermission[profile.role]);
}

export function hasDeletePermission(profile: Tools.IUserProfile): boolean {
    return profile && (Auth_Permissions.Edit.DeleteShelterPermission[profile.role]);
}

function isCentralRole(role: Auth_Permissions.User_Type): boolean {
    return (role === Auth_Permissions.User_Type.central || role === Auth_Permissions.User_Type.superUser);
}

export function checkEnumPermissionForShelter(profile: Tools.IUserProfile, shelId, enum_value?: Auth_Permissions.User_Type) {
    if (!enum_value || profile.role === enum_value) {
        const filterFunction = Tools.getShelterFilter(profile.role);
        const shelterProfileCheck = Tools.getShelterProfileCheck(filterFunction, profile.role);
        return shelterProfileCheck(shelId, profile.code);
    } else {
        return false;
    }
}

@Injectable()
export class BcAuthService {
    private _disableAuth = false;
    private userBaseUrl = '/user';
    private newShelter = false;
    private localPermissions: any[];
    private userSectionCodeSub: Subscription;
    private errorRouteSource = new Subject<boolean>();
    private routeError;
    private errorRoute$ = this.errorRouteSource.asObservable();
    private shelIdRequestSource = new Subject<void>();
    shelIdRequest$ = this.shelIdRequestSource.asObservable();
    private shelIdSource = new Subject<String>();
    shelId$ = this.shelIdSource.asObservable();
    private userProfile: Tools.IUserProfile;
    private userProfileSource = new Subject<Tools.IUserProfile>();

    constructor(private http: HttpClient, private route: ActivatedRoute, private router: Router) {
        this.userSectionCodeSub = this.updateProfile().subscribe(profile => {
            this.userProfileSource.next(profile);
            if (this.userSectionCodeSub) {
                this.userSectionCodeSub.unsubscribe();
            }
        });
    }

    onShelId(shelId) {
        this.shelIdSource.next(shelId);
    }

    onShelIdRequest() {
        this.shelIdRequestSource.next();
    }

    getUserProfile(): Observable<{
        code: String,
        role: Auth_Permissions.User_Type
    }> {
        if (this.userProfile) {
            return Observable.of(this.userProfile);
        } else {
            return this.userProfileSource.asObservable();
        }
    }

    hasInsertPermission(profile?: Tools.IUserProfile): Observable<boolean> {
        if (profile) {
            return Observable.of(hasInsertPermission(profile));
        } else {
            return this.getUserProfile().map(p => hasInsertPermission(p));
        }
    }

    hasDeletePermission(profile?: Tools.IUserProfile): Observable<boolean> {
        if (profile) {
            return Observable.of(hasDeletePermission(profile));
        } else {
            return this.getUserProfile().map(p => hasDeletePermission(p));
        }
    }

    getRegions(role: Auth_Permissions.User_Type, code: String): string[] {
        return Tools.filterRegions(role, code);
    }

    processUserProfileCode(profile: Tools.IUserProfile): Tools.ICodeInfo {
        const sections = {};

        if (Auth_Permissions.User_Type[profile.role]) {
            return Tools.getCodeSections(profile.role, profile.code);
        } else {
            return null;
        }
    }

    revisionCheck(permission?: Enums.Auth_Permissions.User_Type) {
        return permission === Auth_Permissions.User_Type.superUser
            || (Revision.DetailRevisionPermission.find(obj => obj === permission) != null);
    }

    private updateProfile(): Observable<any> {
        if (this._disableAuth) {
            return Observable.create(observer => {
                const user = {
                    role: Auth_Permissions.User_Type.superUser,
                    code: "9999999"
                };
                this.userProfile = user;
                observer.next(user);
                observer.complete();
                return user;
            });
        } else {
            return this.http.get(this.userBaseUrl)
                .map((res: Response) => {
                    this.routeError = false;
                    this.errorRouteSource.next(false);
                    const user = <any>res;
                    user.role = (user.role ? (user.role) : Auth_Permissions.User_Type.sectional);
                    this.userProfile = user
                    return user;
                })
                .catch(this.handleError.bind(this));
        }
    }

    setNewShelter() {
        this.newShelter = true;
    }

    private checkEnumPermission(enumName: string, shelId, profile: Tools.IUserProfile) {
        return Revision[enumName].includes(profile.role)
            && checkEnumPermissionForShelter(profile, shelId);
    }

    getPermissions(): Observable<any[]> {
        if (this.localPermissions) {
            return Observable.of(this.localPermissions);
        } else {
            this.onShelIdRequest();
            return Observable.forkJoin(
                this.getUserProfile().first(),
                this.shelId$.first()
            )
                .map((value) => {
                    const shelId = value['1'];
                    const profile = value['0'];
                    const permissions: any[] = [];
                    for (const name in Revision) {
                        if (Array.isArray(Revision[name])) {
                            if (this.checkEnumPermission(name, shelId, profile)) {
                                permissions.push(Revision.RevisionPermissionType[name]);
                            }
                        }

                    }
                    this.localPermissions = permissions
                    return permissions;
                });
        }
    }

    checkRevisionPermissionForShelter(shelId: String): Observable<Auth_Permissions.User_Type> {
        this.onShelId(shelId);
        return this.getUserProfile().map(profile => {
            if (checkEnumPermissionForShelter(profile, shelId, profile.role)) {
                return profile.role;
            } else {
                return null;
            }
        });
    }

    checkUserPermission(): Observable<Auth_Permissions.User_Type> {
        return this.getUserProfile().map(profile => profile.role || null);
    }

    getRouteError(): Observable<boolean> {
        if (!this.routeError) {
            return this.errorRoute$;
        } else {
            return Observable.of(this.routeError);
        }
    }

    private handleError(error: any) {
        if (!this.route.children.find(child => child.outlet === "access-denied")) {
            this.router.navigate([{
                outlets: ({
                    'access-denied': '',
                    'primary': null
                })
            }]);
        }
        this.routeError = true;
        this.errorRouteSource.next(true);
        return Observable.throw({
            error: "Access denied"
        })
    }
}
