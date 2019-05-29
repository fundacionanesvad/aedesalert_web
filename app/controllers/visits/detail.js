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
    $stateProvider.state('app.visits.detail', {
        url: "/{id}",
        templateUrl: "views/visits/detail.html",
        controller: 'VisitsDetailController',
        label: 'Visitas',
        icon: 'glyphicon glyphicon-search'
    });
}]);

app.controller('VisitsDetailController', ['$scope', '$stateParams', '$state', 'resources', '$q', function ($scope, $stateParams, $state, resources, $q) {

    $scope.view = { loading: true, saving: false, tab: 1, extended: false };
    $scope.data = {};
    
    $scope.load = function () {
        $q.all([resources.getVisit($stateParams.id), resources.getVisitInventories($stateParams.id), resources.getVisitSamples($stateParams.id), resources.getVisitPersons($stateParams.id)])
            .then(function (data) {
                $scope.data.visit = data[0].data;
                $scope.data.larvicide = data[1].data.larvicide;
                $scope.data.inventories = data[1].data.inventories;
                $scope.data.samples = data[2].data;
                $scope.data.persons = data[3].data;
                $scope.view.extended = $scope.data.visit.resultName == 'Inspeccionada';
                $scope.view.loading = false;
            });
    };

    $scope.sumInventories = function () {
        var total = 0;
        if ($scope.data.inventories != undefined) {
            for (var i = 0; i < $scope.data.inventories.length; i++) {
                total += $scope.data.inventories[i].inspected;
            }
        }
        return total;
    };

    $scope.load();
}]);