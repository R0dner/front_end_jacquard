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
                                <li><i class="fas fa-map-marker-alt"></i> Ubicación: 2750 Quadra Street Victoria, Canadá</li>
                                <li><i class="fas fa-phone"></i> Llámanos: <a href="#">(+123) 456-7898</a></li>
                                <li><i class="far fa-envelope"></i> Escríbenos: <a href="#">support@comero.com</a></li>
                            </ul>

                            <h3>Horario de atención:</h3>
                            <ul class="opening-hours">
                                <li><span>Lunes:</span> 8AM - 6PM</li>
                                <li><span>Martes:</span> 8AM - 6PM</li>
                                <li><span>Miércoles:</span> 8AM - 6PM</li>
                                <li><span>Jueves - Viernes:</span> 8AM - 6PM</li>
                                <li><span>Domingo:</span> Cerrado</li>
                            </ul>

                            <h3>Síguenos:</h3>
                            <ul class="social">
                                <li><a href="#"><i class="fab fa-facebook-f"></i></a></li>
                                <li><a href="#"><i class="fab fa-tik-tok"></i></a></li>
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
/* Estilos personalizados para SweetAlert2 */
.swal2-popup {
    font-family: Arial, sans-serif;
}
</style>