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
app.controller('AlertsListController', ['$scope', '$state', 'resources', function ($scope, $state, resources) {

    $scope.loading = true;

    $scope.load = function () {
        resources.getAlerts(false)
            .success(function (data) {
                $scope.items = data;
                $scope.loading = false;
            });
    };

    $scope.getAlertClass = function (typeId) {
        switch (typeId) {
            case '8001':
                return "panel panel-primary";
            case '8002':
                return "panel panel-red";
            case '8003':
                return "panel panel-yellow";
            case '8004':
                return "panel panel-red";
            case '8005':
                return "panel panel-green";
            case '8006':
                return "panel panel-primary";
            case '8007':
                return "panel panel-yellow";
            case '8008':
                return "panel panel-green";
            default:
                return "panel panel-primary";
        }
    };

    $scope.getAlertIcon = function (typeId) {
        switch (typeId) {
            case '8001':
                return "glyphicon glyphicon-map-marker fa-5x";
            case '8002':
                return "fa fa-eyedropper fa-5x";
            case '8003':
                return "fa fa-user-md fa-5x";
            case '8004':
                return "glyphicon glyphicon-bullhorn fa-5x";
            case '8005':
                return "glyphicon glyphicon-stats fa-5x";
            case '8006':
                return "fa fa-medkit fa-5x";
            case '8007':
                return "fa fa-codepen fa-5x";
            case '8008':
                return "glyphicon glyphicon-time fa-5x";
            default:
                return "fa fa-comments fa-5x";
        }
    };

    $scope.getAlertItemIcon = function (typeId) {
        switch (typeId) {
            case '8001':
                return "glyphicon glyphicon-map-marker fa-fw";
            case '8002':
                return "fa fa-bolt fa-fw";
            case '8003':
                return "fa fa-user fa-fw";
            case '8004':
                return "glyphicon glyphicon-bullhorn fa-fw";
            case '8005':
                return "glyphicon glyphicon-stats fa-fw";
            case '8006':
                return "fa fa-medkit fa-fw";
            case '8007':
                return "fa fa-codepen fa-fw";
            case '8008':
                return "glyphicon glyphicon-time fa-fw";
            default:
                return "fa fa-comments fa-fw";
        }
    };

    $scope.close = function ($event, item) {
        $event.preventDefault();
        $scope.items.splice($scope.items.indexOf(item), 1);
        resources.closeAlert(item.id);
    };

    $scope.openAlert = function ($event, item) {
        $scope.close($event, item);
        var url;
        var link = item.link;
        var myroute = link.substr(0, link.indexOf('('));

        if(myroute == ''){
            url = $state.href(link);
        } else {
            var parameter = link.substring(link.indexOf("'") + 1, link.lastIndexOf("'"));
            url = $state.href(myroute, { id: parameter });
        }
        window.open(url, '_blank');
    };


    $scope.load();
}]);