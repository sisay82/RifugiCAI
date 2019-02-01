import { Enums } from "../types/enums";
import Codes = Enums.Auth_Permissions.Codes;
import User_Type = Enums.Auth_Permissions.User_Type;

export namespace Tools {
    export interface ICodeInfo {
        CODETYPE?: String,
        REGION?: String,
        GR?: String,
        SECTION?: String,
        SUBSECTION?: String,
        AREA?: String
    }

    export interface IUserProfile {
        code: String;
        role: User_Type;
    }

    function getRegionsFromAreaCode(sectionCode: String): Enums.Auth_Permissions.Region_Code[] {
        const code = Number(sectionCode);
        if (Enums.Auth_Permissions.Area_Code[code]) {
            return Enums.Auth_Permissions.Regions_Area[code]
        } else {
            return null;
        }
    }

    export function getShelterProfileCheck(filterFn, type: User_Type): (shel: String, user: String) => boolean {
        if (type === User_Type.area || type === User_Type.regional) {
            return (shel: String, user: String) => {
                const regions: any[] = Tools.getRegions(Tools.getCodeSections(type, user));
                return regions && regions.reduce((previous, current) =>
                    previous || (String(current) === filterFn(shel)), false);
            }
        } else {
            return (shel: String, user: String) => filterFn(shel) === filterFn(user);
        }
    }

    export function getShelterFilter(type?: User_Type): (code: String) => String {
        if (type) {
            if (type === User_Type.area || type === User_Type.regional) {
                return (code: String) => {
                    return Tools.getCodeSection(code, Codes.CodeNames.REGION);
                }
            } else {
                const codeSections: Codes.CodeNames[] = Codes.UserTypeCodes[type];
                return (code: String) => {
                    return codeSections.reduce((value, codeSection) => value.concat(<string>Tools.getCodeSection(code, codeSection)), '');
                }
            }
        } else {
            return function (code) {
                return null
            };
        }
    }

    export function filterRegions(type: User_Type, code: String): string[] {
        const userInfo = getCodeSections(type, code);
        const regions: any[] = getRegions(userInfo);
        const regionCodes = Object.keys(Enums.Auth_Permissions.Region_Code).filter(o => parseInt(o, 10));
        if (!regions || !Array.isArray(regions)) {
            return regionCodes;
        } else {
            return regionCodes.filter(i => regions.indexOf(i) >= 0);
        }
    }

    export function getAreaRegionsFromCode(code: String) {
        const section = getCodeSection(code, Codes.CodeNames.AREA);
        return getRegionsFromAreaCode(section);
    }

    export function getRegions(userInfo: ICodeInfo) {
        return getRegionsFromAreaCode(userInfo.AREA)
            || (userInfo.GR ? [userInfo.GR] : null)
            || (userInfo.REGION ? [userInfo.REGION] : null);
    }

    export function getSections(userInfo: ICodeInfo) {
        return [userInfo.SECTION];
    }

    export function getCodeSection(code: String, codeName: Codes.CodeNames): String {
        if (code && codeName) {
            const codeSection = Codes.CodeSection[codeName];
            return code.substr(codeSection[0], codeSection[1]);
        }
        return null;
    }

    export function getCodeSections(userType: User_Type, code: String): ICodeInfo {
        const codeInfo: ICodeInfo = {};
        for (const ct of Codes.UserTypeCodes[userType]) {
            const section = Codes.CodeNames[ct];
            codeInfo[section] = getCodeSection(code, ct);
        }
        return codeInfo;
    }

}
