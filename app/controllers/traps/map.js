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
    $stateProvider.state('app.traps.map', {
        url: "/map",
        templateUrl: "views/traps/map.html",
        label: 'Mapa de calor',
        link: 'app.traps.map',
        controller: 'TrapsMapController',
        access: 'TRAPS_VIEW',
        category: 'traps'
    });
}]);

app.controller('TrapsMapController', ['$scope', 'resources', '$q', 'uiGmapGoogleMapApi', 'uiGmapIsReady', '$rootScope', '$filter', '$timeout', '$state', function ($scope, resources, $q, uiGmapGoogleMapApi, uiGmapIsReady, $rootScope, $filter, $timeout, $state) {
    //$scope.view = { edit: ($stateParams.id != 'new'), loading: true, saving: false, tab: 1, ready: 0 };
    $scope.loading = true;
    $scope.ready = 0;
    $scope.canAddSchedule = $scope.checkAccess('SCHEDULES_EDIT');
    $scope.saveover;
    $scope.data = {
        area: {},
        traps: [],
        previous: [],
        refresh: null,
        areas: [null, null, null, null, null, null],
        areaLists: [[], [], [], [], [], []],
        areaDescendants: [[], [], [], [], [], []],
        years: [],
        weeks: [],
        filters: {
            year: null,
            week: null
        },
        negative: true,
        positive: true,
        cclose: true,
        disappear: true,
        inspection: {},
        larvicides: [],
        inspections: [],

        parent: { id: 0, name: "", childs: [] },
        parents: []
    };
    $scope.heatmap = null;
    $scope.map = {
        area: [],
        areas: [],
        parent: [],
        childs: [],
        config: {
            center: { latitude: -8.110742, longitude: -79.027835 },
            zoom: 12,
            options: { mapTypeId: google.maps.MapTypeId.TERRAIN }
        },
        markers: [],
        circles: [],
        events: {

            mouseover: function (polygon, eventName, model) {
                $rootScope.$broadcast('tooltip_focus', model.name);
                $scope.saveover = model.name;
            },
            mouseout: function (polygon, eventName, model) {
                
                $rootScope.$broadcast('tooltip_focus', null);
            }
            
        },
        markerEvents: {
            click: function (marker, eventName, model) {
                $scope.map.window.model = model;
                $scope.map.window.show = true;
            },
           mouseover: function (polygon, eventName, model) { 
                $rootScope.$broadcast('tooltip_focus', $scope.saveover);
          
           },
            mouseout: function (polygon, eventName, model) {

                $rootScope.$broadcast('tooltip_focus', null);
            }
        },
        window: {
            show: false,
            close: function () {
                this.show = false;
                $scope.map.window.model = null;
            },
            create: function (model) {
                $scope.openInspection(model);
            }
        },
        size: {
            width: '100%',
            height: '100%'
        }

        
        
    };
    $scope.zoomController = null;
    $scope.tooltip = null;
    $scope.pickers = {
        startInspection: false,
        finishInspection: false,
        options: { startingDay: 1 },
        minDate: null,
        maxDate: null
    };
 
    $scope.printFormats = [
        { name: 'A4', width: 1024, height: 625 },
        { name: 'A3', width: 1600, height: 1024 },
        { name: 'A2', width: 2150, height: 1250 },
        { name: 'A1', width: 3100, height: 1950 },
        { name: 'A0', width: 4400, height: 2900 }
    ];
    $scope.printFormat = null;

    $scope.load = function () {
        console.log("load");//CONTROL FUNCIONES
        
        $rootScope.$broadcast('tooltip_focus', null);
        resources.getArea($rootScope.areaid)
            .then(function (response) {
                $scope.data.area = response.data;
                if (!$scope.data.area.typeId) {
                    $scope.data.area.typeId = 9001;
                }
                var index = $scope.data.area.typeId - 9001;
                $scope.data.areas[index] = $scope.data.area;
                $scope.data.areaLists[index].push($scope.data.area);
                $scope.data.area.id = $rootScope.areaid;
                $scope.loadDescendants($scope.data.area.id, $scope.data.area.typeId);

                
            });
    };

    $scope.loadWeeks = function () {
        if ($scope.data.filters.week == null)
            $scope.data.filters.week = $scope.getWeekNumber(new Date());
        $scope.data.weeks = [];
        var weeks = $scope.weeksInYear($scope.data.filters.year);
        for (var week = 1; week <= weeks; week++)
            $scope.data.weeks.push(week);
        $scope.loadData(false);
    };

    $scope.getWeekNumber = function (d) {
        d = new Date(+d);
        d.setHours(0, 0, 0);
        d.setDate(d.getDate() + 4 - (d.getDay() || 7));
        var yearStart = new Date(d.getFullYear(), 0, 1);
        var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7)
        return weekNo;
    };

    $scope.weeksInYear = function (year) {
        var d = new Date(year, 11, 31);
        var week = $scope.getWeekNumber(d);
        return week == 1 ? $scope.getWeekNumber(d.setDate(24)) : week;
    };

    $scope.loadDescendants = function (areaId, typeId) {
        console.log("loadDescendants");//CONTROL FUNCIONES
        var calls = [];
        for (var i = 9002; i <= 9005; i++) {
            if (i <= typeId)
                calls.push(resources.fakeArray());
            else
                calls.push(resources.getDescendantsByType(areaId, i));
        };
        $q.all(calls)
            .then(function (data) {
                for (var i = 9002; i <= 9005; i++)
                    $scope.data.areaDescendants[i - 9001] = data[i - 9002].data;
                $scope.data.filters.year = new Date().getFullYear();
                for (var year = 2017; year <= $scope.data.filters.year; year++)
                    $scope.data.years.push(year);
                $scope.loadWeeks();
                $scope.loadAreas($scope.data.area.typeId + 1);
                $scope.loading = false;
            });
    };

    $scope.loadAreas = function (typeId) {
        console.log("loadAreas");//CONTROL FUNCIONES
        
        var index = typeId - 9001;
        var id = $scope.data.areas[index - 1].id;
        $scope.data.areaLists[index] = [];
        $scope.data.areaDescendants[index].forEach(function (area) {
            if (id == undefined || area.parentId == id)
                $scope.data.areaLists[index].push(area);
        });
        if ($scope.data.areaLists[index].length) {
            $scope.data.areaLists[index].sort(function (a, b) {
                return a.name.localeCompare(b.name);
            });
            if (typeId == 9005)
                $scope.data.areaLists[index].splice(0, 0, { id: null, name: 'Todos' });
            $scope.data.areas[index] = $scope.data.areaLists[index][0];
            if (typeId < 9005)
                $scope.loadAreas(typeId + 1);
            else
                $scope.loadData(true);
        }
    };

    uiGmapGoogleMapApi.then(function (maps) {
        console.log("uiGmapGoogleMapApi");//CONTROL FUNCIONES
        $scope.map.config = {
            center: { latitude: -8.0625017, longitude: -79.0550047 },
            zoom: 8,
            options: { mapTypeId: google.maps.MapTypeId.HYBRID }
        };

        $scope.drawingManagerOptions = {
            drawingControl: false,
            polygonOptions: {
                strokeWeight: 0,
                fillOpacity: 0.05,
                editable: true,
                draggable: true,
                fillColor: '#1E90FF'
            }
        };

        $scope.drawingManagerControl = {};
    });


    $scope.loadDataPaint = function (microID) {
        console.log("loadDataPaint");//CONTROL FUNCIONES
        var calls;
        var calls = [resources.getAreaChilds(microID), resources.getAreaParents(microID)];
        $q.all(calls) 
            .then(function (data) {
                $scope.data.parent = data[0].data;
                $scope.data.parents = data[1].data;
                
                $scope.ready++;
                $scope.initializeMap(true);
                $scope.refreshing = false;
            });
    };

    $scope.convert = function (coords) {
        console.log("convert");//CONTROL FUNCIONES
        var path = [];
        if (coords != null) {
            JSON.parse(coords).forEach(function (coord) {
                var point = new google.maps.LatLng(coord.latitude, coord.longitude);
                
                path.push(point);
                $scope.map.bounds.extend(point);
            });
        }
        return path;
    };

    uiGmapIsReady.promise().then(function (instances) {
        console.log("uiGmapIsReady");//CONTROL FUNCIONES
       
        instances.forEach(function (instance) {
            $scope.map.instance = instance.map;
        });
       //  NEW //Activa el instant tooltip
        if ($scope.tooltip == null) {
            console.log("mouseover");
            $scope.toolTipContainer = $('.gm-style')[0];
            window.onmousemove = function (e) {
                if ($scope.tooltip == null) {
                    var selector = $('#instantTooltip');
                    if (selector.length != 0)
                        $scope.tooltip = selector;
                } else {
                    var scroll = $(document).scrollTop();
                    var offset = $($scope.toolTipContainer).offset();
                    $scope.tooltip.css({ top: (e.clientY + 20 - offset.top + scroll) + 'px', left: (e.clientX + 10 - offset.left) + 'px' });
                }
            };
        }
        google.maps.event.addListener($scope.drawingManagerControl.getDrawingManager(), 'polygoncomplete', function (polygon) {
            console.log("google.maps.event.addListener");//CONTROL FUNCIONES
            $scope.map.shape = polygon;
            $scope.drawingManagerControl.getDrawingManager().setDrawingMode(null);
            if ($scope.data.area.typeId == 9005) {
                var bounds = new google.maps.LatLngBounds();
                $scope.map.shape.getPath().forEach(function (point) {
                    bounds.extend(point);
                });
                
            }
        });

        $scope.initializeMap();
    });


    $scope.loadData = function (fitBounds) {
        console.log("loadData");//CONTROL FUNCIONES
        
        if ($scope.data.filters.year != null && $scope.data.areas[4] != null) {
            $scope.refreshing = true;
            $scope.map.window.show = false;
            if ($scope.data.areas[3] == null)
                $scope.data.filters.microrredId = $scope.data.areas[4].parentId;
            else
                $scope.data.filters.microrredId = $scope.data.areas[3].id;
            $scope.data.filters.eessId = $scope.data.areas[4].id;
            resources.getTrapsData($scope.data.filters)
                .success(function (data) {
                    $scope.data.refresh = new Date();
                    $scope.data.previous = $scope.data.traps;
                    var center = new google.maps.LatLng($scope.data.areas[4].latitude, $scope.data.areas[4].longitude);
                    $scope.data.traps = [];
                    for (var i = 0; i < data.length; i++) {
                        var trap = data[i];
                        var location = new google.maps.LatLng(trap.latitude, trap.longitude);
                        var distance = google.maps.geometry.spherical.computeDistanceBetween(location, center) | 0;
                        if (distance > 50000)
                            console.log('Ovitrampa omitida (distancia ' + distance + 'm)');
                        else
                            $scope.data.traps.push(trap);
                    }
                    


                    if ($scope.data.filters.eessId == null) {
                        $scope.loadDataPaint($scope.data.filters.microrredId);
                    } else if($scope.data.filters.eessId != null) {
                        $scope.loadDataPaint($scope.data.filters.eessId);
                    }
                    
                });
            
        }

        
    };



    $scope.initializeMap = function (fitBounds) {
        console.log("initializeMap");//CONTROL FUNCIONES

        if ($scope.ready > 1) {   
            $scope.map.bounds = new google.maps.LatLngBounds();
            //Dibuja el padre
            if ($scope.data.parent.coords) {
                $scope.map.parent = $scope.convert($scope.data.parent.coords);
            }

            //Dibuja los hermanos
            if ($scope.data.parent.childs) {
                $scope.map.childs = [];
                
                $scope.data.parent.childs.forEach(function (child) {
                    if (child.coords) {
                        $scope.map.childs.push({ id: child.id, path: $scope.convert(child.coords), clickable: false, name: child.name });
                    }
                });
            }

            var icon = {
                url: "/images/trap.png",
                size: new google.maps.Size(16, 16),
                anchor: new google.maps.Point(8, 8)
            };
            var iconBlue = {
                url: "/images/trapBlue.png",
                size: new google.maps.Size(16, 16),
                anchor: new google.maps.Point(8, 8)
            };
            var iconGreen = {
                url: "/images/trapGreen.png",
                size: new google.maps.Size(16, 16),
                anchor: new google.maps.Point(8, 8)
            };
            var iconYellow = {
                url: "/images/trapYellow.png",
                size: new google.maps.Size(16, 16),
                anchor: new google.maps.Point(8, 8)
            };
            var iconOrange = {
                url: "/images/trapOrange.png",
                size: new google.maps.Size(16, 16),
                anchor: new google.maps.Point(8, 8)
            };
            var iconRed = {
                url: "/images/trapRed.png",
                size: new google.maps.Size(16, 16),
                anchor: new google.maps.Point(8, 8)
            };

            $scope.bounds = new google.maps.LatLngBounds();
            
            $scope.map.markers.length = 0;
           
            for (var i = 0; i < $scope.data.traps.length; i++) {
                var filterCheck = false;
                var trap = $scope.data.traps[i];
                
                var marker = {
                    id: i,
                    latitude: trap.latitude,
                    longitude: trap.longitude,
                    icon: icon,
                    code: trap.code,
                    eggs: trap.eggs,
                    areaId: trap.areaId,
                    typeId: $scope.data.area.typeId,
                    trapId: trap.trapId,
                    result: null
                };
                if ($scope.data.negative) {
                    if (trap.eggs == 0 || trap.eggs == null) {
                        marker.icon = iconBlue;
                        filterCheck = true;
                    }
                }
                if ($scope.data.positive) {
                    if (trap.eggs > 0 && trap.eggs <= 60) {
                        marker.icon = iconGreen;
                    } else if (trap.eggs > 60 && trap.eggs <= 120) {
                        marker.icon = iconYellow;
                    } else if (trap.eggs > 120 && trap.eggs <= 150) {
                        marker.icon = iconOrange;
                    } else if (trap.eggs > 150) {
                        marker.icon = iconRed;
                    }
                    if (trap.eggs > 0) {
                        filterCheck = true;
                    }
                }
                if ($scope.data.cclose) {
                    if (trap.resultId == 11004) {
                        marker.icon = iconBlue;
                        filterCheck = true;
                    }   
                }
                if ($scope.data.disappear) {
                    if (trap.resultId == 11001 || trap.resultId == 11002 || trap.resultId == 11003) {
                        marker.icon = iconBlue;
                        filterCheck = true;
                    }
                }
                if (trap.eggs == null && trap.resultId == null)
                    marker.result = 'sin datos';
                if (trap.resultId)
                    marker.result = $filter('array')(trap.resultId, $rootScope.tables[11]);
                
                if (filterCheck) {
                    $scope.map.markers.push(marker);
                }
                
                $scope.bounds.extend(new google.maps.LatLng(trap.latitude, trap.longitude));
            }
            

            
            var child = $scope.data.parent;
            $scope.map.config.zoom = 12;
            if (fitBounds && $scope.bounds.isEmpty()) {
                $scope.bounds.extend(new google.maps.LatLng(child.latitude, child.longitude));
                $scope.map.instance.fitBounds($scope.bounds);
                $scope.zoomController = null;
            } else {
                $scope.map.instance.fitBounds($scope.bounds);
            }
            
          
            if ($scope.heatmap == null) {
                $scope.heatmap = new HeatmapOverlay($scope.map.instance, {
                    radius: 0.002,
                    scaleRadius: true,
                    useLocalExtrema: false,
                    latField: 'latitude',
                    lngField: 'longitude',
                    valueField: 'eggs',
                    onExtremaChange: function (data) {
                        $timeout(function () {
                            $scope.updateLegend(data);
                        }, 500);
                    },
                    gradient: {
                        '0': '#2c83b9',
                        '.3': '#33a02b',
                        '.6': '#f3ea0f',
                        '.75': '#f38b2a',
                        '1': '#d7191b'
                    },
                    minOpacity: .2,
                    maxOpacity: .7
                });
            }

           
            $scope.setData();
        }
    };

    $scope.setData = function () {
        console.log("setData");//CONTROL FUNCIONES
        if ($scope.data.refresh != null) {
            if ($scope.data.previous.length != $scope.data.traps.length) {
                $scope.heatmap.setData({
                    max: 200,
                    data: $scope.data.traps
                });
                $scope.data.refresh = null;
            } else {
                var time = Math.min(new Date() - $scope.data.refresh, 1000);
                var data = [];
                for (var i = 0; i < $scope.data.traps.length; i++) {
                    var trap = $scope.data.traps[i];
                    var previous = $scope.data.previous[i];
                    var item = {
                        latitude: trap.latitude,
                        longitude: trap.longitude,
                        eggs: ((trap.eggs * time + previous.eggs * (1000 - time))) / 1000 | 0
                    };
                    data.push(item);
                }
                $scope.heatmap.setData({
                    max: 200,
                    data: data
                });
                if (time < 1000) {
                    $timeout(function () {
                        $scope.setData();
                    }, 100);
                } else {
                    $scope.data.refresh = null;
                }
            }
        }
    };

    $scope.updateLegend = function (data) {
        //console.log("updateLegend");//CONTROL FUNCIONES
        var legendCanvas = document.createElement('canvas');
        legendCanvas.width = 100;
        legendCanvas.height = 10;
        var min = document.querySelector('#min');
        var max = document.querySelector('#max');
        var gradientImg = document.querySelector('#gradient');
        var legendCtx = legendCanvas.getContext('2d');
        var gradientCfg = {};
        if (min != null) {
            min.innerHTML = data.min;
            max.innerHTML = data.max;
            if (data.gradient != gradientCfg) {
                gradientCfg = data.gradient;
                var gradient = legendCtx.createLinearGradient(0, 0, 100, 1);
                for (var key in gradientCfg) {
                    gradient.addColorStop(key, gradientCfg[key]);
                }
                legendCtx.fillStyle = gradient;
                legendCtx.fillRect(0, 0, 100, 10);
                gradientImg.src = legendCanvas.toDataURL();
            }
        }
        if ($scope.zoomController == null) {
            $scope.map.config.zoom = 12;
            $scope.zoomController = 1;
        }
    };

    uiGmapIsReady.promise().then(function (instances) {
        console.log("uiGmapIsReady.promise()");//CONTROL FUNCIONES
        instances.forEach(function (instance) {
            $scope.map.instance = instance.map;
        });
        $scope.ready++;
        $scope.initializeMap(true);
    });

    uiGmapGoogleMapApi.then(function (maps) {
        console.log("uiGmapGoogleMapApi");//CONTROL FUNCIONES
        $(".angular-google-map").height('100%');
        $(".angular-google-map-container").height('100%');
       
    });

    $scope.openInspection = function (model) {

        function getDateOfISOWeek(w, y) {
            var simple = new Date(y, 0, 1 + (w - 1) * 7);
            var dow = simple.getDay();
            var ISOweekStart = simple;
            if (dow <= 4)
                ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1);
            else
                ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay());
            console.log(ISOweekStart);
            return ISOweekStart;
        }

        console.log("openInspection");//CONTROL FUNCIONES
        $scope.refreshing = true;
        $('#modalInspection').modal('show');
        $q.all([resources.getLarvicides(), resources.getAreaSchedules($scope.data.areas[3].id), resources.getArea(model.areaId)])
            .then(function (response) {
                $scope.data.larvicides = response[0].data;
                $scope.data.schedules = $filter("filter")(response[1].data, { typeId: 1002 });
                $scope.data.schedules = $filter("orderBy")($scope.data.schedules, '-startDate');
                $scope.data.inspections = [];
                $scope.data.inspection = {
                    startDate: $rootScope.newTimeStamp(),
                    finishDate: $rootScope.newTimeStamp(),
                    scheduleId: 0,
                    larvicideId: $scope.data.larvicides[0].id,
                    inspectionSize: response[2].data.houses,
                    coverage: 0,
                    typeId: 1002,
                    stateId: 3001,
                    areaId: model.areaId,
                    trapLatitude: model.latitude,
                    trapLongitude: model.longitude,
                    trapId: model.trapId,
                    trapDate: getDateOfISOWeek($scope.data.filters.week, $scope.data.filters.year).getTime()
                };
                if (!$scope.canAddSchedule && $scope.data.schedules.length > 0)
                    $scope.data.inspection.scheduleId = $scope.data.schedules[0].id;
                $scope.refreshing = false;
            });
    };

    $scope.selectSchedule = function () {
        console.log("selectSchedule");//CONTROL FUNCIONES
        if ($scope.data.inspection.scheduleId == 0) {
            $scope.data.inspections = [];
            $scope.pickers.minDate = null;
            $scope.pickers.maxDate = null;
            $scope.data.inspection.startDate = $rootScope.newTimeStamp();
            $scope.data.inspection.finishDate = $rootScope.newTimeStamp();
        } else {
            for (var i = 0; i < $scope.data.schedules.length; i++) {
                var schedule = $scope.data.schedules[i];
                if (schedule.id == $scope.data.inspection.scheduleId) {
                    $scope.pickers.minDate = $rootScope.newDate(schedule.startDate);
                    $scope.pickers.maxDate = $rootScope.newDate(schedule.finishDate);
                    $scope.data.inspection.startDate = schedule.startDate;
                    $scope.data.inspection.finishDate = schedule.finishDate;
                }
            }
            resources.getScheduleInspections($scope.data.inspection.scheduleId)
                .success(function (data) {
                    $scope.data.inspections = data;
                });
        }
    };

    $scope.openStartInspectionPicker = function ($event) {
        $scope.pickers.startInspection = true;
        $scope.pickers.finishInspection = false;
    };

    $scope.openFinishInspectionPicker = function ($event) {
        $scope.pickers.finishInspection = true;
        $scope.pickers.startInspection = false;
    };

    $scope.$watch('data.inspection.startDate', function () {
        if ($scope.data.inspection.startDate > $scope.data.inspection.finishDate)
            $scope.data.inspection.finishDate = $scope.data.inspection.startDate;
    });

    $scope.$watch('data.inspection.finishDate', function () {
        if ($scope.data.inspection.finishDate < $scope.data.inspection.startDate)
            $scope.data.inspection.startDate = $scope.data.inspection.finishDate;
    });

    $scope.createInspection = function () {
        console.log("createInspection");//CONTROL FUNCIONES
        $scope.saving = true;
        if ($scope.data.inspection.scheduleId == 0) {
            $scope.createSchedule();
        } else {
            console.log($scope.data.inspection);
            resources.saveInspection('new', $scope.data.inspection)
                .success(function (data) {
                    $('#modalInspection').modal('hide');
                    $timeout(function () {
                        $state.go('app.inspections.detail', { id: data });
                    }, 500);
                });
        }
    };

    $scope.createSchedule = function () {
        console.log("createSchedule");//CONTROL FUNCIONES
        var schedule = {
            startDate: $scope.data.inspection.startDate,
            finishDate: $scope.data.inspection.finishDate,
            larvicideId: $scope.data.inspection.larvicideId,
            typeId: $scope.data.inspection.typeId,
            areaId: $scope.data.areas[3].id,
            reconversionScheduleId: null
        };
        resources.saveSchedule('new', schedule)
            .success(function (data) {
                $scope.data.inspection.scheduleId = data;
                $scope.createInspection();
            });
    };
    $scope.formatChange = 'px';
    
    $scope.resizeMap = function () {
        console.log("resizeMap");//CONTROL FUNCIONES // $scope.printFormat.width + $scope.sizeChange.width + $scope.formatChange
        if ($scope.printFormat) {
            $scope.map.size.width = $scope.printFormat.width + $scope.formatChange;
            $scope.map.size.height = $scope.printFormat.height + $scope.formatChange;
            console.log("W-" + $scope.printFormat.width + "px / H-" + $scope.printFormat.height + "px");
        } else {
            console.log("W-" + $scope.map.size.width + "% / H-" + $scope.map.size.height + "%");
            $scope.map.size.width = '100%';
            $scope.map.size.height = '100%';
            console.log("W-" + $scope.map.size.width + "% / H-" + $scope.map.size.height + "%");
        }
        if (!$scope.bounds.isEmpty()) {
            $timeout(function () {
                console.log('fit');
                $scope.map.instance.fitBounds($scope.bounds);
            }, 500);
        }
        
    };

    $scope.print = function () {
        console.log("print");//CONTROL FUNCIONES
        window.print();
    };

    $scope.printMode = function () {
        console.log("printMode");//CONTROL FUNCIONES
        $scope.printFormat = $scope.printFormats[4];
        $scope.resizeMap();
    };

    $scope.screenMode = function () {
        console.log("screenMode");//CONTROL FUNCIONES
        $scope.printFormat = null;
        $scope.resizeMap();
    };

    $scope.setPrintFormat = function (format) {
        console.log("setPrintFormat" + format);//CONTROL FUNCIONES
        $scope.printFormat = format;
        
        $scope.resizeMap();
    };

    $scope.load();
}]);
//  NEW
app.controller('MapTooltipController', ['$scope', function ($scope) {
    console.log("app.controller");//CONTROL FUNCIONES
    $scope.area = null;
    $scope.$on('tooltip_focus', function (event, area) {
        $scope.area = area;
        
    });
}]);