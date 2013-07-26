# Backbone.OAuth

For the ers internal use to sign in the offical api.

## Backbone.OAuthRouter

Auto finish oauth2 authentication process to get the access_token.

```js
var router = Backbone.OAuthRouter.extend({
  oauth: {
    baseUrl: 'http://api_address',
    clientId: 'your app id'
  }
}
});
```

## Backbone.AccessView

Auto decide show it or not depend on the user's permission

```js
var view = Backbone.AccessView.extend({
  render: function() {
    return this;
  }
})
```

## Backbone.accessTokenSync

sync server with the access_token automatically

```js
var collection = Backbone.Collection.extend({
  sync: Backbone.accessTokenSync
})
```

## Finally

This lib will provide a `window.me` object represent the logined user.