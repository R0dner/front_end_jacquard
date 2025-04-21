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
        
        // Obtener todos los pedidos sin filtros
        const response = await this.$axios.get('/api/pedidos?populate=*&sort=fecha_pedido:desc');
        
        if (response.data?.data) {
            // Mostrar todos los pedidos para debug
            const allPedidos = response.data.data.map(item => ({
                id: item.id,
                ...item.attributes
            }));
            
            console.log('Todos los pedidos disponibles:', allPedidos);
            console.log('Campo email que buscamos:', this.userEmail);
            
            // También imprime los emails disponibles en los pedidos
            console.log('Emails en pedidos:', allPedidos.map(p => p.user_email || 'sin email'));
            
            // Filtrar por email si está disponible
            if (this.userEmail) {
                this.pedidos = allPedidos.filter(pedido => 
                    pedido.user_email === this.userEmail
                );
            } else {
                this.pedidos = [];
            }
            
            console.log('Pedidos filtrados en cliente:', this.pedidos.length);
        } else {
            this.pedidos = [];
            console.log('No se encontraron pedidos en la respuesta');
        }
    } catch (error) {
        console.error('Error al cargar pedidos:', error);
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
    .order-list {
        margin-top: 20px;
    }
    
    .order-item {
        border: 1px solid #ddd;
        padding: 15px;
        margin-bottom: 15px;
        border-radius: 5px;
    }
    
    .order-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 10px;
    }
    
    .order-header h4 {
        margin: 0;
    }
    
    .status {
        padding: 5px 10px;
        border-radius: 3px;
        font-weight: bold;
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
        margin: 5px 0;
    }
    
    .order-details ul {
        list-style-type: none;
        padding: 0;
    }
    
    .order-details ul li {
        margin: 5px 0;
    }
    
    .no-orders {
        text-align: center;
        padding: 20px;
        background-color: #f5f5f5;
        border-radius: 5px;
    }
    </style>