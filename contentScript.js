document.addEventListener("scopeInspect", async function (objStr) {
  document.dispatchEvent(
    new CustomEvent("scopeInspectResponse", {
      detail: await new Promise((resolve) => {
        if (objStr.detail === null) {
          resolve({ error: "Invalid object reference" });
        } else {
          chrome.runtime.sendMessage(objStr.detail, resolve);
        }
      }),
    })
  );
});
