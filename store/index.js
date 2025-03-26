// import axios from '@nuxtjs/axios';
const state = () => ( {
    cart: [],
    totalAmount: 0,
    totalQuantity: 0,
    orders: []
});

export const totals = (paylodArr) => {
    const totalAmount = paylodArr.map(cartArr => {
        return cartArr.price * cartArr.quantity
    }).reduce((a, b) => a + b, 0);

    const totalQuantity = paylodArr.map(cartArr => {
        return cartArr.quantity;
    }).reduce((a, b) => a + b, 0);

    return {
        amount: totalAmount.toFixed(2),
        qty: totalQuantity
    }
};
const mutations = {
    'GET_ORDER'(state, payload){
        state.orders = payload
    },
    'GET_CART'(state, payload){
        state.cart = payload
        state.totalAmount = totals(payload).amount
        state.totalQuantity = totals(payload).qty
    },
    'ADD_TO_CART'(state, payload){
        // Verificar si payload es un array (para mantener compatibilidad)
        const itemsToAdd = Array.isArray(payload) ? payload : [payload];
        
        // Buscar y actualizar items existentes o agregar nuevos
        itemsToAdd.forEach(newItem => {
            const existingIndex = state.cart.findIndex(item => 
                item.id === newItem.id && 
                item.size === newItem.size && 
                item.color === newItem.color
            );
            
            if (existingIndex >= 0) {
                // Actualizar cantidad si ya existe
                state.cart[existingIndex].quantity += newItem.quantity;
            } else {
                // Agregar nuevo item
                state.cart.push(newItem);
            }
        });
        
        // Actualizar totales
        state.totalAmount = totals(state.cart).amount;
        state.totalQuantity = totals(state.cart).qty;
    },
    'DELETE_CART'(state, id){
        const currentCartToDelete = state.cart
        const indexToDelete = currentCartToDelete.findIndex(cart => {
            return cart.id == id
        })

        state.cart = [...currentCartToDelete.slice(0, indexToDelete), ...currentCartToDelete.slice(indexToDelete + 1)]
        state.totalAmount = totals(state.cart).amount
        state.totalQuantity = totals(state.cart).qty
    },
    'UPDATE_CART'(state, payload){
        state.cart = payload

        state.totalAmount = totals(payload).amount
        state.totalQuantity = totals(payload).qty
    }, 
    'CART_EMPTY'(state){
        state.cart = []
        state.totalAmount = 0
        state.totalQuantity = 0
    }
};

const actions = {
    // getOrder({commit}){
    //     axios.get('c').then(res => {
    //         if(res.data == 'no data'){
    //             return []
    //         }
    //         commit('GET_ORDER', res.data)
    //     })
    // },

    addToCart({ commit }, product){
        commit('ADD_TO_CART', product)
    },

    deleteCart({ commit }, id){
        commit('DELETE_CART', id)
    },

    updateCart({ commit }, payload){
        // console.log(payload.unit)
        const currentCartToUpdate = payload.cart
        const indexToUpdate = currentCartToUpdate.findIndex(cart => {
            return cart.id == payload.id
        })

        const newCart = {
            ...currentCartToUpdate[indexToUpdate],
            quantity: currentCartToUpdate[indexToUpdate].quantity + payload.unit
        }

        // console.log(newCart)

        const cartUpdate = [...currentCartToUpdate.slice(0, indexToUpdate), newCart, ...currentCartToUpdate.slice(indexToUpdate + 1)]
        commit('UPDATE_CART', cartUpdate)
    }, 
    cartEmpty({commit}){
        commit('CART_EMPTY')
    }
};

const getters = {
    cart(state){
        return state.cart
    },
    totalAmount(state){
        return state.totalAmount
    },
    totalQuantity(state){
        return state.totalQuantity
    },
    getOrders(state){
        return state.orders
    }
};

export default{
    state, mutations, actions, getters
};