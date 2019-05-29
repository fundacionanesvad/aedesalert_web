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
app.controller('AccountController', ['$rootScope', '$scope', '$state', 'resources', '$q', 'session', function ($rootScope, $scope, $state, resources, $q, session) {

    $scope.loading = false;
    $scope.error = false;

    $scope.load = function () {
        $q.all([resources.getAccount(), resources.getLanguages(), resources.getProfiles(), resources.getAllElements(), resources.getUsers()])
            .then(function (data) {
                $scope.account = data[0].data;
                $rootScope.languages = data[1].data;
                $rootScope.profiles = data[2].data;
                $rootScope.elements = {};
                $rootScope.tables = {};
                angular.forEach(data[3].data, function (element) {
                    $rootScope.elements[element.id] = element;
                    if (!$rootScope.tables[element.tableId])
                        $rootScope.tables[element.tableId] = [];
                    $rootScope.tables[element.tableId].push(element);
                });
                $rootScope.users = data[4].data;
                $rootScope.data = [];
            })
            .catch(function (error) {
                $state.go('app.error');
            });
    };

    $scope.save = function () {
        if ($scope.account.password1 != $scope.account.password2) {
            $scope.error = true;

        } else {
            $scope.error = false;
            $scope.loading = true;
            delete $scope.account.login;
            resources.saveAccount($scope.account)
                .success(function () {
                    resources.getAccount()
                        .success(function (data) {
                            $scope.account = data;
                            session.updateName(data.name);
                        })
                        .error(function () {
                            $state.go('app.error');
                        })
                        .finally(function () {
                            $scope.loading = false;
                            $('#accountModal').modal('hide');
                        });
                })
                .error(function () {
                    $scope.loading = false;
                    $state.go('app.error');
                });
        }       
    };

    $scope.load();
}]);