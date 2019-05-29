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
    $stateProvider.state('app.tables.elements', {
        url: "/{parent}/elements",
        templateUrl: "views/common/view.html"
    }).state('app.tables.elements.list', {
        url: "/",
        templateUrl: "views/elements/list.html",
        controller: 'ElementsListController',
        label: 'Listas',
        icon: 'glyphicon glyphicon-align-left'
    });
}]);

app.controller('ElementsListController', ['$scope', '$stateParams', 'resources', '$q', function ($scope, $stateParams, resources, $q) {

    $scope.predicate = 'sort';
    $scope.parent = $stateParams.parent;
    $scope.reverse = false;
    $scope.loading = true;
    $scope.deleting = false;

    $scope.load = function () {
        $scope.loading = true;
        $q.all([resources.getTable($stateParams.parent), resources.getElements($stateParams.parent)])
            .then(function (data) {
                $scope.table = data[0].data;
                $scope.elements = data[1].data;
                $scope.loading = false;
            });
    };

    $scope.confirm = function (item) {
        $scope.deleteItem = item;
    };

    $scope.delete = function () {
        $scope.deleting = true;
        resources.deleteElement($scope.deleteItem.id)
            .success(function () {
                $scope.deleting = false;
                $('#deleteModal').modal('hide');
                $scope.load();
            });
    };

    $scope.up = function (id) {
        $scope.loading = true;
        resources.upElement(id)
            .success(function () {
                $scope.load();
            });
    };

    $scope.down = function (id) {
        $scope.loading = true;
        resources.downElement(id)
            .success(function () {
                $scope.load();
            });
    };

    $scope.load();
}]);