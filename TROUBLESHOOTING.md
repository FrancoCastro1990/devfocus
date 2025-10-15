# Troubleshooting DevFocus

## Problema: El timer no se muestra después de hacer clic en "Start"

### Pasos para diagnosticar:

1. **Abrir Developer Tools**:
   - Presiona `F12` o `Ctrl+Shift+I` en la ventana de la aplicación
   - Ve a la pestaña "Console"

2. **Crear una tarea y subtarea**:
   - Crea una nueva tarea
   - Agrega una subtarea
   - Haz clic en "Start"

3. **Revisar los logs en la consola**:
   Deberías ver logs similares a:
   ```
   SubtaskItem NombreSubtarea: {
     status: "in_progress",
     isActive: true,
     hasSession: true,
     session: { id: "...", subtaskId: "...", durationSeconds: 0, ... },
     seconds: 0
   }
   ```

### Qué revisar:

- **`status`**: Debe cambiar de `"todo"` a `"in_progress"` después de hacer clic en Start
- **`isActive`**: Debe ser `true` cuando el status es "in_progress"
- **`hasSession`**: Debe ser `true` después de hacer Start
- **`session`**: Debe contener un objeto con `durationSeconds`
- **`seconds`**: Debe incrementar cada segundo (0, 1, 2, 3...)

### Problemas comunes:

#### 1. La sesión es `null` o `undefined`
**Síntoma**: `hasSession: false` en los logs

**Posibles causas**:
- El comando `start_subtask` no se ejecutó correctamente
- La sesión no se guardó en el store de Zustand
- La conversión camelCase no funcionó

**Solución**:
- Revisar si hay errores en la consola
- Verificar que el backend de Rust esté corriendo

#### 2. `isActive` es `false` aunque el status sea "in_progress"
**Síntoma**: El timer no cuenta aunque la subtarea esté en progreso

**Posible causa**:
- El estado de la subtarea no se actualizó correctamente

#### 3. El campo `durationSeconds` es `undefined`
**Síntoma**: `session.durationSeconds` es `undefined` en los logs

**Causa**: La conversión de snake_case a camelCase no funcionó

**Solución**: Ya se agregó `#[serde(rename_all = "camelCase")]` a los modelos de Rust

## Problema: El modal no aparece por encima del contenido

### Síntomas:
- Los dialogs de confirmación aparecen detrás del contenido
- No se puede hacer clic en los botones del modal

### Solución:
El componente `Modal` usa React Portal para renderizar en `document.body`:

```typescript
import { createPortal } from 'react-dom';

return createPortal(modalContent, document.body);
```

Esto garantiza que el modal siempre aparezca en la capa superior con `z-index: 9999`.

## Problema: Las animaciones de borde no se ven

### Síntomas:
- Los tasks/subtasks en estado "in_progress" no muestran el efecto de sweep
- No hay animación visible cada 5 segundos

### Diagnóstico:
1. Verifica que el elemento tenga `overflow-hidden`:
```tsx
<div className="relative overflow-hidden ...">
```

2. Verifica que el estado sea correcto:
```tsx
{status === 'in_progress' && borderPulse && (
  <div className="absolute inset-0 animate-border-sweep" />
)}
```

3. Verifica que la animación CSS esté definida en `index.css`:
```css
@keyframes border-sweep {
  0% { clip-path: polygon(0 0, 0 0, 0 100%, 0 100%); opacity: 0; }
  50% { clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); opacity: 1; }
  100% { clip-path: polygon(100% 0, 100% 0, 100% 100%, 100% 100%); opacity: 0; }
}
```

## Problema: No se puede cambiar el estado de la tarea

### Síntomas:
- El dropdown de estado no responde
- Al seleccionar un nuevo estado, no se guarda

### Diagnóstico:
1. Verifica que el selector aparezca en la vista de detalle de la tarea
2. Abre la consola y busca errores al cambiar el estado
3. Verifica que la función `handleUpdateTaskStatus` se esté llamando

### Si ves errores:
- Copia el error completo y revisa si es un problema de permisos o de comunicación con Tauri

## Cómo ver los errores del backend (Rust):

Los errores del backend de Tauri aparecen en la terminal donde ejecutaste `npm run tauri:dev`, no en la consola del navegador.

Busca mensajes que digan:
```
Error: ...
thread 'main' panicked at ...
```

## Comando útil para resetear todo:

Si nada funciona, puedes resetear la base de datos:

### Windows:
```powershell
Remove-Item "$env:LOCALAPPDATA\devfocus\devfocus.db"
```

### Linux/Mac:
```bash
rm ~/.local/share/devfocus/devfocus.db  # Linux
rm ~/Library/Application\ Support/devfocus/devfocus.db  # Mac
```

Luego reinicia la aplicación.

## Reportar problemas:

Si encuentras un problema, por favor incluye:
1. Los logs de la consola del navegador (F12 → Console)
2. Los logs de la terminal donde corre `npm run tauri:dev`
3. Pasos exactos para reproducir el problema
