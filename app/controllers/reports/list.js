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
    $stateProvider.state('app.reports', {
        url: "/reports",
        templateUrl: "views/common/view.html",
        label: 'Informes',
        icon: 'glyphicon glyphicon-stats',
        link: 'app.reports.list',
        access: 'REPORTS_VIEW'
    }).state('app.reports.list', {
        url: "/",
        templateUrl: "views/reports/list.html",
        controller: 'ReportsListController',
        label: 'Informes',
        icon: 'glyphicon glyphicon-stats'
    });
}]);


app.controller('ReportsListController', ['$scope', 'resources', '$q', '$state', 'NgTableParams',  function ($scope, resources, $q, $state, NgTableParams) {
    $scope.loading = true;
    $scope.deleting = false;
    $scope.validateOptions = [{ id: 1, title: 'Si' }, { id: 0, title: 'No' }];
    $scope.picker = { opened: false };
    $scope.dataTypes = [{ id: 4, title: 'Vigilancia' }, { id: 1, title: 'Control' }, { id: 2, title: 'Inspecciones' }, { id: 3, title: 'Reconversiones' }];
    $scope.detailLevels = [{ id: 9002, title: 'Región' }, { id: 9003, title: 'Red' }, { id: 9004, title: 'Microrred' }, { id: 9005, title: 'EESS' }, { id: 9006, title: 'Sector' }, { id: 9007, title: 'Manzana' }];

    $scope.tableParams = new NgTableParams({
        page: 1,
        count: 10,
        sorting: { date: "desc" }
    }, {
        getData: function ($defer, params) {
            var args = { filter: params.filter(), sorting: params.sorting(), count: params.count(), page: params.page() };
            resources.getReports(args).success(function (data) {
                params.total(data.count);
                $scope.total = data.count;
                $scope.loading = false;
                $scope.deleting = false;
                $('#modalDelete').modal('hide');
                $defer.resolve(data.reports);
            });
        }
    });


    $scope.openPicker = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();
        $scope.picker.opened = true;
    };


    $scope.confirm = function (item) {
        $scope.deleteItem = item;
        $('#modalDelete').modal('show');
    };

    $scope.delete = function () {
        $scope.deleting = true;
        resources.deleteReport($scope.deleteItem.id)
            .success(function () {
                $scope.tableParams.reload();
            });
    };

    $scope.detail = function (item) {
        $state.go('app.reports.detail', { id: item.id });
    };

}]);