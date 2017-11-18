const toast = new Tostada();
const base64PictureWorker = new Worker('ww.js');

class App {
    constructor() {
        this.form = document.getElementById("url-input-form");
        this.input = document.getElementById("url-input");

        this.input.onpaste = (e) => {
            setTimeout(() => this._getFromURL(e.target), 0);
        }

        this.form.onsubmit = (e) => {
            e.preventDefault();
            this._setPicture(this.input.value);
        }
    }

    // Try to get something from a url string
    _getFromURL(elemRef) {
        if(elemRef.checkValidity()) {
            this._fetchIt(elemRef.value).then(arrayBuffer => {
                base64PictureWorker.postMessage(arrayBuffer);
                base64PictureWorker.onmessage = (event => {
                    const bodyElem = document.getElementsByTagName('body')[0];
                    bodyElem.style.backgroundImage = `url(data:image/any;base64,${event.data}`;
                });

            });
        } else {
            this._notValidURL();
        }
    }

    // The actual wallpaper setting
    _setPicture(pictureUrl) {
        const exec = require('child_process').exec;

        function execute(command, callback){
            exec(command, function(error, stdout, stderr){ callback(stdout); });
        };

        execute(`gsettings set org.gnome.desktop.background picture-uri "${pictureUrl}"`, (out)=>{
            this._done();
        });
    }

    // Showing the picture inside the app
    _fetchIt(pictureUrl, errCb) {
        let url;
        try {
            url = new URL(pictureUrl);
        } catch(err) {
            errCb(err);
            return null;
        }
        return fetch(url).then(response => {
            return response.arrayBuffer()
        }, err => {
            toast.mostrar("Seems like I can't fetch that 😕", {color: '#fff', fondo: '#fe4440'});
        })
    }

    // Tell the user something is not right with the url
    _notValidURL() {
        toast.mostrar("Doesn't look like a valid URL 😕", {color: '#fff', fondo: '#fe4440'});
    }

    _done() {
        toast.mostrar('Okay, on it', {color: '#fff', fondo: '#409910'});
        this.input.value = '';
    }

}
