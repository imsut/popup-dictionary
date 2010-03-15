/* ***** BEGIN LICENSE BLOCK *****
 *   Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 * 
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Popup Dictionary.
 *
 * The Initial Developer of the Original Code is
 * Kentaro KAWAMOTO.
 * Portions created by the Initial Developer are Copyright (C) 2010
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 * 
 * ***** END LICENSE BLOCK ***** */

var Config = {
  _prefix: 'popupdictionary',
  _pref: Components.classes['@mozilla.org/preferences;1'].getService(Components.interfaces.nsIPrefBranch),

  onLoad: function() {
    try {
      var length = Config.Vars.length;
      for (var i = 0; i < length; i++) {
	var a = Config.Vars[i];
	var id = a[0];
	var type = a[1];
	var prefName = this._prefix + '.' + id;
	var elem = document.getElementById(id);

	var val = null;
	switch (type) {
	case 'int':
	  val = this._pref.getIntPref(prefName);
	  break;
	case 'String':
	  val = this._pref.getCharPref(prefName);
	  break;
	default:
	  dump("Unknown type [" + type + "] for property [" + id + "]");
	}
	
	switch (elem.tagName) {
	case 'textbox':
	  elem.setAttribute('value', val);
	  break;
	case 'radiogroup':
	  var len = elem.itemCount;
	  for (var ridx = 0; ridx < len; ridx++) {
	    var radio = elem.getItemAtIndex(ridx);
	    if (val == radio.value) elem.selectedIndex = ridx;
	  }
	  break;
	default:
	  dump("Unknown element [" + elem.tagName + "] for property [" + id + "]");
	}
	
      }
    } catch (error) {
      // no preference in the first time
      dump("" + error.message + "\n");
    }
  },

  save: function() {
    var length = Config.Vars.length;
    for (var i = 0; i < length; i++) {
      var a = Config.Vars[i];
      var id = a[0];
      var type = a[1];
      var prefName = this._prefix + '.' + id;
      var elem = document.getElementById(id);

      switch (type) {
      case 'int':
	this._pref.setIntPref(prefName, elem['value']);
	break;
      case 'String':
	this._pref.setCharPref(prefName, elem['value']);
	break;
      default:
	dump("Unknown type [" + type + "] for property [" + id + "]");
      }
    }
  }
};

Config.Vars = [
  /* Dictionary pane */
  [ 'url', 'String' ],
  [ 'xpath', 'String' ],

  /* Key assign pane */
  [ 'how-to-popup', 'String' ],
  [ 'shortcut-key', 'String' ],
  [ 'shortcut-modifier', 'String' ],

  /* Advanced pane */
  [ 'popup-width', 'int' ],
  [ 'popup-height', 'int' ],
  [ 'popup-offsetX', 'int' ],
  [ 'popup-offsetY', 'int' ]
];
