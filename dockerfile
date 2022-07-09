from node

workdir app
copy . .

run npm i
run npm run build

run ls dist
run node --version
expose 8080
cmd ["node" ,"/app/dist/index.js"]