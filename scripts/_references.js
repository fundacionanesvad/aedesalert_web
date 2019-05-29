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

/// <autosync enabled="true" />
/// <reference path="../app/controllers/alerts/list.js" />
/// <reference path="../app/controllers/app.js" />
/// <reference path="../app/controllers/areas/detail.js" />
/// <reference path="../app/controllers/areas/list.js" />
/// <reference path="../app/controllers/areas/tools.js" />
/// <reference path="../app/controllers/elements/detail.js" />
/// <reference path="../app/controllers/elements/list.js" />
/// <reference path="../app/controllers/febriles/detail.js" />
/// <reference path="../app/controllers/febriles/list.js" />
/// <reference path="../app/controllers/houses/detail.js" />
/// <reference path="../app/controllers/houses/list.js" />
/// <reference path="../app/controllers/houses/tools.js" />
/// <reference path="../app/controllers/inspections/detail.js" />
/// <reference path="../app/controllers/inspections/list.js" />
/// <reference path="../app/controllers/larvicides/detail.js" />
/// <reference path="../app/controllers/larvicides/list.js" />
/// <reference path="../app/controllers/maps/aedico.js" />
/// <reference path="../app/controllers/maps/focus.js" />
/// <reference path="../app/controllers/maps/situation.js" />
/// <reference path="../app/controllers/menu.js" />
/// <reference path="../app/controllers/plans/detail.js" />
/// <reference path="../app/controllers/plans/list.js" />
/// <reference path="../app/controllers/plans/summary.js" />
/// <reference path="../app/controllers/profiles/detail.js" />
/// <reference path="../app/controllers/profiles/list.js" />
/// <reference path="../app/controllers/reports/detail.js" />
/// <reference path="../app/controllers/reports/list.js" />
/// <reference path="../app/controllers/samples/upload.js" />
/// <reference path="../app/controllers/scenes/list.js" />
/// <reference path="../app/controllers/schedules/detail.js" />
/// <reference path="../app/controllers/schedules/list.js" />
/// <reference path="../app/controllers/security/account.js" />
/// <reference path="../app/controllers/security/forgot.js" />
/// <reference path="../app/controllers/security/login.js" />
/// <reference path="../app/controllers/security/logout.js" />
/// <reference path="../app/controllers/security/restore.js" />
/// <reference path="../app/controllers/tables/detail.js" />
/// <reference path="../app/controllers/tables/list.js" />
/// <reference path="../app/controllers/test.js" />
/// <reference path="../app/controllers/traps/data.js" />
/// <reference path="../app/controllers/traps/detail.js" />
/// <reference path="../app/controllers/traps/export.js" />
/// <reference path="../app/controllers/traps/list.js" />
/// <reference path="../app/controllers/traps/map.js" />
/// <reference path="../app/controllers/users/detail.js" />
/// <reference path="../app/controllers/users/list.js" />
/// <reference path="../app/controllers/visits/detail.js" />
/// <reference path="../app/controllers/visits/list.js" />
/// <reference path="../app/directives/alertModal.js" />
/// <reference path="../app/directives/checkAccess.js" />
/// <reference path="../app/directives/checkIcon.js" />
/// <reference path="../app/directives/deleteButton.js" />
/// <reference path="../app/directives/deleteModal.js" />
/// <reference path="../app/directives/editButton.js" />
/// <reference path="../app/directives/enableEdit.js" />
/// <reference path="../app/directives/inputRequired.js" />
/// <reference path="../app/directives/labelRequired.js" />
/// <reference path="../app/directives/loading.js" />
/// <reference path="../app/directives/stopEvent.js" />
/// <reference path="../app/directives/timestampFormat.js" />
/// <reference path="../app/factories/download.js" />
/// <reference path="../app/factories/httpInterceptor.js" />
/// <reference path="../app/factories/resources.js" />
/// <reference path="../app/factories/session.js" />
/// <reference path="../app/filters/age.js" />
/// <reference path="../app/filters/array.js" />
/// <reference path="../app/filters/element.js" />
/// <reference path="../app/filters/firstUpper.js" />
/// <reference path="../app/filters/housesSum.js" />
/// <reference path="../app/filters/percentage.js" />
/// <reference path="../app/filters/shortDate.js" />
/// <reference path="../app/scripts.js" />
/// <reference path="angularjs/angular.js" />
/// <reference path="angularjs/angular-filter.js" />
/// <reference path="angularjs/angular-google-maps.js" />
/// <reference path="angularjs/angular-google-maps.min.js" />
/// <reference path="angularjs/angular-simple-logger.js" />
/// <reference path="angularjs/angular-ui-router.js" />
/// <reference path="angularjs/angular-ui-tree.js" />
/// <reference path="angularjs/checklist-model.js" />
/// <reference path="angularjs/cookies.js" />
/// <reference path="angularjs/ng-animate.js" />
/// <reference path="angularjs/ng-flow-standalone.js" />
/// <reference path="angularjs/ng-table.js" />
/// <reference path="angularjs/ui-bootstrap.js" />
/// <reference path="bootstrap/js/bootstrap.js" />
/// <reference path="heatmap/gmap-heatmap.js" />
/// <reference path="heatmap/heatmap.js" />
/// <reference path="jquery/jquery-1.11.2.js" />
/// <reference path="lodash/lodash.js" />
/// <reference path="metisMenu/metisMenu.js" />
/// <reference path="sb-admin2/sb-admin-2.js" />
