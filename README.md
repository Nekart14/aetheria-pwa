# AETHERIA — Catálogo de Productos Modular

Sitio web multipágina de catálogo de equipamiento de audio y tecnología minimalista desarrollado con **HTML5, CSS3 modular y JavaScript Vanilla (ES6+)**, con precios en **Pesos Mexicanos (MXN)**.

## Estructura del Proyecto

```text
├── 404.html
├── carrito.html
├── catalogo.html
├── contacto.html
├── index.html
├── producto.html
├── README.md
├── css/
│   ├── base.css
│   ├── components.css
│   ├── pages.css
│   └── variables.css
├── data/
│   └── productos.json
├── img/
│   ├── p1.svg
│   ├── p2.svg
│   ├── p3.svg
│   ├── p4.svg
│   ├── p5.svg
│   ├── p6.svg
│   ├── p7.svg
│   └── p8.svg
└── js/
    ├── carrito.js
    ├── catalogo.js
    ├── contacto.js
    ├── inicio.js
    ├── main.js
    └── producto.js
```

## Funcionalidades Incluidas
- **Sistema de Cuentas y Roles**: Registro con nombre, teléfono, correo y contraseña como Comprador, además de la cuenta de Desarrollador pre-registrada (`hugo-saul@hotmail.com` / **Hugo Ayala**) para agregar, editar y eliminar artículos.
- **Catálogo con Filtros Dinámicos**: Búsqueda en tiempo real, categorías, ordenamiento, rango de precios en MXN y filtro de favoritos.
- **Flujo de Carrito y Checkout**: Al añadir un artículo redirige al carrito, ofrece volver a buscar más artículos y solicita dirección de envío con teléfono al pagar.
- **Contacto y Cotizaciones**: Formulario de contacto validado + apartado para cotizar productos específicos enviado directamente a `hugo-saul@hotmail.com`.