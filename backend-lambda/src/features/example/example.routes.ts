import { Hono } from 'hono';
import * as exampleService from './example.service';
import { successResponse, errorResponse } from '../../utils/response';

const exampleRoutes = new Hono();

// GET /example - Get all examples
exampleRoutes.get('/', async (c) => {
  try {
    const examples = await exampleService.getAllExamples();
    return c.json(successResponse(examples, 'Examples fetched successfully'));
  } catch (error) {
    console.error('Error fetching examples:', error);
    return errorResponse(c, 'Failed to fetch examples', 500);
  }
});

// GET /example/count - Get count
exampleRoutes.get('/count', async (c) => {
  try {
    const count = await exampleService.countExamples();
    return c.json(successResponse({ count }, 'Count fetched successfully'));
  } catch (error) {
    console.error('Error counting examples:', error);
    return errorResponse(c, 'Failed to count examples', 500);
  }
});

// GET /example/:id - Get example by ID
exampleRoutes.get('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const exampleData = await exampleService.getExampleById(id);
    
    if (!exampleData) {
      return errorResponse(c, 'Example not found', 404);
    }
    
    return c.json(successResponse(exampleData, 'Example fetched successfully'));
  } catch (error) {
    console.error('Error fetching example:', error);
    return errorResponse(c, 'Failed to fetch example', 500);
  }
});

// POST /example - Create new example
exampleRoutes.post('/', async (c) => {
  try {
    const body = await c.req.json();
    
    // Validation
    if (!body.author) {
      return errorResponse(c, 'Author is required', 400);
    }
    
    // Check if author already exists
    const existing = await exampleService.getExampleByAuthor(body.author);
    if (existing) {
      return errorResponse(
        c,
        `Author "${body.author}" already exists. Author must be unique.`,
        409
      );
    }
    
    const newExample = await exampleService.createExample({
      author: body.author,
      comment: body.comment || 'Hello world!',
    });
    
    return c.json(successResponse(newExample, 'Example created successfully'), 201);
  } catch (error) {
    console.error('Error creating example:', error);
    return errorResponse(c, 'Failed to create example', 500);
  }
});

// PUT /example/:id - Update example
exampleRoutes.put('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const body = await c.req.json();
    
    // Check if example exists
    const existing = await exampleService.getExampleById(id);
    if (!existing) {
      return errorResponse(c, 'Example not found', 404);
    }
    
    // If changing author, check uniqueness
    if (body.author) {
      const authorExists = await exampleService.getExampleByAuthor(body.author);
      if (authorExists && authorExists.id !== id) {
        return errorResponse(
          c,
          `Author "${body.author}" already exists. Author must be unique.`,
          409
        );
      }
    }
    
    const updated = await exampleService.updateExample(id, body);
    
    return c.json(successResponse(updated, 'Example updated successfully'));
  } catch (error) {
    console.error('Error updating example:', error);
    return errorResponse(c, 'Failed to update example', 500);
  }
});

// DELETE /example/:id - Delete example
exampleRoutes.delete('/:id', async (c) => {
  try {
    const id = c.req.param('id');
    
    // Check if example exists
    const existing = await exampleService.getExampleById(id);
    if (!existing) {
      return errorResponse(c, 'Example not found', 404);
    }
    
    await exampleService.deleteExample(id);
    
    // DELETE ควร return 200 แทน 204 เพราะมี response body
    return c.json(successResponse(null, 'Example deleted successfully'), 200);
  } catch (error) {
    console.error('Error deleting example:', error);
    return errorResponse(c, 'Failed to delete example', 500);
  }
});

export default exampleRoutes;

