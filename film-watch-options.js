/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

import {LitElement, html, css} from 'lit';

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
export class FilmWatchOptions extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
        border: solid 1px gray;
        padding: 16px;
        max-width: 800px;
      }
    `;
  }

  static get properties() {
    return {
      /**
       * name of the film to show watching options
       */
      filmName: {type: String},

      /**
       * ID for public Google spreadsheet containing film data.
       * - not working ATM - google sheet JSON unreliable
       */
      //sheetId: {type: String},

      /**
       * url for the film
       */
      filmUrl: {type: String},
    };
  }

  constructor() {
    super();
    this.filmName = this.innerHTML;
    this.sheetId = '';
    this.filmUrl = ''

  }

  /**
   * Get the film data from the public Google spreadsheet.
   * Defined by sheetId
   */

  async getFilmData() {
    console.log(`sheet id is ${this.sheetId}`);
    if ( this.sheetId===''){
      return;
    }
//    const SHEET_JSON_URL=`https://spreadsheets.google.com/feeds/list/${this.sheetId}/1/public/values?alt=json`;
    const SHEET_JSON_URL=`http://localhost:8000/dev/cmm17_2215.json`;

    const response = await fetch( SHEET_JSON_URL ); 
    this.filmData = await response.json();

    console.log(this.filmData)

    console.log(`Looking for file name **${this.filmName}** esc **${this.filmNameEsc}`);
    if ( this.filmNameEsc in this.filmData ){
      console.log(`Does it contain URL for ${this.filmName} as ${this.filmData[this.filmNameEsc].url}`);
      this.filmUrl = this.filmData[this.filmNameEsc].url;
      console.log("it's in there" );
    } else {
      console.log(`sorry but it's not there`);
    } 
  }

  render() {
    this.filmNameEsc = this.filmName.trim();
    this.getFilmData();

    if (this.sheetId==='' && this.filmUrl==='') {
      console.error("<film-watch-options> Error: no Google spreadsheet or filmUrl defined");
    }
    if (this.filmName === '') {
      console.error("<film-watch-options> Error: no film name provided");
      return html` 
      <div class="filmWatchingOptions">
      <div class="filmWatchingOptionsImage">
          <img src="https://filebucketdave.s3.amazonaws.com/banner.js/images/icons8-movie-beginning-64.png" alt="Film Watching icon" \>
      </div>
      <div class="instructions">
         <p>No film name found</p>
       </div>
    </div>
      `;
    }

    // if there is a filmUrl just display a link to it
    if ( this.filmUrl !=='' ){
      return html`
      <div class="filmWatchingOptions">
      <div class="filmWatchingOptionsImage">
          <img src="https://filebucketdave.s3.amazonaws.com/banner.js/images/icons8-movie-beginning-64.png" alt="Film Watching icon" \>
      </div>
      <div class="instructions">
         <p>Watch <a href="{$this.filmUrl}"><em>${this.filmName}</em> here</a>.</p>
       </div>
    </div>`;
    }

    return html`
      <div class="filmWatchingOptions">
      <div class="filmWatchingOptionsImage">
          <img src="https://filebucketdave.s3.amazonaws.com/banner.js/images/icons8-movie-beginning-64.png" alt="Film Watching icon" \>
      </div>
      <div class="instructions">
         <p>We've been unable to provide a copy <em>${this.filmName}</em>.</p>
         <p><a href="https://www.justwatch.com/au/search?q=${this.filmNameEsc}" target="_blank">This search on JustWatch</a> may provide pointers to where you can find it online.</p>
         <p>${this.filmData}</p>
       </div>
    </div>`;
  }

}

window.customElements.define('film-watch-options', FilmWatchOptions);
