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
    $stateProvider.state('app.maps.focus', {
        url: "/focus/{id}",
        templateUrl: "views/maps/focus.html",
        label: 'Mapa de Foco',
        icon: 'glyphicon glyphicon-map-marker',
        link: 'app.maps.focus',
        access: 'MAPS_VIEW',
        controller: 'MapFocusController',
        reloadOnSearch: false,
        category: 'maps'
    });
}]);

app.controller('MapFocusController', ['$scope', 'resources', '$q', 'uiGmapGoogleMapApi', 'uiGmapIsReady', '$stateParams', '$rootScope', '$location', function ($scope, resources, $q, uiGmapGoogleMapApi, uiGmapIsReady, $stateParams, $rootScope, $location) {
    $scope.loading = true;
    $scope.data = { area: null, parent: null };
    $scope.map = {
        area: [],
        areas: [],
        markers: [],
        events: {
            click: function (polygon, eventName, model) {
                if (!model.leaf)
                    $scope.load(model.id);
            },
            mouseover: function (polygon, eventName, model) {
                $rootScope.$broadcast('tooltip_focus', model.area);
            },
            mouseout: function (polygon, eventName, model) {
                $rootScope.$broadcast('tooltip_focus', null);
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

    var date = new Date();
    var start = $rootScope.toTimeStamp(new Date(date.getFullYear(), date.getMonth(), 1));
    var finish = $rootScope.toTimeStamp(new Date(date.getFullYear(), date.getMonth() + 1, 0));
    $scope.filters = { active: { startDate: start, finishDate: finish }, edit: { startDate: start, finishDate: finish } };

    uiGmapIsReady.promise().then(function (instances) {
        //Initiliza el mapa
        instances.forEach(function (instance) {
            $scope.map.instance = instance.map;
            google.maps.event.addDomListener($scope.map.instance, 'idle', function () {
                $scope.calculateCenter();
            });
            google.maps.event.addDomListener(window, 'resize', function () {
                $scope.map.instance.setCenter($scope.map.center);
            });
        });

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

        //Carga los datos
        if ($stateParams.id)
            $scope.load($stateParams.id);
        else
            $scope.load($rootScope.areaid);
    });

    uiGmapGoogleMapApi.then(function (maps) {
        $(".angular-google-map").height('100%');
        $(".angular-google-map-container").height('100%');
    });

    $scope.calculateCenter = function () {
        $scope.map.center = $scope.map.instance.getCenter();
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

    $scope.refresh = function () {
        google.maps.event.trigger($scope.map.instance, 'resize');
        if (!$scope.map.bounds.isEmpty()) {
            $scope.map.instance.fitBounds($scope.map.bounds);
        }
    };

    $scope.load = function (id) {
       
        $scope.loading = true;
        $rootScope.process403 = false;
        $scope.map.window.show = false;
        $rootScope.$broadcast('tooltip_focus', null);
        resources.getArea(id)
            .then(function (response) {
                $rootScope.process403 = true;
                $location.search('id', id);
                $scope.loading = true;
                $scope.data.area = response.data;
                
                $scope.data.area.id = id;
                $q.all([resources.getMapFocus(id, $scope.filters.active), resources.getAreaParents(id)])
                    .then(function (response) {
                        $scope.data.childs = response[0].data;
                        $scope.data.parents = response[1].data;
                        //Añade las zonas
                        var id = 1;
                        var icon;
                        $scope.map.area.length = 0;
                        $scope.map.areas.length = 0;
                        $scope.map.markers.length = 0;
                        $scope.map.bounds = new google.maps.LatLngBounds();
                        if ($scope.data.area.id != 1) {
                            $scope.map.area.push({
                                id: $scope.data.area.id,
                                path: $scope.convert($scope.data.area.coords)
                            });
                        }
                        $scope.data.childs.areas.forEach(function (area) {
                            var polygon = {
                                id: area.id,
                                path: $scope.convert(area.coords),
                                leaf: area.leaf,
                                area: area
                            };
                            $scope.map.areas.push(polygon);
                            area.samples.forEach(function (sample) {
                                
                                if (sample.latitude == null || sample.longitude == null) {
                                    resources.getArea(sample.areaId).then(function (response) {
                                        sample.latitude = response.data.latitude;
                                        sample.longitude = response.data.longitude;
                                    });
                                }
                                
                            });
                            
                            area.samples.sort(function (a, b) {
                                var latitude = a.latitude - b.latitude;
                                var longitude = a.longitude - b.longitude;
                                if (latitude == 0 && longitude == 0) {
                                    if (a.result == b.result)
                                        return 0;
                                    if (a.result.toLowerCase() == "positivo")
                                        return -1;
                                    if (b.result.toLowerCase() == "positivo")
                                        return 1;
                                    return a.result < b.result;
                                } else if (latitude == 0) {
                                    return longitude;
                                }
                                return latitude;
                            });
                            var marker = {
                                latitude: 0,
                                longitude: 0
                            };
                            area.samples.forEach(function (sample) {
                                if (marker.latitude != sample.latitude || marker.longitude != sample.longitude) {
                                    if (sample.latitude != null && sample.longitude != null) {
                                        if (sample.result == "") {
                                            icon = '/images/marker-blue.png';
                                        } else if (sample.result.toLowerCase() == "positivo") {
                                            icon = '/images/marker-red.png';
                                        } else {
                                            icon = '/images/marker-green.png';
                                        }
                                        marker = {
                                            id: id++,
                                            icon: icon,
                                            latitude: sample.latitude,
                                            longitude: sample.longitude,
                                            samples: []
                                        };
                                        $scope.map.markers.push(marker);
                                    }
                                }
                                marker.samples.push({ date: sample.date, uuid: sample.uuid, result: sample.result, phase: sample.phase })
                        
                            });
                        });
                
                        //Actualiza el mapa y ajusta la zona visible
                        setTimeout(function () {
                            $scope.refresh();
                        }, 10);
                        $scope.loading = false;
                    });
            })
            .catch(function (data) {
                $rootScope.process403 = true;
                $scope.loading = false;
            });
    };

    $scope.applyFilters = function () {
        $('#modalRange').modal('hide');
        $scope.filters.active.startDate = $scope.filters.edit.startDate;
        $scope.filters.active.finishDate = $scope.filters.edit.finishDate;
        $scope.load($scope.data.area.id);
    };
}]);

app.controller('MapFocusTooltipController', ['$scope', function ($scope) {
    $scope.area = null;
    $scope.$on('tooltip_focus', function (event, area) {
        $scope.area = area;
    });
}]);