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
    $stateProvider.state('app.samples', {
        url: "/samples",
        templateUrl: "views/samples/upload.html",
        label: 'Muestras',
        icon: 'glyphicon glyphicon-paperclip',
        link: 'app.samples',
        controller: 'SamplesUploadController',
        access: 'SAMPLES_VIEW'
    });
}]);

app.controller('SamplesUploadController', ['$scope', 'resources', '$q', '$state', 'config', 'session',  'download', function ($scope, resources, $q, $state, config, session, download) {

    $scope.uploading = false;
    $scope.uploaded = false;
    $scope.error = false;
    $scope.format = false;
    $scope.url = config.apiUri + 'samples/upload';
    $scope.token = session.get().authorizationToken;
    $scope.predicate = 'date';
    $scope.reverse = true;
    $scope.loading = true;

    $scope.load = function () {
        $q.all([resources.getSamples()])
            .then(function (data) {
                $scope.items = data[0].data;
                $scope.loading = false;
            });
    };

    $scope.fileAdded = function (file, event, flow) {
        $scope.uploaded = false;
        $scope.error = false;
        $scope.format = false;
        if (file.getExtension() == 'xlsx') {
            $scope.uploading = true;
        } else {
            $scope.format = true;
            return false;
        }
    };

    $scope.fileSuccess = function (file, message, flow) {
        $scope.uploading = false;
        $scope.uploaded = true;
        $scope.loading = true;
        $scope.load();
    };

    $scope.fileError = function ($file, $message, $flow) {
        $scope.uploading = false;
        $scope.error = true;
    };

    $scope.load();
   
    $scope.print = function (item) {
    $('#modalDownload').modal('show');
    resources.getSampleXls(item.inspectionId)
        .success(function (data, status, headers, config) {
            download.file(data, status, headers, config, "InformeMuestras.xlsx");
            $('#modalDownload').modal('hide');
        });

    };

}]);