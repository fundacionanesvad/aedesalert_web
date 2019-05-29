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
    $stateProvider.state('app.users.detail', {
        url: "/{id}",
        templateUrl: "views/users/detail.html",
        controller: 'UsersDetailController',
        label: 'Usuarios',
        icon: 'glyphicon glyphicon-user'
    });
}]);

app.controller('UsersDetailController', ['$rootScope', '$scope', '$stateParams', '$state', 'resources', '$q', function ($rootScope, $scope, $stateParams, $state, resources, $q) {

    $scope.edit = $stateParams.id != 'new';
    $scope.loading = true;
    $scope.saving = false;
    $scope.loadingTree = false;
    $scope.tre = false;
    $scope.data = [];
    $scope.errorArea = false;

    $scope.load = function () {
        var calls = [];
        if ($scope.edit) {
            calls.push(resources.getUser($stateParams.id));
        }
        $q.all(calls)
          .then(function (data) {
              if ($scope.edit) {
                  $scope.user = data[0].data;
                  $scope.loading = false;
              }else{
                  $scope.user = {
                      areaId: 1,
                      profileId: $rootScope.profiles[0].id,
                      languageId: $rootScope.languages[0].id
                  };
                  $scope.loading = false;
              }
          });
    };

    $scope.save = function () {
        $scope.saving = true;
        $scope.errorArea = false;

        if ($scope.user.areaName == null) {
            $scope.saving = false;
            $scope.errorArea = true;

        } else {
            resources.saveUser($stateParams.id, $scope.user)
           .success(function (data) {
               $state.go('app.users.list');
           });
        }
       
    };

    $scope.load();

    $scope.toggle = function (scope) {
        scope.toggle();

    };

    $scope.addArea = function (item) {
        $('#modalTree').modal('hide');
        $scope.user.areaId = item.id;
        $scope.user.areaName = item.title;
        $scope.$broadcast('angular-ui-tree:expand-all');
    };

    $scope.showTree = function (scope) {
        console.log(1);
        $scope.errorArea = false;
        $('#modalTree').modal('show');
        $scope.tree = false;
        console.log(2);
        $scope.loadingTree = true;
        console.log(3);
        if ($rootScope.data.length == 0) {
            console.log(4);
            resources.getTreeAreas()
                .success(function (data) {
                     $rootScope.data = data;
                     $scope.data = $rootScope.data;
                     $scope.$broadcast('angular-ui-tree:expand-all');
                     $scope.loadingTree = false;
                     $scope.tree = true;
                });
            console.log($rootScope.data);
        } else {
            console.log(6);
            $scope.data = $rootScope.data;
            $scope.loadingTree = false;
            $scope.tree = true;
        }
    };
}]);