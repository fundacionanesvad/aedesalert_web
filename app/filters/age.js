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
app.filter('age', function () {
    return function (date, isExact) {
        if (isExact) {
            var now = Date.now();
            var difference = new Date(now - date);
            return Math.abs(difference.getUTCFullYear() - 1970);
        } else {
            var birthday = new Date(date).getUTCFullYear();
            var now = new Date().getUTCFullYear();
            return now - birthday;
        }
    }
});