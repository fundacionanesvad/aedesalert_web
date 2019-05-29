/*
 *     Aedes Alert, Support to collect data to combat dengue
 *     Copyright (C) 2017  Fundación Anesvad
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU General Public License as published by
 *     the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU General Public License for more details.
 *
 *     You should have received a copy of the GNU General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */
app.config(['$stateProvider', function ($stateProvider) {
    $stateProvider.state('app.plans', {
        url: "/plans",
        templateUrl: "views/common/view.html",
        label: 'Planes',
        icon: 'glyphicon glyphicon-th-list',
        link: 'app.plans.list',
        access: 'PLANS_VIEW'
    }).state('app.plans.list', {
        url: "/",
        templateUrl: "views/plans/list.html",
        controller: 'PlansListController',
        label: 'Planes',
        icon: 'glyphicon glyphicon-time'
    });
}]);

app.controller('PlansListController', ['$scope', '$rootScope', 'resources', '$state', 'NgTableParams', 'download', function ($scope, $rootScope, resources, $state, NgTableParams, download) {
    $scope.loading = true;
    $scope.plans = [];
    $scope.canEdit = $rootScope.checkAccess('PLANS_EDIT');
    $scope.permissionToSend = $rootScope.checkAccess("PLANS_SEND");

    $scope.load = function () {
        resources.getPlansUser()
            .success(function (data) {
                $scope.plans = data;
                $scope.loading = false;
            });      
    };

    $scope.printReport = function (id) {
        $('#modalDownload').modal('show');
        resources.getPlanReport(id)
            .success(function (data, status, headers, config) {
                download.file(data, status, headers, config, 'Detalle Plan.pdf');
                $('#modalDownload').modal('hide');
            });
    };


    $scope.sendEmailInspector = function (id) {
        $('#modalSend').modal('show');
        resources.sendInspectorExcel(id)
           .success(function (data) {
               $('#modalSend').modal('hide');
           });
    };

    $scope.downloadPlan = function (id) {
        $('#modalDownload').modal('show');
        resources.getInspectorReport(id)
           .success(function (data, status, headers, config) {
               download.file(data, status, headers, config, 'Informe_Inspeccion.xlsx');
               $('#modalDownload').modal('hide');
           });
    };

    $scope.load();

}]);