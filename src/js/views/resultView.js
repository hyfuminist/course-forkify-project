import View from './view.js'
import previewView from './previewView.js'
import icons from 'url:../../img/icons.svg';

class ResultView extends View {
    _parentElement = document.querySelector('.results');
    _btnSort = document.querySelector('.btn--sort');

    _errorMessage = 'We could not find that. Please try another one!'
    _successMessage = ''
    // sort = false

    /**
     * 
     * @returns
     * @todo Fix the results view and find out the usage of function below 
     */
    addHandlerSort(handler, sort = false) {
        this._btnSort.addEventListener('click', function(event) {
            event.preventDefault()
            handler(!sort)
            sort = !sort;
        })
    }
    
    _generateMarkup() {
        return this._data
        .map(result => previewView.render(result, false))
        .join('')
    }

    // _generateMarkupPreview(result) {
    //     const id = window.location.hash.slice(1);
    //     return `
    //         <li class="preview">
    //             <a class="preview__link ${result.id === id ? 'preview__link--active' : ''}" href="#${result.id}">
    //                 <figure class="preview__fig">
    //                     <img src="${result.imageUrl}" alt="${result.title}" />
    //                 </figure>
    //                 <div class="preview__data">
    //                     <h4 class="preview__title">${result.title}</h4>
    //                     <p class="preview__publisher">${result.publisher}</p>   
    //                 </div>
    //             </a>
    //         </li>
    //     `
    // }
}

export default new ResultView()