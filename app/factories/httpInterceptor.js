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
app.factory('httpInterceptor', ['$q', '$injector', '$rootScope', 'config', function ($q, $injector, $rootScope, config) {

    function handleError(response) {
        if (response.status == '401') {
            $injector.get('session').logout();
            $injector.get('$state').go('login');
        } else if (response.status == '403') {
            if ($rootScope.process403)
                $injector.get('$state').go('error403');
        } else if (response.status == '409') {
            //No hacemos nada, es un error de eliminación controlado
        } else if (response.status == '406') {
            //No hacemos nada, es un error de datos no validos controlado
        } else {
            $injector.get('$state').go('error');
        }
    }

    return {
        'responseError': function (response) {
            console.log(response);
            if ($('.modal.in').size() != 0 && response.config.url.indexOf('login') == -1) {
                $('.modal.in').on('hidden.bs.modal', function () {
                    handleError(response);
                    $rootScope.process403 = true;
                    $(this).off('hidden.bs.modal');
                });
                $('.modal.in').modal('hide');
            } else {
                handleError(response);
            }
            return $q.reject(response);
        },
        'request': function (request) {
            if (request.url.substr(-5) == '.html' && request.url.indexOf('views') != -1) {
                request.params = {
                    v: config.version
                }
            }
            return $q.when(request);
        }
    };
}]);