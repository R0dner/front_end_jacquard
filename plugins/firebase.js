import firebase from "firebase/app";
import 'firebase/storage'; // Importa el módulo de Storage
import 'firebase/firestore'; // Importa el módulo de Firestore (si lo necesitas)

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAblu1pYjdlWwdnpvslBtff06TENGgO6Vk",
    authDomain: "peakn-cbb73.firebaseapp.com",
    databaseURL: "https://peakn-cbb73.firebaseio.com",
    projectId: "peakn-cbb73",
    storageBucket: "peakn-cbb73.appspot.com",
    messagingSenderId: "4760252855",
    appId: "1:4760252855:web:fe810a1581f5b677a17832"
};

// Inicializa Firebase solo si no está ya inicializado
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Exporta Firebase para usarlo en otros archivos
export default firebase;

// Si necesitas Firestore, puedes exportarlo así:
export const db = firebase.firestore();
export const dbOrderRef = db.collection('order');