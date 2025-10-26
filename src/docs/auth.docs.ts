/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Rotas de autenticação do sistema
 */

/**
 * @swagger
 * /auth/signup:
 *   post:
 *     summary: Cria um novo usuário
 *     description: >
 *       Registra um novo usuário no sistema com nome, e-mail, senha e tema opcional (LIGHT ou DARK).
 *       <br><br>
 *       A senha deve atender aos seguintes critérios:
 *       - Ter pelo menos 8 caracteres;
 *       - Conter pelo menos uma letra maiúscula;
 *       - Conter pelo menos uma letra minúscula;
 *       - Conter pelo menos um número;
 *       - Conter pelo menos um símbolo especial (@$!%*?&).
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *             properties:
 *               name:
 *                 type: string
 *                 example: Gabrielli Borges
 *               email:
 *                 type: string
 *                 example: gabi@example.com
 *               password:
 *                 type: string
 *                 example: Gabi@2025
 *               theme:
 *                 type: string
 *                 enum: [LIGHT, DARK]
 *                 default: LIGHT
 *                 example: DARK
 *     responses:
 *       201:
 *         description: Usuário criado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 4cb98db7-245d-4ee2-a4e9-1b2a4d7381bf
 *                     name:
 *                       type: string
 *                       example: Gabrielli Borges
 *                     email:
 *                       type: string
 *                       example: gabi@example.com
 *                     theme:
 *                       type: string
 *                       example: DARK
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-10-26T20:07:59.353Z
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Erro de validação ou e-mail já cadastrado
 *         content:
 *           application/json:
 *             schema:
 *               oneOf:
 *                 - type: object
 *                   properties:
 *                     errors:
 *                       type: array
 *                       items:
 *                         type: string
 *                       example: ["A senha deve conter pelo menos um número."]
 *                 - type: object
 *                   properties:
 *                     error:
 *                       type: string
 *                       example: "E-mail já cadastrado."
 */

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Realiza login de usuário
 *     description: >
 *       Faz login com e-mail e senha, retornando o token JWT e os dados do usuário.
 *       <br><br>
 *       A senha deve ter pelo menos 8 caracteres.
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 example: gabi@example.com
 *               password:
 *                 type: string
 *                 example: Gabi@2025
 *     responses:
 *       200:
 *         description: Login bem-sucedido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                       example: 4cb98db7-245d-4ee2-a4e9-1b2a4d7381bf
 *                     name:
 *                       type: string
 *                       example: Gabrielli Borges
 *                     email:
 *                       type: string
 *                       example: gabi@example.com
 *                     theme:
 *                       type: string
 *                       example: DARK
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-10-26T20:07:59.353Z
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *       400:
 *         description: Erro de validação (e-mail inválido, senha muito curta, etc)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 errors:
 *                   type: array
 *                   items:
 *                     type: string
 *                   example: ["E-mail inválido.", "Senha deve ter pelo menos 8 caracteres."]
 *       401:
 *         description: Credenciais inválidas
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Senha incorreta.
 */
