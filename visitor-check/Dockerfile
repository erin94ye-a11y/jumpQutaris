FROM node:24-alpine
WORKDIR /app
COPY --chown=node:node package.json server.js geo.js ./
COPY --chown=node:node public ./public
RUN mkdir /data && chown node:node /data
ENV NODE_ENV=production DATA_DIR=/data HOST=0.0.0.0 PORT=4180
USER node
VOLUME ["/data"]
EXPOSE 4180
CMD ["node", "server.js"]
