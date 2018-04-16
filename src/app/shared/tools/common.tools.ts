import { Enums } from "../types/enums";
import Codes = Enums.Auth_Permissions.Codes;
import User_Type = Enums.Auth_Permissions.User_Type;

export namespace Tools {
    export interface ICodeInfo {
        CODETYPE?: String,
        REGION?: String,
        SECTION?: String,
        SUBSECTION?: String,
        AREA?: String
    }

    function getRegionsFromAreaCode(sectionCode: String) {
        if (Enums.Auth_Permissions.Area_Code[<string>sectionCode]) {
            return Enums.Auth_Permissions.Regions_Area[<string>sectionCode]
        } else if (Enums.Auth_Permissions.Region_Code[<string>sectionCode]) {
            return sectionCode;
        } else {
            return null;
        }
    }

    export function getShelterFilter(type?: User_Type): (code: String) => String {
        if (type) {
            const codeSections: Codes.CodeSection[] = Codes.UserTypeCodes[type];
            return (code: String) => {
                return codeSections.reduce((value, codeSection) => value.concat(<string>Tools.getCodeSection(code, codeSection)), '');
            }
        } else {
            return function (code) {
                return null
            };
        }
    }

    export function getAreaRegionsFromCode(code: String) {
        const section = getCodeSection(code, Codes.CodeSection.REGION);
        return getRegionsFromAreaCode(section);
    }

    export function getRegions(userInfo: ICodeInfo) {
        return getRegionsFromAreaCode(userInfo.AREA) || [userInfo.REGION];
    }

    export function getSections(userInfo: ICodeInfo) {
        return [userInfo.SECTION];
    }

    export function getCodeSection(code: String, codeSection: Codes.CodeSection): String {
        return code.substr(codeSection[0], codeSection[1]);
    }

    export function getCodeSections(userType: User_Type, code: String): ICodeInfo {
        const codeInfo: ICodeInfo = {};
        for (const ct of Codes.UserTypeCodes[userType]) {
            const section = Codes.CodeSection[ct];
            codeInfo[section] = getCodeSection(code, ct);
        }
        if (userType === User_Type.area) {
            codeInfo["AREA"] = getCodeSection(code, Codes.CodeSection.REGION);
        }
        return codeInfo;
    }

}
