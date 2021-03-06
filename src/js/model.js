import { async } from 'regenerator-runtime';
import { API_URL, RESULT_PER_PAGE, KEY } from './config.js';
// import { getJSON, sendJSON } from './helpers.js';
import { AJAX } from './helpers.js';

export const state = {
    recipe: {},
    search: {
        query: '',
        results: [],
        sortResults: [],
        page: 1,
        resultsPerPage: RESULT_PER_PAGE,
    },
    bookmarks: [],
};

const createRecipeObject = function(data) {
    const {recipe} = data.data
    return {
      id: recipe.id,
      title: recipe.title,
      publisher: recipe.publisher,
      sourceUrl: recipe.source_url,
      imageUrl: recipe.image_url,
      servings: recipe.servings,
      cookingTime: recipe.cooking_time,
      ingredients: recipe.ingredients,
      ...(recipe.key && {key: recipe.key}),
    };
};

export const loadRecipe = async function(id) {
    try {
        const data = await AJAX(`${API_URL}/${id}?key=${KEY}`);
    
        state.recipe = createRecipeObject(data)
        
        if (state.bookmarks.some(bookmark => bookmark.id === id))
            state.recipe.bookmarked = true;
        else state.recipe.bookmarked = false;

    } catch (err) {
        console.error(`${err} 🤦‍♀️`)
        throw err
    }
};

export const loadSearchResults = async function(query) {
    try {
        state.search.query = query;
        
        const data = await AJAX(`${API_URL}?search=${query}&key=${KEY}`)
        
        state.search.results = data.data.recipes.map(recipe => {
            return {
                id: recipe.id,
                title: recipe.title,
                publisher: recipe.publisher,
                imageUrl: recipe.image_url,
                ...(recipe.key && {key: recipe.key}),
              }
        })
        state.search.sortResults = state.search.results
        state.search.page = 1
    } catch (err) {
        console.error(`${err} 🤦‍♀️`)
        throw err
    }
};

export const getSearchResultPage = function(page = state.search.page) {
    state.search.page = page
    let start = (page - 1) * state.search.resultsPerPage;
    let end = page * state.search.resultsPerPage

    return state.search.sortResults.slice(start, end)
};

export const updateServings = function(newServings) {
    state.recipe.ingredients.forEach(ing => {
       ing.quantity = ing.quantity * newServings / state.recipe.servings 
    });
    state.recipe.servings = newServings;
};

const persistBookmarks = function() {
    localStorage.setItem('bookmarks', JSON.stringify(state.bookmarks))
}

export const addBookmark = function(recipe) {
    // Add bookmark
    state.bookmarks.push(recipe);

    // Mark current recipe as bookmarked
    if(recipe.id === state.recipe.id) { state.recipe.bookmarked = true };

    persistBookmarks();
};

export const deleteBookmark = function(id) {
    // Delete bookmark
    const index = state.bookmarks.findIndex(el => el.id === id);
    state.bookmarks.splice(index, 1);

    // Mark current recipe as NOT bookmarked
    if(id === state.recipe.id) { state.recipe.bookmarked = false };

    persistBookmarks();
};

const init = function() {
    const storage = localStorage.getItem('bookmarks')
    if (storage) state.bookmarks = JSON.parse(storage)
};

init();

const clearBookmarks = function() {
    localStorage.clear('bookmarks')
};

export const uploadRecipe = async function(newRecipe) {
    try {
        const ingredients = Object.entries(newRecipe)
        .filter(entry => entry[0].startsWith('ingredient') && entry[1] !== '')
        .map(ing => {
            const ingArr = ing[1].split(',').map(el => el.trim())
            if (ingArr.length !== 3) throw new Error('Wrong format! Please type angain.')
            const [quantity, unit, description] = ingArr
            return {quantity: quantity ? +quantity : null, unit, description}
        });

        const recipe = {
            title: newRecipe.title,
            publisher: newRecipe.publisher,
            source_url: newRecipe.sourceUrl,
            image_url: newRecipe.image,
            cooking_time: +newRecipe.cookingTime,
            servings: +newRecipe.servings,
            ingredients,
        }

        console.log(newRecipe);
        console.log(recipe);

        const data = await AJAX(`${API_URL}?key=${KEY}`, recipe);
        state.recipe = createRecipeObject(data);
        addBookmark(state.recipe);
    } catch (err) {
        throw err
    }   
}

export const sortSearchResults = function(sort) {
    const {results} = state.search
    // const temp = results.map((data, i) =>{ return {i, title: data.title.toLowerCase()}})
    const sortResults = sort ? results
        .map((data, i) =>{ return {i, title: data.title.toLowerCase()}})
        .sort((a, b) => {
            if (a.title > b.title) return 1
            if (a.title < b.title) return -1
            else return 0;
        })
        .map(temp => results[temp.i])
        : results

    state.search.sortResults = sortResults
    state.search.page = 1
}