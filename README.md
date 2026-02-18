# LoanFlow - Sistema Web de Gestão de Empréstimos

## Configuração Firebase (lcjuros)
A conexão do frontend com Firebase já está configurada em `js/firebase.js` com o projeto `lcjuros`.

### O que ainda precisa fazer no Firebase Console
1. **Authentication > Sign-in method**
   - Ativar **Email/Password**.
2. **Authentication > Settings > Authorized domains**
   - Adicionar o domínio onde o app vai rodar (ex.: `localhost`, domínio do Hosting).
3. **Firestore Database**
   - Criar o banco em modo produção/teste.
   - Criar coleção `users` com documento `<uid>` e campo `role` (`admin` ou `subadmin`).
4. **Storage**
   - Ativar o Storage para upload de fotos de clientes.
5. **Rules (Firestore/Storage)**
   - Ajustar regras para permitir apenas usuários autenticados e respeitar permissões.
6. **Hosting (opcional para deploy)**
   - Rodar os comandos abaixo para publicar.

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


## Cálculo de Juros
- O sistema usa **juros compostos** e agora permite frequência de capitalização **mensal, semanal e diária** no cadastro do cliente.
- Fórmula aplicada: `M = C * (1 + i)^n`, com `n` convertido automaticamente conforme a frequência escolhida.
