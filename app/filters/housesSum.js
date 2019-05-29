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
app.filter('housesSum', function () {
    return function (areas, selected) {
        var sum = 0;
        for (var i = 0; i < areas.length; i++) {
            var area = areas[i];
            if (selected && selected.indexOf(area.id) != -1) {
                sum += Math.ceil(area.houses / 10);
            }
        }
        //sum = Math.min(sum, 20);
        return sum;
    }
});