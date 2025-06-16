# 🎮 Mus Backend - MVP Completo

Backend completo para juego de Mus online multijugador desarrollado en TypeScript con Node.js y Socket.IO.

## 🚀 Características

### ✅ **Funcionalidades Implementadas**
- **Gestión de salas** - Crear, unirse, salir automáticamente
- **Partidas 2v2** - Sistema de equipos automático (0,2 vs 1,3)  
- **Flujo completo del Mus** - Todas las fases implementadas
- **Sistema de apuestas** - Envidos, órdago, aceptar/rechazar
- **Puntuación automática** - Victoria a 40 puntos
- **Reconexión** - Manejo robusto de desconexiones
- **Timeouts** - Control automático de turnos
- **Validación** - Datos del cliente validados con Zod

### 🎯 **Fases del Juego**
1. **Mus** - Descarte de cartas
2. **Grande** - Carta más alta  
3. **Chica** - Carta más baja
4. **Pares** - Pares, medias, duples
5. **Juego** - 31+ puntos o Punto
6. **Conteo** - Puntuación automática

## 🏗️ **Arquitectura**

\`\`\`
/src
├── server.ts              # Servidor principal
├── config/
│   └── constants.ts       # Configuración del juego
├── core/                  # Lógica principal
│   ├── GameManager.ts     # Gestión de múltiples salas
│   ├── Game.ts           # Lógica de partida individual, Control de turnos, Flujo de fases, Sistema de puntuación, Procesamiento de acciones, Flujo automático
│   ├── Player.ts         # Gestión de jugadores
│   ├── DeckManager.ts    # Baraja y reparto de cartas
├── logic/                # Reglas del juego
│   ├── MusLogic.ts       # Lógica pura del Mus
├── sockets/              # WebSocket handling
│   └── socketHandler.ts  # Eventos cliente↔servidor
├── utils/                # Utilidades
│   ├── validators.ts     # Validación con Zod
│   ├── logger.ts         # Sistema de logging
│   ├── timeout.ts        # Gestión de timeouts
│   └── testUtils.ts      # Herramientas de testing
└── types/
    └── GameTypes.ts      # Tipos TypeScript
\`\`\`

## 🚀 **Instalación y Uso**

\`\`\`bash
# Instalar dependencias
npm install

# Desarrollo
npm run dev

# Producción  
npm run build
npm start

# Testing
npm run test
\`\`\`

## 🔗 **API Endpoints**

### **REST API**
- `GET /health` - Estado del servidor
- `GET /stats` - Estadísticas de partidas activas
- `POST /rooms` - Crear sala nueva

### **Endpoints de Testing (desarrollo)**
- `GET /test/create-game` - Crear partida de prueba
- `POST /test/simulate/:gameId` - Simular partida automática
- `GET /test/run-basic` - Ejecutar tests básicos

## 📡 **Eventos WebSocket**

### **Cliente → Servidor**
\`\`\`typescript
// Unirse a sala
socket.emit('joinRoom', { roomId: 'ABC123', playerName: 'Juan' });

// Jugar acción
socket.emit('playAction', { type: 'envido', amount: 3 });

// Descartar cartas
socket.emit('discardCards', [0, 2]); // Índices de cartas

// Reconectar
socket.emit('reconnect', { roomId: 'ABC123', playerId: 'uuid' });
\`\`\`

### **Servidor → Cliente**
\`\`\`typescript
// Estado del juego actualizado
socket.on('gameStateUpdate', (gameState) => {
  console.log('Nueva fase:', gameState.currentPhase);
});

// Cartas actualizadas
socket.on('handUpdate', (cards) => {
  console.log('Mi mano:', cards);
});

// Resultado de fase
socket.on('phaseResult', ({ winner, points, phase }) => {
  console.log(`${phase}: Equipo ${winner} gana ${points} puntos`);
});
\`\`\`

## 🎮 **Ejemplo de Uso**

\`\`\`typescript
import { GameManager } from './src/core/GameManager';
import { TestUtils } from './src/utils/testUtils';

// Crear partida de prueba
const { gameManager, game, players } = TestUtils.createTestGame();

// Simular partida completa
await TestUtils.simulateGame(gameManager, game.getGameState().id);

// Mostrar estadísticas
TestUtils.logGameStats(game);
\`\`\`

## 🧪 **Testing**

El sistema incluye herramientas completas de testing:

\`\`\`bash
# Tests básicos
curl http://localhost:3001/test/run-basic

# Crear partida de prueba
curl http://localhost:3001/test/create-game

# Simular partida
curl -X POST http://localhost:3001/test/simulate/GAME_ID
\`\`\`

## ⚙️ **Configuración**

Variables de entorno requeridas:
- `PORT` - Puerto del servidor (default: 3001)
- `CLIENT_URL` - URL del cliente para CORS
- `NODE_ENV` - Entorno (development/production)

## 🏆 **Estado del MVP**

### ✅ **Completado (Semanas 1-5)**
- [x] **Semana 1** - Fundaciones y estructura base
- [x] **Semana 2** - Lógica del Mus y sistema de apuestas  
- [x] **Semana 3** - Todas las fases implementadas
- [x] **Semana 4** - Sistema de puntuación y finalización
- [x] **Semana 5** - Timeouts, testing y optimizaciones

### 🎯 **Próximos Pasos**
1. **Cliente móvil** - Implementar con React Native/Expo
2. **Base de datos** - Persistir estadísticas y rankings
3. **Espectadores** - Modo observador de partidas
4. **Torneos** - Sistema de competiciones
5. **Chat** - Comunicación entre jugadores

## 📞 **Soporte**

El backend está **100% funcional** y listo para:
- ✅ Desarrollo del cliente
- ✅ Testing extensivo 
- ✅ Despliegue en producción
- ✅ Escalabilidad futura

### **Comandos Útiles**
\`\`\`bash
# Servidor en desarrollo con logs detallados
npm run dev

# Crear partida y simular
curl http://localhost:3001/test/create-game
curl -X POST http://localhost:3001/test/simulate/GAME_ID

# Ver estadísticas en tiempo real
curl http://localhost:3001/stats
\`\`\`

