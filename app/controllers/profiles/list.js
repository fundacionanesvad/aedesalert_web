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
    $stateProvider.state('app.profiles', {
        url: "/profiles",
        templateUrl: "views/common/view.html",
        label: 'Roles',
        icon: 'glyphicon glyphicon-lock',
        link: 'app.profiles.list',
        access: 'PROFILES_EDIT',
        category: 'admin'
    }).state('app.profiles.list', {
        url: "/",
        templateUrl: "views/profiles/list.html",
        controller: 'ProfilesListController',
        label: 'Roles',
        icon: 'glyphicon glyphicon-search'
    });
}]);

app.controller('ProfilesListController', ['$scope', 'resources', '$state', '$rootScope', function ($scope, resources, $state, $rootScope) {
    $scope.predicate = 'name';
    $scope.reverse = false;
    $scope.loading = true;
    $scope.deleting = false;

    $scope.load = function () {
        resources.getProfiles()
            .success(function (data) {
                $rootScope.profiles = data;
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
        resources.deleteProfile($scope.deleteItem.id)
            .success(function () {
                $scope.load();
            })
            .error(function () {
                $scope.loading = false;
                $scope.deleting = false;
                $('#deleteModal').modal('hide');
                $('#errorModal').modal('show');
            });
    };

    $scope.detail = function (item) {
        $state.go('app.profiles.detail', { id: item.id });
    };

    if ($scope.checkAccess('PROFILES_EDIT'))
        $scope.load();
    else
        $state.go('error403');
}]);