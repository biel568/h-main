# LoanFlow - Sistema Web de Gestão de Empréstimos

## Configuração
1. Atualize `js/firebase.js` com as credenciais do Firebase.
2. Habilite no Firebase Console:
   - Authentication (Email/Senha)
   - Firestore
   - Storage
3. Crie coleção `users` com documento `<uid>` e campo `role` (`admin` ou `subadmin`).

## Estrutura
- `css/`: estilos globais
- `js/`: lógica principal (auth, dashboard, firebase, utilitários)
- `pages/`: páginas de login e dashboard
- `components/`: componentes reutilizáveis (toast/sidebar)

## Deploy Firebase Hosting
```bash
firebase login
firebase use --add
firebase deploy
```
