<template>
  <div v-if="isOpen" class="quickview">
    <div class="content">
      <!-- Info básica del producto -->
      <h2>{{ product.nombre }}</h2>
      <p>{{ product.descripcion }}</p>

      <!-- Selección de talla -->
      <div v-if="tallasDisponibles.length">
        <h3>Selecciona una talla:</h3>
        <select v-model="tallaSeleccionada">
          <option disabled value="">-- Selecciona talla --</option>
          <option v-for="t in tallasDisponibles" :key="t" :value="t">
            {{ t }}
          </option>
        </select>
      </div>

      <!-- Selección de color -->
      <div v-if="tallaSeleccionada && coloresFiltrados.length">
        <h3>Selecciona un color:</h3>
        <select v-model="colorSeleccionado">
          <option disabled value="">-- Selecciona color --</option>
          <option v-for="c in coloresFiltrados" :key="c" :value="c">
            {{ c }}
          </option>
        </select>
      </div>

      <!-- Mostrar precio y stock -->
      <div v-if="itemSeleccionado">
        <h3>Precio:</h3>
        <span v-if="itemSeleccionado.enOferta" class="oferta">
          ${{ itemSeleccionado.precio }}
          <small class="line-through">${{ itemSeleccionado.precioNormal }}</small>
        </span>
        <span v-else>
          ${{ itemSeleccionado.precioNormal }}
        </span>

        <p>Stock disponible: {{ itemSeleccionado.stock }}</p>
      </div>

      <!-- Botón cerrar -->
      <button @click="$emit('close')">Cerrar</button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    product: { type: Object, required: true },
    isOpen: { type: Boolean, default: false }
  },
  data() {
    return {
      inventarioDetalle: [], // todas las combinaciones color+talla
      tallaSeleccionada: "",
      colorSeleccionado: ""
    };
  },
  computed: {
    // Lista única de tallas disponibles
    tallasDisponibles() {
      const tallas = this.inventarioDetalle.map(i => i.talla);
      return [...new Set(tallas.filter(Boolean))]; // elimina duplicados y vacíos
    },
    // Colores filtrados según talla elegida
    coloresFiltrados() {
      return this.inventarioDetalle
        .filter(i => i.talla === this.tallaSeleccionada)
        .map(i => i.color)
        .filter((v, i, arr) => arr.indexOf(v) === i); // únicos
    },
    // Item final (combinación talla+color)
    itemSeleccionado() {
      return this.inventarioDetalle.find(
        i => i.talla === this.tallaSeleccionada && i.color === this.colorSeleccionado
      );
    }
  },
  methods: {
    async fetchInventarioDetalle() {
      try {
        const response = await this.$axios.get(`/api/inventario-colores`, {
          params: {
            'filters[producto][id][$eq]': this.product.id,
            'populate': 'color,talla'
          }
        });

        this.inventarioDetalle = response.data.data.map(item => {
          const inv = item.attributes;
          return {
            id: item.id,
            color: inv.color?.data?.attributes?.nombre || "Sin color",
            talla: inv.talla?.data?.attributes?.nombre || "Sin talla",
            stock: inv.stock_actual,
            precio: inv.en_oferta ? inv.precio_oferta : inv.precio_venta_sugerido,
            precioNormal: inv.precio_venta_sugerido,
            enOferta: inv.en_oferta
          };
        });
      } catch (error) {
        console.error("Error al obtener inventario por color/talla:", error);
      }
    }
  },
  watch: {
    isOpen(val) {
      if (val) {
        this.fetchInventarioDetalle();
        this.tallaSeleccionada = "";
        this.colorSeleccionado = "";
      }
    }
  }
};
</script>


<style lang="scss" scoped>
@import "../../assets/scss/styles/_transitions.scss";

.modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.7);
    z-index: 1040;
    backdrop-filter: blur(2px);
}

.modal.productQuickView {
    display: block;
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1050;
    overflow: hidden;
    outline: 0;
    padding: 20px;
    
    @media (max-width: 767.98px) {
        padding: 10px;
        overflow-y: auto;
    }
    
    .modal-dialog {
        max-width: 900px;
        margin: 2rem auto;
        transition: all 0.3s ease;
        
        @media (max-width: 991.98px) {
            max-width: 95%;
            margin: 1.5rem auto;
        }
        
        @media (max-width: 767.98px) {
            margin: 1rem auto;
        }
        
        @media (max-width: 575.98px) {
            max-width: 100%;
            margin: 0;
            min-height: 100vh;
            display: flex;
            align-items: center;
        }
        
        .modal-content {
            border: none;
            border-radius: 8px;
            overflow: hidden;
            box-shadow: 0 10px 50px rgba(0, 0, 0, 0.15);
            background-color: #fff;
            position: relative;
            
            @media (max-width: 575.98px) {
                border-radius: 0;
                min-height: 100vh;
                height: auto;
                padding-top: 50px; /* Añadir espacio para el botón superior */
                padding-bottom: 60px; /* Añadir espacio para el botón inferior */
            }
            
            /* Botón de cierre estándar (escritorio) */
            .close.desktop-close {
                position: absolute;
                right: 20px;
                top: 20px;
                z-index: 10;
                background: rgba(255, 255, 255, 0.8);
                border: none;
                width: 36px;
                height: 36px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 18px;
                color: #333;
                opacity: 0.8;
                transition: all 0.3s ease;
                box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
                
                @media (max-width: 767.98px) {
                    display: none; /* Ocultar en móvil, usaremos el nuevo botón */
                }
                
                &:hover {
                    opacity: 1;
                    background: #fff;
                    transform: rotate(90deg);
                }
            }
            
            /* Nuevo botón de cierre superior para móvil */
            .close-mobile {
                display: none;
                position: absolute;
                top: 0;
                left: 0;
                right: 0;
                height: 50px;
                background-color: #4a89dc;
                color: #fff;
                border: none;
                z-index: 15;
                padding: 0;
                text-align: center;
                font-weight: 600;
                font-size: 16px;
                align-items: center;
                justify-content: center;
                width: 100%;
                
                @media (max-width: 767.98px) {
                    display: flex;
                }
                
                .close-text {
                    margin-left: 8px;
                }
                
                i {
                    font-size: 16px;
                }
                
                &:active {
                    background-color: #3a70c2;
                }
            }
            
            /* Botón de cierre inferior para móvil */
            .bottom-close-mobile {
                display: none;
                position: absolute;
                bottom: 0;
                left: 0;
                right: 0;
                height: 60px;
                background-color: #f8f9fa;
                border-top: 1px solid #e0e0e0;
                color: #555;
                font-weight: 600;
                align-items: center;
                justify-content: center;
                width: 100%;
                font-size: 15px;
                padding: 0;
                border-left: none;
                border-right: none;
                border-bottom: none;
                
                @media (max-width: 767.98px) {
                    display: flex;
                }
                
                i {
                    margin-right: 8px;
                    color: #4a89dc;
                }
                
                &:active {
                    background-color: #e9ecef;
                }
            }
            
            .row {
                margin: 0;
                
                @media (max-width: 767.98px) {
                    flex-direction: column;
                }
                
                > div {
                    padding: 30px;
                    
                    @media (max-width: 991.98px) {
                        padding: 25px;
                    }
                    
                    @media (max-width: 767.98px) {
                        padding: 20px;
                    }
                    
                    @media (max-width: 575.98px) {
                        padding: 15px;
                    }
                }
            }
        }
    }
}

.productQuickView-image {
    text-align: center;
    padding: 15px;
    background: #f9f9f9;
    border-radius: 6px;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    
    @media (max-width: 767.98px) {
        margin-bottom: 0;
        height: auto;
        min-height: 250px;
        max-height: 300px;
        border-radius: 6px 6px 0 0;
    }
    
    @media (max-width: 575.98px) {
        min-height: 200px;
        max-height: 250px;
        padding: 10px;
    }
    
    img {
        max-width: 100%;
        max-height: 400px;
        height: auto;
        object-fit: contain;
        border-radius: 4px;
        mix-blend-mode: multiply;
        
        @media (max-width: 991.98px) {
            max-height: 350px;
        }
        
        @media (max-width: 767.98px) {
            max-height: 280px;
        }
        
        @media (max-width: 575.98px) {
            max-height: 230px;
        }
    }
}

.product-content {
    display: flex;
    flex-direction: column;
    height: 100%;
    
    @media (max-width: 767.98px) {
        padding-top: 15px;
    }
    
    h3 {
        font-size: 24px;
        margin-bottom: 12px;
        color: #333;
        font-weight: 600;
        line-height: 1.3;
        
        @media (max-width: 991.98px) {
            font-size: 22px;
        }
        
        @media (max-width: 767.98px) {
            font-size: 20px;
            margin-bottom: 10px;
        }
        
        @media (max-width: 575.98px) {
            font-size: 18px;
        }
        
        a {
            color: inherit;
            text-decoration: none;
            transition: color 0.2s;
            
            &:hover {
                color: #4a89dc;
            }
        }
    }
    
    .price {
        margin-bottom: 18px;
        font-size: 20px;
        font-weight: 700;
        display: flex;
        align-items: center;
        gap: 12px;
        
        @media (max-width: 767.98px) {
            font-size: 18px;
            margin-bottom: 15px;
            gap: 10px;
        }
        
        @media (max-width: 575.98px) {
            font-size: 16px;
            margin-bottom: 12px;
        }
        
        .old-price {
            text-decoration: line-through;
            color: #999;
            font-size: 18px;
            font-weight: 500;
            
            @media (max-width: 767.98px) {
                font-size: 16px;
            }
            
            @media (max-width: 575.98px) {
                font-size: 14px;
            }
        }
        
        .new-price {
            color: #e74c3c;
        }
    }
    
    .product-review {
        display: flex;
        align-items: center;
        margin-bottom: 18px;
        
        @media (max-width: 767.98px) {
            margin-bottom: 15px;
        }
        
        @media (max-width: 575.98px) {
            margin-bottom: 12px;
        }
        
        .rating {
            color: #ffc107;
            margin-right: 10px;
            font-size: 15px;
            
            @media (max-width: 575.98px) {
                font-size: 14px;
            }
        }
        
        .rating-count {
            color: #7f8c8d;
            font-size: 14px;
            text-decoration: none;
            transition: color 0.2s;
            
            @media (max-width: 575.98px) {
                font-size: 13px;
            }
            
            &:hover {
                color: #4a89dc;
            }
        }
    }
    
    .product-info {
        list-style: none;
        padding: 0;
        margin-bottom: 25px;
        border-top: 1px solid #f0f0f0;
        padding-top: 15px;
        
        @media (max-width: 767.98px) {
            margin-bottom: 20px;
            padding-top: 12px;
        }
        
        @media (max-width: 575.98px) {
            margin-bottom: 15px;
            padding-top: 10px;
        }
        
        li {
            margin-bottom: 10px;
            font-size: 14px;
            display: flex;
            
            @media (max-width: 575.98px) {
                font-size: 13px;
                margin-bottom: 8px;
                flex-direction: column;
            }
            
            span {
                font-weight: 600;
                color: #555;
                margin-right: 8px;
                min-width: 120px;
                
                @media (max-width: 767.98px) {
                    min-width: 100px;
                }
                
                @media (max-width: 575.98px) {
                    min-width: auto;
                    margin-bottom: 2px;
                }
            }
            
            a {
                color: #7f8c8d;
                transition: color 0.2s;
                
                &:hover {
                    color: #4a89dc;
                    text-decoration: none;
                }
            }
        }
    }
}

.product-color-switch {
    margin-bottom: 25px;
    
    @media (max-width: 767.98px) {
        margin-bottom: 20px;
    }
    
    @media (max-width: 575.98px) {
        margin-bottom: 15px;
    }
    
    h4 {
        margin-bottom: 12px;
        font-size: 16px;
        font-weight: 600;
        color: #555;
        
        @media (max-width: 575.98px) {
            font-size: 15px;
            margin-bottom: 10px;
        }
    }
    
    ul {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        margin: 0;
        padding: 0;
        list-style: none;
        
        @media (max-width: 575.98px) {
            gap: 8px;
        }
        
        li {
            margin: 0;
            cursor: pointer;
            position: relative;
            
            .color-circle {
                display: block;
                width: 32px;
                height: 32px;
                border-radius: 50%;
                border: 2px solid #f0f0f0;
                transition: all 0.3s ease;
                box-shadow: 0 2px 3px rgba(0, 0, 0, 0.1);
                
                @media (max-width: 575.98px) {
                    width: 28px;
                    height: 28px;
                }
                
                &:hover {
                    transform: scale(1.1);
                    box-shadow: 0 3px 6px rgba(0, 0, 0, 0.15);
                }
            }
            
            &.active .color-circle {
                box-shadow: 0 0 0 2px #fff, 0 0 0 4px #4a89dc;
            }
            
            &::after {
                content: attr(title);
                position: absolute;
                bottom: -25px;
                left: 50%;
                transform: translateX(-50%);
                background: #333;
                color: #fff;
                padding: 3px 8px;
                border-radius: 4px;
                font-size: 11px;
                opacity: 0;
                transition: opacity 0.2s;
                pointer-events: none;
                white-space: nowrap;
                z-index: 10;
                
                @media (max-width: 575.98px) {
                    font-size: 10px;
                    padding: 2px 6px;
                }
            }
            
            &:hover::after {
                opacity: 1;
            }
        }
    }
    
    .no-colors {
        font-style: italic;
        color: #95a5a6;
        margin: 0;
        font-size: 14px;
        
        @media (max-width: 575.98px) {
            font-size: 13px;
        }
    }
}

.product-size-wrapper {
    margin-bottom: 25px;
    
    @media (max-width: 767.98px) {
        margin-bottom: 20px;
    }
    
    @media (max-width: 575.98px) {
        margin-bottom: 15px;
    }
    
    h4 {
        margin-bottom: 12px;
        font-size: 16px;
        font-weight: 600;
        color: #555;
        
        @media (max-width: 575.98px) {
            font-size: 15px;
            margin-bottom: 10px;
        }
    }
    
    ul {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;
        margin: 0;
        padding: 0;
        list-style: none;
        
        @media (max-width: 575.98px) {
            gap: 6px;
        }
        
        li {
            margin: 0;
            
            a {
                display: block;
                padding: 8px 15px;
                border: 1px solid #e0e0e0;
                border-radius: 4px;
                color: #555;
                text-decoration: none;
                transition: all 0.3s;
                font-size: 13px;
                font-weight: 500;
                min-width: 40px;
                text-align: center;
                
                @media (max-width: 767.98px) {
                    padding: 7px 12px;
                    min-width: 36px;
                }
                
                @media (max-width: 575.98px) {
                    padding: 6px 10px;
                    font-size: 12px;
                    min-width: 32px;
                }
                
                &:hover {
                    border-color: #bdc3c7;
                    background: #f8f9fa;
                }
            }
            
            &.active a {
                background-color: #4a89dc;
                color: #fff;
                border-color: #4a89dc;
            }
        }
    }
}

/* Estilos para productos agotados */
.text-danger {
    color: #dc3545 !important;
}

.font-weight-bold {
    font-weight: 700 !important;
}

.input-counter.disabled {
    opacity: 0.5;
    pointer-events: none;
}

.input-counter span.disabled {
    cursor: not-allowed;
    opacity: 0.5;
}

.btn-secondary {
    background-color: #6c757d;
    border-color: #6c757d;
    color: #fff;
    
    &:hover:not(:disabled) {
        background-color: #5a6268;
        border-color: #545b62;
    }
    
    &:disabled {
        opacity: 0.65;
        cursor: not-allowed;
    }
}

.product-add-to-cart {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 25px;
    flex-wrap: wrap;
    
    @media (max-width: 767.98px) {
        gap: 12px;
        margin-bottom: 20px;
    }
    
    @media (max-width: 575.98px) {
        flex-direction: column;
        align-items: stretch;
        gap: 10px;
        margin-bottom: 15px;
    }
    
    .input-counter {
        display: flex;
        align-items: center;
        border: 1px solid #e0e0e0;
        border-radius: 4px;
        padding: 0;
        font-size: 16px;
        overflow: hidden;
        background: #f8f9fa;
        
        @media (max-width: 767.98px) {
            width: 100%;
        }
        
        span {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            cursor: pointer;
            color: #555;
            transition: all 0.2s;
            user-select: none;
            
            @media (max-width: 767.98px) {
                width: 32px;
                height: 32px;
            }
            
            @media (max-width: 575.98px) {
                width: 30px;
                height: 30px;
            }
            
            &:hover {
                background-color: #f0f0f0;
            }
            
            &:active {
                background-color: #e0e0e0;
            }
        }
    }
    
    .btn {
        padding: 12px 20px;
        border-radius: 4px;
        font-weight: 600;
        font-size: 14px;
        flex-grow: 1;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        transition: all 0.3s ease;
        
        @media (max-width: 767.98px) {
            padding: 10px 16px;
        }
        
        @media (max-width: 575.98px) {
            width: 100%;
            padding: 12px;
        }
        
        &:disabled {
            opacity: 0.6;
            cursor: not-allowed;
        }
        
        &.btn-primary {
            background-color: #4a89dc;
            border-color: #4a89dc;
            color: #fff;
            
            &:hover:not(:disabled) {
                background-color: #3a70c2;
                border-color: #3a70c2;
            }
            
            &:active:not(:disabled) {
                background-color: #2a5ca8;
                border-color: #2a5ca8;
            }
        }
    }
}

.view-full-info {
    display: inline-block;
    margin-top: auto;
    font-size: 14px;
    color: #4a89dc;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.2s;
    
    @media (max-width: 575.98px) {
        font-size: 13px;
        text-align: center;
        display: block;
    }
    
    &:hover {
        color: #2a5ca8;
        text-decoration: underline;
    }
}
</style>