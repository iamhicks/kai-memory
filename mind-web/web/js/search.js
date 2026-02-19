/**
 * MIND Search Module
 * Handles search across notes, projects, and decisions
 */

// Search state
const searchState = {
  query: '',
  results: [],
  isSearching: false,
  filters: {
    notes: true,
    projects: true,
    decisions: true
  }
};

/**
 * Initialize search module
 */
function initSearch() {
  setupSearchInput();
  setupSearchFilters();
}

/**
 * Set up search input
 */
function setupSearchInput() {
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  
  if (searchInput) {
    // Search on Enter
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        performSearch();
      }
    });
    
    // Debounced search on input (optional - for live search)
    let debounceTimer;
    searchInput.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        if (searchInput.value.length >= 3) {
          performSearch();
        }
      }, 500);
    });
  }
  
  if (searchBtn) {
    searchBtn.addEventListener('click', performSearch);
  }
}

/**
 * Set up search filters
 */
function setupSearchFilters() {
  const notesFilter = document.getElementById('searchNotes');
  const projectsFilter = document.getElementById('searchProjects');
  const decisionsFilter = document.getElementById('searchDecisions');
  
  if (notesFilter) {
    notesFilter.addEventListener('change', (e) => {
      searchState.filters.notes = e.target.checked;
      if (searchState.query) performSearch();
    });
  }
  
  if (projectsFilter) {
    projectsFilter.addEventListener('change', (e) => {
      searchState.filters.projects = e.target.checked;
      if (searchState.query) performSearch();
    });
  }
  
  if (decisionsFilter) {
    decisionsFilter.addEventListener('change', (e) => {
      searchState.filters.decisions = e.target.checked;
      if (searchState.query) performSearch();
    });
  }
}

/**
 * Perform search
 */
async function performSearch() {
  const searchInput = document.getElementById('searchInput');
  const resultsContainer = document.getElementById('searchResults');
  
  if (!searchInput || !resultsContainer) return;
  
  const query = searchInput.value.trim();
  if (!query) return;
  
  searchState.query = query;
  searchState.isSearching = true;
  
  // Show loading state
  resultsContainer.innerHTML = `
    <div class="loading">
      <div class="loading-spinner"></div>
    </div>
  `;
  
  try {
    const { results } = await api.search(query);
    
    // Filter results based on checkboxes
    searchState.results = results.filter(item => {
      const type = item.resultType;
      if (type === 'note' && !searchState.filters.notes) return false;
      if (type === 'project' && !searchState.filters.projects) return false;
      if (type === 'decision' && !searchState.filters.decisions) return false;
      return true;
    });
    
    renderSearchResults();
  } catch (error) {
    console.error('Search error:', error);
    resultsContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">⚠️</div>
        <div class="empty-state-title">Search failed</div>
        <div class="empty-state-text">Please check your connection and try again.</div>
      </div>
    `;
  } finally {
    searchState.isSearching = false;
  }
}

/**
 * Render search results
 */
function renderSearchResults() {
  const resultsContainer = document.getElementById('searchResults');
  if (!resultsContainer) return;
  
  if (searchState.results.length === 0) {
    resultsContainer.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">🔍</div>
        <div class="empty-state-title">No results found</div>
        <div class="empty-state-text">Try adjusting your search terms or filters.</div>
      </div>
    `;
    return;
  }
  
  resultsContainer.innerHTML = searchState.results.map(result => {
    const type = result.resultType;
    const title = result.title || result.name || 'Untitled';
    const preview = getResultPreview(result);
    
    return `
      <div class="search-result-item" onclick="viewSearchResult('${type}', '${result.id}')">
        <span class="search-result-type ${type}">${type}</span>
        <div class="search-result-title">${escapeHtml(title)}</div>
        <div class="search-result-preview">${escapeHtml(preview)}</div>
      </div>
    `;
  }).join('');
}

/**
 * Get preview text for a result
 */
function getResultPreview(result) {
  const type = result.resultType;
  
  switch (type) {
    case 'note':
      return result.content?.substring(0, 200) || 'No content';
    
    case 'project':
      return result.description || `Status: ${result.status || 'active'}`;
    
    case 'decision':
      return result.context || result.rationale || 'No details available';
    
    default:
      return '';
  }
}

/**
 * View a search result
 */
function viewSearchResult(type, id) {
  switch (type) {
    case 'project':
      navigateTo('projects');
      // Try to find and view the project
      setTimeout(() => {
        const project = projectsState?.projects?.find(p => p.id === id);
        if (project) viewProject(id);
      }, 100);
      break;
    
    case 'note':
      // Could navigate to a notes view if implemented
      showNotification('Note viewing not yet implemented', 'info');
      break;
    
    case 'decision':
      showNotification('Decision viewing not yet implemented', 'info');
      break;
    
    default:
      console.log('Unknown result type:', type);
  }
}

/**
 * Clear search
 */
function clearSearch() {
  const searchInput = document.getElementById('searchInput');
  const resultsContainer = document.getElementById('searchResults');
  
  if (searchInput) searchInput.value = '';
  
  if (resultsContainer) {
    resultsContainer.innerHTML = `
      <p class="search-hint">Enter a search query to find information</p>
    `;
  }
  
  searchState.query = '';
  searchState.results = [];
}

/**
 * Escape HTML
 */
function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initSearch);

// Make functions available globally
window.performSearch = performSearch;
window.clearSearch = clearSearch;
window.viewSearchResult = viewSearchResult;
window.searchState = searchState;
