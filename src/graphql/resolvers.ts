import path from 'path'
import { mergeResolvers } from '@graphql-tools/merge'
import { loadFilesSync } from '@graphql-tools/load-files'
import { resolvers as scalarResolvers } from 'graphql-scalars'

const queryResolvers = loadFilesSync(
  path.join(__dirname, '/queries/*/resolver.?(j|t)s')
)
const mutationResolvers = loadFilesSync(
  path.join(__dirname, '/mutations/*/resolver.?(j|t)s')
)

export default {
  ...scalarResolvers,
  Query: mergeResolvers(queryResolvers),
  Mutation: mergeResolvers(mutationResolvers)
}
