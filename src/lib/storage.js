import { superAdminAPI } from './api';

/**
 * Storage service for uploading documents and files
 */
export const storageService = {
  /**
   * Upload a document file
   * @param {File} file - The file to upload
   * @param {string} clubId - The club ID
   * @param {string} folder - The folder/path in storage (e.g., 'staff-kyc', 'player-documents')
   * @returns {Promise<string>} The public URL of the uploaded file
   */
  uploadDocument: async (file, clubId, folder = 'documents') => {
    try {
      // Generate a unique filename
      const timestamp = Date.now();
      const randomStr = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.name.split('.').pop();
      const filename = `${folder}/${clubId}/${timestamp}-${randomStr}.${fileExtension}`;

      // Use the push notification upload URL pattern (supports various file types)
      // isVideo = false means it's a document/image
      const isVideo = file.type?.startsWith('video/') || false;
      const { signedUrl, publicUrl } = await superAdminAPI.createPushNotificationUploadUrl(
        clubId,
        filename,
        isVideo
      );

      // Upload file to signed URL
      await superAdminAPI.uploadToSignedUrl(signedUrl, file);

      return publicUrl;
    } catch (error) {
      console.error('Storage upload error:', error);
      throw new Error(`Failed to upload document: ${error.message || 'Unknown error'}`);
    }
  },

  /**
   * Upload a file with a custom endpoint
   * @param {File} file - The file to upload
   * @param {string} clubId - The club ID
   * @param {string} endpoint - Custom upload endpoint
   * @returns {Promise<string>} The public URL of the uploaded file
   */
  uploadFile: async (file, clubId, endpoint) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('name', file.name);

      const response = await fetch(
        `${process.env.REACT_APP_API_BASE_URL || 'http://localhost:3333/api'}${endpoint}`,
        {
          method: 'POST',
          headers: {
            'x-club-id': clubId,
          },
          body: formData,
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to upload file');
      }

      const data = await response.json();
      return data.url || data.publicUrl || data.documentUrl;
    } catch (error) {
      console.error('File upload error:', error);
      throw new Error(`Failed to upload file: ${error.message || 'Unknown error'}`);
    }
  },
};

