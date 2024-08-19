document.addEventListener("scopeInspect", async function () {
  document.dispatchEvent(
    new CustomEvent("scopeInspectResponse", {
      detail: await chrome.runtime.sendMessage(undefined),
    })
  );
});
