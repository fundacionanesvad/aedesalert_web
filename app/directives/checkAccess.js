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
app.directive('checkAccess', function (ngIfDirective, $rootScope) {
    var ngIf = ngIfDirective[0];

    return {
        transclude: ngIf.transclude,
        priority: ngIf.priority,
        terminal: ngIf.terminal,
        restrict: ngIf.restrict,
        link: function ($scope, $element, $attr) {
            var value = $attr['checkAccess'];
            if (value == 'link.access')
                value = $scope.$eval(value);
            var modules = value.split(',');
            var access = true;
            for (var index = 0; index < modules.length; index++) {
                if (modules[index].startsWith('!'))
                    access &= $rootScope.modules.indexOf(modules[index].substring(1)) == -1;
                else
                    access &= $rootScope.modules.indexOf(modules[index]) != -1;
            }
            var yourCustomValue = $scope.$eval(access ? 'true' : 'false');
            $attr.ngIf = function () {
                return yourCustomValue;
            };
            ngIf.link.apply(ngIf, arguments);
        }
    };
});