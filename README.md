# NutriBalance

MVP móvil multiplataforma de seguimiento nutricional con Expo SDK 58, React Native, TypeScript y Expo Router. La experiencia inicial funciona sin cuenta y guarda los datos localmente.

## Requisitos

- Node.js 22.13 o superior (Expo SDK 58).
- npm.
- Android Studio/emulador Android, Xcode en macOS, o un navegador para ejecutar la versión web.

## Instalar y ejecutar

```bash
npm install
npx expo start
```

En la terminal de Expo, abre la web con `w`, Android con `a` o iOS con `i` (iOS requiere macOS y Xcode). Para un teléfono físico, utiliza una development build compatible con SDK 58; durante la transición de SDK, la versión disponible de Expo Go puede no incluir SDK 58.

Comprobaciones del proyecto:

```bash
npm run typecheck
npm run lint
npx expo-doctor
```

## Funcionalidad del MVP

- Onboarding con validaciones para perfil adulto y una estimación de mantenimiento mediante Mifflin-St Jeor con factor de actividad seleccionado.
- Objetivo inicial en mantenimiento; no se sugiere un déficit para pérdida de peso.
- Diario por tipo de comida, energía/macronutrientes disponibles en USDA FoodData Central, cantidades en gramos y registro de agua.
- Seguimiento de peso y gráficas de tendencias.
- Objetivos editables. Una meta inferior a la estimación solo se guarda tras confirmar que fue acordada con un profesional de salud.
- Perfil y almacenamiento local en AsyncStorage.
- Acceso y registro Firebase Authentication opcionales.
- Adaptador para sincronizar perfil y días en Firestore, con reglas que limitan el acceso al propietario. La sincronización automática aún no está activada en este MVP.

Los cálculos son orientativos, no constituyen consejo médico, y no deben utilizarse para diagnosticar o tratar enfermedades. Ante embarazo, lactancia, menor edad, trastornos alimentarios o condiciones médicas, consulta a un profesional de salud. La app no recomienda déficits extremos.

## Datos de alimentos USDA

La búsqueda usa la API pública de USDA FoodData Central. Los nutrientes no se incluyen como ejemplos ni se estiman localmente: la app muestra resultados de USDA que incluyen calorías y escala los datos por la cantidad anotada. Si USDA no publica un macro, se muestra como desconocido.

Sin configuración, se utiliza la `DEMO_KEY` de USDA, sujeta a una cuota baja. Para activar búsquedas propias:

1. Solicita una clave en [USDA FoodData Central](https://fdc.nal.usda.gov/api-key-signup.html).
2. Copia `.env.server.example` a `.env.server` y asigna la clave a `FDC_API_KEY`. Este archivo está ignorado por Git.
3. En `.env`, deja `EXPO_PUBLIC_FDC_PROXY_URL=http://localhost:8787`. Si pruebas desde un teléfono físico, usa la IP local del computador en vez de `localhost` y ajusta `FDC_ALLOWED_ORIGIN` para la web.
4. En una terminal ejecuta `npm run fdc-proxy`; en otra, `npx expo start`.

El proxy limita las solicitudes locales y no registra la clave. Para producción, aloja este endpoint en un servidor con HTTPS, secretos del proveedor, autenticación o cuotas por usuario y límites de tasa a nivel de infraestructura. No pongas la API key USDA en variables `EXPO_PUBLIC_*` ni en el bundle móvil.

## Firebase y Firestore

1. Crea un proyecto en Firebase Console.
2. Habilita Email/Password en Authentication.
3. Crea Firestore Database.
4. Copia `.env.example` a `.env` y completa la configuración web del proyecto Firebase. Estos valores identifican el proyecto; protege los datos mediante Authentication y reglas Firestore, no con secretos en el cliente.
5. Publica `firestore.rules` desde Firebase Console o Firebase CLI.
6. Reinicia Expo después de cambiar variables de entorno.

La aplicación permite registro, inicio de sesión y recuperación de contraseña. El MVP no migra los datos locales ni sincroniza automáticamente. `lib/firestoreRepository.ts` contiene las operaciones iniciales de perfil y día para conectar en la siguiente etapa.

## Estructura

```text
app/                  Rutas Expo Router y pestañas
components/           Componentes visuales y gráfica
constants/            Paleta y tokens visuales
context/              Estado de aplicación local
lib/                  Energía, fechas, USDA, almacenamiento y Firebase
types/                Tipos del dominio
firestore.rules        Reglas iniciales de acceso por propietario
```

## Fuentes

- USDA FoodData Central API Guide: https://fdc.nal.usda.gov/api-guide.html
- USDA FoodData Central Branded Foods Documentation: https://fdc.nal.usda.gov/GBFPD_Documentation
- Mifflin MD et al. A new predictive equation for resting energy expenditure in healthy individuals. Am J Clin Nutr. 1990;51(2):241-247. doi:10.1093/ajcn/51.2.241
