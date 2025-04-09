<template>
    <div>
        <!-- Start Page Title Area -->
        <div class="page-title-area">
            <div class="container">
                <ul>
                    <li><nuxt-link to="/">Inicio</nuxt-link></li>
                    <li>Carrito de compras</li>
                </ul>
            </div>
        </div>
        <!-- End Page Title Area -->

        <!-- Start Checkout Area -->
		<section class="checkout-area ptb-60">
            <div class="container">
                <div class="row">
                    <div class="col-lg-12 col-md-12">
                        <div class="user-actions">
                            <i class="fas fa-sign-in-alt"></i>
                            <span>Seguir comprando <nuxt-link to="/products">Click aqui</nuxt-link></span>
                        </div>
                    </div>
                </div>

                <form>
                    <div class="row">
                        <div class="col-lg-6 col-md-12">
                            <div class="billing-details">
                                <h3 class="title">Datos de Usuario</h3>

                                <div class="row">
                                    <div class="col-lg-12 col-md-6">
                                        <div class="form-group">
                                            <label>Fecha de entrega solicitada <span class="required">*</span></label>
                                            <input 
                                                type="date" 
                                                v-model="deliveryDate" 
                                                class="form-control" 
                                                :min="minDeliveryDate"
                                                required
                                            >
                                            <small class="form-text text-muted">Seleccione una fecha con al menos 2 días de anticipación</small>
                                        </div>
                                    </div>

                                    <div class="col-lg-12 col-md-6">
                                        <div class="form-group">
                                            <label>Hora de entrega solicitada <span class="required">*</span></label>
                                            <select v-model="deliveryTime" class="form-control" required>
                                                <option value="">Seleccione una hora</option>
                                                <option v-for="time in availableTimes" :value="time" :key="time">{{ time }}</option>
                                            </select>
                                            <small class="form-text text-muted">Horario de atención: 8:00 AM - 6:00 PM</small>
                                        </div>
                                    </div>

                                    <div class="col-lg-12 col-md-6">
                                        <div class="form-group">
                                            <label>Nombre de Usuario <span class="required">*</span></label>
                                            <input type="text" id="fullName" v-model="personDetails.fullName" class="form-control" readonly>
                                        </div>
                                    </div>

                                    <div class="col-lg-6 col-md-6">
                                        <div class="form-group">
                                            <label>Email del Usuario <span class="required">*</span></label>
                                            <input type="email" id="email" v-model="personDetails.email" class="form-control" readonly>
                                        </div>
                                    </div>

                                    <div class="col-lg-6 col-md-6">
                                        <div class="form-group">
                                            <label>Rol de Usuario <span class="required">*</span></label>
                                            <input type="text" id="role" v-model="personDetails.role" class="form-control" readonly>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <!-- Sección de método de pago con formularios específicos -->
                            <div class="payment-method mt-4">
                                <h3 class="title">Método de pago</h3>
                                
                                <div class="payment-options mb-4">
                                    <p>
                                        <input type="radio" id="direct-bank-transfer" name="payment-method" v-model="paymentMethod" value="bank-transfer" checked>
                                        <label for="direct-bank-transfer">Transferencia bancaria</label>
                                    </p>
                                    <p>
                                        <input type="radio" id="cash-on-delivery" name="payment-method" v-model="paymentMethod" value="qr-payment">
                                        <label for="cash-on-delivery">Pago por QR</label>
                                    </p>
                                </div>

                                <!-- Formulario para transferencia bancaria -->
                                <div v-if="paymentMethod === 'bank-transfer'" class="bank-transfer-details payment-details-section">
                                    <div class="bank-info mb-3">
                                        <h5>Datos bancarios para transferencia:</h5>
                                        <p><strong>Banco:</strong> Banco BCP</p>
                                        <p><strong>Titular de la cuenta:</strong> Jaquard Tex </p>
                                        <p><strong>Número de cuenta:</strong> 123-456789-01</p>
                                        <p><strong>Referencia:</strong> {{ referenceNumber }}</p>
                                    </div>

                                    <div class="form-group">
                                        <label for="transfer-receipt">Comprobante de pago <span class="required">*</span></label>
                                        <div class="custom-file">
                                            <input type="file" class="custom-file-input" id="transfer-receipt" @change="handleFileUpload" accept="image/*,.pdf">
                                            <label class="custom-file-label" for="transfer-receipt">{{ receiptFileName || 'Seleccionar archivo' }}</label>
                                        </div>
                                        <small class="form-text text-muted">Formatos aceptados: JPG, PNG, PDF. Máximo 5MB.</small>
                                    </div>
                                </div>

                                <!-- Formulario para pago por QR -->
                                <div v-if="paymentMethod === 'qr-payment'" class="qr-payment-details payment-details-section">
                                    <div class="text-center mb-3">
                                        <h5>Escanea este código QR para pagar:</h5>
                                        <div class="qr-code mt-3 mb-3">
                                            <img src="~/assets/img/QR.jpeg" alt="Código QR de pago" class="img-fluid">
                                        </div>
                                        <p>Una vez realizado el pago, sube tu comprobante</p>
                                    </div>
                                    
                                    <div class="form-group">
                                        <label for="qr-receipt">Comprobante de pago QR <span class="required">*</span></label>
                                        <div class="custom-file">
                                            <input type="file" class="custom-file-input" id="qr-receipt" @change="handleFileUpload" accept="image/*,.pdf">
                                            <label class="custom-file-label" for="qr-receipt">{{ receiptFileName || 'Seleccionar archivo' }}</label>
                                        </div>
                                        <small class="form-text text-muted">Formatos aceptados: JPG, PNG, PDF. Máximo 5MB.</small>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-lg-6 col-md-12">
                            <div class="order-details">
                                <h3 class="title">Tu Pedido Actual</h3>

                                <div class="order-table table-responsive">
                                    <table class="table table-bordered">
                                        <thead>
                                            <tr>
                                                <th scope="col">Nombre de Producto</th>
                                                <th scope="col">Total</th>
                                            </tr>
                                        </thead>

                                        <tbody>
                                            <tr v-for="(cart, i) in cart" :key="i">
                                                <td class="product-name">
                                                    <a href="#">{{cart.name}}</a>
                                                </td>

                                                <td class="product-total">
                                                    <span class="subtotal-amount">Bs.{{cart.price * cart.quantity}}</span>
                                                </td>
                                            </tr>
                                            
                                            <tr>
                                                <td class="order-subtotal">
                                                    <span>Subtotal de Pedido</span>
                                                </td>

                                                <td class="order-subtotal-price">
                                                    <span class="order-subtotal-amount">Bs.{{cartTotal}}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td class="order-shipping">
                                                    <span>Envio</span>
                                                </td>

                                                <td class="shipping-price">
                                                    <span>Bs. 0</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td class="total-price">
                                                    <span>Total a Pagar</span>
                                                </td>

                                                <td class="product-subtotal">
                                                    <span class="subtotal-amount">${{parseFloat(cartTotal + 10).toFixed(2)}}</span>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <div class="delivery-summary mb-3" v-if="deliveryDate && deliveryTime">
                                    <h5>Resumen de entrega:</h5>
                                    <p><strong>Fecha solicitada:</strong> {{ formatDeliveryDate(deliveryDate) }}</p>
                                    <p><strong>Hora solicitada:</strong> {{ deliveryTime }}</p>
                                </div>

                                <a href="javascript:void(0)" @click="add" class="btn btn-primary order-btn" :disabled="!isFormValid || isLoading">
                                    <span v-if="!isLoading">Realizar Pedido</span>
                                    <span v-else>
                                        <i class="fas fa-spinner fa-spin"></i> Procesando...
                                    </span>
                                </a>
                                <div v-if="!isFormValid" class="text-danger mt-2">
                                    <small>Por favor, complete todos los campos requeridos y suba un comprobante de pago.</small>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </section>
		<!-- End Checkout Area -->
    </div>
</template>

<script>
export default {
    data(){
        return{
            personDetails: {
                fullName: '', 
                email: '',
                role: 'Usuario',
                createdAt: new Date()
            },
            deliveryDate: '',
            deliveryTime: '',
            paymentMethod: 'bank-transfer',
            receiptFile: null,
            receiptFileName: '',
            referenceNumber: 'ORD-' + Math.floor(Math.random() * 1000000),
            isLoading: false
        }
    },
    computed: {
        cart(){
            return this.$store.getters.cart
        },
        cartTotal(){
            return this.$store.getters.totalAmount
        },
        isFormValid() {
            return this.receiptFile !== null && 
                   this.deliveryDate && 
                   this.deliveryTime;
        },
        minDeliveryDate() {
            // Fecha mínima es 2 días después de hoy
            const minDate = new Date();
            minDate.setDate(minDate.getDate() + 2);
            return minDate.toISOString().split('T')[0];
        },
        availableTimes() {
            // Generar horas disponibles cada 30 minutos desde las 8 AM hasta las 6 PM
            const times = [];
            for (let hour = 8; hour <= 18; hour++) {
                times.push(`${hour.toString().padStart(2, '0')}:00`);
                if (hour < 18) {
                    times.push(`${hour.toString().padStart(2, '0')}:30`);
                }
            }
            return times;
        }
    },
    created() {
        this.$nuxt.$on('user-logged-in', this.updateUserData);
        this.loadUserData();
    },
    beforeDestroy() {
        this.$nuxt.$off('user-logged-in', this.updateUserData);
    },
    methods: {
        formatDeliveryDate(dateString) {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(dateString).toLocaleDateString('es-ES', options);
        },
        loadUserData() {
            if (!process.client) return;

            try {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const userData = JSON.parse(storedUser);
                    this.updateUserData(userData);
                } else {
                    this.$router.push('/login');
                }
            } catch (error) {
                console.error('Error al cargar los datos del usuario:', error);
            }
        },
        updateUserData(userData) {
            if (userData) {
                this.personDetails.fullName = userData.username || '';
                this.personDetails.email = userData.email || '';
                this.assignUserRole(userData);
            }
        },
        assignUserRole(userData) {
            if (userData.tipo_usuario) {
                this.personDetails.role = userData.tipo_usuario;
            } else if (userData.role && typeof userData.role === 'object' && userData.role.name) {
                this.personDetails.role = userData.role.name;
            } else if (userData.role && typeof userData.role === 'string') {
                this.personDetails.role = userData.role;
            } else {
                this.personDetails.role = 'Usuario General';
            }
        },
        handleFileUpload(event) {
            const file = event.target.files[0];
            if (file) {
                if (file.size > 5 * 1024 * 1024) {
                    this.$toast.error('El archivo es demasiado grande. El tamaño máximo es 5MB.', {
                        icon: 'fas fa-exclamation-circle'
                    });
                    event.target.value = '';
                    this.receiptFile = null;
                    this.receiptFileName = '';
                    return;
                }
                
                const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
                if (!validTypes.includes(file.type)) {
                    this.$toast.error('Formato de archivo no válido. Use JPG, PNG o PDF.', {
                        icon: 'fas fa-exclamation-circle'
                    });
                    event.target.value = '';
                    this.receiptFile = null;
                    this.receiptFileName = '';
                    return;
                }
                
                this.receiptFile = file;
                this.receiptFileName = file.name;
            }
        },
        async add() {
            if (!this.isFormValid) return;

            this.isLoading = true;
            
            try {
                // 1. Subir comprobante
                const formData = new FormData();
                formData.append('files', this.receiptFile);
                const uploadResponse = await this.$axios.$post(
                    'http://127.0.0.1:1337/api/upload',
                    formData
                );

                // 2. Obtener datos del usuario
                const user = JSON.parse(localStorage.getItem('user'));
                if (!user || !user.id) throw new Error('Usuario no autenticado');

                // 3. Determinar el rol correctamente (actualizado)
                const userRole = user.role?.name || 
                                user.tipo_usuario || 
                                (user.role && typeof user.role === 'string' ? user.role : 'Usuario General');

                // 4. Preparar datos del pedido
const pedidoData = {
    data: {
        referencia: this.referenceNumber,
        fecha_pedido: new Date().toISOString(),
        fecha_entrega_solicitada: new Date(`${this.deliveryDate}T${this.deliveryTime}:00`).toISOString(),
        user: user.id, 
        user_email: user.email, 
        user_role: userRole, 
        productos: this.cart.map(item => ({
            nombre: item.name,
            precio: item.price,
            cantidad: item.quantity,
            talla: item.size || null,
            // Agregar estos campos nuevos
            en_oferta: item.onSale || false,
            precio_original: item.originalPrice || item.price,
            color: item.color || null
        })),
        metodo_pago: this.paymentMethod === 'bank-transfer' 
            ? 'transferencia_bancaria' 
            : 'pago_qr', 
        comprobante: uploadResponse[0].id,
        subtotal: this.cartTotal,
        costo_envio: 0,
        total: this.cartTotal,
        estado: 'pendiente'
    }
};

                // 5. Enviar pedido
                await this.$axios.$post('http://127.0.0.1:1337/api/pedidos', pedidoData);

                this.$toast.success(`Pedido #${this.referenceNumber} registrado`);
                this.$store.dispatch('cartEmpty');
                this.$router.push("/");

            } catch (error) {
                console.error('Error:', error);
                this.$toast.error(error.response?.data?.error?.message || 'Error al procesar pedido');
            } finally {
                this.isLoading = false;
            }
        }
    }
}
</script>

<style scoped>

input.form-control[readonly] {
    background-color: #f8f9fa;
    border-color: #e9ecef;
    cursor: not-allowed;
    opacity: 0.8;
}

/* Estilos para la sección de pagos */
.payment-details-section {
    border: 1px solid #e9ecef;
    border-radius: 5px;
    padding: 15px;
    margin-top: 15px;
    background-color: #f8f9fa;
}

.bank-info {
    background-color: #fff;
    border-left: 3px solid #007bff;
    padding: 10px;
    border-radius: 0 5px 5px 0;
}

.bank-info p {
    margin-bottom: 5px;
}

.qr-code {
    background-color: #fff;
    padding: 10px;
    border-radius: 5px;
    display: inline-block;
    border: 1px dashed #ccc;
}

.order-btn {
    width: 100%;
    margin-top: 15px;
    padding: 12px;
    font-weight: bold;
}

/* Estilos para la sección de métodos de pago */
.payment-options p {
    margin-bottom: 10px;
}

.payment-options input[type="radio"] {
    margin-right: 10px;
}

.payment-options label {
    font-weight: 500;
    cursor: pointer;
}

/* Estilos para la carga de archivos */
.custom-file-input:lang(es)~.custom-file-label::after {
    content: "Buscar";
}

.custom-file {
    margin-bottom: 10px;
}

/* Estilos para desactivar el botón */
.btn:disabled {
    cursor: not-allowed;
    opacity: 0.65;
}

/* Estilos para los campos de fecha y hora */
.form-group label {
    font-weight: 500;
    margin-bottom: 5px;
    display: block;
}

.form-control {
    border-radius: 4px;
    border: 1px solid #ced4da;
    padding: 10px 15px;
    transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out;
}

.form-control:focus {
    border-color: #80bdff;
    outline: 0;
    box-shadow: 0 0 0 0.2rem rgba(0, 123, 255, 0.25);
}

select.form-control {
    appearance: none;
    background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
    background-repeat: no-repeat;
    background-position: right 10px center;
    background-size: 1em;
}

.delivery-summary {
    background-color: #f8f9fa;
    border-radius: 5px;
    padding: 15px;
    margin-bottom: 15px;
    border-left: 3px solid #28a745;
}

.delivery-summary h5 {
    color: #28a745;
    margin-bottom: 10px;
}

.delivery-summary p {
    margin-bottom: 5px;
}

/* Spinner para el botón de carga */
.fa-spinner {
    margin-right: 5px;
}
</style>