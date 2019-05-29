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
    $stateProvider.state('app.traps.manage.detail', {
        url: "/{id}",
        label: 'Gestión ovitrampas',
        params: {
            id: 'new'
        },
        templateUrl: "views/traps/detail.html",
        controller: 'TrapsDetailController',
    });
}]);

app.controller('TrapsDetailController', ['$scope', '$rootScope', '$stateParams', 'resources', '$q', '$state', 'NgTableParams', function ($scope, $rootScope, $stateParams, resources, $q, $state, NgTableParams) {

    $scope.id = $stateParams.id;
    $scope.edit = $rootScope.checkAccess('TRAPS_EDIT');
    $scope.loading = true;
    $scope.data = {
        area: {},
        trap: {},
        locations: [],
        areas: [null, null, null, null, null, null],
        areaLists: [[], [], [], [], [], []],
        areaDescendants: [[], [], [], [], [], []]
    };

    $scope.load = function () {
        var calls = [resources.getArea($rootScope.areaid)];
        if ($stateParams.id != 'new') {
            calls.push(resources.getTrap($stateParams.id));
            calls.push(resources.getTrapLocations($stateParams.id));
        }
        $q.all(calls)
            .then(function (response) {
                $scope.data.area = response[0].data;
                if (!$scope.data.area.typeId)
                    $scope.data.area.typeId = 9001;
                var index = $scope.data.area.typeId - 9001;
                $scope.data.areas[index] = $scope.data.area;
                $scope.data.areaLists[index].push($scope.data.area);
                $scope.data.area.id = $rootScope.areaid;
                if ($stateParams.id == 'new') {
                    $scope.data.trap = { enabled: true };
                } else {
                    $scope.data.trap = response[1].data;
                    $scope.data.locations = response[2].data;
                }
                $scope.loadDescendants($scope.data.area.id, $scope.data.area.typeId);
            });
    };

    $scope.loadDescendants = function (areaId, typeId) {
        var calls = [];
        for (var i = 9002; i <= 9005; i++) {
            if (i <= typeId)
                calls.push(resources.fakeArray());
            else
                calls.push(resources.getDescendantsByType(areaId, i));
        };
        $q.all(calls)
            .then(function (data) {
                for (var i = 9002; i <= 9005; i++)
                    $scope.data.areaDescendants[i - 9001] = data[i - 9002].data;
                if ($scope.data.trap.eessId)
                    $scope.loadAreasReverse({ id: $scope.data.trap.eessId, typeId: 9005, parentId: $scope.data.trap.microrredId });
                else
                    $scope.loadAreas($scope.data.area.typeId + 1);
                $scope.loading = false;
            });
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
            $scope.data.areaLists[index].sort(function (a, b) {
                return a.name.localeCompare(b.name);
            });
            $scope.data.areas[index] = $scope.data.areaLists[index][0];
            if (typeId < 9005)
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
            $scope.data.areaLists[index].sort(function (a, b) {
                return a.name.localeCompare(b.name);
            });
            $scope.data.areaDescendants[index - 1].forEach(function (parent) {
                if (parent.id == area.parentId) {
                    $scope.loadAreasReverse(parent);
                    return;
                }
            });
        }
    };

    $scope.save = function () {
        var saveLocation = $scope.saving;
        $scope.saving = true;
        $scope.data.trap.eessId = $scope.data.areas[4].id;
        resources.saveTrap($scope.id, $scope.data.trap)
            .success(function (data) {
                if ($scope.id == 'new') {
                    if (data == 0) {
                        $scope.saving = false;
                        $('#modalAlert').modal('show');
                    } else {
                        $scope.id = data;
                    }
                }
                if (saveLocation)
                    $scope.saveLocation();
                else
                    $scope.saving = false;
            });
    };

    $scope.openLocation = function (location) {
        if (!$scope.saving) {
            if (location) {
                $scope.data.location = {
                    id: location.id,
                    latitude: location.latitude,
                    longitude: location.longitude,
                    altitude: location.altitude,
                    address: location.address,
                    location: location.location
                };
            } else {
                $scope.data.location = {
                    id: 'new',
                    date: $rootScope.newDate()
                };
            }
            $('#modalLocation').modal('show');
        }
    };

    $scope.saveLocation = function () {
        $scope.saving = true;
        if ($scope.id == 'new') {
            $scope.save();
        } else {
            var id = $scope.data.location.id;
            delete $scope.data.location.id;
            $scope.data.location.latitude = Math.round($scope.data.location.latitude * 1000000) / 1000000;
            $scope.data.location.longitude = Math.round($scope.data.location.longitude * 1000000) / 1000000;
            resources.saveTrapLocation(id, $scope.id, $scope.data.location)
                .success(function (data) {
                    resources.getTrapLocations($scope.id)
                        .success(function (data) {
                            $scope.data.locations = data;
                            $scope.saving = false;
                            $('#modalLocation').modal('hide');
                        });
                });
        }
    };

    $scope.newTrap = function () {
        $scope.id = 'new';
        $scope.data.trap = { enabled: true };
        $scope.data.locations = [];
    };

    $scope.load();
}]);