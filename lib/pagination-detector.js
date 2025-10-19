/**
 * PaginationDetector - Intelligent pagination detection for auto-pagination
 * Detects various types of pagination: next buttons, numbered pages, infinite scroll
 * 
 * @version 1.0.0
 */

class PaginationDetector {
  constructor() {
    this.nextPagePatterns = {
      // Text patterns for "next" buttons/links (multi-language)
      textPatterns: [
        /next\s*(page)?/i,
        /siguiente/i,  // Spanish
        /suivant/i,    // French
        /weiter/i,     // German
        /次へ|次のページ/i,  // Japanese
        /다음/i,       // Korean
        /下一页|下一頁/i,  // Chinese
        /próxima/i,    // Portuguese
        /volgende/i,   // Dutch
        /nästa/i,      // Swedish
        /følgende/i,   // Norwegian/Danish
        /→|›|»|⟩|⇨|➔|➜|➡/,  // Arrow symbols
      ],
      
      // Class/ID patterns
      classIdPatterns: [
        /next/i,
        /pagination.*next/i,
        /nav.*next/i,
        /forward/i,
        /arrow.*right/i,
        /chevron.*right/i,
      ],
      
      // Rel attribute patterns
      relPatterns: ['next', 'nofollow next'],
      
      // ARIA label patterns
      ariaPatterns: [
        /next/i,
        /go to next/i,
        /navigate to next/i,
      ],
    };
    
    this.paginationSelectors = [
      // Common pagination container selectors
      '.pagination',
      '.pager',
      '.page-navigation',
      '.nav-links',
      '[role="navigation"]',
      'nav',
      '.paginator',
      '.page-numbers',
      '.wp-pagenavi', // WordPress
      '.pagination-wrapper',
    ];
    
    this.infiniteScrollPatterns = [
      'load more',
      'show more',
      'see more',
      'view more',
      'cargar más',  // Spanish
      'charger plus', // French
      'mehr laden',   // German
      'もっと見る',    // Japanese
      '더 보기',      // Korean
      '加载更多',     // Chinese
    ];
  }

  /**
   * Find the next page link/button
   * @returns {Object|null} { element, url, type } or null
   */
  findNextPage() {
    const methods = [
      () => this.findByRelAttribute(),
      () => this.findByTextContent(),
      () => this.findByClassId(),
      () => this.findByAriaLabel(),
      () => this.findNumberedPagination(),
      () => this.findInfiniteScrollButton(),
    ];

    for (const method of methods) {
      const result = method();
      if (result) {
        return result;
      }
    }

    return null;
  }

  /**
   * Find next page by rel="next" attribute (most reliable)
   */
  findByRelAttribute() {
    for (const relValue of this.nextPagePatterns.relPatterns) {
      const link = document.querySelector(`a[rel="${relValue}"], link[rel="${relValue}"]`);
      if (link && this.isValidNextPageElement(link)) {
        return {
          element: link,
          url: link.href,
          type: 'rel-attribute',
          confidence: 1.0
        };
      }
    }
    return null;
  }

  /**
   * Find next page by text content
   */
  findByTextContent() {
    const links = Array.from(document.querySelectorAll('a[href], button[onclick], button[data-href]'));
    
    for (const link of links) {
      const text = this.getElementText(link);
      
      for (const pattern of this.nextPagePatterns.textPatterns) {
        if (pattern.test(text)) {
          const url = this.getElementUrl(link);
          if (this.isValidNextPageElement(link)) {
            return {
              element: link,
              url: url || null,
              type: 'text-content',
              confidence: 0.9,
              clickOnly: !url
            };
          }
        }
      }
    }
    return null;
  }

  /**
   * Find next page by class/id attributes
   */
  findByClassId() {
    for (const pattern of this.nextPagePatterns.classIdPatterns) {
      const elements = Array.from(document.querySelectorAll('a[href], button[onclick], button[data-href]'));
      
      for (const element of elements) {
        const classId = `${element.className} ${element.id}`;
        
        if (pattern.test(classId)) {
          const url = this.getElementUrl(element);
          if (this.isValidNextPageElement(element)) {
            return {
              element: element,
              url: url || null,
              type: 'class-id',
              confidence: 0.8,
              clickOnly: !url
            };
          }
        }
      }
    }
    return null;
  }

  /**
   * Find next page by ARIA label
   */
  findByAriaLabel() {
    const elements = Array.from(document.querySelectorAll('[aria-label], [aria-labelledby]'));
    
    for (const element of elements) {
      const ariaLabel = element.getAttribute('aria-label') || '';
      const ariaLabelledBy = element.getAttribute('aria-labelledby');
      let labelText = ariaLabel;
      
      if (ariaLabelledBy) {
        const labelElement = document.getElementById(ariaLabelledBy);
        labelText += ' ' + (labelElement ? labelElement.textContent : '');
      }
      
      for (const pattern of this.nextPagePatterns.ariaPatterns) {
        if (pattern.test(labelText)) {
          const url = this.getElementUrl(element);
          if (this.isValidNextPageElement(element)) {
            return {
              element: element,
              url: url || null,
              type: 'aria-label',
              confidence: 0.85,
              clickOnly: !url
            };
          }
        }
      }
    }
    return null;
  }

  /**
   * Find numbered pagination (e.g., "1 2 3 [4] 5" where 5 is next)
   */
  findNumberedPagination() {
    for (const selector of this.paginationSelectors) {
      const container = document.querySelector(selector);
      if (!container) continue;

      const links = Array.from(container.querySelectorAll('a[href]'));
      const currentPageIndex = links.findIndex(link => {
        return link.classList.contains('current') ||
               link.classList.contains('active') ||
               link.getAttribute('aria-current') === 'page' ||
               link.hasAttribute('disabled');
      });

      if (currentPageIndex >= 0 && currentPageIndex < links.length - 1) {
        const nextLink = links[currentPageIndex + 1];
        const nextText = this.getElementText(nextLink);
        
        // Verify it's actually a number or valid next indicator
        if (/^\d+$/.test(nextText) || /next|›|→|»/i.test(nextText)) {
          return {
            element: nextLink,
            url: nextLink.href,
            type: 'numbered-pagination',
            confidence: 0.95
          };
        }
      }
    }
    return null;
  }

  /**
   * Find infinite scroll / "Load More" button
   */
  findInfiniteScrollButton() {
    const buttons = Array.from(document.querySelectorAll('button, a[href], [role="button"]'));
    
    for (const button of buttons) {
      const text = this.getElementText(button).toLowerCase();
      
      for (const pattern of this.infiniteScrollPatterns) {
        if (text.includes(pattern.toLowerCase())) {
          const url = this.getElementUrl(button);
          return {
            element: button,
            url: url || window.location.href, // Use current URL for AJAX loads
            type: 'infinite-scroll',
            confidence: 0.7,
            isLoadMore: true
          };
        }
      }
    }
    return null;
  }

  /**
   * Get text content of element (including children)
   */
  getElementText(element) {
    if (!element) return '';
    
    // Check direct text
    let text = element.textContent || element.innerText || '';
    
    // Check title/alt attributes
    text += ' ' + (element.getAttribute('title') || '');
    text += ' ' + (element.getAttribute('alt') || '');
    text += ' ' + (element.getAttribute('value') || '');
    
    return text.trim();
  }

  /**
   * Get URL from element
   */
  getElementUrl(element) {
    if (!element) return null;
    
    // Try href first
    if (element.href) return element.href;
    
    // Try data attributes
    const dataHref = element.getAttribute('data-href') ||
                    element.getAttribute('data-url') ||
                    element.getAttribute('data-link');
    if (dataHref) return dataHref;
    
    // Try onclick for javascript navigation
    const onclick = element.getAttribute('onclick');
    if (onclick) {
      const urlMatch = onclick.match(/(?:location\.href|window\.location)\s*=\s*['"]([^'"]+)['"]/);
      if (urlMatch) return urlMatch[1];
    }
    
    return null;
  }

  /**
   * Validate if element is likely a next page link
   */
  isValidNextPageElement(element) {
    if (!element) return false;
    
    // Element should be visible
    const rect = element.getBoundingClientRect();
    const style = window.getComputedStyle(element);
    
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
      return false;
    }
    
    // Should have some dimensions (not collapsed)
    if (rect.width === 0 && rect.height === 0) {
      return false;
    }
    
    // Should not be disabled
    if (element.disabled || element.getAttribute('disabled') === 'true') {
      return false;
    }
    
    return true;
  }

  /**
   * Check if infinite scroll is detected on the page
   */
  detectInfiniteScroll() {
    // Check for common infinite scroll indicators
    const indicators = [
      document.querySelector('[data-infinite-scroll]'),
      document.querySelector('.infinite-scroll'),
      document.querySelector('[data-auto-pager]'),
    ];
    
    return indicators.some(el => el !== null);
  }

  /**
   * Simulate clicking/navigating to next page
   * @param {Object} nextPageInfo - Result from findNextPage()
   * @returns {Promise<boolean>} Success status
   */
  async navigateToNextPage(nextPageInfo) {
    if (!nextPageInfo || !nextPageInfo.element) return false;
    
    try {
      const element = nextPageInfo.element;
      
      // For load more buttons, trigger click
      if (nextPageInfo.isLoadMore) {
        element.click();
        // Wait for content to load
        await this.waitForNewContent();
        return true;
      }
      
      // For regular navigation, navigate to URL
      if (nextPageInfo.url) {
        window.location.href = nextPageInfo.url;
        return true;
      }
      
      // Fallback: clickable next element without URL (SPA routers)
      if (element) {
        element.click();
        await this.waitForNewContent();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error navigating to next page:', error);
      return false;
    }
  }

  /**
   * Wait for new content after AJAX load
   */
  async waitForNewContent(maxWait = 5000) {
    const startTime = Date.now();
    const initialHeight = document.body.scrollHeight;
    
    return new Promise((resolve) => {
      const checkInterval = setInterval(() => {
        const currentHeight = document.body.scrollHeight;
        const elapsed = Date.now() - startTime;
        
        if (currentHeight > initialHeight) {
          clearInterval(checkInterval);
          resolve(true);
        } else if (elapsed >= maxWait) {
          clearInterval(checkInterval);
          resolve(false);
        }
      }, 100);
    });
  }

  /**
   * Get pagination info (current page, total pages if available)
   */
  getPaginationInfo() {
    const info = {
      currentPage: 1,
      totalPages: null,
      hasNext: false,
      hasPrevious: false
    };

    // Try to find current page number
    const currentPageEl = document.querySelector('.current, .active, [aria-current="page"]');
    if (currentPageEl) {
      const pageNum = parseInt(this.getElementText(currentPageEl));
      if (!isNaN(pageNum)) {
        info.currentPage = pageNum;
      }
    }

    // Try to find total pages
    const pageLinks = Array.from(document.querySelectorAll('.pagination a, .pager a, .page-numbers a'));
    const pageNumbers = pageLinks
      .map(link => parseInt(this.getElementText(link)))
      .filter(num => !isNaN(num));
    
    if (pageNumbers.length > 0) {
      info.totalPages = Math.max(...pageNumbers);
    }

    // Check for next/previous
    info.hasNext = !!this.findNextPage();
    info.hasPrevious = !!document.querySelector('a[rel="prev"], .prev, .previous');

    return info;
  }
}

// Make available globally
if (typeof window !== 'undefined') {
  window.PaginationDetector = PaginationDetector;
  
  if (!window.__ST) {
    window.__ST = {};
  }
  window.__ST.PaginationDetector = PaginationDetector;
  
  console.log('✅ PaginationDetector loaded and available');
}

// CommonJS export for Node.js/testing environments
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PaginationDetector;
}
