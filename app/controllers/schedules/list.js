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
    $stateProvider.state('app.schedules', {
        url: "/schedules",
        templateUrl: "views/common/view.html",
        label: 'Planificación',
        icon: 'glyphicon glyphicon-calendar',
        link: 'app.schedules.list',
        access: 'SCHEDULES_VIEW'
    }).state('app.schedules.list', {
        url: "/",
        templateUrl: "views/schedules/list.html",
        controller: 'SchedulesListController',
        label: 'Planificación',
        icon: 'glyphicon glyphicon-calendar'
    });
}]);

app.controller('SchedulesListController', ['$scope', 'resources', '$state', 'NgTableParams', function ($scope, resources, $state, NgTableParams) {
    $scope.loading = true;
    $scope.deleting = false;
    $scope.types = [{ id: 1001, title: 'Vigilancia' }, { id: 1002, title: 'Control' }];
    $scope.startDatePicker = { opened: false };
    $scope.finishDatepicker = { opened: false };
    $scope.scheduletypes = [{ id: 1, title: 'Si' }, { id: 0, title: 'No' }];
    $scope.ovitrampas = [{ id: 1, title: 'Si' }, { id: 0, title: 'No' }];
    $scope.tableParams = new NgTableParams({
        page: 1,
        count: 10,
        sorting: { startDate: "desc" }
    }, {
        getData: function ($defer, params) {
            var args = { filter: params.filter(), sorting: params.sorting(), count: params.count(), page: params.page() };
            resources.getSchedules(args).success(function (data) {
                params.total(data.count);
                $scope.total = data.count;
                $scope.loading = false;
                $scope.deleting = false;
                $('#deleteModal').modal('hide');
                $defer.resolve(data.schedules);
            });
        }
    });

    $scope.detail = function (item) {
        $state.go('app.schedules.detail', { id: item.id });
    };

    $scope.openStartDatePicker = function ($event) {
        $scope.startDatePicker.opened = true;
    };

    $scope.openFinishDatePicker = function ($event) {
        $scope.finishDatepicker.opened = true;
    };

    $scope.confirmDelete = function (item) {
        $scope.deleteItem = item;
        $('#deleteModal').modal('show');
    };

    $scope.delete = function () {
        $scope.deleting = true;
        resources.deleteSchedule($scope.deleteItem.id)
            .success(function (data) {
                $scope.tableParams.reload();
            });
    };
}]);