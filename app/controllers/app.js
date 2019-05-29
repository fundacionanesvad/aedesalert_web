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
var app = angular.module('sapev', ['ngCookies', 'ui.router', 'ngTable', 'uiGmapgoogle-maps', 'ui.bootstrap', 'checklist-model', 'flow', 'angular.filter', 'ui.tree', 'nemLogging']);

app.constant('config', {
    fakeApi: 'json/',
    //Aedes Alert Perú
    //apiUri: 'https://api.peru.aedesalert.com/AEDES_API/v1/',
    //favicon: 'favicon-peru',
    //appname: 'AEDES ALERT Perú',
    //Aedes Alert Taller
    //apiUri: 'https://api.taller.aedesalert.com/AEDES_API_TALLER/v1/',
    //favicon: 'favicon-taller',
    //appname: 'AEDES ALERT Taller',
    //Desarrollo
    apiUri: 'http://localhost:8080/AEDES_API/v1/',
    //apiUri: 'http://aedes.gruposca.com:8080/AEDES_API/v1/',
    favicon: 'favicon-dev',
    appname: 'AEDES ALERT Dev',
    version: '2.6.0'    //No olvidar cambiar la versión (css + js) en el index.html
});

app.config(['$httpProvider', '$stateProvider', '$urlRouterProvider', 'uiGmapGoogleMapApiProvider', 'config', function ($httpProvider, $stateProvider, $urlRouterProvider, uiGmapGoogleMapApiProvider, config) {
    $urlRouterProvider.otherwise("/login");

    $stateProvider.state('app', {
        url: "/app",
        abstract: true,
        templateUrl: "views/app.html"
    }).state('app.dashboard', {
        url: "/dashboard",
        templateUrl: "views/alerts/list.html",
        label: 'Avisos',
        icon: 'glyphicon glyphicon-warning-sign',
        controller: 'AlertsListController',
        link: 'app.dashboard'
    }).state('error', {
        url: "/error",
        templateUrl: "views/errors/error.html",
        label: 'Error',
        icon: 'glyphicon glyphicon-warning-sign'
    }).state('error403', {
        url: "/error403",
        templateUrl: "views/errors/error403.html",
        label: 'Error',
        icon: 'glyphicon glyphicon-warning-sign'
    });

    $httpProvider.interceptors.push('httpInterceptor');

    uiGmapGoogleMapApiProvider.configure({
        key: 'AIzaSyC1YNwztpRWjQpiW9wVXIy1PgDNS3-gqEw',
        language: 'es',
        libraries: 'drawing',
        v: '3'
    });
}]);

app.config(['flowFactoryProvider', function (flowFactoryProvider) {
    flowFactoryProvider.defaults = {
        permanentErrors: [404, 500, 501],
        maxChunkRetries: 1,
        chunkRetryInterval: 5000,
        simultaneousUploads: 4,
        singleFile: true
    };
    flowFactoryProvider.on('catchAll', function (event) {
        console.log('catchAll', arguments);
    });
}]);

app.run(['$location', '$rootScope', '$state', 'session', 'config', function ($location, $rootScope, $state, session, config) {

    $rootScope.toState = 'app.dashboard';
    $rootScope.toParams = null;
    $rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
        var auth = session.get();
        if (auth.authorizationToken == null || auth.tokenExpiration < $rootScope.toTimeStamp(new Date())) {
            if (toState.name != 'login' && toState.name != 'forgot' && toState.name != 'restore') {
                $rootScope.toState = toState.name;
                $rootScope.toParams = toParams;
                event.preventDefault();
                $state.go('login');
            }
        }
    });

    $rootScope.$on('$stateChangeSuccess', function (event, toState, toParams, fromState, fromParams) {
        $rootScope.apptitle = toState.label + ' - ' + $rootScope.appname;
        $rootScope.title = toState.label;
        $rootScope.icon = toState.icon;
        $rootScope.loginName = session.get().name;
        setTimeout(function () {
            $(window).trigger('resize');
        }, 10);
    });

    $rootScope.checkAccess = function (module) {
        return $rootScope.modules.indexOf(module) != -1;
    };

    $rootScope.newTimeStamp = function () {
        var date = new Date();
        date.setHours(0, 0, 0, 0);
        return date.getTime() - date.getTimezoneOffset() * 60000;
    };

    $rootScope.toTimeStamp = function (date) {
        return date.getTime() - date.getTimezoneOffset() * 60000;
    };

    $rootScope.newDate = function (timestamp) {
        var date = new Date(timestamp);
        return new Date(timestamp + date.getTimezoneOffset() * 60000);
    };

    $rootScope.favicon = config.favicon;
    $rootScope.appname = config.appname;
    $rootScope.version = config.version;
    $rootScope.process403 = true;
}]);