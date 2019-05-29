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
    $stateProvider.state('app.visits', {
        url: "/visits",
        templateUrl: "views/common/view.html",
        label: 'Visitas',
        icon: 'glyphicon glyphicon-search',
        link: 'app.visits.list',
        access: 'VISITS_VIEW'
    }).state('app.visits.list', {
        url: "/",
        templateUrl: "views/visits/list.html",
        controller: 'VisitsListController',
        label: 'Visitas',
        icon: 'glyphicon glyphicon-search'
    });
}]);

app.controller('VisitsListController', ['$scope', 'resources', '$state', 'NgTableParams', function ($scope, resources, $state, NgTableParams) {
    $scope.loading = true;
    $scope.results = [{ id: 2001, title: 'Inspecionada' }, { id: 2002, title: 'Cerrada' }, { id: 2003, title: 'Renuente' }, { id: 2004, title: 'Abandonada' }];
    $scope.picker = { opened: false };
    $scope.samplesTypes = [{ id: 1, title: 'Si' }, { id: 0, title: 'No' }];
    $scope.feverishTypes = [{ id: 1, title: 'Si' }, { id: 0, title: 'No' }];
    $scope.data = {};

    $scope.tableParams = new NgTableParams({
        page: 1,
        count: 10,
        sorting: { date: "desc" }
    }, {
        getData: function ($defer, params) {
            $scope.loading = true;
            var args = { filter: params.filter(), sorting: params.sorting(), count: params.count(), page: params.page() };
            resources.getVisits(args).success(function (data) {
                params.total(data.count);
                $scope.total = data.count;
                $scope.loading = false;
                $defer.resolve(data.visits);

                
            });
           
            
    }
    });

    $scope.detail = function (item) {
        $state.go('app.visits.detail', { id: item.uuid });
    };

    $scope.openPicker = function ($event) {
        $scope.picker.opened = true;
};
//$scope.load();
}]);