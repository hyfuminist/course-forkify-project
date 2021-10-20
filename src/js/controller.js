import 'core-js/stable';
import 'regenerator-runtime/runtime';

import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultView from './views/resultView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';

import { MODAL_CLOSE_SEC } from './config.js';

if (module.hot) {
  module.hot.accept();
}
// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

console.log('START')

const controlRecipe = async function(){
  try {
    const id = window.location.hash.slice(1);
    if(!id) return
    recipeView.renderSpinner();
    
    // 0) Update results view to mark selected search result
    resultView.update(model.getSearchResultPage());

    // 1) Updating bookmarks view
    bookmarksView.update(model.state.bookmarks);
    
    // 2) Loading recipe
    await model.loadRecipe(id);
    const { recipe } = model.state
    
    // 3) Rendering recipe
    recipeView.render(recipe);

  } catch (err) {
    recipeView.renderError();
  }
};

// window.addEventListener('hashchange',ControlRecipe)
// window.addEventListener('load',ControlRecipe)

const controlSearchResults = async function() {
  try {
    resultView.renderSpinner();

    // 1) Get search query
    const query = searchView.getQuery();
    if (!query) return;

    // 2) Load search results
    await model.loadSearchResults(query);

    // 3) Render results
    resultView.render(model.getSearchResultPage());
    // resultView.render(model.state.search.results)

    // 4) Render initial pagination button
    paginationView.render(model.state.search);

  } catch (err) {
    console.error(err)
  }
};

const controlPagination = function(goToPage) {
  // 1) Render new results
  resultView.render(model.getSearchResultPage(goToPage))
  // 2) Render New pagination button
  paginationView.render(model.state.search);
};

const controlServings = function(newServings) {
  // Update the recipe servings (in state)
  model.updateServings(newServings);
  // Update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function() {
  // 1) Add/remove bookmark
  if (!model.state.recipe.bookmarked) {model.addBookmark(model.state.recipe)}
  else {model.deleteBookmark(model.state.recipe.id)};
   
  // 2) Update recipe view
  recipeView.update(model.state.recipe);

  // 3) Render bookmarks list
  bookmarksView.render(model.state.bookmarks)
}

const controlBookmarks = function() {
  bookmarksView.render(model.state.bookmarks)
}

const controlAddRecipe = async function(newRecipe) {
  try {
    // Show loading spinner
    addRecipeView.renderSpinner();

    // Upload the new recipe data
    await model.uploadRecipe(newRecipe);

    // Render recipe
    recipeView.render(model.state.recipe);

    // Success Message
    addRecipeView.renderMessage();

    // Render bookmark view
    bookmarksView.render(model.state.bookmarks)

    // Change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // Close form window
    setTimeout(addRecipeView.toggleWindow(), MODAL_CLOSE_SEC * 1000);

  } catch (err) {
    console.error(`${err} 🤦‍♀️`)
    addRecipeView.renderError(err.message)
  } 
}

const controlSortResults = function(sort) {
  // 1) Sort results
  model.sortSearchResults(sort)
  // 2) Render new results
  resultView.render(model.getSearchResultPage())
  // 3) Render New pagination button
  paginationView.render(model.state.search);
}

const init = function() {
  recipeView.addHandlerRender(controlRecipe);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  bookmarksView.addHandlerRender(controlBookmarks);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  resultView.addHandlerSort(controlSortResults);
};

init()