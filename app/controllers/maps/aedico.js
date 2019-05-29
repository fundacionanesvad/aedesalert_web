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
    $stateProvider.state('app.maps', {
        url: "/maps",
        templateUrl: "views/common/view.html",
    }).state('app.maps.aedico', {
        url: "/aedico/{id}",
        templateUrl: "views/maps/aedico.html",
        label: 'Mapa Aédico',
        icon: 'glyphicon glyphicon-th',
        link: 'app.maps.aedico',
        access: 'MAPS_VIEW',
        controller: 'MapAedicoController',
        reloadOnSearch: false,
        category: 'maps'
    });
}]);

app.controller('MapAedicoController', ['$scope', '$rootScope', 'resources', '$q', 'session', 'uiGmapGoogleMapApi', 'uiGmapIsReady', '$stateParams', '$location', function ($scope, $rootScope, resources, $q, session, uiGmapGoogleMapApi, uiGmapIsReady, $stateParams, $location) {
    $scope.loading = true;
    $scope.data = {
        area: null,
        parent: null
    };
    $scope.map = {
        area: [],
        areas: [],
        events: {
            click: function (polygon, eventName, model) {
                if (!model.leaf)
                    $scope.load(model.id);
            },
            mouseover: function (polygon, eventName, model) {
                $rootScope.$broadcast('tooltip_aedico', model.area);
            },
            mouseout: function (polygon, eventName, model) {
                $rootScope.$broadcast('tooltip_aedico', null);
            }
        },
        config: {
            center: { latitude: -8.0625017, longitude: -79.0550047 },
            zoom: 8,
            options: { mapTypeId: google.maps.MapTypeId.HYBRID }
        }
    };
    $scope.tooltip = null;

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

    $scope.back = function () {
        $scope.load($scope.data.parent);
    };

    $scope.print = function () {
        window.setTimeout(window.print, 1000);
    };

    $scope.info = function () {
        $(".angular-google-map-container").height($("#page-wrapper").css("min-height").replace("px", "") - 80);
        $scope.refresh();
    };

    $scope.load = function (id) {
        $scope.loading = true;
        $rootScope.process403 = false;
        $rootScope.$broadcast('tooltip_aedico', null);
        resources.getArea(id)
            .then(function (response) {
                $rootScope.process403 = true;
                $location.search('id', id);
                $scope.data.area = response.data;
                $scope.data.area.id = id;
                $q.all([resources.getMapAedico(id, $scope.filters.active), resources.getAreaParents(id)])
                    .then(function (response) {
                        $scope.data.childs = response[0].data;
                        $scope.data.parents = response[1].data;

                        //Añade las zonas
                        $scope.map.area.length = 0;
                        $scope.map.areas.length = 0;
                        $scope.map.bounds = new google.maps.LatLngBounds();
                        if ($scope.data.area.id != 1) {
                            $scope.map.area.push({
                                id: $scope.data.area.id,
                                path: $scope.convert($scope.data.area.coords)
                            });
                        }
                        $scope.data.childs.areas.forEach(function (area) {
                            var color = {};
                            if (area.index < 0) {
                                color = { color: '#FFFFFF', opacity: '0' };
                            } else if (area.index == 0) {
                                color = { color: '#FFFFFF', opacity: '0.6' };
                            } else if (area.index <= 1) {
                                color = { color: '#109618', opacity: '0.3' };
                            } else if (area.index <= 2) {
                                color = { color: '#FF9900', opacity: '0.3' };
                            } else {
                                color = { color: '#DC3912', opacity: '0.3' };
                            }
                            $scope.map.areas.push({
                                id: area.id,
                                path: $scope.convert(area.coords),
                                color: color,
                                leaf: area.leaf,
                                area: area
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

app.controller('MapAedicoTooltipController', ['$scope', function ($scope) {
    $scope.area = null;
    $scope.$on('tooltip_aedico', function (event, area) {
        $scope.area = area;
    });
}]);