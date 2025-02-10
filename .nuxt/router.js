import Vue from 'vue'
import Router from 'vue-router'
import { normalizeURL, decode } from 'ufo'
import { interopDefault } from './utils'
import scrollBehavior from './router.scrollBehavior.js'

const _4d600f50 = () => interopDefault(import('..\\pages\\admin.vue' /* webpackChunkName: "pages/admin" */))
const _c3405db4 = () => interopDefault(import('..\\pages\\blog-details.vue' /* webpackChunkName: "pages/blog-details" */))
const _a7bf3d6c = () => interopDefault(import('..\\pages\\blog-one.vue' /* webpackChunkName: "pages/blog-one" */))
const _3453c3af = () => interopDefault(import('..\\pages\\cart.vue' /* webpackChunkName: "pages/cart" */))
const _8cc58156 = () => interopDefault(import('..\\pages\\checkout.vue' /* webpackChunkName: "pages/checkout" */))
const _58006d3e = () => interopDefault(import('..\\pages\\contact.vue' /* webpackChunkName: "pages/contact" */))
const _68322cac = () => interopDefault(import('..\\pages\\gallery-one.vue' /* webpackChunkName: "pages/gallery-one" */))
const _34cf432c = () => interopDefault(import('..\\pages\\login.vue' /* webpackChunkName: "pages/login" */))
const _c01af71a = () => interopDefault(import('..\\pages\\products.vue' /* webpackChunkName: "pages/products" */))
const _19cd5be7 = () => interopDefault(import('..\\pages\\signup.vue' /* webpackChunkName: "pages/signup" */))
const _224c7ba5 = () => interopDefault(import('..\\pages\\solicitud.vue' /* webpackChunkName: "pages/solicitud" */))
const _ac12f7fc = () => interopDefault(import('..\\pages\\products-details\\_id.vue' /* webpackChunkName: "pages/products-details/_id" */))
const _1bf0bb53 = () => interopDefault(import('..\\pages\\index.vue' /* webpackChunkName: "pages/index" */))

const emptyFn = () => {}

Vue.use(Router)

export const routerOptions = {
  mode: 'history',
  base: '/',
  linkActiveClass: 'active',
  linkExactActiveClass: 'nuxt-link-exact-active',
  scrollBehavior,

  routes: [{
    path: "/admin",
    component: _4d600f50,
    name: "admin"
  }, {
    path: "/blog-details",
    component: _c3405db4,
    name: "blog-details"
  }, {
    path: "/blog-one",
    component: _a7bf3d6c,
    name: "blog-one"
  }, {
    path: "/cart",
    component: _3453c3af,
    name: "cart"
  }, {
    path: "/checkout",
    component: _8cc58156,
    name: "checkout"
  }, {
    path: "/contact",
    component: _58006d3e,
    name: "contact"
  }, {
    path: "/gallery-one",
    component: _68322cac,
    name: "gallery-one"
  }, {
    path: "/login",
    component: _34cf432c,
    name: "login"
  }, {
    path: "/products",
    component: _c01af71a,
    name: "products"
  }, {
    path: "/signup",
    component: _19cd5be7,
    name: "signup"
  }, {
    path: "/solicitud",
    component: _224c7ba5,
    name: "solicitud"
  }, {
    path: "/products-details/:id?",
    component: _ac12f7fc,
    name: "products-details-id"
  }, {
    path: "/",
    component: _1bf0bb53,
    name: "index"
  }],

  fallback: false
}

export function createRouter (ssrContext, config) {
  const base = (config._app && config._app.basePath) || routerOptions.base
  const router = new Router({ ...routerOptions, base  })

  // TODO: remove in Nuxt 3
  const originalPush = router.push
  router.push = function push (location, onComplete = emptyFn, onAbort) {
    return originalPush.call(this, location, onComplete, onAbort)
  }

  const resolve = router.resolve.bind(router)
  router.resolve = (to, current, append) => {
    if (typeof to === 'string') {
      to = normalizeURL(to)
    }
    return resolve(to, current, append)
  }

  return router
}
