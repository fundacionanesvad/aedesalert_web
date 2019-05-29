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
app.controller('TestController', ['$scope', 'ngTableParams', function ($scope, ngTableParams) {
    var users = [{ name: "Moroni", age: 50 },
                { name: "Tiancum", age: 43 },
                { name: "Jacob", age: 27 },
                { name: "Nephi", age: 29 },
                { name: "Enos", age: 34 },
                { name: "Moroni2", age: 50 },
                { name: "Tiancum2", age: 43 },
                { name: "Jacob2", age: 27 },
                { name: "Nephi2", age: 29 },
                { name: "Enos2", age: 34 },
                { name: "Moroni3", age: 50 },
                { name: "Tiancum3", age: 43 },
                { name: "Jacob3", age: 27 },
                { name: "Nephi3", age: 29 },
                { name: "Enos3", age: 34 }];

    $scope.tableParams = new ngTableParams({
            page: 1,            // show first page
            count: 4,          // count per page
            sorting: {
                name: 'asc'     // initial sorting
            }
        }, {
            total: users.length, // length of data
            getData: function ($defer, params) {
                console.log(params.url());
                $defer.resolve(users.slice((params.page() - 1) * params.count(), params.page() * params.count()));
            }
        });

    $scope.map = { center: { latitude: 45, longitude: -73 }, zoom: 8 };

    $scope.today = function () {
        $scope.dt = new Date();
    };
    $scope.today();

    $scope.clear = function () {
        $scope.dt = null;
    };

    // Disable weekend selection
    $scope.disabled = function (date, mode) {
        return (mode === 'day' && (date.getDay() === 0 || date.getDay() === 6));
    };

    $scope.toggleMin = function () {
        $scope.minDate = $scope.minDate ? null : new Date();
    };
    $scope.toggleMin();

    $scope.open = function ($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.opened = true;
    };

    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };

    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];

    $scope.log = function () {
        console.log($scope.dt);
    }
}]);