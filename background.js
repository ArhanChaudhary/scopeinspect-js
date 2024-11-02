const SEARCH_LIMIT = 100;
const LEAF_LIMIT = 75;

async function onContentMessage(message, sender, sendResponse) {
  if (message.action === "scopeInspect") {
    let url = new URL(sender.url);
    let tabId = sender.tab.id;

    await chrome.debugger.attach({ tabId }, "1.3");

    try {
      console.log(tabId);
      let secretObj = await chrome.debugger.sendCommand(
        { tabId },
        "Runtime.evaluate",
        {
          expression: "window.__obj",
        }
      );
      if (secretObj.result.type === "undefined") {
        sendResponse({ error: "Invalid object reference" });
        return;
      }
      if (secretObj.result.subtype === "error") {
        sendResponse({ error: "Object reference does not exist" });
        return;
      }
      secretObj.value = secretObj.result;

      // Check if all specified leaf names are included
      const leafNamesToCheck = message.leafNames; // Assuming leafNames is passed in the message
      const isImportant = (leafNames) => leafNamesToCheck.every(name => leafNames.includes(name));

      let closureData = await searchTree(secretObj, url, tabId, isImportant);

      await chrome.debugger.sendCommand(
        { tabId },
        "Runtime.callFunctionOn",
        {
          functionDeclaration: `function(data) { window.retObj = data; }`,
          arguments: [{ objectId: closureData.objectId }],
          objectId: closureData.parentId || undefined,
        }
      );
      sendResponse({ error: 0 });
    } catch (e) {
      sendResponse({ error: `Error while inspecting scope: ${e}` });
    } finally {
      chrome.debugger.detach({ tabId: sender.tab.id });
    }
  }
}

async function getProperties(tabId, objectId) {
  return await chrome.debugger.sendCommand(
    { tabId },
    "Runtime.getProperties",
    {
      objectId: objectId,
      ownProperties: true,
    }
  );
}

async function searchTree(root, url, tabId, isImportant, maxDepth = 6) {
  let queue = [{ node: root, depth: 0, parent: null }];
  let len = 0;
  let ret = [];
  console.log('aaa');
  while (queue.length && len < SEARCH_LIMIT) {
    let { node: curr, depth, parent } = queue.shift();
    len++;
    console.log({ "currn: ": curr.name ? curr.name : "", "curr : ": curr.value, "curtype": curr.type });
    //if (isModule(curr.value)) {
    //continue;
    //}

    if (
      !curr.value ||
      // gets rid of arguments, caller, length, name, and symbol stuff
      // might generate false negatives though
      curr.writable === false ||
      // probably not the best way to do this
      (curr.enumerable === false && curr.name !== "constructor") ||
      ["internal#location", null].includes(curr.value.subtype) ||
      (curr.value.subtype === "internal#scopeList" &&
        curr.value.description[7] === "0") ||
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

    if (depth >= maxDepth) {
      continue;
    }

    let properties = await getProperties(tabId, curr.value.objectId);

    let leaves = [
      ...(properties.result ?? []),
      ...(properties.internalProperties ?? []),
      ...(properties.privateProperties ?? []),
    ].slice(0, LEAF_LIMIT);

    let leafNames = leaves.map(leaf => leaf?.name ?? '');

    let important = isImportant(leafNames)
    if (important)
      return { objectId: curr.value.objectId, parentId: parent ? parent.value.objectId : null }


    for (let leaf of leaves) {
      queue.push({ node: leaf, depth: depth + 1, parent: curr });
    }
  }
}

chrome.runtime.onMessage.addListener(function () {
  onContentMessage(...arguments);
  return true;
});
