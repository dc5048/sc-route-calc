# sc-route-calc
Aaron Halo route calculator

# installation
The project is structured for flask, a python-based web server. To run it as-is, clone the 
repo, install [flask](https://pypi.org/project/Flask/) and then run the flaskapp.py module:

`python3 -m flaskapp`

Once the server is running, open a browser to the address and port.  The default flask 
configuration is to run on the "localhost" at port 5000, i.e. 

`http://127.0.0.1:5000 or http://localhost:5000'

To configure for other server software, have it serve templates/index.html, and modify the
paths in that file so that your server can find webview.css and animate.js.
