<template lang="pug">
    section.offer-area.ptb-60
        .container
            .row
                .col-lg-4.col-md-6(v-for="category in categoria.data" :key="category.id")
                    .offer-box
                        img(:src="api_url + category.attributes.imagen.data.attributes.url" height="400" )
                        .category
                            h4 {{ category.attributes.nombre }}
                        .box-inner
                            .inner-content
                                h3 {{ category.attributes.descripcion }}
                                ul
                                    li(v-for="grupo in category.attributes.grupos_de_productos.data" :key="grupo.id")
                                        a(href='#') {{ grupo.attributes.nombre }}
</template>

<script>
import categoriasQuery from '@/apollo/queries/categorias/categorias.gql'
export default {
    name: "AreaOfertas",
    data() {
        return {
            categorias: {},
            api_url: process.env.strapiBaseUri
        }
    },
    apollo: {
        categoria: {
			prefetch: true,
			query: categoriasQuery
		}
    }
}
</script>