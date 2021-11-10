/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */

//import {LitElement, html, css} from 'lit';
import {LitElement, html, css} from 'https://jspm.dev/lit-element@2.4.0';

/**
 * An example element.
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */

export const isValidUrl = (url) => {
  try {
    new URL(url);
  } catch (e) {
    console.error(e);
    return false;
  }
  return true;
};

export class FilmWatchOptions extends LitElement {
  static get styles() {
    return css`
      :host {
        display: block;
        border: solid 1px gray;
        padding: 16px;
        max-width: 800px;
      }

      .filmWatchingOptions  { 
        box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23) !important; 
        display: flex; 
        flex-direction: row; 
        flex-wrap: wrap;
        margin: 1em 0;
        margin-left: auto;
        margin-right: auto;
        width: 95%; 
        border-radius: 1em;
        padding: 1em;
      } 

      .filmWatchingOptionsImage {
        max-width: 100%;
        max-height: 100%;
      }

      .instructions {
        flex: 6;
        margin-left: 1em;
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
       * URL for JSON file
       */
      jsonUrl: {type: String},

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
    this.jsonUrl = '';
    this.filmUrl = '';
  }

  /**
   * Get the film data from the public Google spreadsheet.
   * Defined by sheetId
   */

  async getFilmData() {
    //    console.log('------------ getFilmData');
    //    console.log(`jsonURl is ${this.jsonUrl}`);

    if (this.jsonUrl !== '' && !isValidUrl(this.jsonUrl)) {
      console.error(`Invalid jsonURL ${this.jsonUrl}`);
      return false;
    }
    //    const SHEET_JSON_URL=`https://spreadsheets.google.com/feeds/list/${this.sheetId}/1/public/values?alt=json`;
    //    const SHEET_JSON_URL=`http://localhost:8000/dev/cmm17_2215.json`;

    const response = await fetch(this.jsonUrl);
    this.filmData = await response.json();

    //    console.log(this.filmData);

    /*    console.log(
      `Looking for file name **${this.filmName}** esc **${this.filmNameEsc}`
    );*/
    if (this.filmNameEsc in this.filmData) {
      this.filmUrl = this.filmData[this.filmNameEsc].url;
    }
  }

  render() {
    this.filmNameEsc = this.filmName.trim();

    // only get data, if there's something to get (sheetId/jsonURL)
    // or data needed i.e. nothing in filmUrl
    if (this.sheetId === '' && this.filmUrl === '' && this.jsonUrl === '') {
      console.error(
        '<film-watch-options> Error: no Google spreadsheet or filmUrl defined'
      );
    } else {
      this.getFilmData();
    }

    const view = new filmViewFactory(this);

    return view;
  }
}

//------------------------------------------------------
// filmViewFactory

class filmViewFactory {
  // takes the component model
  constructor(filmModel) {
    this.film = filmModel;
    console.log('constructed view');

    // check if there are any errors with the model
    if (this.modelErrors()) {
      return this.error;
    }

    // return the correct HTML
    return this.render();
  }

  /**
   * check model for errors
   */

  modelErrors() {
    // No filmname - fail
    if (this.film.filmName === '') {
      console.error('<film-watch-options> Error: no film name provided');
      this.error = html`
        <div class="filmWatchingOptions">
          <div class="filmWatchingOptionsImage">
            <img
              src="https://filebucketdave.s3.amazonaws.com/banner.js/images/icons8-movie-beginning-64.png"
              alt="Film Watching icon"
            />
          </div>
          <div class="instructions">
            <p>No film name found</p>
          </div>
        </div>
      `;
      return true;
    }

    // oop, no info
    if (this.film.filmUrl === '') {
      this.error = html` <div class="filmWatchingOptions">
        <div class="filmWatchingOptionsImage">
          <img
            src="https://filebucketdave.s3.amazonaws.com/banner.js/images/icons8-movie-beginning-64.png"
            alt="Film Watching icon"
          />
        </div>
        <div class="instructions">
          <h3>${this.film.filmNameEsc}</h3>
          <p>We've been unable to provide a copy of <em>${this.film.filmNameEsc}</em>.</p>
          <p>
            <a
              href="https://www.justwatch.com/au/search?q=${this.film.filmNameEsc}"
              target="_blank"
              >This search on JustWatch</a
            >
            may provide pointers to where you can find it online.
          </p>
          <p>${this.filmData}</p>
        </div>
      </div>`;
      return true;
    }
    return false;
  }

  /**
   * figure out and return the html template for the view
   */

  render() {
    let success = this.convertMedia();

    // if couldn't convert to specific HTML, return a link
    if (!success) {
      this.view = html` <div class="filmWatchingOptions">
        <div class="filmWatchingOptionsImage">
          <img
            src="https://filebucketdave.s3.amazonaws.com/banner.js/images/icons8-movie-beginning-64.png"
            alt="Film Watching icon"
          />
        </div>
        <div class="instructions">
          <h3>${this.film.fileNameEsc}</h3>
          <p>
            Watch
            <a href="{$this.film.filmUrl}"
              ><em>${this.film.filmNameEsc}</em> here</a
            >.
          </p>
        </div>
      </div>`;
    }
    return this.view;
  }

  /**
   * Based on the filmUrl attempt to convert to an embed
   * - based on: http://jsfiddle.net/oriadam/v7b5edo8/   http://jsfiddle.net/88Ms2/378/   https://stackoverflow.com/a/22667308/3356679
   */

  convertMedia() {
    const SOURCE_INSTRUCTIONS_HTML = {
      Stream: html`
      <p class="gu_addedAdvice" style="font-size:80%">
      <span class="gu_adviceLabel">Alternative video source:</span> 
      <span class="gu_adviceValue"><a href="${this.film.filmUrl}" target="_new">visit video's page</a></span><br />
      <span class="gu_adviceLabel">Help with video:</span> <span class="gu_adviceValue"><a href="https://docs.microsoft.com/en-us/stream/portal-watch">Watch videos on Microsoft Stream</a></span>
      </p>`
    };

    // Haven't figured out how to generate an embeddable player for Kanopy yet
    if (this.film.filmUrl.match(/griffith.kanopy.com/)) {
      this.view = html` <div class="filmWatchingOptions">
        <div class="filmWatchingOptionsImage"></div>
        <div class="instructions">
          <h3>${this.film.filmNameEsc}</h3>
          <p>
            You can watch <a href="${this.film.filmUrl}" target="_new"><em>${this.film.filmNameEsc}</em> on
            Kanopy</a>
          </p>
        </div>
      </div>`;
      return true;
    }
    let url = 'https://_URL_';
    let cls = 'class="embedded-media"';

    let converts = [
      {
        rx: /^.*archive.org\/details\/([^\/]+)$/g,
        tmpl: url.replace('_URL_', 'archive.org/embed/$1'),
        source: 'archive.org',
      },
      {
        rx: /^.*dailymotion.com\/video\/([^_]+)_.*$/g,
        tmpl: url.replace('_URL_', 'dailymotion.com/embed/video/$1'),
        source: 'DailyMotion'
      },
      {
        rx: /^.*microsoftstream.com\/video\/([^\/]+)$/g,
        tmpl: url.replace('_URL_', 'web.microsoftstream.com/embed/video/$1'),
        source: 'Stream',
      },
      {
        rx: /^(?:https?:)?\/\/(?:www\.)?vimeo\.com\/([^\?&"]+).*$/g,
        tmpl: url.replace('_URL_', 'player.vimeo.com/video/$1'),
        source: 'Vimeo',
      },
      {
        rx: /^.*(?:https?:\/\/)?(?:www\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/|user\/.+\/)?([^\?&"]+).*$/g,
        tmpl: url.replace('_URL_', 'www.youtube.com/embed/$1'),
        source: 'YouTube',
      },
      {
        rx: /^.*(?:https?:\/\/)?(?:www\.)?(?:youtube-nocookie\.com)\/(?:watch\?v=|embed\/|v\/|user\/.+\/)?([^\?&"]+).*$/g,
        tmpl: url.replace('_URL_', 'www.youtube-nocookie.com/embed/$1'),
        source: 'YouTube',
      },
      {
        rx: /(^[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?\.(?:jpe?g|gif|png|svg)\b.*$)/gi,
        tmpl: '<a ' + cls + ' href="$1" target="_blank"><img src="$1" /></a>',
        // not sure about this one
      },
    ];

    let url2 = '';
    let source = '';
    converts.forEach(function (elem) {
      const t = this.film.filmUrl.trim();
      let m = t.match(elem.rx);
      if (m) {
        url2 = t.replace(elem.rx, elem.tmpl);
        source = elem.source;
      }
    }, this);

    /**
     * Provide additional HTML to display for each of the
     */

    let instructions = html``;
    if (source in SOURCE_INSTRUCTIONS_HTML) {
      instructions = SOURCE_INSTRUCTIONS_HTML[source];
    }
    this.view = html`
      <h3>${this.film.filmNameEsc}</h3>
      <div>${instructions}</div>
      <iframe
        width="640"
        height="480"
        class="embedded-media"
        src="${url2}"
        frameborder="0"
        allowfullscreen
      ></iframe>
    `;
    return true;
  }
}

window.customElements.define('film-watch-options', FilmWatchOptions);
