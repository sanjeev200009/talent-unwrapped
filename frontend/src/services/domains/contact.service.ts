/**
 * Contact Service - Domain-specific API calls for contact form submissions
 * Uses the centralized HTTP client for all API requests
 */

import { apiClient, API_CONFIG } from "../api";
import type { ContactFormData } from "../../types";

/**
 * Submit a contact form
 */
export const submitContactForm = async (
  data: ContactFormData,
): Promise<{ success: boolean; message?: string }> => {
  try {
    const response = await apiClient.post<{
      success: boolean;
      message?: string;
    }>(API_CONFIG.ENDPOINTS.CONTACT_SUBMIT, data);

    return response || { success: false, message: "Unknown error" };
  } catch (error) {
    console.error("Error submitting contact form:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Failed to submit form",
    };
  }
};

/**
 * Get all contact submissions (admin only - for future admin panel)
 */
export const getContactSubmissions = async (): Promise<any[]> => {
  try {
    const data = await apiClient.get<any[]>(API_CONFIG.ENDPOINTS.CONTACT_LIST);
    return data || [];
  } catch (error) {
    console.error("Error fetching contact submissions:", error);
    return [];
  }
};

/**
 * Delete a contact submission by ID (admin only)
 */
export const deleteContactSubmission = async (
  id: string | number,
): Promise<boolean> => {
  try {
    await apiClient.delete(`${API_CONFIG.ENDPOINTS.CONTACT_LIST}/${id}`);
    return true;
  } catch (error) {
    console.error(`Error deleting contact submission ${id}:`, error);
    return false;
  }
};

/**
 * Contact service object (for backward compatibility)
 */
export const contactService = {
  submitContactForm,
  getContactSubmissions,
  deleteContactSubmission,
};
