async function scopeInspect(obj, leafNames) {
  window.__obj = obj;
  document.dispatchEvent(new CustomEvent("scopeInspect", { detail: { leafNames } }));
  let e = await new Promise((resolve) =>
    document.addEventListener(
      "scopeInspectResponse",
      resolve,
      { once: true }
    )
  );

  console.log(e);
  delete window.__obj;
  return window.retObj;
} 