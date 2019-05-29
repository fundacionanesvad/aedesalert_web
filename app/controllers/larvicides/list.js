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
    $stateProvider.state('app.larvicides', {
        url: "/larvicides",
        templateUrl: "views/common/view.html",
        label: 'Larvicidas',
        icon: '	fa fa-medkit',
        link: 'app.larvicides.list',
        access: 'LARVICIDES_EDIT',
        category: 'admin'
    }).state('app.larvicides.list', {
        url: "/",
        templateUrl: "views/larvicides/list.html",
        controller: 'LarvicidesListController',
        label: 'Larvicidas',
        icon: '	fa fa-medkit'
    });
}]);

app.controller('LarvicidesListController', ['$scope', 'resources', '$state', function ($scope, resources, $state) {
    $scope.loading = true;
    
    $scope.load = function () {
        resources.getLarvicides()
            .success(function (data) {
                $scope.items = data;
                $scope.loading = false;
            });
    };

    $scope.confirm = function (item) {
        $scope.deleteItem = item;
        $('#deleteModal').modal('show');
    };

    $scope.delete = function () {
        $scope.deleting = true;
        resources.deleteLarvicide($scope.deleteItem.id)
            .success(function () {
                $scope.load();
                $('#deleteModal').modal('hide');
            });
    };

    $scope.detail = function (item) {
        $state.go('app.larvicides.detail', { id: item.id });
    };

    $scope.load();
}]);