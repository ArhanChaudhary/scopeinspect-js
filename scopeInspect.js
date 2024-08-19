async function scopeInspect(obj) {
  window.__obj = obj;
  document.dispatchEvent(new CustomEvent("scopeInspect"));
  let e = await new Promise((resolve) =>
    document.addEventListener(
      "scopeInspectResponse",
      resolve,
      { once: true }
    )
  );
  delete window.__obj;
  return e.detail;
}
