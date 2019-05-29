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
app.directive('deleteButton', function () {
    return {
        restrict: 'E',
        template: '<span class="glyphicon glyphicon-remove icon-delete" aria-hidden="true" title="Eliminar" data-toggle="modal" data-target="#{{target}}" data-backdrop="static" data-keyboard="false" ng-click="eventHandler()"></span>',
        scope: {
            target: '@',
            eventHandler: '&ngClick'
        }
    };
});