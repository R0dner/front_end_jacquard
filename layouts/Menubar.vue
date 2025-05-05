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

                            <b-navbar-toggle target="navbarSupportedContent" @click="toggleMobileMenu" ref="navToggle"></b-navbar-toggle>

                            <b-collapse class="collapse navbar-collapse" id="navbarSupportedContent" is-nav>
                                
                                <ul class="navbar-nav mx-auto">
                                    <!-- Enlaces del menú con índices para animación -->
                                    <li class="nav-item" :style="{'--item-index': 0}">
                                        <nuxt-link to="/" class="nav-link" exact @click.native="navigateTo('/')">Inicio</nuxt-link>
                                    </li>
                                    <li class="nav-item" :style="{'--item-index': 1}">
                                        <nuxt-link to="/solicitud" class="nav-link" @click.native="navigateTo('/solicitud')">Tus Pedidos </nuxt-link>
                                    </li>
                                    <li class="nav-item" :style="{'--item-index': 2}">
                                        <nuxt-link to="/products" class="nav-link" @click.native="navigateTo('/products')">Galeria de productos</nuxt-link>
                                    </li>
                                    <li class="nav-item dropdown" :style="{'--item-index': 3}">
                                        <a href="#" class="nav-link dropdown-toggle" @click.prevent="toggleMobileDropdown($event)">
                                            Conocenos <i class="fas fa-chevron-down"></i>
                                        </a>
                                        <ul class="dropdown-menu">
                                            <li class="nav-item"><nuxt-link to="/blog-one" class="nav-link" @click.native="navigateTo('/blog-one')">Novedades</nuxt-link></li>
                                            <li class="nav-item"><nuxt-link to="/blog-details" class="nav-link" @click.native="navigateTo('/blog-details')">Sobre nosotros</nuxt-link></li>
                                        </ul>
                                    </li>
                                    <li class="nav-item" :style="{'--item-index': 4}">
                                        <nuxt-link to="/contact" class="nav-link" @click.native="navigateTo('/contact')">Contactanos</nuxt-link>
                                    </li>
                                </ul>

                                <div class="others-option">
                                    <!-- Ícono de login con dropdown moderno -->
                                    <div class="option-item dropdown">
                                        <a href="#" class="auth-link dropdown-toggle" @click.prevent="toggleMobileDropdown($event)">
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

        <!-- Barra de navegación inferior para móvil -->
        <div class="nav-icons-mobile d-lg-none">
            <div class="option-item">
                <nuxt-link to="/" class="nav-link">
                    <i class="fas fa-home"></i>
                </nuxt-link>
            </div>
            <div class="option-item">
                <nuxt-link to="/products" class="nav-link">
                    <i class="fas fa-store"></i>
                </nuxt-link>
            </div>
            <div class="option-item">
                <a @click.prevent="toggle" href="#" class="cart-link">
                    <i class="fas fa-shopping-bag"></i>
                    <span class="count">{{cart.length}}</span>
                </a>
            </div>
            <div class="option-item">
                <a href="#" class="auth-link" @click.prevent="toggleMobileDropdown($event)">
                    <i class="fas fa-user"></i>
                </a>
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
            user: null, 
            isMobileMenuOpen: false
        };
    },
    created() {
        this.$nuxt.$on('user-logged-in', this.updateUser);
    },
    mounted() {
        window.addEventListener('scroll', this.handleScroll);
        document.addEventListener('click', this.closeDropdowns);
        this.updateUserFromLocalStorage();

        this.checkLocalStorageInterval = setInterval(this.checkLocalStorageChanges, 1000);
        
        this.$router.afterEach(() => {
            if (window.innerWidth <= 991) {
                this.closeAllDropdowns();
                this.closeMobileMenu();
            }
        });
        
        document.addEventListener('click', (event) => {
            if (window.innerWidth <= 991) {
                if (!event.target.closest('.dropdown') && !event.target.closest('.navbar-toggler')) {
                    this.closeAllDropdowns();
                }
            }
        });
    },
    beforeDestroy() {

        document.removeEventListener('click', this.closeDropdowns);
        window.removeEventListener('scroll', this.handleScroll);
        clearInterval(this.checkLocalStorageInterval);
        
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
        toggleMobileMenu() {
            this.isMobileMenuOpen = !this.isMobileMenuOpen;

            if (this.isMobileMenuOpen) {
                document.body.classList.add('menu-open');
            } else {
                document.body.classList.remove('menu-open');
            }
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
            
            const icon = dropdown.querySelector('.fa-chevron-down');
            if (icon) {
                if (dropdownMenu.classList.contains('show')) {
                    icon.classList.add('rotate-icon');
                } else {
                    icon.classList.remove('rotate-icon');
                }
            }
        },
        toggleMobileDropdown(event) {
            if (window.innerWidth <= 991) {
                const dropdown = event.target.closest('.dropdown');
                if (!dropdown) return;
                
                const dropdownMenu = dropdown.querySelector('.dropdown-menu');
                const isOpen = dropdownMenu.classList.contains('show');
                
                // Cerrar todos los dropdowns primero
                document.querySelectorAll('.dropdown-menu').forEach(menu => {
                    menu.classList.remove('show');
                    const toggleButton = menu.previousElementSibling;
                    if (toggleButton) {
                        toggleButton.classList.remove('show');
                        const icon = toggleButton.querySelector('.fa-chevron-down');
                        if (icon) icon.classList.remove('rotate-icon');
                    }
                });
                if (!isOpen) {
                    dropdownMenu.classList.add('show');
                    const icon = dropdown.querySelector('.fa-chevron-down');
                    if (icon) icon.classList.add('rotate-icon');
                }
                
                event.preventDefault();
                event.stopPropagation();
            } else {
                this.toggleDropdown(event);
            }
        },
        closeAllDropdowns() {
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
                menu.classList.remove('show');
                
                const icon = menu.previousElementSibling?.querySelector('.fa-chevron-down');
                if (icon) {
                    icon.classList.remove('rotate-icon');
                }
            });
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
        closeMobileMenu() { 
            if (window.innerWidth <= 991 && this.isMobileMenuOpen) {
                this.isMobileMenuOpen = false;
                
                if (this.$refs.navToggle && this.isMobileMenuOpen) {
                    this.$refs.navToggle.show = false;
                }

                if (this.$root && this.$root.$bvEventBus) {
                    this.$root.$bvEventBus.$emit('bv::toggle::collapse', 'navbarSupportedContent', false);
                }

                const navbarCollapse = document.getElementById('navbarSupportedContent');
                if (navbarCollapse) {
                    navbarCollapse.classList.remove('show');
                }

                const navbarToggler = document.querySelector('.navbar-toggler, .b-navbar-toggle');
                if (navbarToggler) {
                    navbarToggler.classList.add('collapsed');
                    navbarToggler.setAttribute('aria-expanded', 'false');
                }
                
                this.closeAllDropdowns();
                document.body.classList.remove('menu-open');
            }
        },
        navigateTo(path) {
            this.closeMobileMenu();
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
        checkLocalStorageChanges() {
            const currentUserJson = localStorage.getItem('user');
            const currentUser = currentUserJson ? JSON.parse(currentUserJson) : null;

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
            
            this.$router.push('/'); 
            
            document.querySelectorAll('.dropdown-menu.show').forEach(el => {
                el.classList.remove('show');
            });
            this.activeDropdown = null;
            this.closeMobileMenu();
        }
    }
};
</script>