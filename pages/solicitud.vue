<template lang="pug">
    div
        .page-title-area
            .container
                ul
                    li
                        nuxt-link(to='/') Inicio
                    li Seguimiento de Pedido
        section.contact-area.ptb-60
            .container
                .section-title
                    h2
                        span.dot
                        |  Estado de Pedido
                .row
                    .col-lg-12.col-md-12
                        h3 Mis Pedidos
                        .order-list(v-if="pedidos.length > 0")
                            .order-item(v-for="pedido in pedidos" :key="pedido.id")
                                .order-header
                                    h4 Pedido #
                                        | {{ pedido.referencia }}
                                    span.status(:class="getStatusClass(pedido.estado)") {{ getStatusLabel(pedido.estado) }}
                                .order-details
                                    .row
                                        .col-lg-6.col-md-12
                                            p
                                                strong Fecha de Solicitud:
                                                |  {{ formatDate(pedido.fecha_pedido) }}
                                            p
                                                strong Fecha de Entrega Solicitada:
                                                |  {{ formatDate(pedido.fecha_entrega_solicitada) }}
                                            p
                                                strong Método de Pago:
                                                |  {{ getMetodoPagoLabel(pedido.metodo_pago) }}
                                        .col-lg-6.col-md-12
                                            p
                                                strong Productos:
                                                ul
                                                    li(v-for="(producto, index) in getProductos(pedido.productos)" :key="index") 
                                                        | {{ producto.nombre }} 
                                                        template(v-if="producto.talla")
                                                            | - Talla: {{ producto.talla }} 
                                                        | - Cantidad: {{ producto.cantidad }}
                                            p
                                                strong Total:
                                                |  {{ formatCurrency(pedido.total) }}
                        .no-orders(v-else)
                            p(v-if="isLoading") Cargando pedidos...
                            p(v-else) No hay pedidos registrados para este usuario.
    </template>
    
    <script>
    export default {
        data() {
            return {
                pedidos: [],
                isLoading: true,
                userEmail: null,
                usuario: null
            }
        },
        mounted() {
            // Verificar usuario logueado primero
            this.verificarUsuarioLogueado();
        },
        methods: {
            verificarUsuarioLogueado() {
                if (process.client) { // Solo en el lado del cliente
                    // Intentar obtener el email directamente (como lo guarda el login)
                    const userEmail = localStorage.getItem('user_email');
                    if (userEmail) {
                        this.userEmail = userEmail;
                        console.log('Email de usuario encontrado:', this.userEmail);
                    }
                    
                    // También obtener el objeto de usuario completo
                    const userJSON = localStorage.getItem('user');
                    if (userJSON) {
                        try {
                            this.usuario = JSON.parse(userJSON);
                            console.log('Usuario logueado:', this.usuario);
                            
                            // Si no tenemos email pero tenemos usuario, usar su email
                            if (!this.userEmail && this.usuario.email) {
                                this.userEmail = this.usuario.email;
                            }
                        } catch (e) {
                            console.error('Error al parsear usuario de localStorage:', e);
                        }
                    }
                    
                    // Una vez obtenido el usuario, cargar los pedidos
                    this.cargarPedidos();
                }
            },
            async cargarPedidos() {
    try {
        this.isLoading = true;
        
        // Si no hay usuario logueado, no cargar pedidos
        if (!this.userEmail) {
            console.log('No hay usuario logueado');
            this.pedidos = [];
            this.isLoading = false;
            return;
        }
        
        // Construir la URL con filtros de Strapi v4
        const url = `/api/pedidos?populate=*&sort=fecha_pedido:desc&filters[user_email][$eq]=${encodeURIComponent(this.userEmail)}`;
        
        console.log('URL de petición:', url);
        
        const response = await this.$axios.get(url);
        
        if (response.data?.data) {
            this.pedidos = response.data.data.map(item => ({
                id: item.id,
                ...item.attributes
            }));
            
            console.log('Pedidos cargados para:', this.userEmail);
            console.log('Total de pedidos:', this.pedidos.length);
        } else {
            this.pedidos = [];
            console.log('No se encontraron pedidos en la respuesta');
        }
    } catch (error) {
        console.error('Error al cargar pedidos:', error);
        console.error('Detalles del error:', error.response?.data);
        this.pedidos = [];
    } finally {
        this.isLoading = false;
    }
},
            getProductos(productosJson) {
                // Parsear los productos si vienen como string JSON
                if (typeof productosJson === 'string') {
                    try {
                        return JSON.parse(productosJson)
                    } catch (e) {
                        console.error('Error al parsear productos JSON:', e)
                        return []
                    }
                }
                
                // Si ya es un array u objeto, devolverlo directamente
                return productosJson || []
            },
            getStatusClass(estado) {
                // Mapea cada estado posible a una clase CSS
                const statusMap = {
                    'pendiente': 'pendiente',
                    'procesando': 'en-proceso',
                    'enviado': 'enviado',
                    'entregado': 'entregado',
                    'cancelado': 'cancelado'
                }
                return statusMap[estado] || 'default'
            },
            getStatusLabel(estado) {
                // Mapea cada código de estado a un texto legible
                const statusLabels = {
                    'pendiente': 'Pendiente',
                    'procesando': 'En Proceso',
                    'enviado': 'Enviado',
                    'entregado': 'Entregado',
                    'cancelado': 'Cancelado'
                }
                return statusLabels[estado] || estado
            },
            getMetodoPagoLabel(metodo) {
                // Mapea los códigos de método de pago a textos legibles
                const metodosLabels = {
                    'transferencia_bancaria': 'Transferencia Bancaria',
                    'pago_qr': 'Pago QR',
                    'efectivo': 'Efectivo'
                }
                return metodosLabels[metodo] || metodo
            },
            formatDate(dateString) {
                if (!dateString) return 'N/A'
                
                try {
                    const date = new Date(dateString)
                    return date.toLocaleString('es-ES', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                    })
                } catch (e) {
                    console.error('Error al formatear fecha:', e)
                    return dateString
                }
            },
            formatCurrency(value) {
                if (value === undefined || value === null) return 'N/A'
                
                try {
                    return new Intl.NumberFormat('es-BO', {
                        style: 'currency',
                        currency: 'BOB'
                    }).format(value)
                } catch (e) {
                    console.error('Error al formatear moneda:', e)
                    return `${value} BOB`
                }
            }
        }
    }
    </script>
    
    <style scoped>
    /* Estilos base mejorados */
.order-list {
    margin-top: 20px;
}

.order-item {
    border: 1px solid #ddd;
    padding: 15px;
    margin-bottom: 15px;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    transition: all 0.3s ease;
}

.order-item:hover {
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
}

.order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
    flex-wrap: wrap;
    gap: 10px;
}

.order-header h4 {
    margin: 0;
    font-weight: 600;
}

.status {
    padding: 6px 12px;
    border-radius: 20px;
    font-weight: 600;
    font-size: 0.9rem;
    display: inline-block;
    text-align: center;
}

.status.pendiente {
    background-color: #3399ff;
    color: #fff;
}

.status.en-proceso {
    background-color: #ffcc00;
    color: #000;
}

.status.enviado {
    background-color: #9966ff;
    color: #fff;
}

.status.entregado {
    background-color: #00cc66;
    color: #fff;
}

.status.cancelado {
    background-color: #ff3333;
    color: #fff;
}

.order-details p {
    margin: 8px 0;
    line-height: 1.5;
}

.order-details strong {
    font-weight: 600;
}

.order-details ul {
    list-style-type: none;
    padding: 0;
    margin-top: 5px;
}

.order-details ul li {
    margin: 8px 0;
    padding: 5px;
    background-color: #f9f9f9;
    border-radius: 4px;
}

.no-orders {
    text-align: center;
    padding: 30px;
    background-color: #f5f5f5;
    border-radius: 8px;
    font-size: 1.1rem;
    color: #555;
}

/* Estilos responsivos */
@media screen and (max-width: 991px) {
    .order-details .row {
        display: flex;
        flex-direction: column;
    }
    
    .order-details .col-lg-6 {
        width: 100%;
        padding: 0;
    }
    
    .order-details .col-lg-6:first-child {
        margin-bottom: 15px;
    }
}

@media screen and (max-width: 768px) {
    .page-title-area .container ul {
        flex-direction: column;
        align-items: center;
    }
    
    .section-title h2 {
        font-size: 1.5rem;
    }
    
    .order-header {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }
    
    .order-header .status {
        align-self: flex-start;
    }
    
    .order-item {
        padding: 12px;
    }
    
    h3 {
        text-align: center;
        margin-bottom: 20px;
    }
}

@media screen and (max-width: 576px) {
    .container {
        padding-left: 15px;
        padding-right: 15px;
    }
    
    .order-details ul li {
        font-size: 0.9rem;
        padding: 8px;
        line-height: 1.4;
        word-break: break-word;
    }
    
    .status {
        font-size: 0.8rem;
        padding: 5px 10px;
    }
    
    .order-header h4 {
        font-size: 1.1rem;
    }
    
    .order-details p {
        font-size: 0.9rem;
    }
}

/* Mejoras adicionales para experiencia móvil */
@media screen and (max-width: 480px) {
    .ptb-60 {
        padding-top: 30px;
        padding-bottom: 30px;
    }
    
    .section-title {
        margin-bottom: 20px;
    }
    
    .order-list {
        margin-top: 15px;
    }
    
    .order-item {
        margin-bottom: 12px;
    }
}
    </style>