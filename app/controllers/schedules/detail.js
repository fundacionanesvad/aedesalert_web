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
    $stateProvider.state('app.schedules.detail', {
        url: "/{id}",
        templateUrl: "views/schedules/detail.html",
        controller: 'SchedulesDetailController',
        label: 'Planificación',
        icon: 'glyphicon glyphicon-calendar'
    });
}]);

app.controller('SchedulesDetailController', ['$scope', '$rootScope', '$stateParams', '$state', 'resources', '$q', 'filterFilter', 'uiGmapGoogleMapApi', 'uiGmapIsReady', 'download', function ($scope, $rootScope, $stateParams, $state, resources, $q, filterFilter, uiGmapGoogleMapApi, uiGmapIsReady, download) {

    $scope.view = { loading: true, saving: false, waiting: false, deleting: false, tab: 1, allowEdit: $scope.checkAccess('SCHEDULES_EDIT') };
    $scope.data = {
        schedule: {},
        inspections: [],
        visits: [],
        area: { id: 0, name: '', childs: [] },
        areaInspection: { id: 0, name: '', childs: [] },
        inspection: {},
        plans: [],
        reconversionInspections: [],
        larvicides: []
    };
    $scope.startSchedulePicker = { opened: false, options: { startingDay: 1 } };
    $scope.finishSchedulePicker = { opened: false, options: { startingDay: 1 } };
    $scope.startInspectionPicker = { opened: false, options: { startingDay: 1 } };
    $scope.finishInspectionPicker = { opened: false, options: { startingDay: 1 } };
    $scope.picker = { minStartDate: null, maxStartDate: null, minFinishDate: null, maxFinishDate: null };

    $scope.load = function () {
        resources.getSchedule($stateParams.id)
            .success(function (data) {
                $scope.data.schedule = data;
                if ($scope.data.schedule.reconversionScheduleId)
                    $scope.data.reconversion = true;
                else
                    $scope.data.reconversion = false;
                $scope.loadReconversionInspections();
                $q.all([resources.getAreaChilds($scope.data.schedule.areaId), resources.getAreaSchedules($scope.data.schedule.areaId), resources.getLarvicides()])
                    .then(function (data) {
                        $scope.data.area = data[0].data;
                        $scope.data.areaInspection = data[0].data;
                        $scope.data.schedules = [];
                        data[1].data.forEach(function (schedule) {
                            if (schedule.id != $stateParams.id) {
                                $scope.data.schedules.push(schedule);
                            }
                        });
                        $scope.data.larvicides = data[2].data;
                        $scope.loadInspections();
                    });
            });
    };

    $scope.loadInspections = function () {
        resources.getScheduleInspections($stateParams.id)
            .success(function (data) {
                $scope.data.inspections = data;
                $scope.view.loading = false;
                $scope.view.saving = false;
                $scope.view.deleting = false;
                $('#modalInspection').modal('hide');
                $('#deleteModal').modal('hide');
            });
    };

    $scope.openStartSchedulePicker = function ($event) {
        $scope.calculateSchedulePickersBounds();
        $scope.startSchedulePicker.opened = true;
        $scope.finishSchedulePicker.opened = false;
    };

    $scope.openFinishSchedulePicker = function ($event) {
        $scope.calculateSchedulePickersBounds();
        $scope.finishSchedulePicker.opened = true;
        $scope.startSchedulePicker.opened = false;
    };

    $scope.openStartInspectionPicker = function ($event) {
        $scope.calculateInspectionPickersBounds();
        $scope.startInspectionPicker.opened = true;
        $scope.finishInspectionPicker.opened = false;
    };

    $scope.openFinishInspectionPicker = function ($event) {
        $scope.calculateInspectionPickersBounds();
        $scope.finishInspectionPicker.opened = true;
        $scope.startInspectionPicker.opened = false;
    };

    $scope.showInspection = function (inspection) {

        if (inspection) {
            $scope.view.waiting = true;
            var calls = [resources.getInspection(inspection.id), resources.getInspectionPlans(inspection.id)];
            if ($scope.data.schedule.reconversionScheduleId) {
                calls.push(resources.getScheduleAreaChilds($scope.data.schedule.reconversionScheduleId));
            }
            
            $q.all(calls)
                .then(function (data) {
                    $scope.data.selected = inspection.id;
                    $scope.data.inspection = data[0].data;
                    $scope.data.plans = data[1].data;
                    if ($scope.data.schedule.reconversionScheduleId) {
                        $scope.data.areaInspection = data[2].data;
                    }
                    $scope.view.waiting = false;
                });
        } else {
            $scope.data.selected = 'new';
            $scope.view.waiting = true;           
            $scope.data.inspection = {
                startDate: $scope.data.schedule.startDate,
                finishDate: $scope.data.schedule.finishDate,
                inspectionSize: 0,
                stateId: 3001,
                typeId: $scope.data.schedule.typeId,
                areaId: $scope.data.area.childs[0].id,
                scheduleId: $stateParams.id,
                coverage: 0,
                larvicideId: $scope.data.schedule.larvicideId
            };
            $scope.data.plans = [];
            if ($scope.data.schedule.reconversionScheduleId) {
                resources.getScheduleAreaChilds($scope.data.schedule.reconversionScheduleId)
                    .success(function (data) {
                        $scope.data.areaInspection = data;
                        $scope.data.inspection.areaId = $scope.data.areaInspection.childs[0].id
                        $scope.view.waiting = false;

                    });
            } else {
                $scope.data.areaInspection = $scope.data.area;
                $scope.data.inspection.areaId = $scope.data.area.childs[0].id
                $scope.view.waiting = false;
            }
        }
        $scope.calculateInspectionPickersBounds();
        $('#modalInspection').modal('show');
    };


    $scope.calculateSchedulePickersBounds = function () {
        $scope.picker.minStartDate = null;
        $scope.picker.maxStartDate = null;
        $scope.picker.minFinishDate = null;
        $scope.picker.maxFinishDate = null;
        if ($scope.data.inspections.length > 0) {
            $scope.picker.maxStartDate = $rootScope.newDate($scope.data.schedule.finishDate);
            $scope.picker.minFinishDate = $rootScope.newDate($scope.data.schedule.startDate);
            $scope.data.inspections.forEach(function (inspection) {
                var startDate = $rootScope.newDate(inspection.startDate);
                var finishDate = $rootScope.newDate(inspection.finishDate);
                if (startDate < $scope.picker.maxStartDate)
                    $scope.picker.maxStartDate = startDate;
                if (finishDate > $scope.picker.minFinishDate)
                    $scope.picker.minFinishDate = finishDate;
            });
        }
    };

    $scope.checkReconversion = function () {
        if ($scope.data.reconversion) { $scope.alert("Por favor, no se olvide de escoger una fecha antes de guardar.") }
        $scope.data.reconversionInspections = [];
        if ($scope.data.schedule.typeId != 1002)
            $scope.data.reconversion = false;
        if ($scope.data.reconversion)
            $scope.data.schedule.reconversionScheduleId = $scope.data.schedules[$scope.data.schedules.length - 1].id;
        else
            $scope.data.schedule.reconversionScheduleId = null;
        $scope.loadReconversionInspections();
    };

    $scope.loadReconversionInspections = function () {
        if ($scope.data.schedule.reconversionScheduleId) {
            resources.getScheduleInspections($scope.data.schedule.reconversionScheduleId)
                .success(function (data) {
                    $scope.data.reconversionInspections = data;
                });
        }
    };

    $scope.$watch('data.schedule.startDate', function () {
        if ($scope.data.inspections.length == 0 && $scope.data.schedule.startDate > $scope.data.schedule.finishDate)
            $scope.data.schedule.finishDate = $scope.data.schedule.startDate;
    });

    $scope.$watch('data.schedule.finishDate', function () {
        if ($scope.data.inspections.length == 0 && $scope.data.schedule.finishDate < $scope.data.schedule.startDate)
            $scope.data.schedule.startDate = $scope.data.schedule.finishDate;
    });

    $scope.calculateInspectionPickersBounds = function () {
        $scope.picker.minStartDate = $rootScope.newDate($scope.data.schedule.startDate);
        $scope.picker.maxStartDate = $rootScope.newDate($scope.data.schedule.finishDate);
        $scope.picker.minFinishDate = $rootScope.newDate($scope.data.schedule.startDate);
        $scope.picker.maxFinishDate = $rootScope.newDate($scope.data.schedule.finishDate);
        $scope.data.plans.forEach(function (plan) {
            var date = $rootScope.newDate(plan.date);
            if (date < $scope.picker.maxStartDate)
                $scope.picker.maxStartDate = date;
            if (date > $scope.picker.minFinishDate)
                $scope.picker.minFinishDate = date;
        });
        var finishDate = $rootScope.newDate($scope.data.inspection.finishDate);
        if (finishDate < $scope.picker.maxStartDate)
            $scope.picker.maxStartDate = finishDate;
        var startDate = $rootScope.newDate($scope.data.inspection.startDate);
        if (startDate > $scope.picker.minFinishDate)
            $scope.picker.minFinishDate = startDate;
    };

    $scope.saveInspection = function () {
        $scope.view.saving = true;
        if ($scope.data.inspection.inspectionSize == 0) {
            $scope.data.area.childs.forEach(function (area) {
                if (area.id == $scope.data.inspection.areaId) {
                    if (area.houses == null) {
                        $scope.data.inspection.inspectionSize = 0;
                    } else {
                        if ($scope.data.inspection.typeId == 1001) {
                            var N = area.houses;
                            var Z = 1.96;
                            var e = 0.05;
                            var p = 0.5;
                            if (area.houses<3501) {
                                $scope.data.inspection.inspectionSize = Math.round(area.houses * 0.1);
                            } else {
                                $scope.data.inspection.inspectionSize = Math.round((N * Z * Z * p * (1 - p)) / ((N - 1) * e * e + Z * Z * p * (1 - p)));
                            }
                            
                        } else {
                            $scope.data.inspection.inspectionSize = area.houses;
                        }
                    } 
                };
            });
        }
        resources.saveSchedule($stateParams.id, $scope.data.schedule)
            .success(function (data) {
                resources.saveInspection($scope.data.selected, $scope.data.inspection)
                    .success(function (data) {
                        $scope.loadInspections();
                    });
            });
    };

    $scope.confirmDelete = function (item) {
        console.log(item.id);
        resources.getInspection(item.id).success(function (data) {
            console.log(data.stateId);
            if (data.stateId != 3001) { $scope.alert("No se puede borrar ya que la inspeccion ya no esta planificada, por favor recargue la pagina.")}
            else {
                $scope.deleteItem = item;
                $('#deleteModal').modal('show');
            }
        });
    };

    $scope.deleteInspection = function () {
        $scope.view.deleting = true;
        resources.deleteInspection($scope.deleteItem.id)
            .success(function (data) {
                $scope.loadInspections();
            });

    };

    $scope.saveSchedule = function () {
        $scope.view.saving = true;
        resources.saveSchedule($stateParams.id, $scope.data.schedule)
            .success(function (data) {
                $scope.view.saving = false;
            });
    };

    $scope.detailInspection = function (item) {
        $state.go('app.inspections.detail', { id: item.id });
    };


    $scope.printReport = function () {
        $('#modalDownload').modal('show');
        //console.log($stateParams.id, $scope.data.schedule);
        resources.getScheduleReport($stateParams.id)
            .success(function (data, status, headers, config) {
                download.file(data, status, headers, config, 'Informe Planificación.xlsx');
                $('#modalDownload').modal('hide');
            });
    };

    $scope.alert = function (message) {
        $scope.textAlert = message;
        $('#modalAlert').modal('show');
    };

    $scope.load();
}]);