/** @type {import('next').NextConfig} */

module.exports = {
  output: "export",
  images: {
    unoptimized: true,
  },
}
//module.exports = {
  //webpack: (config, { isServer }) => {
    //// Fixes npm packages that depend on `fs` module
    //if (!isServer) {
      //config.node = {
        //fs: 'empty'
      //}
    //}

    //return config
  //}
//}
