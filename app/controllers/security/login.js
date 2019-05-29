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
    $stateProvider.state('login', {
        url: "/login",
        label: "Iniciar sesión",
        templateUrl: "views/security/login.html",
        controller: 'LoginController'
    }).state('forgot', {
        url: '/forgot',
        label: "Recuperar contraseña",
        templateUrl: "views/security/login_forgot.html",
        controller: 'ForgotController'

    });
}]);

app.controller('LoginController', ['$scope', '$rootScope', '$http', 'resources', '$cookies', '$state', 'session', function ($scope, $rootScope, $http, resources, $cookies, $state, session) {

    $scope.loading = false;
    $scope.error = false;
    $scope.errorBlocked = false;

    $scope.login = function () {
        $scope.error = false;
        $scope.errorBlocked = false;
        $scope.loading = true;
        resources.login($scope.user)
            .success(function (data) {
                if (data.blocked) {
                    $scope.loading = false;
                    $scope.errorBlocked = true;
                } else {
                   session.login(data);
                   $state.go($rootScope.toState, $rootScope.toParams);
                   $rootScope.toState = 'app.dashboard';
                   $rootScope.toParams = null;
                }
            })
            .error(function () {
                $scope.error = true;
                $scope.loading = false;
            });
    };

    if (session.get().authorizationToken != null) {
        $state.go('app.dashboard');
    }
}]);