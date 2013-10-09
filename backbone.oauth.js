(function() {

  /*
   * OAuthRouter
   */
  Backbone.OAuthRouter = Backbone.Router.extend({

    constructor: function(options) {
      Backbone.Router.call(this, options);
      this.route(/access_token=*/, 'checkLogin');
      this.route('logout', 'logout');
      window.me = new Me;
      window.me.url = "" + this.oauth.baseUrl + '/account/me';
    },

    checkLogin: function() {
      var accessToken, token, _this = this;
      // parse the access_token within hash
      if (token = this.extractToken(document.location.hash)) {
        $.cookie('access_token', token);
        window.me.fetch({
          success: function() {
            setTimeout(function() {
              _this.index();
            }, 0);
          }
        });
        return;
      }
      // check if access_token exists
      if (accessToken = $.cookie('access_token')) {
        window.me.fetch()
        $.get("" + this.oauth.baseUrl + "/oauth/refresh_token?access_token=" + accessToken)
          .success(function(data) {
          return $.cookie('access_token', data.access_token);
        })
        .error(function() {
          _this.logout();
        });
        return;
      } else {
        return document.location.replace(("" + this.oauth.baseUrl + "/oauth/authorize?") + $.param({
          client_id: this.oauth.clientId,
          redirect_uri: document.location.protocol + "//" + document.location.host
        }));
      }
    },

    extractToken: function(hash) {
      var match;
      match = hash.replace(/&.*$/, '').match(/access_token=(.*)$/);
      return !!match && match[1];
    },

    logout: function() {
      $.removeCookie('access_token');
      return document.location.replace(("" + this.oauth.baseUrl + "/oauth/logout?") + $.param({
        client_id: this.oauth.clientId,
        redirect_uri: document.location.protocol + "//" + document.location.host
      }));
    },

    restrict: function(permission) {
      this.judgePermission(permission)();
      this.listenTo(window.me, 'change', this.judgePermission(permission));
    },

    judgePermission: function(permission) {
      var _this = this;
      return function() {
        if (!_.contains(window.me.get('permissions'), permission)) {
          setTimeout(function() {
            _this.index.call(_this);
          }, 0);
        }
      }
    }

  });

  /*
   * accessTokenSync
   */
  Backbone.accessTokenSync = function(method, model, options) {
    options.beforeSend = function(jqxhr, settings) {
      settings.url += settings.url.match(/\?/) ? "&" : "?";
      settings.url += "access_token=" + ($.cookie('access_token'));
    };
    Backbone.sync.call(this, method, model, options);
  };

  /*
   * accessTokenRequestPagerSync
   */
  Backbone.accessTokenRequestPagerSync = function(method, model, options) {
    options.beforeSend = function(jqxhr, settings) {
      settings.url += settings.url.match(/\?/) ? "&" : "?";
      settings.url += "access_token=" + ($.cookie('access_token'));
    };
    Backbone.Paginator.requestPager.prototype.sync.call(this, method, model, options);
  }

  /*
   * AccessView
   */
  Backbone.AccessView = Backbone.View.extend({

    constructor: function(options) {
      this._wrapRender();
      Backbone.View.call(this, options);
      this.listenTo(window.me, 'change', this._judgePermission);
    },

    _wrapRender: function() {
      var _this = this;
      this.render = _.wrap(this.render, function(renderFn) {
        renderFn.call(_this);
        if (!_.isEmpty(window.me.get('permissions'))) {
          _this._judgePermission();
        }
        return _this;
      });
    },

    _judgePermission: function() {
      var _this = this;
      this.$el.find('[data-access]').each(function(index, el) {
        var $el = $(el);
        if (_.contains(window.me.get('permissions'), $el.data('access'))) {
          $el.removeClass('hide');
        }
      });
    }

  });

  /*
   * Me model
   */
  var Me = Backbone.Model.extend({
    sync: Backbone.accessTokenSync,
    defaults: {
      username: null,
      email: null,
      group_id: null,
      group_name: null,
      permissions: []
    }
  });

})();
