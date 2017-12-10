"use strict";
exports.__esModule = true;
var mongoose = require("mongoose");
var path = require("path");
var enums_1 = require("../src/app/shared/types/enums");
var Auth_Permissions = enums_1.Enums.Auth_Permissions;
var auth_api_1 = require("./API/auth.api");
exports.SheltersToUpdate = [];
exports.OUT_DIR = path.join(__dirname, "../dist");
exports.ObjectId = mongoose.Types.ObjectId;
exports.MONTHS = ["gennaio", "febbraio", "marzo", "aprile", "maggio", "giugno", "luglio", "agosto", "settembre", "ottobre", "novembre", "dicembre"];
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
        if (user.role == Auth_Permissions.User_Type.area) {
            regions = getAreaRegions(getArea(user.code));
        }
        else if (user.role == Auth_Permissions.User_Type.regional ||
            user.role == Auth_Permissions.User_Type.sectional) {
            regions = [getRegion(user.code)];
        }
        if (user.role == Auth_Permissions.User_Type.sectional) {
            section = getSection(user.code);
        }
        return { section: section, regions: regions };
    }
    else {
        return null;
    }
}
exports.checkUserData = checkUserData;
function logger(log) {
    var other = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        other[_i - 1] = arguments[_i];
    }
    if (!auth_api_1.DISABLE_AUTH) {
        console.log.apply(console, [log].concat(other));
    }
}
exports.logger = logger;
function toTitleCase(input) {
    if (!input) {
        return '';
    }
    else {
        return input.replace(/\w\S*/g, (function (txt) { return txt[0].toUpperCase() + txt.substr(1); })).replace(/_/g, " ");
    }
}
exports.toTitleCase = toTitleCase;
setInterval(cleanSheltersToUpdate, 1500);
