<!-- cspell:ignore scopeinspect -->

# scopeinspect-js

scopeinspect-js is a Chrome extension that utilizes the [Chrome DevTools Protocol](https://chromedevtools.github.io/devtools-protocol/) to programmatically inspect internal JavaScript state that would otherwise be inaccessible, such as WeakSet entries, private class properties, and closure variables. It serves as an archaic answer to [this](https://stackoverflow.com/questions/4472529/accessing-variables-trapped-by-closure) forum post.

## Installation

To install the extension, follow the instructions in the [Chrome Extensions documentation](https://developer.chrome.com/docs/extensions/get-started/tutorial/hello-world#load-unpacked).

## Usage

### leafNames

`leafNames` is an array of property names that you want to recognize the object by . When you call the `scopeInspect` function, it iterates through the inner (hidden) context until it find such object and return it. 

## Demo

Here’s a demo using a class with a private property hidden within a closure:

```js
class HiddenClass {
  hiddenProperty;

  constructor(value) {
    this.hiddenProperty = value;
  }
}


var Secret = (() => {
  let _secret;
  return function Secret(secret) {
    _secret = secret;
  }
})();
let obj = new Secret(new HiddenClass(1337));
console.log(await scopeInspect(obj, ["hiddenProperty"]));
// HiddenClass {hiddenProperty: 1337}


```

PS: The orignal library has no license. I can't add legally. 
