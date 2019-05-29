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
    $stateProvider.state('app.larvicides.detail', {
        url: "/{id}",
        templateUrl: "views/larvicides/detail.html",
        controller: 'LarvicidesDetailController',
        label: 'Larvicidas',
        icon: 'glyphicon glyphicon-time'
    });
}]);

app.controller('LarvicidesDetailController', ['$scope', '$rootScope', '$stateParams', '$state', 'resources', '$q', 'filterFilter', 'uiGmapGoogleMapApi', 'uiGmapIsReady', 'download', '$timeout', 'NgTableParams', '$filter', function ($scope, $rootScope, $stateParams, $state, resources, $q, filterFilter, uiGmapGoogleMapApi, uiGmapIsReady, download, $timeout, NgTableParams, $filter) {

    $scope.edit = $stateParams.id != 'new';
    $scope.view = {
        loading: true,
        saving: false
    };

    $scope.load = function () {
        if ($stateParams.id == 'new') {
            $scope.larvicide = {
                enabled: true
            };
            $scope.view.loading = false;
        } else {
            resources.getLarvicide($stateParams.id)
                .success(function (data) {
                    $scope.larvicide = data;
                    $scope.view.loading = false;
                });
        }
    };

    $scope.save = function () {
        $scope.saving = true;
        resources.saveLarvicide($stateParams.id, $scope.larvicide)
           .success(function (data) {
               $state.go('app.larvicides.list');
           });
    };
   
    $scope.load();
}]);