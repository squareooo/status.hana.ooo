import path from 'path'
import { mergeTypeDefs } from '@graphql-tools/merge'
import { loadFilesSync } from '@graphql-tools/load-files'
import { typeDefs as scalarTypeDefs } from 'graphql-scalars'

const typeDefs = loadFilesSync(path.join(__dirname, '/**/*.gql'))

export default [...scalarTypeDefs, mergeTypeDefs(typeDefs)]
