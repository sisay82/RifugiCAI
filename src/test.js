/* global object*/

(function () {
    angular.module('celano.components.privilegeGroupDetail', ['celano.core'])
        .controller('celPrivilegeGroupDetailCtrl', privilegeGroupDetailCtrl)
        .directive('celPrivilegeGroupDetail', privilegeGroupDetailDirective);

    function privilegeGroupDetailDirective() {
        return {
            scope: {
                privilegeGroup: '='
            },
            restrict: 'E',
            templateUrl: 'PrivilegeGroupDetail.temp.html',
            controller: 'celPrivilegeGroupDetailCtrl',
            controllerAS: 'ctrl'
        };
    }


    function privilegeGroupDetailCtrl($scope) {
        var self = this;

        $scope.$watch('privilegeGroup', function (newValue, oldValue) {
            if (newValue) {
                self.loadDetail(newValue);
                self.editMode.off(oldValue);
            }
        });

        self.detailState = {};

        self.editMode = {
            value: false,
            istanceBackup: {}
        }

        self.detailState.init = function () {

        }

        self.detailState.categories = function () {

        }

        self.detailState.privilegies = function () {

        }

        self.detailState.set = function (privilegies) {

        }

        self.detailState.reset = function (privilegies) {

        }

        self.editMode.on = function (istance) {
            if (!self.editMode.value) {
                self.editMode.istanceBackup = angular.extend(self.editMode.istanceBackup, istance);
                self.editMode.value = true;
            }
        }

        self.editMode.off = function (istance) {
            if (self.editMode.value) {
                istance = angular.extend(istance, self.editMode.istanceBackup);
                self.editMode.value = false;
                self.editMode.istanceBackup = {};
            }
        }

        self.editMode.reset = function () {
            self.editMode.value = false;
            self.editMode.istanceBackup = {};
        }

        function loadDetail(istance);

        self.newIstance = function (newIstance, success, error) {
            self.editMode.off(istance);

            self.editMode.on(newIstance);
        };

        self.saveIstance = function (istance) {

        };

        self.deleteIstance = function (istance) {
            self.editMode.off(istance);

        };
    }
})