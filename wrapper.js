async function scopeInspect(objStr) {
  document.dispatchEvent(new CustomEvent("scopeInspect", { detail: objStr }));
  return await new Promise((resolve) =>
    document.addEventListener(
      "scopeInspectResponse",
      (e) => resolve(e.detail),
      { once: true }
    )
  );
}
