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
    $stateProvider.state('app.houses.detail', {
        url: "/{id}",
        templateUrl: "views/houses/detail.html",
        controller: 'HousesDetailController',
        label: 'Viviendas',
        icon: 'glyphicon glyphicon-user'
    });
}]);

app.controller('HousesDetailController', ['$scope', '$rootScope', '$stateParams', '$state', 'resources', '$q', 'uiGmapGoogleMapApi', 'uiGmapIsReady', function ($scope, $rootScope, $stateParams, $state, resources, $q, uiGmapGoogleMapApi, uiGmapIsReady) {

    $scope.view = { loading: true, saving: false, tab: 1, ready: 0 };
    $scope.map = { 
        config: {
            center: { latitude: -8.0625017, longitude: -79.0550047 },
            zoom: 8,
            options: { mapTypeId: google.maps.MapTypeId.SATELLITE }
        },
        polygon: [],
        marker: null
    };
    $scope.data = { visits: [], area: { id: 0, parentId: 0 } };

    $scope.load = function () {
        var calls = [resources.getHouse($stateParams.id)];
        if ($rootScope.checkAccess('VISITS_VIEW'))
            calls.push(resources.getHouseVisits($stateParams.id));
        else
            calls.push(resources.fakeArray());
        $q.all(calls)
            .then(function (data) {
                $scope.data.house = data[0].data;
                $scope.data.visits = data[1].data;
                $scope.view.loading = false;
                $scope.view.ready++;
                $scope.initializeMap();
            });
    };

    $scope.save = function () {
        $scope.view.saving = true;
        if ($scope.map.marker == null) {
            $scope.data.house.latitude = null;
            $scope.data.house.longitude = null;
        } else {
            $scope.data.house.latitude = $scope.map.marker.getPosition().lat();
            $scope.data.house.longitude = $scope.map.marker.getPosition().lng();
        }
        resources.saveHouse($stateParams.id, $scope.data.house)
            .success(function (data) {
                $state.go('app.houses.list');
            });
    };

    $scope.initializeMap = function () {
        if ($scope.view.ready > 1) {
            $scope.map.bounds = new google.maps.LatLngBounds();

            //Dibuja la zona a la que pertenece la vivienda
            if ($scope.data.house.areaCoords != null) {
                $scope.map.polygon = $scope.convert($scope.data.house.areaCoords);
            }

            //Dibuja la posición
            if ($scope.data.house.latitude && $scope.data.house.longitude) {
                $scope.drawingManagerControl.getDrawingManager().setDrawingMode(null);
                var point = new google.maps.LatLng($scope.data.house.latitude, $scope.data.house.longitude);
                $scope.map.bounds.extend(point);
                $scope.map.marker = new google.maps.Marker({
                    position: point,
                    map: $scope.map.instance,
                    draggable: true,
                    icon: '/images/marker-house.png',
                    title: 'Posición vivienda'
                });
            } else {
                $scope.drawingManagerControl.getDrawingManager().setDrawingMode(google.maps.drawing.OverlayType.MARKER);
                $scope.drawingManagerControl.getDrawingManager().setOptions({ markerOptions: { icon: '/images/marker-house.png', draggable: true } });
            }

            //Actualiza el mapa y ajusta la zona visible
            setTimeout(function () {
                $scope.refresh();
            }, 10);
        }
    };

    $scope.convert = function (coords) {
        var path = [];
        JSON.parse(coords).forEach(function (coord) {
            var point = new google.maps.LatLng(coord.latitude, coord.longitude);
            path.push(point);
            $scope.map.bounds.extend(point);
        });
        return path;
    };

    uiGmapIsReady.promise().then(function (instances) {
        instances.forEach(function (instance) {
            $scope.map.instance = instance.map;
        });

        google.maps.event.addListener($scope.drawingManagerControl.getDrawingManager(), 'markercomplete', function (marker) {
            $scope.map.marker = marker;
            $scope.drawingManagerControl.getDrawingManager().setDrawingMode(null);
        });

        $scope.view.ready++;
        $scope.initializeMap();
    });

    uiGmapGoogleMapApi.then(function (maps) {
        $scope.drawingManagerOptions = {
            drawingControl: false,
            markerOptions: { draggable: true },
        };
        $scope.drawingManagerControl = {};
    });

    $rootScope.$on("deleteToolSelected", function (event) {
        if ($scope.map.marker != null) {
            $scope.map.marker.setMap(null);
            $scope.map.marker = null;
            $scope.drawingManagerControl.getDrawingManager().setDrawingMode(google.maps.drawing.OverlayType.MARKER);
        }
    });

    $scope.refresh = function () {
        google.maps.event.trigger($scope.map.instance, 'resize');
        if (!$scope.map.bounds.isEmpty()) {
            $scope.map.instance.fitBounds($scope.map.bounds);
        }
    };

    $scope.detailVisit = function(visit) {
        $state.go('app.visits.detail', { id: visit.uuid });
    };

    $scope.load();
}]);