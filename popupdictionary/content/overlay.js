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

var popupdictionary = {
  _prefix: 'popupdictionary',
  _pref: Components.classes['@mozilla.org/preferences;1'].getService(Components.interfaces.nsIPrefBranch),

  divId: "popupdictionary-tooltip",
  frameId: "popupdictionary-frame",

  onLoad: function() {
    // initialization code
    this.initialized = true;
    this.strings = document.getElementById('popupdictionary-strings');

    this.applicationDoubleB64 = this.strings.getString('applicationDoubleB64');
    this.crossB64 = this.strings.getString('crossB64');

    this.dictFrame = document.getElementById("dict-frame");
    if (this.dictFrame) {
      this.dictFrame.style.height = "0";
      this.dictFrame.webNavigation.allowAuth = true;
      this.dictFrame.webNavigation.allowImages = false;
      this.dictFrame.webNavigation.allowJavascript = false;
      this.dictFrame.webNavigation.allowMetaRedirects = true;
      this.dictFrame.webNavigation.allowPlugins = false;
      this.dictFrame.webNavigation.allowSubframes = false;
      this.dictFrame.addEventListener("DOMContentLoaded", function (e) { popupdictionary.onDictLoad(e); }, true);
    }
  },

  onFocus: function(e) {
    this.howToPopup = this._pref.getCharPref(this._prefix + '.how-to-popup');
    var shortcutKey = this._pref.getCharPref(this._prefix + '.shortcut-key');
    if (shortcutKey && shortcutKey.length > 0) {
      this.shortcutKeyCode = shortcutKey.toUpperCase().charCodeAt(0);
      this.shortcutModifier = this._pref.getCharPref(this._prefix + '.shortcut-modifier');
    }
  },

  createPopup: function(url, txt) {
    var doc = window.content.document;
    var div = doc.getElementById(this.divId);
    if (!div) {
      var elem = doc.createElement("div");
      elem.setAttribute("id", this.divId);
      doc.body.appendChild(elem);
      div = doc.getElementById(this.divId);
    }

    var width = this._pref.getIntPref(this._prefix + '.popup-width');
    var height = this._pref.getIntPref(this._prefix + '.popup-height');
    var offsetX = this._pref.getIntPref(this._prefix + '.popup-offsetX');
    var offsetY = this._pref.getIntPref(this._prefix + '.popup-offsetY');

    var s = div.style;
    s.position = "absolute";
    s.display = "block";
    s.left = "" + (this.cursorX + offsetX) + "px";
    s.top = "" + (this.cursorY +offsetY) + "px";
    s.width = "" + width + "px";
    s.fontSize = "small";
    s.border = "1px solid #666666";
    s.padding = "0";
    s.background = "white";
    s.textAlign = "left";
    s.zIndex = 999;

    var openScript =
      "return true";
    var closeScript =
      "document.getElementById('" + this.divId + "').style.display='none'; " +
      "return false";

    div.innerHTML =
      "<p style=\"height: 16px; background-color: #999999;\">" +
      "<a href=\"" + url + "\" target=\"_popupdictionary\" onclick=\"" + openScript + "\" >" +
      "<img src=\"data:image/png;base64," +
      this.applicationDoubleB64 + "\" style=\"vertical-align: text-bottom;\" " +
      "alt=\"Open in new page\" title=\"Open in new page\" /></a>" +
      "<span style=\"margin: 0 5px; font-size: 12px; font-weight: bold;\">Popup Dictionary</span>" +
      "<a href=\"#\" onclick=\"" + closeScript + "\">" +
      "<img src=\"data:image/png;base64," +
      this.crossB64 + "\" style=\"float: right; vertical-align: text-bottom;\" " +
      "alt=\"Close this popup\" title=\"Close this popup\" /></a></p>" +
      "<div style=\"height: " + (height - 16) + "px; padding: 3px; overflow-y: scroll;\">" +
      txt + "</div>";
  },

  onDictLoad: function(aEvent) {
    if (aEvent.originalTarget.nodeName != "#document") return;

    var doc = aEvent.originalTarget;

    var url = doc.location.href;
    dump("[PD] URL = " + url + "\n");

    var xpath = this._pref.getCharPref(this._prefix + '.xpath');
    var rs = doc.evaluate(xpath,
			      doc,
			      null,
			      XPathResult.ANY_TYPE,
			      null);

    var txt = '';
    var itr = rs.iterateNext();
    while (itr) {
      txt += itr.innerHTML;
      itr = rs.iterateNext();
    }

    this.createPopup(url, txt);
  },

  sendRequest: function(word) {
    try {
      var url = this._pref.getCharPref(this._prefix + '.url');
      url = url.replace('%s', word);
      this.dictFrame.webNavigation.loadURI(url,
					   Components.interfaces.nsIWebNavigation, null, null, null);
    } catch (error) {
      window.alert("No URL is specified for dictionary!");
    }
  },

  onMouseup: function(e) {
    var sel = window.content.window.getSelection();
    if (sel.toString().length == 0) return;

    // ignore this event if it occurs in tooltip.
    var n = e.explicitOriginalTarget;
    while (n) {
      if (n.nodeType == Node.ELEMENT_NODE && n.id == this.divId) {
	return;
      }
      n = n.parentNode;
    }

    this.cursorX = e.pageX;
    this.cursorY = e.pageY;

    if (this.howToPopup != 'onSelect') return;

    this.sendRequest(sel.toString());
  },

  onKeyup: function(e) {
    var sel = window.content.window.getSelection();
    if (sel.toString().length == 0) return;
    if (this.howToPopup != 'onKeyPress') return;

    var modifier =
      (this.shortcutModifier == 'Alt' && e.altKey) ||
      (this.shortcutModifier == 'Ctrl' && e.ctrlKey) ||
      (this.shortcutModifier == 'Meta' && e.metaKey);

    dump("[PD] keyCode: " + e.keyCode + " / alt : " +
	 e.altKey + " / ctrl: " + e.ctrlKey + " / meta: " + e.metaKey + "\n");
    if (!modifier || e.keyCode != this.shortcutKeyCode) return;

    var n = e.explicitOriginalTarget;
    while (n) {
      if (n.nodeType == Node.ELEMENT_NODE && n.id == this.divId) {
	return;
      }
      n = n.parentNode;
    }
    
    this.sendRequest(sel.toString());
    e.stopPropagation();
  }

};

window.addEventListener("load", function(e) { popupdictionary.onLoad(e); }, false);
window.addEventListener("focus", function(e) { popupdictionary.onFocus(e); }, false );
window.addEventListener("mouseup", function(e) { popupdictionary.onMouseup(e); }, false );
window.addEventListener("keyup", function(e) { popupdictionary.onKeyup(e); }, false );
