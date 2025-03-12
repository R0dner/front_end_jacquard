import Vue from 'vue'
import Router from 'vue-router'
import { normalizeURL, decode } from 'ufo'
import { interopDefault } from './utils'
import scrollBehavior from './router.scrollBehavior.js'

const _0906ab41 = () => interopDefault(import('..\\pages\\admin.vue' /* webpackChunkName: "pages/admin" */))
const _85bfd7d6 = () => interopDefault(import('..\\pages\\blog-details.vue' /* webpackChunkName: "pages/blog-details" */))
const _64c5188e = () => interopDefault(import('..\\pages\\blog-one.vue' /* webpackChunkName: "pages/blog-one" */))
const _3a61659e = () => interopDefault(import('..\\pages\\cart.vue' /* webpackChunkName: "pages/cart" */))
const _49cb5c78 = () => interopDefault(import('..\\pages\\checkout.vue' /* webpackChunkName: "pages/checkout" */))
const _406f2d12 = () => interopDefault(import('..\\pages\\contact.vue' /* webpackChunkName: "pages/contact" */))
const _fc136046 = () => interopDefault(import('..\\pages\\gallery-one.vue' /* webpackChunkName: "pages/gallery-one" */))
const _bd820b4a = () => interopDefault(import('..\\pages\\login.vue' /* webpackChunkName: "pages/login" */))
const _7d20d23c = () => interopDefault(import('..\\pages\\products.vue' /* webpackChunkName: "pages/products" */))
const _5a0b83d4 = () => interopDefault(import('..\\pages\\signup.vue' /* webpackChunkName: "pages/signup" */))
const _3071b716 = () => interopDefault(import('..\\pages\\solicitud.vue' /* webpackChunkName: "pages/solicitud" */))
const _22f11df3 = () => interopDefault(import('..\\pages\\products-details\\_id.vue' /* webpackChunkName: "pages/products-details/_id" */))
const _50d15178 = () => interopDefault(import('..\\pages\\index.vue' /* webpackChunkName: "pages/index" */))

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
    component: _0906ab41,
    name: "admin"
  }, {
    path: "/blog-details",
    component: _85bfd7d6,
    name: "blog-details"
  }, {
    path: "/blog-one",
    component: _64c5188e,
    name: "blog-one"
  }, {
    path: "/cart",
    component: _3a61659e,
    name: "cart"
  }, {
    path: "/checkout",
    component: _49cb5c78,
    name: "checkout"
  }, {
    path: "/contact",
    component: _406f2d12,
    name: "contact"
  }, {
    path: "/gallery-one",
    component: _fc136046,
    name: "gallery-one"
  }, {
    path: "/login",
    component: _bd820b4a,
    name: "login"
  }, {
    path: "/products",
    component: _7d20d23c,
    name: "products"
  }, {
    path: "/signup",
    component: _5a0b83d4,
    name: "signup"
  }, {
    path: "/solicitud",
    component: _3071b716,
    name: "solicitud"
  }, {
    path: "/products-details/:id?",
    component: _22f11df3,
    name: "products-details-id"
  }, {
    path: "/",
    component: _50d15178,
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
