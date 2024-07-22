const SEARCH_LIMIT = 500;
const LEAF_LIMIT = 10;

async function onContentMessage(objStr, sender, sendResponse) {
  let url = new URL(sender.url);
  let tabId = sender.tab.id;

  await new Promise((resolve) =>
    chrome.debugger.attach({ tabId }, "1.2", resolve)
  );

  let secretObj = await chrome.debugger.sendCommand(
    { tabId },
    "Runtime.evaluate",
    {
      expression: objStr,
      includeCommandLineAPI: true,
      throwOnSideEffect: true,
      timeout: 500,
      disableBreaks: true,
      replMode: true,
    }
  );
  if (secretObj.result.subtype === "error") {
    sendResponse({ error: "Object reference does not exist" });
    return;
  }
  secretObj.value = secretObj.result;

  let closureData = await searchTree(
    secretObj,
    url,
    tabId,
    (leaf) =>
      leaf.value?.subtype?.startsWith("internal#") &&
      (leaf.value.subtype !== "internal#scopeList" ||
        leaf.value.description[7] !== "0")
  );

  let nameToValue = {};
  for (let { name, value } of closureData) {
    if (!nameToValue[name]) {
      nameToValue[name] = value.value;
    }
  }
  chrome.debugger.detach({ tabId });
  sendResponse(nameToValue);
}

async function searchTree(root, url, tabId, isImportant) {
  let queue = [root];
  let len = 0;
  let ret = [];
  while (queue.length && len < SEARCH_LIMIT) {
    let curr = queue.shift();
    if (
      !curr.value ||
      // gets rid of arguments, caller, length, name, and symbol stuff
      // might generate false negatives though
      curr.writable === false ||
      ["internal#location", null].includes(curr.value.subtype) ||
      (curr.name !== undefined &&
        curr.value.value !== undefined &&
        url[curr.name] === curr.value.value)
    ) {
      continue;
    }
    if (!curr.value.objectId) {
      ret.push(curr);
      continue;
    }

    let properties = await chrome.debugger.sendCommand(
      { tabId },
      "Runtime.getProperties",
      {
        objectId: curr.value.objectId,
        ownProperties: true,
      }
    );

    let leaves = [
      ...(properties.result ?? []),
      ...(properties.internalProperties ?? []),
    ].slice(0, LEAF_LIMIT);
    len += leaves.length;

    for (let leaf of leaves) {
      if (isImportant(leaf)) {
        ret.push(...(await searchTree(leaf, url, tabId, () => false)));
      } else {
        queue.push(leaf);
      }
    }
  }
  return ret;
}

chrome.runtime.onMessage.addListener(function () {
  onContentMessage(...arguments);
  // https://stackoverflow.com/a/20077854/12230735
  return true;
});
