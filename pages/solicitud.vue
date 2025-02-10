<template lang="pug">
    div
        .page-title-area
            .container
                ul
                    li
                        nuxt-link(to='/') Home
                    li Nueva Solicitud
        section.contact-area.ptb-60
            .container
                .section-title
                    h2
                        span.dot
                        |  Nueva Solicitud
                .row
                    .col-lg-1.col-md-12
                    .col-lg-5.col-md-12
                        h3 Acerca del Cliente
                        .contact-form
                            form#contactForm
                                .row
                                    .col-lg-12.col-md-12
                                        .form-group
                                            label Cliente
                                            input#name.form-control(type='text' name='name' placeholder='Seleccione cliente')
                                    .col-lg-6.col-md-12
                                        .form-group
                                            label Fecha de Solicitud
                                            input#phone_number.form-control(type='text' name='phone_number' placeholder='Fecha')
                                    .col-lg-6.col-md-12
                                        .form-group
                                            label Hora de Solicitud
                                            input#phone_number.form-control(type='text' name='phone_number' placeholder='Hora')
                                    .col-lg-6.col-md-12
                                        .form-group
                                            label Fecha de Entrega
                                            input#phone_number.form-control(type='text' name='phone_number' placeholder='Fecha')
                                    .col-lg-6.col-md-12
                                        .form-group
                                            label Hora de Entrega
                                            input#phone_number.form-control(type='text' name='phone_number' placeholder='Hora')
                                    .col-lg-12.col-md-12
                                        .form-group
                                            label Observaciones
                                            textarea#message.form-control(name='message' cols='30' rows='8' placeholder='Enter your Message')
                                    .col-lg-12.col-md-12
                                        button.btn.btn-primary(type='submit') Send Message
                    .col-lg-5.col-md-12
                        h3 Productos
                        .contact-form
                            form#contactForm
                                .row
                                    .col-lg-12.col-md-12
                                        .form-group
                                            label
                                                | Name 
                                                span (required)*
                                            input#name.form-control(type='text' name='name' placeholder='Enter your name')
                                    .col-lg-12.col-md-12
                                        .form-group
                                            label
                                                | Email 
                                                span (required)*
                                            input#email.form-control(type='email' name='email' placeholder='Enter your Email Address')
                                    .col-lg-12.col-md-12
                                        .form-group
                                            label
                                                | Phone Number 
                                                span (required)*
                                            input#phone_number.form-control(type='text' name='phone_number' placeholder='Enter your Phone Number')
                                    .col-lg-12.col-md-12
                                        .form-group
                                            label
                                                | Your Message 
                                                span (required)*
                                            textarea#message.form-control(name='message' cols='30' rows='8' placeholder='Enter your Message')
                                    .col-lg-12.col-md-12
                                        button.btn.btn-primary(type='submit') Send Message
</template>