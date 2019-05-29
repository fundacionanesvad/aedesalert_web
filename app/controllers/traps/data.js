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
    $stateProvider.state('app.traps.data', {
        url: "/data",
        templateUrl: "views/traps/data.html",
        link: 'app.traps.data',
        controller: 'TrapsDataController',
        label: 'Ingreso datos',
        access: 'TRAPS_EDIT',
        category: 'traps'
    });
}]);

app.controller('TrapsDataController', ['$scope', '$rootScope', 'resources', '$q', '$state', 'NgTableParams', function ($scope, $rootScope, resources, $q, $state, NgTableParams) {

    $scope.loading = true;
    $scope.access = {
        eggs: $rootScope.checkAccess('TRAPS_EDIT_EGGS'),
        results: $rootScope.checkAccess('TRAPS_EDIT_RESULTS')
    };
    $scope.data = {
        area: {},
        traps: [],
        areas: [null, null, null, null, null, null],
        areaLists: [[], [], [], [], [], []],
        areaDescendants: [[], [], [], [], [], []],
        years: [],
        weeks: [],
        filters: {
            year: null,
            week: null
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

    $scope.loadWeeks = function () {
        if ($scope.data.filters.week == null)
            $scope.data.filters.week = $scope.getWeekNumber(new Date());
        $scope.data.weeks = [];
        var weeks = $scope.weeksInYear($scope.data.filters.year);
        for (var week = 1; week <= weeks; week++)
            $scope.data.weeks.push(week);
        $scope.loadData();
    };

    $scope.getWeekNumber = function (d) {
        d = new Date(+d);
        d.setHours(0, 0, 0);
        d.setDate(d.getDate() + 4 - (d.getDay() || 7));
        var yearStart = new Date(d.getFullYear(), 0, 1);
        var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
        return weekNo;
    };

    $scope.weeksInYear = function (year) {
        var d = new Date(year, 11, 31);
        var week = $scope.getWeekNumber(d);
        return week == 1 ? $scope.getWeekNumber(d.setDate(24)) : week;
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
                $scope.loadWeeks();
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
            else
                $scope.loadData();
        }
    };

    $scope.loadData = function () {
        if ($scope.data.filters.year != null) {
            $scope.refreshing = true;
            if ($scope.data.areas[3] == null)
                $scope.data.filters.microrredId = $scope.data.areas[4].parentId;
            else
                $scope.data.filters.microrredId = $scope.data.areas[3].id;
            $scope.data.filters.eessId = $scope.data.areas[4].id;
            resources.getTrapsData($scope.data.filters)
                .success(function (data) {
                    $scope.data.traps = data;
                    $scope.refreshing = false;
                });
        }
    };

    $scope.saveChanges = function () {
        $scope.saving = true;
        var data = {
            year: $scope.data.filters.year,
            week: $scope.data.filters.week,
            data: $scope.data.traps
        };
        resources.saveTrapsData(data)
                .success(function (data) {
                    $scope.loadData();
                    $scope.saving = false;
                });
    };

    $scope.load();
}]);