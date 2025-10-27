/**
 * @swagger
 * /user/theme:
 *   put:
 *     summary: Atualiza o tema do usuário autenticado
 *     description: >
 *       Permite ao usuário autenticado alterar sua preferência de tema entre **LIGHT** e **DARK**.
 *       <br><br>
 *       O campo `theme` é salvo diretamente no banco de dados e refletido na próxima sessão do usuário.
 *     tags: [User]
 *     security:
 *       - bearerAuth: []  # requer token JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - theme
 *             properties:
 *               theme:
 *                 type: string
 *                 enum: [LIGHT, DARK]
 *                 example: DARK
 *     responses:
 *       200:
 *         description: Tema atualizado com sucesso
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Tema atualizado com sucesso.
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 12
 *                     name:
 *                       type: string
 *                       example: Gabrielli Borges
 *                     email:
 *                       type: string
 *                       example: gabi@example.com
 *                     theme:
 *                       type: string
 *                       example: DARK
 *                     updatedAt:
 *                       type: string
 *                       format: date-time
 *                       example: 2025-10-27T01:04:59.353Z
 *       400:
 *         description: Erro de validação ou tema inválido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Tema inválido. Valores permitidos: LIGHT ou DARK."

 *       401:
 *         description: Usuário não autenticado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Usuário não autenticado.
 *       404:
 *         description: Usuário não encontrado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Usuário não encontrado.
 *       500:
 *         description: Erro interno ao atualizar o tema
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: Erro ao atualizar tema do usuário.
 */
