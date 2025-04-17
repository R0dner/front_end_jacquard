<template lang="pug">
	footer.footer-area
		.container
			.row
				.col-lg-3.col-md-6.col-sm-6
					.single-footer-widget
						.footer-logo
							nuxt-link(to='/')
								img(src='../assets/img/logo.png' alt='logo')
						.social-links
							a(href='#')
								i.fab.fa-facebook-f
							a(href='#')
								i.fab.fa-twitter
							a(href='#')
								i.fab.fa-instagram
							a(href='#')
								i.fab.fa-linkedin-in
				.col-lg-3.col-md-6.col-sm-6
					.single-footer-widget
						h3 Enlaces Rápidos
						ul.quick-links
							li
								nuxt-link(to='/blog-details') Sobre Nosotros
							li
								nuxt-link(to='/products') Prendas
							li
								nuxt-link(to='/contact') Contacto
				.col-lg-3.col-md-6.col-sm-6
					.single-footer-widget
						h3 Información
						ul.information-links
							li
								nuxt-link(to='/privacy-policy') Política de Privacidad
							li
								nuxt-link(to='/terms-of-service') Términos de Servicio
							li
								nuxt-link(to='/faq') Preguntas Frecuentes
				.col-lg-3.col-md-6.col-sm-6
					.single-footer-widget
						h3 Contáctanos
						ul.footer-contact-info
							li
								i.fas.fa-map-marker-alt
								|  Dirección: 2750 Quadra Street Victoria, Canada
							li
								i.fas.fa-phone
								|  Teléfono:  
								a(href='#') (+123) 456-7898
							li
								i.far.fa-envelope
								|  Correo:  
								a(href='#') info@bolster.com
		.copyright-area
			.container
				.row.align-items-center
					.col-lg-12.col-md-12
						.text-center
							p Jacquard &copy; {{ new Date().getFullYear() }}
	</template>