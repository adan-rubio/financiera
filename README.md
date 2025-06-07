# Plataforma Financiera

Sistema para gestionar vales de préstamo con roles de cajero, supervisor y director. Permite a los cajeros registrar vales, a los supervisores monitorear promotores y cajeros, y al director ver métricas generales de la empresa.

## Requisitos previos
- **Sistema**: Arch Linux (o cualquier distribución Linux compatible)
- **Herramientas**:
  - Docker y Docker Compose
  - Node.js y npm
  - Python 3.9+
  - PostgreSQL (incluido en Docker)
  - Git
  - VSCodium (opcional, para edición)

Instalar herramientas en Arch Linux:
```bash
sudo pacman -S docker docker-compose nodejs npm python3 python-pip git
sudo pacman -S vscodium-bin