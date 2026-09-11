'use client'

import { FC } from 'react'
import Script from 'next/script'
import { YM_ID } from '@/shared/lib/metrika'

/**
 * Injects the Yandex.Metrika counter (id from NEXT_PUBLIC_YM_ID).
 * Renders nothing when the id is missing so local/dev builds stay quiet.
 */
export const YandexMetrika: FC = () => {
  if (!YM_ID) return null

  return (
    <>
      <Script id="yandex-metrika" strategy="afterInteractive">
        {`
          (function(m,e,t,r,i,k,a){m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
          m[i].l=1*new Date();
          for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
          k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)})
          (window, document, "script", "https://mc.yandex.ru/metrika/tag.js", "ym");

          ym(${YM_ID}, "init", {
            clickmap:true,
            trackLinks:true,
            accurateTrackBounce:true,
            webvisor:true
          });
        `}
      </Script>
      {/*
        Render the noscript pixel as a raw HTML string. If we used a JSX <img>,
        React 19 would auto-emit <link rel="preload" as="image" href=".../watch/ID">
        in <head>, which fetches the watch pixel for ALL visitors (even with JS)
        and fires a Metrika hit with no source info — breaking traffic attribution.
        As a raw string React can't introspect it, so no preload is generated.
      */}
      <noscript
        dangerouslySetInnerHTML={{
          __html: `<div><img src="https://mc.yandex.ru/watch/${YM_ID}" style="position:absolute;left:-9999px" alt="" /></div>`
        }}
      />
    </>
  )
}
