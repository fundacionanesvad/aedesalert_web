﻿/*
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
    $stateProvider.state('app.febriles.detail', {
        url: "/{id}",
        templateUrl: "views/febriles/detail.html",
        controller: 'FebrilDetailController',
        label: 'Caso Dengue Confirmado',
        icon: '	fa fa-medkit'
    });
}]);

app.controller('FebrilDetailController', ['$rootScope', '$scope', '$stateParams', '$state', 'resources', '$q', function ($rootScope, $scope, $stateParams, $state, resources, $q) {


    $scope.id = $stateParams.id;
    $scope.edit = $rootScope.checkAccess('FEBRILES_EDIT');
    $scope.loading = true;
    $scope.data = {
        area: {},
        febrile: {},
        areas: [null, null, null, null, null, null],
        areaLists: [[], [], [], [], [], []],
        areaDescendants: [[], [], [], [], [], []]
    };
    $scope.picker = { opened: false };

    $scope.load = function () {
        var calls = [resources.getArea($rootScope.areaid)];
        if ($stateParams.id != 'new') {
            calls.push(resources.getFebrile($stateParams.id));
        }
        $q.all(calls)
            .then(function (response) {
                $scope.data.area = response[0].data;
                if (!$scope.data.area.typeId)
                    $scope.data.area.typeId = 9001;
                var index = $scope.data.area.typeId - 9001;
                $scope.data.areas[index] = $scope.data.area;
                $scope.data.areaLists[index].push($scope.data.area);
                $scope.data.area.id = $rootScope.areaid;
                if($stateParams.id == 'new'){
                    $scope.data.febrile.date = $rootScope.newTimeStamp();
                }else{
                    $scope.data.febrile = response[1].data;
                } 
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
                if ($scope.data.febrile.eessId)
                    $scope.loadAreasReverse({ id: $scope.data.febrile.eessId, typeId: 9005, parentId: $scope.data.febrile.microrredId });
                else
                    $scope.loadAreas($scope.data.area.typeId + 1);
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
        }
    };

    $scope.loadAreasReverse = function (area) {
        var index = area.typeId - 9001;
        if (area.typeId == $scope.data.area.typeId) {
            $scope.data.areas[index] = $scope.data.areaLists[index][0];
        } else {
            $scope.data.areaLists[index] = [];
            $scope.data.areaDescendants[index].forEach(function (descendant) {
                if (descendant.parentId == area.parentId)
                    $scope.data.areaLists[index].push(descendant);
                if (descendant.id == area.id)
                    $scope.data.areas[index] = descendant;
            });
            $scope.data.areaLists[index].sort(function (a, b) {
                return a.name.localeCompare(b.name);
            });
            $scope.data.areaDescendants[index - 1].forEach(function (parent) {
                if (parent.id == area.parentId) {
                    $scope.loadAreasReverse(parent);
                    return;
                }
            });
        }
    };

    $scope.save = function () {
        var saveLocation = $scope.saving;
        $scope.saving = true;
        $scope.data.febrile.eessId = $scope.data.areas[4].id;
        resources.saveFebrile($scope.id, $scope.data.febrile)
            .success(function (data) {
                  $state.go('app.febriles.list');
            });
    };

    $scope.openPicker = function ($event) {
        $scope.picker.opened = true;
    };

    $scope.load();
}]);