/**
 * @swagger
 * tags:
 *   name: Movies
 *   description: Endpoints para gerenciamento de filmes
 */

/**
 * @swagger
 * /movie/create:
 *   post:
 *     summary: Cria um novo filme com upload de imagens e notificação em tempo real
 *     description: >
 *       Cria um novo registro de filme, realiza upload das imagens (capa e pôster) para o AWS S3
 *       e, caso o filme seja **público** e esteja com status **PUBLISHED**, dispara automaticamente
 *       uma notificação global em tempo real para todos os usuários conectados via **Socket.IO**.
 *       <br><br>
 *       🔔 **Notificações em tempo real**
 *       <br>
 *       - Quando `visibility = PUBLIC` e `status = PUBLISHED`, o backend:
 *         - Registra uma entrada na tabela `Notification` no banco de dados;
 *         - Emite o evento `newMovie` com os detalhes da notificação para todos os clientes conectados.
 *       <br><br>
 *       É necessário enviar o corpo da requisição como **multipart/form-data** contendo:
 *       - Dados textuais do filme (campos obrigatórios e opcionais);
 *       - Arquivos `imageCover` e `imagePoster` (opcionais).
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []  # requer token JWT
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - tagline
 *             properties:
 *               title:
 *                 type: string
 *                 example: Interstellar
 *               tagline:
 *                 type: string
 *                 example: "Mankind was born on Earth. It was never meant to die here."
 *               description:
 *                 type: string
 *                 example: A group of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.
 *               releaseDate:
 *                 type: string
 *                 format: date
 *                 example: 2014-11-07
 *               duration:
 *                 type: integer
 *                 example: 169
 *               indicativeRating:
 *                 type: integer
 *                 example: 12
 *               linkPreview:
 *                 type: string
 *                 example: https://www.youtube.com/watch?v=zSWdZVtXT7E
 *               language:
 *                 type: string
 *                 example: English
 *               country:
 *                 type: string
 *                 example: USA
 *               budget:
 *                 type: number
 *                 example: 165000000
 *               revenue:
 *                 type: number
 *                 example: 677471339
 *               actors:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Matthew McConaughey", "Anne Hathaway", "Jessica Chastain"]
 *               producers:
 *                 type: array
 *                 items:
 *                   type: string
 *                 example: ["Emma Thomas", "Christopher Nolan"]
 *               director:
 *                 type: string
 *                 example: Christopher Nolan
 *               genres[0].name:
 *                 type: string
 *                 example: Sci-Fi
 *               genres[1].name:
 *                 type: string
 *                 example: Adventure
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PUBLISHED]
 *                 example: PUBLISHED
 *               visibility:
 *                 type: string
 *                 enum: [PRIVATE, PUBLIC]
 *                 example: PUBLIC
 *               imageCover:
 *                 type: string
 *                 format: binary
 *                 description: Imagem de capa do filme (upload opcional)
 *               imagePoster:
 *                 type: string
 *                 format: binary
 *                 description: Imagem do pôster do filme (upload opcional)
 *     responses:
 *       201:
 *         description: Filme criado com sucesso e notificação emitida (se aplicável)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                   example: 15
 *                 title:
 *                   type: string
 *                   example: Interstellar
 *                 status:
 *                   type: string
 *                   example: PUBLISHED
 *                 visibility:
 *                   type: string
 *                   example: PUBLIC
 *                 imageCover:
 *                   type: string
 *                   example: https://bucket.s3.region.amazonaws.com/usuarios/1/movies/Interstellar/cover/uuid-cover.jpg
 *                 imagePoster:
 *                   type: string
 *                   example: https://bucket.s3.region.amazonaws.com/usuarios/1/movies/Interstellar/poster/uuid-poster.jpg
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: Gabrielli Borges
 *                     email:
 *                       type: string
 *                       example: gabi@example.com
 *       400:
 *         description: Erro de validação ou dados inválidos
 *       401:
 *         description: Usuário não autenticado
 *       500:
 *         description: Erro interno ao criar filme
 */

/**
 * @swagger
 * /movie/{id}:
 *   put:
 *     summary: Atualiza um filme existente (com reenvio de notificação, se aplicável)
 *     description: >
 *       Atualiza os dados de um filme existente, permitindo também substituir as imagens (capa e pôster)
 *       e reagendar notificações automáticas.
 *       <br><br>
 *       - Apenas o criador do filme pode atualizá-lo.
 *       - Imagens antigas são removidas automaticamente do S3 se novas forem enviadas.
 *       - Caso o filme atualizado tenha `status = PUBLISHED` e `visibility = PUBLIC`,
 *         uma nova notificação será registrada e enviada via **Socket.IO**.
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do filme a ser atualizado
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             $ref: '#/components/schemas/MovieUpdate'
 *     responses:
 *       200:
 *         description: Filme atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       403:
 *         description: Usuário não tem permissão para editar este filme
 *       404:
 *         description: Filme não encontrado
 */

/**
 * @swagger
 * /movie/list:
 *   get:
 *     summary: Lista todos os filmes com paginação, filtros e regras de visibilidade
 *     description: >
 *       Retorna uma lista de filmes com base nos filtros aplicados.
 *       - Se **status** não for informado, retornará apenas filmes **PUBLISHED**.
 *       - Se **status = DRAFT**, retornará apenas filmes criados pelo usuário autenticado.
 *       - É necessário um token válido (Bearer) para acesso.
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         description: "Página atual da listagem."
 *         schema:
 *           type: integer
 *           default: 1
 *         example: 1
 *       - in: query
 *         name: limit
 *         description: "Quantidade máxima de filmes por página."
 *         schema:
 *           type: integer
 *           default: 10
 *         example: 10
 *       - in: query
 *         name: search
 *         description: "Busca por título, título original ou tagline."
 *         schema:
 *           type: string
 *         example: "Inception"
 *       - in: query
 *         name: status
 *         description: "Filtra filmes por status de publicação (DRAFT ou PUBLISHED)."
 *         schema:
 *           type: string
 *           enum: [DRAFT, PUBLISHED]
 *         example: "PUBLISHED"
 *       - in: query
 *         name: visibility
 *         description: "Filtra filmes por visibilidade (PUBLIC ou PRIVATE)."
 *         schema:
 *           type: string
 *           enum: [PUBLIC, PRIVATE]
 *         example: "PUBLIC"
 *       - in: query
 *         name: genre
 *         description: "Filtra filmes pelo nome do gênero."
 *         schema:
 *           type: string
 *         example: "Action"
 *       - in: query
 *         name: orderBy
 *         description: "Campo de ordenação (exemplo: title, releaseDate, ratingAvg, createdAt)."
 *         schema:
 *           type: string
 *           enum: [title, releaseDate, ratingAvg, createdAt]
 *         example: "createdAt"
 *       - in: query
 *         name: order
 *         description: "Direção da ordenação (ascendente ou descendente)."
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         example: "desc"
 *     responses:
 *       200:
 *         description: "Lista de filmes retornada com sucesso."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Movie'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                       example: 42
 *                     page:
 *                       type: integer
 *                       example: 1
 *                     limit:
 *                       type: integer
 *                       example: 10
 *                     totalPages:
 *                       type: integer
 *                       example: 5
 *       400:
 *         description: "Parâmetros de busca inválidos ou erro de validação."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Erro ao carregar lista de filmes."
 *       401:
 *         description: "Token inválido ou ausente."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Token não fornecido."
 */

/**
 * @swagger
 * /movie/{id}:
 *   get:
 *     summary: Obtém os detalhes de um filme pelo ID
 *     description: >
 *       Retorna as informações completas de um filme, incluindo gêneros, avaliações, comentários e autor.
 *       - Se o filme estiver com **status = PUBLISHED**, qualquer usuário autenticado pode visualizá-lo.
 *       - Se o filme estiver com **status = DRAFT**, apenas o criador do filme poderá acessá-lo.
 *       - É necessário um token Bearer válido para realizar a requisição.
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: "ID numérico do filme a ser buscado."
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: "Filme encontrado com sucesso."
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Movie'
 *       400:
 *         description: "ID inválido ou erro na requisição."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "ID inválido."
 *       403:
 *         description: "Acesso negado. O filme é um rascunho privado de outro usuário."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Acesso negado. Este filme é um rascunho privado."
 *       404:
 *         description: "Filme não encontrado."
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Filme não encontrado."
 */

/**
 * @swagger
 * /movie/{id}:
 *   delete:
 *     summary: Remove um filme existente (somente o autor pode deletar)
 *     description: >
 *       Permite a exclusão de um filme pelo ID.
 *       - Antes da exclusão, remove vínculos em `MovieGenre` para evitar erro de chave estrangeira.
 *       - Apenas o criador do filme pode deletá-lo.
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID do filme a ser deletado
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Filme removido com sucesso
 *       403:
 *         description: Usuário não tem permissão para deletar este filme
 *       404:
 *         description: Filme não encontrado
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     MovieCreate:
 *       type: object
 *       required:
 *         - title
 *         - tagline
 *       properties:
 *         title:
 *           type: string
 *           example: Inception
 *         tagline:
 *           type: string
 *           example: Your mind is the scene of the crime
 *         description:
 *           type: string
 *           example: A skilled thief who steals corporate secrets through dream-sharing technology.
 *         releaseDate:
 *           type: string
 *           format: date
 *           example: 2010-07-16
 *         duration:
 *           type: integer
 *           example: 148
 *         indicativeRating:
 *           type: integer
 *           example: 14
 *         imageCover:
 *           type: string
 *           format: binary
 *           description: Arquivo de imagem da capa (upload)
 *         imagePoster:
 *           type: string
 *           format: binary
 *           description: Arquivo de imagem do pôster (upload)
 *         linkPreview:
 *           type: string
 *           example: https://www.youtube.com/watch?v=YoHD9XEInc0
 *         actors:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Leonardo DiCaprio", "Joseph Gordon-Levitt"]
 *         director:
 *           type: string
 *           example: Christopher Nolan
 *         producers:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Emma Thomas", "Christopher Nolan"]
 *         language:
 *           type: string
 *           example: English
 *         country:
 *           type: string
 *           example: USA
 *         budget:
 *           type: number
 *           example: 160000000
 *         revenue:
 *           type: number
 *           example: 825532764
 *         profit:
 *           type: number
 *           example: 100000000
 *         ratingAvg:
 *           type: number
 *           example: 85
 *         status:
 *           type: string
 *           enum: [DRAFT, PUBLISHED]
 *           example: PUBLISHED
 *         visibility:
 *           type: string
 *           enum: [PUBLIC, PRIVATE]
 *           example: PUBLIC
 *         genres:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: Action
 *
 *     MovieUpdate:
 *       type: object
 *       description: Campos opcionais para atualização parcial de um filme
 *       properties:
 *         title:
 *           type: string
 *           example: Inception (Director's Cut)
 *         tagline:
 *           type: string
 *           example: The dream continues
 *         description:
 *           type: string
 *         duration:
 *           type: integer
 *           example: 150
 *         imageCover:
 *           type: string
 *           format: binary
 *           description: Nova imagem de capa (substitui a anterior)
 *         imagePoster:
 *           type: string
 *           format: binary
 *           description: Novo pôster (substitui o anterior)
 *         status:
 *           type: string
 *           enum: [DRAFT, PUBLISHED]
 *         visibility:
 *           type: string
 *           enum: [PUBLIC, PRIVATE]
 *
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * tags:
 *   name: Movies
 *   description: Endpoints relacionados aos filmes
 */

/**
 * @swagger
 * /movies:
 *   get:
 *     summary: Lista todos os filmes públicos e privados do usuário logado
 *     description: Retorna filmes públicos e os privados pertencentes ao usuário logado, com suporte a filtros e paginação.
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Texto para busca (título, descrição, diretor etc.)
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *         description: Filtro por gênero
 *       - in: query
 *         name: visibility
 *         schema:
 *           type: string
 *           enum: [PUBLIC, PRIVATE]
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Página atual
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Limite de registros por página
 *     responses:
 *       200:
 *         description: Lista de filmes retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Movie'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Token inválido ou ausente.
 *       500:
 *         description: Erro interno do servidor.
 */

/**
 * @swagger
 * /movies/user:
 *   get:
 *     summary: Lista todos os filmes do usuário logado
 *     description: Retorna apenas os filmes criados pelo usuário autenticado, com suporte a filtros e paginação.
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Texto para busca (título, descrição etc.)
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, PUBLISHED]
 *         description: Filtro por status do filme
 *       - in: query
 *         name: visibility
 *         schema:
 *           type: string
 *           enum: [PUBLIC, PRIVATE]
 *         description: Filtro por visibilidade
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: Página atual
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Limite de registros por página
 *     responses:
 *       200:
 *         description: Lista de filmes do usuário retornada com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Movie'
 *                 meta:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *       401:
 *         description: Token inválido ou ausente.
 *       500:
 *         description: Erro interno do servidor.
 */

/**
 * @swagger
 * /movies/{id}/status:
 *   patch:
 *     summary: Atualiza o status de um filme (rascunho ou publicado)
 *     description: Permite alternar o status do filme entre **DRAFT** e **PUBLISHED**.
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: ID do filme a ser atualizado.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [DRAFT, PUBLISHED]
 *                 example: PUBLISHED
 *     responses:
 *       200:
 *         description: Status atualizado com sucesso.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Status do filme atualizado para PUBLISHED."
 *                 data:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     title:
 *                       type: string
 *                     status:
 *                       type: string
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Token inválido ou ausente.
 *       404:
 *         description: Filme não encontrado.
 *       403:
 *         description: Usuário não tem permissão para editar o filme.
 *       500:
 *         description: Erro interno do servidor.
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Movie:
 *       type: object
 *       properties:
 *         id:
 *           type: integer
 *         title:
 *           type: string
 *         tagline:
 *           type: string
 *         description:
 *           type: string
 *         releaseDate:
 *           type: string
 *           format: date
 *         status:
 *           type: string
 *           enum: [DRAFT, PUBLISHED]
 *         visibility:
 *           type: string
 *           enum: [PUBLIC, PRIVATE]
 *         imageCover:
 *           type: string
 *         imagePoster:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 *         user:
 *           type: object
 *           properties:
 *             id:
 *               type: integer
 *             name:
 *               type: string
 *         genres:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               genre:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 */
