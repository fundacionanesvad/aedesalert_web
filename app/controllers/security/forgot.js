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
    $stateProvider.state('restore', {
        url: '/restore/:urlToken',
        templateUrl: "views/security/restore.html",
        controller: 'RestoreController'
    });
}]);

app.controller('ForgotController', ['$scope', '$rootScope', '$http', 'resources', '$cookies', '$state', 'session', function ($scope, $rootScope, $http, resources, $cookies, $state, session) {

    $scope.loading = false;
    $scope.error = false;
    $scope.ok = false;


    $scope.forgot = function () {
        $scope.error = false;
        $scope.loading = true;

        resources.forgot($scope.user)
            .success(function (data) {
                $scope.ok = true;
                $scope.loading = false;
            })
            .error(function () {
                $scope.error = true;
                $scope.loading = false;
                console.log("ERROR");

            });
    };  

}]);