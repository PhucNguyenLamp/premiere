/**
 * ROUTE FOR TAG
 * @swagger
 * tags:
 *  name: tag
 *  description: Everything about your Tags
 * 
 */


import express from 'express';
import { addTag, deleteTagByID } from '../controller/tagDAO';
import swaggerJSDoc from 'swagger-jsdoc';
const router = express.Router();

/**
 * @swagger
 * /addTag:
 *   post:
 *     tags: 
 *      - tag
 *     summary: Add a new tag
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - tagName
 *             properties:
 *               tagName:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tag added successfully
 */
router.post('/addTag', addTag ); 

/**
 * @swagger
 * /deleteTagByID:
 *   delete:
 *     tags: 
 *      - tag
 *     summary: Add a new tag
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - _id
 *             properties:
 *               _id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tag added successfully
 */
router.delete('/deleteTagByID', deleteTagByID ); 

export default router;