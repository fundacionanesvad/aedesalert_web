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
    $stateProvider.state('app.maps.situation', {
        url: "/situation",
        templateUrl: "views/maps/situation.html",
        label: 'Mapa de Situación',
        icon: 'glyphicon glyphicon-map-marker',
        link: 'app.maps.situation',
        access: 'MAPS_VIEW',
        controller: 'MapSituationController',
        reloadOnSearch: false,
        category: 'maps'
    });
}]);

app.controller('MapSituationController', ['$scope', 'resources', '$q', 'uiGmapGoogleMapApi', 'uiGmapIsReady', '$stateParams', '$rootScope', '$location', '$state', function ($scope, resources, $q, uiGmapGoogleMapApi, uiGmapIsReady, $stateParams, $rootScope, $location, $state) {
    $scope.view = {
        loading: true,
        refreshing: false
    };
    $scope.data = {
        area: null,
        parent: null,
        areas: [null, null, null, null, null, null],
        areaLists: [[], [], [], [], [], []],
        areaDescendants: [[], [], [], [], [], []],
        samples:[]
    };
    $scope.map = {
        areas: [],
        polygons: [],
        markers: [],
        events: {
            click: function (polygon, eventName, model) {
                if (!model.leaf)
                    $scope.load(model.id);
            }
        },
        markerEvents: {
            click: function (marker, eventName, model) {
                $scope.map.window.model = model;
                $scope.map.window.show = true;
            }
        },
        window: {
            options: {
                pixelOffset: { width: -1, height: -30 }
            },
            show: false,
            closeClick: function() {
                this.show = false;
                $scope.map.window.model = null;
            }
        },
        config: {
            center: { latitude: -8.0625017, longitude: -79.0550047 },
            zoom: 8,
            options: { mapTypeId: google.maps.MapTypeId.HYBRID }
        }
    };
    $scope.tooltip = null;
    $scope.allValue = true;

    var date = new Date();
    var start = $rootScope.toTimeStamp(new Date(date.getFullYear(), date.getMonth(), 1));
    var finish = $rootScope.toTimeStamp(new Date(date.getFullYear(), date.getMonth() + 1, 0));
    $scope.filters = {
        active: {
            startDate: start,
            finishDate: finish,
            inspections: [],
            allInspections: true,
            focusHouses: true
        },
        edit: {
            startDate: start,
            finishDate: finish,
            inspections: []
        }
    };

    uiGmapIsReady.promise().then(function (instances) {
        instances.forEach(function (instance) {
            $scope.map.instance = instance.map;
            google.maps.event.addDomListener($scope.map.instance, 'idle', function () {
                $scope.calculateCenter();
            });
            google.maps.event.addDomListener(window, 'resize', function () {
                $scope.map.instance.setCenter($scope.map.center);
            });
        });
        $scope.initialize();
    });

    uiGmapGoogleMapApi.then(function (maps) {
        $(".angular-google-map").height('100%');
        $(".angular-google-map-container").height('100%');
    });

    $scope.convert = function (coords) {
        var path = [];
        if (coords != null && coords != '') {
            JSON.parse(coords).forEach(function (coord) {
                var point = new google.maps.LatLng(coord.latitude, coord.longitude);
                path.push(point);
                $scope.map.bounds.extend(point);
            });
        }
        return path;
    };

    $scope.refresh = function () {
        google.maps.event.trigger($scope.map.instance, 'resize');
        if (!$scope.map.bounds.isEmpty()) {
            $scope.map.instance.fitBounds($scope.map.bounds);
        }
    };

    $scope.calculateCenter = function () {
        $scope.map.center = $scope.map.instance.getCenter();
    };

    $scope.initialize = function () {
        //Activa el instant tooltip
        if ($scope.tooltip == null) {
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
        }

        //Carga las zonas
        resources.getArea($rootScope.areaid)
            .then(function (response) {
                $scope.data.area = response.data;
                if (!$scope.data.area.typeId)
                    $scope.data.area.typeId = 9001;
                if ($scope.data.area.typeId > 9004)
                    $state.go('error403');
                var index = $scope.data.area.typeId - 9001;
                $scope.data.areas[index] = $scope.data.area;
                $scope.data.areaLists[index].push($scope.data.area);
                $scope.data.area.id = $rootScope.areaid;
                $scope.loadDescendants($scope.data.area.id, $scope.data.area.typeId);
            });
    };

    $scope.loadDescendants = function (areaId, typeId) {
        var calls = [];
        for (var i = 9002; i <= 9003; i++) {
            if (i <= typeId)
                calls.push(resources.fakeArray());
            else
                calls.push(resources.getDescendantsByType(areaId, i));
        };
        $q.all(calls)
            .then(function (data) {
                for (var i = 9002; i <= 9003; i++)
                    $scope.data.areaDescendants[i - 9001] = data[i - 9002].data;
                $scope.loadAreas($scope.data.area.typeId + 1);
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
            if (typeId < 9003)
                $scope.loadAreas(typeId + 1);
            else
                $scope.loadInspections();
        }
    };

    $scope.loadInspections = function () {
        var filters = {
            areaId: $scope.data.areas[2].id,
            startDate: $scope.filters.active.startDate,
            finishDate: $scope.filters.active.finishDate,
            type: 9003
        };
        resources.getReportInspections(filters)
            .then(function (response) {
                $scope.data.inspections = response.data;
                var inspections = [];
                $scope.data.inspections.forEach(function (inspection) {
                    if ($scope.filters.active.allInspections || $scope.filters.active.inspections.indexOf(inspection.id) != -1)
                        inspections.push(inspection.id);
                });
                $scope.filters.active.inspections = inspections;
 
                $scope.view.loading = false;
                $scope.loadData();
            });
    };

    $scope.loadData = function () {
        $scope.view.refreshing = true;
        $scope.map.window.show = false;
        $scope.filters.edit.inspections = $scope.filters.active.inspections;
        $scope.filters.active.allInspections = $scope.filters.active.inspections.length == $scope.data.inspections.length;
        var id = $scope.data.areas[2].id;
        var args = { inspections: $scope.filters.active.inspections };
        var calls = [resources.getAreaStatsMR(id, args), resources.getAreaStatsEESS(id, args)];
        if ($scope.filters.active.focusHouses)
            calls.push(resources.getFocusHouses(id, args));
        
        else
            calls.push(resources.fakeArray());
        $q.all(calls)
            .then(function (response) {
                //Quita los polygons y los marcadores
                for (var polygon = 0; polygon < $scope.map.polygons.length; polygon++) {
                    $scope.map.polygons[polygon].setMap(null);
                }
                for (var marker = 0; marker < $scope.map.markers.length; marker++) {
                    $scope.map.markers[marker].setMap(null);
                }

                //Añade las microredes y los EESS
                $scope.map.polygons = [];
                $scope.map.bounds = new google.maps.LatLngBounds();
                response[0].data.forEach(function (mr) {
                    mr.type = 9004;
                    $scope.addPolygon(mr);
                    response[1].data.forEach(function (es) {
                        if (mr.id == es.parentId) {
                            es.type = 9005;
                            es.mr = mr;
                            $scope.addPolygon(es);
                        }
                    });
                });

                //Añade las viviendas foco                
                $scope.map.markers = [];

                console.log(response[1].data);//StatsEESS
                console.log(response[2].data);//Focushouses
                console.log($scope.filters.active.inspections); //IDs inspecciones filtro
                console.log($scope.data.inspections);//Todas las Inspecciones de las fechas

                var ultimolat;
                var ultimolang;
                var casas = 0;

                for (var idfiltro = 0; idfiltro < $scope.filters.active.inspections.length; idfiltro++) {//Recorremos filtro
                    for (var idinspec = 0; idinspec < $scope.data.inspections.length; idinspec++) {//Recorremos inspecciones
                        if ($scope.filters.active.inspections[idfiltro] == $scope.data.inspections[idinspec].id) {
                            var nombrearea = $scope.data.inspections[idinspec].areaName;
                            var nombretipo = $scope.data.inspections[idinspec].typeName;
                            for (var ideess = 0; ideess < response[1].data.length; ideess++) {//Recorremos ideess
                                if (nombrearea == response[1].data[ideess].name) {//Obtenemos que tipo queremos con el nombrearea
                                    var contpuntos;
                                    switch (nombretipo) {
                                        case 'Vigilancia':
                                            contpuntos = response[1].data[ideess].vigilance.focus;
                                            break;
                                        case 'Control':
                                            contpuntos = response[1].data[ideess].control.focus + response[1].data[ideess].reconversion.focus;
                                            break;
                                        default:
                                            break;
                                    }
                                    while (contpuntos != 0 && casas < response[2].data.length) {
                                        var marker = new google.maps.Marker({
                                            position: new google.maps.LatLng(response[2].data[casas].latitude, response[2].data[casas].longitude),
                                            map: $scope.map.instance,
                                        });
                                        switch (nombretipo) {
                                            case 'Vigilancia':
                                                marker.setIcon('/images/positive-house-vigilance.png');
                                                marker.setTitle('Vivienda positiva (vigilancia)');
                                                break;
                                            case 'Control':
                                                if (response[2].data[casas].reconverted) {
                                                    marker.setIcon('/images/positive-house-reconversion.png'); marker.setTitle('Vivienda positiva (reconversión)');
                                                }
                                                else {
                                                    marker.setIcon('/images/positive-house-control.png'); marker.setTitle('Vivienda positiva (control)');
                                                }
                                                break;
                                            default:
                                                break;
                                        }
                                        $scope.map.markers.push(marker);
                                        if(ultimolang != response[2].data[casas].longitude || ultimolat != response[2].data[casas].latitude){
                                            //Guardamos valores para comparar con el anterior.
                                            ultimolang = response[2].data[casas].longitude;
                                            ultimolat = response[2].data[casas].latitude;
                                            contpuntos--;
                                        }
                                        casas++;
                                    }
                                }                                
                            }
                        }
                    }
                }

                //Actualiza el mapa y ajusta la zona visible
                setTimeout(function () {
                    $scope.refresh();
                }, 10);
                $scope.view.refreshing = false;
            });
    };

    $scope.addPolygon = function (area) {
        var polygon = new google.maps.Polygon({
            paths: $scope.convert(area.coords),
            id: area.id,
            zIndex: area.type == 9004 ? 100 : 200,
            area: area
        });
        if (area.mr)
            polygon.setOptions({ strokeColor: '#000000', strokeOpacity: 1 });
        else
            polygon.setOptions({ strokeColor: '#A00000', strokeOpacity: 0.5 });
        $scope.map.polygons.push(polygon);
        polygon.setMap($scope.map.instance);
        google.maps.event.addListener(polygon, 'mouseover', function (event) {
            var area = this.area;
            $scope.$apply(function () {
                if (area.type == 9004) {
                    $rootScope.$broadcast('area_mr', area);
                } else {
                    $rootScope.$broadcast('area_eess', area);
                    $rootScope.$broadcast('area_mr', area.mr);
                }
            });
        });
        google.maps.event.addListener(polygon, 'mouseout', function (event) {
            var mouse = event.Ha;
            console.log("Mouseout");
            var tooltip = $('#instantTooltip2')[0].getBoundingClientRect();
            $scope.$apply(function () {
                $rootScope.$broadcast('area_eess', null);
                if (mouse.clientX < tooltip.left || mouse.clientX > tooltip.right || mouse.clientY < tooltip.top || mouse.clientY > tooltip.bottom)
                    $rootScope.$broadcast('area_mr', null);
            });
        });
    };

    $scope.applyFilters = function () {
        $('#modalRange').modal('hide');
        $scope.filters.active.startDate = $scope.filters.edit.startDate;
        $scope.filters.active.finishDate = $scope.filters.edit.finishDate;
        $scope.loadInspections();
    };

    $scope.toggleInspection = function (id) {
        var index = $scope.filters.edit.inspections.indexOf(id);
        if (index == -1) {
            $scope.filters.edit.inspections.push(id);
            $scope.textoError = "";
        }
        else
            $scope.filters.edit.inspections.splice(index, 1);

        if ($scope.filters.edit.inspections.length == $scope.data.inspections.length) {
            $scope.allValue = true;
        } else {
            $scope.allValue = false;
        }
        if ($scope.filters.edit.inspections.length <= 0) {
            $scope.textoError = "Es necesario selecionar una inspección como mínimo";
        }
    };

    $scope.toggleAllInspection = function () {
        
        var long = $scope.filters.edit.inspections.length;
        
        if ($scope.allValue != false) {
            while (long--) {
                var id = $scope.filters.edit.inspections[long]; 
                console.log(id);
                var index = $scope.filters.edit.inspections.indexOf(id);
                $scope.filters.edit.inspections.splice(index, 1);
            }
            $scope.textoError = "Es necesario selecionar una inspección como mínimo";
            $scope.allValue = false;
        } else {
            console.log($scope.data.inspections.length);
            //$scope.filters.edit.inspections = [];
            $scope.data.inspections.forEach(function (inspection) {
                $scope.filters.edit.inspections.push(inspection.id);     
            });
            $scope.textoError = "";
            $scope.allValue = true;
        }
    };

    $scope.applyInspections = function () {

        if ($scope.filters.edit.inspections.length > 0) {
            $('#modalInspections').modal('hide');
            $scope.filters.active.inspections = $scope.filters.edit.inspections;

            $scope.loadData();
            
        } else {
            $scope.textoError = "Es necesario selecionar una inspección como mínimo";
        }

    };
}]);

app.controller('MapEESSControlController', ['$scope', function ($scope) {
    $scope.area = null;
    $scope.$on('area_eess', function (event, area) {
        $scope.area = area;
    });
}]);

app.controller('MapMRControlController', ['$scope', function ($scope) {
    $scope.area = null;
    $scope.$on('area_mr', function (event, area) {
        $scope.area = area;
    });
}]);