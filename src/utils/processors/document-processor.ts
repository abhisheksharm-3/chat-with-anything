"use server";

import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { createGeminiEmbeddings } from "../gemini/embeddings";
import { PineconeStore } from "@langchain/pinecone";
import { getPineconeIndex, isPineconeConfigured } from "../pinecone";
import { Document } from "langchain/document";
import mammoth from "mammoth";
import * as XLSX from "xlsx";
import { TypeSpreadsheetData, TypeSpreadsheetRow } from "@/types/TypeContent";

// --- Constants ---
const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 1000;

/**
 * A shared helper to process and store document chunks in Pinecone.
 * This function handles splitting, embedding, and storing with retry logic.
 * @private
 */
const _processAndStoreDocuments = async (
  docs: Document[],
  namespace: string,
  apiKey?: string
): Promise<{ numDocs: number }> => {
  if (!docs || docs.length === 0) {
    throw new Error("No processable content found in the document.");
  }

  // 1. Split documents into chunks
  console.log(`Splitting ${docs.length} document(s) into chunks...`);
  const textSplitter = new RecursiveCharacterTextSplitter({
    chunkSize: CHUNK_SIZE,
    chunkOverlap: CHUNK_OVERLAP,
  });
  const chunkedDocs = await textSplitter.splitDocuments(docs);
  console.log(`Document split into ${chunkedDocs.length} chunks.`);

  // 2. Create embeddings
  console.log("Creating Gemini embeddings...");
  const embeddings = await createGeminiEmbeddings({ apiKey });
  if (!embeddings) {
    throw new Error("Failed to create embeddings. Gemini API may not be configured properly.");
  }

  // 3. Store documents in Pinecone with retry logic
  console.log(`Storing chunks in Pinecone with namespace: ${namespace}...`);
  const pineconeIndex = await getPineconeIndex();
  if (!pineconeIndex) {
    throw new Error("Pinecone index is not initialized.");
  }

  let retries = 0;
  while (retries < MAX_RETRIES) {
    try {
      await PineconeStore.fromDocuments(chunkedDocs, embeddings, {
        pineconeIndex,
        namespace,
      });
      console.log("Successfully stored document chunks in Pinecone.");
      return { numDocs: chunkedDocs.length };
    } catch (error) {
      retries++;
      console.error(`Error storing in Pinecone (attempt ${retries}/${MAX_RETRIES}):`, error);
      if (retries >= MAX_RETRIES) {
        throw error; // Re-throw after final attempt
      }
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY_MS));
    }
  }

  throw new Error("Failed to store documents in Pinecone after multiple retries.");
};

/**
 * Extracts text from various document types (Word, Excel, PowerPoint).
 * @private
 */
const _extractTextFromGenericDocument = async (
  fileBlob: Blob,
  documentType: string
): Promise<string> => {
  console.log(`Extracting text from ${documentType}...`);
  const buffer = Buffer.from(await fileBlob.arrayBuffer());

  switch (documentType) {
    case "doc":
    case "docs":
      const docxResult = await mammoth.extractRawText({ buffer });
      return docxResult.value;

    case "sheet":
    case "sheets":
      const workbook = XLSX.read(buffer, { type: "buffer" });
      const textParts: string[] = [];
      workbook.SheetNames.forEach((sheetName) => {
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 }) as TypeSpreadsheetData;
        jsonData.forEach((row: TypeSpreadsheetRow) => {
          if (Array.isArray(row)) {
            const rowText = row.filter(cell => cell != null).map(String).join(" | ");
            if (rowText) textParts.push(rowText);
          }
        });
      });
      return textParts.join("\n");

    case "slides":
      // Basic text extraction for slides. For more advanced parsing, a dedicated library would be needed.
      return buffer.toString("utf8").replace(/[\x00-\x1F\x7F-\x9F]/g, " ").replace(/\s+/g, " ").trim();

    default:
      throw new Error(`Unsupported document type: ${documentType}`);
  }
};

/**
 * Processes a PDF file by extracting its content and storing it as embeddings in Pinecone.
 *
 * @param fileBlob The PDF file blob.
 * @param namespace The unique ID (and Pinecone namespace) for the file.
 * @param apiKey Optional API key for Gemini.
 * @returns A promise that resolves with the outcome of the processing.
 */
export const processPdfDocument = async (
  fileBlob: Blob,
  namespace: string,
  apiKey?: string
): Promise<{ numDocs: number; success: boolean; error?: string }> => {
  console.log(`Starting PDF processing for namespace: ${namespace}`);
  if (!(await isPineconeConfigured())) {
    return { success: false, numDocs: 0, error: "Pinecone is not configured." };
  }

  try {
    console.log("Loading PDF document...");
    const loader = new PDFLoader(fileBlob);
    const docs = await loader.load();

    const { numDocs } = await _processAndStoreDocuments(docs, namespace, apiKey);
    return { numDocs, success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Failed to process PDF for namespace ${namespace}:`, errorMessage);
    return { numDocs: 0, success: false, error: errorMessage };
  }
};

/**
 * Processes a generic document (Word, Excel) by extracting its text and storing embeddings.
 *
 * @param fileBlob The document file blob.
 * @param namespace The unique ID (and Pinecone namespace) for the file.
 * @param documentType The type of the document (e.g., 'docs', 'sheets').
 * @param apiKey Optional API key for Gemini.
 * @returns A promise that resolves with the outcome of the processing.
 */
export const processGenericDocument = async (
  fileBlob: Blob,
  namespace: string,
  documentType: string,
  apiKey?: string
): Promise<{ numDocs: number; success: boolean; error?: string }> => {
  console.log(`Starting ${documentType} processing for namespace: ${namespace}`);
  if (!(await isPineconeConfigured())) {
    return { success: false, numDocs: 0, error: "Pinecone is not configured." };
  }

  try {
    const text = await _extractTextFromGenericDocument(fileBlob, documentType);
    const doc = new Document({
      pageContent: text,
      metadata: { source: namespace, type: documentType },
    });

    const { numDocs } = await _processAndStoreDocuments([doc], namespace, apiKey);
    return { numDocs, success: true };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error(`Failed to process ${documentType} for namespace ${namespace}:`, errorMessage);
    return { numDocs: 0, success: false, error: errorMessage };
  }
};