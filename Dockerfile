FROM node:16-alpine

WORKDIR /ooo/hana/xtest

COPY . .

RUN yarn

CMD yarn start
