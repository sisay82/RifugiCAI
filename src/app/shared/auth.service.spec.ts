import {
    TestBed,
    async
} from '@angular/core/testing';
import {
    BcAuthService,
    checkEnumPermissionForShelter
} from './auth.service';
import {
    Component
} from '@angular/core';
import { RouterTestingModule } from '@angular/router/testing';
import { Observable } from 'rxjs/Observable';
import { Enums } from './types/enums';
import { Tools } from './tools/common.tools';

class HttpMockService {
    get(any: any) {
        return Observable.of({ json: () => ({ role: 0, code: '9999999' }) });
    }
}

class RouteMockService {
    children = [];
}

class RouterMockService {
    navigate = (any) => null;
}

describe('BcAuthService', () => {
    const shelCode = '9216001002';
    // const service = new BcAuthService(<any>(new HttpMockService()), <any>new RouteMockService(), <any>new RouterMockService());

    it("Should get filters based on usertype", function () {
        let filter = Tools.getShelterFilter(Enums.Auth_Permissions.User_Type.central);
        expect(filter(shelCode)).toBe('');
        filter = Tools.getShelterFilter(Enums.Auth_Permissions.User_Type.visualization);
        expect(filter(shelCode)).toBe('');
        filter = Tools.getShelterFilter(Enums.Auth_Permissions.User_Type.superUser);
        expect(filter(shelCode)).toBe('');
        filter = Tools.getShelterFilter(Enums.Auth_Permissions.User_Type.area);
        expect(filter(shelCode)).toBe('16'); ////
        filter = Tools.getShelterFilter(Enums.Auth_Permissions.User_Type.sectional);
        expect(filter(shelCode)).toBe('16001');
        filter = Tools.getShelterFilter(Enums.Auth_Permissions.User_Type.regional);
        expect(filter(shelCode)).toBe('16'); ////
        filter = Tools.getShelterFilter(null);
        expect(filter(shelCode)).toBe(null);
        filter = Tools.getShelterFilter(Enums.Auth_Permissions.User_Type.test);
        expect(filter(shelCode)).toBe('92002');
    });

    it("Should checkEnumPermissionForShelter", function () {
        const userProfile = { role: Enums.Auth_Permissions.User_Type.central, code: shelCode }
        expect(checkEnumPermissionForShelter(userProfile, '77777777'))
            .toBe(true);
        userProfile.role = Enums.Auth_Permissions.User_Type.visualization;
        expect(checkEnumPermissionForShelter(userProfile, '77777777'))
            .toBe(true);
        userProfile.role = Enums.Auth_Permissions.User_Type.superUser;
        expect(checkEnumPermissionForShelter(userProfile, '77777777'))
            .toBe(true);
        userProfile.role = Enums.Auth_Permissions.User_Type.sectional;
        expect(checkEnumPermissionForShelter(userProfile, '9216002002'))
            .toBe(false);
        expect(checkEnumPermissionForShelter(userProfile, '9215001002'))
            .toBe(false);
        expect(checkEnumPermissionForShelter(userProfile, shelCode))
            .toBe(true);
        userProfile.role = Enums.Auth_Permissions.User_Type.regional;
        userProfile.code = "9500020";
        expect(checkEnumPermissionForShelter(userProfile, '9200002002'))
            .toBe(false);
        expect(checkEnumPermissionForShelter(userProfile, '9220011002'))
            .toBe(true);
        userProfile.role = Enums.Auth_Permissions.User_Type.area;
        userProfile.code = "9300050";
        expect(checkEnumPermissionForShelter(userProfile, '9234011002'))
            .toBe(true);
        expect(checkEnumPermissionForShelter(userProfile, '9200001002'))
            .toBe(false);
    });

});
