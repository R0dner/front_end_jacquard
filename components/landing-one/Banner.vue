<template>
    <!-- Start Main Banner Area -->
    <div class="main-banner item-bg1">
        <div class="d-table">
            <div class="d-table-cell">
                <div class="container">
                    <div class="main-banner-content white-color">
                        <span>Nueva colección 2024</span>
                        <h1>Estilo que define quién eres</h1>
                        <p>Descubre las últimas tendencias para todos los estilos y personalidades</p>
                        
                        <nuxt-link to="/products-women" class="btn btn-primary">Colección Mujer</nuxt-link>
                        <nuxt-link to="/products-men" class="btn btn-light">Colección Hombre</nuxt-link>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <!-- End Main Banner Area -->
</template>

<script>
export default {
    name: 'Banner',
}
</script>