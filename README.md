# Evolv Real Estate - web

Web estática (HTML, CSS y JavaScript, sin instalar nada). Se publica tal cual en Cloudflare Pages.

## Qué hay dentro

- `index.html`, `comprar.html`, `alquilar.html`, `vender.html`, `visita.html`, `privacidad.html`, `propiedad.html` (ficha), `404.html`
- `data/propiedades.json`: todas las propiedades. Para añadir, cambiar o quitar una, se edita este archivo; las páginas se actualizan solas.
- `js/config.js`: configuración de los formularios (ver abajo).
- `css/styles.css`: colores y estilos (los colores están al principio del archivo).

## Pendiente antes de publicar

1. **Imágenes.** Ahora las fotos y el logo se cargan desde los servidores de Wix. Si cancelas Wix, dejarán de verse. Descárgalas del gestor de archivos de Wix, súbelas a una carpeta `img/` de este repositorio y cambia las direcciones en `data/propiedades.json` y en las páginas `.html`.
2. **Formularios.** Sin configurar nada, al enviar se abre el correo del visitante con el mensaje escrito. Para que lleguen directamente a tu correo:
   - Crea una cuenta gratuita en Formspree o Web3Forms y crea un formulario con tu email.
   - Pega la dirección que te dan en `formEndpoint` de `js/config.js` (y, en Web3Forms, tu clave en `formExtra`).
3. **Textos de propiedades.** En Wix las fichas tenían texto de plantilla, así que aquí muestran un texto genérico. Escribe la descripción real en el campo `descripcion` de cada propiedad.

## Publicar

1. **GitHub:** crea un repositorio nuevo (privado o público) y sube todos los archivos de esta carpeta (en la web de GitHub: Add file > Upload files).
2. **Cloudflare Pages:** en el panel de Cloudflare, crea un proyecto de Pages conectado a ese repositorio. Framework: ninguno. Comando de build: vacío. Carpeta de salida: la raíz (déjalo en blanco o pon `/`). A los pocos segundos tendrás la web en una dirección `.pages.dev`.
3. **Dominio de IONOS:** en el proyecto de Pages, pestaña de dominios personalizados, añade tu dominio y sigue las instrucciones. Lo más cómodo es añadir el dominio a Cloudflare y cambiar en IONOS los servidores de nombres (nameservers) a los que te indique Cloudflare. Si usas correo con ese dominio en IONOS, copia antes sus registros MX a Cloudflare.

Cada vez que subas un cambio a GitHub, Cloudflare vuelve a publicar la web.

## Probar en tu ordenador

Con Python instalado: abre una terminal en esta carpeta y ejecuta `python3 -m http.server 8000`, luego entra en http://localhost:8000
(Abrir los archivos con doble clic no carga las propiedades.)
