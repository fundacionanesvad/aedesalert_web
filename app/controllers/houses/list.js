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
    $stateProvider.state('app.houses', {
        url: "/houses",
        templateUrl: "views/common/view.html",
        label: 'Viviendas',
        icon: 'glyphicon glyphicon-home',
        link: 'app.houses.list',
        access: 'HOUSES_VIEW'
    }).state('app.houses.list', {
        url: "/",
        templateUrl: "views/houses/list.html",
        controller: 'HousesListController',
        label: 'Viviendas',
        icon: 'glyphicon glyphicon-home'
    });
}]);

app.controller('HousesListController', ['$scope', 'resources', '$state', 'NgTableParams', function ($scope, resources, $state, NgTableParams) {
    $scope.loading = true;

    $scope.tableParams = new NgTableParams({
        page: 1,
        count: 10,
        sorting: { code: "asc" }
    }, {
        getData: function ($defer, params) {
            $scope.loading = true;
            var args = { filter: params.filter(), sorting: params.sorting(), count: params.count(), page: params.page() };
            resources.getHouses(args).success(function (data) {
                params.total(data.count);
                $scope.total = data.count;
                $scope.loading = false;
                $defer.resolve(data.houses);
            });
        }
    });

    $scope.detail = function (item) {
        $state.go('app.houses.detail', { id: item.uuid });
    };
}]);