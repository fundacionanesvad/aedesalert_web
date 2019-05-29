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
app.controller('MenuController', ['$scope', '$rootScope', '$location', '$state', function ($scope, $rootScope, $location, $state) {
    $scope.state = $state;
    var categories = {
        maps: { name: 'maps', label: 'Mapas', icon: 'glyphicon glyphicon-th', links: [] },
        traps: { name: 'traps', label: 'Ovitrampas', icon: 'fa fa-codepen', links: [] },
        admin: { name: 'admin', label: 'Administración', icon: 'glyphicon glyphicon-lock', links: [] }
    };
    var links = [];
    angular.forEach($state.get(), function (state) {
        if (state.link != null && $rootScope.checkAccess(state.access)) {
            if (state.category != null) {
                var category = categories[state.category];
                if (category.links.length == 0)
                    links.push(category);
                category.links.push(state);
            } else {
                links.push(state);
            }
        }
    });
    $scope.links = links;
}]);