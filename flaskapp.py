''' Web server for visualizing the SC Stanton System'''
from flask import Flask, render_template

app = Flask(__name__)


@app.route('/')
def display():
    ''' show the animation page'''
    return render_template('webview.html')


if __name__ == '__main__':
    app.run()
