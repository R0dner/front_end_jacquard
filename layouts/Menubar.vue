<template>
    <div>
        <div :class="['navbar-area', {'is-sticky': isSticky}]">
            <div class="comero-nav">
                <div class="container-fluid">
                    <nav class="navbar navbar-expand-lg navbar-light">
                        <div class="navbar-container d-flex align-items-center w-100">
                            <nuxt-link class="navbar-brand" to="/" exact>
                                <img src="../assets/img/logo.png" alt="logo" class="navbar-logo">
                            </nuxt-link>

                            <b-navbar-toggle target="navbarSupportedContent"></b-navbar-toggle>

                            <b-collapse class="collapse navbar-collapse" id="navbarSupportedContent" is-nav>
                                <ul class="navbar-nav mx-auto">
                                    <!-- Enlaces del menú -->
                                    <li class="nav-item">
                                        <nuxt-link to="/" class="nav-link" exact @click.native="navigateTo('/')">Inicio</nuxt-link>
                                    </li>
                                    <li class="nav-item">
                                        <nuxt-link to="/solicitud" class="nav-link" @click.native="navigateTo('/solicitud')">Solicitud</nuxt-link>
                                    </li>
                                    <li class="nav-item">
                                        <nuxt-link to="/products" class="nav-link" @click.native="navigateTo('/products')">Galeria de productos</nuxt-link>
                                    </li>
                                    <li class="nav-item dropdown">
                                        <a href="#" class="nav-link dropdown-toggle" @click.prevent="toggleDropdown($event)">
                                            Conocenos <i class="fas fa-chevron-down"></i>
                                        </a>
                                        <ul class="dropdown-menu">
                                            <li class="nav-item"><nuxt-link to="/blog-one" class="nav-link" @click.native="navigateTo('/blog-one')">Novedades</nuxt-link></li>
                                            <li class="nav-item"><nuxt-link to="/blog-details" class="nav-link" @click.native="navigateTo('/blog-details')">Sobre nuestras prendas</nuxt-link></li>
                                        </ul>
                                    </li>
                                    <li class="nav-item">
                                        <nuxt-link to="/contact" class="nav-link" @click.native="navigateTo('/contact')">Contactanos</nuxt-link>
                                    </li>
                                </ul>

                                <div class="others-option">
                                    <!-- Ícono de login con dropdown moderno -->
                                    <div class="option-item dropdown">
                                        <a href="#" class="auth-link dropdown-toggle" @click.prevent="toggleDropdown($event)">
                                            <i class="fas fa-user"></i>
                                            <!-- Solo mostrar información del usuario si está logueado -->
                                            <span v-if="user" class="user-text">
                                                <span class="username">{{ user.username }}</span>
                                                <i class="fas fa-chevron-down"></i>
                                            </span>
                                            <!-- Eliminamos el texto "Iniciar sesión" cuando no hay usuario -->
                                        </a>
                                        <ul class="dropdown-menu user-dropdown-menu">
                                            <li class="nav-item" v-if="!user">
                                                <nuxt-link to="/login" class="nav-link" @click.native="navigateTo('/login')">
                                                    <i class="fas fa-sign-in-alt"></i> Iniciar sesión
                                                </nuxt-link>
                                            </li>
                                            <li class="nav-item" v-if="user">
                                                <a href="#" @click.prevent="logout" class="nav-link">
                                                    <i class="fas fa-sign-out-alt"></i> Cerrar sesión
                                                </a>
                                            </li>
                                        </ul>
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
    data() {
        return {
            isSticky: false,
            activeDropdown: null,
            user: null // Estado del usuario
        };
    },
    created() {
        // Añadimos un listener global para el evento de login
        this.$nuxt.$on('user-logged-in', this.updateUser);
    },
    mounted() {
        window.addEventListener('scroll', this.handleScroll);

        // Cerrar dropdowns al hacer clic fuera
        document.addEventListener('click', this.closeDropdowns);

        // Recuperar el usuario del localStorage al cargar la página
        this.updateUserFromLocalStorage();
        
        // Comprobar periódicamente si hay cambios en localStorage (como respaldo)
        this.checkLocalStorageInterval = setInterval(this.checkLocalStorageChanges, 1000);
    },
    beforeDestroy() {
        // Limpiar event listeners cuando el componente es destruido
        document.removeEventListener('click', this.closeDropdowns);
        window.removeEventListener('scroll', this.handleScroll);
        clearInterval(this.checkLocalStorageInterval);
        
        // Eliminar el listener global
        this.$nuxt.$off('user-logged-in', this.updateUser);
    },
    computed: {
        cart() {
            return this.$store.getters.cart;
        }
    },
    methods: {
        handleScroll() {
            let scrollPos = window.scrollY;
            this.isSticky = scrollPos >= 100;
        },
        toggle() {
            mutations.toggleNav();
        },
        toggleDropdown(event) {
            const dropdown = event.target.closest('.dropdown');
            const dropdownMenu = dropdown.querySelector('.dropdown-menu');
            
            if (dropdownMenu.classList.contains('show')) {
                dropdownMenu.classList.remove('show');
                this.activeDropdown = null;
            } else {
                document.querySelectorAll('.dropdown-menu.show').forEach(el => {
                    el.classList.remove('show');
                });
                dropdownMenu.classList.add('show');
                this.activeDropdown = dropdown;
            }
            
            // Girar el icono cuando se abre el dropdown
            const icon = dropdown.querySelector('.fa-chevron-down');
            if (icon) {
                if (dropdownMenu.classList.contains('show')) {
                    icon.classList.add('rotate-icon');
                } else {
                    icon.classList.remove('rotate-icon');
                }
            }
        },
        closeDropdowns(event) {
            if (this.activeDropdown && !this.activeDropdown.contains(event.target)) {
                document.querySelectorAll('.dropdown-menu.show').forEach(el => {
                    el.classList.remove('show');
                });
                document.querySelectorAll('.fa-chevron-down.rotate-icon').forEach(el => {
                    el.classList.remove('rotate-icon');
                });
                this.activeDropdown = null;
            }
        },
        navigateTo(path) {
            if (this.$route.path !== path) {
                this.$router.push(path).catch((error) => {
                    if (error.name !== 'NavigationDuplicated') {
                        throw error;
                    }
                });
            } else {
                if (path === '/' && window.location.pathname === '/') {
                    this.$nuxt.refresh();
                }
            }
        },
        updateUserFromLocalStorage() {
            try {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    this.user = JSON.parse(storedUser);
                    console.log('Usuario cargado desde localStorage:', this.user);
                } else {
                    this.user = null;
                }
            } catch (error) {
                console.error('Error al cargar el usuario desde localStorage:', error);
                this.user = null;
            }
        },
        // Método para verificar cambios en localStorage (como respaldo)
        checkLocalStorageChanges() {
            const currentUserJson = localStorage.getItem('user');
            const currentUser = currentUserJson ? JSON.parse(currentUserJson) : null;
            
            // Comparar si el usuario ha cambiado
            const currentUserString = JSON.stringify(this.user);
            const newUserString = JSON.stringify(currentUser);
            
            if (currentUserString !== newUserString) {
                console.log('Detectado cambio en localStorage, actualizando usuario');
                this.user = currentUser;
            }
        },
        // Método para actualizar el usuario cuando se recibe el evento
        updateUser(newUser) {
            console.log('Evento user-logged-in recibido:', newUser);
            this.user = newUser;
        },
        logout() {
            // Eliminar el usuario del localStorage y del estado
            localStorage.removeItem('user');
            this.user = null;
            
            // Emitir evento para otros componentes
            this.$nuxt.$emit('user-logged-out');
            
            this.$router.push('/'); // Redirigir a la página principal
            
            // Cerrar el dropdown después de cerrar sesión
            document.querySelectorAll('.dropdown-menu.show').forEach(el => {
                el.classList.remove('show');
            });
            this.activeDropdown = null;
        }
    }
};
</script>