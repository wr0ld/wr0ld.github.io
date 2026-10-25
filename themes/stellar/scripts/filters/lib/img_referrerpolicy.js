/**
 * Allow Yuque-hosted images to load without leaking the blog Referer.
 */

'use strict';

const YUQUE_IMAGE_URL = /^https:\/\/cdn\.nlark\.com\/yuque\//i;

function addNoReferrerPolicy(imgTag) {
  if (/\breferrerpolicy\s*=/i.test(imgTag)) {
    return imgTag;
  }

  const source = imgTag.match(/\b(?:src|data-src)=["']([^"']+)["']/i)?.[1];
  if (!source || !YUQUE_IMAGE_URL.test(source)) {
    return imgTag;
  }

  return imgTag.replace(/^<img\b/i, '<img referrerpolicy="no-referrer"');
}

module.exports.processSite = function(htmlContent) {
  return htmlContent.replace(/<img\b[^>]*>/gi, addNoReferrerPolicy);
};
