"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose = require("mongoose");
var enums_1 = require("../../src/app/shared/types/enums");
var Auth_Permissions = enums_1.Enums.Auth_Permissions;
var request = require("request");
exports.SheltersToUpdate = [];
exports.ObjectId = mongoose.Types.ObjectId;
var DISABLE_LOG = false;
var maxTime = 1000 * 60 * 10;
function cleanSheltersToUpdate() {
    exports.SheltersToUpdate.forEach(function (obj) {
        var diff = Date.now() - obj.watchDog.valueOf();
        if (diff > maxTime) {
            exports.SheltersToUpdate.splice(exports.SheltersToUpdate.indexOf(obj), 1);
        }
    });
}
function getArea(code) {
    return code.substr(2, 2);
}
function getRegion(code) {
    return code.substr(2, 2);
}
function getSection(code) {
    return code.substr(4, 3);
}
function getAreaRegions(area) {
    return Auth_Permissions.Regions_Area[Auth_Permissions.Area_Code[area]];
}
function checkUserData(user) {
    if (user && user.code && user.role) {
        var regions = [];
        var section = void 0;
        if (user.role === Auth_Permissions.User_Type.area) {
            regions = getAreaRegions(getArea(user.code));
        }
        else if (user.role === Auth_Permissions.User_Type.regional ||
            user.role === Auth_Permissions.User_Type.sectional) {
            regions = [getRegion(user.code)];
        }
        if (user.role === Auth_Permissions.User_Type.sectional) {
            section = getSection(user.code);
        }
        return { section: section, regions: regions };
    }
    else {
        return null;
    }
}
exports.checkUserData = checkUserData;
function performRequestGET(url, authorization, count) {
    if (count === void 0) { count = 0; }
    return new Promise(function (resolve, reject) {
        var headers = authorization ? { 'Authorization': authorization } : null;
        request.get({
            url: url,
            method: 'GET',
            headers: headers,
            timeout: 1000 * 10
        }, function (err, response, body) {
            if (err) {
                if (String(err.code) === 'ESOCKETTIMEDOUT' && count < 3) {
                    return performRequestGET(url, authorization, ++count)
                        .then(function (value) { return resolve(value); })
                        .catch(function (e) { return reject(e); });
                }
                else {
                    reject(err);
                }
            }
            else {
                resolve({ response: response, body: body });
            }
        });
    });
}
exports.performRequestGET = performRequestGET;
function logger(log) {
    var other = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        other[_i - 1] = arguments[_i];
    }
    if (!DISABLE_LOG) {
        console.log.apply(console, [log].concat(other));
    }
}
exports.logger = logger;
function toTitleCase(input) {
    if (!input) {
        return '';
    }
    else {
        return input.replace(/\w\S*/g, (function (txt) { return txt[0].toUpperCase() + txt.substr(1); })).replace(/_/g, ' ');
    }
}
exports.toTitleCase = toTitleCase;
function getPropertiesNumber(obj) {
    var c = 0;
    for (var prop in obj) {
        if (obj.hasOwnProperty(prop)) {
            ++c;
        }
    }
    return c;
}
exports.getPropertiesNumber = getPropertiesNumber;
setInterval(cleanSheltersToUpdate, 1500);
//# sourceMappingURL=common.js.map