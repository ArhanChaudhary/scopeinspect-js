# Usage

```js
const Secret = (() => {
  let _secret;
  return function Secret(secret) {
    _secret = secret;
  }
})();
youcantcrackme = new Secret("1337");
console.log(await scopeInspect("youcantcrackme"));
// {_secret: '1337'}
```