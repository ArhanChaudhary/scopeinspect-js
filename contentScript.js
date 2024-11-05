document.addEventListener("scopeInspect", async function (event) {
  const leafNames = event.detail.leafNames;

  // Pass the leaf names as a parameter
  const response = await chrome.runtime.sendMessage({
    action: "scopeInspect",
    leafNames: leafNames
  });

  document.dispatchEvent(
    new CustomEvent("scopeInspectResponse", {
      detail: response,
    })
  );
}); 