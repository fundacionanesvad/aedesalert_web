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
    $stateProvider.state('app.traps.export', {
        url: "/export",
        templateUrl: "views/traps/export.html",
        link: 'app.traps.export',
        controller: 'TrapsExportController',
        label: 'Exportación datos',
        access: 'TRAPS_VIEW',
        category: 'traps'
    });
}]);

app.controller('TrapsExportController', ['$scope', '$rootScope', 'resources', '$q', 'download', function ($scope, $rootScope, resources, $q, download) {

    $scope.loading = true;
    $scope.data = {
        area: {},
        areas: [null, null, null, null, null, null],
        areaLists: [[], [], [], [], [], []],
        areaDescendants: [[], [], [], [], [], []],
        years: [],
        filters: {
            year: null,
            microrredId: null,
            eessId: null
        }
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
                $scope.loadAreas($scope.data.area.typeId + 1);
                $scope.data.filters.year = new Date().getFullYear();
                for (var year = 2017; year <= $scope.data.filters.year; year++)
                    $scope.data.years.push(year);
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
            if (typeId == 9005)
                $scope.data.areaLists[index].splice(0, 0, { id: null, name: 'Todos' });
            $scope.data.areas[index] = $scope.data.areaLists[index][0];
            if (typeId < 9005)
                $scope.loadAreas(typeId + 1);
        }
    };

    $scope.exportData = function () {
        $('#modalDownload').modal('show');
        if ($scope.data.areas[3] == null)
            $scope.data.filters.microrredId = $scope.data.areas[4].parentId;
        else
            $scope.data.filters.microrredId = $scope.data.areas[3].id;
        $scope.data.filters.eessId = $scope.data.areas[4].id;
        resources.exportTraps($scope.data.filters)
            .success(function (data, status, headers, config) {
                download.file(data, status, headers, config, "Datos Ovitrampas.xlsx");
                $('#modalDownload').modal('hide');
            });
    };

    $scope.load();
}]);