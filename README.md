# Lion Cars

Proyecto de venta de autos con arquitectura de microservicios.

## Estructura

- **backend/**: API REST y WebSocket (Node.js + Express)
- **frontend/**: Aplicación web (Next.js)
- **app-mobile/**: Aplicación móvil (submódulo)
- **dockers/**: Configuración de contenedores

## Módulos del Sistema

El sistema cuenta con 3 módulos independientes que se pagan por separado:

1. **Parkings**: Gestión de depósitos de vehículos y vehículos en cada depósito
2. **Reservations**: Gestión de reservas de vehículos (clientes manifiestan qué vehículo quieren pero aún no está disponible)
3. **Inspections**: Gestión de inspecciones de vehículos usados (motor, pintura, neumáticos, interior, etc.)

Cada concesionaria puede subscribirse a los módulos que requiera.

## Sistema de Roles

- **Owner**: El usuario que creó la concesionaria. Puede crear roles personalizados con permisos específicos y administrar usuarios.
- **Administrator**: Creado por el Owner. Acceso completo a los módulos suscritos (excepto modificar al Owner o crear roles).
- **Usuario Regular**: Creado por Administrators. Acceso limitado según los permisos del rol asignado.

## Instalación

Al clonar el repositorio, ejecutar:

```bash
git submodule update --init --recursive
```

Esto descargará los submodules de backend, frontend y app-mobile.

## Configuración

Ver `AGENTS.md` para más detalles sobre variables de entorno y arquitectura.