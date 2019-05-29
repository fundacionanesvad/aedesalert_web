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
app.controller('RestoreController', ['$scope', '$rootScope', '$http', 'resources', '$cookies', '$state', 'session', '$stateParams', function ($scope, $rootScope, $http, resources, $cookies, $state, session, $stateParams) {


    $scope.loading = false;
    $scope.error = false;

    $scope.validate = function () {
        resources.validateUrl($stateParams.urlToken)
		.success(function (data) {
		    console.log("validacion OK");
		})
		.error(function (data) {
		    $state.go('forgot');
		})
    };

    $scope.user = {
        login: "",
        newPass: "",
        confirmPass: ""
    };

    $scope.restore = function () {

        $scope.loading = true;
        console.log($scope.user.newPass);
        console.log($scope.user.confirmPass);

        if ($scope.user.newPass != $scope.user.confirmPass) {
            $scope.loading = false;
            $scope.textError = "Las contraseñas no coinciden";
            $scope.error = true;

        } else {
            resources.restorePass($scope.user)
			 .success(function (data) {
			     $scope.loading = false;
			     $scope.error = false;
			     $state.go('login');
			 })
			 .error(function (data, status) {
			     $scope.loading = false;
			     $scope.textError = "Nombre de usuario incorrecto";
			     $scope.error = true;
			 });
        }
    }
}]);