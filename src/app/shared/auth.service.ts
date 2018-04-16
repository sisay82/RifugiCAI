import {
    Injectable
} from '@angular/core'
import {
    Subject
} from 'rxjs/Subject';
import {
    Http,
    Response,
    Headers,
    RequestOptions
} from '@angular/http';
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

import Auth_Permissions = Enums.Auth_Permissions;
import Revision = Auth_Permissions.Revision;
import {
    getAllDebugNodes
} from '@angular/core/src/debug/debug_node';


export function hasInsertPermission(profile: IUserProfile): boolean {
    return profile && (Auth_Permissions.Edit.InsertShelterPermission[profile.role]);
}

export function hasDeletePermission(profile: IUserProfile): boolean {
    return profile && (Auth_Permissions.Edit.DeleteShelterPermission[profile.role]);
}

/*function getRegion(code: String): String {
    return code ? String(code).substr(2, 2) : code;
}

function getSection(code: String): String {
    return code ? String(code).substr(4, 3) : code;
}

function getArea(code: String): String {
    return code ? String(code).substr(2, 2) : code;
}*/

function getCodeSection(code: String, codeSection: Auth_Permissions.Codes.CodeSection): String {
    return code.substr(codeSection[0], codeSection[1]);
}

function getAreaRegions(area: string): any {
    return Auth_Permissions.Regions_Area[Number(area)];
}

export function getShelterFilter(type?: Auth_Permissions.User_Type): (code: String) => String {
    if (type) {
        const codeSections: Auth_Permissions.Codes.CodeSection[] = Auth_Permissions.Codes.UserTypeCodes[type];

        return (code: String) => {
            return codeSections.reduce((value, codeSection) => value.concat(<string>getCodeSection(code, codeSection)), '');
        }
    } else {
        return function (code) {
            return null
        };
    }
}

function getShelterProfileCheck(filterFn, type: Auth_Permissions.User_Type): any {
    if (type === Auth_Permissions.User_Type.area) {
        return (shel: String, user: String) => {
            const areaRegions = getAreaRegions(<string>getCodeSection(user, Auth_Permissions.Codes.CodeSection.REGION))
            return areaRegions.reduce((previous, current) =>
                previous || (String(current) === filterFn(shel)), false);
        }
    } else {
        return (a: String, b: String) => filterFn(a) === filterFn(b);
    }
}

function isCentralRole(role: Auth_Permissions.User_Type): boolean {
    return (role === Auth_Permissions.User_Type.central || role === Auth_Permissions.User_Type.superUser);
}

export function checkEnumPermissionForShelter(profile: IUserProfile, shelId, enum_value?: Auth_Permissions.User_Type) {
    if (!enum_value || profile.role === enum_value) {
        const filterFunction = getShelterFilter(profile.role);
        const shelterProfileCheck = getShelterProfileCheck(filterFunction, profile.role);
        return shelterProfileCheck(shelId, profile.code);
    } else {
        return false;
    }
}

export interface IUserProfile {
    code: String;
    role: Auth_Permissions.User_Type;
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
    private userProfile: IUserProfile;
    private userProfileSource = new Subject<IUserProfile>();

    constructor(private http: Http, private route: ActivatedRoute, private router: Router) {
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

    hasInsertPermission(profile?: IUserProfile): Observable<boolean> {
        if (profile) {
            return Observable.of(hasInsertPermission(profile));
        } else {
            return this.getUserProfile().map(p => hasInsertPermission(p));
        }
    }

    hasDeletePermission(profile?: IUserProfile): Observable<boolean> {
        if (profile) {
            return Observable.of(hasDeletePermission(profile));
        } else {
            return this.getUserProfile().map(p => hasDeletePermission(p));
        }
    }

    getRegions(role: Auth_Permissions.User_Type, code: String): string[] {
        if (role) {
            if (isCentralRole(role)) {
                return Object.keys(Auth_Permissions.Region_Code);
            } else if (role === Auth_Permissions.User_Type.area) {
                const areaRegions = getAreaRegions(<string>getCodeSection(code, Auth_Permissions.Codes.CodeSection.REGION));
                if (areaRegions) {
                    return Object.keys(areaRegions);
                } else {
                    return null;
                }
            } else {
                return [
                    Auth_Permissions.Region_Code[
                    <string>getCodeSection(code, Auth_Permissions.Codes.CodeSection.REGION)]
                ];
            }
        } else {
            return null;
        }
    }

    processUserProfileCode(profile: IUserProfile): {} {
        const sections = {};

        if (Auth_Permissions.User_Type[profile.role]) {
            const codeSections: Auth_Permissions.Codes.CodeSection[] = Auth_Permissions.Codes.UserTypeCodes[profile.role];
            for (const codeSection of codeSections) {
                sections[codeSection] = getCodeSection(profile.code, codeSection);
            }
            return sections;
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
                    const user = res.json();
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

    private checkEnumPermission(enumName: string, shelId, profile: IUserProfile) {
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
