import { init } from '@/lib/alice'
import { start } from '@/server'

init()
  .then(() => {
    start()
  })
  .catch((error) => {
    console.log(
      '❌ Server start failed'
    )

    console.error(error)
  })
