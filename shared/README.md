@@
 # Shared Library

The Shared Library contains common logic, utilities, and styles linking all realms of the Arcanum.

### Imports
All modules must import via workspace alias:
```ts
import { cn } from "@shared/lib/cn";
import "@shared/styles/tokens.css";
```

### Configuration
Ensure this alias mapping is present in the root and app-level `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@shared/*": ["shared/*"]
    }
  }
}
```
