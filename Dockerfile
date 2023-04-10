FROM node:16

WORKDIR /ooo/hana/test

COPY . .

RUN yarn

ARG NEXT_PUBLIC_GRAPHQL_URI \
    TOKEN
ENV NEXT_PUBLIC_GRAPHQL_URI=${NEXT_PUBLIC_GRAPHQL_URI} \
    TOKEN=${TOKEN}

RUN yarn build

CMD yarn build && yarn start
