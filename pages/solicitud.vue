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
                            p(v-else) No hay pedidos registrados.
    </template>
    
    <script>
    export default {
        data() {
            return {
                pedidos: [],
                isLoading: true
            }
        },
        async created() {
            await this.cargarPedidos()
        },
        methods: {
            async cargarPedidos() {
                try {
                    this.isLoading = true
                    
                    // Obtener todos los pedidos sin filtrar por usuario
                    const response = await this.$axios.get('/api/pedidos', {
                        params: {
                            sort: 'fecha_pedido:desc',
                            populate: '*'
                        }
                    })
                    
                    console.log('Respuesta de Strapi:', response.data)
                    
                    // Extraer los datos según la estructura de Strapi
                    if (response.data && response.data.data) {
                        this.pedidos = response.data.data.map(item => {
                            // Combinar el ID y los atributos para una estructura más completa
                            return {
                                id: item.id,
                                ...item.attributes
                            }
                        })
                    } else {
                        console.warn('Estructura de respuesta inesperada:', response.data)
                        this.pedidos = []
                    }
                    
                    console.log('Pedidos procesados:', this.pedidos)
                } catch (error) {
                    console.error('Error al cargar los pedidos:', error)
                    this.pedidos = []
                } finally {
                    this.isLoading = false
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