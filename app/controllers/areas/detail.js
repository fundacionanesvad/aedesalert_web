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
    $stateProvider.state('app.areas.detail', {
        url: "/detail/{id}",
        params: {
            parent: null
        },
        templateUrl: "views/areas/detail.html",
        controller: 'AreasDetailController',
        label: 'Detalle Zona',
        icon: 'glyphicon glyphicon-th-large'
    }).state('app.areas.create', {
        url: "/create/{parent}",
        params: {
            id: 'new'
        },
        templateUrl: "views/areas/detail.html",
        controller: 'AreasDetailController',
        label: 'Nueva Zona',
        icon: 'glyphicon glyphicon-th-large'
    });
}]);

app.controller('AreasDetailController', ['$scope', '$rootScope', '$stateParams', '$location', 'resources', '$q', '$state', 'uiGmapGoogleMapApi', 'uiGmapIsReady', function ($scope, $rootScope, $stateParams, $location, resources, $q, $state, uiGmapGoogleMapApi, uiGmapIsReady) {

    $scope.view = { edit: ($stateParams.id != 'new'), loading: true, saving: false, tab: 1, ready: 0 };

    $scope.map = {
        config: {
            center: { latitude: -8.0625017, longitude: -79.0550047 },
            zoom: 8,
            options: { mapTypeId: google.maps.MapTypeId.HYBRID }
        },
        parent: [],
        childs: [],
        shape: null,
        marker: null
    };

    $scope.data = {
        area: { parentId: $stateParams.parent, coords: "" },
        parent: { id: 0, name: "", childs: [] },
        parents: [],
        houses: [],
        inspections: [],
        reports: [],
        areaId: $stateParams.id,
        rootAreaId: $rootScope.areaid
    };
   
    $scope.load = function () {
        if ($scope.view.edit) {
            resources.getArea($stateParams.id)
                .success(function (data) {
                    $scope.data.area = data;
                    $scope.loadDetail();
                });
        } else {
            $scope.loadDetail();
        }
    };

    $scope.loadDetail = function () {
        var calls;
        if ($stateParams.id == $rootScope.areaid)
            var calls = [resources.fakeArray(), resources.fakeArray()];
        else
            var calls = [resources.getAreaChilds($scope.data.area.parentId), resources.getAreaParents($scope.data.area.parentId)];
        if ($scope.view.edit) {
            if ($rootScope.checkAccess('HOUSES_VIEW'))
                calls.push(resources.getAreaHouses($stateParams.id));
            else
                calls.push(resources.fakeArray());
            if ($rootScope.checkAccess('SCHEDULES_VIEW') && $scope.data.area.typeId == 9004)
                calls.push(resources.getAreaSchedules($stateParams.id));
            else
                calls.push(resources.fakeArray());
            if ($rootScope.checkAccess('INSPECTIONS_VIEW') && $scope.data.area.typeId == 9005)
                calls.push(resources.getAreaInspections($stateParams.id));
            else
                calls.push(resources.fakeArray());
            if ($rootScope.checkAccess('REPORTS_VIEW'))
                calls.push(resources.getAreaReports($stateParams.id));
            else
                calls.push(resources.fakeArray());
        }
        $q.all(calls)
            .then(function (data) {
                if (data[0].data.typeId)
                    $scope.data.area.typeId = data[0].data.typeId + 1;
                $scope.data.parent = data[0].data;
                $scope.data.parents = data[1].data;
                if ($scope.view.edit) {
                    $scope.data.houses = data[2].data;
                    $scope.data.schedules = data[3].data;
                    $scope.data.inspections = data[4].data;
                    $scope.data.reports = data[5].data;
                }
                $scope.view.loading = false;
                $scope.view.ready++;
                $scope.initializeMap();
            });
    };

    $scope.save = function () {
        $scope.view.saving = true;
        if ($scope.map.shape == null) {
            $scope.data.area.coords = null;
            $scope.data.area.latitude = $scope.data.parent.latitude;
            $scope.data.area.longitude = $scope.data.parent.longitude;
        } else {
            var path = [];
            var bounds = new google.maps.LatLngBounds();
            $scope.map.shape.getPath().forEach(function (point) {
                path.push({ latitude: point.lat(), longitude: point.lng() });
                bounds.extend(point);
            });
            $scope.data.area.coords = JSON.stringify(path);
            var center = bounds.getCenter();
            $scope.data.area.latitude = center.lat();
            $scope.data.area.longitude = center.lng();
        }
        if ($scope.map.marker != null) {
            $scope.data.area.latitude = $scope.map.marker.getPosition().lat();
            $scope.data.area.longitude = $scope.map.marker.getPosition().lng();
        }
        if ($scope.map.shape != null && $scope.map.shape.getPath().length > 89) {
            $('#modalAlertNotSave').modal('show');
            $scope.view.saving = false;
        } else {
            resources.saveArea($stateParams.id, $scope.data.area)
                .success(function (data) {
                    $state.go('app.areas.list', { id: $scope.data.area.parentId });
                });
        }
    };

    $scope.initializeMap = function () {
        if ($scope.view.ready > 1) {
            $scope.map.bounds = new google.maps.LatLngBounds();

            //Dibuja el padre
            if ($scope.data.parent.coords) {
                $scope.map.parent = $scope.convert($scope.data.parent.coords);
            }

            //Dibuja los hermanos
            if ($scope.data.parent.childs) {
                $scope.data.parent.childs.forEach(function (child) {
                    if (child.id != $stateParams.id && child.coords) {
                        $scope.map.childs.push({ id: child.id, path: $scope.convert(child.coords), clickable: false });
                    }
                });
            }

            //Dibuja la zona actual
            if ($scope.data.area.coords) {
                $scope.drawingManagerControl.getDrawingManager().setDrawingMode(null);
                $scope.map.shape = new google.maps.Polygon({
                    paths: $scope.convert($scope.data.area.coords),
                    fillColor: '#1E90FF',
                    fillOpacity: 0.45,
                    strokeWeight: 0,
                    map: $scope.map.instance,
                    draggable: $rootScope.checkAccess('AREAS_EDIT'),
                    editable: $rootScope.checkAccess('AREAS_EDIT')
                });
            } else {
                $scope.drawingManagerControl.getDrawingManager().setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
            }

            //Dibuja el EESS
            if ($scope.data.area.typeId == 9005) {
                if ($scope.data.area.latitude && $scope.data.area.longitude) {
                    var point = new google.maps.LatLng($scope.data.area.latitude, $scope.data.area.longitude);
                    $scope.map.bounds.extend(point);
                    $scope.map.marker = new google.maps.Marker({
                        position: point,
                        map: $scope.map.instance,
                        draggable: true,
                        icon: '/images/marker-eess.png',
                        title: 'Posición EESS'
                    });
                }
            }

            //Actualiza el mapa y ajusta la zona visible
            setTimeout(function () {
                $scope.refresh();
            }, 10);
            if ($scope.map.shape != null) {
                $scope.map.shape.getPaths().forEach(function (path, index) {
                    google.maps.event.addListener(path, 'insert_at', function () {
                        if ($scope.map.shape.getPath().length >= 89) {
                            $('#modalAlertPoints').modal('show');
                        }
                    });
                });
            }   
         }
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

        google.maps.event.addListener($scope.drawingManagerControl.getDrawingManager(), 'polygoncomplete', function (polygon) {
            $scope.map.shape = polygon;
            $scope.drawingManagerControl.getDrawingManager().setDrawingMode(null);
            if ($scope.data.area.typeId == 9005) {
                var bounds = new google.maps.LatLngBounds();
                $scope.map.shape.getPath().forEach(function (point) {
                    bounds.extend(point);
                });
                $scope.map.marker = new google.maps.Marker({
                    position: bounds.getCenter(),
                    map: $scope.map.instance,
                    draggable: true,
                    icon: '/images/marker-eess.png',
                    title: 'Posición EESS'
                });
            }
        });

        $scope.view.ready++;
        $scope.initializeMap();
    });

    uiGmapGoogleMapApi.then(function (maps) {
        $scope.map.config = {
            center: { latitude: -8.0625017, longitude: -79.0550047 },
            zoom: 8,
            options: { mapTypeId: google.maps.MapTypeId.HYBRID }
        };

        $scope.drawingManagerOptions = {
            drawingControl: false,
            polygonOptions: {
                strokeWeight: 0,
                fillOpacity: 0.45,
                editable: true,
                draggable: true,
                fillColor: '#1E90FF'
            }
        };

        $scope.drawingManagerControl = {};
    });

    $rootScope.$on("deleteToolSelected", function (event) {
        if ($scope.map.shape != null) {
            $scope.map.shape.setMap(null);
            $scope.map.shape = null;
            $scope.drawingManagerControl.getDrawingManager().setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
        }
        if ($scope.map.marker != null) {
            $scope.map.marker.setMap(null);
            $scope.map.marker = null;
        }
    });

    $scope.refresh = function () {
        google.maps.event.trigger($scope.map.instance, 'resize');
        if (!$scope.map.bounds.isEmpty()) {
            $scope.map.instance.fitBounds($scope.map.bounds);
        }
    };

    $scope.goSchedule = function (item) {
        $state.go('app.schedules.detail', { id: item.id });
    };

    $scope.goInspection = function(item) {
        $state.go('app.inspections.detail', { id: item.id });
    };

    $scope.createSchedule = function () {
        var schedule = {
            startDate: $rootScope.newTimeStamp(),
            finishDate: $rootScope.newTimeStamp(),
            typeId: 1001,
            areaId: $stateParams.id
        };
        resources.saveSchedule('new', schedule)
            .success(function (data) {
                $scope.goSchedule({ id: data });
            });
    };

    $scope.createInspection = function () {
        inspectionSize = $scope.data.area.houses / 10;
        module = inspectionSize % 20;
        if (module != 0)
            inspectionSize += 20 - module;
        var inspection = {
            startDate: $rootScope.newTimeStamp(),
            finishDate: $rootScope.newTimeStamp(),
            inspectionSize: inspectionSize,
            coverage: null,
            stateId: 3001,
            typeId: 1001,
            areaId: $stateParams.id
        };
        resources.saveInspection('new', inspection)
            .success(function (data) {
                $scope.goInspection({ id: data });
            });
    };

    $scope.goHouse = function (house) {
        $state.go('app.houses.detail', { id: house.uuid });
    };

    $scope.goReport = function (report) {
        $state.go('app.reports.detail', { id: report.id });
    };

    $scope.load();
}]);