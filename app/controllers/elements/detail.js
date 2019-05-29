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
    $stateProvider.state('app.tables.elements.detail', {
        url: "/{id}",
        templateUrl: "views/elements/detail.html",
        controller: 'ElementsDetailController',
        label: 'Listas',
        icon: 'glyphicon glyphicon-align-left'
    });
}]);

app.controller('ElementsDetailController', ['$scope', '$stateParams', '$location', 'resources', '$q', '$state', function ($scope, $stateParams, $location, resources, $q, $state) {

    $scope.edit = $stateParams.id != 'new';
    $scope.element = { tableHeaderId: $stateParams.parent, labels: [] };
    $scope.loading = true;
    $scope.saving = false;

    $scope.load = function () {
        var calls = [resources.getTable($stateParams.parent), resources.getLanguages()];
        if ($scope.edit)
            calls.push(resources.getElement($stateParams.id));
        $q.all(calls)
            .then(function (data) {
                $scope.table = data[0].data;
                $scope.languages = data[1].data;
                if ($scope.edit) {
                    $scope.element = data[2].data;
                } else {
                    angular.forEach($scope.languages, function (language) {
                        var item = { languageId: language.id };
                        $scope.element.labels.push(item);
                    });
                }
                $scope.loading = false;
            });
    };

    $scope.save = function () {
        $scope.saving = true;
        resources.saveElement($stateParams.id, $scope.element)
            .success(function (data) {
                $state.go('app.tables.elements.list', $stateParams.parent);
            });
    };

    $scope.load();
}]);