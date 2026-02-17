# CookFlow V2.1: The Intelligent Kitchen

![CookFlow Architecture](https://via.placeholder.com/800x200.png?text=CookFlow+V2.1+Architecture)

> **Misión:** Transformar la TV en un centro de mando culinario (Experiencia de 10 pies).  
> **Filosofía:** Simplicidad radical, Costo Cero, y Resiliencia Total (Offline First).

---

## 🏗️ Stack Tecnológico (Kernel V2.1)

| Componente | Tecnología | Función |
| :--- | :--- | :--- |
| **Frontend TV** | Roku (BrightScript) | UI de alto rendimiento y bajo consumo de memoria. |
| **Backend** | Supabase (PostgreSQL) | Persistencia, Auth, y Reglas de Negocio (RLS). |
| **API Gateway** | Edge Functions (Deno) | Proxy seguro para Whisk y lógica de negocio. |
| **Content** | Whisk API | Motor de búsqueda de recetas e ingredientes. |
| **DevOps** | Docker + PowerShell | Entorno de desarrollo local con Smart DNS (`setup_network.ps1`). |

---

## 🛡️ Seguridad & Alta Disponibilidad

1.  **Row Level Security (RLS):** 
    - Perfiles de usuario privados (`auth.uid()`).
    - Catálogo de Chefs público y cacheable.
2.  **Smart DNS & Networking:**
    - Script `setup_network.ps1` inyecta IP del host en tiempo de ejecución.
    - Roku utiliza `ConfigManager` para cambiar dinámicamente entre Dev (Local) y Prod (Edge).
3.  **Resiliencia (Offline First):**
    - Fallback automático a `roRegistry` si la red falla.
    - Imágenes optimizadas (WebP) vía CDN gratuito.

---

## 🚀 Estructura del Proyecto

```
/
├── .github/              # CI/CD Workflows
├── cookflow_roku/        # Código Fuente Roku (BrightScript)
│   ├── components/       # SceneGraph XML Components
│   ├── source/           # Lógica Core (.brs)
│   │   ├── ConfigManager.brs  # Cerebro de Configuración
│   │   ├── DataParsers.brs    # Lógica de "Flattened JSON"
│   │   └── main.brs           # Entry Point
│   └── manifest          # Configuración del Canal
├── supabase/             # Migraciones y Edge Functions
├── docker-compose.yml    # Entorno Local (API Mock)
└── setup_network.ps1     # Script de Inyección de Red V2.1
```

---

## ⚡ Quick Start (Dev)

1.  **Inicializar Red:**
    Ejecutar como Administrador:
    ```powershell
    ./setup_network.ps1
    ```
    *Esto configurará el firewall y actualizará el manifest con tu IP actual.*

2.  **Levantar Backend:**
    ```bash
    docker-compose up
    ```

3.  **Deploy a Roku:**
    Usa la extensión de VSCode o el script `deploy.sh` (si existe) para enviar `cookflow_roku` a tu dispositivo.

---

*Mantenedor: CookFlow Core Kernel Architect*
*Versión: 2.1.0*
