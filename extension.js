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

import Gio from 'gi://Gio';

const MR_DBUS_IFACE = `
<node>
   <interface name="org.gnome.Shell.Extensions.Windows">
      <method name="List">
         <arg type="s" direction="out" name="win" />
      </method>
      <method name="Details">
         <arg type="u" direction="in" name="winid" />
         <arg type="s" direction="out" name="win" />
      </method>
      <method name="GetTitle">
         <arg type="u" direction="in" name="winid" />
         <arg type="s" direction="out" name="win" />
      </method>
      <method name="GetFrameBounds">
         <arg type="u" direction="in" name="winid" />
         <arg type="s" direction="out" name="frameBounds" />
      </method>
      <method name="MoveToWorkspace">
         <arg type="u" direction="in" name="winid" />
         <arg type="u" direction="in" name="workspaceNum" />
      </method>
      <method name="MoveResize">
         <arg type="u" direction="in" name="winid" />
         <arg type="i" direction="in" name="x" />
         <arg type="i" direction="in" name="y" />
         <arg type="u" direction="in" name="width" />
         <arg type="u" direction="in" name="height" />
      </method>
      <method name="Resize">
         <arg type="u" direction="in" name="winid" />
         <arg type="u" direction="in" name="width" />
         <arg type="u" direction="in" name="height" />
      </method>
      <method name="Move">
         <arg type="u" direction="in" name="winid" />
         <arg type="i" direction="in" name="x" />
         <arg type="i" direction="in" name="y" />
      </method>
      <method name="Maximize">
         <arg type="u" direction="in" name="winid" />
      </method>
      <method name="Minimize">
         <arg type="u" direction="in" name="winid" />
      </method>
      <method name="Unmaximize">
         <arg type="u" direction="in" name="winid" />
      </method>
      <method name="Unminimize">
         <arg type="u" direction="in" name="winid" />
      </method>
      <method name="Activate">
         <arg type="u" direction="in" name="winid" />
      </method>
      <method name="Close">
         <arg type="u" direction="in" name="winid" />
      </method>
   </interface>
</node>`;


export default class Extension {
  enable() {
    this._dbus = Gio.DBusExportedObject.wrapJSObject(MR_DBUS_IFACE, this);
    this._dbus.export(Gio.DBus.session, '/org/gnome/Shell/Extensions/Windows');
  }

  disable() {
    this._dbus.flush();
    this._dbus.unexport();
    delete this._dbus;
  }

  _get_window_by_wid(winid) {
    let win = global.get_window_actors().find(w => w.meta_window.get_id() == winid);
    return win;
  }

  Details(winid) {
    const w = this._get_window_by_wid(winid);

    if (!w) {
      throw new Error('Not found');
    }

    const workspaceManager = global.workspace_manager;
    const currentmonitor = global.display.get_current_monitor();
    // const monitor = global.display.get_monitor_geometry(currentmonitor);

    const props = {
      get: ['wm_class', 'wm_class_instance', 'pid', 'id', 'maximized', 'display', 'frame_type', 'window_type', 'layer', 'monitor', 'role', 'title'],
      can: ['close', 'maximize', 'minimize'],
      has: ['focus'],
      custom: new Map([
        ['moveable', 'allows_move'],
        ['resizeable', 'allows_resize'],
        ['area', 'get_work_area_current_monitor'],
        ['area_all', 'get_work_area_all_monitors'],
        ['canclose', 'can_close'],
        ['canmaximize', 'can_maximize'],
        ['canminimize', 'can_minimize'],
        ['canshade', 'can_shade'],
      ]),
      frame: ['x', 'y', 'width', 'height']
    };

    const win = {
      in_current_workspace: w.meta_window.located_on_workspace?.(workspaceManager.get_active_workspace?.()),
      area_cust: w.meta_window.get_work_area_for_monitor?.(currentmonitor)
    };

    props.get.forEach(name => win[name] = w.meta_window[`get_${name}`]?.());
    props.can.forEach(name => win[`can${name}`] = w.meta_window[`can_${name}`]?.());
    props.has.forEach(name => win[name] = w.meta_window[`has_${name}`]?.());
    props.custom.forEach((fname, name) => { win[name] = w.meta_window[fname]?.() });
    let frame = w.meta_window.get_frame_rect();
    props.frame.forEach(name => win[name] = frame[name]);

    return JSON.stringify(win);
  }

  List() {
    const win = global.get_window_actors();
    const workspaceManager = global.workspace_manager;

    const props = {
      get: ['wm_class', 'wm_class_instance', 'pid', 'id', 'frame_type', 'window_type', 'width', 'height', 'x', 'y'],
      has: ['focus'],
      // custom: new Map([])
    };

    const winJsonArr = win.map(w => {
      const win = {
        in_current_workspace: w.meta_window.located_on_workspace?.(workspaceManager.get_active_workspace?.())
      };
      props.get.forEach(name => win[name] = w.meta_window[`get_${name}`]?.());
      props.has.forEach(name => win[name] = w.meta_window[`has_${name}`]?.());
      // props.custom.forEach((fname, name) => { win[name] = w.meta_window[fname]?.() });
      return win;
    });

    return JSON.stringify(winJsonArr);
  }

  GetFrameBounds(winid) {
    let w = this._get_window_by_wid(winid);
    if (w) {
      const result = {
        frame_bounds: w.meta_window.get_frame_bounds(),
      }
      return JSON.stringify(result);
    } else {
      throw new Error('Not found');
    }
  }

  GetTitle(winid) {
    let w = this._get_window_by_wid(winid);
    if (w) {
      return w.meta_window.get_title();
    } else {
      throw new Error('Not found');
    }
  }

  MoveToWorkspace(winid, workspaceNum) {
    let win = this._get_window_by_wid(winid).meta_window;
    if (win) {
      win.change_workspace_by_index(workspaceNum, false);
    } else {
      throw new Error('Not found');
    }
  }

  MoveResize(winid, x, y, width, height) {
    let win = this._get_window_by_wid(winid);

    if (win) {
      if (win.meta_window.maximized_horizontally || win.meta_window.maximized_vertically) {
        win.meta_window.unmaximize(3);
      }

      win.meta_window.move_resize_frame(1, x, y, width, height);
    } else {
      throw new Error('Not found');
    }
  }

  Resize(winid, width, height) {
    let win = this._get_window_by_wid(winid);
    if (win) {
      if (win.meta_window.maximized_horizontally || win.meta_window.maximized_vertically) {
        win.meta_window.unmaximize(3);
      }
      win.meta_window.move_resize_frame(1, win.get_x(), win.get_y(), width, height);
    } else {
      throw new Error('Not found');
    }
  }

  Move(winid, x, y) {
    let win = this._get_window_by_wid(winid);
    if (win) {
      if (win.meta_window.maximized_horizontally || win.meta_window.maximized_vertically) {
        win.meta_window.unmaximize(3);
      }
      win.meta_window.move_frame(1, x, y);
    } else {
      throw new Error('Not found');
    }
  }

  Maximize(winid) {
    let win = this._get_window_by_wid(winid).meta_window;
    if (win) {
      win.maximize(3);
    } else {
      throw new Error('Not found');
    }
  }

  Minimize(winid) {
    let win = this._get_window_by_wid(winid).meta_window;
    if (win) {
      win.minimize();
    } else {
      throw new Error('Not found');
    }
  }

  Unmaximize(winid) {
    let win = this._get_window_by_wid(winid).meta_window;
    if (win) {
      win.unmaximize(3);
    } else {
      throw new Error('Not found');
    }
  }

  Unminimize(winid) {
    let win = this._get_window_by_wid(winid).meta_window;
    if (win) {
      win.unminimize();
    } else {
      throw new Error('Not found');
    }
  }

  Activate(winid) {
    let win = this._get_window_by_wid(winid).meta_window;
    if (win) {
      win.activate(0);
    } else {
      throw new Error('Not found');
    }
  }

  Close(winid) {
    let win = this._get_window_by_wid(winid).meta_window;
    if (win) {
      win.kill();
      // win.delete(Math.floor(Date.now() / 1000));
    } else {
      throw new Error('Not found');
    }
  }
}
