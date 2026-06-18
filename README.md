# Fleet Telemetry Simulator

Simulador de telemetría GPS desarrollado en Node.js para enviar coordenadas de vehículos al backend del sistema **Fleet Telemetry System**.

Este proyecto corresponde al módulo de simulación solicitado en la prueba técnica y permite generar tráfico GPS realista para probar el cálculo de estados, el historial de posiciones, los eventos y las métricas del backend.

---

# Descripción General

El simulador envía datos GPS automáticamente al endpoint:

```http
POST /gps
```

Cada vehículo reporta su posición cada 3 a 5 segundos, simulando distintos comportamientos dentro de una flota:

* Vehículos en movimiento.
* Vehículos detenidos.
* Vehículos que dejan de reportar señal.
* Requests válidos.
* Requests inválidos para probar validaciones del backend.

---

# Tecnologías Utilizadas

* Node.js
* JavaScript
* Axios

---

# Cumplimiento de Requisitos

| Requisito                                        | Estado |
| ------------------------------------------------ | ------ |
| Mínimo 3 vehículos simultáneos                   | ✅      |
| Envío cada 3 a 5 segundos                        | ✅      |
| Al menos 1 vehículo detenido por más de 1 minuto | ✅      |
| Inyección aproximada de 10% de errores           | ✅      |
| Coordenadas dentro del rango sugerido de Bogotá  | ✅      |
| Script independiente del backend                 | ✅      |

---

# Configuración de la Simulación

El simulador genera un total de 20 vehículos.

| Tipo de vehículo | Cantidad | Comportamiento                           |
| ---------------- | -------- | ---------------------------------------- |
| En movimiento    | 12       | Cambian coordenadas en cada envío        |
| Detenidos        | 5        | Mantienen la misma coordenada            |
| Sin señal        | 3        | Dejan de reportar después de 30 segundos |
| Total            | 20       | Simulación completa de flota             |

---

# Lógica de Funcionamiento

## Vehículos en Movimiento

Los vehículos en movimiento modifican su latitud y longitud con un delta aleatorio pequeño en cada iteración.

Esto permite que el backend los clasifique como:

```text
EN_MOVIMIENTO
```

---

## Vehículos Detenidos

Los vehículos detenidos mantienen la misma latitud y longitud.

Esto permite que el backend detecte que no hubo cambio de posición y, después del tiempo definido por la lógica de negocio, los clasifique como:

```text
DETENIDO
```

---

## Vehículos Sin Señal

Los vehículos configurados como sin señal reportan durante los primeros segundos de ejecución y luego dejan de enviar datos.

Esto permite que el backend los clasifique como:

```text
SIN_SENAL
```

cuando supera el tiempo máximo sin transmisión.

---

# Inyección de Errores

El simulador envía aproximadamente un 10% de requests inválidos.

Los errores simulados incluyen:

* Payload vacío.
* vehicle_id vacío.
* Coordenadas faltantes.
* Latitud fuera de rango.
* Longitud fuera de rango.

Esto permite validar que el backend responda correctamente con errores HTTP 400 ante datos inválidos.

---

# Coordenadas Simuladas

Las coordenadas generadas se encuentran dentro del rango sugerido para Bogotá:

```text
Latitud: 4.60 a 4.75
Longitud: -74.20 a -73.95
```

---

# Endpoint Consumido

El simulador consume el siguiente endpoint del backend:

```http
POST http://localhost:8082/gps
```

Payload válido enviado:

```json
{
  "vehicle_id": "VH-001",
  "lat": 4.7110,
  "lng": -74.0721,
  "timestamp": "2026-06-17T10:00:00Z"
}
```

---

# Requisitos Previos

Antes de ejecutar el simulador, el backend debe estar corriendo en:

```text
http://localhost:8082
```

Puedes validar el backend con:

```bash
curl http://localhost:8082/vehicles
```

---

# Instalación

Clonar el repositorio:

```bash
git clone https://github.com/dabbi20/fleet-telemetry-simulator.git
```

Entrar al proyecto:

```bash
cd fleet-telemetry-simulator
```

Instalar dependencias:

```bash
npm install
```

---

# Ejecución Rápida

Ejecutar simulador:

```bash
npm start
```

o directamente:

```bash
node simulator.js
```

---

# Resultado Esperado

Al ejecutar el simulador se muestra una salida similar:

```text
===================================
🚀 Fleet Telemetry Simulator
===================================
📡 Backend: http://localhost:8082/gps
🚗 Vehículos totales: 20
🟢 Movimiento: 12
🟡 Detenidos: 5
🔴 Sin señal: 3
⚠️ Requests inválidos: 10%
===================================
[201] VH-001 -> EN_MOVIMIENTO
[201] VH-002 -> EN_MOVIMIENTO
[400] Payload inválido enviado por VH-003
🚫 VH-018 dejó de reportar datos
```

---

# Validación con Backend

Después de ejecutar el simulador, se pueden consultar los datos desde el backend.

## Vehículos

```bash
curl http://localhost:8082/vehicles
```

## Eventos

```bash
curl http://localhost:8082/events
```

## Métricas

```bash
curl http://localhost:8082/metrics
```

Respuesta esperada en métricas:

```json
{
  "totalVehicles": 20,
  "movingVehicles": 12,
  "stoppedVehicles": 5,
  "noSignalVehicles": 3
}
```

---

# Decisión Técnica sobre Docker

Este simulador se mantiene como un script Node.js independiente sin Docker obligatorio.

La razón principal es que su ejecución es simple y directa:

```bash
npm install
npm start
```

Dockerizar este componente agregaría una complejidad adicional relacionada con redes y resolución de `localhost` dentro de contenedores, sin aportar un beneficio significativo para el alcance de este script.

En cambio, se priorizó dockerizar el backend y el frontend, donde Docker sí aporta mayor valor para portabilidad, despliegue y ejecución reproducible.

---

# Relación con el Sistema General

El flujo completo de la solución es:

```text
Fleet Telemetry Simulator
          ↓
      POST /gps
          ↓
Fleet Telemetry Backend
          ↓
Cálculo de estados, eventos y métricas
          ↓
Fleet Telemetry Frontend
```

---

# Estado del Proyecto

Simulador finalizado y funcional.

Funcionalidades implementadas:

* Simulación de 20 vehículos.
* Envío periódico cada 3 a 5 segundos.
* Vehículos en movimiento.
* Vehículos detenidos.
* Vehículos sin señal.
* Inyección de errores.
* Integración con backend.

---

# Reporte de IA

## 1. ¿Qué herramientas de IA utilicé?

Durante el desarrollo del simulador utilicé principalmente:

* ChatGPT
* GitHub Copilot

---

## 2. ¿Para qué tareas específicas me apoyé en IA?

La IA fue utilizada para:

* Diseñar la estructura inicial del simulador.
* Proponer la distribución de vehículos por comportamiento.
* Generar ideas para simular movimiento GPS.
* Revisar la inyección de errores.
* Redactar documentación técnica.

---

## 3. ¿Qué error de la IA encontré y cómo lo corregí?

Durante el desarrollo se revisaron sugerencias relacionadas con la simulación de rutas GPS. Algunas propuestas añadían complejidad innecesaria para el objetivo del script, como rutas históricas o trayectorias más elaboradas.

Se decidió mantener una simulación simple basada en pequeños cambios aleatorios de latitud y longitud, suficiente para probar el cálculo de estados del backend y cumplir con el requisito de la prueba técnica.

---

# Video de Sustentación

Enlace:

PENDIENTE

---

# Autor

## David Carrasco

Ingeniero de Sistemas
Especialización en Desarrollo de Software y Automatizaciones
Desarrollador Full Stack

GitHub:

https://github.com/dabbi20
