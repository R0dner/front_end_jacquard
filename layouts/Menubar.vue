<template>
    <div>
        <div :class="['navbar-area', {'is-sticky': isSticky}]">
            <div class="comero-nav">
                <div class="container-fluid">
                    <nav class="navbar navbar-expand-lg navbar-light">
                        <div class="navbar-container d-flex align-items-center w-100">
                            <nuxt-link class="navbar-brand" to="/">
                                <img src="../assets/img/logo.png" alt="logo" class="navbar-logo">
                            </nuxt-link>

                            <b-navbar-toggle target="navbarSupportedContent"></b-navbar-toggle>

                            <b-collapse class="collapse navbar-collapse" id="navbarSupportedContent" is-nav>
                                <ul class="navbar-nav mx-auto">
                                    <li class="nav-item">
                                        <nuxt-link to="/" class="nav-link">Inicio</nuxt-link>
                                    </li>

                                    <li class="nav-item">
                                        <nuxt-link to="/solicitud" class="nav-link">Solicitud</nuxt-link>
                                    </li>
                                    
                                    <li class="nav-item dropdown">
                                        <a href="#" class="nav-link dropdown-toggle" @click.prevent="toggleDropdown($event)">
                                            Tienda <i class="fas fa-chevron-down"></i>
                                        </a>
                                        <ul class="dropdown-menu">
                                            <li class="nav-item"><nuxt-link to="/products" class="nav-link">Productos</nuxt-link></li>
                                            <li class="nav-item"><nuxt-link to="/products-details/1" class="nav-link">Detalle de Productos</nuxt-link></li>
                                        </ul>
                                    </li>

                                    <li class="nav-item">
                                        <nuxt-link to="/gallery-one" class="nav-link">Galeria</nuxt-link>
                                    </li>

                                    <li class="nav-item dropdown">
                                        <a href="#" class="nav-link dropdown-toggle" @click.prevent="toggleDropdown($event)">
                                            Conocenos <i class="fas fa-chevron-down"></i>
                                        </a>
                                        <ul class="dropdown-menu">
                                            <li class="nav-item"><nuxt-link to="/blog-one" class="nav-link">Novedades</nuxt-link></li>
                                            <li class="nav-item"><nuxt-link to="/blog-details" class="nav-link">Sobre nuestras prendas</nuxt-link></li>
                                        </ul>
                                    </li>

                                    <li class="nav-item">
                                        <nuxt-link to="/contact" class="nav-link">Contactanos</nuxt-link>
                                    </li>
                                </ul>

                                <div class="others-option">
                                    <div class="option-item">
                                        <nuxt-link to="/login" class="auth-link">
                                            <i class="fas fa-user"></i>
                                        </nuxt-link>
                                    </div>
                                    <div class="option-item">
                                        <a @click.prevent="toggle" href="#" class="cart-link">
                                            <i class="fas fa-shopping-bag"></i>
                                            <span class="count">{{cart.length}}</span>
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
        });
    },
    computed: {
        cart(){
            return this.$store.getters.cart
        }
    },
    methods: {
        toggle() {
            mutations.toggleNav()
        },
        
            
        }
    }

</script>