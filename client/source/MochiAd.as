class MochiAd
{
    var _parent, fadeout_start, fadeout_time, mc, started, _mochiad_bar, last_pcnt, server_control, fadeFunction, _mochiad_ctr, _url;
    function MochiAd()
    {
    } // End of the function
    static function showPreloaderAd(options)
    {
        var _loc29 = {clip: _root, ad_msec: 11000, ad_timeout: 3000, fadeout_time: 250, regpt: "o", method: "showPreloaderAd", color: 16747008, background: 16777161, outline: 13994812};
        options = MochiAd._parseOptions(options, _loc29);
        var _loc15 = options.clip;
        var _loc25 = options.ad_msec;
        delete options.ad_msec;
        var _loc28 = options.ad_timeout;
        delete options.ad_timeout;
        var fadeout_time = options.fadeout_time;
        delete options.fadeout_time;
        if (!MochiAd.load(options))
        {
            return (null);
        } // end if
        _loc15.stop();
        var mc = _loc15._mochiad;
        mc.onUnload = function ()
        {
            _parent.play();
        };
        var _loc16 = MochiAd._getRes(options);
        var _loc5 = _loc16[0];
        var _loc14 = _loc16[1];
        mc._x = _loc5 * 0.500000;
        mc._y = _loc14 * 0.500000;
        var chk = mc.createEmptyMovieClip("_mochiad_wait", 3);
        chk._x = _loc5 * -0.500000;
        chk._y = _loc14 * -0.500000;
        var _loc8 = chk.createEmptyMovieClip("_mochiad_bar", 4);
        _loc8._x = 10;
        _loc8._y = _loc14 - 20;
        var _loc24 = options.color;
        delete options.color;
        var _loc21 = options.background;
        delete options.background;
        var _loc26 = options.outline;
        delete options.outline;
        var _loc6 = _loc8.createEmptyMovieClip("_outline", 1);
        _loc6.beginFill(_loc21);
        _loc6.moveTo(0, 0);
        _loc6.lineTo(_loc5 - 20, 0);
        _loc6.lineTo(_loc5 - 20, 10);
        _loc6.lineTo(0, 10);
        _loc6.lineTo(0, 0);
        _loc6.endFill();
        var _loc4 = _loc8.createEmptyMovieClip("_inside", 2);
        _loc4.beginFill(_loc24);
        _loc4.moveTo(0, 0);
        _loc4.lineTo(_loc5 - 20, 0);
        _loc4.lineTo(_loc5 - 20, 10);
        _loc4.lineTo(0, 10);
        _loc4.lineTo(0, 0);
        _loc4.endFill();
        _loc4._xscale = 0;
        var _loc7 = _loc8.createEmptyMovieClip("_outline", 3);
        _loc7.lineStyle(0, _loc26, 100);
        _loc7.moveTo(0, 0);
        _loc7.lineTo(_loc5 - 20, 0);
        _loc7.lineTo(_loc5 - 20, 10);
        _loc7.lineTo(0, 10);
        _loc7.lineTo(0, 0);
        chk.ad_msec = _loc25;
        chk.ad_timeout = _loc28;
        chk.started = getTimer();
        chk.showing = false;
        chk.last_pcnt = 0;
        chk.fadeout_time = fadeout_time;
        chk.fadeFunction = function ()
        {
            var _loc2 = 100 * (1 - (getTimer() - fadeout_start) / fadeout_time);
            if (_loc2 > 0)
            {
                _parent._alpha = _loc2;
            }
            else
            {
                var _loc3 = _parent._parent;
                MochiAd.unload(_loc3);
                delete this.onEnterFrame;
            } // end else if
        };
        mc.lc.adjustProgress = function (msec)
        {
            var _loc2 = mc._mochiad_wait;
            _loc2.server_control = true;
            _loc2.started = getTimer();
            _loc2.ad_msec = msec;
        };
        chk.onEnterFrame = function ()
        {
            var _loc6 = _parent._parent;
            var _loc12 = _parent._mochiad_ctr;
            var _loc5 = getTimer() - started;
            var _loc3 = false;
            var _loc4 = _loc6.getBytesTotal();
            var _loc8 = _loc6.getBytesLoaded();
            var _loc10 = 100 * _loc8 / _loc4;
            var _loc11 = 100 * _loc5 / chk.ad_msec;
            var _loc9 = _mochiad_bar._inside;
            var _loc2 = Math.min(100, Math.min(_loc10 || 0, _loc11));
            _loc2 = Math.max(last_pcnt, _loc2);
            last_pcnt = _loc2;
            _loc9._xscale = _loc2;
            if (!chk.showing)
            {
                var _loc7 = _loc12.getBytesTotal();
                if (_loc7 > 0 || typeof(_loc7) == "undefined")
                {
                    chk.showing = true;
                    chk.started = getTimer();
                }
                else if (_loc5 > chk.ad_timeout)
                {
                    _loc3 = true;
                } // end if
            } // end else if
            if (_loc5 > chk.ad_msec)
            {
                _loc3 = true;
            } // end if
            if (_loc4 > 0 && _loc8 >= _loc4 && _loc3)
            {
                if (server_control)
                {
                    delete this.onEnterFrame;
                }
                else
                {
                    fadeout_start = getTimer();
                    onEnterFrame = chk.fadeFunction;
                } // end if
            } // end else if
        };
    } // End of the function
    static function showTimedAd(options)
    {
        var _loc15 = {clip: _root, ad_msec: 11000, ad_timeout: 2000, fadeout_time: 250, regpt: "o", method: "showTimedAd"};
        options = MochiAd._parseOptions(options, _loc15);
        var _loc6 = options.clip;
        var _loc12 = options.ad_msec;
        delete options.ad_msec;
        var _loc14 = options.ad_timeout;
        delete options.ad_timeout;
        var fadeout_time = options.fadeout_time;
        delete options.fadeout_time;
        if (!MochiAd.load(options))
        {
            return (null);
        } // end if
        _loc6.stop();
        var mc = _loc6._mochiad;
        mc.onUnload = function ()
        {
            _parent.play();
        };
        var _loc7 = MochiAd._getRes(options);
        var _loc16 = _loc7[0];
        var _loc13 = _loc7[1];
        mc._x = _loc16 * 0.500000;
        mc._y = _loc13 * 0.500000;
        var chk = mc.createEmptyMovieClip("_mochiad_wait", 3);
        chk.ad_msec = _loc12;
        chk.ad_timeout = _loc14;
        chk.started = getTimer();
        chk.showing = false;
        chk.fadeout_time = fadeout_time;
        chk.fadeFunction = function ()
        {
            var _loc2 = 100 * (1 - (getTimer() - fadeout_start) / fadeout_time);
            if (_loc2 > 0)
            {
                _parent._alpha = _loc2;
            }
            else
            {
                var _loc3 = _parent._parent;
                MochiAd.unload(_loc3);
                delete this.onEnterFrame;
            } // end else if
        };
        mc.lc.adjustProgress = function (msec)
        {
            var _loc2 = mc._mochiad_wait;
            _loc2.server_control = true;
            _loc2.started = getTimer();
            _loc2.ad_msec = msec - 250;
        };
        chk.onEnterFrame = function ()
        {
            var _loc5 = _parent._mochiad_ctr;
            var _loc4 = getTimer() - started;
            var _loc2 = false;
            if (!chk.showing)
            {
                var _loc3 = _loc5.getBytesTotal();
                if (_loc3 > 0 || typeof(_loc3) == "undefined")
                {
                    chk.showing = true;
                    chk.started = getTimer();
                }
                else if (_loc4 > chk.ad_timeout)
                {
                    _loc2 = true;
                } // end if
            } // end else if
            if (_loc4 > chk.ad_msec)
            {
                _loc2 = true;
            } // end if
            if (_loc2)
            {
                if (server_control)
                {
                    delete this.onEnterFrame;
                }
                else
                {
                    fadeout_start = getTimer();
                    onEnterFrame = fadeFunction;
                } // end if
            } // end else if
        };
    } // End of the function
    static function load(options)
    {
        var _loc14 = {clip: _root, server: "http://x.mochiads.com/srv/1/", method: "load", depth: 10333, id: "_UNKNOWN_"};
        options = MochiAd._parseOptions(options, _loc14);
        options.swfv = options.clip.getSWFVersion() || 6;
        options.mav = "1.3";
        var _loc7 = options.clip;
        if (!MochiAd._isNetworkAvailable())
        {
            return (false);
        } // end if
        if (_loc7._mochiad_loaded)
        {
            return (false);
        } // end if
        var _loc13 = options.depth;
        delete options.depth;
        var _loc6 = _loc7.createEmptyMovieClip("_mochiad", _loc13);
        var _loc12 = MochiAd._getRes(options);
        options.res = _loc12[0] + "x" + _loc12[1];
        options.server = options.server + options.id;
        delete options.id;
        _loc7._mochiad_loaded = true;
        var _loc4 = _loc6.createEmptyMovieClip("_mochiad_ctr", 1);
        for (var _loc8 in options)
        {
            _loc4[_loc8] = options[_loc8];
        } // end of for...in
        if (_loc7._url.indexOf("http") != 0)
        {
            options.no_page = true;
        } // end if
        var _loc11 = _loc4.server;
        delete _loc4.server;
        var _loc10 = _loc11.split("/")[2].split(":")[0];
        if (System.security)
        {
            if (System.security.allowDomain)
            {
                System.security.allowDomain("*");
                System.security.allowDomain(_loc10);
            } // end if
            if (System.security.allowInsecureDomain)
            {
                System.security.allowInsecureDomain("*");
                System.security.allowInsecureDomain(_loc10);
            } // end if
        } // end if
        _loc6.onEnterFrame = function ()
        {
            if (_mochiad_ctr._url != _url)
            {
                function onEnterFrame()
                {
                    if (!_mochiad_ctr)
                    {
                        delete this.onEnterFrame;
                        MochiAd.unload(_parent);
                    } // end if
                } // End of the function
            } // end if
        };
        var _loc5 = new LocalConnection();
        var _loc9 = ["", Math.floor(new Date().getTime()), random(999999)].join("_");
        _loc5.mc = _loc6;
        _loc5.name = _loc9;
        _loc5.hostname = _loc10;
        _loc5.allowDomain = function (d)
        {
            return (true);
        };
        _loc5.allowInsecureDomain = _loc5.allowDomain;
        _loc5.connect(_loc9);
        _loc6.lc = _loc5;
        _loc4.lc = _loc9;
        _loc4.st = getTimer();
        _loc4.loadMovie(_loc11 + ".swf", "POST");
        return (_loc6);
    } // End of the function
    static function unload(clip)
    {
        if (typeof(clip) == "undefined")
        {
            clip = _root;
        } // end if
        if (clip.clip && clip.clip._mochiad)
        {
            clip = clip.clip;
        } // end if
        if (!clip._mochiad)
        {
            return (false);
        } // end if
        clip._mochiad.removeMovieClip();
        delete clip._mochiad_loaded;
        delete clip._mochiad;
        return (true);
    } // End of the function
    static function _isNetworkAvailable()
    {
        if (System.security)
        {
            var _loc1 = System.security;
            if (_loc1.sandboxType == "localWithFile")
            {
                return (false);
            } // end if
        } // end if
        return (true);
    } // End of the function
    static function _getRes(options)
    {
        var _loc3 = options.clip.getBounds();
        var _loc2 = 0;
        var _loc1 = 0;
        if (typeof(options.res) != "undefined")
        {
            var _loc4 = options.res.split("x");
            _loc2 = parseFloat(_loc4[0]);
            _loc1 = parseFloat(_loc4[1]);
        }
        else
        {
            _loc2 = _loc3.xMax - _loc3.xMin;
            _loc1 = _loc3.yMax - _loc3.yMin;
        } // end else if
        if (_loc2 == 0 || _loc1 == 0)
        {
            _loc2 = Stage.width;
            _loc1 = Stage.height;
        } // end if
        return ([_loc2, _loc1]);
    } // End of the function
    static function _parseOptions(options, defaults)
    {
        var _loc4 = {};
        for (var _loc8 in defaults)
        {
            _loc4[_loc8] = defaults[_loc8];
        } // end of for...in
        if (options)
        {
            for (var _loc8 in options)
            {
                _loc4[_loc8] = options[_loc8];
            } // end of for...in
        } // end if
        if (_root.mochiad_options)
        {
            var _loc5 = _root.mochiad_options.split("&");
            for (var _loc2 = 0; _loc2 < _loc5.length; ++_loc2)
            {
                var _loc3 = _loc5[_loc2].split("=");
                _loc4[unescape(_loc3[0])] = unescape(_loc3[1]);
            } // end of for
        } // end if
        return (_loc4);
    } // End of the function
} // End of Class
