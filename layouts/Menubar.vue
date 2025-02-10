<template>
    <div>
        <div :class="['navbar-area', {'is-sticky': isSticky}]">
            <div class="comero-nav">
                <div class="container">
                    <nav class="navbar navbar-expand-lg navbar-light">
                        <div class="navbar-container">
                            <nuxt-link class="navbar-brand" to="/">
                                <img src="../assets/img/logo.png" alt="logo" class="navbar-logo">
                            </nuxt-link>

                            <b-navbar-toggle target="navbarSupportedContent"></b-navbar-toggle>

                            <b-collapse class="collapse navbar-collapse" id="navbarSupportedContent" is-nav>
                                <ul class="navbar-nav ml-auto">
                                    <li class="nav-item">
                                        <nuxt-link to="/" class="nav-link">Inicio</nuxt-link>
                                    </li>

                                    <li class="nav-item">
                                        <nuxt-link to="/solicitud" class="nav-link">Solicitud</nuxt-link>
                                    </li>
                                    
                                    <li class="nav-item p-relative">
                                        <a href="#" class="nav-link">Tienda <i class="fas fa-chevron-down"></i></a>
                                        <ul class="dropdown-menu">
                                            <li class="nav-item"><nuxt-link to="/products" class="nav-link">Productos</nuxt-link></li>
                                            <li class="nav-item"><nuxt-link to="/products-details/1" class="nav-link">Detalle de Productos</nuxt-link></li>
                                        </ul>
                                    </li>

                                    <li class="nav-item">
                                        <nuxt-link to="/gallery-one" class="nav-link">Galeria</nuxt-link>
                                    </li>

                                    <li class="nav-item p-relative">
                                        <a href="#" class="nav-link">Paginas <i class="fas fa-chevron-down"></i></a>
                                        <ul class="dropdown-menu">
                                            <li class="nav-item"><nuxt-link to="/gallery-one" class="nav-link">Gallery</nuxt-link></li>
                                            <li class="nav-item"><nuxt-link to="/cart" class="nav-link">Carrito</nuxt-link></li>
                                            <li class="nav-item"><nuxt-link to="/checkout" class="nav-link">Checkout</nuxt-link></li>
                                            <li class="nav-item"><nuxt-link to="/login" class="nav-link">Login</nuxt-link></li>
                                            <li class="nav-item"><nuxt-link to="/signup" class="nav-link">Signup</nuxt-link></li>
                                            <li class="nav-item"><nuxt-link to="/not-found" class="nav-link">Error 404</nuxt-link></li>
                                            <li class="nav-item"><nuxt-link to="/contact" class="nav-link">Contactanos</nuxt-link></li>
                                        </ul>
                                    </li>

                                    <li class="nav-item p-relative">
                                        <a href="#" class="nav-link">Blog <i class="fas fa-chevron-down"></i></a>
                                        <ul class="dropdown-menu">
                                            <li class="nav-item"><nuxt-link to="/blog-one" class="nav-link">Blog Grid</nuxt-link></li>
                                            <li class="nav-item"><nuxt-link to="/blog-details" class="nav-link">Blog Details</nuxt-link></li>
                                        </ul>
                                    </li>

                                    <li class="nav-item">
                                        <nuxt-link to="/contact" class="nav-link">Contactanos</nuxt-link>
                                    </li>
                                </ul>

                                <div class="others-option">
                                    <div class="option-item">
                                        <nuxt-link to="/login">Ingresar</nuxt-link>
                                    </div>
                                    <div class="option-item">
                                        <a @click.prevent="toggle" href="#">
                                            Carrito({{cart.length}}) <i class="fas fa-shopping-bag"></i>
                                        </a>
                                    </div>
                                </div>
                            </b-collapse>
                        </div>    
                        </nav>
                    </div>
                </div>
            </div>

        <SidebarPanel></SidebarPanel>
    </div>
</template>

<script>
import SidebarPanel from '../layouts/SidebarPanel';
import { mutations } from '../utils/sidebar-util';
export default {
    components: {
        SidebarPanel
    },
    data(){
        return {
            isSticky: false
        }
    },
    mounted(){
        window.addEventListener('scroll', () => {
            let scrollPos = window.scrollY;
            this.isSticky = scrollPos >= 100;
        })
    },
    computed: {
        cart(){
            return this.$store.getters.cart
        }
    },
    methods: {
        toggle() {
            mutations.toggleNav()
        }
    }
}
</script>