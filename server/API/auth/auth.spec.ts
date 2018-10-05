import 'jasmine';
import { getChildByName, checkInclude, getRole, getCode, getUserPermissions, checkUserAuthorizations } from './auth.logic';
import { DOMParser } from 'xmldom';
import { Enums } from '../../../src/app/shared/types/enums';
import { CasAuth, ICasOption } from './auth.cas';
import { CAS_BASE_URL, getLoginURL } from '../../tools/constants';

describe('AuthCAS', () => {
    const CasOptions: ICasOption = {
        url: CAS_BASE_URL + "/cai-cas",
        serviceUrl: getLoginURL()
    }
    const AuthCAS = new CasAuth(CasOptions);

    describe('BOUNCE', () => {
        it('Should intercept ticket and redirect to resource', () => {
            const req: any = {
                query: {
                    ticket: "ticket"
                },
                session: {
                    resource: "target"
                }
            }
            const res: any = {
                redirect: (path) => {
                    expect(path).toEqual(req.session.resource);
                }
            }
            const next = () => {
            }
            AuthCAS.bounce(req, res, next);
        });

        it('Should redirect to login if no ticket is found in query', () => {
            const req: any = {
                session: {
                    resource: "target"
                },
                path: "resource"
            }
            const res: any = {
                redirect: (path) => {
                    expect(path).toEqual(CasOptions.serviceUrl);
                }
            }
            const next = () => {
            }
            AuthCAS.bounce(req, res, next);
            expect(req.session.checked).toEqual(false);
            expect(req.session.resource).toEqual("resource");
        });
    });

    describe('BounceRedirect', () => {
        it('Should redirect to login if no ticket is found in session', () => {
            const req: any = {
                session: {
                    resource: "target"
                },
                path: "resource"
            }
            const res: any = {
                redirect: (path) => {
                    expect(path).toEqual(CasOptions.serviceUrl);
                }
            }
            const next = () => {
            }
            AuthCAS.bounceRedirect(req, res, next);
            expect(req.session.checked).toEqual(false);
            expect(req.session.resource).toEqual("resource");
        });

    });
});


describe('AuthLogic', () => {
    describe('XML Parse', () => {
        const xmldoc = `<parent><childA>robaroba</childA></parent>`;

        it('Should parse XML doc', () => {
            const parser = new DOMParser({
                locator: {},
                errorHandler: {
                    warning: function (w) {
                        expect(w).toBeUndefined();
                    }
                }
            });
            const parsed: Document = parser.parseFromString(xmldoc);
            expect(parsed).not.toBeFalsy();
        });

        it('Should get child from xml doc by name', () => {
            const parser = new DOMParser({
                locator: {},
                errorHandler: {
                    warning: function (w) {
                        expect(w).toBeUndefined();
                    }
                }
            });
            const parsed: Document = parser.parseFromString(xmldoc);
            expect(getChildByName(parsed, "childA").textContent).toBe("robaroba");
        });

        it('Should not raise error if has not children', () => {
            const parser = new DOMParser({
                locator: {},
                errorHandler: {
                    warning: function (w) {
                        expect(w).toBeUndefined();
                    }
                }
            });
            const parsed: Document = parser.parseFromString('<parent></parent>');
            expect(getChildByName(parsed, "childB")).toBeNull();
        });

        it('Should raise error if xml doc is broken', (close) => {
            const parser = new DOMParser({
                locator: {},
                errorHandler: {
                    warning: function (w) {
                        expect(w).not.toBeUndefined();
                        close()
                    }
                }
            });
            const parsed: Document = parser.parseFromString('<parent>');
        });

        it('Should not raise error if child is not found', () => {
            const parser = new DOMParser({
                locator: {},
                errorHandler: {
                    warning: function (w) {
                        expect(w).toBeUndefined();
                    }
                }
            });
            const parsed: Document = parser.parseFromString(xmldoc);
            expect(getChildByName(parsed, "childB")).toBeNull();
            expect(getChildByName(parsed, null)).toBeNull();
        });

        it('Should not raise error if document is not found', () => {
            expect(getChildByName(null, "childB")).toBeNull();
        });
    });

    describe('UserPermissions', () => {
        it('Should check if array contains property with any value', () => {
            const values = ["value", "val"];

            expect(checkInclude(
                [
                    { prop: "val", a: "A" },
                    { b: "B" },
                    { c: "A" }
                ],
                values,
                'prop'
            )).toBe(true);

            expect(checkInclude(
                [
                    { a: "A" },
                    { b: "B" },
                    { c: "A" }
                ],
                values,
                'prop'
            )).toBe(false);

            expect(checkInclude(
                null,
                values,
                'prop'
            )).toBe(false);

            expect(checkInclude(
                [
                    { a: "A" },
                    { b: "B" },
                    { c: "A" }
                ],
                null,
                'prop'
            )).toBe(false);

            expect(checkInclude(
                [
                    { a: "A" },
                    { b: "B" },
                    { c: "A" }
                ],
                values,
                null
            )).toBe(false);
        });

        it('Should get appropriate role from json description user data -> central', () => {
            const data = {
                aggregatedAuthorities: [
                    { a: "A" },
                    { b: "A" },
                    {
                        role: Enums.Auth_Permissions.USER_TYPE_TO_ROLE[
                            Enums.Auth_Permissions.User_Type.central
                        ]
                    },
                ]
            }
            expect(getRole(data)).toEqual(Enums.Auth_Permissions.User_Type.central)
        });

        it('Should get appropriate role from json description user data -> regional', () => {
            const data = {
                userGroups: [
                    { a: "A" },
                    { b: "A" },
                    {
                        name: Enums.Auth_Permissions.USER_TYPE_TO_ROLE[
                            Enums.Auth_Permissions.User_Type.regional
                        ]
                    },
                ]
            }
            expect(getRole(data)).toEqual(Enums.Auth_Permissions.User_Type.regional)
        });

        it('Should get appropriate role from json description user data -> visualization', () => {
            const data = {
                aggregatedAuthorities: [
                    { a: "A" },
                    { b: "A" },
                    {
                        role: Enums.Auth_Permissions.USER_TYPE_TO_ROLE[
                            Enums.Auth_Permissions.User_Type.visualization
                        ]
                    },
                ]
            }
            expect(getRole(data)).toEqual(Enums.Auth_Permissions.User_Type.visualization)
        });

        it('Should get appropriate role from json description user data -> area', () => {
            const data = {
                aggregatedAuthorities: [
                    { a: "A" },
                    { b: "A" },
                    {
                        role: Enums.Auth_Permissions.USER_TYPE_TO_ROLE[
                            Enums.Auth_Permissions.User_Type.area
                        ]
                    },
                ]
            }
            expect(getRole(data)).toEqual(Enums.Auth_Permissions.User_Type.area)
        });

        it('Should get appropriate role from json description user data -> sectional', () => {
            expect(getRole({
                aggregatedAuthorities: [
                    { a: "A" },
                    { b: "A" },
                    {
                        role: 'ROLE_MEMBERS_VIEW'
                    },
                ]
            })).toEqual(Enums.Auth_Permissions.User_Type.sectional);

            expect(getRole({
                aggregatedAuthorities: [
                    { a: "A" },
                    { b: "A" },
                    {
                        role: 'ROLE_MEMBERSHIP'
                    },
                ]
            })).toEqual(Enums.Auth_Permissions.User_Type.sectional);
        });

        it('Should get code from json description user data', () => {
            expect(getCode(Enums.Auth_Permissions.User_Type.sectional, {
                sectionCode: "9216001"
            })).toBe('9216001');
            expect(getCode(Enums.Auth_Permissions.User_Type.central, {
                regionaleGroupCode: "9216001"
            })).toBe('9216001');
            expect(getCode(null, {
                regionaleGroupCode: "9216001"
            })).toBe(null);
            expect(getCode(Enums.Auth_Permissions.User_Type.central, null)).toBe(null);
            expect(getCode(Enums.Auth_Permissions.User_Type.central, {
                sectionCode: "9216001"
            })).toBe(null);
        });

        it('Should get user permissions from json description -> sectional', () => {
            expect(getUserPermissions({
                aggregatedAuthorities: [
                    { a: "A" },
                    { b: "A" },
                    {
                        role: 'ROLE_MEMBERSHIP'
                    },
                ],
                sectionCode: "9216001"
            })).toEqual({
                role: Enums.Auth_Permissions.User_Type.sectional,
                code: '9216001'
            });
        });

        it('Should get user permissions from json description -> regional', () => {
            expect(getUserPermissions({
                userGroups: [
                    { a: "A" },
                    { b: "A" },
                    {
                        name: Enums.Auth_Permissions.USER_TYPE_TO_ROLE[
                            Enums.Auth_Permissions.User_Type.regional
                        ]
                    },
                ],
                regionaleGroupCode: "9216001"
            })).toEqual({
                role: Enums.Auth_Permissions.User_Type.regional,
                code: '9216001'
            });
        });

        it('Should get user permissions from json description -> area', () => {
            expect(getUserPermissions({
                aggregatedAuthorities: [
                    { a: "A" },
                    { b: "A" },
                    {
                        role: Enums.Auth_Permissions.USER_TYPE_TO_ROLE[
                            Enums.Auth_Permissions.User_Type.area
                        ]
                    },
                ],
                regionaleGroupCode: "9316001"
            })).toEqual({
                role: Enums.Auth_Permissions.User_Type.area,
                code: '9316001'
            });

            expect(getUserPermissions({
                userGroups: [
                    { a: "A" },
                    { b: "A" },
                    {
                        name: Enums.Auth_Permissions.USER_TYPE_TO_ROLE[
                            Enums.Auth_Permissions.User_Type.regional
                        ]
                    },
                ],
                regionaleGroupCode: "9316001"
            })).toEqual({
                role: Enums.Auth_Permissions.User_Type.area,
                code: '9316001'
            });
        });

        it('Should get user permissions from json description -> json error', () => {
            expect(getUserPermissions({
                userGroups: [
                    { a: "A" },
                    { b: "A" }
                ],
                regionaleGroupCode: "9216001"
            })).toEqual({
                role: null,
                code: null
            });

            expect(getUserPermissions({
                userGroups: [
                    { a: "A" },
                    { b: "A" },
                    {
                        name: Enums.Auth_Permissions.USER_TYPE_TO_ROLE[
                            Enums.Auth_Permissions.User_Type.regional
                        ]
                    }
                ],
                sectionCode: "9216001"
            })).toEqual({
                role: null,
                code: null
            });
        });

    });

    it('Should get user data from uuid', (done) => {
        const testUUID = "96b5ae9d-f72f-4f0c-8fb4-a95473ce4ed5";
        require('dotenv').config();
        checkUserAuthorizations(testUUID)
            .then(val => {
                expect(val.role).toBe(Enums.Auth_Permissions.User_Type.central);
                expect(val.code).toBe("9300100");
                done();
            })
            .catch(err => {
                expect(err).toBeUndefined();
                done();
            })
    });

});
