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
    $stateProvider.state('app.tables.detail', {
        url: "/{id}",
        templateUrl: "views/tables/detail.html",
        controller: 'TablesDetailController',
        label: 'Listas',
        icon: 'glyphicon glyphicon-align-left'
    });
}]);

app.controller('TablesDetailController', ['$rootScope', '$scope', '$stateParams', '$location', 'resources', '$q', '$state', function ($rootScope, $scope, $stateParams, $location, resources, $q, $state) {

    $scope.view = { edit: $stateParams.id != 'new', loading: true, saving: false, tab: 1 };
    $scope.data = {};

    $scope.load = function () {
        if ($scope.view.edit) {
            $q.all([resources.getTable($stateParams.id), resources.getElements($stateParams.id)])
                .then(function (data) {
                    $scope.data.table = data[0].data;
                    $scope.data.elements = data[1].data;
                    $scope.view.loading = false;
                    $scope.view.deleting = false;
                    $scope.view.saving = false;
                    $('#modalDelete').modal('hide');
                    $('#modalElement').modal('hide');
                });
        } else {
            $scope.view.loading = false;
        }
    };

    $scope.saveTable = function () {
        $scope.view.saving = true;
        resources.saveTable($stateParams.id, $scope.data.table)
            .success(function (data) {
                console.log(data);
                if ($stateParams.id == 'new') {
                    $state.go('app.tables.detail', { id: data });
                } else {
                    $scope.view.saving = false;
                }
            });
    };

    $scope.showElement = function (element) {
        if (element) {
            $scope.data.elementId = element.id;
            resources.getElement(element.id)
                .success(function (data) {
                    $scope.data.element = data;
                    $('#modalElement').modal('show');
                });
        } else {
            $scope.data.elementId = 'new';
            $scope.data.element = {
                tableHeaderId: $stateParams.id,
                labels: []
            };
            angular.forEach($rootScope.languages, function (language) {
                var item = { languageId: language.id };
                $scope.data.element.labels.push(item);
            });
            $('#modalElement').modal('show');
        }
    };

    $scope.confirmElement = function (item) {
        $scope.deleteItem = item;
        $('#modalDelete').modal('show');
    };

    $scope.deleteElement = function () {
        $scope.view.deleting = true;
        resources.deleteElement($scope.deleteItem.id)
            .success(function () {
                $scope.load();
            });
    };

    $scope.upElement = function (id) {
        resources.upElement(id)
            .success(function () {
                $scope.load();
            });
    };
    
    $scope.downElement = function (id) {
        resources.downElement(id)
            .success(function () {
                $scope.load();
            });
    };

    $scope.saveElement = function () {
        $scope.view.saving = true;
        resources.saveElement($scope.data.elementId, $scope.data.element)
            .success(function (data) {
                $scope.load();
            });
    };

    $scope.load();
}]);