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
app.factory('session', ['$http', '$cookies', '$rootScope', function ($http, $cookies, $rootScope) {
    var session;

    function initialize() {
        session = {
            authorizationToken: null,
            name: "",
            area: null,
            modules: [],
            tokenExpiration: null
        };
    }

    function load() {
        if ($cookies.session == null) {
            initialize();
        } else {
            session = JSON.parse($cookies.session);
        }
        apply();
    }

    function apply() {
        $rootScope.username = session.name;
        $rootScope.userid = session.id;
        $rootScope.areaid = session.areaId;
        $rootScope.modules = session.modules;
        $http.defaults.headers.common.Authorization = session.authorizationToken;
    }

    function save() {
        $cookies.session = JSON.stringify(session);
        apply();
    }

    function login(data) {
        session = data;
        save();
    }

    function logout() {
        initialize();
        save();
    }

    function get() {
        return session;
    }

    function updateName(name) {
        session.name = name;
        save();
    }

    load();

    return {
        login: login,
        logout: logout,
        get: get,
        updateName: updateName
    };
}]);