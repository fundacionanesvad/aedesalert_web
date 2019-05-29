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
    $stateProvider.state('app.febriles', {
        url: "/febriles",
        templateUrl: "views/common/view.html",
        label: 'Casos Dengue',
        icon: '	fa fa-medkit',
        link: 'app.febriles.list',
        access: 'FEBRILES_VIEW'
    }).state('app.febriles.list', {
        url: "/",
        templateUrl: "views/febriles/list.html",
        controller: 'FebrilesListController',
        label: 'Casos Dengue',
        icon: '	fa fa-medkit'
    });
}]);

app.controller('FebrilesListController', ['$scope', 'resources', '$state', 'NgTableParams', function ($scope, resources, $state, NgTableParams) {
    $scope.loading = true;
    $scope.picker = { opened: false };
    
    $scope.tableParams = new NgTableParams({
        page: 1,
        count: 10,
        sorting: { date: "desc" }
    }, {
        getData: function ($defer, params) {
            $scope.loading = true;
            var args = { filter: params.filter(), sorting: params.sorting(), count: params.count(), page: params.page() };
            resources.getFebriles(args).success(function (data) {
                $scope.loading = false;
                $scope.deleting = false;
                params.total(data.count);
                $scope.total = data.count;
                $defer.resolve(data.febriles);
                $('#deleteModal').modal('hide');

            });
        }
    });
    
    $scope.openPicker = function ($event) {
        $scope.picker.opened = true;
    };

    $scope.confirm = function (item) {
        $scope.deleteItem = item;
        $('#deleteModal').modal('show');
    };

    $scope.delete = function () {
        $scope.deleting = true;
        resources.deleteFebrile($scope.deleteItem.id)
            .success(function () {
                $scope.tableParams.reload();
            });
    };

    $scope.detail = function (item) {
        $state.go('app.febriles.detail', { id: item.id });
    };
}]);