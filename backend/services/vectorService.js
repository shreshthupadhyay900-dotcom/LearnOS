const { Pinecone } = require('@pinecone-database/pinecone');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'mock_key');
const embeddingModel = genAI.getGenerativeModel({ model: 'text-embedding-004' });

// Initialize Pinecone
const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY || 'mock_key'
});

const indexName = process.env.PINECONE_INDEX || 'eduai-knowledge';

/**
 * Generate embedding for a given text
 */
const getEmbedding = async (text) => {
  try {
    const result = await embeddingModel.embedContent(text);
    return result.embedding.values;
  } catch (error) {
    console.error('Error generating embedding:', error);
    return new Array(768).fill(0); // Google text-embedding-004 is 768d
  }
};

/**
 * Search for relevant context in the vector database
 */
const searchKnowledgeBase = async (query, topK = 3) => {
  try {
    if (!process.env.PINECONE_API_KEY || process.env.PINECONE_API_KEY === 'mock_key') {
      console.warn('Pinecone API Key missing or mock, returning empty results');
      return [];
    }

    const embedding = await getEmbedding(query);
    const index = pc.index(indexName);
    
    const queryResponse = await index.query({
      vector: embedding,
      topK,
      includeMetadata: true,
    });

    return queryResponse.matches.map(match => ({
      text: match.metadata.text,
      score: match.score,
      source: match.metadata.source
    }));
  } catch (error) {
    console.error('Vector Search Error:', error);
    return [];
  }
};

/**
 * Upsert content to the vector database
 */
const upsertKnowledge = async (text, id, metadata = {}) => {
  try {
    const embedding = await getEmbedding(text);
    const index = pc.index(indexName);
    
    await index.upsert([{
      id,
      values: embedding,
      metadata: { ...metadata, text }
    }]);
    
    return true;
  } catch (error) {
    console.error('Vector Upsert Error:', error);
    return false;
  }
};

module.exports = { searchKnowledgeBase, upsertKnowledge, getEmbedding };
