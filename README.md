# 📝 Mis Notas — Firebase (Auth + Firestore)

Aplicación web sencilla para crear, editar, completar y eliminar **notas/tareas personales** con autenticación por **correo/contraseña** usando **Firebase Authentication** y almacenamiento en **Cloud Firestore**.

> Demo local: abre `index.html` (usa CDN de Firebase).
> Producción: puede publicarse en **Firebase Hosting** u otro hosting estático.

---

# ⚒️ Integrantes

* Juan David Muñoz
* Sebastian Perez

---

## ✨ Funcionalidades

* Registro e inicio de sesión con **email/contraseña**.
* CRUD de notas/tareas por usuario:

  * crear, editar, completar/pendiente, eliminar.
* Sincronización **en tiempo real** con Firestore.
* Mensajes de estado/errores y validaciones básicas.
* UI mínima y responsive.

---

## 🧱 Stack

* **Frontend:** HTML, CSS, JavaScript (Vanilla).
* **Firebase (SDK compat 10.7.0):**

  * Authentication (email/password).
  * Cloud Firestore.
* **Hosting:** cualquiera para sitios estáticos (recomendado Firebase Hosting).

---

## 📁 Estructura de datos (Firestore)

Para cada usuario autenticado se guarda:

```
usuarios/{uid}  (doc)
{
  nombre: string,         // correo antes del @
  email: string,
  rol: 'Estudiante'
}

usuarios/{uid}/tareas  (subcolección)
  {autoId}  (doc)
  {
    titulo: string,
    contenido: string,
    estado: 'pendiente' | 'completada',
    fechaCreacion: Timestamp,
    fechaModificacion: Timestamp
  }
```

---

## 🔐 Reglas de seguridad (Firestore)

> **Importante:** en producción, restringe al usuario dueño de los datos.
> Reglas usadas actualmente (todas las lecturas/escrituras requieren login):

```rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Perfil del usuario
    match /usuarios/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;

      // Subcolección de tareas del usuario autenticado
      match /tareas/{tareaId} {
        allow read, write: if request.auth != null && request.auth.uid == userId;
      }
    }
  }
}
```

---

## ⚙️ Configuración de Firebase

El proyecto usa CDN **compat** de Firebase. El objeto de configuración (ya incluido en `script.js`) es:

```js
const firebaseConfig = {
  apiKey: "AIzaSyDnj6j9d75BJ0hXCSw5wkkUI31SyYZHTg8",
  authDomain: "mis-notas-e79f7.firebaseapp.com",
  projectId: "mis-notas-e79f7",
  storageBucket: "mis-notas-e79f7.firebasestorage.app",
  messagingSenderId: "373191322131",
  appId: "1:373191322131:web:ed903ad5e4d934b630ade6",
  measurementId: "G-JXVZJCEBPM"
};
```

---

## 🔑 Autenticación (con capturas)


**Usuarios creados (panel de Authentication → Usuarios):**
![Usuarios](docs/auth-users.png)

**Proveedor activado (Authentication → Método de acceso):**
![Método de acceso](docs/auth-provider.png)

---

## 🖥️ Estructura de la app

```
/ (raíz)
├─ index.html        // Maquetado básico
├─ styles.css        // Estilos
├─ script.js         // Lógica de auth + Firestore + UI
└─ docs/
   ├─ auth-users.png
   └─ auth-provider.png
```

### HTML principal (`index.html`)

* Secciones:

  * **auth-section**: formulario de login/registro.
  * **user-info**: email + botón de cerrar sesión.
  * **notes-section**: formulario y grid de notas.
* SDKs de Firebase **compat** por CDN.

### Lógica (`script.js`)

* **Auth:**

  * `loginUser()`, `registerUser()`, `logoutUser()`.
  * `auth.onAuthStateChanged(...)` para mostrar/ocultar secciones.
  * Manejo de errores comunes (`auth/wrong-password`, `auth/email-already-in-use`, etc.).
* **Usuarios:**

  * `createUserDocument(user)` crea `usuarios/{uid}` si no existe.
* **Notas/Tareas:**

  * `addNote()`, `editNote(id, ...)`, `deleteNote(id)`, `toggleTaskStatus(id, estado)`.
  * `loadUserNotes()` suscribe a cambios en tiempo real (`onSnapshot`) ordenando por `fechaCreacion desc`.
* **Utilidades:**

  * `showAlert(message, type)`, `formatDate(timestamp)`, `escapeHtml(str)`, `isValidEmail(email)`.

---

## 📹 Video explicativo


[▶️ Ver video:](https://youtu.be/EoJHr9551Ic)

