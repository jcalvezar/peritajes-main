# Lion Cars

Proyecto de venta de autos con arquitectura de microservicios.

## Estructura

- **backend/**: API REST y WebSocket (Node.js + Express)
- **frontend/**: Aplicación web (Next.js)
- **app-mobile/**: Aplicación móvil (submódulo)
- **dockers/**: Configuración de contenedores

## Instalación

Al clonar el repositorio, ejecutar:

```bash
git submodule update --init --recursive
```

Esto descargará los submodules de backend, frontend y app-mobile.

## Configuración

Ver `AGENTS.md` para más detalles sobre variables de entorno y arquitectura.