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
    $stateProvider.state('app.reports.detail', {
        url: "/{id}/{areaId}",
        templateUrl: "views/reports/detail.html",
        controller: 'ReportsDetailController',
        label: 'Informes',
        icon: 'glyphicon glyphicon-stats'
    });
}]);

app.controller('ReportsDetailController', ['$scope', '$rootScope', '$stateParams', '$state', 'resources', 'download', '$filter', function ($scope, $rootScope, $stateParams, $state, resources, download, $filter) {

    $scope.view = {
        loading: true,
        deleting: false,
        saving: false,
        reporting: false,
        loadingDescendants: false,
        tab: 1,
        edit: $stateParams.id != 'new',
        nameAuto: true
    };
    $scope.data = {
        area: {},
        report: {},
        inspections: [],
        zoneTypes: [],
        detailLevels: [],
        edit: { allInspections: true },
        areas: [null, null, null, null, null, null],
        areaLists: [[], [], [], [], [], []],
        areaDescendants: [[], [], [], [], [], []]
    };

    $scope.load = function () {
        resources.getArea($rootScope.areaid)
            .then(function (response) {
                $scope.data.area = response.data;
                if (!$scope.data.area.typeId)
                    $scope.data.area.typeId = 9001;
                var index = $scope.data.area.typeId - 9001;
                $scope.data.areas[index] = $scope.data.area;
                $scope.data.areaLists[index].push($scope.data.area);
                $scope.data.area.id = $rootScope.areaid;

                if ($stateParams.id == 'new') {
                    $scope.data.report = {
                        name: 'Informe',
                        date: $rootScope.newTimeStamp(),
                        startDate: $rootScope.newTimeStamp(),
                        finishDate: $rootScope.newTimeStamp(),
                        dataType: 1,
                        detailLevel: 9001,
                        inspections: []
                    };
                    if ($stateParams.areaId) {
                        $scope.data.report.areaId = $stateParams.areaId;
                        $scope.loadArea();
                    } else {
                        $scope.data.edit.zoneTypeId = $scope.data.area.typeId;
                        $scope.changeZoneType();
                        $scope.view.loading = false;
                    }
                } else {
                    resources.getReport($stateParams.id)
                        .then(function (response) {
                            $scope.data.report = response.data;
                            $scope.loadArea();
                        });
                }
            });
    };
    $scope.allValue = true;

    $scope.loadArea = function () {
        resources.getArea($scope.data.report.areaId)
            .then(function (response) {
                $scope.data.edit.area = response.data;
                if (!$scope.data.edit.area.typeId)
                    $scope.data.edit.area.typeId = 9001;
                $scope.data.edit.area.id = $scope.data.report.areaId;
                $scope.data.edit.zoneTypeId = $scope.data.edit.area.typeId;
                if ($scope.data.report.detailLevel <= $scope.data.edit.zoneTypeId)
                    $scope.data.report.detailLevel = $scope.data.edit.zoneTypeId + 1;
                if ($scope.view.edit && $scope.updateName() != $scope.data.report.name)
                    $scope.view.nameAuto = false;
                $scope.loadInspections();
            });
    };

    $scope.$watch('data.report.startDate', function () {
        if ($scope.data.report.startDate > $scope.data.report.finishDate)
            $scope.data.report.finishDate = $scope.data.report.startDate;
        if (!$scope.view.loading)
            $scope.loadInspections();
    });

    $scope.$watch('data.report.finishDate', function () {
        if ($scope.data.report.finishDate < $scope.data.report.startDate)
            $scope.data.report.startDate = $scope.data.report.finishDate;
        if (!$scope.view.loading)
            $scope.loadInspections();
    });

    $scope.updateName = function () {
        if ($scope.view.nameAuto) {
            var name = '';
            if ($scope.data.edit.area) {
                if ($scope.data.report.dataType == 1)
                    name += 'Control';
                if ($scope.data.report.dataType == 2)
                    name += 'Inspecciones';
                else if ($scope.data.report.dataType == 3)
                    name += 'Reconversiones';
                else if ($scope.data.report.dataType == 4)
                    name += 'Vigilancia';
                if ($scope.data.edit.area)
                    name += ' ' + $scope.data.edit.area.name;
                name += ' del ' + $filter('shortDate')($scope.data.report.startDate) + ' al ' + $filter('shortDate')($scope.data.report.finishDate);
                if ($rootScope.tables)
                    name += ' (por ' + $filter('array')($scope.data.report.detailLevel, $rootScope.tables[9]).toLowerCase() + ')';   
            }
            if ($scope.view.loading)
                return name;
            else
                $scope.data.report.name = name;
        }
    };

    $scope.zoneTypeFilter = function (prop) {
        return function (item) {
            return item[prop] != 9007 && item[prop] >= $scope.data.area.typeId;
        }
    };

    $scope.detailLevelFilter = function (prop, val) {
        return function (item) {
            return item[prop] > val;
        }
    };

    $scope.changeZoneType = function () {
        if ($scope.data.report.detailLevel <= $scope.data.edit.zoneTypeId)
            $scope.data.report.detailLevel = $scope.data.edit.zoneTypeId + 1;
        $scope.data.report.areaId = null;
        $scope.data.edit.area = null;
        $scope.updateName();
    };

    $scope.loadDescendants = function (areaId, typeId) {
        $scope.view.loadingDescendants = true;
        if (typeId <= $scope.data.edit.zoneTypeId) {
            var descendants = $scope.data.areaDescendants[typeId - 9001];
            if (descendants.length) {
                $scope.loadDescendants(areaId, typeId + 1);
            } else {
                resources.getDescendantsByType(areaId, typeId)
                    .then(function (response) {
                        $scope.data.areaDescendants[typeId - 9001] = response.data;
                        $scope.loadDescendants(areaId, typeId + 1); 
                    });
            }
        } else {
            if ($scope.data.edit.area)
                $scope.loadAreasReverse($scope.data.edit.area);
            else
                $scope.loadAreas($scope.data.area.typeId + 1);
            $scope.view.loadingDescendants = false;
        }
    };

    $scope.loadAreas = function (typeId) {
        var index = typeId - 9001;
        var id = $scope.data.areas[index - 1].id;
        $scope.data.areaLists[index] = [];
        $scope.data.areaDescendants[index].forEach(function (area) {
            if (id == undefined || area.parentId == id)
                $scope.data.areaLists[index].push(area);
        });
        if ($scope.data.areaLists[index].length) {
            $scope.data.areas[index] = $scope.data.areaLists[index][0];
            if (typeId < 9006)
                $scope.loadAreas(typeId + 1);
        }
    };

    $scope.loadAreasReverse = function (area) {
        var index = area.typeId - 9001;
        if (area.typeId == $scope.data.area.typeId) {
            $scope.data.areas[index] = $scope.data.areaLists[index][0];
        } else {
            $scope.data.areaLists[index] = [];
            $scope.data.areaDescendants[index].forEach(function (descendant) {
                if (descendant.parentId == area.parentId)
                    $scope.data.areaLists[index].push(descendant);
                if (descendant.id == area.id)
                    $scope.data.areas[index] = descendant;
            });
            $scope.data.areaDescendants[index - 1].forEach(function (parent) {
                if (parent.id == area.parentId) {
                    $scope.loadAreasReverse(parent);
                    return;
                }
            });
        }
    };

    $scope.openSelectAreaModal = function () {
        $('#selectAreaModal').modal('show');
        $scope.loadDescendants($scope.data.area.id, $scope.data.area.typeId + 1);
    };

    $scope.selectArea = function () {
        var area = $scope.data.areas[$scope.data.edit.zoneTypeId - 9001];
        $scope.data.report.areaId = area.id;
        $scope.data.edit.area = area;
        $scope.loadInspections();
        $('#selectAreaModal').modal('hide');
    };

    $scope.loadInspections = function () {
        console.log('loadInspections');
        $scope.updateName();
        if (($scope.view.loading && $scope.view.edit) || (!$scope.data.edit.allInspections && $scope.data.report.areaId)) {
            $scope.view.saving = true;
            var filters = {
                areaId: $scope.data.report.areaId,
                startDate: $scope.data.report.startDate,
                finishDate: $scope.data.report.finishDate,
                type: $scope.data.report.dataType
            };
            resources.getReportInspections(filters)
                .then(function (response) {
                   
                    $scope.data.inspections = response.data;
                    var inspections = [];
                    $scope.data.inspections.forEach(function (inspection) {
                        if ($scope.data.report.inspections.indexOf(inspection.id) != -1) {
                                inspections.push(inspection.id);
                        }
                    });
                    if ($scope.view.loading && $scope.view.edit)
                        $scope.data.edit.allInspections = inspections.length == $scope.data.inspections.length;
                    console.log($scope.data.edit.allInspections.length, $scope.data.inspections.length, inspections.length)
                    $scope.data.report.inspections = inspections;
                    $scope.view.saving = false;
                    $scope.view.loading = false;
                });
        } else {
            $scope.view.loading = false;
        }
    };

    $scope.checkControl = function () {
        $scope.data.report.dataType = 1;
        $scope.loadInspections();
    };

    $scope.toggleInspection = function (id) {
        var index = $scope.data.report.inspections.indexOf(id);
        if (index == -1)
            $scope.data.report.inspections.push(id);
        else
            $scope.data.report.inspections.splice(index, 1);

        if ($scope.data.report.inspections.length == $scope.data.inspections.length) {
            $scope.allValue = true;
        } else {
            $scope.allValue = false;
        }
    };
    /**/
    $scope.toggleAllInspection = function () {

        var long = $scope.data.report.inspections.length;

        if ($scope.allValue == true) {
            while (long--) {
                var id = $scope.data.report.inspections[long];
                console.log(id);
                var index = $scope.data.report.inspections.indexOf(id);
                $scope.data.report.inspections.splice(index, 1);
            }
            $scope.allValue = false;
        } else {
            console.log($scope.data.inspections.length);
            $scope.data.report.inspections = [];
            $scope.data.inspections.forEach(function (inspection) {
                $scope.data.report.inspections.push(inspection.id);
            });
            $scope.allValue = true;
        }



    };

    $scope.save = function () {
        $scope.view.saving = true;
        if ($scope.data.edit.allInspections) {
            var filters = {
                areaId: $scope.data.report.areaId,
                startDate: $scope.data.report.startDate,
                finishDate: $scope.data.report.finishDate,
                type: $scope.data.report.dataType
            };
            resources.getReportInspections(filters)
                .then(function (response) {
                    $scope.data.report.inspections = [];
                    response.data.forEach(function (inspection) {
                        $scope.data.report.inspections.push(inspection.id);
                    });
                    console.log($scope.data.report.inspections.length + ' inspections');
                    $scope.saveReport();
                });
        } else {
            $scope.saveReport();
        }
    };

    $scope.saveReport = function () {
        resources.saveReport($stateParams.id, $scope.data.report)
            .then(function (response) {
                $scope.view.saving = false;
                $state.go('app.reports.list');
            });
    };

    $scope.printXlsx = function () {
        $('#modalDownload').modal('show');
        resources.getReportXlsx($stateParams.id)
            .success(function (data, status, headers, config) {
                download.file(data, status, headers, config, $scope.data.report.name + ".xlsx");
                $('#modalDownload').modal('hide');
            });
    };

    $scope.load();
}]);