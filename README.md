# RedCoach Demo PFZ

Demo funcional para presentar Selfware en reuniones comerciales.

## Stack elegido

- React + Vite + TypeScript
- React Router (navegacion entre pantallas)
- TanStack Query (simulacion de datos asincronos)

## Objetivo de esta demo

Mostrar de forma simple:

- KPIs de negocio
- Flujos activos entre sistemas
- Estado de clientes y proximas acciones

Todo funciona con datos simulados para poder hacer demos sin depender de un backend real.

## Ejecutar local

```bash
npm install
npm run dev
```

Luego abre el link que aparece en consola (normalmente `http://localhost:5173`).

## Estructura inicial

- `src/App.tsx`: layout principal + rutas
- `src/demoData.ts`: datos mock y llamada asincrona simulada
- `src/index.css`: estilos base de la demo

## Siguiente iteracion recomendada

1. Reemplazar mocks con API real o mock server (MSW).
2. Agregar autenticacion demo (`admin` / `viewer`).
3. Crear flujo guiado para ventas (boton "Start live demo").
