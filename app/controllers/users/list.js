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
    $stateProvider.state('app.users', {
        url: "/users",
        templateUrl: "views/common/view.html",
        label: 'Usuarios',
        icon: 'glyphicon glyphicon-user',
        link: 'app.users.list',
        access: 'USERS_EDIT',
        abstract: true,
        category: 'admin'
    }).state('app.users.list', {
        url: "/",
        templateUrl: "views/users/list.html",
        controller: 'UsersListController',
        label: 'Usuarios',
        icon: 'glyphicon glyphicon-user'
    });
}]);

app.controller('UsersListController', ['$scope', 'resources', '$q', '$state', 'NgTableParams', function ($scope, resources, $q, $state, NgTableParams) {

    $scope.loading = true;
    $scope.deleting = false;
    $scope.enabledOptions = [{ id: 1, title: 'Si' }, { id: 0, title: 'No' }];
    $scope.data = { areas: [] };

    $scope.load = function () {
        resources.getAreas()
            .success(function (data) {
                $scope.data.areas = data;
            });
    };

    $scope.tableParams = new NgTableParams({
        page: 1,
        count: 10,
        sorting: { name: "asc" }
    }, {
        getData: function ($defer, params) {
            var args = { filter: params.filter(), sorting: params.sorting(), count: params.count(), page: params.page() };
            resources.getUsersParams(args).success(function (data) {
                params.total(data.count);
                $scope.total = data.count;
                $scope.loading = false;
                $scope.deleting = false;
                $('#deleteModal').modal('hide');
                $defer.resolve(data.users);
            });
            $scope.load();
        }
    });

    $scope.confirm = function (item) {
        $scope.deleteItem = item;
        $('#deleteModal').modal('show');
    };

    $scope.delete = function () {
        $scope.deleting = true;
        resources.deleteUser($scope.deleteItem.id)
            .success(function () {
                $scope.tableParams.reload();
            });
    };

    $scope.detail = function (item) {
        $state.go('app.users.detail', { id: item.id });
    };

    $scope.unlockUser = function (item) {
        $scope.loading = true;
        resources.unlockUser(item.id)
          .success(function () {
              $scope.tableParams.reload();
          });
    }
}]);