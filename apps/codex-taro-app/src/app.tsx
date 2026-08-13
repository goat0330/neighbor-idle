import { PropsWithChildren, useEffect } from 'react'
import { APP_CONFIG } from '@config/index'
import './app.scss'

export default function App({ children }: PropsWithChildren) {
  useEffect(() => {
    if (APP_CONFIG.CLOUD_ENV && typeof wx !== 'undefined' && wx.cloud) {
      wx.cloud.init({ env: APP_CONFIG.CLOUD_ENV, traceUser: true })
    }
  }, [])

  return <>{children}</>
}
