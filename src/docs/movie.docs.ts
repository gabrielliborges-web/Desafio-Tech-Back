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
 *     summary: Cria um novo filme
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MovieCreate'
 *     responses:
 *       201:
 *         description: Filme criado com sucesso
 *       400:
 *         description: Erro de validação ou dados inválidos
 */

/**
 * @swagger
 * /movie/list:
 *   get:
 *     summary: Lista todos os filmes (com paginação e filtros)
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         example: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         example: 10
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         example: inception
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [DRAFT, PUBLISHED]
 *       - in: query
 *         name: visibility
 *         schema:
 *           type: string
 *           enum: [PUBLIC, PRIVATE]
 *       - in: query
 *         name: genre
 *         schema:
 *           type: string
 *           example: Action
 *     responses:
 *       200:
 *         description: Lista de filmes retornada com sucesso
 *       400:
 *         description: Parâmetros de busca inválidos
 */

/**
 * @swagger
 * /movie/{id}:
 *   get:
 *     summary: Obtém os detalhes de um filme pelo ID
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Filme encontrado
 *       404:
 *         description: Filme não encontrado
 */

/**
 * @swagger
 * /movie/{id}:
 *   put:
 *     summary: Atualiza um filme existente
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/MovieUpdate'
 *     responses:
 *       200:
 *         description: Filme atualizado com sucesso
 *       400:
 *         description: Dados inválidos
 *       404:
 *         description: Filme não encontrado
 */

/**
 * @swagger
 * /movie/{id}:
 *   delete:
 *     summary: Remove um filme pelo ID
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         example: 1
 *     responses:
 *       200:
 *         description: Filme removido com sucesso
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
 *         - userId
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
 *           example: https://image.tmdb.org/t/p/w500/inception.jpg
 *         imagePoster:
 *           type: string
 *           example: https://image.tmdb.org/t/p/w500/inception-poster.jpg
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
 *               id:
 *                 type: integer
 *                 example: 1
 *               name:
 *                 type: string
 *                 example: Action
 *         userId:
 *           type: integer
 *           example: 1
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
