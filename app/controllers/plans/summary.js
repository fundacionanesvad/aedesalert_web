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
    $stateProvider.state('app.plans.summary', {
        url: "/summary/{id}",
        templateUrl: "views/plans/summary.html",
        controller: 'PlansSummaryController',
        label: 'Registro consolidado',
        icon: 'glyphicon glyphicon-calendar'
    });
}]);

app.controller('PlansSummaryController', ['$scope', '$rootScope', '$stateParams', '$state', 'resources', '$q', 'filterFilter', '$timeout', function ($scope, $rootScope, $stateParams, $state, resources, $q, filterFilter, $timeout) {

    $scope.view = {
        loading: true,
        saving: false,
        tab: -1,
        alert: ''
    };

    $scope.data = {
        plan: {},
        users: [],
        areas: [],
        codes: [],
        samples: 0,
        house: {},
        area: {},
        sample: {}
    };

    $scope.load = function () {
        var calls = [resources.getPlan($stateParams.id), resources.getUsers()];
        $q.all(calls)
            .then(function (response) {
                $scope.data.plan = response[0].data;
                $scope.data.users = response[1].data;
                var requests = [];
                $scope.data.plan.areas.forEach(function (area) {
                    requests.push(resources.getArea(area.id));
                    requests.push(resources.getAreaHouses(area.id));
                });
                $q.all(requests)
                    .then(function (response) {
                        var index = 0;
                        $scope.data.plan.areas.forEach(function (item) {
                            var area = response[index++].data;
                            area.houses = response[index++].data;
                            area.id = item.id;
                            area.substitute = item.substitute;
                            area.visits = {
                                areaId: item.id,
                                housesFocus: 0,
                                housesInspected: 0,
                                housesClosed: 0,
                                housesReluctant: 0,
                                housesAbandoned: 0,
                                housesReconverted: 0,
                                housesTreated: 0,
                                housesDestroyed: 0,
                                people: 0,
                                larvicide: 0,
                                febriles: 0,
                                listInventories: [
                                    { inspected: 0, focus: 0, treated: 0, destroyed: 0, containerId: 4001 },
                                    { inspected: 0, focus: 0, treated: 0, destroyed: 0, containerId: 4002 },
                                    { inspected: 0, focus: 0, treated: 0, destroyed: 0, containerId: 4003 },
                                    { inspected: 0, focus: 0, treated: 0, destroyed: 0, containerId: 4004 },
                                    { inspected: 0, focus: 0, treated: 0, destroyed: 0, containerId: 4005 },
                                    { inspected: 0, focus: 0, treated: 0, destroyed: 0, containerId: 4007 },
                                    { inspected: 0, focus: 0, treated: 0, destroyed: 0, containerId: 4006 },
                                    { inspected: 0, focus: 0, treated: 0, destroyed: 0, containerId: 4008 },
                                    { inspected: 0, focus: 0, treated: 0, destroyed: 0, containerId: 4009 },
                                    { inspected: 0, focus: 0, treated: 0, destroyed: 0, containerId: 4010 }
                                ],
                                listSamples: []
                            };
                            $scope.data.areas.push(area);
                        });
                        $scope.generateCodes();
                        $scope.view.loading = false;
                    });
            });
    };

    $scope.generateCodes = function () {
        var numSamples = 20;
        var codeIni = (numSamples * $stateParams.id) - (numSamples - 1);
        for (var i = 0 ; i < numSamples ; i++) {
            var code = {
                code: ('00000' + codeIni.toString(16)).slice(-6).toUpperCase(),
                status: 0
            }
            codeIni++;
            $scope.data.codes.push(code);
        }
    };

    $scope.getCode = function () {
        for (var i = 0; i < $scope.data.codes.length; i++) {
            if ($scope.data.codes[i].status == 0) {
                $scope.data.codes[i].status = 1;
                $scope.data.samples++;
                return $scope.data.codes[i].code;
            }
        }
    };

    $scope.resetCode = function (code) {
        for (var i = 0; i < $scope.data.codes.length; i++) {
            if ($scope.data.codes[i].code == code) {
                $scope.data.codes[i].status = 0;
                $scope.data.samples--;
                break;
            }
        }
    };

    $scope.guid = function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
              .toString(16)
              .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    };

    $scope.addSample = function (area, index) {
        var containerId = area.visits.listInventories[index].containerId;
        var focus = area.visits.listInventories[index].focus;
        var samples = 0;
        area.visits.listSamples.forEach(function (sample) {
            if (sample.containerId == containerId)
                samples++;
        });
        if ($scope.data.samples - samples + focus > 20) {
            area.visits.listInventories[index].focus = samples;
            $scope.view.alert = 'No se pueden crear más de 20 muestras.';
            $('#modalAlert').modal('show');
        } else if (samples < focus) {
            for (var i = 0; i < (focus - samples) ; i++) {
                var sample = {
                    containerId: containerId,
                    sample: { uuid: $scope.guid(), code: $scope.getCode(), phases: [5001] },
                    house: { uuid: '', streetName: '', streetNumber: '' }
                };
                area.visits.listSamples.push(sample);
            }
        } else if (samples > focus) {
            area.visits.listInventories[index].focus = samples;
            $scope.view.alert = 'Elimine primero la muestra.';
            $('#modalAlert').modal('show');
        }
    };

    $scope.changePhase = function (sample, phase) {
        var index = sample.sample.phases.indexOf(phase);
        if (index == -1)
            sample.sample.phases.push(phase);
        else
            sample.sample.phases.splice(index, 1);
    };   

    $scope.confirmDeleteSample = function (area, sample) {
        $scope.deleteItem = {
            area: area,
            sample: sample
        };
        $('#modalDelete').modal('show');
    };

    $scope.deleteSample = function () {
        $scope.$apply(function () {
            var area = $scope.deleteItem.area;
            $scope.resetCode($scope.deleteItem.sample.sample.code);
            var index = area.visits.listSamples.indexOf($scope.deleteItem.sample);
            area.visits.listSamples.splice(index, 1);
            area.visits.listInventories.forEach(function (inventory) {
                if (inventory.containerId == $scope.deleteItem.sample.containerId)
                    inventory.focus--;
            });
        });
        $('#modalDelete').modal('hide');
    };

    $scope.editHouse = function (area, sample) {
        $scope.data.area = area;
        $scope.data.sample = sample;
        $scope.data.house = {
            uuid: sample.house.uuid,
            streetName: sample.house.streetName,
            streetNumber: sample.house.streetNumber
        };
        $('#modalDataHouse').modal('show');
    };

    $scope.selectStreetName = function (streetName) {
        $scope.data.house.uuid = '';
        $scope.data.house.streetName = streetName;
        $scope.data.house.streetNumber = '';
    };

    $scope.selectHouse = function (house) {
        $scope.data.house.uuid = house.uuid;
        $scope.data.house.streetName = house.streetName;
        $scope.data.house.streetNumber = house.streetNumber;
    };

    $scope.addNewStreet = function () {
        $scope.data.house.uuid = '';
        $scope.data.house.streetName = '';
        $scope.data.house.streetNumber = '';
        $('#modalDataHouse').modal('hide');
        $('#modalHouse').modal('show');
        $timeout(function () {
            $("#streetName").focus();
        }, 500);
    };

    $scope.addNewNumber = function () {
        $scope.data.house.uuid = '';
        $scope.data.house.streetNumber = '';
        $('#modalDataHouse').modal('hide');
        $('#modalHouse').modal('show');
        $timeout(function () {
            $("#streetNumber").focus();
        }, 500);
    };

    $scope.addHouse = function () {
        $scope.data.house.uuid = $scope.guid();
        $scope.data.area.houses.push($scope.data.house);
        $scope.selectHouse($scope.data.house);
        $('#modalHouse').modal('hide');
        $('#modalDataHouse').modal('show');
    };

    $scope.saveDataHouse = function () {
        $scope.data.sample.house = $scope.data.house;
    };

    $scope.checkSummary = function () {
        if ($scope.validateData()) {
            $('#modalConfirmSave').modal('show');
        } else {
            $scope.view.alert = 'Debe completar los datos de vivienda para todas las muestras';
            $('#modalAlert').modal('show');
        }
    };

    $scope.validateData = function () {
        var valid = true;
        $scope.data.areas.forEach(function (area) {
            area.visits.listSamples.forEach(function (sample) {
                if (sample.house.uuid == '')
                    valid = false;
            });
        });
        return valid;
    };

    $scope.saveSummary = function () {
        $scope.view.saving = true;
        var visits = [];
        $scope.data.areas.forEach(function (area) {
            visits.push(area.visits);
        });
        resources.saveSummaryPlan($stateParams.id, visits)
            .then(function (data) {
                $('#modalConfirmSave').modal('hide');
                $timeout(function () {
                    if ($rootScope.checkAccess("PLANS_VIEW"))
                        $state.go('app.plans.list');
                    else
                        $state.go('app.inspections.detail', { id: $scope.data.plan.inspectionId });
                }, 500);
            });
    };

    $scope.load();
}]);