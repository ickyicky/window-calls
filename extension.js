/* extension.js
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <http://www.gnu.org/licenses/>.
 *
 * SPDX-License-Identifier: GPL-2.0-or-later
 */

/* exported init */

const { Gio } = imports.gi;

const MR_DBUS_IFACE = `
<node>
    <interface name="org.gnome.Shell.Extensions.Windows">
        <method name="List">
            <arg type="s" direction="out" name="win"/>
        </method>
    </interface>
</node>`;


class Extension {
    enable() {
        this._dbus = Gio.DBusExportedObject.wrapJSObject(MR_DBUS_IFACE, this);
        this._dbus.export(Gio.DBus.session, '/org/gnome/Shell/Extensions/Windows');
    }

    disable() {
        this._dbus.flush();
        this._dbus.unexport();
        delete this._dbus;
    }
    List() {
        let win = global.get_window_actors()
            .map(a => a.meta_window)
            .map(w => ({ class: w.get_wm_class(), pid: w.get_pid(), id: w.get_id(), maximized: w.get_maximized(), focus: w.has_focus(), title: w.get_title()}));
        return JSON.stringify(win);
    }
}

function init() {
    return new Extension();
}
