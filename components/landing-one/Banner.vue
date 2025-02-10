<template>
    <!-- Start Main Banner Area -->
    <div class="main-banner item-bg1">
        <div class="d-table">
            <div class="d-table-cell">
                <div class="container">
                    <div class="main-banner-content">
                        <span>Nueva colección 2024</span>
                        <h1>ropa hecha para ti!</h1>
                        <p>Encuentra los nuevos modelos para hombres, mujeres y niños</p>

                        <nuxt-link to="/products" class="btn btn-primary">Ropa para mujeres</nuxt-link>
                        <nuxt-link to="/products" class="btn btn-light">Ropa para varones</nuxt-link>
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