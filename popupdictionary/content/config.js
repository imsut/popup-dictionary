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
    // add event listener
    window.addEventListener('dblclick', function(e) { Config.onDblClick(e); }, false);
    
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
	  dump("[PD] Unknown type [" + type + "] for property [" + id + "]");
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
	  dump("[PD] Unknown element [" + elem.tagName + "] for property [" + id + "]");
	}
      }

      var url = this._pref.getCharPref(this._prefix + '.url');
      var dicts = document.getElementById('dicts').children;
      for (var i = 0; i < dicts.length; i++) {
	var titem = dicts[i];
	var trow = titem.firstChild;
	var tcell0 = trow.children[0];
	var tcell2 = trow.children[2];
	tcell0.setAttribute('value', tcell2.getAttribute('label') == url ? "true" : "false");
      }
    } catch (error) {
      // no preference in the first time
      dump("[PD] " + error.message + "\n");
    }
  },

  onDblClick: function(e) {
    var target = e.explicitOriginalTarget;
    if (target.id != "dicts") return;

    var selIdx = document.getElementById('dict-selector').currentIndex;
    if (selIdx == -1) return;

    var dicts = document.getElementById('dicts').children;
    for (var i = 0; i < dicts.length; i++) {
      var titem = dicts[i];
      var trow = titem.firstChild;
      var tcell = trow.firstChild;
      tcell.setAttribute('value', i == selIdx ? "true" : "false");
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
	dump("[PD] Unknown type [" + type + "] for property [" + id + "]");
      }
    }

    // set dictionary URL and XPath
    var selIdx = document.getElementById('dict-selector').currentIndex;
    var dicts = document.getElementById('dicts').children;

    if (selIdx < 0 || selIdx >= dicts.length) selIdx = 0;
    var titem = dicts[selIdx];
    var trow = titem.firstChild;
    var url = trow.children[2].getAttribute('label');
    var xpath = trow.children[3].getAttribute('label');

    dump("[PD] set url = " + url + ", xpath = " + xpath + "\n");
    this._pref.setCharPref(this._prefix + '.url', url);
    this._pref.setCharPref(this._prefix + '.xpath', xpath);
  }
};

Config.Vars = [
  /* Dictionary pane */
/*
  [ 'url', 'String' ],
  [ 'xpath', 'String' ],
*/

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
