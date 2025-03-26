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
                                        <p><strong>Banco:</strong> Banco Nacional</p>
                                        <p><strong>Titular de la cuenta:</strong> Empresa XYZ S.A.</p>
                                        <p><strong>Número de cuenta:</strong> 123-456789-01</p>
                                        <p><strong>CLABE:</strong> 012345678901234567</p>
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
                                                    <span class="subtotal-amount">${{cart.price * cart.quantity}}</span>
                                                </td>
                                            </tr>
                                            
                                            <tr>
                                                <td class="order-subtotal">
                                                    <span>Subtotal de Pedido</span>
                                                </td>

                                                <td class="order-subtotal-price">
                                                    <span class="order-subtotal-amount">${{cartTotal}}</span>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td class="order-shipping">
                                                    <span>Envio</span>
                                                </td>

                                                <td class="shipping-price">
                                                    <span>$0</span>
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

                                <a href="javascript:void(0)" @click="add" class="btn btn-primary order-btn" :disabled="!isFormValid">Realizar Pedido</a>
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
import firebase from '../../plugins/firebase';
export default {
    data(){
        return{
            personDetails: {
                fullName: '', 
                email: '',
                role: 'Usuario', // Valor por defecto
                createdAt: new Date()
            },
            paymentMethod: 'bank-transfer', // Valor por defecto: transferencia bancaria
            receiptFile: null, // Archivo de comprobante
            receiptFileName: '', // Nombre del archivo seleccionado
            referenceNumber: 'ORD-' + Math.floor(Math.random() * 1000000) // Número de referencia para el pago
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
            // Verificar si se ha subido un comprobante de pago
            return this.receiptFile !== null;
        }
    },
    created() {
        // Escuchar el evento de login para actualizar los datos
        this.$nuxt.$on('user-logged-in', this.updateUserData);
        
        // Cargar los datos del usuario al iniciar el componente
        this.loadUserData();
    },
    beforeDestroy() {
        // Quitar el listener al destruir el componente
        this.$nuxt.$off('user-logged-in', this.updateUserData);
    },
    methods: {
        loadUserData() {
            if (!process.client) return; // Solo ejecutar en el cliente

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
                // Actualizar los datos del formulario con los datos del usuario
                this.personDetails.fullName = userData.username || '';
                this.personDetails.email = userData.email || '';
                
                // Determinar y asignar el rol del usuario
                this.assignUserRole(userData);
                
                console.log('Datos de usuario cargados:', this.personDetails);
            }
        },
        assignUserRole(userData) {
            // Verificar las diferentes posibilidades de estructura del rol
            if (userData.tipo_usuario) {
                // Si existe el campo tipo_usuario, usarlo directamente
                this.personDetails.role = userData.tipo_usuario;
            } else if (userData.role && typeof userData.role === 'object' && userData.role.name) {
                // Compatibilidad con el formato anterior si existe
                this.personDetails.role = userData.role.name;
            } else if (userData.role && typeof userData.role === 'string') {
                // Compatibilidad con el formato anterior si existe
                this.personDetails.role = userData.role;
            } else {
                // Si no tiene un rol definido
                this.personDetails.role = 'Usuario General';
            }
            
            // Registrar en consola para depuración
            console.log('Tipo de usuario asignado:', this.personDetails.role);
        },
        handleFileUpload(event) {
            const file = event.target.files[0];
            if (file) {
                // Validar tamaño del archivo (máximo 5MB)
                if (file.size > 5 * 1024 * 1024) {
                    this.$toast.error('El archivo es demasiado grande. El tamaño máximo es 5MB.', {
                        icon: 'fas fa-exclamation-circle'
                    });
                    event.target.value = ''; // Limpiar el input file
                    this.receiptFile = null;
                    this.receiptFileName = '';
                    return;
                }
                
                // Validar tipo de archivo
                const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
                if (!validTypes.includes(file.type)) {
                    this.$toast.error('Formato de archivo no válido. Use JPG, PNG o PDF.', {
                        icon: 'fas fa-exclamation-circle'
                    });
                    event.target.value = ''; // Limpiar el input file
                    this.receiptFile = null;
                    this.receiptFileName = '';
                    return;
                }
                
                // Guardar el archivo y su nombre
                this.receiptFile = file;
                this.receiptFileName = file.name;
            }
        },
        async add() {
            if (!this.isFormValid) {
                this.$toast.error('Por favor, complete todos los campos requeridos y suba un comprobante de pago.', {
                    icon: 'fas fa-exclamation-circle'
                });
                return;
            }
            
            try {
                // Subir el comprobante a Firebase Storage
                const storageRef = firebase.storage().ref();
                const fileRef = storageRef.child(`receipts/${Date.now()}_${this.receiptFileName}`);
                
                // Subir el archivo
                await fileRef.put(this.receiptFile);
                
                // Obtener la URL del archivo
                const downloadURL = await fileRef.getDownloadURL();
                
                // Preparar los datos del pedido
                const cartData = {
                    details: this.personDetails,
                    items: this.cart,
                    payment: {
                        method: this.paymentMethod,
                        receiptURL: downloadURL,
                        referenceNumber: this.referenceNumber,
                        timestamp: new Date()
                    }
                }
                
                // Guardar en Firestore
                const db = firebase.firestore();
                const dbOrderRef = db.collection('orders');
                await dbOrderRef.add(cartData);
                
                // Mostrar confirmación
                this.$toast.success(`Gracias por tu pedido. Hemos recibido tu comprobante de pago.`, {
                    icon: 'fas fa-cart-plus'
                });
                
                // Vaciar carrito y redirigir
                this.$store.dispatch('cartEmpty')
                this.$router.push("/");
                
            } catch (error) {
                console.error('Error al procesar el pedido:', error);
                this.$toast.error(`Ha ocurrido un error al procesar tu pedido. Por favor, intenta nuevamente.`, {
                    icon: 'fas fa-exclamation-circle'
                });
            }
        }
    }
}
</script>

<style scoped>
/* Estilo para los campos de solo lectura */
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
</style>