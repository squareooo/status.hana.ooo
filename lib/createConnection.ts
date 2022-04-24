import { createConnection } from 'mongoose'
import { env } from 'process'

const CreateConnection = (name: string) => {
  interface URI {
    [K: string]: string;
  }

  const uri: URI = {
    alice: `mongodb+srv://${env.MONGO_DB_USER}:${env.MONGO_DB_PASS}@${env.MONGO_DB_ALICE}/alice`
  }

  return createConnection(uri[name])
}

export default CreateConnection
