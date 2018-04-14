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

function getRegion(code: String): String {
    return code ? String(code).substr(2, 2) : code;
}

function getSection(code: String): String {
    return code ? String(code).substr(4, 3) : code;
}

function getArea(code: String): String {
    return code ? String(code).substr(2, 2) : code;
}

function getRegionsArea(area): Auth_Permissions.Region_Code[] {
    return Auth_Permissions.Regions_Area[Auth_Permissions.Region_Code[area]]
}

function getShelterFilter(type: Auth_Permissions.User_Type): (code: String) => String {
    if (type) {
        if (type == Auth_Permissions.User_Type.regional) {
            return getRegion;
        } else if (type == Auth_Permissions.User_Type.sectional) {
            return (code: String) => {
                return getRegion(code).concat(<string>getSection(code))
            }
        } else if (type == Auth_Permissions.User_Type.area) {
            return getArea;
        } else if (isCentralRole(type)) {
            return function (code) {
                return ''
            };
        } else {
            return function (code) {
                return null
            };
        }
    } else {
        return function (code) {
            return null
        };
    }
}

function isCentralRole(role: Auth_Permissions.User_Type): boolean {
    return (role == Auth_Permissions.User_Type.central || role == Auth_Permissions.User_Type.superUser);
}

function getShelterProfileCheck(role: Auth_Permissions.User_Type): (shelId, code) => Boolean {
    if (role) {
        if (role == Auth_Permissions.User_Type.area) {
            return (shelId, code) => {
                let val: Boolean = false;
                for (const regionCode of getRegionsArea(code)) {
                    val = (regionCode == shelId) || val;
                }
                return val;
            }
        } else if (isCentralRole(role)) {
            return (shelId, code) => true;
        } else {
            return (shelId, code) => shelId == code;
        }
    } else {
        return (shelId, code) => null;
    }
}

function checkEnumPermissionForShelter(profile, shelId, enum_value: Auth_Permissions.User_Type) {
    if (profile.role == enum_value) {
        const filterFunction = getShelterFilter(profile.role);
        const shelterProfileCheck = getShelterProfileCheck(profile.role);
        if (shelterProfileCheck(filterFunction(shelId), filterFunction(profile.code))) {
            return true;
        } else {
            return false;
        }
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
    private userProfile: {
        code: String,
        role: Auth_Permissions.User_Type
    };
    private userProfileSource = new Subject<{
        code: String,
        role: Auth_Permissions.User_Type
    }>();

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

    isCentralUser(): Observable<boolean> {
        return this.getUserProfile()
            .map(profile => profile && isCentralRole(profile.role));
    }

    getRegions(role, code): string[] {
        if (role) {
            if (isCentralRole(role)) {
                return Object.keys(Auth_Permissions.Region_Code);
            } else if (role == Auth_Permissions.User_Type.area) {
                return Object.keys(getRegionsArea(getArea(code)));
            } else {
                return [Auth_Permissions.Region_Code[<string>getRegion(code)]];
            }
        } else {
            return null;
        }
    }

    processUserProfileCode(profile): {
        section: String,
        region: String,
        area: String
    } {
        if (profile.role == Auth_Permissions.User_Type.superUser) {
            return {
                section: null,
                region: null,
                area: null
            };
        } else {
            let section;
            let region;
            let area;
            if (profile.role == Auth_Permissions.User_Type.regional) {
                region = getRegion(profile.code);
            } else if (profile.role == Auth_Permissions.User_Type.sectional) {
                section = getSection(profile.code);
                region = getRegion(profile.code);
            } else if (profile.role == Auth_Permissions.User_Type.area) {
                section = getSection(profile.code);
                area = getArea(profile.code);
            } else if (profile.role != Auth_Permissions.User_Type.central) {
                return null;
            }
            return {
                section: section,
                region: region,
                area: area
            };
        }
    }

    revisionCheck(permission?) {
        return permission == Auth_Permissions.User_Type.superUser
            || (Revision.DetailRevisionPermission.find(obj => obj == permission) != null);
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

    private checkEnumPermission(names: any[], shelId, profile) {
        let permission = false;
        if (profile.role == Auth_Permissions.User_Type.superUser) {
            permission = true;
        } else {
            names.forEach(name => {
                if (name == Auth_Permissions.User_Type.central) {
                    if (profile.role == Auth_Permissions.User_Type.central) {
                        permission = true;
                    }
                } else if (shelId) {
                    permission = permission || checkEnumPermissionForShelter(profile, shelId, name);
                }
            });
        }
        return permission;
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
                    if (this.checkEnumPermission(Revision.DetailRevisionPermission, shelId, profile)) {
                        permissions.push(Enums.MenuSection.detail);
                    }
                    if (this.checkEnumPermission(Revision.DocRevisionPermission, shelId, profile)) {
                        permissions.push(Enums.MenuSection.document);
                    }
                    if (this.checkEnumPermission(Revision.EconomyRevisionPermission, shelId, profile)) {
                        permissions.push(Enums.MenuSection.economy);
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
