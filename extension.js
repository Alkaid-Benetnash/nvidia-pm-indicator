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

const GETTEXT_DOMAIN = 'nvidia-pm-indicator-extension';

const { GObject, St } = imports.gi;

const Gettext = imports.gettext.domain(GETTEXT_DOMAIN);
const _ = Gettext.gettext;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const Mainloop = imports.mainloop;
const Lang = imports.lang;
const Gio = imports.gi.Gio;
const GLib = imports.gi.GLib;
const ByteArray = imports.byteArray;

const sysfsdir = '/sys/bus/pci/devices/0000:00:01.0/power';
const status_path = sysfsdir + '/runtime_status';
const activeText = 'active';
const suspendText = 'suspended'
const Indicator = GObject.registerClass(
class Indicator extends PanelMenu.Button {
    _init() {
        super._init(0.0, _('Nvidia Power Managment Indicator'), 
            /*dontCreateMenu*/ false);
        let iconPath = Me.path + '/icons';
        let activeIconPath = iconPath + '/nvidia-active.svg';
        let suspendIconPath = iconPath + '/nvidia-suspend.svg';
        this.activeIcon = Gio.icon_new_for_string(activeIconPath);
        this.suspendIcon = Gio.icon_new_for_string(suspendIconPath);

        let box = new St.BoxLayout({ style_class: 'panel-status-menu-box' });
        this.icon = new St.Icon({style_class: 'system-status-icon'});
        // init state to be actived
        this.state = 'active';
        this.icon.set_gicon(this.activeIcon);
        box.add_child(this.icon);
        this.add_child(box);

        this.statusLabel = new PopupMenu.PopupMenuItem(_(activeText));
        this.menu.addMenuItem(this.statusLabel);
        this._refresh();
        this.timeoutCB = Mainloop.timeout_add_seconds(30, Lang.bind(this, this._refresh));
    }
    // _refresh() should return true to be continuously called by Mainloop
    _refresh() {
        let statefile = Gio.File.new_for_path(status_path);
        let state = ByteArray.toString(statefile.load_contents(null)[1]);
        let oldstate = this.state;
        if (state.indexOf('active') != -1) {
            this.state = 'active';
        } else if (state.indexOf('suspend') != -1 ) {
            this.state = 'suspend';
        }
        if (oldstate != this.state) {
            if (this.state == 'active') {
                this.icon.set_gicon(this.activeIcon);
                this.statusLabel.label.set_text(activeText);
            } else if (this.state == 'suspend') {
                this.icon.set_gicon(this.suspendIcon);
                this.statusLabel.label.set_text(suspendText);
            }
        }
        return true;
    }
});

class Extension {
    constructor(uuid) {
        this._uuid = uuid;

        ExtensionUtils.initTranslations(GETTEXT_DOMAIN);
    }

    enable() {
        this._indicator = new Indicator();
        Main.panel.addToStatusArea(this._uuid, this._indicator);
    }

    disable() {
        Mainloop.source_remove(this._indicator.timeoutCB);
        this._indicator.destroy();
        this._indicator = null;
    }
}

function init(meta) {
    return new Extension(meta.uuid);
}
