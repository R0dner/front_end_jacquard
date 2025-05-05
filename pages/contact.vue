<template>
    <div>
        <div class="page-title-area">
            <div class="container">
                <ul>
                    <li><nuxt-link to="/">Inicio</nuxt-link></li>
                    <li>Contáctanos</li>
                </ul>
            </div>
        </div>

        <section class="contact-area ptb-60">
            <div class="container">
                <div class="section-title">
                    <h2><span class="dot"></span> Contáctanos </h2>
                </div>

                <div class="row">
                    <div class="col-lg-5 col-md-12">
                        <div class="contact-info">
                            <h3>Estamos aquí para ayudarte</h3>
                            <p>¿Tienes alguna pregunta? Puedes encontrar respuestas en nuestras preguntas frecuentes, pero también puedes contactarnos directamente.</p>

                            <ul class="contact-list">
                                <li><i class="fas fa-phone"></i> Llámanos: <a href="#">(+591) 71244124 - (+591) 72503205</a></li>
                                <li><i class="far fa-envelope"></i> Escríbenos: <a href="#">ntipola@gmail.com</a></li>
                            </ul>

                            <h3>Horario de atención:</h3>
                            <ul class="opening-hours">
                                <li><span>Lunes:</span> 8:30AM - 5:00PM</li>
                                <li><span>Martes:</span> 8:30AM - 5:00PM</li>
                                <li><span>Miércoles:</span> 8:30AM - 5:00PM</li>
                                <li><span>Jueves:</span> 8:30AM - 5:00PM</li>
                                <li><span>Viernes:</span> 8:30AM - 5:00PM</li>
                                <li><span>Sabado:</span>Cerrado</li>
                                <li><span>Domingo:</span> Cerrado</li>
                            </ul>

                            <h3>Síguenos:</h3>
                            <ul class="social">
                                <li><a href="#"><i class="fab fa-facebook-f"></i></a></li>           
                            <li><a href="#" aria-label="TikTok" class="tiktok-icon">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="#000000">
                                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                                </svg>
                            </a></li>
                                <li><a href="#"><i class="fab fa-instagram"></i></a></li>
                            </ul>
                        </div>
                    </div>

                    <div class="col-lg-7 col-md-12">
                        <div class="contact-form">
                            <h3>Escríbenos</h3>
                            <p>Estamos encantados de responder cualquier pregunta que tengas o proporcionarte una estimación. Simplemente envíanos un mensaje en el siguiente formulario con cualquier consulta que puedas tener.</p>

                            <form id="contactForm">
                                <div class="row">
                                    <div class="col-lg-12 col-md-12">
                                        <div class="form-group">
                                            <label>Nombre Completo <span>(requerido)*</span></label>
                                            <input type="text" name="full_name" id="full_name" class="form-control" placeholder="Ingresa tu nombre completo">
                                        </div>
                                    </div>

                                    <div class="col-lg-12 col-md-12">
                                        <div class="form-group">
                                            <label>Tipo de Mensaje <span>(requerido)*</span></label>
                                            <select name="message_type" id="message_type" class="form-control">
                                                <option value="Consulta General">Consulta general</option>
                                                <option value="Soporte Técnico">Ofertas especiales</option>
                                                <option value="Ventas">Descuentos</option>
                                                <option value="Otro">Otro</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div class="col-lg-12 col-md-12">
                                        <div class="form-group">
                                            <label>Descripción Breve <span>(requerido)*</span></label>
                                            <textarea name="description" id="description" cols="30" rows="8" class="form-control" placeholder="Describe brevemente tu consulta"></textarea>
                                        </div>
                                    </div>

                                    <div class="col-lg-12 col-md-12">
                                        <button type="button" class="btn btn-primary" @click="sendToWhatsApp">Enviar por WhatsApp</button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    </div>
</template>

<script>
import Swal from 'sweetalert2'; // Importar SweetAlert2

export default {
    methods: {
        sendToWhatsApp() {
            // Obtener los valores del formulario
            const fullName = document.getElementById('full_name').value;
            const messageType = document.getElementById('message_type').value;
            const description = document.getElementById('description').value;

            // Validar que todos los campos estén llenos
            if (!fullName || !messageType || !description) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Por favor, completa todos los campos requeridos.',
                });
                return;
            }

            // Crear el mensaje para WhatsApp
            const whatsappMessage = `Hola, mi nombre es *${fullName}*, Mi mensaje es para saber sobre su apartado de: *${messageType}* y por este método brevemente le describo mi requerimiento: ${description}`;

            // Número de WhatsApp (reemplaza con el número deseado)
            const phoneNumber = '74277508';

            // Crear el enlace de WhatsApp
            const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(whatsappMessage)}`;

            // Abrir WhatsApp en una nueva pestaña
            window.open(whatsappUrl, '_blank');

            // Mostrar alerta de confirmación después de que el usuario haya enviado el mensaje
            Swal.fire({
                icon: 'success',
                title: '¡Gracias por contactarnos!',
                text: 'Su mensaje fue enviado correctamente.',
                confirmButtonText: 'Aceptar',
            });
        },
    },
};
</script>

<style scoped>
/* Estilos base y comunes (mantengo lo anterior) */
.page-title-area {
    padding: 15px 0;
    background-color: #f8f9fa;
    margin-bottom: 20px;
}

.page-title-area ul {
    display: flex;
    flex-wrap: wrap;
    list-style-type: none;
    padding: 0;
    margin: 0;
}

.page-title-area li {
    margin-right: 15px;
    position: relative;
}

.page-title-area li:not(:last-child)::after {
    content: "/";
    margin-left: 15px;
    color: #6c757d;
}

/* Sección de contacto */
.contact-area {
    padding: 60px 0;
}

.section-title {
    text-align: center;
    margin-bottom: 40px;
    position: relative;
}

.section-title h2 {
    font-size: 28px;
    font-weight: 700;
    position: relative;
    display: inline-block;
}

.section-title .dot {
    display: inline-block;
    width: 10px;
    height: 10px;
    background-color: #0a6cf5;
    border-radius: 50%;
    margin-right: 8px;
    position: relative;
    top: -2px;
}

/* Estilos para información de contacto */
.contact-info {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
    padding: 30px;
    height: 100%;
}

.contact-info h3 {
    font-size: 22px;
    font-weight: 600;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid #e9ecef;
    color: #333;
}

.contact-info p {
    margin-bottom: 25px;
    color: #6c757d;
    line-height: 1.6;
}

.contact-list {
    padding: 0;
    margin: 0 0 30px;
    list-style-type: none;
}

.contact-list li {
    position: relative;
    padding-left: 30px;
    margin-bottom: 15px;
    color: #333;
}

.contact-list li i {
    position: absolute;
    left: 0;
    top: 5px;
    color: #ff9d00;
}

.contact-list li a {
    color: #333;
    text-decoration: none;
    transition: color 0.3s ease;
}

.contact-list li a:hover {
    color: #f88c07;
}

/* Horario de atención */
.opening-hours {
    padding: 0;
    margin: 0 0 30px;
    list-style-type: none;
}

.opening-hours li {
    margin-bottom: 10px;
    display: flex;
    justify-content: space-between;
    border-bottom: 1px dashed #e9ecef;
    padding-bottom: 10px;
}

.opening-hours li:last-child {
    border-bottom: none;
}

.opening-hours li span {
    font-weight: 600;
    color: #333;
}

/* Redes sociales */
.social {
    padding: 0;
    margin: 0;
    list-style-type: none;
    display: flex;
    flex-wrap: wrap;
}

.social li {
    margin-right: 15px;
}

.social li a {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 40px;
    height: 40px;
    background-color: #f8f9fa;
    border-radius: 50%;
    color: #333;
    font-size: 18px;
    transition: all 0.3s ease;
    text-decoration: none;
}

.social li a:hover {
    background-color: #ff9100;
    color: #fff;
    transform: translateY(-3px);
}

/* Formulario de contacto */
.contact-form {
    background-color: #fff;
    border-radius: 8px;
    box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
    padding: 30px;
    height: 100%;
}

.contact-form h3 {
    font-size: 22px;
    font-weight: 600;
    margin-bottom: 20px;
    padding-bottom: 10px;
    border-bottom: 1px solid #e9ecef;
    color: #333;
}

.contact-form p {
    margin-bottom: 25px;
    color: #6c757d;
    line-height: 1.6;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #333;
}

.form-group label span {
    color: #dc3545;
    font-size: 14px;
}

.form-control {
    width: 100%;
    height: 50px;
    padding: 10px 15px;
    font-size: 15px;
    border: 1px solid #ced4da;
    border-radius: 4px;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus {
    border-color: #6c6c6d;
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgba(239, 199, 145, 0.25);
}

textarea.form-control {
    height: auto;
    resize: vertical;
}

select.form-control {
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 10px center;
    background-size: 1em;
}

/* Botón WhatsApp */
.btn-primary {
    background-color: #ff8400;
    border-color: #ff9100;
    color: #fff;
    padding: 12px 30px;
    font-size: 16px;
    font-weight: 500;
    border-radius: 4px;
    transition: all 0.3s ease;
    cursor: pointer;
    width: 100%;
    margin-top: 10px;
}

.btn-primary:hover {
    background-color: #e98707;
    border-color: #cc7400;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(255, 191, 0, 0.3);
}

.btn-primary:focus {
    box-shadow: 0 0 0 0.2rem rgba(255, 157, 0, 0.5);
}

/* Media queries para responsividad */
@media (max-width: 1199px) {
    .contact-info, .contact-form {
        padding: 25px;
    }
    
    .contact-area {
        padding: 50px 0;
    }
}

@media (max-width: 991px) {
    .section-title h2 {
        font-size: 26px;
    }
    
    .contact-info, .contact-form {
        padding: 20px;
        margin-bottom: 30px;
    }
    
    .contact-info h3, .contact-form h3 {
        font-size: 20px;
    }
    
    .contact-area {
        padding: 40px 0;
    }
    
    .social li a {
        width: 35px;
        height: 35px;
        font-size: 16px;
    }
}

@media (max-width: 767px) {
    .section-title {
        margin-bottom: 30px;
    }
    
    .section-title h2 {
        font-size: 24px;
    }
    
    .contact-info, .contact-form {
        padding: 20px 15px;
    }
    
    .contact-area {
        padding: 30px 0;
    }
    
    .contact-info h3, .contact-form h3 {
        font-size: 18px;
        margin-bottom: 15px;
    }
    
    .form-group {
        margin-bottom: 15px;
    }
    
    .form-control {
        height: 45px;
        font-size: 14px;
    }
    
    .btn-primary {
        padding: 10px 25px;
        font-size: 15px;
        /* Asegurar que el botón siempre esté abajo */
        margin-top: 15px;
        order: 999; /* Utiliza order para posicionar el botón al final */
    }
    
    .contact-info {
        margin-bottom: 30px;
    }
    
    .contact-list li, .opening-hours li {
        font-size: 15px;
        margin-bottom: 12px;
    }
    
    /* Ajustar orden en móviles - formulario primero, info después */
    .row {
        display: flex;
        flex-direction: column-reverse;
    }
    
    .col-lg-5 {
        margin-top: 30px;
    }
    
    /* Colocar el botón después de todos los campos */
    #contactForm .row {
        display: flex;
        flex-direction: column;
    }
    
    #contactForm .col-lg-12:last-child {
        order: 999;
        margin-top: 20px;
    }
}

@media (max-width: 575px) {
    .page-title-area {
        padding: 10px 0;
    }
    
    .page-title-area li {
        font-size: 14px;
    }
    
    .section-title h2 {
        font-size: 22px;
    }
    
    .contact-info h3, .contact-form h3 {
        font-size: 17px;
    }
    
    .contact-info p, .contact-form p {
        font-size: 14px;
        margin-bottom: 20px;
    }
    
    .contact-list li, .opening-hours li {
        font-size: 14px;
        margin-bottom: 10px;
    }
    
    .contact-list li i {
        top: 3px;
    }
    
    .form-group label {
        font-size: 14px;
        margin-bottom: 6px;
    }
    
    .form-control {
        height: 42px;
        padding: 8px 12px;
        font-size: 14px;
    }
    
    .btn-primary {
        padding: 10px 20px;
        font-size: 14px;
        margin-top: 20px; /* Aumentar espacio para separar mejor del último campo */
    }
    
    .social li a {
        width: 32px;
        height: 32px;
        font-size: 14px;
    }
}

@media (max-width: 375px) {
    .contact-info, .contact-form {
        padding: 15px 12px;
    }
    
    .section-title h2 {
        font-size: 20px;
    }
    
    .contact-list li {
        padding-left: 25px;
    }
    
    .contact-list li i {
        font-size: 14px;
    }
    
    .btn-primary {
        padding: 8px 15px;
        font-size: 13px;
        margin-top: 25px; /* Más separación en dispositivos muy pequeños */
    }
    
    textarea.form-control {
        min-height: 120px;
    }
    
    /* Mejora del espacio de toque para móviles pequeños */
    .social li a {
        width: 38px;
        height: 38px;
        margin-bottom: 10px;
    }
    
    .form-control {
        font-size: 13px;
    }
}

/* Estilos para SweetAlert2 */
.swal2-popup {
    font-family: 'Arial', sans-serif;
    border-radius: 8px;
    padding: 20px;
}

.swal2-title {
    font-size: 22px;
    font-weight: 600;
    color: #333;
}

.swal2-html-container {
    font-size: 15px;
    color: #555;
}

.swal2-confirm {
    background-color: #ffa200 !important;
    border-radius: 4px !important;
    font-weight: 500 !important;
    box-shadow: 0 2px 10px rgba(238, 156, 4, 0.3) !important;
}

/* Ajustes para SweetAlert en dispositivos móviles */
@media (max-width: 575px) {
    .swal2-popup {
        padding: 15px;
        width: 90% !important;
    }
    
    .swal2-title {
        font-size: 18px;
    }
    
    .swal2-html-container {
        font-size: 14px;
    }
    
    .swal2-confirm {
        font-size: 14px !important;
        padding: 8px 16px !important;
    }
}
</style>