import os

from flask import Flask, render_template, jsonify
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config["SECRET_KEY"] = os.getenv("SECRET_KEY")
socketio = SocketIO(app)

channels = ["general"]
messages = []
checker = {}

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/channels", methods=["POST"])
def channel():
	return jsonify(channels)

@app.route("/messages", methods=["POST"])
def initialize():
	return jsonify(messages)

@socketio.on("create channel")
def create(data):
	channel = data["channel"]

	if channel in channels:
		emit("channel taken", broadcast=False)
	elif channel == "" or channel.isspace():
		pass
	else:
		channels.append(channel)
		emit("channel created", {"channel": channel}, broadcast=True)

@socketio.on('send message')
def message(data):
	message = data["message"]
	name = data["name"]
	date = data["date"]
	channel = data["channel"]

	if channel not in checker:
		checker[channel] = 1
	else:
		checker[channel] += 1
		if checker[channel] == 101:
			for i in messages:
				if i["channel"] == channel:
					checker[channel] = 100
					messages.remove(i)
					break

	messages.append({"channel": channel, "message": message, "name": name, "date": date})

	emit("message sent", {"message": message, "name": name, "date": date, "channel": channel}, broadcast=True)