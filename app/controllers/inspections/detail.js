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
    $stateProvider.state('app.inspections.detail', {
        url: "/{id}",
        templateUrl: "views/inspections/detail.html",
        controller: 'InspectionsDetailController',
        label: 'Inspecciones',
        icon: 'glyphicon glyphicon-time'
    });
}]);

app.controller('InspectionsDetailController', ['$scope', '$rootScope', '$stateParams', '$state', 'resources', '$q', 'filterFilter', 'uiGmapGoogleMapApi', 'uiGmapIsReady', 'download', '$timeout', 'NgTableParams', '$filter', function ($scope, $rootScope, $stateParams, $state, resources, $q, filterFilter, uiGmapGoogleMapApi, uiGmapIsReady, download, $timeout, NgTableParams, $filter) {

    $scope.view = { loading: true, saving: false, tab: 1, ready: 0 };
    $scope.samplesTypes = [{ id: 1, title: 'Si' }, { id: 0, title: 'No' }];
    $scope.feverishTypes = [{ id: 1, title: 'Si' }, { id: 0, title: 'No' }];
    $scope.states = [{ id: 7001, title: 'Planificado' }, { id: 7002, title: 'En curso' }, { id: 7003, title: 'Terminado' }, { id: 7004, title: 'Cancelado' }, { id: 7005, title: 'Pendiente Procesar' }];
    $scope.results = [{ id: 2001, title: 'Inspecionada' }, { id: 2002, title: 'Cerrada' }, { id: 2003, title: 'Renuente' }, { id: 2004, title: 'Abandonada' }];
    $scope.data = {
        plans: [],
        plansToDelete: [],
        area: { id: 0, name: '', childs: [] },
        users: [],
        plan: null,
        sectors: [],
        blocks: [],
        brigades: [],
        larvicides: [],
        days: [],
        schedule: []
    };
    $scope.map = {
        config: {
            center: { latitude: -8.0625017, longitude: -79.0550047 },
            zoom: 8,
            options: { mapTypeId: google.maps.MapTypeId.ROADMAP }
        },
        hoveredBlock: {},
        hoveredSector: {}
    };
    $scope.textAlert = '';
    $scope.requiredField = false;
    $scope.picker = { opened: false, minDate: null };
    $scope.permissionToSend = $rootScope.checkAccess("PLANS_SEND");
    $scope.today = $rootScope.newTimeStamp();

    $scope.item = { date: null, userId: null };
    $scope.procesing = false;
    if ($rootScope.checkAccess('VISITS_VIEW')) {
        $scope.tableParamsVisits = new NgTableParams({
            page: 1,
            count: 10,
            sorting: { date: "desc" }
        }, {
            getData: function ($defer, params) {
                $scope.loading = true;
                var args = { filter: params.filter(), sorting: params.sorting(), count: params.count(), page: params.page() };
                resources.getInspectionVisits($stateParams.id, args).success(function (data) {
                    params.total(data.count);
                    $scope.total = data.count;
                    $scope.loading = false;
                    $defer.resolve(data.visits);
                    $scope.totalVisits = data.count;
                });
            }
        });
    }

    $scope.load = function () {
        resources.getInspection($stateParams.id)
            .success(function (data) {
                $scope.data.inspection = data;
                $scope.loadDetail();
            });
    };

    $scope.loadDetail = function () {
        var calls = [resources.getInspectionPlans($stateParams.id)];
        calls.push(resources.getUsersInspection($scope.data.inspection.areaId));
        calls.push(resources.getAreaChilds($scope.data.inspection.areaId));
        calls.push(resources.getAreaSectors($scope.data.inspection.areaId));
        calls.push(resources.getInspectionBlocks($stateParams.id));
        calls.push(resources.getSchedule($scope.data.inspection.scheduleId));
        calls.push(resources.getSamplesInspection($stateParams.id));
        calls.push(resources.getLarvicide($scope.data.inspection.larvicideId));
        calls.push(resources.getUsersInspectionAdd($scope.data.inspection.areaId));

        $q.all(calls)
            .then(function (data) {
                $scope.data.plans = data[0].data;
                $scope.data.users = data[1].data;
                $scope.data.area = data[2].data;
                $scope.data.sectors = data[3].data;
                $scope.data.blocks = data[4].data;
                $scope.data.schedule = data[5].data;              
                $scope.data.samples = data[6].data;
                $scope.data.larvicides = data[7].data;
                $scope.data.usersAdd = data[8].data;
                if ($scope.data.schedule.reconversionScheduleId != null) {
                    resources.getSchedule($scope.data.schedule.reconversionScheduleId)
                    .then(function (dato) {
                        $scope.data.recschedule = dato.data;
                    })
                }
                if ($scope.data.inspection.typeId == 1002)
                    $scope.data.inspection.interval = 1;
                else
                    $scope.data.inspection.interval = Math.round($scope.data.area.houses / $scope.data.inspection.inspectionSize);


                console.log("data.area.houses=" + $scope.data.area.houses + "//data.inspection.inspectionSize=" + $scope.data.inspection.inspectionSize);
                console.log(Math.round($scope.data.area.houses / $scope.data.inspection.inspectionSize));
                console.log($scope.data.area.houses / $scope.data.inspection.inspectionSize);


                $scope.data.inspection.progress = 0;
                $scope.data.inspection.visits = 0;
                $scope.picker.minDate = $rootScope.newDate($scope.data.inspection.startDate);
                $scope.picker.maxDate = $rootScope.newDate($scope.data.inspection.finishDate);
                $scope.view.loading = false;
                $scope.view.ready++;
                $scope.initializeProgress();
                $scope.initializeMap();
                $scope.completePlans();
                $scope.total = $scope.data.plans.planSize;
                $scope.loading = false;

                $scope.tableParamsPlan = new NgTableParams({
                    page: 1,
                    count: 10,
                    sorting: { date: "desc" }
                }, {
                    dataset: $scope.data.plans,
                    filterOptions: { filterFn: columnSpecificFilter }
                });

                function columnSpecificFilter(data, filterValues) {
                    if (filterValues.area != null) {
                        data = _.filter(data, function (t) {
                            return _.some(t.areas, function (te) {
                                return te == filterValues.area;
                            });
                        });
                    };
                    delete filterValues.area;
                    data = $filter("filter")(data, filterValues);
                    return data;
                }
            });
    };


    $scope.onAreaFilterChange = function () {
        $scope.tableParamsPlan.filter()['area'] = "";
    };

    $scope.onAreaFilterSelect = function (item, model, label) {
        $scope.tableParamsPlan.filter()['area'] = item.id;
    };

    $scope.completePlans = function () {
        $scope.data.plans.forEach(function (plan) {
            $scope.data.users.forEach(function (user) {
                if (user.id == plan.userId)
                    plan.userName = user.name;
            });
            $scope.states.forEach(function (state) {
                if (plan.stateId == state.id)
                    plan.stateName = state.title;
            });
        });
    };

    $scope.convert = function (coords) {
        var path = [];
        if (coords != null) {
            JSON.parse(coords).forEach(function (coord) {
                var point = new google.maps.LatLng(coord.latitude, coord.longitude);
                path.push(point);
                $scope.map.bounds.extend(point);
            });
        }
        return path;
    };

    uiGmapIsReady.promise().then(function (instances) {
        instances.forEach(function (instance) {
            $scope.map.instance = instance.map;
        });
        $scope.view.ready++;
        $scope.initializeMap();
    });

    $scope.initializeMap = function () {
        if ($scope.view.ready > 1) {
            $scope.map.bounds = new google.maps.LatLngBounds();

            //Dibuja los sectores
            for (var i = 0; i < $scope.data.sectors.length; i++) {
                var sector = $scope.data.sectors[i];
                if (sector.coords) {
                    var polygon = new google.maps.Polygon({
                        paths: $scope.convert(sector.coords),
                        strokeColor: '#3899d4',
                        strokeOpacity: 0.5,
                        strokeWeight: 2,
                        fillColor: '#3899d4',
                        fillOpacity: 0,
                        id: sector.id,
                        sectorIndex: i,
                        zIndex: 10,
                        selected: false
                    });
                    polygon.setMap($scope.map.instance);
                    sector.polygon = polygon;
                    google.maps.event.addListener(polygon, 'mouseover', function (event) {
                        var sector = $scope.data.sectors[this.sectorIndex];
                        $scope.$apply(function () {
                            $scope.hoverSector(sector);
                        });
                    });
                    google.maps.event.addListener(polygon, 'mouseout', function (event) {
                        $scope.$apply(function () {
                            $scope.hoverSector({});
                        });
                    });
                }
            }

            //Dibuja las manzanas
            $scope.data.area.reconversions = 0;
            for (var i = 0; i < $scope.data.blocks.length; i++) {
                var block = $scope.data.blocks[i];
                if ($scope.data.schedule.reconversionScheduleId) {
                    $scope.data.area.reconversions += block.reconversions;
                    block.houses = block.reconversions;
                }
                if (block.coords) {
                    var polygon = new google.maps.Polygon({
                        paths: $scope.convert(block.coords),
                        strokeColor: '#000',
                        strokeOpacity: 0.5,
                        strokeWeight: 2,
                        fillColor: '#000',
                        fillOpacity: 0,
                        id: block.id,
                        blockIndex: i,
                        selected: $scope.data.plan != null && $scope.data.plan.blocks.indexOf(block) != -1,
                        plans: block.plans,
                        zIndex: 100
                    });
                    polygon.setMap($scope.map.instance);
                    block.polygon = polygon;
                    $scope.setPolygonColor(polygon);
                    google.maps.event.addListener(polygon, 'click', function (event) {
                        if ($scope.data.inspection.stateId <= 3002) {
                            if ($scope.data.plan == null) {
                                $scope.alert('Debe primero selectionar una fecha y un inspector');
                            } else if ($scope.data.plan.stateId == 7001) {
                                var polygon = this;
                                $scope.$apply(function () {
                                    $scope.togglePolygon(polygon, true);
                                });
                            } else {
                                $scope.alert('El plan no se puede modificar');
                            }
                        }
                    });
                    google.maps.event.addListener(polygon, 'mouseover', function (event) {
                        var block = $scope.data.blocks[this.blockIndex];
                        var sector = $scope.data.sectors[block.sectorIndex];
                        $scope.$apply(function () {
                            $scope.hoverBlock(block);
                            var name = block.name;
                            name = name.replace(sector.name, '<b>' + sector.name + '</b>');
                            if (block.reconversions == 1)
                                name += '<br/><i>' + block.reconversions + ' vivienda cerrada/renuente/abandonada</i>';
                            else if (block.reconversions > 1)
                                name += '<br/><i>' + block.reconversions + ' viviendas cerradas/renuentes/abandonadas</i>';
                            else
                                name += '<br/><i>' + block.houses + ' viviendas</i>';
                            if ($scope.tooltip != null) {
                                $scope.tooltip.show();
                                $scope.tooltip.html(name);
                            }
                        });
                    });
                    google.maps.event.addListener(polygon, 'mouseout', function (event) {
                        $scope.$apply(function () {
                            $scope.hoverBlock({});
                            if ($scope.tooltip != null)
                                $scope.tooltip.hide();
                        });
                    });
                }
            }
            if ($scope.data.schedule.reconversionScheduleId)
                $scope.data.inspection.inspectionSize = $scope.data.area.reconversions;
            console.log("$scope.data.area.reconversions =" + $scope.data.area.reconversions);

            //Dibuja circulo alrededor ovitrampa
            if ($scope.data.inspection.trapLatitude) {
                var center = new google.maps.LatLng($scope.data.inspection.trapLatitude, $scope.data.inspection.trapLongitude);
                var circle = new google.maps.Circle({
                    center: center,
                    radius: 200,
                    fillColor: '#e74c3c',
                    fillOpacity: 0,
                    strokeOpacity: 1,
                    strokeWeight: 2,
                    strokeColor: '#e74c3c',
                    map: $scope.map.instance
                });
                var marker = new google.maps.Marker({
                    position: center,
                    map: $scope.map.instance,
                    icon: '/images/marker-focus.png',
                    title: 'Ovitrampa foco ' + $scope.data.inspection.trapCode + '\nRadio inspección: 200 metros\nSemana ' + $scope.data.inspection.trapWeek + '\nNº Huevos: ' + $scope.data.inspection.trapEggs,
                    circle: circle
                });
                google.maps.event.addListener(marker, 'mouseover', function (event) {
                    this.circle.setOptions({ fillOpacity: 0.5 });
                });
                google.maps.event.addListener(marker, 'mouseout', function (event) {
                    this.circle.setOptions({ fillOpacity: 0 });
                });
                $scope.map.bounds = new google.maps.LatLngBounds();
                $scope.map.bounds.union(circle.getBounds());
            }

            //Activa el instant tooltip
            $scope.tooltip = null;
            $scope.toolTipContainer = $('.gm-style')[0];
            window.onmousemove = function (e) {
                if ($scope.tooltip == null) {
                    var selector = $('#instantTooltip');
                    if (selector.length != 0)
                        $scope.tooltip = selector;
                } else {
                    var scroll = $(document).scrollTop();
                    var offset = $($scope.toolTipContainer).offset();
                    $scope.tooltip.css({ top: (e.clientY + 20 - offset.top + scroll) + 'px', left: (e.clientX + 10 - offset.left) + 'px' });
                }
            };

            //Activa la selección
            $scope.data.plans.forEach(function (plan) {
                console.log(1);
                var areas = plan.areas;
                plan.planSize = 0;
                plan.houses = 0;
                plan.blocks = [];
                plan.areas = [];
                plan.substitutes = [];
                $scope.data.date = plan.date;
                $scope.data.userId = plan.userId;
                $scope.selectPlan();
                areas.forEach(function (area) {
                    if (area.substitute) {
                        if (plan.stateId != 7001) {
                            $scope.data.plan.substitutes.push({
                                id: area.id,
                                pin: area.pin
                            });
                        }
                    } else {
                        $scope.data.blocks.forEach(function (block) {
                            if (block.id == area.id && block.polygon) {
                                $scope.togglePolygon(block.polygon, false);
                            }
                        });
                    }
                });
                if ($scope.data.days.indexOf(plan.date) == -1)
                    $scope.data.days.push(plan.date);
            });

            $scope.data.userId = null;
            if ($scope.data.days.length != 0)
                $scope.selectDate($scope.data.days[0]);

            //Actualiza el mapa y ajusta la zona visible
            $scope.refresh();
        }
    };

    $scope.hoverSector = function (sector) {
        if ($scope.map.hoveredSector.polygon) {
            $scope.map.hoveredSector.polygon.setOptions({
                strokeColor: '#3899d4',
                strokeOpacity: 0.5,
                fillColor: '#3899d4',
                fillOpacity: 0
            });
        }
        if (sector.id) {
            sector.polygon.setOptions({
                strokeColor: '#3899d4',
                strokeOpacity: 1,
                fillColor: '#3899d4',
                fillOpacity: 0.25
            });
        }
        $scope.map.hoveredSector = sector;
    };

    $scope.hoverBlock = function (block) {
        var sector = {};
        if ($scope.map.hoveredBlock.polygon) {
            $scope.setPolygonColor($scope.map.hoveredBlock.polygon);
        }
        if (block.id) {
            block.polygon.setOptions({
                strokeColor: '#000',
                strokeOpacity: 0.75
            });
            sector = $scope.data.sectors[block.sectorIndex];
        }
        $scope.map.hoveredBlock = block;
        $scope.hoverSector(sector);
    };

    $scope.setPolygonColor = function (polygon) {
        var block = $scope.data.blocks[polygon.blockIndex];
        var options = {
            strokeColor: '#000',
            strokeOpacity: 0,
            fillColor: '#000',
            fillOpacity: 0.5
        };
        if (polygon.selected) {
            options.fillOpacity = '0.5';
            if (polygon.plans == 1)
                options.fillColor = '#39a75a';
            else
                options.fillColor = '#00F';
        }
        else if (polygon.plans) {
            options.fillColor = '#000';
            options.fillOpacity = '0.5';
        } else if (block.reconversions) {
            options.fillColor = '#e74c3c';
            options.fillOpacity = '0.5';
        } else {
            options.fillColor = '#000';
            options.fillOpacity = '0.25';
        }
        polygon.setOptions(options);
    };

    $scope.refresh = function () {
        setTimeout(function () {
            google.maps.event.trigger($scope.map.instance, 'resize');
            if (!$scope.map.bounds.isEmpty()) {
                $scope.map.instance.fitBounds($scope.map.bounds);
                /*google.maps.event.addListenerOnce($scope.map.instance, 'bounds_changed', function (event) {
                    $scope.map.instance.setZoom($scope.map.instance.getZoom() + 1);
                });*/
            }
        }, 10);
    };

    $scope.addDay = function () {
        if ($scope.data.day) {
            if ($scope.data.days.indexOf($scope.data.day) == -1)
                $scope.data.days.push($scope.data.day);
            if ($scope.editDay) {
                $scope.data.plans.forEach(function (plan) {
                    if (plan.date == $scope.editDay)
                        plan.date = $scope.data.day;
                });
                $scope.data.days.splice($scope.data.days.indexOf($scope.editDay), 1);
            }
            $scope.selectDate($scope.data.day);
            $('#modalDate').modal('hide');
        } else {
            $scope.requiredField = true;
        }
       
    };

    $scope.editDate = function () {
        $scope.requiredField = false;
        $scope.editDay = $scope.data.date;
        $('#modalDate').modal('show');
        $timeout(function () {
            $scope.data.day = $scope.data.date;
        }, 100);
        
    };

    $scope.openDate = function () {
        $scope.requiredField = false;
        $scope.editDay = null;
        $scope.data.day = null; 
        $('#modalDate').modal('show');

    }

    $scope.userState = function () {
        $scope.procesing = true;
        console.log("comprobar");
        $scope.item.userId = $scope.data.user.id;
        console.log($scope.item.userId, $scope.item.date);
        resources.getUserState($scope.item)
            .success(function (data) { 
                console.log("2d-" + data);
                if (data != "Empty") {
                    $scope.userStateAlert = data;
                    $('#modalBrigade').modal('hide');
                    $('#modalUserStateAlert').modal('show');
                    
                } else {
                    $('#modalBrigade').modal('hide');
                    $scope.addUser();
                    
                }
                $scope.procesing = false;
        });
        
    };
    

    $scope.addUser = function () {
        console.log("añadir");
        if ($scope.data.user.id) {
            if ($scope.data.brigades.indexOf($scope.data.user) == -1) {
                $scope.data.user.planStateId = 7001;
                $scope.data.brigades.push($scope.data.user);

            }
            //$scope.item.userId = $scope.data.user.id;
            //$scope.userState();
            
            $scope.selectUser($scope.data.user.id);
            $('#modalUserStateAlert').modal('hide');
            
        } else {
            $scope.requiredField = true;
        }
        
    };

    $scope.openUser = function () {
        $scope.requiredField = false;
        $scope.data.user = "";
        $('#modalBrigade').modal('show');
        $timeout(function () {
            $("#userId").focus();
        }, 500);
    }

    $scope.selectDate = function (date) {
        $scope.data.date = date;

        $scope.item.date = date;
        //console.log($scope.item.date);
        
        var userId = $scope.data.userId;
        $scope.data.userId = null;
        $scope.data.brigades = [];
        $scope.data.plans.forEach(function (plan) {
            if (plan.date == $scope.data.date) {
                $scope.data.users.forEach(function (user) {
                    if (user.id == plan.userId) {
                        user.planStateId = plan.stateId;
                        if ($scope.data.brigades.indexOf(user) == -1)
                            $scope.data.brigades.push(user);
                        if (user.id == userId)
                            $scope.data.userId = userId;
                    }
                });
            }
        });
        if ($scope.data.userId == null && $scope.data.brigades.length != 0)
            $scope.data.userId = $scope.data.brigades[0].id;
        $scope.selectPlan();
        
    };

    $scope.disableDate = function (date, mode) {
        date.setHours(0, 0, 0, 0);
        var timestamp = $rootScope.toTimeStamp(date);
        return (mode === 'day' && $scope.data.days.indexOf(timestamp) != -1);
    };

    $scope.selectUser = function (userId) {
        $scope.data.userId = userId;
        $scope.selectPlan();
    };

    $scope.selectPlan = function () {
        if ($scope.data.userId != null && $scope.data.date != null) {
            //Recupera el plan si existe
            $scope.data.plan = null;
            $scope.data.plans.forEach(function (plan) {
                if (plan.date == $scope.data.date && plan.userId == $scope.data.userId) {
                    $scope.data.plan = plan;
                }
            });

            //Crea el plan si no existe
            if ($scope.data.plan == null) {
                $scope.data.plan = {
                    userId: $scope.data.userId,
                    inspectionId: $stateParams.id,
                    date: $scope.data.date,
                    stateId: 7001,
                    planSize: 0,
                    houses: 0,
                    houseIni: $scope.data.schedule.typeId == 1002 ? 1 : Math.floor((Math.random() * 10) + 1),
                    houseInterval: $scope.data.inspection.interval,
                    areas: [],
                    substitutes: [],
                    blocks: []
                };
                $scope.data.plans.push($scope.data.plan);
                $scope.reloadTablePlanData();
            }

            //Actualiza el listado de manzanas
            for (var index = 0; index < $scope.data.blocks.length; index++) {
                var block = $scope.data.blocks[index];
                if (block.polygon) {
                    block.polygon.selected = $scope.data.plan.blocks.indexOf(block) != -1;
                    block.polygon.plans = block.plans;
                    $scope.setPolygonColor(block.polygon);
                }
            }
        } else {
            $scope.data.plan = null;
            for (var index = 0; index < $scope.data.blocks.length; index++) {
                var block = $scope.data.blocks[index];
                if (block.polygon) {
                    block.polygon.selected = false;
                    block.polygon.plans = block.plans;
                    $scope.setPolygonColor(block.polygon);
                }
            }
        }
    };

    $scope.reloadTablePlanData = function () {
        $scope.completePlans();
        $scope.tableParamsPlan.reload();
    };

    $scope.confirmDate = function (date) {
        $scope.deleteItem = date;
        $('#deleteDateModal').modal('show');
    };

    $scope.confirmUser = function (user) {
        $scope.deleteItem = user;
        $('#deleteUserModal').modal('show');
    };

    $scope.deleteDate = function () {
        var remove = true;
        var date = $scope.deleteItem;
        $scope.selectDate(date);
        $scope.data.brigades.forEach(function (brigade) {
            if (brigade.planStateId == 7001) {
                $scope.deleteItem = brigade;
                $scope.deleteUser();
            } else {
                remove = false;
            }
        });
        if (remove) {
            $scope.data.days.splice($scope.data.days.indexOf(date), 1);
            $scope.data.userId = null;
            $scope.data.date = null;
            if ($scope.data.days.length != 0)
                $scope.selectDate($scope.data.days[0]);
            $scope.$apply();
        }
        $('#deleteDateModal').modal('hide');
    };

    $scope.deleteUser = function () {
        var id = $scope.data.userId;
        $scope.data.userId = $scope.deleteItem.id;
        $scope.selectPlan();
        $scope.data.blocks.forEach(function (block) {
            if (block.polygon) {
                $scope.data.plan.areas.forEach(function (area) {
                    if (area.id == block.id)
                        $scope.togglePolygon(block.polygon, false);
                });
            }
        });
        if ($scope.data.plan.id)
            $scope.data.plansToDelete.push($scope.data.plan.id);
        $scope.data.plans.splice($scope.data.plans.indexOf($scope.data.plan), 1);
        $scope.data.userId = id;
        $scope.selectDate($scope.data.date);
        $('#deleteUserModal').modal('hide');
        $scope.$apply();
        $scope.reloadTablePlanData();
    };

    $scope.initializeProgress = function () {
        $scope.data.blocks.forEach(function (block) {
            block.plans = 0;
        });
        for (var i = 0; i < $scope.data.sectors.length; i++) {
            var sector = $scope.data.sectors[i];
            sector.progress = 0;
            sector.selectedBlocks = 0;
            sector.totalBlocks = 0;
            $scope.data.blocks.forEach(function (block) {
                if (block.parentId == sector.id) {
                    if ($scope.data.schedule.reconversionScheduleId)
                        block.blockSize = block.reconversions;
                    else
                        block.blockSize = Math.round(block.houses * $scope.data.inspection.inspectionSize / $scope.data.area.houses);
                    sector.totalBlocks += block.blockSize;
                    block.sectorIndex = i;
                    block.name = sector.name + ' > ' + block.name;
                }
            });
            if (sector.totalBlocks == 0)
                sector.progress = 100;
        }
    };

    $scope.togglePolygon = function (polygon, hover) {
        if ($scope.data.plan == null) {
            $scope.alert('Debe primero seleccionar una fecha y un inspector');
        } else {
            var block = $scope.data.blocks[polygon.blockIndex];
            var sector = $scope.data.sectors[block.sectorIndex];
            if (polygon.selected) {
                block.plans--;
                $scope.data.plan.houses -= block.houses;
                if (block.plans == 0)
                    sector.selectedBlocks -= block.blockSize;
                $scope.data.plan.blocks.splice($scope.data.plan.blocks.indexOf(block), 1);
                for (var index = 0; index < $scope.data.plan.areas.length; index++) {
                    if ($scope.data.plan.areas[index].id == block.id) {
                        $scope.data.plan.areas.splice(index, 1);
                        break;
                    }
                }
            } else {
                if (block.plans == 0)
                    sector.selectedBlocks += block.blockSize;
                block.plans++;
                $scope.data.plan.houses += block.houses;
                $scope.data.inspection.houses += block.houses;
                $scope.data.plan.blocks.push(block);
                $scope.data.plan.areas.push({
                    id: block.id,
                    scheduledHouses: Math.round(block.houses / $scope.data.inspection.interval),
                    latitude: block.latitude,
                    longitude: block.longitude
                });
            }
            sector.progress = sector.totalBlocks == 0 ? 100 : Math.round(sector.selectedBlocks / sector.totalBlocks * 100);
            $scope.data.plan.planSize = Math.round($scope.data.plan.houses / $scope.data.inspection.interval);
            $scope.data.inspection.visits = 0;
            $scope.data.sectors.forEach(function (s) {
                $scope.data.inspection.visits += s.selectedBlocks;
            });
            $scope.data.inspection.progress = Math.round($scope.data.inspection.visits / $scope.data.inspection.inspectionSize * 100);
            if ($scope.data.inspection.progress > 100 || $scope.data.inspection.inspectionSize == 0)
                $scope.data.inspection.progress = 100;
            polygon.selected = !polygon.selected;
            polygon.plans = block.plans;
            if (hover)
                $scope.hoverBlock(block);
            else
                $scope.setPolygonColor(polygon);
        }
    };

    $scope.openPicker = function ($event) {
        $scope.picker.opened = true;
    };

    $scope.detailVisit = function (item) {
        $state.go('app.visits.detail', { id: item.uuid });
    };

    $scope.savePlans = function () {

        $scope.buttonDisabled = true;
        $scope.view.saving = true;
        var timer = new Date();
        var substituteAreas = [];
        for (var i = 0; i < $scope.data.blocks.length; i++) {
            var block = $scope.data.blocks[i];
            if (block.plans == 0) {
                substituteAreas.push({
                    id: block.id,
                    houses: block.houses,
                    location: new google.maps.LatLng(block.latitude, block.longitude),
                    distance: 0
                });
                
            }
        }
        
        var calls = [];
        angular.forEach($scope.data.plans, function (plan) {
            //Crea el plan para guardarlo
            var item = {
                inspectionId: plan.inspectionId,
                userId: plan.userId,
                date: plan.date,
                planSize: plan.planSize,
                stateId: plan.stateId,
                areas: [],
                houseIni: plan.houseIni,
                houseInterval: plan.houseInterval
            };
            
            //Añade las zonas y calcula el centro
            var bounds = new google.maps.LatLngBounds();
            for (var i = 0; i < plan.areas.length; i++) {
                var area = plan.areas[i];
                item.areas.push({
                    id: area.id,
                    scheduledHouses: area.scheduledHouses,
                    substitute: false,
                    pin: null
                });
                bounds.extend(new google.maps.LatLng(area.latitude, area.longitude));
            }
            var center = bounds.getCenter();
            
            //Selecciona las zonas suplentes
            if ($scope.data.inspection.stateId != 3001) {
                
                if (item.stateId == 7001) {
                    
                    //Calcula la distancia de las zonas respecto al centro
                    for (var i = 0; i < substituteAreas.length; i++) {
                        var substituteArea = substituteAreas[i];
                        
                        substituteArea.distance = google.maps.geometry.spherical.computeDistanceBetween(substituteArea.location, center);
                    }
                    //Ordena las zonas por distancia
                    substituteAreas.sort(function (a, b) {
                        return a.distance - b.distance;
                    });
                    
                    //Selecciona las 3 primeras suplentes
                    for (var i = 0; i < Math.min(3, substituteAreas.length) ; i++) {
                        item.areas.push({
                            id: substituteAreas[i].id,
                            scheduledHouses: substituteAreas[i].houses,
                            substitute: true,
                            pin: null
                        });
                        console.log("##" + substituteAreas[i].houses);
                    }
                } else {
                    
                    //Guarda las manzanas suplentes ya establecidas
                    for (var i = 0; i < plan.substitutes.length; i++) {
                        var substitute = plan.substitutes[i];
                        item.areas.push({
                            id: substitute.id,
                            scheduledHouses: substitute.houses,
                            substitute: true,
                            pin: substitute.pin
                        });
                        console.log("#" + substitute.houses);
                    }
                }
            }

            if (plan.id) {
                
                item.id = plan.id;
            }
            calls.push(resources.savePlan(item));
 
        });
        console.log('Tiempo calculo: ' + (new Date - timer) + 'ms');
        angular.forEach($scope.data.plansToDelete, function (plan) {
            calls.push(resources.deletePlan(plan));
        });
        
        $q.all(calls)
            .then(function (data) {
                for (var index = 0; index < $scope.data.plans.length; index++) {
                    if (!$scope.data.plans[index].id)
                        $scope.data.plans[index].id = data[index].data;
                }
                $scope.data.plansToDelete = [];
                $scope.view.saving = false;
                $scope.buttonDisabled = false;
            });
        if ($scope.data.inspection.stateId == 3002) {
            console.log("activa");
            $scope.textAlert = 'Se han recalculado las manzanas suplentes,considere imprimir de nuevo el informe de manzanas suplentes.';
            $('#modalAlert').modal('show');
        }
    };

    $scope.printReport = function (id) {
        $('#modalDownload').modal('show');
        resources.getPlanReport(id)
            .success(function (data, status, headers, config) {
                download.file(data, status, headers, config, 'Detalle Plan.pdf');
                $('#modalDownload').modal('hide');
            });
    };

    $scope.sendEmailInspector = function (id) {
        $('#modalSend').modal('show');
        resources.sendInspectorExcel(id)
           .success(function (data) {
               $('#modalSend').modal('hide');
           });
    };

    $scope.downloadPlan = function (id) {
        $('#modalDownload').modal('show');
        resources.getInspectorReport(id)
           .success(function (data, status, headers, config) {
               download.file(data, status, headers, config, 'Informe_Inspeccion.xlsx');
               $('#modalDownload').modal('hide');
           });
    };

    $scope.printXlsx = function () {
        $('#modalDownload').modal('show');
        resources.getInspectorsXlsx($stateParams.id)
            .success(function (data, status, headers, config) {
                download.file(data, status, headers, config, 'Produccion_Inspectores.xlsx');
                $('#modalDownload').modal('hide');
            });
    };

    $scope.activateInspection = function () {
        
        for (var i = 0; i < $scope.data.plans.length; i++) {
            if ($scope.data.plans[i].areas.length == 0) {
                $scope.alert('No se puede activar la inspección. Existe algun inspector sin manzanas asignadas.');
                return;
            }
        }
        $scope.view.saving = true;
        $scope.data.inspection.stateId = 3002;
        var interval = $scope.data.inspection.interval;
        var progress = $scope.data.inspection.progress;
        var visits = $scope.data.inspection.visits;
        var houses = $scope.data.inspection.houses;
        delete $scope.data.inspection.interval;
        delete $scope.data.inspection.progress;
        delete $scope.data.inspection.visits;
        delete $scope.data.inspection.houses;
        resources.saveInspection($stateParams.id, $scope.data.inspection)
            .success(function (data) {
                $scope.data.inspection.interval = interval;
                $scope.data.inspection.progress = progress;
                $scope.data.inspection.visits = visits;
                $scope.data.inspection.houses = houses;
                $scope.savePlans();
            });
    };

    $scope.finalizeInspection = function () {
        $scope.view.saving = true;
        resources.closeInspection($stateParams.id)
            .success(function (data) {
                $scope.data.inspection.stateId = 3003;
                $scope.view.saving = false;
            })
            .error(function () {
                $scope.view.saving = false;
                $scope.alert('No se puede finalizar la inspección. Existe algun plan no terminado');
            });
    };

    $scope.substitutes = function () {
        $('#modalDownload').modal('show');
        resources.getSubstitutes($stateParams.id)
            .success(function (data, status, headers, config) {
                download.file(data, status, headers, config, 'Manzanas_Suplentes.xlsx');
                $('#modalDownload').modal('hide');
            });
    };


    $scope.samples = function () {
        $('#modalDownload').modal('show');
        resources.getSamplesExcel($stateParams.id)
            .success(function (data, status, headers, config) {
                download.file(data, status, headers, config, 'Muestras_Inspeccion.xlsx');
                $('#modalDownload').modal('hide');
            });
    };


    $scope.alert = function (message) {
        $scope.textAlert = message;
        $('#modalAlert').modal('show');
    };

    $scope.load();
}]);