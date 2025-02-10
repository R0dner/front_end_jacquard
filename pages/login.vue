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
					.col-lg-3.col-md-12
</template>

<script>
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
				message: ""
			}
		},
		methods: {
			async saveForm() {
				if (this.validateForm()) {
					console.log("SAVE FORM......")
					console.log(this.login)

					this.loginForm()
				}
			},
			async loginForm() {
				if (this.login.email != '' && this.login.password != '') {
					this.errorMensaje = ''
					try {
						const data = await this.$axios({
						baseURL: process.env.strapiBaseUri,
						url: '/api/auth/local',
						method: 'post',
						data: {
							identifier: this.login.email.trim(),
							password: this.login.password.trim()
						}})
						console.log(data.data)
					} catch (error) {
						console.error(error);
						this.errorMensaje = 'Error.'
					}
				} else {
					this.errorMensaje = 'Introduzca un Documento de Identidad y Fecha de Nacimiento validas.'
				}
			},
			validateForm() {
				this.errors = {}
				const validMail = this.validateString(this.login.email)
				this.errors.email = validMail.error
				this.valid = validMail.valid

				const validPassword = this.validateString(this.login.password)
				this.errors.password = validPassword.error
				this.valid = validPassword.valid
				
				let isvalid = validMail.valid&validPassword.valid

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