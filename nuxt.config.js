export default {

  target: "static", 
  ssr: false,       

  head: {
    htmlAttrs: { lang: "en" },
    title: "Bolster - eCommerce Nuxt.js/Vue.js Template",
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      {
        hid: "description",
        name: "description",
        content: process.env.npm_package_description || "",
      },
    ],
    link: [{ rel: "icon", type: "image/x-icon", href: "/favicon.ico" }],
  },

  loading: { color: "#fff" },

  env: {
    strapiBaseUri: process.env.API_URL || "http://127.0.0.1:1337",
  },

  css: [
    "@/assets/scss/styles/animate.min.css",
    "@/assets/scss/styles/fontawesome.min.css",
    "@/assets/scss/styles/style.scss",
    "@/assets/scss/styles/admin.scss",
    "@/assets/scss/styles/responsive.scss",
  ],

  plugins: [
    { src: "~/plugins/vue-carousel", ssr: false },
    { src: "~/plugins/vue-backtotop", ssr: false },
    { src: "~/plugins/vue-toastification", ssr: false },
    { src: "~/plugins/vueperslides", ssr: false },
  ],

  buildModules: ["@nuxt/typescript-build"],

  modules: [
    "bootstrap-vue/nuxt",
    "@nuxtjs/axios",
    "@nuxtjs/apollo",
  ],

  axios: {
    baseURL: process.env.STRAPI_URL || "http://127.0.0.1:1337",
  },

  apollo: {
    clientConfigs: {
      default: {
        httpEndpoint: process.env.BACKEND_URL || "http://127.0.0.1:1337/graphql",
      },
    },
  },

  router: {
    linkActiveClass: "active",
  },

  build: {
    loaders: {
      scss: {
        implementation: require("sass"),
      },
    },
    transpile: ["node-fetch-native", "vue-carousel", "vueperslides"],
    babel: {
      presets({ isServer }) {
        return [
          [
            "@nuxt/babel-preset-app",
            {
              targets: isServer ? { node: "14" } : { ie: "11" },
            },
          ],
        ];
      },
    },
    extend(config, ctx) {},
  },
};
