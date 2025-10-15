<template lang="pug">
	div
		.page-title-area
			.container
				ul
					li
						nuxt-link(to='/') Inicio
					li Ingresar
		section.login-area.ptb-60
			.container
				.row
					.col-lg-3.col-md-12
					.col-lg-6.col-md-12
						.login-content
							.section-title
								h2
									span.dot
									|  Ingresar
							form.login-form(@submit.prevent="validateForm" @submit="saveForm" method='POST')
								.form-group
									label Correo Electrónico
									input.form-control(name='email' placeholder='Correo Electrónico' type='email' v-model="login.email" :class="errors.email!=null?'is-invalid':''")
									.invalid-feedback {{ errors.email }}
								.form-group
									label Contraseña
									input#password.form-control(type='password' placeholder='Contraseña' name='password' v-model="login.password" :class="errors.password!=null?'is-invalid':''")
									.invalid-feedback {{ errors.password }}
								button.btn.btn-primary(type='submit') Ingresar
								.success-message(v-if="success") {{ message }}
					.col-lg-3.col-md-12
		.toast(v-if="showToast") Bienvenido, {{ user.username }}
</template>
	
<script>
import Swal from 'sweetalert2'; // Importar SweetAlert2

export default {
	name: "LoginPage",
	data() {
		return {
			loading: false,
			login: {
				email: "",
				password: ""
			},
			valid: true,
			success: false,
			errors: {},
			message: "",
			user: null,
			showToast: false
		}
	},
	methods: {
		async saveForm() {
			if (this.validateForm()) {
				console.log("SAVE FORM......")
				console.log(this.login)

				await this.loginForm()
			}
		},
		async loginForm() {
			if (this.login.email != '' && this.login.password != '') {
				this.errorMensaje = ''
				try {
					const { data } = await this.$axios({
						baseURL: process.env.strapiBaseUri,
						url: '/api/auth/local',
						method: 'post',
						data: {
							identifier: this.login.email.trim(),
							password: this.login.password.trim()
						}
					})
					console.log(data)
					this.success = true
					this.message = 'Inicio de sesión correcto.'
					this.user = data.user

					// Guardar el usuario y token en localStorage
					localStorage.setItem('user_email', data.user.email);
					localStorage.setItem('user_id', data.user.id);
					localStorage.setItem('user', JSON.stringify(data.user));
					localStorage.setItem('jwt_token', data.jwt); // Guardar el token JWT
					
					// NUEVO: Recuperar wishlist del usuario desde Strapi
					await this.loadUserWishlist(data.user.id, data.jwt);
					
					// Emitir evento global para notificar el login
					this.$nuxt.$emit('user-logged-in', data.user);
					
					// Si estás usando Vuex, también actualiza el estado
					if (this.$store && this.$store.dispatch) {
						try {
							await this.$store.dispatch('auth/setUser', data.user);
							await this.$store.dispatch('auth/setToken', data.jwt);
						} catch (storeError) {
							console.warn('No se pudo actualizar el estado de Vuex:', storeError);
						}
					}

					// Mostrar mensaje de bienvenida
					Swal.fire({
						title: `Bienvenido, ${this.user.username}`,
						icon: 'success',
						background: '#1e1e2f',
						color: '#ffffff',
						showConfirmButton: false,
						timer: 1500,
						timerProgressBar: true,
						position: 'top-end',
						toast: true,
						width: '300px',
						customClass: {
							popup: 'modern-toast',
						}
					});

					// Redirigir después de actualizar el estado
					setTimeout(() => {
						this.$router.push('/');
					}, 100);

				} catch (error) {
					console.error(error);
					this.errorMensaje = 'Error.'
					this.success = false
					this.message = 'Error en el inicio de sesión.'
					
					Swal.fire({
						title: 'Error de autenticación',
						text: 'Credenciales incorrectas o problema de conexión',
						icon: 'error',
						background: '#1e1e2f',
						color: '#ffffff',
					});
				}
			} else {
				this.errorMensaje = 'Introduzca un Documento de Identidad y Fecha de Nacimiento validas.'
			}
		},
		// NUEVO MÉTODO: Cargar wishlist del usuario desde Strapi
		async loadUserWishlist(userId, token) {
			try {
				console.log('Cargando wishlist para usuario:', userId);
				
				// Opción 1: Si tienes una colección "wishlists" en Strapi
				const response = await this.$axios({
					baseURL: process.env.strapiBaseUri,
					url: '/api/wishlists',
					method: 'get',
					headers: {
						Authorization: `Bearer ${token}`
					},
					params: {
						'filters[user][id][$eq]': userId,
						'populate': ['producto', 'producto.imagen_principal']
					}
				});

				if (response.data && response.data.data) {
					// Transformar los datos de Strapi al formato de tu wishlist local
					const wishlistItems = response.data.data.map(item => {
						const producto = item.attributes.producto?.data;
						if (!producto) return null;

						return {
							id: producto.id,
							name: producto.attributes.nombre,
							price: producto.attributes.precio_oferta || producto.attributes.precio_venta,
							originalPrice: producto.attributes.precio_venta,
							onSale: producto.attributes.en_oferta || false,
							image: this.getProductImageUrl(producto),
							marca: producto.attributes.marca,
							stock: producto.attributes.stock || 0
						};
					}).filter(item => item !== null);

					// Guardar en localStorage
					localStorage.setItem('wishlist', JSON.stringify(wishlistItems));
					
					console.log('Wishlist cargada:', wishlistItems.length, 'productos');
					
					// Emitir evento para actualizar los componentes
					this.$root.$emit('wishlist-updated');
					
					return wishlistItems;
				}
			} catch (error) {
				console.error('Error al cargar wishlist del usuario:', error);
				
				// Si hay error, inicializar wishlist vacía
				localStorage.setItem('wishlist', '[]');
				
				// No mostrar error al usuario, solo log
				return [];
			}
		},

		// MÉTODO AUXILIAR: Obtener URL de imagen del producto
		getProductImageUrl(producto) {
			if (!producto) return '/images/default-product.jpg';
			
			const imagenData = producto.attributes?.imagen_principal?.data?.attributes;
			
			if (imagenData?.url) {
				let cleanUrl = imagenData.url.trim();
				
				if (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://')) {
					return cleanUrl;
				}
				
				const baseUrl = process.env.strapiBaseUri?.endsWith('/') 
					? process.env.strapiBaseUri.slice(0, -1) 
					: process.env.strapiBaseUri;
				
				return `${baseUrl}${cleanUrl.startsWith('/') ? cleanUrl : '/' + cleanUrl}`;
			}

			return '/images/default-product.jpg';
		},

		validateForm() {
			this.errors = {}
			const validMail = this.validateString(this.login.email)
			this.errors.email = validMail.error
			this.valid = validMail.valid

			const validPassword = this.validateString(this.login.password)
			this.errors.password = validPassword.error
			this.valid = validPassword.valid
			
			let isvalid = validMail.valid & validPassword.valid

			return isvalid
		},
		validateString(val) {
			if (!val.length)
				return { valid: false, error: "Este campo es obligatorio." }
			return { valid: true, error: null }
		},
	},
}
</script>
	
<style>
/* Estilos personalizados para SweetAlert2 */
.modern-toast {
	border-radius: 10px;
	box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
	animation: slideIn 0.5s ease-out;
}

@keyframes slideIn {
	from {
		transform: translateX(100%);
		opacity: 0;
	}
	to {
		transform: translateX(0);
		opacity: 1;
	}
}
</style>