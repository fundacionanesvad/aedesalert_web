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
    $stateProvider.state('app.profiles.detail', {
        url: "/{id}",
        templateUrl: "views/profiles/detail.html",
        controller: 'ProfilesDetailController',
        label: 'Roles',
        icon: 'glyphicon glyphicon-search'
    });
}]);

app.controller('ProfilesDetailController', ['$scope', '$stateParams', '$state', 'resources', '$q', '$rootScope', function ($scope, $stateParams, $state, resources, $q, $rootScope) {

    $scope.view = { edit: ($stateParams.id != 'new'), loading: true, saving: false };
    $scope.data = { profile: {}, modules: [] };
    $scope.data.names = {
        WEB: { name: "Acceso web", order: 11 },
        SYNC: { name: "Sincronizar móvil", order: 12 },
        AREAS_VIEW: { name: "Ver zonas", key: "Zonas", order: 21 },
        AREAS_EDIT: { name: "Editar zonas", key: "Zonas", order: 22 },
        SCHEDULES_VIEW: { name: "Ver planificación", order: 31 },
        SCHEDULES_EDIT: { name: "Editar planificación", order: 32 },
        INSPECTIONS_VIEW: { name: "Ver inspecciones", order: 35 },
        INSPECTIONS_EDIT: { name: "Editar inspecciones", order: 36 },
        PLANS_SEND: { name: "Envío emails", order: 37 },
        HOUSES_VIEW: { name: "Ver viviendas", order: 41 },
        HOUSES_EDIT: { name: "Editar viviendas", order: 42 },
        VISITS_VIEW: { name: "Ver visitas", order: 51 },
        SAMPLES_VIEW: { name: "Ver muestras", order: 61 },
        SAMPLES_EDIT: { name: "Subir muestras", order: 62 },
        FEBRILES_EDIT: { name: "Editar casos dengue", order: 71 },
        FEBRILES_VIEW: { name: "Ver casos dengue", order: 72 },
        REPORTS_VIEW: { name: "Ver informes", order: 81 },
        REPORTS_EDIT: { name: "Editar informes", order: 82 },
        MAPS_VIEW: { name: "Ver mapas", order: 91 },
        SCENES_VIEW: { name: "Ver escenarios", order: 95 },
        SCENES_EDIT: { name: "Modificar escenarios", order: 96 },
        TRAPS_VIEW: { name: "Ver ovitrampas", order: 101 },
        TRAPS_EDIT: { name: "Gestionar ovitrampas", order: 102 },
        TRAPS_EDIT_EGGS: { name: "Ingresar huevos ovitrampas", order: 103 },
        TRAPS_EDIT_RESULTS: { name: "Ingresar resultados ovitrampas", order: 104 },
        PROFILES_EDIT: { name: "Administrar roles", key: "Administración", order: 112 },
        USERS_EDIT: { name: "Administrar usuarios", key: "Administración", order: 111 },
        TABLES_EDIT: { name: "Administrar listas", key: "Administración", order: 113 },
        LARVICIDES_EDIT: { name: "Administrar larvicidas", key: "Administración", order: 114 },
        PLANS_VIEW: { name: "Ver planes", order: 121 },
        PLANS_EDIT: { name: "Completar planes", order: 122 },
        LARVICIDES_VIEW: { name: "Gestionar larvicidas", order: 131 }
    };
    
    $scope.load = function () {
        var calls = [resources.getModules(), resources.getElements(8)];
        if ($scope.view.edit) {
            calls.push(resources.getProfile($stateParams.id));
        } else {
            $scope.data.profile = {
                modules: [],
                alerts: []
            };
        }
        $q.all(calls)        
            .then(function (data) {
                if ($scope.view.edit) {
                    $scope.data.profile = data[2].data;
                }
                data[0].data.forEach(function (item) {
                    var match = null;
                    $scope.data.modules.forEach(function (module) {
                        if (module.group == item.group) {
                            match = module;
                        }
                    });
                    if (match == null) {
                        if ($scope.data.names[item.group] == null)
                            $scope.data.names[item.group] = { name: item.group, order: 100 };
                        match = {
                            group: item.group,
                            name: $scope.data.names[item.group].name,
                            order: $scope.data.names[item.group].order,
                            checked: false,
                            modules: []
                        };
                        if (match.name == null)
                            match.name = item.group;
                        $scope.data.modules.push(match);
                    }
                    match.modules.push(item.id);
                    if ($scope.data.profile.modules.indexOf(item.id) != -1)
                        match.checked = true;
                });
                $scope.data.alerts = data[1].data;
                $scope.data.alerts.forEach(function (alert) {
                    alert.checked = $scope.data.profile.alerts.indexOf(alert.id) != -1;
                });
                $scope.view.loading = false;
            });
    };

    $scope.save = function () {
        $scope.saving = true;
        $scope.data.profile.modules = [];
        $scope.data.profile.alerts = [];
        $scope.data.modules.forEach(function (module) {
            if (module.checked) {
                module.modules.forEach(function (value) {
                    $scope.data.profile.modules.push(value);
                });
            }
        });
        $scope.data.alerts.forEach(function (alert) {
            if (alert.checked) {
                $scope.data.profile.alerts.push(alert.id);
            }
        });
        resources.saveProfile($stateParams.id, $scope.data.profile)
            .success(function (data) {
                $state.go('app.profiles.list');
            });
    };

    $scope.load();
}]);