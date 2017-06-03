document.write("<script language=javascript src='https://cdn.rawgit.com/plakak/findAndReplaceDOMText/wrap-attrs-option/src/findAndReplaceDOMText.js'></script>");
var wrapSelection = {
    wrapName: 'span',
    className: 'slct',
    tick: 0,
    
    replaceSelectionWithHtml: function () {
        var range;
        if (window.getSelection && window.getSelection().getRangeAt) {
            var sel = window.getSelection();
            range = sel.getRangeAt(0);
            sel.removeAllRanges();
            if (range.startContainer === range.endContainer) {
                var prntNode = range.startContainer.parentNode;
                var html = range.startContainer.textContent;
                html = html.substr(0, range.startOffset) + '<span class="'+wrapSelection.className+'">' + html.substr(range.startOffset, range.endOffset - range.startOffset) + '</span>' + html.substr(range.endOffset, html.length - range.endOffset);
                $(range.startContainer).replaceWith(html);
            } else {
                var startNode = range.startContainer.childNodes[range.startOffset] || range.startContainer;
                var endNode = range.endContainer.childNodes[range.endOffset] || range.endContainer;
                //range.deleteContents();
                var replaceNodes = function (start, end) {
                    var attrs = {
                        'class': wrapSelection.className
                    };
                    if (wrapSelection.tick !== 0) {
                        attrs.tick = wrapSelection.tick;
                    }
                    var isChild = function (node, child) {
                        if (node === null) return false;
                        if (node == child) return true;
                        var len = node.childNodes.length;
                        for (var i = 0; i < len; ++i) {
                            if (isChild(node.childNodes[i], child)) return true;
                            if (node.childNodes[i] === child) return true;
                        }
                        return false;
                    };
                    var replaceHTML = function (node, nd) {
                        var div = document.createElement('div');
                        if (node.nodeType === Node.TEXT_NODE) {
                            div.innerHTML = node.textContent;
                        }
                        else {
                            div.innerHTML = node.outerHTML;
                        }
                        findAndReplaceDOMText(div, {
                            find: /[\s\S]+/,
                            wrap: wrapSelection.wrapName,
                            wrapAttrs: attrs
                        });
                        $(nd).replaceWith(div.innerHTML);
                    };
                    var recursiveNextNode = function (node, startNode,endNode) {
                        if (node === null || endNode.isEqualNode(node)) return null;
                        for (var i = 0; i < node.childNodes.length; ++i) {//children
                            var nd = node.childNodes[i];
                            if (isChild(nd, endNode) && recursiveNextNode(nd, startNode, endNode) === null) {
                                return null;
                            }
                            else {
                                replaceHTML(nd, nd);
                            }
                        }
                        var next = node.nextSibling, temp = null, tree = node.parentNode;
                        if(node!=startNode){
                            replaceHTML(node, node);
                        }
                        while (next !== undefined && next !== null) {//sibling
                            temp = next.nextSibling;
                            if (isChild(next, endNode) && recursiveNextNode(next, startNode, endNode) === null) {
                                return null;
                            }
                            else {
                                replaceHTML(next, next);
                            }
                            next = temp;
                        }
                        while (tree.nextSibling === undefined || tree.nextSibling === null) {
                            tree = tree.parentNode;
                        }
                        return recursiveNextNode(tree.nextSibling, startNode, endNode);
                    };
                    recursiveNextNode(start, start, end);
                };
                replaceNodes(startNode, endNode);
                //Ìæ»»Ê×Î²½Úµã
                var startText = startNode.textContent;
                var startHtml = startText.substr(0, range.startOffset) + '<span class="'+ wrapSelection.className+'">' + startText.substr(range.startOffset, startText.length - range.startOffset) + '</span>';
                $(startNode).replaceWith(startHtml);
                var endText = endNode.textContent;
                var endHtml = '<span class="'+ wrapSelection.className+'">' + endText.substr(0, range.endOffset) + '</span>' + endText.substr(range.endOffset, endText.length - range.endOffset);
                $(endNode).replaceWith(endHtml);
            }

        } else if (document.selection && document.selection.createRange) {
            range = document.selection.createRange();
            range.pasteHTML(html);
        }
    },
    isInNode: function (nodeID) {
        var ancestor = function (node, nodeID) {
            if (node === null || node.nodeName.toLowerCase() === 'body') return false;
            if (node.id == nodeID) return true;
            return ancestor(node.parentNode, nodeID);
        };
        var sel = document.getSelection();
        if (ancestor(sel.anchorNode, nodeID) && ancestor(sel.focusNode, nodeID)) return true;
        return false;
    },
};

function markSelection(nodeID, opt) {
    if (!wrapSelection.isInNode(nodeID)) return;
    wrapSelection.className = opt.className || '';
    wrapSelection.wrapName = opt.wrapName || 'span';
    wrapSelection.tick = opt.tick || 0;
    return wrapSelection.replaceSelectionWithHtml();
}
