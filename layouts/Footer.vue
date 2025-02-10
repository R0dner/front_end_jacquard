<template lang="pug">
	footer.footer-area
		.container
			.row
				.col-lg-3.col-md-6.col-sm-6
					.single-footer-widget
						.logo
							nuxt-link(to='/')
								img(src='../assets/img/logo.png' alt='logo')
						p
							| Acerca de...
				.col-lg-3.col-md-6.col-sm-6
					.single-footer-widget
				.col-lg-3.col-md-6.col-sm-6
					.single-footer-widget
				.col-lg-3.col-md-6.col-sm-6
					.single-footer-widget
						h3 Contactanos
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