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
    $stateProvider.state('app.traps', {
        url: "/traps",
        templateUrl: "views/common/view.html",
        abstract: true
    }).state('app.traps.manage', {
        url: "/manage",
        templateUrl: "views/common/view.html",
        label: 'Gestión',
        link: 'app.traps.manage.list',
        access: 'TRAPS_VIEW',
        abstract: true,
        category: 'traps'
    }).state('app.traps.manage.list', {
        templateUrl: "views/traps/list.html",
        controller: 'TrapsListController',
        label: 'Gestión ovitrampas',
        link: 'app.traps.list',
        category: 'traps'
    });
}]);

app.controller('TrapsListController', ['$scope', '$rootScope', 'resources', '$state', 'NgTableParams', function ($scope, $rootScope, resources, $state, NgTableParams) {

    $scope.edit = $rootScope.checkAccess('TRAPS_EDIT');
    $scope.loading = true;
    $scope.deleting = false;
    $scope.enabledOptions = [{ id: 1, title: 'Si' }, { id: 0, title: 'No' }];

    $scope.tableParams = new NgTableParams({
        page: 1,
        count: 10,
        sorting: { code: "asc" }
    }, {
        getData: function ($defer, params) {
            var args = { filter: params.filter(), sorting: params.sorting(), count: params.count(), page: params.page() };
            resources.getTrapsParams(args).success(function (data) {
                params.total(data.count);
                $scope.total = data.count;
                $scope.loading = false;
                $scope.deleting = false;
                $defer.resolve(data.traps);
            });
        }
    });

    $scope.detail = function (item) {
        $state.go('app.traps.manage.detail', { id: item.id });
    };
}]);