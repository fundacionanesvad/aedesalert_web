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
    $stateProvider.state('app.plans.detail', {
        url: "/detail/{id}",
        templateUrl: "views/plans/detail.html",
        controller: 'PlansDetailController',
        label: 'Registro visitas plan manual',
        icon: 'glyphicon glyphicon-calendar'
    });
}]);

app.controller('PlansDetailController', ['$scope', '$rootScope', '$stateParams', '$state', 'resources', '$q', 'filterFilter', '$timeout', 'NgTableParams','$filter', function ($scope, $rootScope, $stateParams, $state, resources, $q ,filterFilter, $timeout, NgTableParams, $filter) {
    
    $scope.view = {loading: true,saving: false,deleting: false,tab: 1};

    $scope.modalView = {saving: false};
    $scope.data = {
        plan: {},
        inspection:null,
        larvicide: {},
        area: null,
        areas: [],
        visit: null,
        visits: [],
        house: null,
        codes: [],
        address : {},
        newAddress: { streetName: '', streetNumber: '' },
        schedule : []
    };
    $scope.textAlert = '';
    $scope.samplesError = '';

    $scope.tableParamsVisits = new NgTableParams({
        page: 1,
        count: 10,
        sorting: { houseNumber: "desc" }
    }, {
        getData: function ($defer, params) {
            var args = { filter: params.filter(), sorting: params.sorting(), count: params.count(), page: params.page() };
            resources.getPlanVisitListTab($stateParams.id, args).success(function (data) {
                console.log(data);
                params.total(data.count);
                $scope.total = data.count;
                $scope.view.loading = false;
                $scope.view.deleting = false;
                $defer.resolve(data.visits);

            });
            $scope.load();
        }
    });

    
    $scope.generateCodes = function () {
        var samples = 20;
        var number = (samples * $stateParams.id) - (samples - 1);
        for (var i = 0 ; i < samples ; i++) {
            var code = {
                code: ('00000' + number.toString(16)).slice(-6).toUpperCase(),
                status: 0
            };
            number++;
            $scope.data.codes.push(code);
        }
    };

    $scope.getCode = function () {
        for (var i = 0; i < $scope.data.codes.length; i++) {
            if ($scope.data.codes[i].status == 0) {
                $scope.data.codes[i].status = 1;
                return $scope.data.codes[i].code;
            }
        }
        return null;
    };

    $scope.resetCode = function (code) {
        for (var i = 0; i < $scope.data.codes.length; i++) {
            if ($scope.data.codes[i].code == code) {
                $scope.data.codes[i].status = 0;
                return;
            }
        }
    };

    $scope.resetCodes = function () {
        for (var i = 0; i < $scope.data.visits.length; i++) {
            var visit = $scope.data.visits[i];
            for (var j = 0; j < visit.listInventories.length; j++) {
                var inventory = visit.listInventories[j];
                for (var k = 0; k < inventory.listSyncSample.length; k++) {
                    var sample = inventory.listSyncSample[k];
                    $scope.ckeckCode(sample.code);
                }
            }
        }
    };

    $scope.ckeckCode = function (code) {
        for (var i = 0; i < $scope.data.codes.length; i++) {
            if ($scope.data.codes[i].code == code) {
                $scope.data.codes[i].status = 1;
                return;
            }
        }
    };
    
    $scope.load = function () {
        
        resources.getPlanDetail($stateParams.id)
            .success(function (data) {
                $scope.data.plan = data;
                $scope.data.areas = data.areas;
                $scope.data.larvicide = data.larvicide;
                $scope.loadVisits();
                resources.getInspection($scope.data.plan.inspectionId)
               .success(function (data) {
                   $scope.data.inspection = data;
                           resources.getSchedule($scope.data.inspection.scheduleId)
                        .success(function (data) {
                            $scope.data.schedule = data;
                        });
               });
            });
    };
     
    
    $scope.loadVisits = function () {
        resources.getPlanVisitList($stateParams.id)
            .success(function (data) {
                $scope.data.visits = data;      
                $scope.data.visit = null;  
                $scope.generateCodes();
                $scope.resetCodes();
                $scope.view.loading = false;
                $scope.view.saving = false;
                $scope.view.deleting = false;
                $('#modalDelete').modal('hide');
                $('#modalSamples').modal('hide');
                console.log("data");
                console.log($scope.data);
            });
    };

    $scope.sumSamples = function (inventories) {
        var i = 0;
        var numSamples = 0;
        for (i ; i < inventories.length; i++) {
            numSamples += inventories[i].listSyncSample.length;
        }
        return numSamples;
    };
    
    $scope.confirm = function (item) {
        $scope.deleteItem = item.visitUuid;
        $('#modalDelete').modal('show');
    };
    
    $scope.delete = function () {
        $scope.view.deleting = true;
        resources.deleteVisit($scope.deleteItem)
            .success(function (data) {
                $scope.view.deleting = false;
                $('#modalDelete').modal('hide');
                
            });
    };
    
    function guid() {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
              .toString(16)
              .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
    };

    $scope.addVisit = function () {
        $scope.showVisit(null);
    };
   
    $scope.showVisit = function (visit) {
        if (visit != null) {
            for (var i = 0; i < $scope.data.visits.length; i++) {
                if ($scope.data.visits[i].visit.uuid == visit.visitUuid) {
                    visit = $scope.data.visits[i];
                }
            }
        }
        console.log("lalala");
        if (visit) {
            $scope.data.visit = {};
            angular.copy(visit, $scope.data.visit);
            for (var i = 0; i < $scope.data.areas.length; i++) {
                var area = $scope.data.areas[i];                
                if (area.id == visit.house.areaId) {
                    $scope.data.area = area;
                    break;
                }
            }
        } else {
            $scope.data.visit = {
                house: {
                    uuid: '',
                    streetName: '',
                    streetNumber: '',
                    areaId: 0,
                    personsNumber: 0
                },
                visit: {
                    uuid: null,
                    feverish: 0,
                    resultId: 0
                },
                listInventories: $scope.buildInventories()
            };
        }  
    };
    
    $scope.buildInventories = function () {
        var items = [];
        for (var i = 0; i < $rootScope.tables[4].length; i++) {
            items.push({
                uuid: guid(),
                inspected: 0,
                focus: 0,
                treated: 0,
                packet: 0,
                destroyed: 0,
                containerId: $rootScope.tables[4][i].id,
                visitUuid: '',
                listSyncSample: []
            });
        }
        return items;
    };

    $scope.selectArea = function (area) {
        $scope.data.area = area;
        $scope.data.visit.house = {
            areaId: area.id,
            streetName: '',
            streetNumber: ''
        };
    };

    $scope.selectStreetName = function (streetName) {

        $scope.data.visit.house.streetName = streetName;
        $scope.data.visit.house.streetNumber = '';
    };

    $scope.selectHouse = function (house) {
        $scope.data.visit.house.uuid = house.uuid;
        $scope.data.visit.house.streetName = house.streetName;
        $scope.data.visit.house.streetNumber = house.streetNumber;
    };

    $scope.addStreet = function () {
        $scope.data.house = {
            streetName: '',
            streetNumber: ''
        };
        $('#modalHouse').modal('show');
        $timeout(function () {
            $("#streetName").focus();
        }, 500);
    };

    $scope.addNumber = function () {
        $scope.data.house = {
            streetName: $scope.data.visit.house.streetName,
            streetNumber: ''
        };

        $('#modalHouse').modal('show');
        $timeout(function () {
            $("#streetNumber").focus();
        }, 500);
    };

    $scope.addHouse = function () {
        for (var index = 0; index < $scope.data.area.houses.length; index++) {
            var house = $scope.data.area.houses[index];
            if (house.streetName == $scope.data.house.streetName && house.streetNumber == $scope.data.house.streetNumber) {
                $('#modalHouse').modal('hide');
                $scope.selectHouse(house);
                return;
            }
        }
        var house = {
            uuid: null,
            streetName: $scope.data.house.streetName,
            streetNumber: $scope.data.house.streetNumber,
            areaId: $scope.data.area.id,
            personsNumber: 0
        };
        $scope.data.area.houses.push(house);
        $('#modalHouse').modal('hide');
        $scope.selectHouse(house);
    };

    $scope.changeState = function () {
        angular.forEach($scope.data.visit.listInventories, function (inventory, key) {
            angular.forEach(inventory.listSyncSample, function (sample, key) {
                $scope.resetCode(sample.code);
            });
        });
        $scope.data.visit.listInventories = $scope.buildInventories();
        //$scope.data.visit.house.personsNumber = 0;
        //$scope.data.visit.visit.feverish = 0;
    };

    $scope.updateSamples = function (inventory) {
        var limit = false;
        var samples = inventory.listSyncSample.length;
        if (samples > inventory.focus) {
            for (var index = inventory.focus; index < samples; index++) {
                var sample = inventory.listSyncSample[index];
                $scope.resetCode(sample.code);
            }
            inventory.listSyncSample.splice(inventory.focus, samples - inventory.focus);
        } else if (samples < inventory.focus) {
            for (var index = samples; index < inventory.focus; index++) {
                var code = $scope.getCode();
                if (code == null) {
                    inventory.focus = index;
                    limit = true;
                    
                    break;
                } else {
                    inventory.listSyncSample.push({
                        uuid: null,
                        code: code,
                        phases: []
                    });
                }
            }
        }
        
        if (limit) {
            $scope.textAlert = 'No puede registrar más de 20 focos/muestras';
            $('#modalAlert').modal('show');
        }
    };

    $scope.validateVisit = function () {
        
        if ($scope.data.visit.house.streetNumber == '') {
            $scope.textAlert = 'Los datos de la vivienda son obligatorios';
            $('#modalAlert').modal('show');
        } else if ($scope.data.visit.visit.resultId == 0) {
            $scope.textAlert = 'Indique el resultado de la visita';
            $('#modalAlert').modal('show');
        } else if ($scope.validateTreatedPackets()) {
            $scope.textAlert = 'Indique la cantidad de larvicida para todos los recipientes tratados';
            $('#modalAlert').modal('show');
        } else if ($scope.validatePackets()) {
            $scope.textAlert = 'No puede haber larvicida sin tratamiento';
            $('#modalAlert').modal('show');
        }else if ($scope.validateFocus()) {
            $scope.textAlert = 'No puede haber mas focos que inspecciones realizadas';
            $('#modalAlert').modal('show');
        } else if ($scope.validateDestroyedTreated()) {
            $scope.textAlert = 'La suma entre destruido y tratado no puede superar al numero de inspeciones realizadas';
            $('#modalAlert').modal('show');
        }else {
            if ($scope.hasSamples()) {
                $scope.showSamples();
            } else {
                $scope.saveVisit();
            }
        }
        
    };

    $scope.saveVisit = function () {
        $scope.view.saving = true;
        var uuid = $scope.data.visit.visit.uuid;
        if (uuid == null)
            uuid = 'new';
        delete $scope.data.visit.visit.uuid;
        resources.savePlanVisit($stateParams.id, uuid, $scope.data.visit)
            .success(function (data) {
                $scope.loadVisits();
                $scope.tableParamsVisits.reload();
            });
    };

    $scope.hasSamples = function () {
        for (var i = 0; i < $scope.data.visit.listInventories.length; i++) {
            if ($scope.data.visit.listInventories[i].focus > 0)
                return true;
        }
        return false;
    };

    $scope.validateTreatedPackets = function () {
        for (var i = 0; i < $scope.data.visit.listInventories.length; i++) {
            if ($scope.data.visit.listInventories[i].treated > 0 && $scope.data.visit.listInventories[i].packet == 0)
                return true;
        }
        return false;
    };
    $scope.validatePackets = function () {
        for (var i = 0; i < $scope.data.visit.listInventories.length; i++) {
            if ($scope.data.visit.listInventories[i].treated == 0 && $scope.data.visit.listInventories[i].packet > 0)
                return true;
        }
        return false;
    };
    $scope.validateFocus = function () {
        for (var i = 0; i < $scope.data.visit.listInventories.length; i++) {
            if ($scope.data.visit.listInventories[i].focus > $scope.data.visit.listInventories[i].inspected)
                return true;
        }
        return false;
    };
    $scope.validateDestroyedTreated = function () {
        for (var i = 0; i < $scope.data.visit.listInventories.length; i++) {
            if (($scope.data.visit.listInventories[i].destroyed + $scope.data.visit.listInventories[i].treated) > $scope.data.visit.listInventories[i].inspected)
                return true;
        }
        return false;
    };
    $scope.showSamples = function () {
        $scope.checkMissingPhases();
        $('#modalSamples').modal({
            backdrop: 'static',
            keyboard: false,
            show: true
        });
    };

    $scope.changePhase = function (sample, phase) {
        var index = sample.phases.indexOf(phase);
        if (index == -1) 
           sample.phases.push(phase);
        else
            sample.phases.splice(index, 1);
        $scope.checkMissingPhases();

    };

    $scope.checkMissingPhases = function () {

        for (var i = 0; i < $scope.data.visit.listInventories.length; i++) {
            var inventory = $scope.data.visit.listInventories[i];
            for (var j = 0; j < inventory.listSyncSample.length; j++) {
                if (inventory.listSyncSample[j].phases.length == 0) {
                    $scope.samplesError = 'Debe seleccionar por lo menos una fase para cada muestra';
                    return;
                }
            }
        }
        $scope.samplesError = '';
    };

    $scope.cancelVisit = function () {
        $scope.changeState();
        $scope.data.visit = null;
    };

    $scope.closePlan = function () {
        $scope.view.saving = true;
        resources.closePlan($stateParams.id)
            .success(function (data) {
                $('#modalConfirm').modal('hide');
                $timeout(function () {
                    if ($rootScope.checkAccess("PLANS_VIEW"))
                        $state.go('app.plans.list');
                    else
                        $state.go('app.inspections.detail', { id: $scope.data.plan.inspectionId });
                }, 500);
            });
    };


    $scope.editStreetName = function (street, houses) {
        $scope.a = houses;
        $scope.data.address.streetName = street;
        $scope.data.newAddress.streetName = street;
        $scope.data.address.uuid = houses[0].uuid;

        $('#modalEditStreetName').modal({
            backdrop: 'static',
            keyboard: false,
            show: true
        });
        $timeout(function () {
            $("#streetNameEdit").focus();
        }, 500);

    };


    $scope.saveNewStreetName = function () {
        $scope.modalView.saving = true;
        angular.forEach($scope.a, function (item, key) {
            item.streetName = $scope.data.newAddress.streetName;
        });
        if ($scope.data.address.uuid != null) {
            $scope.updateName();           
        } else {
            $('#modalEditStreetName').modal('hide');
            $scope.modalView.saving = false;
        }
    }


    $scope.updateName = function () {
        $scope.data.newAddress.streetNumber = '';
        resources.updateAddress($scope.data.address.uuid, $scope.data.newAddress)
            .success(function (data) {
                $scope.selectStreetName($scope.data.newAddress.streetName);
                resources.getPlanVisitList($stateParams.id)
                                  .success(function (data) {
                                      $scope.data.visits = data;

                                  });
                $('#modalEditStreetName').modal('hide');
                $scope.modalView.saving = false;
            });
    }


    $scope.editStreetNumber = function (item) {
        $scope.data.address = item;
        $scope.data.newAddress.streetNumber = item.streetNumber;
        $('#modalEditStreetNumber').modal({
            backdrop: 'static',
            keyboard: false,
            show: true
        });
        $timeout(function () {
            $("#streetNumberEdit").focus();
        }, 500);

    };


    $scope.saveNewStreetNumber = function () {
        $scope.modalView.saving = true;
        if ($scope.data.address.uuid != null) {
            $scope.updateNumber();
        } else {
            $scope.data.address.streetNumber = $scope.data.newAddress.streetNumber;
            $scope.selectHouse($scope.data.address);
            $('#modalEditStreetNumber').modal('hide');
            $scope.modalView.saving = false;
        }
    }



    $scope.updateNumber = function () {
        $scope.data.newAddress.streetName = '';
        resources.updateAddress($scope.data.address.uuid, $scope.data.newAddress)
            .success(function (data) {
                $scope.data.address.streetNumber = $scope.data.newAddress.streetNumber;
                $scope.selectHouse($scope.data.address);
                
                resources.getPlanVisitList($stateParams.id)
                   .success(function (data) {
                       $scope.data.visits = data;
                       
                   });
                $('#modalEditStreetNumber').modal('hide');
                $scope.modalView.saving = false;
            });
    }
    
}]);