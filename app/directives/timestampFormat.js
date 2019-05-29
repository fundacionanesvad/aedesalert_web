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
app.directive('timestampFormat', function ($rootScope) {
    // Directive that converts timestamp back and forth from
    // seconds to Date object
    return {
        scope: true, // isolated scope
        require: 'ngModel',
        link: function(scope, element, attr, ngModelCtrl) {

            ngModelCtrl.$formatters.push(function (modelValue) {
                var date = new Date(modelValue);
                return {
                    timestamp: (modelValue ? new Date(modelValue + date.getTimezoneOffset() * 60000) : undefined)
                };
            });

            scope.$watch('timestamp', function () {
                ngModelCtrl.$setViewValue({ timestamp: scope.timestamp });
            });

            ngModelCtrl.$parsers.push(function (viewValue) {
                // returns $modelValue
                if (viewValue.timestamp instanceof Date)
                    return viewValue.timestamp.getTime() - viewValue.timestamp.getTimezoneOffset() * 60000;
                else 
                    return undefined;
            });

            ngModelCtrl.$render = function () {
                // renders timestamp to the view.
                if (!ngModelCtrl.$viewValue)
                    ngModelCtrl.$viewValue = { timestamp: undefined };
                scope.timestamp = ngModelCtrl.$viewValue.timestamp;
            };
        }
    };
});