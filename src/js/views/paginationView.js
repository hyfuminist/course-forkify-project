import View from './view.js'
import icons from 'url:../../img/icons.svg';

class PaginationView extends View {
    _parentElement = document.querySelector('.pagination');

    addHandlerClick(handler) {
        this._parentElement.addEventListener('click', function(event) {
            const btn = event.target.closest('.btn--inline')
            if(!btn) return;
            const goToPage = +btn.dataset.goto
            handler(goToPage)
        })
    }

    _generateMarkup() {
        const curPage = this._data.page;
        const numPages = Math.ceil( this._data.results.length / this._data.resultsPerPage )

        // On page 1, and there are other pages
        if (curPage === 1 && numPages > 1) {
            return `<span class="page--cur pagination__cur">Page ${curPage}</span>
                    ${this._generateMarkupBtnNext(curPage)}
                `
        }
        // On Last page
        if (curPage === numPages && numPages > 1) {
            return `${this._generateMarkupBtnPre(curPage)}
            <span class="page--cur pagination__cur">Page ${curPage}</span>`
        }    
        // On Other page
        if (curPage < numPages) {
            return `
                ${this._generateMarkupBtnPre(curPage)}
                <span class="page--cur pagination__cur">Page ${curPage}</span>
                ${this._generateMarkupBtnNext(curPage)}
            `
        }
        // On page 1, and there are NO other pages
        return ''
    }

    _generateMarkupBtnNext(page) {
        return `
                <button class="btn--inline pagination__btn--next" data-goto="${page + 1}">
                    <span>Page ${page + 1}</span>
                    <svg class="search__icon">
                        <use href="${icons}#icon-arrow-right"></use>
                    </svg>
                </button>
                
            `
    }
//<div class="page--cur pagination__cur">Page ${page}</div>
    _generateMarkupBtnPre(page) {
        return `
                <button class="btn--inline pagination__btn--prev" data-goto="${page - 1}">
                    <svg class="search__icon">
                        <use href="${icons}#icon-arrow-left"></use>
                    </svg>
                    <span>Page ${page - 1}</span>
                </button>
            `
    }
}

export default new PaginationView();