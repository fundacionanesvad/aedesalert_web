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
    $stateProvider.state('app.inspections', {
        url: "/inspections",
        templateUrl: "views/common/view.html",
        label: 'Inspecciones',
        icon: 'glyphicon glyphicon-time',
        link: 'app.inspections.list',
        access: 'INSPECTIONS_VIEW'
    }).state('app.inspections.list', {
        url: "/",
        templateUrl: "views/inspections/list.html",
        controller: 'InspectionsListController',
        label: 'Inspecciones',
        icon: 'glyphicon glyphicon-time'
    });
}]);

app.controller('InspectionsListController', ['$scope', 'resources', '$state', 'NgTableParams', function ($scope, resources, $state, NgTableParams) {
    $scope.loading = true;
    $scope.deleting = false;
    $scope.types = [{ id: 1001, title: 'Vigilancia' }, { id: 1002, title: 'Control' }];
    $scope.states = [{ id: 3001, title: 'Planificada' }, { id: 3002, title: 'Activa' }, { id: 3003, title: 'Realizada' }, { id: 3004, title: 'Cancelada' }];
    $scope.reconversion = [{ id: 1, title: 'Si' }, { id: 0, title: 'No' }];
    $scope.ovitrmpas = [{ id: 1, title: 'Si' }, { id: 0, title: 'No' }];
    $scope.startDatePicker = { opened: false };
    $scope.finishDatepicker = { opened: false };

    $scope.tableParams = new NgTableParams({
        page: 1,
        count: 10,
        sorting: { startDate: "desc" }
    }, {
        getData: function ($defer, params) {
            var args = { filter: params.filter(), sorting: params.sorting(), count: params.count(), page: params.page() };
            resources.getInspections(args).success(function (data) {
                params.total(data.count);
                $scope.total = data.count;
                $scope.loading = false;
                $scope.deleting = false;
                $defer.resolve(data.inspections);
            });
        }
    });

    $scope.openStartDatePicker = function ($event) {
        $scope.startDatePicker.opened = true;
    };

    $scope.openFinishDatePicker = function ($event) {
        $scope.finishDatepicker.opened = true;
    };

    $scope.detail = function (item) {
        $state.go('app.inspections.detail', { id: item.id });
    };
}]);