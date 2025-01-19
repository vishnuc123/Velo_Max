import mongoose from "mongoose";
import prettier from "prettier";
import fs from "fs/promises";
import path from "path";

/**
 * Add dynamic attributes to a Mongoose schema.
 * @param {mongoose.Schema} schema - The schema to modify.
 * @param {Array<string>} attributeKey - List of attribute keys.
 * @param {Array<string>} attributeType - List of attribute types corresponding to attribute keys.
 */
export const addDynamicAttributes = (schema, attributeKey, attributeType) => {
  attributeKey.forEach((key, index) => {
    const type =
      attributeType[index] === "string"
        ? String
        : attributeType[index] === "number"
          ? Number
          : mongoose.Schema.Types.Mixed; // Default to Mixed for unknown types

    schema.add({ [key]: { type, required: false } });
  });
};

/**
 * Format and save content to a specified file.
 * @param {string} content - The content to format and save.
 * @param {string} filePath - The path to save the file.
 */
export const formatAndSaveFile = async (content, filePath) => {
  const formattedContent = await prettier.format(content, { parser: "babel" });
  await fs.writeFile(filePath, formattedContent);
};

/**
 * Construct the schema content for a new model.
 * @param {string} schemaName - The name of the schema.
 * @param {Array<string>} attributeKey - List of attribute keys.
 * @param {Array<string>} attributeType - List of attribute types corresponding to attribute keys.
 * @returns {string} - The schema file content.
 */
export const constructSchemaContent = (schemaName, attributeKey, attributeType) => {
  return `
    import mongoose from 'mongoose';

    // Define the base schema with explicit types
    const ${schemaName}Schema = new mongoose.Schema({
      productName: { type: String, required: true },
      productDescription: { type: String, required: true },
      coverImage: { type: String },
      additionalImage: [{ type: String }],
      RegularPrice: { type: Number, required: true },
      ListingPrice: { type: Number, required: true },
      Stock: { type: Number },
      Brand: { type: String },
      isblocked: { type: Boolean, default: false },
      ${attributeKey
        .map(
          (key, index) =>
            `${key}: { type: ${
              attributeType[index] === "string"
                ? "String"
                : attributeType[index] === "number"
                  ? "Number"
                  : "mongoose.Schema.Types.Mixed"
            }, required: false }`
        )
        .join(",\n")}
    });

    export default ${schemaName}Schema;
  `;
};
