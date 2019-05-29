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
    $stateProvider.state('app.scenes', {
        url: "/scenes",
        templateUrl: "views/common/view.html",
        label: 'Escenarios',
        icon: 'glyphicon glyphicon-bullhorn',
        link: 'app.scenes.list',
        access: 'SCENES_VIEW'
    }).state('app.scenes.list', {
        url: "/",
        templateUrl: "views/scenes/list.html",
        controller: 'SceneListController',
        label: 'Escenarios',
        icon: 'glyphicon glyphicon-bullhorn'
    });
}]);


app.controller('SceneListController', ['$rootScope', '$scope', '$state', 'resources', '$q', 'session', function ($rootScope, $scope, $state, resources, $q, session) {

    $rootScope.scene = { sceneLevel: 1 };
    $scope.scene = { areaId:1, sceneLevel: 1 };
    $scope.saving = false;
    $scope.loading = true;
    $('#modalScene').modal('hide');

    $scope.load = function () {
        resources.getSceneList()
            .success(function (data) {
                $scope.items = data;
                $scope.loading = false;
                $scope.saving = false;
                $scope.deleting = false;
                $('#modalScene').modal('hide');
            });
    };

    $scope.editScene = function (item){
        $('#modalScene').modal('show');
        $scope.id = item.id;
        $scope.scene.areaId = item.areaId
    }       

    $scope.save = function () {
        $scope.saving = true;
        resources.saveScene($scope.id, $scope.scene)
            .success(function () {
                $scope.load();
            });
    };

    $scope.getButtonClass = function (level) {
        var value = 'btn btn-lg btn-';
        if ($scope.scene.sceneLevel != level) {
            value += 'light-';
        }
        switch (level) {
            case 1:
                value += 'success';
                break;
            case 2:
                value += 'warning';
                break;
            case 3:
                value += 'danger';
                break;
        }
        return value;
    }

    $scope.load();
}]);