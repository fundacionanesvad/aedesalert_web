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
    $stateProvider.state('app.areas', {
        url: "/areas",
        templateUrl: "views/common/view.html",
        label: 'Zonas',
        icon: 'glyphicon glyphicon-th-large',
        link: 'app.areas.list({ id: null})',
        access: 'AREAS_VIEW'
    }).state('app.areas.list', {
        url: "/list/{id}",
        templateUrl: "views/areas/list.html",
        controller: 'AreasListController',
        label: 'Listado Zonas',
        icon: 'glyphicon glyphicon-th-large'
    });
}]);

app.controller('AreasListController', ['$scope', '$rootScope', 'resources', '$stateParams', '$q', '$state', function ($scope, $rootScope, resources, $stateParams, $q, $state) {

    $scope.id = $stateParams.id == '' ? $rootScope.areaid : $stateParams.id;
    $scope.predicate = 'name';
    $scope.reverse = false;
    $scope.loading = true;
    $scope.deleting = false;

    $scope.load = function () {
        $scope.loading = true;
        $q.all([resources.getAreaChilds($scope.id), resources.getAreaParents($scope.id)])
            .then(function (data) {
                $scope.data = data[0].data;
                $scope.parents = data[1].data;
                $scope.loading = false;
            });
    };

    $scope.confirm = function (item) {
        $scope.deleteItem = item;
        $('#deleteModal').modal('show');
    };

    $scope.delete = function () {
        $scope.deleting = true;
        $rootScope.process403 = false;
        resources.deleteArea($scope.deleteItem.id)
            .then(function (data) {
                $scope.deleting = false;
                $rootScope.process403 = true;
                $('#deleteModal').modal('hide');
                $scope.load();
            })
            .catch(function (data) {
                $scope.deleting = false;
                $('#errorModal').modal('show');
            });
    };

    $scope.detail = function (item) {
        if (item.typeId != 9007)
            $state.go('app.areas.list', { id: item.id });
    };

    $scope.load();
}]);