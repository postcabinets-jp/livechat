import { NextResponse } from 'next/server'

export async function GET() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://livechat.vercel.app'

  const script = `
(function() {
  var siteId = document.currentScript.getAttribute('data-site-id');
  if (!siteId) { console.error('[LiveChat] data-site-id is required'); return; }

  var iframeUrl = '${appUrl}/w/' + siteId;

  // Widget button
  var button = document.createElement('div');
  button.id = 'livechat-button';
  button.style.cssText = 'position:fixed;bottom:20px;right:20px;width:52px;height:52px;background:#3B82F6;border-radius:50%;cursor:pointer;z-index:99998;display:flex;align-items:center;justify-content:center;box-shadow:0 4px 12px rgba(59,130,246,0.4);transition:transform 0.2s';
  button.innerHTML = '<svg width="22" height="22" fill="white" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>';
  button.onmouseover = function() { this.style.transform = 'scale(1.08)'; };
  button.onmouseout = function() { this.style.transform = 'scale(1)'; };

  // Widget iframe container
  var container = document.createElement('div');
  container.id = 'livechat-container';
  container.style.cssText = 'position:fixed;bottom:84px;right:20px;width:360px;height:520px;z-index:99999;display:none;border-radius:16px;overflow:hidden;box-shadow:0 8px 32px rgba(0,0,0,0.15)';

  var iframe = document.createElement('iframe');
  iframe.src = iframeUrl;
  iframe.style.cssText = 'width:100%;height:100%;border:none';
  iframe.allow = 'clipboard-write';

  container.appendChild(iframe);

  var open = false;
  button.addEventListener('click', function() {
    open = !open;
    container.style.display = open ? 'block' : 'none';
    button.innerHTML = open
      ? '<svg width="20" height="20" fill="white" viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>'
      : '<svg width="22" height="22" fill="white" viewBox="0 0 24 24"><path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z"/></svg>';
  });

  document.body.appendChild(container);
  document.body.appendChild(button);
})();
`

  return new NextResponse(script, {
    headers: {
      'Content-Type': 'application/javascript',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
