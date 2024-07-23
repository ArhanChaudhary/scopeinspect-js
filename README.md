# scopeinspect-js

scopeinspect-js is a chrome extension that utilizes the [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/) to programmatically inspect internal state that would otherwise be inaccessible through raw JavaScript, such as WeakSet entries, private properties, and closure variables. It serves as an archaic answer to [this](https://stackoverflow.com/questions/4472529/accessing-variables-trapped-by-closure) forum post.

# Usage

```js
var Secret = (() => {
  let _secret;
  return function Secret(secret) {
    _secret = secret;
  }
})();
window.cantcrackme = new Secret(1337);
console.log(await scopeInspect("window.cantcrackme")); // stringified reference
// {_secret: 1337}
```