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
    $stateProvider.state('app.tables', {
        url: "/tables",
        templateUrl: "views/common/view.html",
        label: 'Listas',
        icon: 'glyphicon glyphicon-align-left',
        link: 'app.tables.list',
        access: 'TABLES_EDIT',
        category: 'admin'
    }).state('app.tables.list', {
        url: "/",
        templateUrl: "views/tables/list.html",
        controller: 'TablesListController',
        label: 'Listas',
        icon: 'glyphicon glyphicon-align-left'
    });
}]);

app.controller('TablesListController', ['$scope', 'resources', '$state', function ($scope, resources, $state) {

    $scope.predicate = 'name';
    $scope.reverse = false;
    $scope.loading = true;
    $scope.deleting = false;

    $scope.load = function () {
        resources.getTables()
            .success(function (data) {
                $scope.items = data;
                $scope.loading = false;
                $scope.deleting = false;
                $('#deleteModal').modal('hide');
            });
    };

    $scope.confirm = function (item) {
        $scope.deleteItem = item;
        $('#deleteModal').modal('show');
    };

    $scope.delete = function () {
        $scope.deleting = true;
        resources.deleteTable($scope.deleteItem.id)
            .success(function () {
                $scope.load();
            });
    };

    $scope.detail = function(item) {
        $state.go('app.tables.detail', { id: item.id });
    };

    $scope.load();
}]);