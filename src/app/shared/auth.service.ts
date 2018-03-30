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
} from 'rxjs/Observable';
import "rxjs/add/observable/of";
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
import 'rxjs/add/operator/map'

function getRegion(code: String): String {
    return code.substr(2, 2);
}

function getSection(code: String): String {
    return code.substr(4, 3);
}

function getArea(code: String): String {
    return code.substr(2, 2);
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
        return Observable.create(observer => {
            this.getUserProfile().subscribe(profile => {
                observer.next(profile && isCentralRole(profile.role));
                observer.complete();
            });
        });
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
            const permissions: any[] = [];
            return Observable.create(observer => {
                const getSectionCodeSub = this.getUserProfile().subscribe(profile => {
                    const getShelIdSub = this.shelId$.subscribe(shelId => {
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
                        observer.next(permissions);
                        observer.complete();
                        if (getShelIdSub != undefined) {
                            getShelIdSub.unsubscribe();
                        }
                        if (getSectionCodeSub != undefined) {
                            getSectionCodeSub.unsubscribe();
                        }
                    });
                    this.onShelIdRequest()
                });
            });
        }
    }

    checkRevisionPermissionForShelter(shelId: String): Observable<Auth_Permissions.User_Type> {
        this.onShelId(shelId);
        return Observable.create(observer => {
            const sectionCodeInit = this.getUserProfile().subscribe(profile => {
                if (checkEnumPermissionForShelter(profile, shelId, profile.role)) {
                    observer.next(profile.role);
                } else {
                    observer.next(null);
                }
                if (sectionCodeInit != undefined) {
                    sectionCodeInit.unsubscribe();
                }
                observer.complete();
            });
        });
    }

    checkUserPermission(): Observable<Auth_Permissions.User_Type> {
        return Observable.create(observer => {
            const sectionCodeInit = this.getUserProfile().subscribe(profile => {
                if (profile.role) {
                    observer.next(profile.role);
                } else {
                    observer.next(null);
                }
                observer.complete();
            });
        });
    }

    getRouteError(): Observable<boolean> {
        if (!this.routeError) {
            return this.errorRoute$;
        } else {
            return Observable.of(this.routeError);
        }
    }

    private handleError(error: any) {
        if (!this.route.children.find(child => child.outlet == "access-denied")) {
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
