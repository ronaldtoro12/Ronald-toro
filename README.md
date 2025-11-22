# cevix - Aplicación de Pronósticos de Fútbol ⚽

## Descripción

**cevix** es una aplicación web completa para consultar partidos de fútbol y ver pronósticos estadísticos de las principales ligas del mundo.

## Características ✨

### 🏆 Ligas Disponibles
- English Premier League
- Spanish La Liga
- German Bundesliga
- Italian Serie A
- French Ligue 1
- UEFA Champions League
- English League Championship
- Scottish Premier League
- Greek Superleague
- Dutch Eredivisie

### 📊 Funcionalidades
1. **Visualización de Ligas**: Grid interactivo con todas las ligas disponibles
2. **Partidos por Liga**: Ver todos los partidos de cada liga
3. **Filtros**: 
   - Todos los partidos
   - Próximos partidos
   - Partidos finalizados
4. **Pronósticos Detallados**:
   - Probabilidad de victoria local
   - Probabilidad de empate
   - Probabilidad de victoria visitante
   - Análisis estadístico completo
   - Nivel de confianza

## Stack Tecnológico 🛠️

### Backend
- **FastAPI**: Framework web moderno para Python
- **MongoDB**: Base de datos NoSQL
- **Python 3.11**: Lenguaje de programación
- **Uvicorn**: Servidor ASGI

### Frontend
- **React 18**: Framework de interfaz de usuario
- **React Router DOM**: Navegación
- **Tailwind CSS**: Framework de estilos
- **Axios**: Cliente HTTP

## Instalación y Configuración 🚀

### Usando Supervisor (Recomendado)

```bash
# Reiniciar todos los servicios
sudo supervisorctl restart all

# Ver estado de servicios
sudo supervisorctl status
```

El frontend estará disponible en `http://localhost:3000`
El backend estará disponible en `http://localhost:8001`

## API Endpoints 🌐

- `GET /api/` - Endpoint de bienvenida
- `GET /api/leagues` - Obtener todas las ligas
- `GET /api/leagues/{league_id}/matches` - Obtener partidos de una liga
- `GET /api/matches/{match_id}/prediction` - Obtener pronóstico de un partido
- `GET /api/stats` - Obtener estadísticas generales

## Características del Diseño 🎨

- **Diseño Oscuro**: Fondo oscuro profesional
- **Color Acento**: Verde turquesa para elementos interactivos
- **Responsive**: Adaptado a todos los dispositivos
- **Animaciones**: Transiciones suaves y hover effects

## Autor ✍️

Desarrollado con ❤️ por el equipo de cevix