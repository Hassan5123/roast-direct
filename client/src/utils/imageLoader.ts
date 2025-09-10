/**
 * Helper function to handle product image loading with fallbacks
 */
export const getProductImageUrl = (productId: string): string => {
  // This ensures we use the public URL in production and local path in development
  const baseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || '';
  
  return `${baseUrl}/web-images/product-images/${productId}.jpg`;
};

/**
 * Function to handle image errors with multiple fallback formats
 */
export const handleImageError = (
  e: React.SyntheticEvent<HTMLImageElement, Event>,
  productId: string
): void => {
  const extensions = ['.webp', '.jpeg', '.png'];
  const imgElement = e.currentTarget;
  const baseUrl = process.env.NEXT_PUBLIC_IMAGE_BASE_URL || '';
  
  // Check if already in the fallback process
  const attemptCount = imgElement.getAttribute('data-attempt') || '0';
  const currentAttempt = parseInt(attemptCount, 10);
  
  if (currentAttempt < extensions.length) {
    // Try next extension
    imgElement.setAttribute('data-attempt', (currentAttempt + 1).toString());
    imgElement.src = `${baseUrl}/web-images/product-images/${productId}${extensions[currentAttempt]}`;
  } else {
    // All extensions failed, show text fallback
    imgElement.onerror = null; // prevent further error handling
    imgElement.style.display = 'none';
    
    // Add fallback text display
    if (imgElement.parentElement) {
      imgElement.parentElement.classList.add('flex', 'items-center', 'justify-center');
      const fallback = document.createElement('span');
      fallback.className = 'text-amber-700';
      fallback.textContent = 'No image available';
      imgElement.parentElement.appendChild(fallback);
    }
  }
};
