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
                        .order-list
                            .order-item
                                .order-header
                                    h4 Pedido #12345
                                    span.status.en-proceso En Proceso
                                .order-details
                                    .row
                                        .col-lg-6.col-md-12
                                            p
                                                strong Fecha de Solicitud:
                                                |  2023-10-01
                                            p
                                                strong Fecha de Entrega:
                                                |  2023-10-10
                                        .col-lg-6.col-md-12
                                            p
                                                strong Productos:
                                                ul
                                                    li Camiseta - Talla: M - Cantidad: 2
                                                    li Pantalón - Talla: L - Cantidad: 1
                                    .row
                                        .col-lg-12.col-md-12
                                            p
                                                strong Observaciones:
                                                |  Por favor, entregar antes de la fecha indicada.
                            .order-item
                                .order-header
                                    h4 Pedido #67890
                                    span.status.entregado Entregado
                                .order-details
                                    .row
                                        .col-lg-6.col-md-12
                                            p
                                                strong Fecha de Solicitud:
                                                |  2023-09-25
                                            p
                                                strong Fecha de Entrega:
                                                |  2023-10-05
                                        .col-lg-6.col-md-12
                                            p
                                                strong Productos:
                                                ul
                                                    li Zapatos - Talla: 42 - Cantidad: 1
                                    .row
                                        .col-lg-12.col-md-12
                                            p
                                                strong Observaciones:
                                                |  Entregar en la recepción.
</template>

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

.status.en-proceso {
    background-color: #ffcc00;
    color: #000;
}

.status.entregado {
    background-color: #00cc66;
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
</style>