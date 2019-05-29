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
app.factory('resources', function ($http, config) {
    return {
        /*Fake*/
        fakeItem: function () {
            return $http.get('/json/fakeItem.txt');
        },
        fakeArray: function () {
            return $http.get('/json/fakeArray.txt');
        },

        /*Login*/
        login: function (user) {
            return $http.post(config.apiUri + 'auth/login', user);
        },

        /*Account*/
        getAccount: function () {
            return $http.get(config.apiUri + 'account');
        },
        saveAccount: function (item) {
            return $http.put(config.apiUri + 'account', item);
        },

        /*Perfiles*/
        getProfiles: function () {
            return $http.get(config.apiUri + 'profiles');
        },
        getProfile: function (id) {
            return $http.get(config.apiUri + 'profiles/' + id);
        },
        saveProfile: function (id, item) {
            if (id == 'new') {
                return $http.post(config.apiUri + 'profiles', item);
            } else {
                return $http.put(config.apiUri + 'profiles/' + id, item);
            }
        },
        deleteProfile: function (id) {
            return $http.delete(config.apiUri + 'profiles/' + id);
        },

        /*Modules*/
        getModules: function() {
            return $http.get(config.apiUri + 'modules');
        },

        /*Idiomas*/
        getLanguages: function () {
            return $http.get(config.apiUri + 'languages');
        },

        /*Usuarios*/
        getUsers: function () {
            return $http.get(config.apiUri + 'users');
        },
        getUsersInspection: function (id) {
            return $http.get(config.apiUri + 'users/area/' + id);
        },
        getUsersInspectionAdd: function (id) {
            return $http.get(config.apiUri + 'users/areaAdd/' + id);
        },
        getUserState: function (item) {
            return $http.post(config.apiUri + 'users/inspection',item);
        },
        getUsersParams: function (args) {
            return $http.put(config.apiUri + 'users', args);
        },
        getUser: function (id) {
            return $http.get(config.apiUri + 'users/' + id);
        },
        saveUser: function (id, item) {
            if (id == 'new') {
                return $http.post(config.apiUri + 'users', item);
            } else {
                return $http.put(config.apiUri + 'users/' + id, item);
            }
        },
        deleteUser: function (id) {
            return $http.delete(config.apiUri + 'users/' + id);
        },
        unlockUser: function (id) {
            return $http.put(config.apiUri + 'users/' + id + '/unlock');
        },

        /*Alertas*/
        getAlerts: function (closed) {
            return $http.get(config.apiUri + 'alerts/' + closed);
        },
        closeAlert: function (id) {
            return $http.put(config.apiUri + 'alerts/' + id + '/closed');
        },

        /*Zonas*/
        getAreas: function() {
            return $http.get(config.apiUri + 'areas');
        },
        getAreaChilds: function (id) {
            return $http.get(config.apiUri + 'areas/' + id + '/childs');
        },
        getAreaParents: function (id) {
            return $http.get(config.apiUri + 'areas/' + id + '/parents');
        },
        getAreaHouses: function (id) {
            return $http.get(config.apiUri + 'areas/' + id + '/houses');
        },
        getAreaSchedules: function (id) {
            return $http.get(config.apiUri + 'areas/' + id + '/schedules');
        },
        getAreaInspections: function (id) {
            return $http.get(config.apiUri + 'areas/' + id + '/inspections');
        },
        getAreaReports: function (id) {
            return $http.get(config.apiUri + 'areas/' + id + '/reports');
        },
        getAreaSectors: function (id) {
            return $http.get(config.apiUri + 'areas/' + id + '/sectors');
        },
        getAreaBlocks: function(id) {
            return $http.get(config.apiUri + 'areas/' + id + '/blocks');
        },
        getArea: function (id) {
            return $http.get(config.apiUri + 'areas/' + id);
        },
        saveArea: function (id, item) {
            if (id == 'new') {
                return $http.post(config.apiUri + 'areas', item);
            } else {
                return $http.put(config.apiUri + 'areas/' + id, item);
            }
        },
        deleteArea: function (id) {
            return $http.delete(config.apiUri + 'areas/' + id);
        },
        getDescendantsByType: function (id, typeId) {
            return $http.get(config.apiUri + 'areas/' + id + '/descendants/' + typeId);
        },
        getTreeAreas: function () {
            console.log(123);
            return $http.get(config.apiUri + 'areas/tree');
        },
        getAreaStatsMR: function (id, args) {
            return $http.put(config.apiUri + 'areas/' + id + '/statsmr', args);
        },
        getAreaStatsEESS: function (id, args) {
            return $http.put(config.apiUri + 'areas/' + id + '/statseess', args);
        },
        getFocusHouses: function (id, args) {
            return $http.put(config.apiUri + 'areas/' + id + '/focushouses', args);
        },
        /*Listas*/
        getTables: function () {
            return $http.get(config.apiUri + 'tables');
        },
        getTable: function (id) {
            return $http.get(config.apiUri + 'tables/' + id);
        },
        saveTable: function (id, item) {
            if (id == 'new') {
                return $http.post(config.apiUri + 'tables', item);
            } else {
                return $http.put(config.apiUri + 'tables/' + id, item);
            }
        },
        deleteTable: function (id) {
            return $http.delete(config.apiUri + 'tables/' + id);
        },

        /*Elementos*/
        getAllElements: function () {
            return $http.get(config.apiUri + 'elements');
        },
        getElements: function (id) {
            return $http.get(config.apiUri + 'tables/' + id + '/elements');
        },
        getElement: function (id) {
            return $http.get(config.apiUri + 'elements/' + id);
        },
        saveElement: function (id, item) {
            if (id == 'new') {
                return $http.post(config.apiUri + 'elements', item);
            } else {
                return $http.put(config.apiUri + 'elements/' + id, item);
            }
        },
        deleteElement: function (id) {
            return $http.delete(config.apiUri + 'elements/' + id);
        },
        upElement: function (id) {
            return $http.get(config.apiUri + 'elements/' + id + '/up');
        },
        downElement: function (id) {
            return $http.get(config.apiUri + 'elements/' + id + '/down');
        },

        /*Viviendas*/
        getHouses: function (args) {
            return $http.put(config.apiUri + 'houses', args);
        },
        getHouse: function (id) {
            return $http.get(config.apiUri + 'houses/' + id);
        },
        getHouseVisits: function (id) {
            return $http.get(config.apiUri + 'houses/' + id + '/visits');
        },
        saveHouse: function (id, item) {
            if (id == 'new') {
                return $http.post(config.apiUri + 'houses', item);
            } else {
                return $http.put(config.apiUri + 'houses/' + id, item);
            }
        },
        updateAddress: function (id, item) {
            return $http.put(config.apiUri + 'houses/' + id + '/updateaddress', item);
        },
        /*Visitas*/
        getVisits: function (args) {
            return $http.post(config.apiUri + 'visits', args);
        },
        getVisit: function (id) {
            return $http.get(config.apiUri + 'visits/' + id);
        },
        getVisitInventories: function (id) {
            return $http.get(config.apiUri + 'visits/' + id + '/inventories');
        },
        getVisitSamples: function (id) {
            return $http.get(config.apiUri + 'visits/' + id + '/samples');
        },
        getVisitPersons: function (id) {
            return $http.get(config.apiUri + 'visits/' + id + '/persons');
        },

        /*Inspecciones*/
        getInspections: function (args) {
            //return $http.get(config.apiUri + 'inspections', { params: args });
            return $http.put(config.apiUri + 'inspections', args);
        },
        getInspection: function (id) {
            return $http.get(config.apiUri + 'inspections/' + id);
        },
        getInspectionPlans: function (id) {
            return $http.get(config.apiUri + 'inspections/' + id + '/plans');
        },
        getInspectionPlanList: function (id, args) {
            return $http.put(config.apiUri + 'inspections/' + id + '/planList', args);
        },
        getInspectionVisits: function (id, args) {
            return $http.post(config.apiUri + 'inspections/' + id + '/visits', args);
        },
        getInspectorsXlsx: function (id) {
            return $http.get(config.apiUri + 'inspections/' + id + '/xlsx');
        },
        saveInspection: function (id, item) {
            if (id == 'new') {
                return $http.post(config.apiUri + 'inspections', item);
            } else {
                return $http.put(config.apiUri + 'inspections/' + id, item);
            }
        },
        deleteInspection: function (id) {
            return $http.delete(config.apiUri + 'inspections/' + id);
        },
        closeInspection: function (id) {
            return $http.get(config.apiUri + 'inspections/' + id + '/close');
        },
        getInspectionBlocks: function (id) {
            return $http.get(config.apiUri + 'inspections/' + id + '/blocks');
        },
        getSubstitutes: function (id) {
            return $http.get(config.apiUri + 'inspections/' + id + '/substitutes');
        },
        getSamplesInspection: function (id) {
            return $http.get(config.apiUri + 'inspections/' + id + '/samples');
        },
        getSamplesExcel: function (id) {
            return $http.get(config.apiUri + 'inspections/' + id + '/samplesExcel');
        },
        
        /*Schedules*/
        getSchedules: function (args) {
            return $http.put(config.apiUri + 'schedules', args);
        },
        getSchedule: function (id) {
            return $http.get(config.apiUri + 'schedules/' + id);
        },
        getScheduleInspections: function (id) {
            return $http.get(config.apiUri + 'schedules/' + id + '/inspections');
        },
        saveSchedule: function (id, item) {
            if (id == 'new') {
                return $http.post(config.apiUri + 'schedules', item);
            } else {
                return $http.put(config.apiUri + 'schedules/' + id, item);
            }
        },
        deleteSchedule: function (id) {
            return $http.delete(config.apiUri + 'schedules/' + id);
        },
        getScheduleReport:  function (id) {
            return $http.get(config.apiUri + 'reports/' + id + '/scheduleReport');
        },
        getScheduleAreaChilds: function (id) {
            return $http.get(config.apiUri + 'schedules/' + id + '/areachilds');
        },

        /*Planes*/
        getPlan: function (id) {
            return $http.get(config.apiUri + 'plans/' + id);
        },
        savePlan: function (item) {
            if (item.id) {
                var uri = config.apiUri + 'plans/' + item.id;
                delete item.id;
                return $http.put(uri, item);
            } else {
                return $http.post(config.apiUri + 'plans', item);
            }
        },
        deletePlan: function (id) {
            return $http.delete(config.apiUri + 'plans/' + id);
        },
        saveVisitsPlan: function (item) {
            return $http.put(config.apiUri + 'plans/importdetail', item);
        },
        saveSummaryPlan: function (id, item) {
            return $http.put(config.apiUri + 'plans/' + id + '/importsummary', item);
        },
        getPlanDetail: function (id) {
            return $http.get(config.apiUri + 'plans/' + id + '/planDetail');
        },
        getPlanReport: function (id) {
            return $http.get(config.apiUri + 'reports/' + id + '/planReport');
        },
        getPlansUser: function (id) {
            return $http.get(config.apiUri + 'plans/user');
        },
        sendInspectorExcel: function (id) {
            return $http.put(config.apiUri + 'plans/' + id + '/sendInspectorReport');
        },
        getInspectorReport: function (id) {
            return $http.get(config.apiUri + 'plans/' + id + '/getInspectorReport');
        },
        savePlanVisit: function (planId, uuid, item) {
            if (uuid == 'new') {
                return $http.post(config.apiUri + 'plans/' + planId + '/visits', item);
            } else {
                return $http.put(config.apiUri + 'plans/' + planId + '/visits/' + uuid, item);
            }
        },
        closePlan: function (id) {
            return $http.put(config.apiUri + 'plans/' + id + '/close');
        },
        getPlanVisitList: function (id) {
            return $http.get(config.apiUri + 'plans/' + id + '/visitlist');
        },
        getPlanVisitListTab: function (id, args) {
            return $http.put(config.apiUri + 'plans/' + id + '/visitlist', args);
        },
        deleteVisit: function (uuid) {
            return $http.delete(config.apiUri + 'visits/' + uuid);
        },

        /*Scenes*/
        getSceneList: function (id) {
            return $http.get(config.apiUri + 'scenes');
        },
        getScene: function (id) {
            return $http.get(config.apiUri + 'scenes/' + id);
        },
        saveScene: function (id, item) {
            return $http.put(config.apiUri + 'scenes/' + id, item);
        },
        deleteScene: function (id) {
            return $http.delete(config.apiUri + 'scenes/' + id);
        },

        /*Informes*/

        getReports: function (args) {
            return $http.put(config.apiUri + 'reports', args);
        },       
        getReport: function (id) {
            return $http.get(config.apiUri + 'reports/' + id);
        },
        getReportLines: function (id) {
            return $http.get(config.apiUri + 'reports/' + id + '/lines');
        },
        getReportSources: function (id) {
            return $http.get(config.apiUri + 'reports/' + id + '/sources');
        },
        getReportInspections: function(filters) {
            return $http.put(config.apiUri + 'reports/inspections', filters);
        },
        saveReport: function (id, item) {
            if (id == 'new') {
                return $http.post(config.apiUri + 'reports', item);
            } else {
                return $http.put(config.apiUri + 'reports/' + id, item);
            }
        },
        deleteReport: function (id) {
            return $http.delete(config.apiUri + 'reports/' + id);
        },
        //getReportPDF: function (id) {
        //    return $http.get(config.apiUri + 'reports/' + id + '/pdf');
        //},
        getReportXlsx: function (id) {
            return $http.get(config.apiUri + 'reports/' + id + '/xlsx');
        },
        /*Lineas informes*/
        saveReportLine: function (item) {
            return $http.post(config.apiUri + 'reportlines', item);
        },
        deleteReportLine: function (id, item) {
            return $http.delete(config.apiUri + 'reportlines/' + id);
        },

        /*Samples*/
        getSamples: function () {
            return $http.get(config.apiUri + 'samples');
        },
        getSampleXls: function (id) {
            return $http.get(config.apiUri + 'samples/' + id + '/excel');
        },

        /*Map*/
        getMapAedico: function (id, filters) {
            return $http.post(config.apiUri + 'maps/' + id + '/aedico', filters);
        },
        getMapFocus: function (id, filters) {
            return $http.post(config.apiUri + 'maps/' + id + '/focus', filters);
        },

        /*Forgot Login*/
        forgot: function (user) {
            return $http.post(config.apiUri + 'auth/sendUrl', user);
        },
        validateUrl: function (urlToken) {
            return $http.get(config.apiUri + 'auth/validateUrl/' + urlToken, { responseType: 'arraybuffer' });
        },
        restorePass: function (restoreInfo) {
            return $http.put(config.apiUri + 'auth/restorePassword', restoreInfo);
        },

        /*Febriles*/
        getFebriles: function (args) {
            return $http.put(config.apiUri + 'febriles', args);
        },
        deleteFebrile: function (id) {
            return $http.delete(config.apiUri + 'febriles/' + id);
        },
        getFebrile: function (id) {
            return $http.get(config.apiUri + 'febriles/' + id);
        },
        saveFebrile: function (id, item) {
            if (id == 'new') {
                return $http.post(config.apiUri + 'febriles', item);
            } else {
                return $http.put(config.apiUri + 'febriles/' + id, item);
            }
        },

        /*Traps*/
        getTrapsParams: function (args) {
            return $http.put(config.apiUri + 'traps', args);
        },
        getMapTraps: function (dates) {
            return $http.post(config.apiUri + 'traps', dates);
        },
        getTrap: function (id) {
            return $http.get(config.apiUri + 'traps/' + id);
        },
        saveTrap: function (id, item) {
            if (id == 'new') {
                return $http.post(config.apiUri + 'traps', item);
            } else {
                return $http.put(config.apiUri + 'traps/' + id, item);
            }
        },
        getTrapLocations: function(id) {
            return $http.get(config.apiUri + 'traps/' + id + '/locations');
        },
        saveTrapLocation: function (id, parent, item) {
            if (id == 'new') {
                return $http.post(config.apiUri + 'traps/' + parent + '/locations', item);
            } else {
                return $http.put(config.apiUri + 'traps/locations/' + id, item);
            }
        },
        getTrapsData: function (filters) {
            return $http.put(config.apiUri + 'traps/data', filters);
        },
        saveTrapsData: function (data) {
            return $http.post(config.apiUri + 'traps/data', data);
        },
        exportTraps: function (data) {
            return $http.post(config.apiUri + 'traps/report', data);
        },

        /*Larvicidas*/
        getLarvicides: function () {
            return $http.get(config.apiUri + 'larvicides');
        },
        getLarvicide: function (id) {
            return $http.get(config.apiUri + 'larvicides/' + id);
        },
        saveLarvicide: function (id, item) {
            if (id == 'new') {
                return $http.post(config.apiUri + 'larvicides', item);
            } else {
                return $http.put(config.apiUri + 'larvicides/' + id, item);
            }
        },
        deleteLarvicide: function (id) {
            return $http.delete(config.apiUri + 'larvicides/' + id);
        }
    };
});