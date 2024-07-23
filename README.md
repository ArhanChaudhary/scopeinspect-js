# scopeinspect-js

scopeinspect-js is a Chrome extension that utilizes the [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/) to programmatically inspect internal JavaScript state that would otherwise be inaccessible, such as WeakSet entries, private class properties, and closure variables. It serves as an archaic answer to [this](https://stackoverflow.com/questions/4472529/accessing-variables-trapped-by-closure) forum post.

# Installation

https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked

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